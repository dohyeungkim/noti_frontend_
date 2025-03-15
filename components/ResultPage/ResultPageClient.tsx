"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import CodeLogReplay from "@/components/ResultPage/CodeLogReplay";
import CommentSection from "@/components/ResultPage/CommentSection";
import { code_log_api, problem_api, solve_api } from "@/lib/api";
import ResultPageProblemDetail from "./ResultPageProblemDetail";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [problem, setProblem] = useState(null);
  const [solveData, setSolveData] = useState<{ passed: boolean; user_id: string } | null>(null);
  const [codeLogs, setCodeLogs] = useState([]);

  // ✅ 문제 불러오기
  const fetchProblem = useCallback(async () => {
    try {
      const res = await problem_api.problem_get_by_id(Number(params.problemId));
      setProblem(res);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [params.problemId]); // ✅ params.problemId 변경 시만 함수 재생성

  // ✅ 제출 기록 불러오기
  const fetchSolve = useCallback(async () => {
    try {
      const res = await solve_api.solve_get_by_solve_id(Number(params.resultId));
      console.log(res);
      setSolveData(res);
    } catch (error) {
      console.error("제출 기록 불러오기 중 오류 발생:", error);
    }
  }, [params.resultId]); // ✅ params.resultId 변경 시만 함수 재생성

  // ✅ 코드 로그 불러오기
  const fetchCodeLogs = useCallback(async () => {
    try {
      const res = await code_log_api.code_logs_get_by_solve_id(Number(params.resultId));
      setCodeLogs(res);
    } catch (error) {
      console.error("코드 로그 불러오기 중 오류 발생:", error);
    }
  }, [params.resultId]); // ✅ params.resultId 변경 시만 함수 재생성

  // ✅ 데이터 가져오기
  useEffect(() => {
    fetchProblem();
    fetchSolve();
    fetchCodeLogs();
  }, [fetchProblem, fetchSolve, fetchCodeLogs]); // ✅ useCallback을 활용하여 최신 함수 참조 유지

  if (!problem || !solveData || !codeLogs) {
    return (
      <motion.div
        className="text-center mt-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}>
        <h1 className="text-2xl font-bold text-gray-800">문제를 찾아 오는 중입니다.</h1>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className={`fixed right-6 bottom-30 rounded-l-xl z-50
    ${isSidebarOpen ? "w-[90%] sm:w-[60%] md:w-[40%] lg:w-[30%] max-w-[400px]" : "w-0"}
   h-90`} // 화면 높이의 약 2/3 차지
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
        className="fixed bottom-6 right-6 bg-gray-600 text-white
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="mt-6">
          <span
            className={`text-sm font-bold ${
              solveData.passed === true ? "text-green-600" : "text-yellow-600"
            }`}>
            {solveData.passed === true ? "🟢 맞았습니다" : "🟡 틀렸습니다."}
          </span>
        </div>
        <div className="flex justify-between items-center px-4">
          <motion.h2
            className="text-2xl font-bold m-2 pt-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}>
            {solveData.user_id}님의 코드
          </motion.h2>
        </div>
        <motion.div
          className="w-full border-b-2 border-gray-400 mb-2 "
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
        <CodeLogReplay codeLogs={codeLogs} idx={0} />
        <ResultPageProblemDetail problem={problem} />
      </motion.div>
    </>
  );
}
