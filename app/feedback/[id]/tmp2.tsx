"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/Header/PageHeader";

import { groups } from "@/data/groups";
import { problems } from "@/data/problems";
import { feedbackData, Feedback } from "@/data/feedbackdata";

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

  useEffect(() => {
    if (problemId && feedbackData[problemId as keyof typeof feedbackData]) {
      setFeedback(feedbackData[problemId as keyof typeof feedbackData]);
    }
  }, [problemId]);

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">문제를 찾을 수 없습니다</h1>
        <p className="text-gray-500">잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
      </div>
    );
  }

  return (
    <motion.div
          className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 공통 헤더 영역 */}
          <PageHeader />
    

      
{/* 사이드바 */}
<div className={`fixed top-30 right-0 h-full bg-gray-100 border-l border-gray-400 shadow-lg transition-all duration-500 ${isSidebarOpen ? "w-[500px]" : "w-0"}`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-0 -left-6 bg-gray-700 text-white px-2 py-1 rounded transform -translate-y-1/2"
        >
          {isSidebarOpen ? "▶️" : "◀️"}
        </button>
        {isSidebarOpen && feedback ? (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📋 Feedback</h2>
            <div className="p-3 border-b mb-2 bg-gray-300 rounded">
              <h3 className="font-semibold text-gray-800">✅ 정답</h3>
              <p className="text-gray-700">{feedback.correctAnswer}</p>
            </div>
            <div className="p-3 border-b mb-2 bg-gray-300 rounded">
              <h3 className="font-semibold text-gray-800">👍 잘한 점</h3>
              <p className="text-gray-700">{feedback.goodPoints}</p>
            </div>
            <div className="p-3 border-b mb-2 bg-gray-300 rounded">
              <h3 className="font-semibold text-gray-800">🔥 개선할 점</h3>
              <p className="text-gray-700">{feedback.improvementPoints}</p>
            </div>
            <div className="p-3 border-b mb-2 bg-gray-300 rounded">
              <h3 className="font-semibold text-gray-800">❌ 비슷한 오답</h3>
              <ul className="list-disc pl-4 text-gray-700">
                {feedback.similarMistakes.map((mistake, index) => (
                  <li key={index}>{mistake}</li>
                ))}
              </ul>
            </div>
            <div className="p-3">
              <h3 className="font-semibold mb-2 text-gray-900">💬 Comment</h3>
              <ul className="mb-2 text-gray-700">
                {feedback.comments.map((comment, index) => (
                  <li key={index} className="border-b border-gray-400 py-2">
                    <strong className="text-gray-900">{comment.user}</strong>: {comment.text}
                  </li>
                ))}
              </ul>
              <textarea
                placeholder="댓글을 입력해 주세요."
                className="w-full h-20 border border-gray-500 p-2 rounded-lg resize-none bg-gray-100 text-gray-800"
              ></textarea>
              <button
                className="mt-2 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900"
              >
                등록
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">⚠️ 피드백이 없습니다.</p>
        )}
      </div>
      

      {/* 코드와 문제 영역 */}
      
      <div className={`transition-all duration-500 ${isSidebarOpen ? "mr-[520px]" : "mr-0"}`}>
      <motion.h2
        className="text-2xl font-bold mb-4 m-2 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {problem.examName}
      </motion.h2>
      <motion.hr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />
        <div className="bg-gray-200 border rounded-lg p-4 font-mono text-sm overflow-auto h-96 shadow-inner mb-6">
          <pre className="w-full h-full text-gray-800">{code || "코드가 없습니다."}</pre>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">📖 문제</h2>
          <div className="border-b-2 border-gray-400 mb-4"></div>
          <p className="text-gray-700 mb-4">{problem.description}</p>

          <div className="flex space-x-6">
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-gray-900">🔢 입력</h3>
              <div className="bg-gray-200 p-3 rounded-lg border border-gray-400">
                <pre className="text-sm text-gray-800">{problem.input}</pre>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-gray-900">🚀 출력</h3>
              <div className="bg-gray-200 p-3 rounded-lg border border-gray-400">
                <pre className="text-sm text-gray-800">{problem.output}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      </motion.div>
  );
}
