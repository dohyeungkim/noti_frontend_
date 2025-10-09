"use client";
/**
 * 학생 제출물 채점 리스트 (테이블 형식)
 * - AI 점수와 교수 점수를 각각 표시
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { group_api, grading_api, problem_ref_api } from "@/lib/api";
import type { SubmissionSummary, ProblemRef } from "@/lib/api";

interface ProblemScoreData {
  aiScore: number | null;
  profScore: number | null;
  maxPoints: number;
  solveId: number | null;
  reviewed: boolean;
}

interface GradingStudentSummary {
  studentId: string;
  studentName: string;
  problemScores: ProblemScoreData[];
}

export default function GradingListPage() {
  const router = useRouter();
  const { userName } = useAuth();
  const { groupId, examId } = useParams<{ groupId: string; examId: string }>();

  const [groupOwner, setGroupOwner] = useState<string | null>(null);
  const [students, setStudents] = useState<GradingStudentSummary[]>([]);
  const [problemRefs, setProblemRefs] = useState<ProblemRef[]>([]);
  const [loading, setLoading] = useState(true);

  const problemIds = useMemo(
    () => problemRefs.map((p) => p.problem_id),
    [problemRefs]
  );

  const pointsByProblemId = useMemo(
    () => new Map(problemRefs.map((p) => [p.problem_id, p.points] as const)),
    [problemRefs]
  );

  // 그룹장 정보 조회
  const fetchOwner = useCallback(async () => {
    try {
      const groups = await group_api.my_group_get();
      const group = groups.find((g) => g.group_id === Number(groupId));
      setGroupOwner(group?.group_owner ?? null);
    } catch (err) {
      console.error("그룹장 정보 로드 실패", err);
    }
  }, [groupId]);

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
    try {
      setLoading(true);
      
      // 1. 전체 제출 목록 조회
      const submissions = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId)
      );

      // 2. 학생별로 그룹화
      const byUser = new Map<string, { name: string; items: SubmissionSummary[] }>();
      for (const sub of submissions) {
        if (!byUser.has(sub.user_id)) {
          byUser.set(sub.user_id, { name: sub.user_name, items: [] });
        }
        byUser.get(sub.user_id)!.items.push(sub);
      }

      // 3. 각 제출의 상세 점수 조회 (AI/교수 구분)
      const rows: GradingStudentSummary[] = [];
      
      for (const [userId, { name, items }] of byUser.entries()) {
        const subMap = new Map<number, SubmissionSummary>();
        for (const item of items) {
          subMap.set(item.problem_id, item);
        }

        const problemScores: ProblemScoreData[] = [];

        for (const pid of problemIds) {
          const sub = subMap.get(pid);
          const maxPoints = pointsByProblemId.get(pid) ?? 0;

          if (!sub) {
            // 제출하지 않은 문제
            problemScores.push({
              aiScore: null,
              profScore: null,
              maxPoints,
              solveId: null,
              reviewed: false,
            });
            continue;
          }

          // 해당 solve의 채점 기록 조회
          try {
            const scores = await grading_api.get_submission_scores(sub.submission_id);
            
            // AI 점수: graded_by === null
            const aiScoreRecord = scores.find(s => s.graded_by === null);
            // 교수 점수: graded_by !== null (가장 최근 것)
            const profScoreRecords = scores.filter(s => s.graded_by !== null);
            const profScoreRecord = profScoreRecords.length > 0 
              ? profScoreRecords.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0]
              : null;

            problemScores.push({
              aiScore: aiScoreRecord?.score ?? null,
              profScore: profScoreRecord?.score ?? null,
              maxPoints,
              solveId: sub.submission_id,
              reviewed: sub.reviewed,
            });
          } catch (err) {
            console.error(`solve_id ${sub.submission_id} 점수 조회 실패`, err);
            // 에러 시 기본 점수만 표시
            problemScores.push({
              aiScore: null,
              profScore: sub.score,
              maxPoints,
              solveId: sub.submission_id,
              reviewed: sub.reviewed,
            });
          }
        }

        rows.push({
          studentId: userId,
          studentName: name,
          problemScores,
        });
      }

      setStudents(rows);
    } catch (err) {
      console.error("제출 목록 로드 실패", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [groupId, examId, problemIds, pointsByProblemId]);

  useEffect(() => {
    fetchOwner();
  }, [fetchOwner]);

  useEffect(() => {
    fetchProblemRefs();
  }, [fetchProblemRefs]);

  useEffect(() => {
    if (problemIds.length > 0) {
      fetchSubmissions();
    }
  }, [problemIds.length]);

  const selectStudent = (studentId: string) => {
    router.push(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`);
  };

  // 학생의 전체 상태 계산
  const getStudentStatus = (problemScores: ProblemScoreData[]) => {
    const allReviewed = problemScores.every(p => p.reviewed || p.solveId === null);
    const allCorrect = problemScores.every(p => {
      if (p.solveId === null) return false;
      const finalScore = p.profScore ?? p.aiScore ?? 0;
      return finalScore >= p.maxPoints;
    });

    if (allCorrect && allReviewed) return "complete";
    if (allReviewed) return "reviewed";
    return "pending";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="pb-10 px-4">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">학생 제출물 채점</h1>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto border-2 border-blue-600 rounded-lg shadow-lg">
        <table className="w-full border-collapse bg-white">
          {/* 헤더 */}
          <thead className="bg-gray-50">
            <tr>
              <th className="border-r-2 border-blue-600 px-6 py-4 text-left font-bold text-gray-700 sticky left-0 bg-gray-50 z-10">
                이름 학번
              </th>
              {problemRefs.map((prob, idx) => (
                <th
                  key={prob.problem_id}
                  className="border-r-2 border-blue-600 px-4 py-4 text-center min-w-[140px]"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-sm font-bold text-gray-800">
                      문제{idx + 1}
                    </div>
                    <div className="flex items-center justify-center space-x-4 w-full">
                      <div className="text-xs text-gray-600 font-medium">AI</div>
                      <div className="text-xs text-gray-600 font-medium">교수</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      (배점: {prob.points}점)
                    </div>
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 text-center font-bold min-w-[100px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="text-xs text-gray-600">상태</div>
                </div>
              </th>
            </tr>
          </thead>

          {/* 바디 */}
          <tbody>
            {students.map((stu, stuIdx) => {
              const status = getStudentStatus(stu.problemScores);
              return (
                <tr
                  key={stu.studentId}
                  onClick={() => selectStudent(stu.studentId)}
                  className={`
                    border-t-2 border-blue-600 
                    hover:bg-blue-50 cursor-pointer 
                    transition-all duration-200
                    ${stuIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  `}
                >
                  {/* 학생 이름/학번 */}
                  <td className="border-r-2 border-blue-600 px-6 py-4 sticky left-0 bg-inherit z-10">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-800">
                        {stu.studentName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stu.studentId}
                      </span>
                    </div>
                  </td>

                  {/* 각 문제별 점수 */}
                  {stu.problemScores.map((data, idx) => (
                    <td
                      key={`${stu.studentId}-${idx}`}
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

                        {/* 교수 점수 */}
                        <div className="flex flex-col items-center min-w-[40px]">
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
                  ))}

                  {/* 상태 표시 */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className={`
                          w-12 h-12 rounded-full border-2 
                          flex items-center justify-center
                          transition-all duration-200
                          ${
                            status === "complete"
                              ? "bg-green-500 border-green-600"
                              : status === "reviewed"
                              ? "bg-yellow-500 border-yellow-600"
                              : "bg-gray-300 border-gray-400"
                          }
                        `}
                      >
                        {status === "complete" && (
                          <span className="text-white text-xl font-bold">✓</span>
                        )}
                        {status === "reviewed" && (
                          <span className="text-white text-xl font-bold">!</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {status === "complete" ? "완료" : status === "reviewed" ? "검토중" : "대기"}
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