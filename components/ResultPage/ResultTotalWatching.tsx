"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { live_api, WatchingResponse } from "@/lib/api";

/** ================== 타입 ================== */
interface StudentStatus {
  studentName: string;
  correct: number; // 표 합계는 cellMap으로 다시 계산됨
  wrong: number;
  notSolved: number;
  score: number;
}
interface ProblemStatus {
  problemId: number;
  title: string;
  type: string; // API에 없어서 "-"로 채움
  correct: number;
  wrong: number;
  notSolved: number;
}

/** 학생-문제 셀 상태 */
type CellStatus = "correct" | "wrong" | "pending"; // 맞음/틀림/미응시
type CellMap = Record<string, CellStatus>; // key = `${studentName}-${problemId}`

/** 상태 텍스트 (툴팁 등에 사용) */
const badgeText: Record<CellStatus, string> = {
  correct: "맞",
  wrong: "틀",
  pending: "미",
};

/** SVG 아이콘 (외부 파일 없이 렌더) */
function StatusIcon({
  status,
  size = 18,
  className = "",
  title,
}: {
  status: CellStatus;
  size?: number;
  className?: string;
  title?: string;
}) {
  if (status === "correct") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-label="맞음"
        role="img"
        className={className}
      >
        {title && <title>{title}</title>}
        <circle cx="12" cy="12" r="12" fill="#10B981" />
        <path
          d="M7 12.5l3 3 7-7"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "wrong") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-label="틀림"
        role="img"
        className={className}
      >
        {title && <title>{title}</title>}
        <circle cx="12" cy="12" r="12" fill="#F43F5E" />
        <path
          d="M8 8l8 8M16 8l-8 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-label="미응시"
      role="img"
      className={className}
    >
      {title && <title>{title}</title>}
      <circle cx="12" cy="12" r="12" fill="#D1D5DB" />
    </svg>
  );
}

export default function ResultTotalWatching() {
  /** ============ 라우터 파라미터 (app router) ============ */
  // 👇 라우터 파라미터 받는 부분만 교체
  type RouteParams = {
    group_id?: string;
    groupId?: string;
    workbook_id?: string;
    workbookId?: string;
    exam_id?: string;
    examId?: string;
  };

  const p = useParams<RouteParams>();

  // 폴더 이름에 맞춰 우선순위로 매칭 (exams 라우트면 exam_id / examId가 잡힘)
  const groupId = p.group_id ?? p.groupId ?? "";
  const workbookId =
    p.workbook_id ?? p.workbookId ?? p.exam_id ?? p.examId ?? "";

  // 디버깅 로그 추가
  useEffect(() => {
    console.log("[params changed]", p, { groupId, workbookId });
  }, [p, groupId, workbookId]);

  /** ============ 상태 ============ */
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [problems, setProblems] = useState<ProblemStatus[]>([]);
  const [cellMap, setCellMap] = useState<CellMap>({});
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  /** ============ API → 화면 상태 매핑 함수 ============ */
  const loadWatching = useCallback(async () => {
    // 0) 파라미터 확인
    console.log("[loadWatching] params:", { groupId, workbookId });

    if (!groupId || !workbookId) {
      console.warn("[loadWatching] groupId/workbookId가 비어있어서 호출 중단");
      return;
    }

    setLoading(true);
    setErrMsg(null);
    try {
      console.log("[loadWatching] 호출 시작");
      const data: WatchingResponse = await live_api.watching_get(
        groupId,
        workbookId
      );
      console.log("📡 API watching_get response:", data);

      // 1) 문제 집합
      const problemMap = new Map<number, { title: string; type: string }>();
      for (const st of data.students || []) {
        for (const sub of st.submission_problem_status || []) {
          if (!problemMap.has(sub.problem_id)) {
            problemMap.set(sub.problem_id, {
              title: sub.problem_name,
              // 👇 실제 problem_type을 보존해서 헤더에 표시
              type: (sub as any).problem_type,
            });
          }
        }
      }
      const problemsArr: ProblemStatus[] = Array.from(problemMap.entries())
        .map(([pid, v]) => ({
          problemId: pid,
          title: v.title,
          type: v.type || "-", // 👈 헤더에 타입 표시되도록 수정
          correct: 0,
          wrong: 0,
          notSolved: 0,
        }))
        .sort((a, b) => a.problemId - b.problemId);

      console.log("[step] problemsArr:", problemsArr);

      // 2) 학생별 최신 제출 맵
      type Submission = {
        problem_id: number;
        problem_name: string;
        problem_type: string;
        is_passed: boolean;
        max_score: number;
        score: number | null;
        created_at?: string | null;
      };
      const latestByStudent: Record<string, Map<number, Submission>> = {};

      for (const st of data.students || []) {
        const name = st.student_name;
        const m = new Map<number, Submission>();
        for (const sub of st.submission_problem_status || []) {
          const prev = m.get(sub.problem_id);
          if (!prev) m.set(sub.problem_id, sub as Submission);
          else {
            const prevTime = new Date(prev.created_at || 0).getTime();
            const curTime = new Date((sub as Submission).created_at || 0).getTime();
            if (curTime > prevTime) m.set(sub.problem_id, sub as Submission);
          }
        }
        latestByStudent[name] = m;
      }
      console.log("[step] latestByStudent:", latestByStudent);

      // 3) cellMap & students
      const nextCellMap: CellMap = {};
      const nextStudents: StudentStatus[] = [];

      for (const st of data.students || []) {
        const name = st.student_name;
        let c = 0,
          w = 0,
          pCount = 0;

        for (const pb of problemsArr) {
          const sub = latestByStudent[name]?.get(pb.problemId);

          // ====== 🔸핵심 변경: 기본값 '미응시' 보장 로직 ======
          // 제출 기록이 아예 없거나(created_at 없음), score가 숫자가 아니면 => 미응시
          // 제출이 있고 통과면 correct, 통과 실패면 wrong
          let status: CellStatus = "pending";
          if (sub) {
            const hasTimestamp = !!sub.created_at;
            const hasScoreNumber = typeof sub.score === "number";

            if (!hasTimestamp || !hasScoreNumber) {
              status = "pending";
            } else if (sub.is_passed) {
              status = "correct";
            } else {
              status = "wrong";
            }
          } else {
            status = "pending";
          }
          // ====================================================

          nextCellMap[`${name}-${pb.problemId}`] = status;
          if (status === "correct") c++;
          else if (status === "wrong") w++;
          else pCount++;
        }

        const totalScore = (st.submission_problem_status || []).reduce(
          (sum, s: any) => sum + (typeof s.score === "number" ? s.score : 0),
          0
        );

        nextStudents.push({
          studentName: name,
          correct: c,
          wrong: w,
          notSolved: pCount,
          score: totalScore,
        });
      }
      console.log("[step] nextStudents:", nextStudents);
      console.log(
        "[step] nextCellMap keys:",
        Object.keys(nextCellMap).slice(0, 20),
        "…"
      );

      // 4) 문제별 합계
      for (const pb of problemsArr) {
        let cc = 0,
          ww = 0,
          pp = 0;
        for (const s of nextStudents) {
          const cell =
            nextCellMap[`${s.studentName}-${pb.problemId}`] ?? "pending";
          if (cell === "correct") cc++;
          else if (cell === "wrong") ww++;
          else pp++;
        }
        pb.correct = cc;
        pb.wrong = ww;
        pb.notSolved = pp;
      }
      console.log("[step] problemsArr(with totals):", problemsArr);

      // 5) 상태 반영
      setStudents(nextStudents);
      setProblems(problemsArr);
      setCellMap(nextCellMap);
      console.log("[loadWatching] 상태 반영 완료");
    } catch (e: any) {
      console.error("[loadWatching] 오류:", e);
      setErrMsg(e?.message || "현황을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      console.log("[loadWatching] 종료");
    }
  }, [groupId, workbookId]);

  /** 최초/파라미터 변경 시 로드 */
  useEffect(() => {
    loadWatching();
  }, [loadWatching]);

  // ====== 헬퍼: 셀 상태 가져오기 ======
  const getCell = (studentName: string, problemId: number): CellStatus => {
    return cellMap[`${studentName}-${problemId}`] ?? "pending";
  };

  // ====== 학생별 합계 (오른쪽 3칸) ======
  const studentTotals = useMemo(() => {
    const map: Record<
      string,
      { correct: number; wrong: number; pending: number }
    > = {};
    students.forEach((s) => {
      let c = 0,
        w = 0,
        p = 0;
      problems.forEach((pb) => {
        const st = getCell(s.studentName, pb.problemId);
        if (st === "correct") c++;
        else if (st === "wrong") w++;
        else p++;
      });
      map[s.studentName] = { correct: c, wrong: w, pending: p };
    });
    return map;
  }, [students, problems, cellMap]);

  // ====== 문제별 합계 (맨 아래 1행) ======
  const problemTotals = useMemo(() => {
    const map: Record<
      number,
      { correct: number; wrong: number; pending: number }
    > = {};
    problems.forEach((pb) => {
      let c = 0,
        w = 0,
        p = 0;
      students.forEach((s) => {
        const st = getCell(s.studentName, pb.problemId);
        if (st === "correct") c++;
        else if (st === "wrong") w++;
        else p++;
      });
      map[pb.problemId] = { correct: c, wrong: w, pending: p };
    });
    return map;
  }, [students, problems, cellMap]);

  // ====== 전체 합계 (맨 아래 오른쪽 3칸) ======
  const grandTotals = useMemo(() => {
    let c = 0,
      w = 0,
      p = 0;
    students.forEach((s) => {
      problems.forEach((pb) => {
        const st = getCell(s.studentName, pb.problemId);
        if (st === "correct") c++;
        else if (st === "wrong") w++;
        else p++;
      });
    });
    return { correct: c, wrong: w, pending: p };
  }, [students, problems, cellMap]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">실시간 학생 현황보기</h1>

      {/* 상단 요약 카드 */}
      <div className="grid md:grid-cols-12 gap-4">
        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">응시 학생 수</p>
          <p className="text-3xl font-semibold mt-1">{students.length}</p>
        </div>
        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">총 문제 수</p>
          <p className="text-3xl font-semibold mt-1">{problems.length}</p>
        </div>
      </div>

      {/* 아이콘 설명 */}
      <div className="flex items-center gap-5 text-sm text-gray-600 justify-end pr-2">
        <span className="inline-flex items-center gap-2">
          <StatusIcon status="correct" size={16} /> 맞음
        </span>
        <span className="inline-flex items-center gap-2">
          <StatusIcon status="wrong" size={16} /> 틀림
        </span>
        <span className="inline-flex items-center gap-2">
          <StatusIcon status="pending" size={16} /> 미응시
        </span>
      </div>

      {/* ===== 통합 표 ===== */}
      <div className="rounded-2xl border overflow-x-auto">
        <div className="border-b px-4 py-3 bg-gray-50 font-semibold flex items-center justify-between">
          <span>학생별 문제 풀이 현황</span>

          {/* 새로고침 버튼 */}
          <button
            onClick={loadWatching}
            disabled={loading}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            title="새로고침"
            aria-label="새로고침"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className={`w-7 h-7 ${loading ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H4m0 0V4m16 16v-5h-.581m-15.357-2a8.003 8.003 0 0015.357 2H20m0 0v5"
              />
            </svg>
          </button>
        </div>

        {errMsg && (
          <div className="px-4 py-2 text-sm text-rose-600 border-b bg-rose-50">
            {errMsg}
          </div>
        )}

        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b">
              {/* 고정 컬럼: 학생 */}
              <th className="px-4 py-2 text-left sticky left-0 bg-gray-50 z-10">
                학생
              </th>

              {/* 문제 번호 헤더들 */}
              {problems.map((p) => (
                <th key={p.problemId} className="px-2 py-2 text-center">
                  <div className="font-medium">문제 {p.problemId}</div>
                  <div className="text-[11px] text-gray-500">{p.type}</div>
                </th>
              ))}

              {/* 오른쪽 합계 3칸 */}
              <th className="px-3 py-2 text-center">맞음</th>
              <th className="px-3 py-2 text-center">틀림</th>
              <th className="px-3 py-2 text-center">미응시</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => {
              const sum = studentTotals[s.studentName] ?? {
                correct: 0,
                wrong: 0,
                pending: 0,
              };
              return (
                <tr key={s.studentName} className="border-b">
                  {/* 학생 이름 (좌측 고정) */}
                  <td className="px-4 py-2 sticky left-0 bg-white z-10 font-medium">
                    {s.studentName}
                  </td>

                  {/* 문제별 상태 아이콘 */}
                  {problems.map((p) => {
                    const st = getCell(s.studentName, p.problemId);
                    return (
                      <td key={p.problemId} className="px-2 py-2">
                        <div className="flex items-center justify-center">
                          <StatusIcon
                            status={st}
                            size={18}
                            title={`${s.studentName} - 문제 ${p.problemId} (${p.title}) : ${badgeText[st]}`}
                          />
                        </div>
                      </td>
                    );
                  })}

                  {/* 오른쪽 합계 */}
                  <td className="px-2 py-2 text-center font-semibold text-emerald-600">
                    {sum.correct}
                  </td>
                  <td className="px-2 py-2 text-center font-semibold text-rose-600">
                    {sum.wrong}
                  </td>
                  <td className="px-2 py-2 text-center font-semibold text-gray-600">
                    {sum.pending}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* ===== 맨 아래 문제별 합계 (가로 한 행) ===== */}
          <tfoot>
            <tr className="bg-gray-50 border-t">
              <td className="px-4 py-2 sticky left-0 bg-gray-50 z-10 font-semibold">
                문제별 합계
              </td>

              {/* 각 문제 칸: 맞/틀/미 수치 */}
              {problems.map((p) => {
                const t = problemTotals[p.problemId] ?? {
                  correct: 0,
                  wrong: 0,
                  pending: 0,
                };
                return (
                  <td key={p.problemId} className="px-2 py-2">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <StatusIcon status="correct" size={15} /> {t.correct}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <StatusIcon status="wrong" size={15} /> {t.wrong}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        <StatusIcon status="pending" size={15} /> {t.pending}
                      </span>
                    </div>
                  </td>
                );
              })}

              {/* 오른쪽: 전체 합계 */}
              <td className="px-2 py-2 text-center font-bold text-emerald-700">
                {grandTotals.correct}
              </td>
              <td className="px-2 py-2 text-center font-bold text-rose-700">
                {grandTotals.wrong}
              </td>
              <td className="px-2 py-2 text-center font-bold text-gray-700">
                {grandTotals.pending}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
