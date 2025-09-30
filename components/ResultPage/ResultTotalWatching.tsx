"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  live_api,
  WatchingResponse,
  auth_api,
  group_api,
  problem_ref_api,
} from "@/lib/api";

/** ================== 타입 ================== */
type Role = "개발자" | "학생" | "결석";

interface StudentStatus {
  studentName: string;
  studentNo?: string | number;
  correct: number;
  wrong: number;
  notSolved: number;
  score: number;

  /** ★ 추가: 직책(더미) */
  role?: Role;
}

/** ★ suspect 상태 추가 */
type CellStatus = "correct" | "wrong" | "pending" | "suspect";

interface ProblemStatus {
  problemId: number;
  title: string;
  type: string;
  correct: number;
  wrong: number;
  notSolved: number;
}
type CellMap = Record<string, CellStatus>;

/** ★ badge 텍스트 suspect 추가 */
const badgeText: Record<CellStatus, string> = {
  correct: "맞",
  wrong: "틀",
  pending: "미",
  suspect: "의", // AI 의심
};

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
  /** ★ suspect 노란색 아이콘 */
  if (status === "suspect") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-label="AI 의심"
        role="img"
        className={className}
      >
        {title && <title>{title}</title>}
        {/* amber-500 */}
        <circle cx="12" cy="12" r="12" fill="#F59E0B" />
        {/* 느낌표 모양 */}
        <path
          d="M12 6v8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17" r="1.5" fill="white" />
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

/** (추가) 보기용 타입 라벨 보정: 최소 수정(표기만 정리) */
const prettifyType = (t: string | undefined | null) => {
  const x = String(t ?? "").trim();
  if (!x) return "-";
  if (x === "단답식") return "단답형";
  return x;
};

export default function ResultTotalWatching() {
  /** ============ 라우터 파라미터 ============ */
  type RouteParams = {
    group_id?: string;
    groupId?: string;
    workbook_id?: string;
    workbookId?: string;
    exam_id?: string;
    examId?: string;
  };
  const p = useParams<RouteParams>();
  const groupId = p.group_id ?? p.groupId ?? "";
  const workbookId =
    p.workbook_id ?? p.workbookId ?? p.exam_id ?? p.examId ?? "";

  /** ============ 상태 ============ */
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [problems, setProblems] = useState<ProblemStatus[]>([]);
  const [cellMap, setCellMap] = useState<CellMap>({});
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  /** ============ 데이터 로드 ============ */
  const loadWatching = useCallback(async () => {
    if (!groupId || !workbookId) return;

    setLoading(true);
    setErrMsg(null);
    try {
      // 1) 실시간 제출 현황
      const data: WatchingResponse = await live_api.watching_get(
        groupId,
        workbookId
      );

      // 2) 그룹장/본인 제외
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

      const filteredStudents = (data.students || []).filter((st: any) => {
        const sid = String(st.student_id);
        return sid !== String(ownerId ?? "") && sid !== String(meId ?? "");
      });

      // 3) 문제지의 "정확한 순서" (refs 순서 보존)
      const refs = await problem_ref_api.problem_ref_get(
        Number(groupId),
        Number(workbookId)
      );

      // 4) 타입 채우기용 딕셔너리
      const refTypeById = new Map<number, string>();
      for (const r of refs) {
        const t =
          (r as any).problem_type ||
          (r as any).type ||
          (r as any).question_type ||
          (r as any).category;
        if (t) refTypeById.set(r.problem_id, t as string);
      }

      const problemTypeById = new Map<number, string>();
      for (const st of filteredStudents as any[]) {
        for (const sub of st.submission_problem_status || []) {
          if (sub?.problem_id && (sub as any).problem_type) {
            problemTypeById.set(sub.problem_id, (sub as any).problem_type);
          }
        }
      }

      // 5) 문제 배열: "문제지 순서" 그대로
      const problemsArr: ProblemStatus[] = refs.map((r) => ({
        problemId: r.problem_id,
        title: r.title,
        type: prettifyType(
          refTypeById.get(r.problem_id) ??
            problemTypeById.get(r.problem_id) ??
            "-"
        ),
        correct: 0,
        wrong: 0,
        notSolved: 0,
      }));

      // 6) 학생별 최신 제출만 취합 (★ copy_suspicion 포함)
      type Submission = {
        problem_id: number;
        problem_name: string;
        problem_type?: string;
        is_passed: boolean;
        max_score: number;
        score: number | null;
        created_at?: string | null;
        copy_suspicion?: boolean; // ★
      };
      const latestByStudent: Record<string, Map<number, Submission>> = {};
      for (const st of filteredStudents as any[]) {
        const name = st.student_name as string;
        const m = new Map<number, Submission>();
        for (const sub of st.submission_problem_status || []) {
          const prev = m.get(sub.problem_id);
          if (!prev) {
            m.set(sub.problem_id, sub as Submission);
          } else {
            const prevTime = new Date(prev.created_at || 0).getTime();
            const curTime = new Date(
              (sub as Submission).created_at || 0
            ).getTime();
            if (curTime > prevTime) m.set(sub.problem_id, sub as Submission);
          }
        }
        latestByStudent[name] = m;
      }

      // 7) 셀 맵/학생 통계 (+ 학번 수집)
      const nextCellMap: CellMap = {};
      const nextStudents: StudentStatus[] = [];

      /** ★ 학번 추출 유틸: API마다 키가 다를 수 있어서 후보들을 순서대로 확인 */
      const pickStudentNo = (st: any): string | number | undefined => {
        return (
          st.student_no ??
          st.student_number ??
          st.studentCode ??
          st.student_code ??
          st.studentId ?? // 별칭으로 학번 쓰는 경우
          st.username ?? // 아이디를 학번처럼 쓰는 경우
          st.student_id // 마지막 수단(내부 id) – 진짜 학번 없을 때만
        );
      };

      for (const st of filteredStudents as any[]) {
        const name: string = st.student_name;
        const studentNo = pickStudentNo(st);

        let c = 0,
          w = 0,
          pCount = 0;

        for (const pb of problemsArr) {
          const sub = latestByStudent[name]?.get(pb.problemId);

          let status: CellStatus = "pending";
          if (sub) {
            const hasTimestamp = !!sub.created_at;
            const hasScoreNumber = typeof sub.score === "number";

            // ✅ 우선순위 1: 최신 제출에서 AI 의심이면 무조건 노란색
            if (sub.copy_suspicion === true) {
              status = "suspect";
            } else if (!hasTimestamp || !hasScoreNumber) {
              status = "pending";
            } else if (sub.is_passed) {
              status = "correct";
            } else {
              status = "wrong";
            }
          }

          nextCellMap[`${name}-${pb.problemId}`] = status;

          // 집계 규칙 그대로: suspect는 '틀림'으로 합산
          if (status === "correct") c++;
          else if (status === "wrong" || status === "suspect") w++;
          else pCount++;
        }

        const totalScore = (st.submission_problem_status || []).reduce(
          (sum: number, s: any) =>
            sum + (typeof s.score === "number" ? s.score : 0),
          0
        );

        nextStudents.push({
          studentName: name,
          studentNo,
          correct: c,
          wrong: w,
          notSolved: pCount,
          score: totalScore,
          role: "학생", // ★ 기본 직책
        });
      }

      // 8) 문제별 합계 (★ suspect는 '틀림'으로 집계)
      for (const pb of problemsArr) {
        let cc = 0,
          ww = 0,
          pp = 0;
        for (const s of nextStudents) {
          const cell =
            nextCellMap[`${s.studentName}-${pb.problemId}`] ?? "pending";
          if (cell === "correct") cc++;
          else if (cell === "wrong" || cell === "suspect") ww++;
          else pp++;
        }
        pb.correct = cc;
        pb.wrong = ww;
        pb.notSolved = pp;
      }

      setStudents(
        [...nextStudents].sort((a, b) =>
          a.studentName.localeCompare(b.studentName, "ko-KR", {
            sensitivity: "base",
          })
        )
      );
      setProblems(problemsArr);
      setCellMap(nextCellMap);
    } catch (e: any) {
      setErrMsg(e?.message || "현황을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [groupId, workbookId]);

  useEffect(() => {
    loadWatching();
  }, [loadWatching]);

  const getCell = (studentName: string, problemId: number): CellStatus =>
    cellMap[`${studentName}-${problemId}`] ?? "pending";

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
        else if (st === "wrong" || st === "suspect")
          w++; // ★ suspect를 wrong으로 집계
        else p++;
      });
      map[s.studentName] = { correct: c, wrong: w, pending: p };
    });
    return map;
  }, [students, problems, cellMap]);

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
        else if (st === "wrong" || st === "suspect") w++; // ★
        else p++;
      });
      map[pb.problemId] = { correct: c, wrong: w, pending: p };
    });
    return map;
  }, [students, problems, cellMap]);

  const grandTotals = useMemo(() => {
    let c = 0,
      w = 0,
      p = 0;
    students.forEach((s) => {
      problems.forEach((pb) => {
        const st = getCell(s.studentName, pb.problemId);
        if (st === "correct") c++;
        else if (st === "wrong" || st === "suspect") w++; // ★
        else p++;
      });
    });
    return { correct: c, wrong: w, pending: p };
  }, [students, problems, cellMap]);

  /* ========= 화면폭 안에서만 보여주는 열 가상화(윈도우링) ========= */
  const ROLE_COL_W = 110;
  const STUDENT_NAME_COL_W = 160;
  const STUDENT_NO_COL_W = 120;
  const TOTALS_W = 3 * 88; // px
  const H_PADDING = 32; // px
  const MIN_PROBLEM_COL_W = 120;

  const frameRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [startIdx, setStartIdx] = useState<number>(0);

  const recalcVisible = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const avail = Math.max(
      0,
      w -
        (ROLE_COL_W +
          STUDENT_NAME_COL_W +
          STUDENT_NO_COL_W +
          TOTALS_W +
          H_PADDING)
    );
    const n = Math.max(1, Math.floor(avail / MIN_PROBLEM_COL_W));
    setVisibleCount(n);
    if (startIdx > 0 && startIdx + n > problems.length) {
      setStartIdx(Math.max(0, problems.length - n));
    }
  }, [problems.length, startIdx]);

  useEffect(() => {
    recalcVisible();
  }, [recalcVisible, problems.length, students.length]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => recalcVisible());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcVisible]);

  const endIdx = Math.min(problems.length, startIdx + visibleCount);
  const windowProblems = problems.slice(startIdx, endIdx);

  const canLeft = startIdx > 0;
  const canRight = endIdx < problems.length;

  const goLeft = () => setStartIdx((s) => Math.max(0, s - visibleCount));
  const goRight = () =>
    setStartIdx((s) =>
      Math.min(problems.length - visibleCount, s + visibleCount)
    );

  /* ===================== 렌더 ===================== */
  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold">실시간 학생 현황보기</h1>

      {/* 상단 요약 카드 */}
      <div className="grid md:grid-cols-12 gap-4">
        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">응시 학생</p>
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
        {/* ★ 노란색 AI의심 추가 */}
        <span className="inline-flex items-center gap-2">
          <StatusIcon status="suspect" size={16} /> AI의심
        </span>
        <span className="inline-flex items-center gap-2">
          <StatusIcon status="pending" size={16} /> 미응시
        </span>
      </div>

      {/* ===== 표 프레임(화면 폭 기준) ===== */}
      <div ref={frameRef} className="rounded-2xl border relative bg-white">
        <div className="border-b px-4 py-3 bg-gray-50 font-semibold flex items-center justify-between">
          <span>학생별 문제 풀이 현황</span>

          {/* ✅ 가운데 컨트롤: ← [범위] → */}
          <div className="flex items-center gap-2">
            {/* ← */}
            <button
              type="button"
              onClick={goLeft}
              disabled={!canLeft}
              aria-label="이전 문제들 보기"
              className={`h-8 w-8 grid place-items-center rounded-md border transition
              ${
                canLeft
                  ? "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                  : "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="w-4 h-4"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H16a1 1 0 110 2H8.414l3.879 3.879a1 1 0 010 1.414z" />
              </svg>
            </button>

            <div className="text-xs text-gray-600 tabular-nums w-[110px] text-center">
              {problems.length > 0
                ? `${startIdx + 1}–${endIdx} / ${problems.length}`
                : "0 / 0"}
            </div>

            {/* → */}
            <button
              type="button"
              onClick={goRight}
              disabled={!canRight}
              aria-label="다음 문제들 보기"
              className={`h-8 w-8 grid place-items-center rounded-md border transition
              ${
                canRight
                  ? "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                  : "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="w-4 h-4"
                fill="currentColor"
                aria-hidden
              >
                <path d="M7.707 4.293a1 1 0 010 1.414L11.586 9H4a1 1 0 100 2h7.586l-3.879 3.879a1 1 0 101.414 1.414l5-5a1 1 0 000-1.414l-5-5a1 1 0 10-1.414 0z" />
              </svg>
            </button>
          </div>

          {/* 새로고침 */}
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

        {/* 표 */}
        <div className="overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              {/* ★ 직책 */}
              <col style={{ width: `${ROLE_COL_W}px` }} />
              <col style={{ width: `${STUDENT_NAME_COL_W}px` }} />
              <col style={{ width: `${STUDENT_NO_COL_W}px` }} />
              {windowProblems.map((_p, i) => (
                <col
                  key={`pcol-${i}`}
                  style={{ width: `${Math.max(120, 1)}px` }}
                />
              ))}
              <col style={{ width: "88px" }} />
              <col style={{ width: "88px" }} />
              <col style={{ width: "88px" }} />
            </colgroup>

            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="px-4 py-2 text-left sticky left-0 bg-gray-50 z-10">
                  <span className="ml-7 inline-block">직책</span>
                </th>

                <th
                  className="px-4 py-2 text-left sticky bg-gray-50 z-10"
                  style={{ left: ROLE_COL_W }} // ★ 보정
                >
                  이름
                </th>
                <th
                  className="px-4 py-2 text-left sticky bg-gray-50 z-10"
                  style={{ left: ROLE_COL_W + STUDENT_NAME_COL_W }} // ★ 보정
                >
                  학번
                </th>

                {windowProblems.map((p) => (
                  <th
                    key={p.problemId}
                    className="px-2 py-2 text-center whitespace-nowrap"
                    title={p.title}
                  >
                    <div className="font-medium max-w-[220px] mx-auto truncate">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {p.type}
                    </div>
                  </th>
                ))}

                <th className="px-3 py-2 text-center whitespace-nowrap">
                  맞음
                </th>
                <th className="px-3 py-2 text-center whitespace-nowrap">
                  틀림
                </th>
                <th className="px-3 py-2 text-center whitespace-nowrap">
                  미응시
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, idx) => {
                const sum = studentTotals[s.studentName] ?? {
                  correct: 0,
                  wrong: 0,
                  pending: 0,
                };

                return (
                  <tr key={s.studentName} className="border-b">
                    {/* ★ 직책: 더미 상태 업데이트(로컬 상태만) */}
                    <td className="px-4 py-2 sticky left-0 bg-white z-10">
                      <select
                        value={s.role ?? "학생"}
                        onChange={(e) => {
                          const v = e.target.value as Role;
                          // 로컬 students 상태만 업데이트 (더미)
                          setStudents((prev) =>
                            prev.map((it) =>
                              it.studentName === s.studentName
                                ? { ...it, role: v }
                                : it
                            )
                          );
                        }}
                        className="w-full border rounded-md px-2 py-1 text-sm bg-white"
                      >
                        <option value="개발자">개발자</option>
                        <option value="학생">학생</option>
                        <option value="결석자">결석자</option>
                      </select>
                    </td>

                    <td
                      className="px-4 py-2 sticky bg-white z-10 font-medium whitespace-nowrap"
                      style={{ left: ROLE_COL_W }} // ★ 보정
                    >
                      {s.studentName}
                    </td>

                    <td
                      className="px-4 py-2 sticky bg-white z-10 whitespace-nowrap text-gray-700"
                      style={{ left: ROLE_COL_W + STUDENT_NAME_COL_W }} // ★ 보정
                    >
                      {s.studentNo ?? "-"}
                    </td>

                    {windowProblems.map((p) => {
                      const st = getCell(s.studentName, p.problemId);
                      return (
                        <td key={p.problemId} className="px-2 py-2">
                          <div className="flex items-center justify-center">
                            <StatusIcon
                              status={st}
                              size={18}
                              title={`${s.studentName} • ${p.title} : ${badgeText[st]}`}
                            />
                          </div>
                        </td>
                      );
                    })}

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

            <tfoot>
              <tr className="bg-gray-50 border-t">
                <td className="px-4 py-2 sticky left-0 bg-gray-50 z-10 font-semibold">
                  문제별 합계
                </td>
                <td
                  className="px-4 py-2 sticky bg-gray-50 z-10"
                  style={{ left: ROLE_COL_W }} // ★ 보정
                />
                <td
                  className="px-4 py-2 sticky bg-gray-50 z-10"
                  style={{ left: ROLE_COL_W + STUDENT_NAME_COL_W }} // ★ 보정
                />

                {windowProblems.map((p) => {
                  const t = problemTotals[p.problemId] ?? {
                    correct: 0,
                    wrong: 0,
                    pending: 0,
                  };
                  return (
                    <td key={p.problemId} className="px-2 py-2">
                      <div className="flex flex-wrap items-center justify-center gap-1 text-[11px]">
                        <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.correct}
                        </span>
                        <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {t.wrong}
                        </span>
                        <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                          {t.pending}
                        </span>
                      </div>
                    </td>
                  );
                })}

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
    </div>
  );
}
