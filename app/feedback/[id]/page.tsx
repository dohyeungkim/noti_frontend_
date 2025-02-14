"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/Header/PageHeader";

import { groups } from "@/data/groups";
import { problems } from "@/data/problems";
import { feedbackData, Feedback } from "@/data/feedbackdata";
import { problemStatus } from "@/data/problemstatus";

export default function FeedbackWithSubmissionPage() {
  const params = useParams() as {
    groupId?: string;
    examId?: string;
    problemId?: string;
    id?: string;
  };

  const groupId = params.groupId;
  const examId = params.examId;
  const problemId = params.problemId || params.id;

  const router = useRouter();
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const problem = problems.find((p) => p.problemId === problemId);
  const currentStatus = problem
    ? problemStatus[problem.problemId]
    : "defaultStatus";

  useEffect(() => {
    if (problemId && feedbackData[problemId as keyof typeof feedbackData]) {
      setFeedback(feedbackData[problemId as keyof typeof feedbackData]);
    }
  }, [problemId]);

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <motion.h1
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          문제를 찾을 수 없습니다
        </motion.h1>
        <motion.p
          className="text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          잘못된 경로로 접근했거나 문제가 삭제되었습니다.
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <PageHeader />


{/* 사이드바 */}
      <motion.div
        className={`fixed right-0 h-full  border-gray-400 shadow-lg transition-all duration-300 ${
          isSidebarOpen ? "w-1/3" : "w-0"
        }`}
        initial={{ x: 500 }}
        animate={{ x: isSidebarOpen ? 0 : 700 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {isSidebarOpen && feedback ? (
          <motion.div
            className="p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              📋 Feedback
            </h2>
            <div className="border-t border-gray-400 my-5"></div>

            <div className="p-3 border-b mb-2 bg-gray-200 rounded shadow-sm">
              <h3 className="font-semibold text-gray-800">✅ 정답</h3>
              <p className="text-gray-700">
                {feedback.correctAnswer}
                <br />
                <br />
              </p>
              <h3 className="font-semibold text-gray-800">👍 잘한 점</h3>
              <p className="text-gray-700">
                {feedback.goodPoints}
                <br />
                <br />
              </p>

              <h3 className="font-semibold text-gray-800">🔥 개선할 점</h3>
              <p className="text-gray-700">
                {feedback.improvementPoints}
                <br />
                <br />
              </p>

              <h3 className="font-semibold text-gray-800">❌ 비슷한 오답</h3>
              <ul className="list-disc pl-4 text-gray-700">
                {feedback.similarMistakes.map((mistake, index) => (
                  <li key={index}>{mistake}</li>
                ))}
              </ul>
            </div>
            <div className="p-3">
              <h3 className="font-semibold mb-2 text-gray-900">💬 Comment</h3>
              <div className="border-t border-gray-400 my-5"></div>
              <ul className="mb-4 space-y-4">
                {feedback.comments.map((comment, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start space-x-3 border-gray-300 pb-3"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <img
                        src="/icons/user-placeholder.png"
                        alt="user"
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <strong className="text-gray-900">
                          {comment.user}
                        </strong>
                        <div className="pr-4"></div>
                        <span className="text-xs text-gray-300">
                          2003.06.05
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{comment.text}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <div className="flex justify-between">
                <label className="flex items-center px-2  border-gray-300">
                  <input type="checkbox" className="mr-1" /> 익명
                </label>
                <div className="flex items-center border border-gray-400 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    placeholder="댓글을 입력해 주세요."
                    className="flex-1 p-2 text-gray-800 placeholder-gray-500 focus:outline-none"
                  />
                  <button className="p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500 hover:text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v16h16M4 20l16-16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.p
            className="text-center text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            ⚠️ 피드백이 없습니다.
          </motion.p>
        )}
      </motion.div>

      <motion.div
        className={`transition-all duration-500  ${
          isSidebarOpen ? "mr-[520px]" : "mr-0"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="mt-10">
          <span
            className={`text-sm font-bold ${
              currentStatus === "맞음"
                ? "text-green-600"
                : currentStatus === "틀림"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {currentStatus === "맞음"
              ? "🟢 맞았습니다"
              : currentStatus === "틀림"
              ? "🔴 틀렸습니다"
              : "🟡 푸는 중"}
          </span>
        </div>
        <div className="flex justify-between">
          <motion.h2
            className="text-2xl font-bold  m-2 pt-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            한서연님의 코드
          </motion.h2>
          <motion.button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className=" text-black p-1 rounded transform  "
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSidebarOpen ? ">>" : "<<"}
          </motion.button>
        </div>

        <motion.div
          className="border-b-2 border-gray-400 mb-4"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* 사이드바 토글 버튼 (사이드바 외부) */}
        {/* 문제 상태 영역: 코드 작성 영역 바로 위 */}

        <motion.div
          className="bg-gray-200 border rounded-lg p-4 font-mono text-sm overflow-auto h-96 shadow-inner mb-6"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.7 }}
        >
          <pre className="w-full h-full text-gray-800">
            {code || "코드가 없습니다."}
          </pre>
        </motion.div>

        {/* 여기에 로그 재생바 */}

        <motion.div
          className="mt-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">문제</h2>
          <div className="border-b-2 border-gray-400 mb-4"></div>
          <p className="text-gray-700 mb-4">{problem.description}</p>

          <div className="flex space-x-6">
            <div className="flex-1">
              <motion.div
                className="bg-gray-200 p-3 rounded-lg border border-gray-400"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-semibold mb-2 text-gray-900">입력</h3>
                <pre className="text-sm text-gray-800">{problem.input}</pre>
              </motion.div>
            </div>
            <div className="flex-1">
              <motion.div
                className="bg-gray-200 p-3 rounded-lg border border-gray-400"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-semibold mb-2 text-gray-900">출력</h3>
                <pre className="text-sm text-gray-800">{problem.output}</pre>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
