"use client";

import { useParams } from "next/navigation";
import { problems } from "@/data/problems";
import { testExams } from "@/data/testmode";
import { useState } from "react";
import { groups } from "@/data/groups";
import { exams } from "@/data/exams";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/Header/PageHeader";
import Editor from '@monaco-editor/react'

export default function WriteCodePage() {
  const { problemId, examId } = useParams() as {
    problemId: string;
    examId: string;
  };

  const [isExpanded, setIsExpanded] = useState(true);

  const problem = problems.find((p) => p.problemId === problemId && p.examId === examId);
  const exam = exams.find((e) => e.examId === examId);
  const group = groups.find((g) => g.groupId === problem?.groupId);

  const isTestMode = testExams.some((test) => test.examId === examId);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");

  
  const SqlQueryEditor = () => {
    return <Editor height='100%' />
  }
  if (!problem) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">문제를 찾을 수 없습니다</h1>
        <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
      </div>
    );
  }

  const handleSubmit = () => {
    alert(`제출된 코드:\n${code}\n선택된 언어: ${language}`);
  };

  return (
    //<div className="w-full h-screen overflow-hidden flex flex-col p-6">
<div className="bg-[#f9f9f9] h-screen overflow-hidden flex flex-col ml-[3.8rem] p-8 pb-20">

      {/* 헤더 영역 */}
      <PageHeader />

      {/* 제출 버튼 */}
      
      <div className="flex justify-end mt-4">
        <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-black text-white px-16 py-1.5 rounded-xl m-2 text-md cursor-pointer
      hover:bg-gray-500 transition-all duration-200 ease-in-out
      active:scale-95"
          >
            제출하기
          </motion.button>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex flex-1 space-x-6 mt-10 gap-6">

        {/* 코드 작성 영역 */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">나의 코드</h2>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">언어:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border rounded-lg p-2"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>
          <div className="border-b-2 border-black my-2"></div>
          <div className="flex-1 border rounded-lg p-3 font-mono text-sm overflow-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="여기에 코드를 작성하세요..."
              className="w-full h-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              onPaste={(e) => isTestMode && e.preventDefault()}
              onCopy={(e) => isTestMode && e.preventDefault()}
              onCut={(e) => isTestMode && e.preventDefault()}
              onContextMenu={(e) => isTestMode && e.preventDefault()}
              onKeyDown={(e) => {
                if (isTestMode && (e.ctrlKey || e.metaKey) && ["c", "v", "x", "a", "u", "i"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        {/* 사이드바 - 문제 정보 */}
        <div className="flex items-start">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 border rounded-lg transition hover:bg-gray-200"
          >
            {isExpanded ? "<" : ">"}
          </button>
        </div>

        {/* 문제 정보 (애니메이션 적용) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-l-2 pl-4"
            >
              <h2 className="text-lg font-semibold pb-2">문제</h2>
              <div className="border-b-2 border-black my-2"></div>
              <p className="text-gray-600">{problem.description}</p>

              {/* 입력 & 출력 */}
              <div className="flex space-x-4 mt-4">
                <div className="flex-1">
                  <h2 className="mt-4 font-semibold">입력</h2>
                  <div className="border-b-2 border-black my-2"></div>
                  <pre className="bg-gray-100 p-3 rounded-lg overflow-auto max-h-[200px]">
                    {problem.input}
                  </pre>
                </div>
                <div className="flex-1">
                  <h2 className="mt-4 font-semibold">출력</h2>
                  <div className="border-b-2 border-black my-2"></div>
                  <pre className="bg-gray-100 p-3 rounded-lg overflow-auto max-h-[200px]">
                    {problem.output}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}