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
  const [solveData, setSolveData] = useState(null);
  const [codeLogs, setCodeLogs] = useState([]);
  const [aiFeedback, setAiFeedback] = useState<string>(""); // ✅ AI 피드백 추가

  // ✅ 더미 데이터 (AI 피드백 테스트용)
  useEffect(() => {
    setSolveData({
      user_id: "user123",
      passed: false,
      language: "Python",
      code_length: 250,
    });

    setAiFeedback("❌ 조건문에서 edge case 처리를 추가하면 더 정확한 결과를 얻을 수 있습니다.");
  }, []);

  // ✅ 문제 불러오기
  const fetchProblem = useCallback(async () => {
    try {
      const res = await problem_api.problem_get_by_id(Number(params.problemId));
      setProblem(res);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [params.problemId]);

  // ✅ 제출 기록 불러오기
  const fetchSolve = useCallback(async () => {
    try {
      const res = await solve_api.solve_get_by_solve_id(Number(params.resultId));
      setSolveData(res);
    } catch (error) {
      console.error("제출 기록 불러오기 중 오류 발생:", error);
    }
  }, [params.resultId]);

  // ✅ 코드 로그 불러오기
  const fetchCodeLogs = useCallback(async () => {
    try {
      const res = await code_log_api.code_logs_get_by_solve_id(Number(params.resultId));
      setCodeLogs(res);
    } catch (error) {
      console.error("코드 로그 불러오기 중 오류 발생:", error);
    }
  }, [params.resultId]);

  // ✅ 데이터 가져오기
  useEffect(() => {
    fetchProblem();
    fetchSolve();
    fetchCodeLogs();
  }, [fetchProblem, fetchSolve, fetchCodeLogs]);

  if (!problem || !solveData || !codeLogs) {
    return (
      <motion.div
        className="text-center mt-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <h1 className="text-2xl font-bold text-gray-800">
          문제를 불러오는 중입니다...
        </h1>
      </motion.div>
    );
  }

  return (
    <>
      {/* 제출 결과 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="mt-6">
          <span
            className={`text-sm font-bold ${
              solveData.passed ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {solveData.passed ? "🟢 맞았습니다" : "🟡 틀렸습니다."}
          </span>
        </div>
        <div className="flex justify-between items-center px-4">
          <motion.h2
            className="text-2xl font-bold m-2 pt-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {solveData.user_id}님의 코드
          </motion.h2>
        </div>

        
        <motion.div
          className="w-full border-b-2 border-gray-400 mb-2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />

        <CodeLogReplay codeLogs={codeLogs} idx={0} />

        {/* AI 피드백 표시 */}
      <motion.div
        className="p-4 bg-gray-100 rounded-lg shadow-md border-l-4 border-blue-500 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-700">🧠 AI 피드백</h3>
        <p className="text-gray-600 mt-2">{aiFeedback}</p>
      </motion.div>
        <ResultPageProblemDetail problem={problem} />
      </motion.div>
    </>
  );
}
