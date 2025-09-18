"use client";
/**
 * 해당 그룹에 존재하는 학생들 리스트 랜더링
 * -> 이름 (학번)  o x o x o  (2/5 검토)
 *
 * 해당 문제지의 모든 제출(problem_id, score, reviewed) 받아온 후 학생 별로 묶어서 각 행별로 랜더링
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { group_api, grading_api, problem_ref_api } from "@/lib/api";
import type { SubmissionSummary, ProblemRef } from "@/lib/api";

interface GradingStudentSummary {
  studentId: string;
  studentName: string;
  problemScores: (number | null)[];     // 점수 표기용 ("-" 처리)
  problemStates: ("green" | "red" | "gray")[]; // 동그라미 색상: 맞음/틀림/안풂
}

export default function GradingListPage() {
  const router = useRouter();
  const { userName } = useAuth();
  const { groupId, examId } = useParams<{ groupId: string; examId: string }>();

  // 그룹장 여부
  const [groupOwner, setGroupOwner] = useState<string | null>(null);
  const isGroupOwner = userName === groupOwner;

  // 학생별 요약 데이터
  const [students, setStudents] = useState<GradingStudentSummary[]>([]);

  // 문제지의 문제 목록 (동그라미 개수 및 순서 기준)
  const [problemRefs, setProblemRefs] = useState<ProblemRef[]>([]);

  // ✅ 매 렌더마다 새로 만들지 말고 메모이즈 (루프 방지 핵심)
  const problemIds = useMemo(
    () => problemRefs.map((p) => p.problem_id),
    [problemRefs]
  );
  const pointsByProblemId = useMemo(
    () => new Map(problemRefs.map((p) => [p.problem_id, p.points] as const)),
    [problemRefs]
  );

  // 1) 그룹장 정보 조회
  const fetchOwner = useCallback(async () => {
    try {
      const groups: Array<{ group_id: number; group_owner: string }> =
        await group_api.my_group_get();
      const group = groups.find((g) => g.group_id === Number(groupId));
      setGroupOwner(group?.group_owner ?? null);
    } catch (err) {
      console.error("그룹장 정보 로드 실패", err);
    }
  }, [groupId]);

  // (NEW) 문제지에 속한 문제 목록 조회 → 동그라미 개수/순서 고정
  const fetchProblemRefs = useCallback(async () => {
    try {
      const refs = await problem_ref_api.problem_ref_get(
        Number(groupId),
        Number(examId)
      );
      // 보기 좋게 problem_id 오름차순 정렬
      refs.sort((a, b) => a.problem_id - b.problem_id);
      setProblemRefs(refs);
    } catch (err) {
      console.error("문제 참조 로드 실패", err);
      setProblemRefs([]); // 실패 시 빈 배열
    }
  }, [groupId, examId]);

  // 2) 전체 제출 조회 → 학생별 그룹핑
  //    ⮕ 시험 문제 수에 맞춰 고정 길이 배열로 매핑 + 색상 결정(초록/빨강/회색)
  const fetchSubmissions = useCallback(async () => {
    try {
      const subs: SubmissionSummary[] = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId)
      );

      // user_id -> { name, items[] } 로 그룹화
      const byUser = new Map<string, { name: string; items: SubmissionSummary[] }>();
      for (const s of subs) {
        if (!byUser.has(s.user_id)) {
          byUser.set(s.user_id, { name: s.user_name, items: [] });
        }
        byUser.get(s.user_id)!.items.push(s);
      }

      // 학생별 요약(시험 문제 전체 기준으로 고정 길이 배열 생성)
      const rows: GradingStudentSummary[] = [];
      byUser.forEach(({ name, items }, user_id) => {
        // 빠른 조회를 위해 문제별 제출 맵
        const subMap = new Map<number, SubmissionSummary>();
        for (const it of items) subMap.set(it.problem_id, it);

        // 점수와 상태(색상) 배열 생성 (문제지의 순서 기준)
        const scores: (number | null)[] = [];
        const states: ("green" | "red" | "gray")[] = [];

        for (const pid of problemIds) {
          const sub = subMap.get(pid) || null;
          const score = sub?.score ?? null;        // 제출이 없으면 null
          const maxPoint = pointsByProblemId.get(pid) ?? 0;

          scores.push(score);

          // 색상 판정: 회색(미제출), 초록(정답/만점), 빨강(제출했지만 만점 미만)
          if (score === null || typeof score !== "number") {
            states.push("gray");
          } else if (score >= maxPoint) {
            states.push("green");
          } else {
            states.push("red");
          }
        }

        rows.push({
          studentId: user_id,
          studentName: name,
          problemScores: scores,
          problemStates: states,
        });
      });

      setStudents(rows);
    } catch (err) {
      console.error("제출 목록 로드 실패", err);
      setStudents([]);
    }
    // ✅ 의존성: 안정화된 메모 값만 사용 (Map 자체를 매번 새로 만들지 않음)
  }, [groupId, examId, problemIds, pointsByProblemId]);

  // 마운트 시 데이터 로드
  useEffect(() => {
    fetchOwner();
  }, [fetchOwner]);

  // 문제 목록 → 로드 완료 후 제출 목록을 로드 (순서 보장)
  useEffect(() => {
    (async () => {
      await fetchProblemRefs();
    })();
  }, [fetchProblemRefs]);

  useEffect(() => {
    if (problemIds.length > 0) {
      fetchSubmissions();
    } else {
      // 문제 목록이 비었을 때도 학생행 초기화 (동그라미 없음)
      setStudents([]);
    }
  }, [fetchSubmissions, problemIds.length]);

  // 학생 클릭 → 상세 페이지
  const selectStudent = (studentId: string) => {
    router.push(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`);
  };

  return (
    <div className="pb-10">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">학생 제출물 채점</h1>
      </div>

      {/* 학생 리스트 */}
      <div className="mb-8">
        {students.map((stu) => (
          <motion.div
            key={stu.studentId}
            onClick={(e) => {
              e.stopPropagation();
              selectStudent(stu.studentId);
            }}
            className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-1/4 font-medium text-lg">
              {stu.studentName} ( {stu.studentId} )
            </div>

            <div className="flex-grow flex items-center">
              {/* 점수 뱃지 영역 (문제 수 고정) */}
              <div className="flex space-x-2 mr-6">
                {stu.problemScores.map((score, idx) => (
                  <div key={idx} className="w-10 h-10 flex items-center justify-center">
                    <span
                      className={`text-sm font-medium ${
                        score == null ? "text-gray-400" : "text-blue-600"
                      }`}
                    >
                      {score ?? "-"}
                    </span>
                  </div>
                ))}
              </div>

              {/* 동그라미 상태 표시 영역 (문제 수 고정) */}
              <div className="flex space-x-2">
                {stu.problemStates.map((state, idx) => {
                  const pid = problemIds[idx];
                  const title =
                    problemRefs.find((p) => p.problem_id === pid)?.title ?? "";
                  const cls =
                    state === "green"
                      ? "bg-green-500 border-green-600"
                      : state === "red"
                      ? "bg-red-500 border-red-600"
                      : "bg-gray-200 border-gray-300";
                  return (
                    <div
                      key={`${stu.studentId}-${idx}`}
                      className={`w-8 h-8 rounded-full border-2 ${cls} flex items-center justify-center`}
                      title={`문제 ${idx + 1} (ID: ${pid}) ${title ? `- ${title}` : ""}`}
                    >
                      {state === "green" && <span className="text-white text-xs">✓</span>}
                      {state === "red" && <span className="text-white text-xs">✕</span>}
                      {/* gray는 아이콘 없음 */}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-28 text-right">
              {/* 완료 카운트: 초록만 완료로 집계 */}
              {stu.problemStates.length > 0 &&
              stu.problemStates.every((s) => s === "green") ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  채점 완료
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {stu.problemStates.filter((s) => s === "green").length}/
                  {stu.problemStates.length} 정답
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
