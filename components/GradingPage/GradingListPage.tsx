"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import {
  group_api,
  group_member_api,
  grading_api,
  problem_ref_api,
  auth_api,
} from "@/lib/api";
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
  const [absentStudents, setAbsentStudents] = useState<
    Array<{ userId: string; userName: string; studentNo: string }>
  >([]);
  const [problemRefs, setProblemRefs] = useState<ProblemRef[]>([]);
  const [loading, setLoading] = useState(true);

  // ================== 가변 가시 영역(윈도우링) 상태 ==================
  const [startIdx, setStartIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1); // 초기엔 보수적으로 1
  const frameRef = useRef<HTMLDivElement | null>(null);

  // 컬럼 폭(고정) & 레이아웃 상수
  const NAME_COL_W = 70; // 180 → 140
  const STUNO_COL_W = 80; // 140 → 110
  const TOTAL_COL_W = 130; // (옵션) 140 → 130
  const RIGHT_STATUS_W = 130; // (옵션) 140 → 130
  const H_PADDING = 24; // (옵션) 32 → 24
  const MIN_PROBLEM_COL_W = 160; // 그대로

  // 보이는 범위 파생
  const totalProblems = problemRefs.length;
  const endIdx = Math.min(totalProblems, startIdx + visibleCount);
  const visibleProblems = problemRefs.slice(startIdx, endIdx);

  const canLeft = startIdx > 0;
  const canRight = endIdx < totalProblems;

  // 컨테이너 폭에 따라 visibleCount 계산
  const recalcVisible = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;

    const containerW = el.clientWidth;
    const scrollbarW = el.offsetWidth - el.clientWidth;
    const used =
      NAME_COL_W + STUNO_COL_W + TOTAL_COL_W + RIGHT_STATUS_W + H_PADDING;

    const avail = Math.max(0, containerW - used - scrollbarW);
    const n = Math.max(
      1,
      Math.min(totalProblems, Math.floor(avail / MIN_PROBLEM_COL_W))
    );

    setVisibleCount((prev) => {
      const nextEnd = startIdx + n;
      if (startIdx > 0 && nextEnd > totalProblems) {
        setStartIdx(Math.max(0, totalProblems - n));
      }
      return n;
    });
  }, [
    startIdx,
    totalProblems,
    NAME_COL_W,
    STUNO_COL_W,
    TOTAL_COL_W,
    RIGHT_STATUS_W,
    H_PADDING,
    MIN_PROBLEM_COL_W,
  ]);

  // 레이아웃이 잡힌 직후(첫 페인트 다음 프레임)에 1차 계산
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => recalcVisible());
    return () => cancelAnimationFrame(id);
  }, [recalcVisible]);

  // 폰트 로딩/윈도우 로드 후에도 한 번 더 계산 (웹폰트로 폭 달라질 수 있음)
  useEffect(() => {
    let fontDone = false;
    let onLoadDone = false;

    const tryRecalc = () => {
      recalcVisible();
    };

    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        fontDone = true;
        tryRecalc();
      });
    }

    const onLoad = () => {
      onLoadDone = true;
      tryRecalc();
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      if (!onLoadDone) window.removeEventListener("load", onLoad);
    };
  }, [recalcVisible]);

  // 문제/학생 수 변동 시 재계산
  useEffect(() => {
    recalcVisible();
  }, [recalcVisible, problemRefs.length, students.length]);

  // 리사이즈 옵저버
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => recalcVisible());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcVisible]);

  // 좌우 이동은 “현재 보이는 개수”만큼 점프
  const goLeft = () => {
    if (!canLeft) return;
    setStartIdx((s) => Math.max(0, s - visibleCount));
  };
  const goRight = () => {
    if (!canRight) return;
    setStartIdx((s) =>
      Math.min(Math.max(0, totalProblems - visibleCount), s + visibleCount)
    );
  };

  // ===============================================================
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [gradedAbsentStudents, setGradedAbsentStudents] = useState<Set<string>>(
    new Set()
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchProblemRefs = useCallback(async () => {
    try {
      const refs = await problem_ref_api.problem_ref_get(
        Number(groupId),
        Number(examId)
      );
      refs.sort((a, b) => a.problem_id - b.problem_id);
      setProblemRefs(refs);
      setStartIdx(0);
    } catch (err) {
      console.error("문제 참조 로드 실패", err);
      setProblemRefs([]);
    }
  }, [groupId, examId]);

  useEffect(() => {
    if (problemRefs.length === 0) return;

    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        const groupMembers = await group_member_api.group_get_member(
          Number(groupId)
        );

        const submissions = await grading_api.get_all_submissions(
          Number(groupId),
          Number(examId)
        );

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
        } catch (err) {
          console.warn("그룹장 정보 조회 실패:", err);
        }

        const submittedUserIds = new Set<string>();
        submissions.forEach((sub) => submittedUserIds.add(String(sub.user_id)));

        const byUser = new Map<
          string,
          { name: string; studentNo: string; items: SubmissionSummary[] }
        >();

        for (const sub of submissions) {
          const userId = String(sub.user_id);
          if (ownerId && userId === String(ownerId)) continue;

          const userName = sub.user_name || "이름 없음";
          const studentNo = String(sub.user_id);

          if (!byUser.has(userId)) {
            byUser.set(userId, { name: userName, studentNo, items: [] });
          }
          byUser.get(userId)!.items.push(sub);
        }

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

          for (const [, subs] of Array.from(subMapByProblem.entries())) {
            subs.sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
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

            const submissionRecords: SubmissionRecord[] = subs.map((sub) => ({
              submissionId: sub.submission_id,
              aiScore: sub.ai_score ?? null,
              profScore: sub.prof_score ?? null,
              submittedAt: sub.updated_at,
              reviewed: sub.reviewed ?? false,
            }));

            problemScores.push({
              maxPoints,
              submissions: submissionRecords,
              problemId: pid,
            });
          }

          rows.push({
            studentId: userId,
            studentName: name,
            studentNo,
            problemScores,
          });
        }

        rows.sort((a, b) =>
          a.studentName.localeCompare(b.studentName, "ko-KR", {
            sensitivity: "base",
          })
        );

        setStudents(rows);

        // 결시생 처리
        const absentList: Array<{
          userId: string;
          userName: string;
          studentNo: string;
        }> = [];
        const absentSeenUserIds = new Set<string>();

        for (const member of groupMembers as any[]) {
          const memberId = String(member.user_id);
          const studentNo = memberId;

          if (ownerId && memberId === String(ownerId)) continue;
          if (absentSeenUserIds.has(memberId)) continue;

          if (!submittedUserIds.has(memberId)) {
            absentList.push({
              userId: memberId,
              userName: member.username || "이름 없음",
              studentNo,
            });
            absentSeenUserIds.add(memberId);
          }
        }

        absentList.sort((a, b) =>
          a.userName.localeCompare(b.userName, "ko-KR", {
            sensitivity: "base",
          })
        );

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
    router.push(
      `/mygroups/${groupId}/exams/${examId}/grading/${studentId}?problemId=${problemId}`
    );
  };

  const toggleExpanded = (
    studentId: string,
    problemIdx: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const key = `${studentId}-${problemIdx}`;
    setExpandedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const handleGradeAbsentStudent = (userId: string) => {
    setGradedAbsentStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else {
        newSet.add(userId);
        setToastMessage("결시처리되었습니다");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const showScrollButtons = totalProblems > visibleCount;

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* 제목 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">학생 제출물 채점</h1>

        {/* 점수 기준 범례 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-xs text-gray-600">10–9점</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-600">5–8점</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-xs text-gray-600">0–4점</span>
          </div>
        </div>
      </div>

      {/* 표 프레임 */}
      <div ref={frameRef} className="rounded-2xl border relative bg-white overflow-hidden">
        {/* 헤더 바: ← [범위] → */}
         <div className="border-b px-4 py-3 bg-gray-50 font-semibold flex items-center justify-between rounded-t-2xl">
          <span>채점 테이블</span>
          <div className="flex items-center gap-2">
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
              {/* ← */}
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
              {totalProblems > 0
                ? `${startIdx + 1}–${endIdx} / ${totalProblems}`
                : "0 / 0"}
            </div>
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
              {/* → */}
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
          <div className="opacity-0">align</div>
        </div>

        {/* 테이블 */}
        <div className="overflow-auto bg-white">
          <table className="w-full table-fixed text-sm border-separate border-spacing-0">
            <colgroup>
              <col style={{ width: `${NAME_COL_W}px` }} />
              <col style={{ width: `${STUNO_COL_W}px` }} />
              <col style={{ width: `${TOTAL_COL_W}px` }} />
              {visibleProblems.map((_p, i) => (
                <col
                  key={`pcol-${i}`}
                  style={{ width: `${MIN_PROBLEM_COL_W}px` }}
                />
              ))}
              <col style={{ width: `${RIGHT_STATUS_W}px` }} />
            </colgroup>

            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-10 rounded-tl-2xl">
                  이름
                </th>
                <th
                  className="px-4 py-3 text-left sticky bg-gray-50 z-10"
                  style={{ left: NAME_COL_W }}
                >
                  학번
                </th>
                <th
                  className="px-4 py-3 text-center sticky bg-gray-50 z-10"
                  style={{ left: NAME_COL_W + STUNO_COL_W }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-sm font-bold text-gray-800">총점</div>
                    <div className="text-[11px] text-gray-500">획득 / 배점</div>
                  </div>
                </th>

                {visibleProblems.map((prob, idx) => (
                  <th
                    key={prob.problem_id}
                    className="px-2 py-3 text-center whitespace-nowrap"
                  >
                    <div className="font-medium max-w-[220px] mx-auto truncate">
                      문제 {startIdx + idx + 1}
                    </div>
                    <div
                      className="text-[11px] text-gray-500 truncate"
                      title={prob.title}
                    >
                      {prob.title}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      (배점: {prob.points ?? 20}점)
                    </div>
                    <div className="text-[11px] text-gray-400">
                      교수점수 / AI점수
                    </div>
                  </th>
                ))}

                <th className="px-3 py-3 text-center whitespace-nowrap rounded-tr-2xl">
                  상태
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((stu, stuIdx) => {
                const visibleScores = stu.problemScores.slice(startIdx, endIdx);

                // 총점(전체 문제 기준)
                let totalProfScore = 0;
                let totalAiScore = 0;
                for (const data of stu.problemScores) {
                  if (data.submissions.length > 0) {
                    const latestSub = data.submissions[0];
                    if (latestSub.profScore !== null)
                      totalProfScore += latestSub.profScore;
                    if (latestSub.aiScore !== null)
                      totalAiScore += latestSub.aiScore;
                  }
                }
                const totalMaxPoints = stu.problemScores.length * 20;
                const totalObtainedScore = totalProfScore + totalAiScore;

                const hasAnySubmission = visibleScores.some(
                  (d) => d.submissions.length > 0
                );

                return (
                  <tr
                    key={stu.studentId}
                    className={`border-b ${
                      stuIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* 이름 */}
                    <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                      <span className="font-medium text-gray-800">
                        {stu.studentName}
                      </span>
                    </td>
                    {/* 학번 */}
                    <td
                      className="px-4 py-3 sticky bg-inherit z-10"
                      style={{ left: NAME_COL_W }}
                    >
                      <span className="text-gray-600">{stu.studentNo}</span>
                    </td>
                    {/* 총점 */}
                    <td
                      className="px-4 py-3 text-center sticky bg-inherit z-10"
                      style={{ left: NAME_COL_W + STUNO_COL_W }}
                    >
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                        <span className="text-blue-700 font-semibold">
                          {totalObtainedScore}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-emerald-700 font-semibold">
                          {totalMaxPoints}
                        </span>
                      </div>
                    </td>

                    {/* 문제 셀들 */}
                    {visibleScores.map((data, localIdx) => {
                      const globalIdx = startIdx + localIdx;
                      const cellKey = `${stu.studentId}-${globalIdx}`;
                      const isExpanded = expandedCells.has(cellKey);
                      const hasMultipleSubmissions =
                        data.submissions.length > 1;
                      const latestSubmission = data.submissions[0];

                      const colorClassProf =
                        latestSubmission?.profScore == null
                          ? "text-gray-300"
                          : latestSubmission.profScore >= 9
                          ? "text-green-600"
                          : latestSubmission.profScore >= 5
                          ? "text-yellow-600"
                          : "text-red-600";

                      const colorClassAI =
                        latestSubmission?.aiScore == null
                          ? "text-gray-300"
                          : latestSubmission.aiScore >= 9
                          ? "text-green-600"
                          : latestSubmission.aiScore >= 5
                          ? "text-yellow-600"
                          : "text-red-600";

                      return (
                        <td
                          key={cellKey}
                          className={`px-2 py-3 text-center ${
                            data.submissions.length > 0
                              ? "cursor-pointer hover:bg-gray-50"
                              : ""
                          }`}
                          onClick={() => {
                            if (data.submissions.length > 0) {
                              handleProblemCellClick(
                                stu.studentId,
                                data.problemId
                              );
                            }
                          }}
                          title={
                            data.submissions.length > 0
                              ? "클릭하여 채점 페이지로 이동"
                              : undefined
                          }
                        >
                          {data.submissions.length === 0 ? (
                            <div className="text-gray-300 font-bold">-</div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center justify-center gap-1">
                                <span
                                  className={`text-base font-bold ${colorClassProf}`}
                                >
                                  {latestSubmission.profScore ?? "-"}
                                </span>
                                <span className="text-gray-400">/</span>
                                <span
                                  className={`text-base font-bold ${colorClassAI}`}
                                >
                                  {latestSubmission.aiScore ?? "-"}
                                </span>
                              </div>

                              {hasMultipleSubmissions && (
                                <>
                                  <button
                                    onClick={(e) =>
                                      toggleExpanded(
                                        stu.studentId,
                                        globalIdx,
                                        e
                                      )
                                    }
                                    className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline z-10"
                                  >
                                    {isExpanded
                                      ? "접기 ▲"
                                      : `이전 제출 ${
                                          data.submissions.length - 1
                                        }건 보기 ▼`}
                                  </button>

                                  {isExpanded && (
                                    <div className="w-full mt-1 pt-2 border-t border-gray-200 space-y-1 text-left">
                                      {data.submissions
                                        .slice(1)
                                        .map((sub, idx) => (
                                          <div
                                            key={sub.submissionId}
                                            className="flex items-center justify-between text-[11px] bg-gray-50 px-2 py-1 rounded"
                                          >
                                            <span className="text-gray-500">
                                              {idx + 2}차 •{" "}
                                              {new Date(
                                                sub.submittedAt
                                              ).toLocaleString("ko-KR", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                            <div className="flex items-center gap-1">
                                              <span
                                                className={
                                                  sub.profScore != null
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
                                              <span className="text-gray-400">
                                                /
                                              </span>
                                              <span
                                                className={
                                                  sub.aiScore != null
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

                    {/* 상태 원 */}
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-10 h-10 rounded-full border-2 grid place-items-center
                          ${
                            visibleScores.some(
                              (d) => d.submissions.length > 0
                            ) &&
                            visibleScores.every((d) =>
                              d.submissions.length === 0
                                ? true
                                : d.submissions[0].profScore !== null
                            )
                              ? "bg-emerald-500 border-emerald-600"
                              : visibleScores.some(
                                  (d) =>
                                    d.submissions.length > 0 &&
                                    d.submissions[0].profScore !== null
                                )
                              ? "bg-amber-500 border-amber-600"
                              : "bg-gray-300 border-gray-400"
                          }`}
                          title={
                            visibleScores.some(
                              (d) => d.submissions.length > 0
                            ) &&
                            visibleScores.every((d) =>
                              d.submissions.length === 0
                                ? true
                                : d.submissions[0].profScore !== null
                            )
                              ? "완료"
                              : visibleScores.some(
                                  (d) =>
                                    d.submissions.length > 0 &&
                                    d.submissions[0].profScore !== null
                                )
                              ? "검토중"
                              : "대기"
                          }
                        >
                          {visibleScores.some(
                            (d) => d.submissions.length > 0
                          ) &&
                            visibleScores.every((d) =>
                              d.submissions.length === 0
                                ? true
                                : d.submissions[0].profScore !== null
                            ) && (
                              <span className="text-white text-lg font-bold">
                                ✓
                              </span>
                            )}
                          {visibleScores.some(
                            (d) =>
                              d.submissions.length > 0 &&
                              d.submissions[0].profScore !== null
                          ) &&
                            !(
                              visibleScores.some(
                                (d) => d.submissions.length > 0
                              ) &&
                              visibleScores.every((d) =>
                                d.submissions.length === 0
                                  ? true
                                  : d.submissions[0].profScore !== null
                              )
                            ) && (
                              <span className="text-white text-lg font-bold">
                                !
                              </span>
                            )}
                        </div>
                        <span className="text-[11px] text-gray-600">
                          {visibleScores.some(
                            (d) => d.submissions.length > 0
                          ) &&
                          visibleScores.every((d) =>
                            d.submissions.length === 0
                              ? true
                              : d.submissions[0].profScore !== null
                          )
                            ? "완료"
                            : visibleScores.some(
                                (d) =>
                                  d.submissions.length > 0 &&
                                  d.submissions[0].profScore !== null
                              )
                            ? "검토중"
                            : "대기"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 제출 학생 없을 때 */}
      {students.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400 text-lg">
          제출한 학생이 없습니다.
        </div>
      )}

      {/* 결시생 섹션 */}
      {/* {absentStudents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">결시생</h2>
          <div className="rounded-2xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-rose-50 text-rose-800">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">이름</th>
                  <th className="px-4 py-3 text-left">학번</th>
                  <th className="px-4 py-3 text-center">출결상황</th>
                  <th className="px-4 py-3 text-center">채점</th>
                </tr>
              </thead>
              <tbody>
                {absentStudents.map((student) => {
                  const isGraded = gradedAbsentStudents.has(student.userId);
                  return (
                    <tr key={student.userId} className="border-b">
                      <td className="px-4 py-3">
                        <span className="text-base font-medium text-gray-800">
                          {student.userName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">
                          {student.studentNo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {isGraded ? (
                            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">
                              0점 처리
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full font-semibold text-xs">
                              결시
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {isGraded ? (
                            <div className="text-center">
                              <span className="text-lg font-bold text-blue-600">
                                0
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleGradeAbsentStudent(student.userId)
                              }
                              className="px-4 py-2 rounded-lg font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
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
      )} */}

      {/* 토스트 */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold text-base animate-in fade-in slide-in-from-bottom-5 duration-300">
            ✓ {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
