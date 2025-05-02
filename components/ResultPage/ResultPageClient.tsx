"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import CodeLogReplay, { CodeLog } from "@/components/ResultPage/CodeLogReplay";
import CommentSection from "@/components/ResultPage/CommentSection";
import { code_log_api, problem_api, solve_api } from "@/lib/api";
import ResultPageProblemDetail from "./ResultPageProblemDetail";
import { Problem } from "../ProblemPage/ProblemModal/ProblemSelectorModal";

interface SolveData {
  passed: boolean;
  user_id: string;
  language: string;
  code_length: number;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [codeLogs, setCodeLogs] = useState<CodeLog[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [solveData, setSolveData] = useState<SolveData | null>(null);

  useEffect(() => {
    setSolveData({
      user_id: "user123",
      passed: false,
      language: "Python",
      code_length: 250,
    });

    setAiFeedback("❌ 조건문에서 edge case 처리를 추가하면 더 정확한 결과를 얻을 수 있습니다.");
  }, []);

  const fetchProblem = useCallback(async () => {
    try {
      const res = await problem_api.problem_get_by_id_group(
        Number(params.groupId),
        Number(params.examId),
        Number(params.problemId)
      );
      setProblem(res);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [params.groupId, params.examId, params.problemId]);

  const fetchSolve = useCallback(async () => {
    try {
      const res = await solve_api.solve_get_by_solve_id(Number(params.resultId));
      setSolveData(res);
    } catch (error) {
      console.error("제출 기록 불러오기 중 오류 발생:", error);
    }
  }, [params.resultId]);

  const fetchCodeLogs = useCallback(async () => {
    try {
      const res = await code_log_api.code_logs_get_by_solve_id(Number(params.resultId));
      setCodeLogs(res);
    } catch (error) {
      console.error("코드 로그 불러오기 중 오류 발생:", error);
    }
  }, [params.resultId]);

  useEffect(() => {
    fetchProblem();
    fetchSolve();
    fetchCodeLogs();
  }, [fetchProblem, fetchSolve, fetchCodeLogs]);

  useEffect(() => {
    if (problem && solveData && codeLogs) {
      setIsLoaded(true); // ✅ UI 크기 유지
    }
  }, [problem, solveData, codeLogs]);

  if (!isLoaded) {
    return (
      <motion.div
        className="w-full min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold text-gray-800">문제를 불러오는 중입니다...</h1>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className={`fixed right-6 bottom-30 rounded-l-xl z-50 h-90`} // 화면 높이의 약 2/3 차지
        initial={{ opacity: 0, scale: 0, x: "50vw" }}
        animate={{
          opacity: isSidebarOpen ? 1 : 0,
          scale: isSidebarOpen ? 1 : 0,
          x: isSidebarOpen ? 0 : "50vw",
        }}
        exit={{ opacity: 0, scale: 0, x: "50vw" }}
        transition={{ duration: 0.5, type: "spring" }}>
        {isSidebarOpen && <CommentSection params={params} />}
      </motion.div>

      {/* 버튼을 독립적으로 레이아웃에 포함 */}
      <motion.button
        className="fixed bottom-6 right-6 bg-mygreen text-white
             p-3 sm:p-4 w-12 h-12 sm:w-14 sm:h-14
             rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200
             z-[10001]" // z-index를 채팅창보다 높게 설정
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6">
          <path d="M12 3C6.477 3 2 7.03 2 12c0 2.038.786 3.95 2.095 5.454L4 21l3.682-1.96A10.12 10.12 0 0 0 12 20c5.523 0 10-4.03 10-9s-4.477-9-10-9zM7 11h10v2H7v-2z" />
        </svg>
      </motion.button>

      <motion.div
        className="w-full p-6 rounded-lg min-h-screen"
        initial={{ opacity: 0 }} // ✅ 크기 변화 없음
        animate={{ opacity: 1 }} // ✅ 투명도만 변경 (scale 변화 X)
        transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="mt-6 mb-3">
          <span
            className={`text-sm font-bold ${
              solveData?.passed ? "text-mygreen" : "text-yellow-600"
            }`}>
            {solveData?.passed ? "🟢 맞았습니다" : "🟡 틀렸습니다."}
          </span>
        </div>

        <motion.div className="w-full  border-b-2 border-gray-400 mb-2" />

        <CodeLogReplay codeLogs={codeLogs} idx={0} />

        {/* AI 피드백 */}
        <motion.div
          className="p-4  bg-gray-100 rounded-lg shadow-md border-l-4  mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>
          <h3 className="text-lg font-semibold text-gray-700">🧠 AI 피드백</h3>
          <p className="text-gray-600 mt-2">{aiFeedback}</p>
        </motion.div>

        {problem && <ResultPageProblemDetail problem={problem} />}
      </motion.div>
    </>
  );
}
