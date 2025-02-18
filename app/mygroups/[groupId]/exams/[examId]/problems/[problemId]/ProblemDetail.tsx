// mygroups/[groupId]/exams/[examId]/problems/[problemId]/ProblemDetail.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { problems } from "@/data/problems";
import { testExams } from "@/data/testmode";

export default function ProblemDetail({ params }: { params: { groupId: string; examId: string; problemId: string } }) {
  const router = useRouter();
  const { groupId, examId, problemId } = params;

  const problem = problems.find((p) => p.problemId === problemId);
  const isTestMode = testExams.some((test) => test.examId === examId);

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">문제를 찾을 수 없습니다</h1>
        <p className="text-gray-600">
          잘못된 경로로 접근했거나 문제가 삭제되었습니다.
        </p>
      </div>
    );
  }

  const handleNavigate = () => {
    router.push(`/mygroups/${groupId}/exams/${examId}/problems/${problemId}/write`);
  };

  return (
    <>
      {/* 상단 버튼 영역 */}
      <div className="flex items-center gap-2 justify-end">
        {isTestMode && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold"
          >
            시험 모드 🚨
          </motion.span>
        )}
        <motion.button
          onClick={handleNavigate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center bg-black text-white px-8 py-1.5 rounded-xl m-2 text-md cursor-pointer
          hover:bg-gray-500 transition-all duration-200 ease-in-out
          active:scale-95"
        >
          문제 풀기
        </motion.button>
      </div>

      {/* 문제 설명 */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mt-6 border p-4 rounded-md bg-gray-100 shadow-md"
      >
        <h2 className="text-xl font-semibold mb-2">문제</h2>
        <p className="text-gray-700">{problem.description}</p>
      </motion.section>

      {/* 입력 & 출력 예시 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
      >
        {/* 입력 */}
        <section className="border p-4 rounded-md bg-white shadow-md">
          <h3 className="text-lg font-semibold mb-2">입력</h3>
          <pre className="border p-4 rounded-md bg-gray-100 font-mono text-sm mt-2 overflow-auto max-h-[200px]">
            {problem.input}
          </pre>
        </section>

        {/* 출력 */}
        <section className="border p-4 rounded-md bg-white shadow-md">
          <h3 className="text-lg font-semibold mb-2">출력</h3>
          <pre className="border p-4 rounded-md bg-gray-100 font-mono text-sm mt-2 overflow-auto max-h-[200px]">
            {problem.output}
          </pre>
        </section>
      </motion.div>
    </>
  );
}
