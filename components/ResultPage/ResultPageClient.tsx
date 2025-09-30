"use client";
// 채점 기능 관련, 현재 목데이터로 진행중.

import { useEffect, useState, useCallback } from "react";
import { workbook_api, group_api, chating_ai,problem_ref_api } from "@/lib/api";
import { motion } from "framer-motion";
import CodeLogReplay, { CodeLog } from "@/components/ResultPage/CodeLogReplay";
import {
  code_log_api,
  problem_api,
  solve_api,
  ai_feedback_api,
  auth_api,
} from "@/lib/api";
import type { ProblemDetail } from "@/lib/api";
import ResultPageProblemDetail from "./ResultPageProblemDetail";
// import { ProblemDetail } from "../ProblemPage/ProblemModal/ProblemSelectorModal"
import { useRouter } from "next/navigation";

// 시험 모드 isExamMode 로 시험모드 상태관리 가능
// import { useExamMode } from "@/hooks/useExamMode"

// ❌시험 모드 관련 임시 더미데이터 -> 총점, 조건 별 점수, 교수 피드백
// import { feedbackDummy } from "@/data/examModeFeedbackDummy"
import ReactMarkdown from "react-markdown";
//import AnswerRenderer from "@/components/ResultPage/AnswerRenderer"
import AnswerRenderer from "@/components/MyRegisteredProblemPage/View/AnswerRenderer";

interface SolveData {
  problemType: string;
  solve_id: number;
  user_id: string;
  group_id: number;
  group_name: string;
  workbook_id: number;
  workbook_name: string;
  problem_id: number;
  problem_name: string;
  submitted_code: string;
  code_language: string;
  code_len: number;
  result: boolean;
  passed: boolean;
  timestamp: string;
  rating_mode: string;
  test_cases: any[];
  test_results: any[];
  overall_status: string;
  execution_time: number;
  condition_check_results: {
    condition: string;
    is_required: boolean;
    check_type: string;
    description: string;
    passed: boolean;
    feedback: string;
  }[];
  ai_feedback: string;
  test_success_rate: number;
  condition_success_rate: number;
  passed_count?: number;
  total_count?: number;
  success_rate?: number;
}

interface ConditionResult {
  id: number;
  condition: string;
  is_required: boolean;
  check_type: string;
  description: string;
  passed: boolean;
  feedback: string;
  status: "pass" | "fail";
}

export default function FeedbackWithSubmissionPageClient({
  params,
}: {
  params: {
    groupId: string;
    examId: string;
    problemId: string;
    resultId: string;
  };
}) {
  const [groupLabel, setGroupLabel] = useState<string>("");
  const [workbookLabel, setWorkbookLabel] = useState<string>("");
  const [problemLabel, setProblemLabel] = useState<string>("");
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [copySuspicion, setCopySuspicion] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [problemDetail, setProblemDetail] = useState<ProblemDetail | null>(
    null
  );
  const [codeLogs, setCodeLogs] = useState<CodeLog[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAILoaded, setIsAILoaded] = useState(false);
  const [solveData, setSolveData] = useState<SolveData | null>(null);
  const [conditionResults, setConditionResults] = useState<ConditionResult[]>(
    []
  );
  type ChatRole = "user" | "assistant";
  interface ChatMessage {
    role: ChatRole;
    content: string;
    ts: number;
  }

  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "추가로 궁금한 거 질문해줘!",
      ts: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const sendFollowup = useCallback(async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    // 1) 유저 메시지 추가
    setChatMsgs((prev) => [
      ...prev,
      { role: "user", content: msg, ts: Date.now() },
    ]);
    setChatInput("");
    setChatLoading(true);

    try {
      // 2) 실제 서버 호출 (path param은 페이지 params에서 그대로 가져와 숫자로 변환)
      const gid = Number(params.groupId);
      const wid = Number(params.examId);
      const pid = Number(params.problemId);
      const sid = Number(params.resultId);

      const { context_ai_ans } = await chating_ai.ask(gid, wid, pid, sid, msg);

      // 3) 서버 응답을 어시스턴트 메시지로 추가
      setChatMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          content: context_ai_ans ?? "(빈 응답)",
          ts: Date.now(),
        },
      ]);
    } catch (err: any) {
      // 4) 에러도 채팅 거품으로 보여주면 UX가 좋아
      const fallback =
        (typeof err?.message === "string" && err.message) ||
        "AI 응답을 가져오지 못했어. 잠시 후 다시 시도해줘.";
      setChatMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ ${fallback}`,
          ts: Date.now(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [
    chatInput,
    chatLoading,
    params.groupId,
    params.examId,
    params.problemId,
    params.resultId,
  ]);

  const DISABLE_PROF = true; //제거해
  const DISABLE_DEV = true; //지워 제거해

  const [isConditionLoaded, setIsConditionLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "prof" | "dev">("ai");
  // 추가: 탭 내 텍스트 입력 상태 (필요 최소만)
  const [profMsg, setProfMsg] = useState("");
  const [devMsg, setDevMsg] = useState("");
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();
  // const { isExamMode } = useExamMode()

  // ❌ 시험모드 더미데이터 총점, 각 조건별 최대 배점과 획득 점수 정보 배열, Markdown 형식 교수 피드백 - 홍
  // const { totalScore, maxScore, professorFeedback: dummyProfessorFeedback } = feedbackDummy
  // const { conditionScores } = feedbackDummy
  const [isExamMode, setIsExamMode] = useState<boolean>(false);
  // AI 피드백 가져오기
  useEffect(() => {
    const fetchAiFeedback = async () => {
      try {
        const res = await ai_feedback_api.get_ai_feedback(
          Number(params.resultId)
        );
        setAiFeedback(res.feedback);
        setIsAILoaded(true);
      } catch (error) {
        console.error("AI 피드백 가져오기 실패:", error);
        // solveData에서 AI 피드백을 사용하는 경우를 대비
        setIsAILoaded(true);
      }
    };

    fetchAiFeedback();
  }, [params.resultId]);

  const fetchProblem = useCallback(async () => {
    try {
      const res = await problem_api
        .problem_get_by_id_group(
          Number(params.groupId),
          Number(params.examId),
          Number(params.problemId)
        )
        .then(setProblemDetail);
      logGet("problem_get_by_id_group", res);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [params.groupId, params.examId, params.problemId]);

  const logGet = (label: string, data: unknown) => {
    console.groupCollapsed(`📥 GET ${label}`);
    console.log("payload:", data);
    console.groupEnd();
  };

  // 현재 에러
  // 코딩, 디버깅, 객관, => 404
  // 단답, 주관 => 500
  const fetchSolve = useCallback(async () => {
    try {
      const res = await solve_api.solve_get_by_solve_id(
        Number(params.resultId)
      );
      setSolveData(res);
      console.log(res);
      logGet(`solve_get_by_solve_id(${params.resultId})`, res);
      // AI 피드백이 solveData에 포함되어 있다면 사용
      if (res.ai_feedback && !aiFeedback) {
        setAiFeedback(res.ai_feedback);
        setIsAILoaded(true);
      }

      // 조건 검사 결과 처리
      if (
        res.condition_check_results &&
        res.condition_check_results.length > 0
      ) {
        // condition_check_results 상세 정보 활용
        const conditionCheckResults = res.condition_check_results.map(
          (conditionResult: any, index: number) => ({
            id: index + 1,
            condition: conditionResult.condition || `조건 ${index + 1}`,
            is_required: conditionResult.is_required || false,
            check_type: conditionResult.check_type || "unknown",
            description: conditionResult.description || "",
            passed: conditionResult.passed || false,
            feedback: conditionResult.feedback || "",
            status: conditionResult.passed
              ? ("pass" as const)
              : ("fail" as const),
          })
        );
        setConditionResults(conditionCheckResults);
        setIsConditionLoaded(true);
      } else if (
        problemDetail &&
        problemDetail.problem_condition &&
        problemDetail.problem_condition.length > 0
      ) {
        // problem_condition을 기반으로 조건 결과 생성
        const problemConditionResults = problemDetail.problem_condition.map(
          (condition: string, index: number) => ({
            id: index + 1,
            condition,
            is_required: true,
            check_type: "problem_requirement",
            description: "문제에서 요구하는 조건입니다",
            passed: res.passed || false, // 전체 통과 여부를 기반으로 설정
            feedback: res.passed
              ? "조건을 만족했습니다."
              : "조건을 확인해주세요.",
            status: res.passed ? ("pass" as const) : ("fail" as const),
          })
        );
        setConditionResults(problemConditionResults);
        setIsConditionLoaded(true);
      } else {
        // 조건이 없으면 빈 배열로 설정
        setConditionResults([]);
        setIsConditionLoaded(true);
      }
    } catch (error) {
      console.error("제출 기록 불러오기 중 오류 발생:", error);
      setIsConditionLoaded(true);
    }
  }, [params.resultId]);

  const fetchCodeLogs = useCallback(async () => {
    try {
      const res = await code_log_api.code_logs_get_by_solve_id(
        Number(params.resultId)
      );
      // res: { copy_suspicion: boolean; logs: { code: string; timestamp: string }[] }

      // CodeLogReplay가 기대하는 타입으로 세팅
      const mapped: CodeLog[] = (res?.logs ?? []).map((l, idx) => ({
        id: idx + 1, // ✅ 필수 필드 추가
        code: l.code,
        timestamp: l.timestamp,
      }));
      setCodeLogs(mapped);
      setCopySuspicion(!!res?.copy_suspicion);

      if (res?.copy_suspicion) {
        setShowCopyModal(true); // ⚠️ 여기서 모달 오픈
      }

      logGet(`code_logs_get_by_solve_id(${params.resultId})`, res);
    } catch (error) {
      console.error("코드 로그 불러오기 중 오류 발생:", error);
    }
  }, [params.resultId]);

  const [orderedProblemIds, setOrderedProblemIds] = useState<number[]>([]);
  const [curIdx, setCurIdx] = useState<number>(-1);
  const goToPrevProblemForSolve = useCallback(() => {
    if (curIdx > 0 && orderedProblemIds.length > 0) {
      const prevProblemId = orderedProblemIds[curIdx - 1];
      const lang = solveData?.code_language?.toLowerCase() || "";
      const qs = lang ? `?language=${encodeURIComponent(lang)}` : "";
      router.push(
        `/mygroups/${params.groupId}/exams/${params.examId}/problems/${prevProblemId}/write${qs}`
      );
      return;
    }
    alert("이전 문제가 없거나 접근 권한이 없어.");
  }, [
    curIdx,
    orderedProblemIds,
    params.groupId,
    params.examId,
    solveData?.code_language,
    router,
  ]);

  const goToNextProblemForSolve = useCallback(() => {
    if (
      curIdx >= 0 &&
      orderedProblemIds.length > 0 &&
      curIdx < orderedProblemIds.length - 1
    ) {
      const nextProblemId = orderedProblemIds[curIdx + 1];
      const lang = solveData?.code_language?.toLowerCase() || "";
      const qs = lang ? `?language=${encodeURIComponent(lang)}` : "";
      router.push(
        `/mygroups/${params.groupId}/exams/${params.examId}/problems/${nextProblemId}/write${qs}`
      );
      return;
    }
    alert("다음 문제가 없거나 접근 권한이 없어.");
  }, [
    curIdx,
    orderedProblemIds,
    params.groupId,
    params.examId,
    solveData?.code_language,
    router,
  ]);

  // 사용자 정보 가져오기
  const fetchUserId = useCallback(async () => {
    try {
      console.log("사용자 정보 조회 시작");
      const user = await auth_api.getUser();
      console.log("사용자 정보:", user);
      setUserId(user.user_id);
    } catch (error) {
      console.error("사용자 아이디 불러오기 실패:", error);
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ✅ 이 한 방으로 해당 시험지(워크북)의 문제 목록 전부 획득
        const refs = await problem_ref_api.problem_ref_get(
          Number(params.groupId),
          Number(params.examId)
        );

        // 응답 스키마: { problem_id, title, ... }[]
        // 별도 order 필드 없으면, 온 순서대로 사용
        const ids = refs.map((r) => Number(r.problem_id));

        const curId = Number(params.problemId);
        const idx = ids.indexOf(curId);

        if (!cancelled) {
          setOrderedProblemIds(ids);
          setCurIdx(idx);
          setCanPrev(idx > 0);
          setCanNext(idx >= 0 && idx < ids.length - 1);
        }
      } catch (e) {
        console.error("문제 목록 로드 실패:", e);
        // 실패 시엔 버튼 비활성 처리
        if (!cancelled) {
          setOrderedProblemIds([]);
          setCurIdx(-1);
          setCanPrev(false);
          setCanNext(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.groupId, params.examId, params.problemId]);
  useEffect(() => {
    (async () => {
      await fetchProblem();
      await fetchSolve();
      await fetchCodeLogs();
    })();
  }, [fetchProblem, fetchSolve, fetchCodeLogs]);

  // 컴포넌트 마운트시 사용자 정보 먼저 가져오기
  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  // 사용자 정보 로드 후 댓글 가져오기

  // activeTab 변경시에만 댓글 새로고침
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) 그룹명
      const gName =
        solveData?.group_name?.trim() ||
        (await (async () => {
          try {
            const g = await group_api.group_get_by_id(Number(params.groupId));
            return g?.group_name || "";
          } catch {
            return "";
          }
        })()) ||
        String(params.groupId);

      // 2) 문제지명(워크북)
      const wName =
        solveData?.workbook_name?.trim() ||
        (await (async () => {
          try {
            const wb = await workbook_api.workbook_get_by_id(
              Number(params.examId)
            );
            // 백엔드 스키마에 따라 workbook_name 또는 name 등으로 올 수 있음
            return wb?.workbook_name || wb?.name || "";
          } catch {
            return "";
          }
        })()) ||
        String(params.examId);

      // 3) 문제명
      const pName =
        solveData?.problem_name?.trim() ||
        problemDetail?.title?.trim() ||
        String(params.problemId);

      if (!cancelled) {
        setGroupLabel(gName);
        setWorkbookLabel(wName);
        setProblemLabel(pName);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    solveData,
    problemDetail,
    params.groupId,
    params.examId,
    params.problemId,
  ]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([fetchProblem(), fetchSolve(), fetchCodeLogs()]);
      } finally {
        if (!cancelled) setIsLoaded(true); // 어떤 API가 실패해도 페이지는 뜨게
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchProblem, fetchSolve, fetchCodeLogs]);
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 문제지(=시험지) 상세 조회
        const wb = await workbook_api.workbook_get_by_id(Number(params.examId));

        if (cancelled) return;

        const exam = wb; // 백엔드 응답 스키마가 { ... } 또는 { workbook: {...} } 일 수도 있는데
        // 지금 네 api.ts 정의상 바로 workbook 객체를 리턴한다고 가정

        const testMode = !!exam?.is_test_mode;
        setIsExamMode(testMode);

        // (선택) 시험 시간창 체크: now가 test_start_time~test_end_time 사이인지
        if (testMode && exam?.test_start_time && exam?.test_end_time) {
          const now = new Date();
          const start = new Date(exam.test_start_time);
          const end = new Date(exam.test_end_time);
        }
      } catch (e) {
        console.error("workbook 정보 조회 실패:", e);
        setIsExamMode(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.examId]);
  // 댓글 전송 핸들러

  // 긴 문자열을 줄 바꿈하는 함수

  if (!isLoaded) {
    return (
      <motion.div
        className="w-full min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">
          문제를 불러오는 중입니다...
        </h1>
      </motion.div>
    );
  }

  function renderCodeOrText(value: any) {
    if (value == null) return null;

    // 문자열이면 그대로
    if (typeof value === "string")
      return (
        <pre>
          <code>{value}</code>
        </pre>
      );

    // 배열이면 각 항목 처리
    if (Array.isArray(value)) {
      return value.map((v, i) => (
        <pre key={i}>
          <code>
            {typeof v === "string" ? v : v?.code ?? JSON.stringify(v)}
          </code>
        </pre>
      ));
    }

    // 객체에 code 필드가 있으면 그걸 사용
    if (typeof value === "object" && "code" in value) {
      return (
        <pre>
          <code>{value.code}</code>
        </pre>
      );
    }

    // 최후의 안전장치
    return <span>{String(value)}</span>;
  }
  // 컴포넌트 안에 헬퍼 추가
  function toMarkdownText(val: any): string {
    if (val == null) return "AI 피드백이 없습니다.";
    if (typeof val === "string") return val;

    // { language, code } 형태 처리
    if (typeof val === "object") {
      const lang = val.language || val.lang || "";
      const code = val.code || val.text || "";
      if (code) {
        // 코드펜스로 감싸서 Markdown으로 렌더
        return `\`\`\`${lang}\n${code}\n\`\`\``;
      }
      return JSON.stringify(val); // 최후의 안전장치
    }

    return String(val);
  }
  const aiMd = toMarkdownText(
    activeTab === "ai" ? aiFeedback || solveData?.ai_feedback : ""
  );
  //AI피드백콘솔
  // console.log(
  //   "aiFeedback typeof/value",
  //   typeof (aiFeedback ?? solveData?.ai_feedback),
  //   aiFeedback ?? solveData?.ai_feedback
  // );

  return (
    <div className="flex min-h-screen">
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2 mt-8">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <span className="text-xl">📓</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              문제{" "}
              {solveData?.problem_name || solveData?.problem_id || "PY31-0001"}{" "}
              문제의 피드백
            </h1>
          </div>
          {/* === 붙여넣기 의심 모달 === */}
          {showCopyModal && (
            <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      붙여넣기 의심 감지
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      이번 제출 과정에서 비정상적인 대량 편집/붙여넣기 패턴이
                      감지됐어. 필요시 조교/담당자가 검토할 수 있어.
                    </p>
                    {copySuspicion && (
                      <p className="mt-2 text-xs text-gray-500">
                        (세부: copy_suspicion = true)
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setShowCopyModal(false)}
                    className="px-4 py-2 rounded-lg bg-mygreen text-white hover:bg-mydarkgreen"
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            </div>
          )}
          {/* 문제 상세 정보 */}
          {problemDetail && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="mt-6">
                <h2 className="text-lg font-bold mb-2">문제 상세보기</h2>
                {/* <ProblemDetailRenderer problem={problemDetail} /> */}
              </div>
              <ResultPageProblemDetail problem={problemDetail} />
            </motion.div>
          )}

          <div className="flex items-center gap-4 ml-2">
            {/* <span className="text-sm text-gray-600">🔥 열심히다.</span> */}
            {/* {isExamMode && (
							<span className="text-sm text-gray-600">
								✔️ 점수: {totalScore}/{maxScore}점
							</span>
						)} */}
            {solveData && (
              <>
                <span
                  className={`text-sm font-bold ${
                    solveData.passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {solveData.passed ? "🟢 맞았습니다" : "🔴 틀렸습니다"}
                </span>
                {/* <span className="text-sm text-gray-500">
									언어: {solveData.code_language} | 길이: {solveData.code_len}자
								</span>
								{solveData.execution_time && (
									<span className="text-sm text-gray-500">실행시간: {solveData.execution_time}ms</span>
								)} */}
              </>
            )}
          </div>
        </motion.div>
        {/* 레이아웃 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 사용자가 작성한 답안 */}
          {/* 코딩, 디버깅 문제일 때 코드 랜더링 */}
          {problemDetail?.problemType === "코딩" ||
          problemDetail?.problemType === "디버깅" ? (
            <motion.div
              className="bg-white rounded-lg shadow-sm border p-4 h-[600px] flex flex-col min-h-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex-1 min-h-0 overflow-auto overflow-x-auto rounded-md">
                <CodeLogReplay codeLogs={codeLogs} idx={0} />
              </div>
            </motion.div>
          ) : (
            // 객관식, 주관식, 단답형 문제일 때
            <motion.div
              className="bg-white rounded-lg shadow-sm border p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <AnswerRenderer problem={problemDetail!} solveData={solveData!} />
            </motion.div>
          )}
          {/* 오른쪽: 조건 및 AI 피드백 조건 뜨는 창*/}
          <div className="space-y-6 h-[600px] flex flex-col min-h-0">
            {/* 조건 검사 결과 섹션 - 높이 확장 */}
            <motion.div
              className="bg-white rounded-lg shadow-sm border flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">조건 검사 결과</h3>
                {solveData && (
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {solveData.condition_success_rate !== undefined && (
                      <span className="text-sm text-gray-600">
                        조건 성공률:{" "}
                        {Math.round(solveData.condition_success_rate * 100)}%
                      </span>
                    )}
                    {solveData.success_rate !== undefined && (
                      <span className="text-sm text-gray-600">
                        전체 성공률: {Math.round(solveData.success_rate * 100)}%
                      </span>
                    )}
                    {solveData.passed_count !== undefined &&
                      solveData.total_count !== undefined && (
                        <span className="text-sm text-gray-600">
                          통과: {solveData.passed_count}/{solveData.total_count}
                        </span>
                      )}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        solveData.overall_status === "all_passed" ||
                        solveData.overall_status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {solveData.overall_status}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {!isConditionLoaded ? (
                  // 조건 로딩 중
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          조건 검사 결과를 불러오는 중...
                        </p>
                        <p className="text-xs mt-1">잠시만 기다려주세요.</p>
                      </div>
                    </div>
                  </div>
                ) : conditionResults.length === 0 ? (
                  // 조건이 없을 때
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <p className="text-sm">조건 검사 결과가 없습니다.</p>
                      <p className="text-xs mt-1">
                        코드가 실행되지 않았거나 조건이 설정되지 않았습니다.
                      </p>
                    </div>
                  </div>
                ) : (
                  // 조건 목록
                  conditionResults.map((condition) => (
                    <motion.div
                      key={condition.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        condition.status === "pass"
                          ? "bg-green-50 border-l-green-500 border border-green-200"
                          : "bg-red-50 border-l-red-500 border border-red-200"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: condition.id * 0.1 }}
                    >
                      {/* 조건 헤더 */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800 text-base">
                              조건 {condition.id}
                            </h4>
                            {condition.is_required && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                필수
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {condition.check_type}
                            </span>
                          </div>
                          <p className="font-medium text-gray-700 text-sm">
                            {condition.condition}
                          </p>
                        </div>
                        {/* 오른쪽: 점수 / 아이콘 */}
                        <div className="ml-3 text-right">
                          {/* 이 3/5 부분은 시험모드일 때만 뜨도록 해야됨 - 홍 */}
                          {/* {isExamMode && <div className="text-xs font-medium mb-1">3/5점</div>} */}
                          {/* pass/fail 아이콘 */}
                          {condition.status === "pass" ? (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">✗</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 조건 설명 */}
                      {condition.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            📋 {condition.description}
                          </p>
                        </div>
                      )}

                      {/* AI 피드백 */}
                      {condition.feedback && (
                        <div
                          className={`p-3 rounded-lg ${
                            condition.status === "pass"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-base">💬</span>
                            <p className="text-sm font-medium leading-relaxed">
                              {condition.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
        {/* === 하단: AI 피드백/교수님/개발자 탭 === */}
        <motion.div
          className="mt-6 bg-white rounded-lg shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {/* 탭 헤더 */}
          <div className="border-b">
            <div className="flex items-center gap-0">
              {/* 왼쪽 묶음: AI / 교수님 */}
              <div className="flex">
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "ai"
                      ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("ai")}
                >
                  AI 피드백
                </button>

                {/* <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "prof"
                      ? "text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("prof")}
                >
                  교수님께 질문하기
                </button> */}

                <button //제거해 지울 것
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "prof"
                      ? "text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50"
                      : "text-gray-500"
                  } ${
                    DISABLE_PROF
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:text-gray-700"
                  }`}
                  disabled={DISABLE_PROF}
                  aria-disabled={DISABLE_PROF}
                  onClick={() => !DISABLE_PROF && setActiveTab("prof")}
                  title={
                    DISABLE_PROF ? "지금은 이 탭을 사용할 수 없어" : undefined
                  }
                >
                  교수님께 질문하기
                </button>
              </div>

              {/* 오른쪽 단독: 개발자에게 물어보기 */}
              {/* <button
                className={`ml-auto px-6 py-3 text-sm font-medium inline-flex items-center gap-2 ${
                  activeTab === "dev"
                    ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("dev")}
                title="개발자에게 물어보기"
              >
                오류 보고 <span aria-hidden>🔧</span>
              </button> */}

              <button
                className={`ml-auto px-6 py-3 text-sm font-medium inline-flex items-center gap-2 ${
                  activeTab === "dev"
                    ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                    : "text-gray-500"
                } ${
                  DISABLE_DEV
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : "hover:text-gray-700"
                }`}
                disabled={DISABLE_DEV}
                aria-disabled={DISABLE_DEV}
                onClick={() => !DISABLE_DEV && setActiveTab("dev")}
                title={
                  DISABLE_DEV
                    ? "지금은 이 탭을 사용할 수 없어"
                    : "개발자에게 물어보기"
                }
              >
                오류 보고 <span aria-hidden>🔧</span>
              </button>
            </div>
          </div>

          {/* 탭 본문 */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {/* 1) AI 피드백 */}
            {activeTab === "ai" && (
              <div className="rounded-xl border bg-white overflow-hidden">
                {/* 헤더 */}
                <div className="px-4 py-3 border-b bg-green-100">
                  <h3 className="font-semibold text-green-800">AI 피드백</h3>
                </div>

                {/* 본문 */}
                <div className="p-4">
                  {!isAILoaded ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm">
                        AI 피드백을 불러오는 중...
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* 원본 AI 피드백 마크다운 */}
                      <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap break-words">
                        <ReactMarkdown>{aiMd}</ReactMarkdown>
                      </div>

                      {/* === 추가: 채팅형 추가 질문=== */}
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          AI에게 추가로 물어보기
                        </h4>

                        {/* 메시지 리스트 */}
                        <div className="max-h-56 overflow-y-auto rounded-md border p-3 space-y-2 bg-gray-50">
                          {chatMsgs.map((m, idx) => (
                            <div
                              key={m.ts + idx}
                              className={`flex ${
                                m.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`px-3 py-2 rounded-2xl text-sm shadow ${
                                  m.role === "user"
                                    ? "bg-mygreen text-white rounded-br-sm"
                                    : "bg-white text-gray-800 border rounded-bl-sm"
                                }`}
                                style={{ maxWidth: "80%" }}
                              >
                                <div
                                  className={`prose prose-sm max-w-none
    ${m.role === "user" ? "prose-invert" : ""}
    prose-pre:whitespace-pre-wrap break-words`}
                                >
                                  <ReactMarkdown
                                    // GFM 쓰려면 아래 라인 켜기

                                    // 링크 새탭, 코드블록 등 커스터마이즈 가능

                                    components={{
                                      // 인라인/블록 코드에 약간의 여백을 주고, 코드블록 내부 줄바꿈 보장
                                      code(props) {
                                        const { children, className, ...rest } =
                                          props;
                                        return (
                                          <code
                                            className={`rounded px-1 ${
                                              className || ""
                                            }`}
                                            {...rest}
                                          >
                                            {children}
                                          </code>
                                        );
                                      },
                                      pre(props) {
                                        const { children, ...rest } = props;
                                        return (
                                          <pre
                                            className="rounded-md p-3 overflow-x-auto"
                                            {...rest}
                                          >
                                            {children}
                                          </pre>
                                        );
                                      },
                                      a(props) {
                                        const { children, ...rest } = props;
                                        return (
                                          <a
                                            {...rest}
                                            className="underline underline-offset-2"
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {children}
                                          </a>
                                        );
                                      },
                                      li(props) {
                                        // 말풍선 폭 좁을 때 리스트 마커 줄바꿈 깔끔하게
                                        const { children, ...rest } = props;
                                        return (
                                          <li {...rest} className="break-words">
                                            {children}
                                          </li>
                                        );
                                      },
                                    }}
                                  >
                                    {m.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          ))}

                          {chatLoading && (
                            <div className="flex justify-start">
                              <div className="px-3 py-2 rounded-2xl text-sm bg-white border text-gray-500">
                                응답 생성 중...
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 입력창 */}
                        <div className="mt-2 flex items-end gap-2">
                          <textarea
                            className="flex-1 h-12 resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-mygreen"
                            placeholder="추가로 궁금한 걸 적어줘"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendFollowup();
                              }
                            }}
                          />
                          <button
                            className="px-4 h-10 rounded-lg shadow text-white bg-mygreen hover:bg-mydarkgreen disabled:bg-gray-300"
                            disabled={chatLoading || !chatInput.trim()}
                            onClick={sendFollowup}
                          >
                            보내기
                          </button>
                        </div>
                      </div>
                      {/* === 추가 끝 === */}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 2) 교수님께 질문하기 */}
            {activeTab === "prof" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  아래에 질문을 작성하면 기본 메일 앱이 열려. (문제/제출 정보는
                  본문에 자동 포함돼)
                </p>
                <textarea
                  className="w-full h-40 resize-none rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-mygreen"
                  placeholder="질문 내용을 자세히 적어줘. (문제 번호, 어떤 입력에서 에러인지, 기대/실제 결과 등)"
                  value={profMsg}
                  onChange={(e) => setProfMsg(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded-lg shadow text-white bg-mygreen hover:bg-mydarkgreen"
                    onClick={() => {
                      const profEmail = ""; // TODO: 교수님 이메일 있으면 채워넣기
                      const subject = `질문: ${problemLabel} (#${params.problemId})`;
                      const body = `${profMsg}

---
문맥정보
- 그룹: ${groupLabel}
- 시험지: ${workbookLabel}
- 문제: ${problemLabel} (#${params.problemId})
- 제출ID: ${params.resultId}
- 사용자ID: ${userId}
- 언어: ${solveData?.code_language ?? "-"}
`;
                      const mailto = `mailto:${profEmail}?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`;
                      window.location.href = mailto;
                    }}
                  >
                    메일 열기
                  </button>
                </div>
              </div>
            )}

            {/* 3) 개발자에게 물어보기 */}
            {activeTab === "dev" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  아래 템플릿을 채우고 <b>복사</b>해서 이슈
                  트래커/슬랙/디스코드에 붙여넣어줘.
                </p>
                <textarea
                  className="w-full h-48 resize-none rounded-md border p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-mygreen"
                  placeholder={`재현 단계:
                      1) ...
                      2) ...
                      기대 결과:
                      실제 결과:
                      에러 메시지/스크린샷:`}
                  value={devMsg}
                  onChange={(e) => setDevMsg(e.target.value)}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="leading-5">
                    <div>
                      문맥: 그룹 {solveData?.group_name ?? params.groupId} /
                      시험지 {solveData?.workbook_name ?? params.examId}
                    </div>
                    <div>
                      문제: {solveData?.problem_name ?? ""} #{params.problemId}{" "}
                      / 제출ID {params.resultId} / 사용자 {userId}
                    </div>
                  </div>
                  <button
                    className="px-3 py-2 rounded-lg shadow text-white bg-mygreen hover:bg-mydarkgreen"
                    onClick={async () => {
                      const payload = `# 버그 리포트

## 요약
(한 줄 요약)

## 재현 단계
${devMsg || "(여기에 재현 단계를 적어줘)"}

## 기대 결과
(기대했던 동작)

## 실제 결과
(실제 관찰한 동작/에러)

## 환경 정보
- 그룹: ${groupLabel}
- 시험지: ${workbookLabel}
- 문제: ${problemLabel} (#${params.problemId})
- 제출ID: ${params.resultId}
- 사용자ID: ${userId}
- 언어: ${solveData?.code_language ?? "-"}
- 브라우저: ${navigator.userAgent}`;
                      try {
                        await navigator.clipboard.writeText(payload);
                        alert(
                          "버그 리포트 템플릿을 복사했어. 이슈/채팅에 붙여넣어줘!"
                        );
                      } catch {
                        const ta = document.createElement("textarea");
                        ta.value = payload;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand("copy");
                        document.body.removeChild(ta);
                        alert("복사 완료!");
                      }
                    }}
                  >
                    템플릿 복사
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            {/* 왼쪽: 이전 문제 */}
            <div className="flex justify-start">
              <button
                className="px-6 py-2 rounded-lg shadow transition-colors text-white
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   bg-mygreen hover:bg-mydarkgreen"
                onClick={goToPrevProblemForSolve}
                disabled={!canPrev}
              >
                이전 문제 가기
              </button>
            </div>

            {/* 중앙: 전체 제출 / 다시 풀기 */}
            <div className="flex justify-center gap-3">
              <button
                className="px-6 py-2 rounded-lg shadow transition-colors text-white
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   bg-mygreen hover:bg-mydarkgreen"
                onClick={() =>
                  router.push(
                    `/mygroups/${params.groupId}/exams/${params.examId}/problems/${params.problemId}/result/`
                  )
                }
              >
                전체 제출 보러가기
              </button>
              <button
                className="px-6 py-2 rounded-lg shadow transition-colors text-white
             disabled:bg-gray-300 disabled:cursor-not-allowed
             bg-mygreen hover:bg-mydarkgreen"
                onClick={() =>
                  router.push(
                    `/mygroups/${params.groupId}/exams/${
                      params.examId
                    }/problems/${params.problemId}/write?solve_id=${
                      params.resultId
                    }&language=${solveData?.code_language?.toLowerCase() || ""}`
                  )
                }
                // 🔒 시험모드면 재도전 금지
                disabled={isExamMode} // 또는 disabled={isExamMode && isInTestWindow}
                title={
                  isExamMode
                    ? "시험 모드에서는 재도전이 비활성화돼."
                    : undefined
                }
              >
                다시 풀러 가기
              </button>
            </div>

            {/* 오른쪽: 다음 문제 */}
            <div className="flex justify-end">
              <button
                className="px-6 py-2 rounded-lg shadow transition-colors text-white
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   bg-mygreen hover:bg-mydarkgreen"
                onClick={goToNextProblemForSolve}
                disabled={!canNext}
              >
                다음 문제 풀기
              </button>
            </div>
          </div>
        </motion.div>
        <div className="h-6" /> {/* 여백 */}
      </div>
    </div>
  );
}
