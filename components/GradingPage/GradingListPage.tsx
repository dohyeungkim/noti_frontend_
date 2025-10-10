"use client";
/**
 * 학생 제출물 채점 리스트 (테이블 형식)
 * - AI 점수와 교수 점수를 각각 표시
 * - 문제 제목 표시
 * - 학생 이름과 학번 표시
 * - 좌우 스크롤 버튼으로 문제 이동 (한 번에 최대 6개)
 * - 교수 점수 1~10점 채점 기능
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { group_api, grading_api, problem_ref_api, auth_api } from "@/lib/api";
import type { SubmissionSummary, ProblemRef } from "@/lib/api";

interface ProblemScoreData {
  aiScore: number | null;
  profScore: number | null;
  maxPoints: number;
  submissionId: number | null;
  reviewed: boolean;
}

interface GradingStudentSummary {
  studentId: string;
  studentName: string;
  studentNo?: string | number;
  problemScores: ProblemScoreData[];
}

export default function GradingListPage() {
  const router = useRouter();
  const { userName } = useAuth();
  const { groupId, examId } = useParams<{ groupId: string; examId: string }>();

  const [students, setStudents] = useState<GradingStudentSummary[]>([]);
  const [problemRefs, setProblemRefs] = useState<ProblemRef[]>([]);
  const [loading, setLoading] = useState(true);

  // 좌우 스크롤 상태 - 최대 6개로 고정
  const [startIdx, setStartIdx] = useState(0);
  const MAX_VISIBLE = 6;

  // 점수 수정 모달 상태
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    problemIdx: number;
  } | null>(null);
  const [editScore, setEditScore] = useState<number>(1);
  const [editFeedback, setEditFeedback] = useState<string>("");

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

  // 제출 목록 및 점수 조회
  const fetchSubmissions = useCallback(async () => {
    if (problemRefs.length === 0) {
      console.log("❌ 문제 목록이 비어있어 제출 목록을 불러올 수 없습니다.");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 제출 목록 로딩 시작...");
      console.log("📋 그룹 ID:", groupId, "시험 ID:", examId);

      // 1. 전체 제출 목록 조회
      const submissions = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId)
      );
      console.log("✅ API에서 받아온 전체 제출 목록:", submissions);
      console.log("📊 총 제출 건수:", submissions.length);
      
      // 🔍 API 응답 상세 확인
      if (submissions.length > 0) {
        console.log("🔎 첫 번째 제출 데이터 상세:");
        console.log("  - submission_id:", submissions[0].submission_id);
        console.log("  - user_id:", submissions[0].user_id);
        console.log("  - problem_id:", submissions[0].problem_id);
        console.log("  - score:", submissions[0].score);
        console.log("  - reviewed:", submissions[0].reviewed);
        console.log("  - created_at:", submissions[0].created_at);
        console.log("  - updated_at:", submissions[0].updated_at);
        console.log("  - 전체 객체:", JSON.stringify(submissions[0], null, 2));
      }

      // 2. 그룹장과 본인 제외를 위한 ID 조회
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
          grp?.owner_id ??
          grp?.group_owner_id ??
          grp?.owner_user_id ??
          grp?.ownerId ??
          grp?.leader_id ??
          grp?.owner?.user_id;
        console.log("👤 본인 ID:", meId);
        console.log("👑 그룹장 ID:", ownerId);
        console.log("🔎 그룹 전체 데이터:", JSON.stringify(grp, null, 2));
      } catch (err) {
        console.warn("⚠️ 그룹장/본인 정보 조회 실패:", err);
      }

      // 3. 학생별로 그룹화 (그룹장/본인 제외)
      const byUser = new Map<
        string,
        { name: string; studentNo?: string | number; items: SubmissionSummary[] }
      >();

      console.log("🔍 학생별 그룹화 시작...");
      for (const sub of submissions) {
        const userId = String(sub.user_id);
        
        console.log(`\n📝 제출 처리 중:`, {
          user_id: userId,
          본인ID: String(meId ?? ""),
          그룹장ID: String(ownerId ?? ""),
          본인과일치: userId === String(meId ?? ""),
          그룹장과일치: userId === String(ownerId ?? ""),
        });
        
        // 그룹장과 본인 제외
        if (userId === String(ownerId ?? "") || userId === String(meId ?? "")) {
          console.log(`⏭️ 제외: ${userId} - 그룹장 또는 본인`);
          continue;
        }

        // user_name이 없으므로 user_id를 표시명으로 사용
        const userName = userId;
        
        // 학번 추출
        const studentNo =
          (sub as any).student_no ??
          (sub as any).student_number ??
          (sub as any).studentCode ??
          (sub as any).student_code ??
          (sub as any).studentId ??
          (sub as any).username;

        if (!byUser.has(userId)) {
          console.log(`➕ 새 학생 추가: ${userName} (ID: ${userId}, 학번: ${studentNo})`);
          byUser.set(userId, { name: userName, studentNo, items: [] });
        }
        byUser.get(userId)!.items.push(sub);
      }

      console.log("✅ 학생별 그룹화 완료");
      console.log("👥 총 학생 수:", byUser.size);
      console.log("📝 학생 목록:", Array.from(byUser.entries()).map(([id, info]) => ({
        userId: id,
        name: info.name,
        studentNo: info.studentNo,
        제출수: info.items.length
      })));

      // 4. 각 학생의 문제별 점수 조회
      const rows: GradingStudentSummary[] = [];
      console.log("🔄 각 학생의 점수 상세 조회 시작...");

      for (const [userId, userInfo] of Array.from(byUser.entries())) {
        const { name, studentNo, items } = userInfo;
        console.log(`\n👤 학생 처리 중: ${name} (ID: ${userId})`);
        
        const subMap = new Map<number, SubmissionSummary>();
        for (const item of items) {
          subMap.set(item.problem_id, item);
        }
        console.log(`  📝 제출한 문제: ${Array.from(subMap.keys()).join(", ")}`);

        const problemScores: ProblemScoreData[] = [];

        for (const prob of problemRefs) {
          const pid = prob.problem_id;
          const sub = subMap.get(pid);
          const maxPoints = prob.points ?? 10;

          if (!sub) {
            console.log(`  ⚪ 문제 ${pid}: 미제출`);
            problemScores.push({
              aiScore: null,
              profScore: null,
              maxPoints,
              submissionId: null,
              reviewed: false,
            });
            continue;
          }

          // AI 점수는 submission의 score 사용
          const aiScore = sub.score;
          console.log(`  🤖 문제 ${pid} AI 점수: ${aiScore}`);

          // 교수 점수 조회 - submission_id로 조회
          let profScore = null;
          try {
            const scores = await grading_api.get_submission_scores(sub.submission_id);
            // graded_by가 null이 아닌 것만 교수 점수로 간주
            const profScoreRecords = scores.filter((s) => s.graded_by !== null);
            if (profScoreRecords.length > 0) {
              // 가장 최근 교수 점수 사용
              const latestProfScore = profScoreRecords.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];
              profScore = latestProfScore.score;
            }
            console.log(`  👨‍🏫 문제 ${pid} 교수 점수: ${profScore ?? "미채점"}`);
          } catch (err) {
            console.error(`  ❌ 문제 ${pid} 점수 조회 실패:`, err);
          }

          problemScores.push({
            aiScore,
            profScore,
            maxPoints,
            submissionId: sub.submission_id,
            reviewed: sub.reviewed,
          });
        }

        rows.push({
          studentId: userId,
          studentName: name,
          studentNo,
          problemScores,
        });
        console.log(`  ✅ ${name} 처리 완료`);
      }

      // 이름 순으로 정렬
      rows.sort((a, b) =>
        a.studentName.localeCompare(b.studentName, "ko-KR", { sensitivity: "base" })
      );

      console.log("\n🎉 최종 학생 목록 생성 완료!");
      console.log("📊 최종 학생 수:", rows.length);
      console.log("📋 최종 학생 목록:", rows.map(s => ({
        이름: s.studentName,
        학번: s.studentNo,
        문제수: s.problemScores.length
      })));

      setStudents(rows);
    } catch (err) {
      console.error("❌ 제출 목록 로드 실패:", err);
      setStudents([]);
    } finally {
      setLoading(false);
      console.log("✅ 로딩 완료");
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

  // 좌우 스크롤 - 최대 6개씩 보이도록 제한
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

  // 교수 점수 저장
  const handleSaveScore = async () => {
    if (!editingCell) return;

    const student = students.find((s) => s.studentId === editingCell.studentId);
    if (!student) return;

    const problemData = student.problemScores[editingCell.problemIdx];
    if (!problemData || !problemData.submissionId) return;

    try {
      await grading_api.post_submission_score(
        problemData.submissionId,
        editScore,
        editFeedback
      );

      // 로컬 상태 업데이트
      setStudents((prev) =>
        prev.map((s) => {
          if (s.studentId === editingCell.studentId) {
            const newScores = [...s.problemScores];
            newScores[editingCell.problemIdx] = {
              ...newScores[editingCell.problemIdx],
              profScore: editScore,
            };
            return { ...s, problemScores: newScores };
          }
          return s;
        })
      );

      setEditingCell(null);
      setEditFeedback("");
      alert("점수가 저장되었습니다.");
    } catch (err) {
      console.error("점수 저장 실패", err);
      alert(`점수 저장에 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 문제가 6개를 초과하는 경우에만 스크롤 버튼 표시
  const showScrollButtons = totalProblems > MAX_VISIBLE;

  return (
    <div className="pb-10 px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">학생 제출물 채점</h1>
        
        {/* 좌우 스크롤 버튼 - 6개 초과 시에만 표시 */}
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
          💡 문제가 {totalProblems}개 있습니다. 위의 버튼으로 나머지 문제를 확인하세요. (현재 {startIdx + 1}-{endIdx}번 문제 표시 중)
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto border-2 border-blue-600 rounded-lg shadow-lg">
        <table className="w-full border-collapse bg-white">
          {/* 헤더 */}
          <thead className="bg-gray-50">
            <tr>
              <th className="border-r-2 border-blue-600 px-6 py-4 text-left font-bold text-gray-700 min-w-[200px]">
                이름 학번
              </th>
              {visibleProblems.map((prob, idx) => (
                <th
                  key={prob.problem_id}
                  className="border-r-2 border-blue-600 px-4 py-4 text-center min-w-[140px]"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-sm font-bold text-gray-800">
                      문제{startIdx + idx + 1}
                    </div>
                    <div className="text-xs text-gray-600 font-medium max-w-[120px] truncate" title={prob.title}>
                      {prob.title}
                    </div>
                    <div className="flex items-center justify-center space-x-4 w-full">
                      <div className="text-xs text-gray-500">AI점수</div>
                      <div className="text-xs text-gray-500">교수점수</div>
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
              // 전체 상태 계산 (보이는 문제들만)
              const visibleScores = stu.problemScores.slice(startIdx, endIdx);
              const allCorrect = visibleScores.every((data) => {
                const finalScore = data.profScore ?? data.aiScore ?? null;
                return finalScore !== null && finalScore >= data.maxPoints;
              });
              const anyWrong = visibleScores.some((data) => {
                const finalScore = data.profScore ?? data.aiScore ?? null;
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
                        {stu.studentNo ?? "-"}
                      </span>
                    </div>
                  </td>

                  {/* 각 문제별 점수 */}
                  {visibleScores.map((data, localIdx) => {
                    const globalIdx = startIdx + localIdx;
                    return (
                      <td
                        key={`${stu.studentId}-${globalIdx}`}
                        className="border-r-2 border-blue-600 px-4 py-4"
                      >
                        <div className="flex items-center justify-center space-x-6">
                          {/* AI 점수 */}
                          <div className="flex flex-col items-center min-w-[40px]">
                            <span
                              className={`text-base font-bold ${
                                data.aiScore === null
                                  ? "text-gray-300"
                                  : data.aiScore >= data.maxPoints
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {data.aiScore ?? "-"}
                            </span>
                          </div>

                          {/* 교수 점수 (클릭하여 수정) */}
                          <div 
                            className="flex flex-col items-center min-w-[40px] cursor-pointer hover:bg-blue-100 rounded px-2 py-1 transition-colors"
                            onClick={() => {
                              if (data.submissionId) {
                                setEditingCell({
                                  studentId: stu.studentId,
                                  problemIdx: globalIdx,
                                });
                                setEditScore(data.profScore ?? 1);
                                setEditFeedback("");
                              }
                            }}
                            title="클릭하여 점수 입력"
                          >
                            <span
                              className={`text-base font-bold ${
                                data.profScore === null
                                  ? "text-gray-300"
                                  : data.profScore >= data.maxPoints
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {data.profScore ?? "-"}
                            </span>
                          </div>
                        </div>
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

      {/* 점수 수정 모달 */}
      {editingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-4">교수 점수 입력</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                점수 (1-10점)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={editScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setEditScore(Math.max(1, Math.min(10, val)));
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                피드백 (선택사항)
              </label>
              <textarea
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                placeholder="학생에게 전달할 피드백을 입력하세요"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveScore}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setEditingCell(null);
                  setEditFeedback("");
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}