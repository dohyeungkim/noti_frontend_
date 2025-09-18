"use client";

import React, { useEffect, useMemo, useState } from "react";

/** ================== 타입 ================== */
interface StudentStatus {
  studentName: string;
  correct: number; // (표시용: 상단 요약) - 표 합계는 cellMap으로 다시 계산됨
  wrong: number;
  notSolved: number;
  score: number;
}
interface ProblemStatus {
  problemId: number;
  title: string;
  type: string; // "객관식" | "주관식" | "단답형" | "코딩" | "디버깅"
  correct: number; // (표시용: 상단 요약) - 표 합계는 cellMap으로 다시 계산됨
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
        title={title}
      >
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
        title={title}
      >
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
      title={title}
    >
      <circle cx="12" cy="12" r="12" fill="#D1D5DB" />
    </svg>
  );
}

export default function ResultTotalWatching() {
  // ✅ 더미 데이터 (나중에 API로 교체)
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [problems, setProblems] = useState<ProblemStatus[]>([]);
  const [cellMap, setCellMap] = useState<CellMap>({});

  useEffect(() => {
    // TODO: 실제 API로 교체
    setStudents([
      { studentName: "홍길동", correct: 3, wrong: 2, notSolved: 1, score: 80 },
      { studentName: "김철수", correct: 4, wrong: 1, notSolved: 1, score: 90 },
      { studentName: "이영희", correct: 2, wrong: 2, notSolved: 2, score: 70 },
    ]);

    setProblems([
      {
        problemId: 1,
        title: "두 정수 합",
        type: "코딩",
        correct: 8,
        wrong: 2,
        notSolved: 0,
      },
      {
        problemId: 2,
        title: "배열 탐색",
        type: "객관식",
        correct: 6,
        wrong: 3,
        notSolved: 1,
      },
      {
        problemId: 3,
        title: "문자열 압축",
        type: "주관식",
        correct: 5,
        wrong: 4,
        notSolved: 1,
      },
      {
        problemId: 4,
        title: "최대값",
        type: "단답형",
        correct: 7,
        wrong: 2,
        notSolved: 1,
      },
      {
        problemId: 5,
        title: "버그 수정",
        type: "디버깅",
        correct: 6,
        wrong: 3,
        notSolved: 1,
      },
    ]);

    // ▶️ 학생×문제 상태 더미 (API 응답으로 대체하면 됨)
    const demo: CellMap = {
      "홍길동-1": "correct",
      "홍길동-2": "wrong",
      "홍길동-3": "pending",
      "홍길동-4": "correct",
      "홍길동-5": "wrong",

      "김철수-1": "correct",
      "김철수-2": "correct",
      "김철수-3": "wrong",
      "김철수-4": "pending",
      "김철수-5": "correct",

      "이영희-1": "pending",
      "이영희-2": "wrong",
      "이영희-3": "correct",
      "이영희-4": "pending",
      "이영희-5": "wrong",
    };
    setCellMap(demo);
  }, []);

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
  {/* 새로고침 버튼 (더미) */}
  <button
    onClick={() => {
      console.log("새로고침 버튼 클릭됨 (더미)");
    }}
    className="p-1 hover:bg-gray-100 rounded"
    title="새로고침"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={3}
      stroke="gray"
      className="w-7 h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H4m0 0V4m16 16v-5h-.581m-15.357-2a8.003 8.003 0 0015.357 2H20m0 0v5"
      />
    </svg>
  </button>
</div>


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
              <th className="px-3 py-2 text-center">미</th>
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
