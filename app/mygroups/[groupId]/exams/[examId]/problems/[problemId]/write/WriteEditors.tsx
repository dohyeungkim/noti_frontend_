// mygroups/[groupId]/exams/[examId]/problems/[problemId]/write/WriteEditor.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import { problems } from "@/data/problems";
import { testExams } from "@/data/testmode";

export default function WriteEditor({ problemId, examId, groupId }: { problemId: string; examId: string; groupId: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const problem = problems.find((p) => p.problemId === problemId && p.examId === examId);
  const isTestMode = testExams.some((test) => test.examId === examId);

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">문제를 찾을 수 없습니다</h1>
        <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    console.log("📌 이동할 경로:", `/mygroups/${groupId}/exams/${examId}/problems/${problemId}/result`);
  
    if (!groupId || !examId || !problemId) {
      console.error("❌ 오류: 필요한 값이 없습니다!", { groupId, examId, problemId });
      alert("❌ 오류: 필요한 값이 없습니다!");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch("http://210.115.227.15:8000/api/solves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problemId,
          user_id: "currentUser", // 🔹 현재 로그인된 사용자 ID (추후 교체 필요)
          submitted_code: code,
          code_language: language,
        }),
      });
  
      if (!response.ok) {
        throw new Error("코드 제출에 실패했습니다.");
      }
  
      const data = await response.json();
      console.log("✅ 제출 성공:", data);
  
      alert("✅ 코드가 성공적으로 제출되었습니다!");
      router.push(`/mygroups/${groupId}/exams/${examId}/problems/${problemId}/result`);
    } catch (err) {
      let errorMessage = "알 수 없는 오류가 발생했습니다.";
      if (err instanceof Error) errorMessage = err.message;
      alert(`❌ 제출 오류: ${errorMessage}`);
      console.error("❌ 제출 오류:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div>
        
  
        {/* 제출 버튼 */}
        <div className="flex justify-end mt-4">
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-500"
            } text-white px-16 py-1.5 rounded-xl m-2 text-md transition-all duration-200 ease-in-out active:scale-95`}
          >
            {loading ? "제출 중..." : "제출하기"}
          </motion.button>
        </div>
  
        {/* 에러 메시지 출력 */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
  
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
