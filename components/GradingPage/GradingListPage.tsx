"use client";
/**
 * 학생 제출물 채점 리스트 (테이블 형식)
 * - AI 점수와 교수 점수를 각각 표시
 * - 문제 제목 표시
 * - 학생 이름과 학번 표시
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { group_api, grading_api, problem_ref_api, auth_api } from "@/lib/api";
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
    if (problemRefs.length === 0) return;

    try {
      setLoading(true);

      // 1. 전체 제출 목록 조회
      const submissions = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId)
      );

      console.log("전체 제출 목록:", submissions);

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
      } catch {
        /* 소유자/내 계정 못 가져와도 계속 진행 */
      }

      // 3. 학생별로 그룹화 (그룹장/본인 제외)
      const byUser = new Map<
        string,
        { name: string; studentNo?: string | number; items: SubmissionSummary[] }
      >();

      for (const sub of submissions) {
        const userId = String(sub.user_id);
        
        // 그룹장과 본인 제외
        if (userId === String(ownerId ?? "") || userId === String(meId ?? "")) {
          continue;
        }

        const userName = sub.user_name;
        
        // 학번 추출 (여러 가능성 체크)
        const studentNo =
          (sub as any).student_no ??
          (sub as any).student_number ??
          (sub as any).studentCode ??
          (sub as any).student_code ??
          (sub as any).studentId ??
          (sub as any).username;

        if (!byUser.has(userId)) {
          byUser.set(userId, { name: userName, studentNo, items: [] });
        }
        byUser.get(userId)!.items.push(sub);
      }

      console.log("학생별 그룹화:", Array.from(byUser.entries()));

      // 4. 각 학생의 문제별 점수 조회
      const rows: GradingStudentSummary[] = [];

      for (const [userId, userInfo] of Array.from(byUser.entries())) {
        const { name, studentNo, items } = userInfo;
        
        // 제출물을 problem_id로 매핑
        const subMap = new Map<number, SubmissionSummary>();
        for (const item of items) {
          subMap.set(item.problem_id, item);
        }

        const problemScores: ProblemScoreData[] = [];

        // 문제지의 모든 문제에 대해 순회
        for (const prob of problemRefs) {
          const pid = prob.problem_id;
          const sub = subMap.get(pid);
          const maxPoints = prob.points ?? 0;

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

          // 해당 제출의 채점 기록 조회
          try {
            const scores = await grading_api.get_submission_scores(sub.submission_id);

            // AI 점수: graded_by === null
            const aiScoreRecord = scores.find((s) => s.graded_by === null);
            
            // 교수 점수: graded_by !== null (가장 최근 것)
            const profScoreRecords = scores.filter((s) => s.graded_by !== null);
            const profScoreRecord =
              profScoreRecords.length > 0
                ? profScoreRecords.sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
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
          studentNo,
          problemScores,
        });
      }

      // 이름 순으로 정렬
      rows.sort((a, b) =>
        a.studentName.localeCompare(b.studentName, "ko-KR", { sensitivity: "base" })
      );

      setStudents(rows);
    } catch (err) {
      console.error("제출 목록 로드 실패", err);
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
              <th className="border-r-2 border-blue-600 px-6 py-4 text-left font-bold text-gray-700 min-w-[200px]">
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
              // 전체 상태 계산
              const allScores = stu.problemScores.map((data) => {
                const finalScore = data.profScore ?? data.aiScore ?? null;
                if (finalScore === null) return "pending";
                return finalScore >= data.maxPoints ? "correct" : "wrong";
              });

              const allCorrect = allScores.every((s) => s === "correct");
              const anyWrong = allScores.some((s) => s === "wrong");
              
              return (
                <tr
                  key={stu.studentId}
                  onClick={() => selectStudent(stu.studentId)}
                  className={`
                    border-t-2 border-blue-600 
                    hover:bg-blue-50 cursor-pointer 
                    transition-all duration-200
                    ${stuIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  `}
                >
                  {/* 학생 이름/학번 */}
                  <td className="border-r-2 border-blue-600 px-6 py-4">
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