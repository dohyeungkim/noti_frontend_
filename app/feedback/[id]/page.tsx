"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/Header/PageHeader";

import { groups } from "@/data/groups";
import { problems } from "@/data/problems";
import { testExams } from "@/data/testmode";
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
  const [language, setLanguage] = useState("python");

  const problem = problems.find((p) => p.problemId === problemId);
  //const group = groups.find((g) => g.groupId === problem?.groupId);
  //const isTestMode = testExams?.some((test) => test.examId === examId);
  //const currentStatus = problem ? problemStatus[problem.problemId] : "defaultStatus";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const handleSubmit = () => {
    if (!groupId || !examId || !problemId) {
      console.error("❌ 오류: 필요한 값이 없습니다!", {
        groupId,
        examId,
        problemId,
      });
      return;
    }
    router.push(
      `/mygroups/${groupId}/exams/${examId}/problems/${problemId}/result`
    );
  };

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (problemId && feedbackData[problemId as keyof typeof feedbackData]) {
      setFeedback(feedbackData[problemId as keyof typeof feedbackData]);
    }
  }, [problemId]);

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">문제를 찾을 수 없습니다</h1>
        <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8 flex">
      <div className="flex-1 pr-4">
        <PageHeader />



{/* 코드와 문제칸 */}
        <div className="bg-[#f9f9f9] flex flex-col pb-10 my-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 m-2 pt-4">
            {problem.examName}
          </h2>
          <div className="border-b-2 border-gray-300 my-4 m-2"></div>

          {/* 코드 */}
          <div className="border rounded-lg p-3 font-mono text-sm overflow-auto bg-gray-100 h-96">
            <pre className="w-full h-full">{code || "코드가 없습니다."}</pre>
          </div>

          {/* 문제 */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold pb-2">문제</h2>
            <div className="border-b-2 border-gray-300 my-2"></div>
            <p className="text-gray-600">{problem.description}</p>

            <div className="flex space-x-4 mt-4">
              <div className="flex-1">
                <h2 className="mt-4 font-semibold">입력</h2>
                <div className="border-b-2 border-gray-300 my-2"></div>
                <pre className="bg-gray-100 p-3 rounded-lg overflow-auto max-h-[200px]">
                  {problem.input}
                </pre>
              </div>
              <div className="flex-1">
                <h2 className="mt-4 font-semibold">출력</h2>
                <div className="border-b-2 border-gray-300 my-2"></div>
                <pre className="bg-gray-100 p-3 rounded-lg overflow-auto max-h-[200px]">
                  {problem.output}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 사이드바 */}
      <div
        className="w-64 bg-white border-l border-gray-300 p-4 transition-all duration-300 t-100"
        style={{ width: isSidebarOpen ? "32rem" : "0" }}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mb-2 bg-gray-300 px-2 py-1 rounded"
        >
          {isSidebarOpen ? "▶️" : "◀️"}
        </button>
        {isSidebarOpen && feedback ? (
          <div>
            <h2 className="text-xl font-semibold">📋 Feedback</h2>
            <div className="p-2 border-b mb-2">
              <h3 className="font-semibold">✅ 정답</h3>
              <p>{feedback.correctAnswer}</p>
            </div>
            <div className="p-2 border-b mb-2">
              <h3 className="font-semibold">👍 잘한 점</h3>
              <p>{feedback.goodPoints}</p>
            </div>
            <div className="p-2 border-b mb-2">
              <h3 className="font-semibold">🔥 개선할 점</h3>
              <p>{feedback.improvementPoints}</p>
            </div>
            <div className="p-2 border-b mb-2">
              <h3 className="font-semibold">❌ 비슷한 오답</h3>
              <ul>
                {feedback.similarMistakes.map((mistake, index) => (
                  <li key={index}>- {mistake}</li>
                ))}
              </ul>
            </div>
            <div className="p-2">
              <h3 className="font-semibold">💬 Comment</h3>
              <ul className="mb-2">
                {feedback.comments.map((comment, index) => (
                  <li key={index} className="border-b py-2">
                    <strong>{comment.user}</strong>: {comment.text}
                  </li>
                ))}
              </ul>
              <textarea
                placeholder="댓글을 입력해 주세요."
                className="w-full h-20 border border-gray-300 p-2 rounded-lg resize-none"
              ></textarea>
              <button
                onClick={handleSubmit}
                className="mt-2 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-700"
              >
                등록
              </button>
            </div>
          </div>
        ) : (
          <p>⚠️ 해당 문제의 피드백이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
