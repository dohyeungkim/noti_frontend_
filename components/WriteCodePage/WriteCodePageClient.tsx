"use client";
//코드
/** ==================== 8월 9일에 해야될 내용 ====================
 * 코딩 - 가져올 값 없음
 * ✨ 디버깅 - 베이스코드 가져와서 모나코 에디터에 그대로 랜더링
 * 단답형 - 가져올 값 없음
 * 객관식 - 선지 가져와야됨 + 답 인덱스 갯수 가져와서 답 여러개면 복수형 문제라고 알려주고 복수 선택 가능하게 하기 !!
 * 주관식 - 가져올 값 없음
 */
//마크다운 관련
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw"; // (HTML 허용해야 할 때만)
import type { Components } from "react-markdown"; // 커스터마이징할 때만

import { useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  auth_api,
  problem_api, // 디버깅: 베이스 코드,  객관식
  code_log_api,
  solve_api,
  ai_feedback_api,
  run_code_api,
  ProblemType,
  SolveRequest,
} from "@/lib/api";
import type { ProblemDetail } from "@/lib/api";
import type { editor } from "monaco-editor";
// ✅ 전역 로딩 스토어
import { useLoadingStore } from "@/lib/loadingStore";
// 🔥 CHANGE 1: 새로운 PresenceIndicator import 추가
// import { PresenceIndicator } from "./PresenceIndicator";
// ===================== (중요) 전역 템플릿 상수로 이동 =====================
const DEFAULT_TEMPLATES: { [lang: string]: string } = {
  python: "",
  c: "#include<stdio.h>\n\nint main() {\n    return 0;\n}",
  cpp: "#include<iostream>\n\nint main() {\n    return 0;\n}",
  java: "public class Main {\n    public static void main(String[] args) {\n    }\n}",
};
// =======================================================================

// Problem 타입 정의 (확장)
// interface Problem {
// 	// 학생에게 보여주는 핃르들
// 	id: number
// 	title: string
// 	description: string
// 	problem_condition?: string[]
// 	problemType: string
// 	// 학생에게 안 보여지는 필드들
// 	rating_mode?: string
// 	test_cases?: Array<{
// 		input: string
// 		expected_output: string
// 		is_sample: boolean
// 	}>
// }

// TestCase 타입 정의
interface TestCase {
  input: string;
  output: string;
  isSample?: boolean;
}

// RunResult 타입 정의
interface RunResult {
  input: string;
  expected: string;
  output: string;
  passed: boolean;
}

// WriteCodePageClient Props 인터페이스
interface WriteCodePageClientProps {
  params: {
    problemId: string;
    examId: string;
    groupId: string;
    solveId: string; // 추가한거
  };
}

// 🔥 CHANGE 2: 기존 inline PresenceIndicator 컴포넌트 제거 (삭제됨)
// export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ pageId, user }) => {
//   const participantsCount = usePresence(pageId, user)
//   return (
//     <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md text-sm text-gray-700 border border-gray-300">
//       현재 접속 인원: <span className="font-semibold">{participantsCount}</span>명
//     </div>
//   )
// }
// 뱃지 색고정
const PROBLEM_TYPES: { value: ProblemType; label: string; color: string }[] = [
  { value: "코딩", label: "코딩", color: "bg-blue-100 text-blue-800" },
  { value: "디버깅", label: "디버깅", color: "bg-red-100 text-red-800" },
  { value: "객관식", label: "객관식", color: "bg-green-100 text-green-800" },
  { value: "주관식", label: "주관식", color: "bg-purple-100 text-purple-800" },
  { value: "단답형", label: "단답형", color: "bg-yellow-100 text-yellow-800" },
];

// ❌ (버그) 컴포넌트 바깥에서 useRef 사용 금지
// const submittingRef = useRef(false);
// 문제 만들때 설정하는 언어로 열리게끔
const normalizeLang = (raw?: string) => {
  const s = (raw || "").toLowerCase().trim();
  if (s === "c++" || s === "cpp" || s === "g++") return "cpp";
  if (s.startsWith("python")) return "python";
  if (s === "c" || s.startsWith("gcc") || s.startsWith("clang")) return "c";
  if (s.startsWith("java")) return "java";
  return ""; // 모르면 빈값
};
//설정언어로만 제출하게끔
function getExpectedLang(p?: ProblemDetail): string {
  if (!p) return "";
  let backendLang = "";

  // 디버깅: base_code 기준
  if (
    "base_code" in p &&
    Array.isArray((p as any).base_code) &&
    (p as any).base_code.length > 0
  ) {
    backendLang = (p as any).base_code[0]?.language || "";
  }

  // 코딩: reference_codes의 is_main 우선
  if (
    !backendLang &&
    "reference_codes" in p &&
    Array.isArray((p as any).reference_codes) &&
    (p as any).reference_codes.length > 0
  ) {
    const main =
      (p as any).reference_codes.find((c: any) => c.is_main) ||
      (p as any).reference_codes[0];
    backendLang = main?.language || "";
  }

  return normalizeLang(backendLang);
}

const normalizeMultiline = (s: string) => s.replace(/\r\n?/g, "\n");
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function WriteCodePageClient({
  params,
}: WriteCodePageClientProps) {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();
  const workbook_id = Number(params.examId);
  const problem_id = Number(params.problemId);

  // ★ CHANGE: submittingRef는 컴포넌트 내부로 이동
  const submittingRef = useRef(false);

  const [problem, setProblem] = useState<ProblemDetail | undefined>(undefined);
  type BackendProblemType =
    | "coding"
    | "debugging"
    | "multiple_choice"
    | "short_answer"
    | "subjective";
  // const EN_TO_KO: Record<BackendProblemType, ProblemType> = {
  // 	coding: "코딩",
  // 	debugging: "디버깅",
  // 	multiple_choice: "객관식",
  // 	short_answer: "단답형",
  // 	subjective: "주관식",
  // }

  // 문제 유형 플래그
  // 👻❌ solve 쪽은 문제 유형 영어로. 프론트는 한글로

  const isCodingOrDebugging =
    problem?.problemType === "코딩" || problem?.problemType === "디버깅";
  const isMultiple = problem?.problemType === "객관식";
  const isShort = problem?.problemType === "단답형";
  const isSubjective = problem?.problemType === "주관식";

  const [problemConditions, setProblemConditions] = useState<string[]>([]); // 빈 배열로 초기화

  const searchParams = useSearchParams();
  const solveId = searchParams.get("solve_id");
  const queryLanguage = searchParams.get("language");
  // const [problemType, setProblemType] = useState<String>("coding")

  // 언어/코드 초기화 + 로컬 저장
  const languageStorageKey = `NOTI_language_${params.problemId}`;
  //입 출력 예시 샘플
  const [sampleCases, setSampleCases] = useState<TestCase[]>([]);
  // 언어 초기값: 쿼리파라미터 > localStorage > python
  const initialLanguage =
    (typeof window !== "undefined" &&
      (queryLanguage || localStorage.getItem(languageStorageKey))) ||
    "python";
  const [language, setLanguage] = useState(initialLanguage);
  const expectedLang = useMemo(() => getExpectedLang(problem), [problem]);
  const normalizedLang = (language || "").toLowerCase();
  const langMismatch =
    isCodingOrDebugging && !!expectedLang && normalizedLang !== expectedLang;
  // 코드 초기값: localStorage > 템플릿
  const storageKey = `NOTI_code_${initialLanguage}_${params.problemId}`;
  const initialCode =
    (typeof window !== "undefined" && localStorage.getItem(storageKey)) ||
    DEFAULT_TEMPLATES[initialLanguage];
  const [code, setCode] = useState<string>(initialCode);

  // 객관식 문제: 옵션, 복수정답 여부, 선택된 인덱스(단일, 복수)
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [allowMultiple, setAllowMultiple] = useState<boolean>(false);
  const [selectedSingle, setSelectedSingle] = useState<number | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<number[]>([]);

  // 주관식 문제 답
  const [subjectiveAnswer, setSubjectiveAnswer] = useState<string>("");
  // 단답형 문제 답
  const [shortAnswer, setShortAnswer] = useState<string>("");

  // 제출/에러/로그
  const [error, setError] = useState("");
  const [codeLogs, setCodeLogs] = useState<string[]>([]);
  const [timeStamps, setTimeStamps] = useState<string[]>([]);

  // 유저
  const [userId, setUserId] = useState("");
  const [userNickname, setUserNickname] = useState("");

  // 모나코
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { start, stop } = useLoadingStore();

  // ===== 현재 코드 즉시 실행 상태 =====
  const [isRunningCurrent, setIsRunningCurrent] = useState(false);
  const [showCurrentRunPanel, setShowCurrentRunPanel] = useState(false);
  const [currentRun, setCurrentRun] = useState<{
    output: string;
    error?: string;
    time_ms?: number;
    success: boolean;
  } | null>(null);

  // ===== 테스트케이스 실행 상태 =====
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [runResults, setRunResults] = useState<RunResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // ★ CHANGE: 마운트/가시성 상태 추가(하이드레이션 후에만 API 호출)
  const [mounted, setMounted] = useState(false);
  const [pageVisible, setPageVisible] = useState(
    typeof document === "undefined"
      ? false
      : document.visibilityState === "visible"
  );
  useEffect(() => {
    setMounted(true);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // ===== 로컬 저장 동기화 =====
  useEffect(() => {
    if (language) {
      localStorage.setItem(languageStorageKey, language);
    }
  }, [language, params.problemId, languageStorageKey]);

  // 코드가 바뀔 때 localStorage에 저장
  useEffect(() => {
    if (language && params.problemId) {
      localStorage.setItem(`NOTI_code_${language}_${params.problemId}`, code);
    }
  }, [code, language, params.problemId]);

  // ===== 유저 정보 가져오기 =====
  const fetchUser = useCallback(async () => {
    if (userId === "") {
      try {
        const res = await auth_api.getUser();
        setUserId(res.user_id);
        // nickname 속성이 없으므로 username 사용
        setUserNickname(res.username || "사용자");
      } catch (error) {
        console.error("유저 정보를 불러오는 중 오류 발생:", error);
      }
    }
  }, [userId]);

  // ===== 문제 정보 가져오기=====
  // 동일 문제 중복 초기화 방지용 가드
  const initializedRef = useRef<string | null>(null);

  const fetchProblem = useCallback(async () => {
    // ✅ 동일 문제 재초기화 가드
    const key = `${params.groupId}-${params.examId}-${params.problemId}`;
    if (initializedRef.current === key) return;
    initializedRef.current = key;

    try {
      console.log(
        "문제 API 호출 파라미터:",
        params.groupId,
        params.examId,
        params.problemId
      );
      const res = await problem_api.problem_get_by_id_group(
        Number(params.groupId),
        Number(params.examId),
        Number(params.problemId)
      );
      console.log("📋 문제 풀기 페이지 해당 문제 GET Api 응답:", res);
      setProblem(res);

      // =========================== 템플릿/저장/베이스코드 적용 순서 ===========================
      // 1) base_code (디버깅) 우선
      // 2) 저장된 코드(LocalStorage)
      // 3) 템플릿(DEFAULT_TEMPLATES)
      let codeInitialized = false;

      // 1) 디버깅: 베이스 코드가 오면 최우선 적용
      if (
        "base_code" in res &&
        Array.isArray((res as any).base_code) &&
        (res as any).base_code.length > 0 &&
        typeof (res as any).base_code[0]?.code === "string"
      ) {
        setCode((res as any).base_code[0].code);
        codeInitialized = true;
      }

      // 2) 백엔드/쿼리/로컬스토리지 기반 언어 결정
      let backendLang = "";
      // 디버깅: base_code[0].language 우선
      if (
        "base_code" in res &&
        Array.isArray((res as any).base_code) &&
        (res as any).base_code.length > 0
      ) {
        backendLang = (res as any).base_code[0]?.language || "";
      }
      // 코딩: reference_codes의 메인(is_main) 우선
      if (
        !backendLang &&
        "reference_codes" in res &&
        Array.isArray((res as any).reference_codes) &&
        (res as any).reference_codes.length > 0
      ) {
        const main =
          (res as any).reference_codes.find((c: any) => c.is_main) ||
          (res as any).reference_codes[0];
        backendLang = main?.language || "";
      }

      const normBackend = normalizeLang(backendLang);
      const fromQuery = (queryLanguage || "").toLowerCase().trim();
      const fromLS =
        (typeof window !== "undefined" &&
          (localStorage.getItem(languageStorageKey) || "")
            .toLowerCase()
            .trim()) ||
        "";
      const finalLang = fromQuery || normBackend || fromLS || "python";

      if (finalLang && finalLang !== (language || "").toLowerCase()) {
        setLanguage(finalLang);
        if (typeof window !== "undefined") {
          localStorage.setItem(languageStorageKey, finalLang);
        }
      }

      // 3) 저장 코드가 있으면 적용 (아직 코드가 안 정해졌을 때만)
      if (!codeInitialized) {
        const savedKey = `NOTI_code_${finalLang}_${params.problemId}`;
        const savedCode =
          typeof window !== "undefined" ? localStorage.getItem(savedKey) : null;

        if (savedCode !== null && savedCode !== "") {
          setCode(savedCode);
          codeInitialized = true;
        }
      }

      // 4) 템플릿 적용 (여전히 코드가 비어있다면)
      if (!codeInitialized) {
        setCode(DEFAULT_TEMPLATES[finalLang] ?? "");
        codeInitialized = true;
      }
      // ==========================================================================

      // 문제 조건만 설정 (problem_condition 사용)
      if (
        "problem_condition" in res &&
        Array.isArray((res as any).problem_condition) &&
        (res as any).problem_condition.length > 0
      ) {
        setProblemConditions((res as any).problem_condition);
      } else {
        setProblemConditions([]);
      }

      // ========== 디버깅 문제 ==========
      // (덮어쓰기 금지 가드 유지)
      if (
        "base_code" in res &&
        Array.isArray((res as any).base_code) &&
        (res as any).base_code.length > 0
      ) {
        // setCode((res as any).base_code[0].code)  // <-- 덮어쓰기 금지
      } else {
        // setCode("")  // <-- 빈 코드로 덮어쓰기 금지
      }

      let samples: TestCase[] = [];
      if ("test_cases" in res && Array.isArray((res as any).test_cases)) {
        const raw = (res as any).test_cases as Array<any>;
        const sample = raw.filter((tc) => tc.is_sample);
        const base = (sample.length > 0 ? sample : raw).map((tc) => ({
          input: String(tc.input ?? ""),
          output: String(tc.expected_output ?? ""),
          isSample: Boolean(tc.is_sample),
        }));
        samples = base;
      }
      setSampleCases(samples);
      // ✅ 첫 번째 샘플 입력을 기본 테스트 입력으로 세팅
      setTestCases([{ input: samples[0]?.input ?? "", output: "" }]);

      // 객관식
      if (
        "options" in res &&
        "correct_answers" in res &&
        Array.isArray((res as any).options) &&
        Array.isArray((res as any).correct_answers)
      ) {
        setChoiceOptions((res as any).options ?? []);
        const correct = (res as any).correct_answers ?? [];
        setAllowMultiple(correct.length > 1);

        // 초기 선택값 리셋(경고 방지)
        setSelectedSingle(null);
        setSelectedMultiple([]);
      }
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
    // ✅ deps 최소화: defaultTemplates/ language / storageKey 등 제외
  }, [
    params.groupId,
    params.examId,
    params.problemId,
    queryLanguage,
    languageStorageKey,
    language,
  ]);

  // ★ CHANGE: UI가 뜬 뒤(마운트) & 페이지가 보일 때만 API 호출
  useEffect(() => {
    if (!mounted || !pageVisible) return;
    fetchUser();
  }, [mounted, pageVisible, fetchUser]);

  useEffect(() => {
    if (!mounted || !pageVisible) return;
    // ✅ fetchProblem 자체가 아니라 문제 식별자 변화에 따라 호출
    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mounted,
    pageVisible,
    params.groupId,
    params.examId,
    params.problemId,
    queryLanguage,
  ]);

  // useEffect(() => {
  // 	if (solveId) {
  // 		console.log("solveId로 코드 불러오기 시도:", solveId)
  // 		solve_api
  // 			.solve_get_by_problem_ref_id(Number(params.groupId), Number(params.examId), Number(params.problemId))
  // 			.then((res) => {
  // 				console.log("solve_get_by_problem_ref_id 응답:", res)
  // 				setCode(res.submitted_code ?? "")
  // 			})
  // 			.catch((err) => {
  // 				console.error("solve_get_by_problem_ref_id 에러:", err)
  // 			})
  // 	}
  // }, [solveId])

  useEffect(() => {
    if (editorRef.current && code !== editorRef.current.getValue()) {
      editorRef.current.setValue(code);
    }
  }, [code]);

  // ===== 현재 코드 즉시 실행 =====
  const handleRunCurrentCode = async () => {
    if (!isCodingOrDebugging) return;
    if (!problem) {
      alert("문제 정보가 없습니다.");
      return;
    }

    const codeToRun = editorRef.current?.getValue() ?? code;
    if (!codeToRun.trim()) {
      alert("코드를 입력해주세요.");
      return;
    }

    setIsRunningCurrent(true);
    setShowCurrentRunPanel(true);
    setCurrentRun(null);

    try {
      const userCases = Array.isArray(testCases)
        ? testCases
            .filter((tc) => (tc.input ?? "").trim() !== "")
            .map((tc) => ({
              input: normalizeMultiline(tc.input || ""),
              expected_output: "",
            }))
        : [];

      const cases =
        userCases.length > 0 ? userCases : [{ input: "", expected_output: "" }];

      const data = await run_code_api.run_code({
        language,
        code: codeToRun,
        problem_id,
        group_id: Number(groupId),
        workbook_id,
        rating_mode: problem.rating_mode || "default",
        test_cases: cases,
      });

      const outputs: string[] = Array.isArray(data?.results)
        ? data.results.map((r: any) =>
            String(r?.actual_output ?? r?.stdout ?? r?.output ?? "")
          )
        : [String(data?.actual_output ?? data?.stdout ?? data?.output ?? "")];

      const errorText = Array.isArray(data?.results)
        ? data.results
            .map((r: any) => r?.error ?? r?.stderr ?? "")
            .filter(Boolean)
            .join("\n")
        : data?.error ?? data?.stderr ?? "";

      const joinedOutput = outputs.filter(Boolean).join("\n");

      const success =
        typeof data?.success === "boolean"
          ? data.success
          : errorText
          ? false
          : true;

      const time_ms = Array.isArray(data?.results)
        ? data.results[0]?.time_ms
        : data?.time_ms;

      setCurrentRun({
        output: joinedOutput || "",
        error: errorText ? String(errorText) : undefined,
        time_ms: typeof time_ms === "number" ? time_ms : undefined,
        success,
      });
    } catch (err) {
      setCurrentRun({
        output: "",
        error: err instanceof Error ? err.message : String(err),
        success: false,
      });
    } finally {
      setIsRunningCurrent(false);
    }
  };

  // ===== 제출 =====
  const handleSubmit = async () => {
    // 중복 클릭 방지
    if (submittingRef.current) return;

    if (!params.groupId || !params.examId || !params.problemId) {
      alert("❌ 오류: 필요한 값이 없습니다!");
      return;
    }
    if (!problem) {
      alert("문제 정보가 없습니다.");
      return;
    }

    // ✅ 코딩/디버깅에서만 사용할 로그 변수 (기본은 빈 배열)
    let newCodeLogs: string[] = [];
    let newTimeStamps: string[] = [];

    const pType = problem.problemType as SolveRequest["problemType"];
    const normalizedLang = (language || "").toLowerCase();
    let request: SolveRequest;

    switch (pType) {
      case "코딩":
      case "디버깅": {
        if (!code.trim()) {
          alert("코드를 입력해주세요.");
          return;
        }
        if (!normalizedLang) {
          alert("언어를 선택해주세요.");
          return;
        }
        // 🔒 언어 불일치 가드
        if (expectedLang && normalizedLang !== expectedLang) {
          alert(
            `이 문제는 ${expectedLang.toUpperCase()}로만 제출할 수 있어. 현재 선택: ${normalizedLang.toUpperCase()}`
          );
          return;
        }

        request = {
          problemType: pType,
          codes: code,
          code_language: normalizedLang,
        };

        const logs = collectLogs();
        newCodeLogs = logs.newCodeLogs;
        newTimeStamps = logs.newTimeStamps;
        break;
      }

      case "객관식": {
        const selections = allowMultiple
          ? selectedMultiple
          : selectedSingle !== null
          ? [selectedSingle]
          : [];
        if (!selections.length) {
          alert("객관식 답안을 선택해주세요.");
          return;
        }
        request = {
          problemType: pType,
          selected_options: selections,
        };
        break;
      }

      case "단답형": {
        if (!shortAnswer.trim()) {
          alert("단답형 답안을 입력해주세요.");
          return;
        }
        request = {
          problemType: pType,
          answer_text: [shortAnswer],
        };
        break;
      }

      case "주관식": {
        if (!subjectiveAnswer.trim()) {
          alert("주관식 답안을 입력해주세요.");
          return;
        }
        request = {
          problemType: pType,
          written_text: subjectiveAnswer,
        };
        break;
      }

      default: {
        alert("알 수 없는 문제 유형입니다.");
        return;
      }
    }

    // ✅ 로딩 시작 + 중복 클릭 가드 on
    start();
    submittingRef.current = true;

    try {
      const data = await solve_api.solve_create(
        Number(params.groupId),
        Number(params.examId),
        Number(params.problemId),
        userId,
        request
      );

      await code_log_api.code_log_create(
        Number(data.solve_id),
        userId,
        newCodeLogs,
        newTimeStamps
      );

      // 실패해도 무시
      ai_feedback_api.get_ai_feedback(Number(data.solve_id)).catch(() => {});

      // ✅ 성공: 로딩 해제하지 않고 바로 이동(버튼 회색 유지)
      router.push(
        `/mygroups/${groupId}/exams/${params.examId}/problems/${params.problemId}/result/${data.solve_id}`
      );
      // 여기서 setLoading(false)/stop() 호출하지 않음
    } catch (err) {
      // ✅ 실패: 즉시 버튼 풀림
      alert(
        `❌ 제출 오류: ${err instanceof Error ? err.message : String(err)}`
      );
      stop();
      submittingRef.current = false;
    }

    // ❌ finally 블록/딜레이 삭제 (성공 시에는 절대 로딩 풀지 않기!)
  };

  const collectLogs = () => {
    const newCode = editorRef.current?.getValue() || "";
    const newCodeLogs = [...codeLogs, newCode];
    const newTimeStamps = [...timeStamps, new Date().toISOString()];
    setCodeLogs([]);
    setTimeStamps([]);
    return { newCode, newCodeLogs, newTimeStamps };
  };

  // 테스트케이스 실행 관련 상태 (기존 테스트 케이스 실행 코드..)
  // const [testCases, setTestCases] = useState<TestCase[]>([])
  // const [runResults, setRunResults] = useState<RunResult[]>([])
  // const [isTestRunning, setIsTestRunning] = useState(false)

  const handleTestCaseChange = (
    idx: number,
    field: "input" | "output",
    value: string
  ) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === idx ? { ...tc, [field]: value } : tc))
    );
  };

  const addTestCase = () => {
    setTestCases((prev) => [...prev, { input: "", output: "" }]);
  };

  const removeTestCase = (idx: number) =>
    setTestCases((prev) => prev.filter((_, i) => i !== idx));

  const handleTestRun = async () => {
    if (!problem) {
      alert("문제 정보가 없습니다.");
      return;
    }
    if (!code.trim()) {
      alert("코드를 입력해주세요.");
      return;
    }
    if (!Array.isArray(testCases) || testCases.length === 0) {
      alert("테스트케이스를 추가해주세요.");
      return;
    }

    setIsTestRunning(true);
    setRunResults([]);

    try {
      const data = await run_code_api.run_code({
        language: language,
        code: code,
        problem_id,
        group_id: Number(groupId),
        workbook_id,
        rating_mode: problem.rating_mode || "default",
        test_cases: testCases.map((tc) => ({
          // 문자열 그대로(개행만 LF로 통일)
          input: normalizeMultiline(tc.input || ""),
          expected_output: normalizeMultiline(tc.output || ""),
        })),
      });

      // console.log("run_code_api 반환값:", data)

      const results =
        data.results?.map((result: any, index: number) => ({
          input: testCases[index].input,
          expected: testCases[index].output,
          // ✅ diff말고 실제 출력 우선
          output:
            result.actual_output ??
            result.stdout ??
            result.output ?? // (백업으로만 사용)
            "",
          passed: result.passed ?? result.success ?? false,
        })) || [];

      setRunResults(results);
    } catch (err) {
      console.error("run_code_api 에러:", err);
      setRunResults([]);
      // ========== 422 ==========
      alert(
        `테스트 실행 중 오류가 발생했습니다: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsTestRunning(false);
    }
  };

  // 언어 변경 핸들러: 코드도 localStorage에서 복원
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const saved = localStorage.getItem(
      `NOTI_code_${newLang}_${params.problemId}`
    );
    setCode(
      saved !== null && saved !== "" ? saved : DEFAULT_TEMPLATES[newLang]
    );
  };

  // **리사이즈 구현**
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [leftWidth, setLeftWidth] = useState<number>(300);

  // leftWidth 변경 시 Monaco Editor 리사이즈
  useEffect(() => {
    if (editorRef.current) {
      // 즉시 실행 + requestAnimationFrame으로 더 빠르게
      editorRef.current.layout();
      requestAnimationFrame(() => {
        editorRef.current?.layout();
      });
    }
  }, [leftWidth]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    let newWidth = e.clientX - rect.left;

    // 최소/최대 너비 제한
    const minWidth = 400;
    const maxLeftWidth = 800; // 왼쪽 최대 800px
    const minRightWidth = 400; // 오른쪽 최소 400px
    const maxWidth = containerWidth - minRightWidth;

    newWidth = Math.max(
      minWidth,
      Math.min(newWidth, Math.min(maxLeftWidth, maxWidth))
    );
    setLeftWidth(newWidth);

    // Monaco Editor 리사이즈 트리거 (즉시 실행)
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, []);

  const onMouseUp = useCallback(() => {
    isResizing.current = false;
    if (editorRef.current) {
      setTimeout(() => editorRef.current?.layout(), 100);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ===== 전역 단축키: Ctrl/Cmd + Enter → 현재 코드 즉시 실행 =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (isCodingOrDebugging) handleRunCurrentCode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCodingOrDebugging, language, code, problem]);

  if (!problem || !Array.isArray(testCases)) {
    return <div>로딩 중...</div>;
  }

  // 실시간 사용자 현황을 위한 pageId와 user 데이터 생성
  // const pageId = `problem-${params.groupId}-${params.examId}-${params.problemId}`;
  // const currentUser = {
  //   userId: userId,
  //   nickname: userNickname,
  // };

  // ...앞부분 동일

  // 실시간 사용자 현황을 위한 pageId와 user 데이터 생성
  // const pageId = `problem-${params.groupId}-${params.examId}-${params.problemId}`;
  // const currentUser = {
  //   userId: userId,
  //   nickname: userNickname,
  // };

  return !problem ? (
    <div>로딩 중...</div>
  ) : (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* 상단영역: 제출버튼*/}
      <motion.div
        className="flex items-center justify-between px-3 pt-3 mb-6 shrink-0"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* 왼쪽: 문제 제목 (말줄임 처리) + 선택: 유형 배지 */}
        <div className="flex items-center min-w-0 gap-2">
          <h1
            title={problem.title || ""}
            className="text-base md:text-3xl font-semibold text-gray-900 truncate max-w-[60vw]"
          >
            {problem.title || "문제 제목"}
          </h1>

          {/* 문제 유형 배지 — 필요 없으면 이 span 한 줄 삭제해도 됨 */}
          {problem.problemType && (
            <span
              className={`ml-1 inline-flex items-center rounded-full px-2 py-[2px] text-xs font-medium
      ${
        PROBLEM_TYPES.find((t) => t.value === problem.problemType)?.color ||
        "bg-gray-100 text-gray-700"
      }`}
            >
              {problem.problemType}
            </span>
          )}
        </div>

        {/* 오른쪽: 제출 버튼 (기존 그대로) */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleSubmit}
            disabled={submittingRef.current || langMismatch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={
              langMismatch
                ? `이 문제는 ${expectedLang.toUpperCase()}로만 제출 가능해`
                : undefined
            }
            className={`${
              submittingRef.current || langMismatch
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-500"
            } text-white px-16 py-1.5 rounded-xl text-md`}
          >
            {submittingRef.current
              ? "제출 중..."
              : langMismatch
              ? "언어 불일치"
              : "제출하기"}
          </motion.button>
        </div>
      </motion.div>

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}

      {/* 메인: 남은 높이 전부 차지, 배경 스크롤 금지 */}
      <main
  ref={containerRef}
  className="flex flex-1 min-h-0 w-full overflow-hidden mt-2"
>
  {/* ========== 코딩 / 디버깅 / 객관식 : 좌우 분할 ========== */}
  {(isCodingOrDebugging || isMultiple) && (
    <>
      {/* 내부 스크롤만 허용 (왼쪽: 설명/조건/입출력) */}
      <div
        className="overflow-y-auto h-[calc(100%-72px)] p-2 pr-2 flex-none"
        style={{ width: leftWidth }} // ✅ 드래그 폭 적용
      >
        {/* 문제 설명 (Markdown 지원) */}
        {(() => {
          const desc = normalizeMultiline(problem?.description ?? "");

          type MarkdownCodeProps = React.HTMLAttributes<HTMLElement> & {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          };

          const Code = ({
            inline,
            className,
            children,
            ...props
          }: MarkdownCodeProps) => {
            const lang = /language-(\w+)/.exec(className ?? "")?.[1];

            if (inline) {
              return (
                <code className="px-1 py-0.5 rounded bg-gray-100 font-mono text-sm">
                  {children}
                </code>
              );
            }

            return (
              <pre className="p-4 overflow-x-auto bg-gray-50 border border-gray-200 rounded-lg">
                <code
                  className={className ?? (lang ? `language-${lang}` : "")}
                  {...props}
                >
                  {children}
                </code>
              </pre>
            );
          };

          const components: Components = {
            code: Code as unknown as Components["code"],
            table({ children }) {
              return (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full">{children}</table>
                </div>
              );
            },
            a({ children, href, title, rel, target }) {
              return (
                <a
                  href={href}
                  title={title}
                  rel={rel ?? "noopener noreferrer"}
                  target={target ?? "_blank"}
                  className="text-blue-600 underline hover:no-underline"
                >
                  {children}
                </a>
              );
            },
            img({ src, alt, title }) {
              return (
                <img
                  src={src || ""}
                  alt={alt || ""}
                  title={title}
                  className="rounded-lg max-w-full h-auto"
                />
              );
            },
          };

          return (
            <div
              className="editor-content prose prose-slate max-w-none
                prose-headings:font-bold prose-pre:bg-gray-50 prose-pre:border
                prose-pre:border-gray-200 prose-pre:rounded-xl prose-code:text-pink-700
                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                prose-img:rounded-lg mb-6"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                // ⚠️ 신뢰 가능한 컨텐츠일 때만 사용
                rehypePlugins={[rehypeRaw /*, rehypeSanitize*/]}
                components={components}
              >
                {desc}
              </ReactMarkdown>
            </div>
          );
        })()}

        {/* 문제 조건 (코딩/디버깅에서만) */}
        {problemConditions &&
          isCodingOrDebugging &&
          problemConditions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white shadow-md rounded-xl p-4 mb-6 border border-gray-200"
            >
              <h3 className="text-lg font-bold mb-3 text-gray-800">문제 조건</h3>
              <div className="border-t border-gray-300 mb-3"></div>
              <div className="space-y-2">
                {problemConditions.map((condition, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-gray-700 min-w-[20px] mt-0.5">
                      {index + 1}.
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {condition}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        {/* 입력/출력 카드 */}
        {sampleCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white shadow-md rounded-2xl p-5 mb-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">입력 / 출력</h3>
              <span className="text-xs text-gray-500">
                총 {sampleCases.length}개
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sampleCases.map((tc, i) => {
                const hasInput = Boolean(tc.input && tc.input.trim().length > 0);
                return (
                  <div
                    key={i}
                    className="bg-blue-50 shadow-md rounded-2xl p-5 border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        #{i + 1}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {hasInput && (
                        <div className="w-full">
                          <div className="text-xs font-semibold text-gray-600 mb-1">
                            입력
                          </div>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm overflow-auto">
                            <pre className="whitespace-pre-wrap break-all">
                              {tc.input}
                            </pre>
                          </div>
                        </div>
                      )}

                      <div className="w-full">
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          예상 출력
                        </div>
                        <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm overflow-auto">
                          <pre className="whitespace-pre-wrap break-all">
                            {tc.output || "(빈 출력)"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* 드래그 핸들 */}
      <div
        onMouseDown={onMouseDown}
        className="w-2 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors flex-shrink-0 border-l border-r border-gray-200"
      />

      {/* 오른쪽: 에디터 / 실행카드 / 객관식 UI */}
      <div className="flex flex-col overflow-hidden flex-1 min-w-[400px]">
        <div className="flex flex-col h-full w-full max-w-full overflow-hidden pl-2">
          {/* 코딩/디버깅 */}
          {isCodingOrDebugging && (
            <>
              <div className="flex items-center mb-2 max-w_full overflow-hidden shrink-0 gap-2">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="border rounded-lg p-2 flex-shrink-0 text-sm"
                >
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>

                {expectedLang && (
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      langMismatch
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    요구 언어: {expectedLang.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="bg-white rounded shadow flex-1 min-h-0 overflow-hidden max-w-full">
                <MonacoEditor
                  key={`${solveId || "default"}-${language}`}
                  height="100%"
                  language={language}
                  value={code ?? ""}
                  onChange={(value) => setCode(value ?? "")}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 16,
                    lineNumbers: "off",
                    roundedSelection: false,
                    contextmenu: false,
                    automaticLayout: true,
                    copyWithSyntaxHighlighting: false,
                    scrollbar: { vertical: "visible", horizontal: "visible" },
                    padding: { top: 10, bottom: 10 },
                    wordWrap: "on",
                    scrollBeyondLastColumn: 0,
                  }}
                  onMount={(ed, monacoNs) => {
                    editorRef.current = ed;
                    ed.onKeyDown((event) => {
                      if (event.keyCode === monacoNs.KeyCode.Enter) {
                        const newCode = ed.getValue();
                        setCodeLogs((prevLogs) => [...prevLogs, newCode]);
                        setTimeStamps((prev) => [
                          ...prev,
                          new Date().toISOString(),
                        ]);
                      }
                    });
                    ed.addCommand(
                      monacoNs.KeyMod.CtrlCmd | monacoNs.KeyCode.Enter,
                      () => {
                        handleRunCurrentCode();
                      }
                    );
                  }}
                />
              </div>

              {/* 실행 입력/결과 카드 */}
              <div className="bg-white rounded-xl shadow-lg border flex flex-col mt-4 mb-5 min-h-0">
                <div className="flex items-center h-12 px-3 border-b justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm">실행 (입력 → 출력)</div>
                    {currentRun ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          currentRun.success
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {currentRun.success ? "성공" : "실패"}
                        {typeof currentRun.time_ms === "number"
                          ? ` · ${currentRun.time_ms}ms`
                          : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">대기 중...</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">(Ctrl/⌘+Enter)</span>
                    <motion.button
                      onClick={handleRunCurrentCode}
                      disabled={isRunningCurrent}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${
                        isRunningCurrent
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-mygreen hover:bg-green-700"
                      } text-white px-4 py-1.5 rounded-xl text-sm`}
                    >
                      {isRunningCurrent ? "실행중..." : "실행"}
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-3 overflow-y-auto">
                  {/* 입력 영역 */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold text-gray-700">입력</div>
                    </div>

                    <textarea
                      rows={4}
                      value={testCases[0]?.input ?? ""}
                      onChange={(e) =>
                        setTestCases([{ input: e.target.value, output: "" }])
                      }
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          handleRunCurrentCode();
                        }
                      }}
                      onInput={(e) => {
                        const ta = e.currentTarget;
                        ta.style.height = "auto";
                        ta.style.height = `${ta.scrollHeight}px`;
                      }}
                      placeholder="표준 입력으로 전달할 값을 적어주세요"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm resize-none font-mono"
                      style={{ minHeight: "120px" }}
                    />
                  </div>

                  {/* 출력 영역 */}
                  <div className="md:col-span-4 flex flex-col">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      실행 결과
                    </div>
                    <div
                      className="w-full px-2 py-2 border border-gray-200 rounded bg-gray-50 font-mono text-xs overflow-y-auto"
                      style={{ minHeight: "120px", maxHeight: "240px" }}
                    >
                      <pre className="whitespace-pre-wrap break-all">
                        {currentRun?.output || "(출력 없음)"}
                      </pre>
                    </div>

                    {currentRun?.error && (
                      <>
                        <div className="text-xs font-semibold text-gray-700 mt-3 mb-1">
                          에러 출력
                        </div>
                        <div
                          className="w-full px-2 py-2 border border-red-200 rounded bg-red-50 font-mono text-xs overflow-y-auto text-red-700"
                          style={{ minHeight: "96px", maxHeight: "240px" }}
                        >
                          <pre className="whitespace-pre-wrap break-all">
                            {currentRun.error}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 객관식 */}
          {isMultiple && (
            <div className="bg-white rounded-xl shadow-lg p-6 flex-1 min-h-0 overflow-y-auto mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">객관식 답안 선택</h3>
                {allowMultiple ? (
                  <span className="text-sm text-blue-600 font-medium">
                    복수 선택 가능
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">단일 선택</span>
                )}
              </div>

              {choiceOptions.length === 0 ? (
                <p className="text-gray-500">선지가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {choiceOptions.map((text, index) => {
                    const labelNumber =
                      `①②③④⑤⑥⑦⑧⑨⑩`.charAt(index) || `${index + 1}.`;
                    const id = `opt-${index}`;

                    return (
                      <label
                        key={id}
                        htmlFor={id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          (
                            allowMultiple
                              ? selectedMultiple.includes(index)
                              : selectedSingle === index
                          )
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          id={id}
                          type={allowMultiple ? "checkbox" : "radio"}
                          name="multipleChoice"
                          value={index}
                          checked={
                            allowMultiple
                              ? selectedMultiple.includes(index)
                              : selectedSingle === index
                          }
                          onChange={(e) => {
                            if (allowMultiple) {
                              setSelectedMultiple((prev) =>
                                e.target.checked
                                  ? [...prev, index]
                                  : prev.filter((i) => i !== index)
                              );
                            } else {
                              setSelectedSingle(index);
                            }
                          }}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />

                        <span className="font-medium mr-3">{labelNumber}</span>
                        <span className="whitespace-pre-wrap">{text}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )}

  {/* ========== 주관식 / 단답형 : 상하 레이아웃 ========== */}
  {(isSubjective || isShort) && (
    <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-6">
      {/* 상단: 문제 설명 */}
      {(() => {
        const desc = normalizeMultiline(problem?.description ?? "");
        return (
          <div
            className="editor-content prose prose-slate max-w-none
                      prose-headings:font-bold prose-pre:bg-gray-50 prose-pre:border
                      prose-pre:border-gray-200 prose-pre:rounded-xl prose-code:text-pink-700
                      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                      prose-img:rounded-lg bg-white rounded-xl shadow-lg p-6"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
            >
              {desc}
            </ReactMarkdown>
          </div>
        );
      })()}

      {/* 하단: 답안 입력 */}
      {isSubjective && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-5">
          <h3 className="text-lg font-semibold mb-4">주관식 답안 작성</h3>
          <textarea
            value={subjectiveAnswer}
            onChange={(e) => setSubjectiveAnswer(e.target.value)}
            placeholder="답안을 자유롭게 작성해주세요..."
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ fontSize: "14px", lineHeight: "1.5" }}
          />
          <div className="mt-2 text-sm text-gray-500 text-right">
            {subjectiveAnswer.length} 글자
          </div>
        </div>
      )}

      {isShort && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-5">
          <h3 className="text-lg font-semibold mb-4">단답형 답안 입력</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                답안
              </label>
              <input
                type="text"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                placeholder="정답을 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              간단명료하게 답안을 입력해주세요.
            </div>
          </div>
        </div>
      )}
    </div>
  )}
</main>

    </div>
  );
}
