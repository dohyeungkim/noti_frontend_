"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { group_api, grading_api, problem_ref_api, auth_api } from "@/lib/api";
import type { SubmissionSummary, ProblemRef } from "@/lib/api";

interface SubmissionRecord {
  submissionId: number;
  aiScore: number | null;
  profScore: number | null;
  submittedAt: string;
  reviewed: boolean;
}

interface ProblemScoreData {
  maxPoints: number;
  submissions: SubmissionRecord[];
}

interface GradingStudentSummary {
  studentId: string;
  studentName: string;
  studentNo: string;
  problemScores: ProblemScoreData[];
}

export default function GradingListPage() {
  const router = useRouter();
  const { userName } = useAuth();
  const { groupId, examId } = useParams<{ groupId: string; examId: string }>();

  const [students, setStudents] = useState<GradingStudentSummary[]>([]);
  const [problemRefs, setProblemRefs] = useState<ProblemRef[]>([]);
  const [loading, setLoading] = useState(true);

  // 좌우 스크롤 상태
  const [startIdx, setStartIdx] = useState(0);
  const MAX_VISIBLE = 6;

  // 제출 기록 확장 상태
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  // 문제 목록 조회
  const fetchProblemRefs = useCallback(async () => {
    try {
      const refs = await problem_ref_api.problem_ref_get(
        Number(groupId),
        Number(examId)
      );
      refs.sort((a, b) => a.problem_id - b.problem_id);
      setProblemRefs(refs);
    } catch (err) {
      console.error("문제 참조 로드 실패", err);
      setProblemRefs([]);
    }
  }, [groupId, examId]);

  // 제출 목록 조회
  const fetchSubmissions = useCallback(async () => {
  if (problemRefs.length === 0) {
    return;
  }

  try {
    setLoading(true);
    console.log("===== 채점 데이터 로딩 시작 =====");

    // 1. 전체 제출 목록 조회 (AI 점수 포함)
    const submissions = await grading_api.get_all_submissions(
      Number(groupId),
      Number(examId)
    );
    
    console.log('\n📦 GET submissions 전체:', submissions);
    console.log(`✅ 제출 목록 조회 완료: ${submissions.length}개`);
    
    // 🔒 AI 점수를 별도로 저장하고 절대 변경하지 않음
    const aiScoresMap = new Map<number, number | null>();
    
    // ⚠️ CRITICAL: 여기서 한 번만 저장하고 이후에는 절대 변경 안 함
    submissions.forEach(sub => {
      // 백엔드가 ai_score를 변경했을 가능성이 있으므로
      // 첫 로드 시에만 저장하고 이후 변경 불가
      if (!aiScoresMap.has(sub.submission_id)) {
        aiScoresMap.set(sub.submission_id, sub.ai_score);
        console.log(`🔒 [제출 ${sub.submission_id}] 원본 AI 점수 영구 저장: ${sub.ai_score}`);
      }
    });

    // 2. 교수 점수만 일괄 조회 (AI 점수와 완전히 분리)
    const profScoresMap = new Map<number, number | null>();

    await Promise.all(
      submissions.map(async (sub) => {
        try {
          const scores = await grading_api.get_submission_scores(sub.submission_id);
          
          // 교수 점수 필터링
          const profScores = scores.filter((score: any) => {
            const hasGradedBy = score.graded_by && !score.graded_by.startsWith('auto:');
            const hasProfScore = score.prof_score !== undefined && score.prof_score !== null;
            return hasGradedBy && hasProfScore;
          });
          
          if (profScores.length > 0) {
            // ✅ submission_score_id 기준으로 최신 점수 선택
            profScores.sort((a: any, b: any) => 
              b.submission_score_id - a.submission_score_id
            );
            
            const latestProfScore = profScores[0].prof_score;
            profScoresMap.set(sub.submission_id, latestProfScore);
          } else {
            profScoresMap.set(sub.submission_id, null);
          }
          
        } catch (err) {
          console.error(`❌ 제출 ${sub.submission_id} 점수 조회 실패:`, err);
          profScoresMap.set(sub.submission_id, null);
        }
      })
    );

    console.log(`\n===== 점수 조회 완료 =====`);
    console.log(`AI 점수 (영구 저장): ${aiScoresMap.size}개`);
    console.log(`교수 점수: ${Array.from(profScoresMap.values()).filter(v => v !== null).length}개`);

    // 3. 그룹장과 본인 제외를 위한 ID 조회
    let ownerId: string | number | undefined;
    let meId: string | number | undefined;
    try {
      const [me, grp]: [{ user_id: string | number }, any] =
        await Promise.all([
          auth_api.getUser(),
          group_api.group_get_by_id(Number(groupId)),
        ]);
      meId = me?.user_id;
      ownerId =
        grp?.group_owner ??
        grp?.owner_id ??
        grp?.group_owner_id ??
        grp?.owner_user_id ??
        grp?.ownerId ??
        grp?.leader_id ??
        grp?.owner?.user_id;
    } catch (err) {
      console.warn("그룹장/본인 정보 조회 실패:", err);
    }

    // 4. 학생별로 그룹화
    const byUser = new Map<string, { name: string; studentNo: string; items: SubmissionSummary[] }>();

    for (const sub of submissions) {
      const userId = String(sub.user_id);
      
      if (
        (ownerId && userId === String(ownerId)) || 
        (meId && userId === String(meId))
      ) {
        continue;
      }

      const userName = sub.user_name || "이름 없음";
      const studentNo = sub.user_id;

      if (!byUser.has(userId)) {
        byUser.set(userId, { name: userName, studentNo, items: [] });
      }
      byUser.get(userId)!.items.push(sub);
    }

    // 5. 각 학생의 문제별 점수 구조화
    const rows: GradingStudentSummary[] = [];

    for (const [userId, userInfo] of Array.from(byUser.entries())) {
      const { name, studentNo, items } = userInfo;

      const subMapByProblem = new Map<number, SubmissionSummary[]>();
      
      for (const item of items) {
        if (!subMapByProblem.has(item.problem_id)) {
          subMapByProblem.set(item.problem_id, []);
        }
        subMapByProblem.get(item.problem_id)!.push(item);
      }

      for (const [pid, subs] of Array.from(subMapByProblem.entries())) {
        subs.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      }

      const problemScores: ProblemScoreData[] = [];

      for (const prob of problemRefs) {
        const pid = prob.problem_id;
        const subs = subMapByProblem.get(pid) || [];
        const maxPoints = prob.points ?? 10;

        if (subs.length === 0) {
          problemScores.push({
            maxPoints,
            submissions: [],
          });
          continue;
        }

        const submissionRecords: SubmissionRecord[] = subs.map(sub => {
          // 🔒 AI 점수는 영구 저장된 값만 사용 (절대 변경 불가)
          const aiScore = aiScoresMap.get(sub.submission_id) ?? null;
          
          // 👨‍🏫 교수 점수는 profScoresMap에서만 가져옴
          const profScore = profScoresMap.get(sub.submission_id) ?? null;
          
          console.log(`\n📊 [제출 ${sub.submission_id}] 최종 점수 확인:`);
          console.log(`  🔒 AI 점수 (영구 저장): ${aiScore}`);
          console.log(`  👨‍🏫 교수 점수: ${profScore}`);
          console.log(`  🔍 백엔드 ai_score 값: ${sub.ai_score} ${sub.ai_score !== aiScore ? '⚠️ 백엔드가 변경함!' : '✅ 정상'}`);
          
          return {
            submissionId: sub.submission_id,
            aiScore: aiScore,  // 🔒 영구 저장된 AI 점수만 사용
            profScore: profScore,
            submittedAt: sub.updated_at,
            reviewed: sub.reviewed,
          };
        });

        problemScores.push({
          maxPoints,
          submissions: submissionRecords,
        });
      }

      rows.push({
        studentId: userId,
        studentName: name,
        studentNo: studentNo,
        problemScores,
      });
    }

    rows.sort((a, b) =>
      a.studentName.localeCompare(b.studentName, "ko-KR", { sensitivity: "base" })
    );

    console.log(`\n===== 최종 결과 =====`);
    console.log(`학생 수: ${rows.length}명`);

    setStudents(rows);
  } catch (err) {
    console.error("❌ 제출 목록 로드 실패:", err);
    setStudents([]);
  } finally {
    setLoading(false);
  }
}, [groupId, examId, problemRefs]);

useEffect(() => {
    fetchProblemRefs();
  }, [fetchProblemRefs]);

  useEffect(() => {
    if (problemRefs.length > 0) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, problemRefs.length]);

  const selectStudent = (studentId: string) => {
    router.push(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`);
  };

  const toggleExpanded = (studentId: string, problemIdx: number) => {
    const key = `${studentId}-${problemIdx}`;
    setExpandedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // 좌우 스크롤
  const totalProblems = problemRefs.length;
  const visibleCount = Math.min(MAX_VISIBLE, totalProblems);
  const endIdx = Math.min(totalProblems, startIdx + visibleCount);
  const visibleProblems = problemRefs.slice(startIdx, endIdx);

  const canLeft = startIdx > 0;
  const canRight = endIdx < totalProblems;

  const goLeft = () => {
    if (canLeft) {
      setStartIdx(Math.max(0, startIdx - 1));
    }
  };

  const goRight = () => {
    if (canRight) {
      setStartIdx(Math.min(totalProblems - visibleCount, startIdx + 1));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const showScrollButtons = totalProblems > MAX_VISIBLE;

  return (
    <div className="pb-10 px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">학생 제출물 채점</h1>

        {showScrollButtons && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm">
            <button
              onClick={goLeft}
              disabled={!canLeft}
              className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                canLeft
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              ← 이전
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
              {startIdx + 1}-{endIdx} / {totalProblems}
            </span>
            <button
              onClick={goRight}
              disabled={!canRight}
              className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                canRight
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              다음 →
            </button>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      {showScrollButtons && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          💡 문제가 {totalProblems}개 있습니다. 위의 버튼으로 나머지 문제를 확인하세요. (현재{" "}
          {startIdx + 1}-{endIdx}번 문제 표시 중)
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto border-2 border-blue-600 rounded-lg shadow-lg">
        <table className="w-full border-collapse bg-white">
          {/* 헤더 */}
          <thead className="bg-gray-50">
            <tr>
              <th className="border-r-2 border-blue-600 px-6 py-4 text-left font-bold text-gray-700 min-w-[200px]">
                이름 / 학번
              </th>
              {visibleProblems.map((prob, idx) => (
                <th
                  key={prob.problem_id}
                  className="border-r-2 border-blue-600 px-4 py-4 text-center min-w-[140px]"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-sm font-bold text-gray-800">
                      문제 {startIdx + idx + 1}
                    </div>
                    <div
                      className="text-xs text-gray-600 font-medium max-w-[120px] truncate"
                      title={prob.title}
                    >
                      {prob.title}
                    </div>
                    <div className="flex items-center justify-center space-x-4 w-full">
                      <div className="text-xs text-gray-500">교수점수</div>
                      <div className="text-xs text-gray-500">AI점수</div>
                    </div>
                    <div className="text-xs text-gray-500">(배점: {prob.points}점)</div>
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 text-center font-bold min-w-[120px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-12 h-12 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-xs text-gray-600">상태</div>
                </div>
              </th>
            </tr>
          </thead>

          {/* 바디 */}
          <tbody>
            {students.map((stu, stuIdx) => {
              const visibleScores = stu.problemScores.slice(startIdx, endIdx);
              
              // 최종 점수 기준으로 상태 판단 (교수 점수 우선, 없으면 AI 점수)
              const allCorrect = visibleScores.every((data) => {
                if (data.submissions.length === 0) return false;
                const latestSub = data.submissions[0];
                const finalScore = latestSub.profScore ?? latestSub.aiScore;
                return finalScore !== null && finalScore >= data.maxPoints;
              });
              const anyWrong = visibleScores.some((data) => {
                if (data.submissions.length === 0) return false;
                const latestSub = data.submissions[0];
                const finalScore = latestSub.profScore ?? latestSub.aiScore;
                return finalScore !== null && finalScore < data.maxPoints;
              });

              return (
                <tr
                  key={stu.studentId}
                  className={`
                    border-t-2 border-blue-600 
                    hover:bg-blue-50
                    transition-all duration-200
                    ${stuIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  `}
                >
                  {/* 학생 이름/학번 */}
                  <td
                    className="border-r-2 border-blue-600 px-6 py-4 cursor-pointer"
                    onClick={() => selectStudent(stu.studentId)}
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-800">
                        {stu.studentName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stu.studentNo}
                      </span>
                    </div>
                  </td>

                  {/* 각 문제별 점수 */}
                  {visibleScores.map((data, localIdx) => {
                    const globalIdx = startIdx + localIdx;
                    const cellKey = `${stu.studentId}-${globalIdx}`;
                    const isExpanded = expandedCells.has(cellKey);
                    const hasMultipleSubmissions = data.submissions.length > 1;
                    const latestSubmission = data.submissions[0];

                    return (
                      <td
                        key={cellKey}
                        className="border-r-2 border-blue-600 px-4 py-4"
                      >
                        {data.submissions.length === 0 ? (
                          <div className="text-center text-gray-300 font-bold">-</div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {/* 최신 제출 - AI와 교수 점수를 독립적으로 표시 */}
                            <div className="flex items-center justify-center space-x-6">
                              {/* 교수 점수 */}
                              <div className="flex flex-col items-center min-w-[40px]">
                                <span
                                  className={`text-base font-bold ${
                                    latestSubmission.profScore === null
                                      ? "text-gray-300"
                                      : latestSubmission.profScore >= data.maxPoints
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {latestSubmission.profScore ?? "-"}
                                </span>
                              </div>

                              {/* AI 점수 - 교수 점수와 독립적으로 표시 */}
                              <div className="flex flex-col items-center min-w-[40px]">
                                <span
                                  className={`text-base font-bold ${
                                    latestSubmission.aiScore === null
                                      ? "text-gray-300"
                                      : latestSubmission.aiScore >= data.maxPoints
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {latestSubmission.aiScore ?? "-"}
                                </span>
                              </div>
                            </div>

                            {/* 제출 횟수 표시 및 확장 버튼 */}
                            {hasMultipleSubmissions && (
                              <>
                                <button
                                  onClick={() => toggleExpanded(stu.studentId, globalIdx)}
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {isExpanded
                                    ? "접기 ▲"
                                    : `이전 제출 ${data.submissions.length - 1}건 보기 ▼`}
                                </button>

                                {/* 이전 제출 기록 */}
                                {isExpanded && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                                    {data.submissions.slice(1).map((sub, idx) => (
                                      <div
                                        key={sub.submissionId}
                                        className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                                      >
                                        <span className="text-gray-500">
                                          {idx + 2}차:{" "}
                                          {new Date(sub.submittedAt).toLocaleString("ko-KR", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                        <div className="flex gap-3">
                                          <span
                                            className={
                                              sub.profScore !== null
                                                ? sub.profScore >= data.maxPoints
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                                : "text-gray-300"
                                            }
                                          >
                                            교수: {sub.profScore ?? "-"}
                                          </span>
                                          <span
                                            className={
                                              sub.aiScore !== null
                                                ? sub.aiScore >= data.maxPoints
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                                : "text-gray-300"
                                            }
                                          >
                                            AI: {sub.aiScore ?? "-"}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* 상태 표시 */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className={`
                          w-12 h-12 rounded-full border-2 
                          flex items-center justify-center
                          transition-all duration-200
                          ${
                            allCorrect
                              ? "bg-green-500 border-green-600"
                              : anyWrong
                              ? "bg-yellow-500 border-yellow-600"
                              : "bg-gray-300 border-gray-400"
                          }
                        `}
                      >
                        {allCorrect && (
                          <span className="text-white text-xl font-bold">✓</span>
                        )}
                        {anyWrong && !allCorrect && (
                          <span className="text-white text-xl font-bold">!</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {allCorrect ? "완료" : anyWrong ? "검토중" : "대기"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 학생이 없을 때 */}
      {students.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg">제출한 학생이 없습니다.</div>
        </div>
      )}
    </div>
  );
}