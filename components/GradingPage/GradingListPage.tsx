"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { group_api, group_member_api, grading_api, problem_ref_api, auth_api } from "@/lib/api";
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
  problemId: number;
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
  const [absentStudents, setAbsentStudents] = useState<Array<{ userId: string; userName: string; studentNo: string }>>([]);
  const [problemRefs, setProblemRefs] = useState<ProblemRef[]>([]);
  const [loading, setLoading] = useState(true);

  const [startIdx, setStartIdx] = useState(0);
  const MAX_VISIBLE = 6;

  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [gradedAbsentStudents, setGradedAbsentStudents] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    if (problemRefs.length === 0) {
      return;
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        console.log("===== 채점 데이터 로딩 시작 (최적화) =====");

        // 그룹 멤버 조회
        const groupMembers = await group_member_api.group_get_member(Number(groupId));
        console.log('\n👥 그룹 멤버 전체:', groupMembers);

        const submissions = await grading_api.get_all_submissions(
          Number(groupId),
          Number(examId)
        );
        
        console.log('\n📦 GET submissions 전체:', submissions);
        console.log(`✅ 제출 목록 조회 완료: ${submissions.length}개`);

        let ownerId: string | number | undefined;
        try {
          const [me, grp]: [{ user_id: string | number }, any] =
            await Promise.all([
              auth_api.getUser(),
              group_api.group_get_by_id(Number(groupId)),
            ]);
          ownerId =
            grp?.group_owner ??
            grp?.owner_id ??
            grp?.group_owner_id ??
            grp?.owner_user_id ??
            grp?.ownerId ??
            grp?.leader_id ??
            grp?.owner?.user_id;
            
          console.log(`\n👑 그룹장 ID: ${ownerId}`);
        } catch (err) {
          console.warn("그룹장 정보 조회 실패:", err);
        }

        // 제출한 학생 ID 집합
        const submittedUserIds = new Set<string>();
        submissions.forEach(sub => {
          submittedUserIds.add(String(sub.user_id));
        });

        const byUser = new Map<string, { name: string; studentNo: string; items: SubmissionSummary[] }>();

        for (const sub of submissions) {
          const userId = String(sub.user_id);
          
          if (ownerId && userId === String(ownerId)) {
            console.log(`⏭️  그룹장 ${userId} 제외`);
            continue;
          }
          
          const userName = sub.user_name || "이름 없음";
          const studentNo = String(sub.user_id);

          if (!byUser.has(userId)) {
            byUser.set(userId, { name: userName, studentNo, items: [] });
          }
          byUser.get(userId)!.items.push(sub);
        }

        console.log(`\n👥 필터링 후 학생 수: ${byUser.size}명`);

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
                problemId: pid,
              });
              continue;
            }

            const submissionRecords: SubmissionRecord[] = subs.map(sub => {
              return {
                submissionId: sub.submission_id,
                aiScore: sub.ai_score ?? null,
                profScore: sub.prof_score ?? null,
                submittedAt: sub.updated_at,
                reviewed: sub.reviewed ?? false,
              };
            });

            problemScores.push({
              maxPoints,
              submissions: submissionRecords,
              problemId: pid,
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
        console.log(`총 API 호출 횟수: 2회 (group_member_get, get_all_submissions)`);

        setStudents(rows);

        // 결시생 처리
        const absentList: Array<{ userId: string; userName: string; studentNo: string }> = [];
        const absentSeenUserIds = new Set<string>(); // 중복 user_id 체크용
        
        for (const member of groupMembers as any[]) {
          const memberId = String(member.user_id);
          const studentNo = memberId;
          
          // 그룹장 제외
          if (ownerId && memberId === String(ownerId)) {
            continue;
          }
          
          // 이미 처리된 user_id면 건너뛰기
          if (absentSeenUserIds.has(memberId)) {
            console.log(`⏭️  중복 user_id ${memberId} 제외 (결시생)`);
            continue;
          }
          
          // 제출하지 않은 학생만 추가
          if (!submittedUserIds.has(memberId)) {
            absentList.push({
              userId: memberId,
              userName: member.username || "이름 없음",
              studentNo: studentNo,
            });
            absentSeenUserIds.add(memberId); // user_id 기록
          }
        }

        absentList.sort((a, b) =>
          a.userName.localeCompare(b.userName, "ko-KR", { sensitivity: "base" })
        );

        console.log(`\n❌ 결시생 수: ${absentList.length}명`);
        setAbsentStudents(absentList);

      } catch (err) {
        console.error("❌ 제출 목록 로드 실패:", err);
        setStudents([]);
        setAbsentStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [groupId, examId, problemRefs]);

  useEffect(() => {
    fetchProblemRefs();
  }, [fetchProblemRefs]);

  const handleProblemCellClick = (studentId: string, problemId: number) => {
    router.push(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}?problemId=${problemId}`);
  };

  const toggleExpanded = (studentId: string, problemIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleGradeAbsentStudent = (userId: string) => {
    setGradedAbsentStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">학생 제출물 채점</h1>

        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          
          {showScrollButtons && (
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-lg border shadow-md">
              <button
                onClick={goLeft}
                disabled={!canLeft}
                className={`px-6 py-3 rounded-lg border font-bold text-base transition-all ${
                  canLeft
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                ← 이전
              </button>
              <span className="text-base font-bold text-gray-700 min-w-[100px] text-center">
                {startIdx + 1}-{endIdx} / {totalProblems}
              </span>
              <button
                onClick={goRight}
                disabled={!canRight}
                className={`px-6 py-3 rounded-lg border font-bold text-base transition-all ${
                  canRight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                다음 →
              </button>
            </div>
          )}
          
          {!showScrollButtons && <div className="flex-1"></div>}
          
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-lg border shadow-md">
              <span className="text-sm font-semibold text-gray-700">점수 기준:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-600">9-10점</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">5-8점</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-sm text-gray-600">0-4점</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScrollButtons && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          💡 문제가 {totalProblems}개 있습니다. 위의 버튼으로 나머지 문제를 확인하세요. (현재{" "}
          {startIdx + 1}-{endIdx}번 문제 표시 중)
        </div>
      )}

      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        ✏️ <strong>채점 방법:</strong> 각 문제 칸을 클릭하면 해당 학생의 해당 문제를 채점할 수 있습니다.
      </div>

      <div className="overflow-x-auto border-2 border-blue-600 rounded-lg shadow-lg">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-r-2 border-blue-600 px-4 py-4 text-left font-bold text-gray-700 min-w-[120px]">
                이름
              </th>
              <th className="border-r-2 border-blue-600 px-4 py-4 text-left font-bold text-gray-700 min-w-[120px]">
                학번
              </th>
              <th className="border-r-2 border-blue-600 px-4 py-4 text-center font-bold text-gray-700 min-w-[120px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="text-sm font-bold text-gray-800">총점</div>
                  <div className="text-xs text-gray-500">획득 / 배점</div>
                </div>
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
                    <div className="text-xs text-gray-500">
                      교수점수 / AI점수
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

          <tbody>
            {students.map((stu, stuIdx) => {
              const visibleScores = stu.problemScores.slice(startIdx, endIdx);
              
              // 총점 계산 (전체 문제 기준)
              let totalProfScore = 0;
              let totalAiScore = 0;
              
              for (const data of stu.problemScores) {
                if (data.submissions.length > 0) {
                  const latestSub = data.submissions[0];
                  if (latestSub.profScore !== null) {
                    totalProfScore += latestSub.profScore;
                  }
                  if (latestSub.aiScore !== null) {
                    totalAiScore += latestSub.aiScore;
                  }
                }
              }
              
              // 배점 계산: 문제 수 * 20
              const totalMaxPoints = stu.problemScores.length * 20;
              
              // 획득 점수 (교수점수 + AI점수)
              const totalObtainedScore = totalProfScore + totalAiScore;
              
              const hasAnySubmission = visibleScores.some(data => data.submissions.length > 0);
              
              const allGraded = hasAnySubmission && visibleScores.every((data) => {
                if (data.submissions.length === 0) return true;
                const latestSub = data.submissions[0];
                return latestSub.profScore !== null;
              });
              
              const someGraded = hasAnySubmission && visibleScores.some((data) => {
                if (data.submissions.length === 0) return false;
                const latestSub = data.submissions[0];
                return latestSub.profScore !== null;
              });

              return (
                <tr
                  key={stu.studentId}
                  className={`
                    border-t-2 border-blue-600 
                    transition-all duration-200
                    ${stuIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  `}
                >
                  <td className="border-r-2 border-blue-600 px-4 py-4">
                    <span className="text-base font-medium text-gray-800">
                      {stu.studentName}
                    </span>
                  </td>
                  <td className="border-r-2 border-blue-600 px-4 py-4">
                    <span className="text-sm text-gray-600">
                      {stu.studentNo}
                    </span>
                  </td>
                  <td className="border-r-2 border-blue-600 px-4 py-4">
                    <div className="flex items-center justify-center">
                      <span className="text-base font-bold text-blue-600">
                        {totalObtainedScore}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-base font-bold text-green-600">
                        {totalMaxPoints}
                      </span>
                    </div>
                  </td>

                  {visibleScores.map((data, localIdx) => {
                    const globalIdx = startIdx + localIdx;
                    const cellKey = `${stu.studentId}-${globalIdx}`;
                    const isExpanded = expandedCells.has(cellKey);
                    const hasMultipleSubmissions = data.submissions.length > 1;
                    const latestSubmission = data.submissions[0];

                    return (
                      <td
                        key={cellKey}
                        className={`border-r-2 border-blue-600 px-4 py-4 transition-colors ${
                          data.submissions.length > 0 
                            ? 'cursor-pointer hover:bg-blue-100' 
                            : ''
                        }`}
                        onClick={() => {
                          if (data.submissions.length > 0) {
                            handleProblemCellClick(stu.studentId, data.problemId);
                          }
                        }}
                      >
                        {data.submissions.length === 0 ? (
                          <div className="text-center text-gray-300 font-bold">-</div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-center">
                              <span
                                className={`text-base font-bold ${
                                  latestSubmission.profScore === null
                                    ? "text-gray-300"
                                    : latestSubmission.profScore >= 9
                                    ? "text-green-600"
                                    : latestSubmission.profScore >= 5
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {latestSubmission.profScore ?? "-"}
                              </span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span
                                className={`text-base font-bold ${
                                  latestSubmission.aiScore === null
                                    ? "text-gray-300"
                                    : latestSubmission.aiScore >= 9
                                    ? "text-green-600"
                                    : latestSubmission.aiScore >= 5
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {latestSubmission.aiScore ?? "-"}
                              </span>
                            </div>

                            {hasMultipleSubmissions && (
                              <>
                                <button
                                  onClick={(e) => toggleExpanded(stu.studentId, globalIdx, e)}
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline z-10"
                                >
                                  {isExpanded
                                    ? "접기 ▲"
                                    : `이전 제출 ${data.submissions.length - 1}건 보기 ▼`}
                                </button>

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
                                        <div className="flex items-center gap-1">
                                          <span
                                            className={
                                              sub.profScore !== null
                                                ? sub.profScore >= 9
                                                  ? "text-green-600"
                                                  : sub.profScore >= 5
                                                  ? "text-yellow-600"
                                                  : "text-red-600"
                                                : "text-gray-300"
                                            }
                                          >
                                            {sub.profScore ?? "-"}
                                          </span>
                                          <span className="text-gray-400">/</span>
                                          <span
                                            className={
                                              sub.aiScore !== null
                                                ? sub.aiScore >= 9
                                                  ? "text-green-600"
                                                  : sub.aiScore >= 5
                                                  ? "text-yellow-600"
                                                  : "text-red-600"
                                                : "text-gray-300"
                                            }
                                          >
                                            {sub.aiScore ?? "-"}
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

                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className={`
                          w-12 h-12 rounded-full border-2 
                          flex items-center justify-center
                          transition-all duration-200
                          ${
                            allGraded
                              ? "bg-green-500 border-green-600"
                              : someGraded
                              ? "bg-yellow-500 border-yellow-600"
                              : "bg-gray-300 border-gray-400"
                          }
                        `}
                      >
                        {allGraded && (
                          <span className="text-white text-xl font-bold">✓</span>
                        )}
                        {someGraded && !allGraded && (
                          <span className="text-white text-xl font-bold">!</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {allGraded ? "완료" : someGraded ? "검토중" : "대기"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {students.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg">제출한 학생이 없습니다.</div>
        </div>
      )}

      {absentStudents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-red-600">결시생</h2>
          <div className="overflow-x-auto border-2 border-red-600 rounded-lg shadow-lg">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-red-50">
                <tr>
                  <th className="border-r-2 border-red-600 px-4 py-4 text-left font-bold text-gray-700 min-w-[200px]">
                    이름
                  </th>
                  <th className="border-r-2 border-red-600 px-4 py-4 text-left font-bold text-gray-700 min-w-[200px]">
                    학번
                  </th>
                  <th className="border-r-2 border-red-600 px-4 py-4 text-center font-bold text-gray-700 min-w-[150px]">
                    출결상황
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-gray-700 min-w-[150px]">
                    채점
                  </th>
                </tr>
              </thead>
              <tbody>
                {absentStudents.map((student, idx) => {
                  const isGraded = gradedAbsentStudents.has(student.userId);
                  return (
                    <tr
                      key={student.userId}
                      className={`
                        border-t-2 border-red-600 
                        transition-all duration-200
                        ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      `}
                    >
                      <td className="border-r-2 border-red-600 px-4 py-4">
                        <span className="text-base font-medium text-gray-800">
                          {student.userName}
                        </span>
                      </td>
                      <td className="border-r-2 border-red-600 px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {student.studentNo}
                        </span>
                      </td>
                      <td className="border-r-2 border-red-600 px-4 py-4">
                        <div className="flex justify-center">
                          {isGraded ? (
                            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                              0점 처리
                            </span>
                          ) : (
                            <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold text-sm">
                              결시
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          {isGraded ? (
                            <div className="text-center">
                              <span className="text-lg font-bold text-blue-600">0</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGradeAbsentStudent(student.userId)}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                              채점
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}