"use client";

import { useParams } from "next/navigation";
import { problems } from "@/data/problems";
import { testExams } from "@/data/testmode";
import { useState } from "react";
import { groups } from "@/data/groups";
import { exams } from "@/data/exams";

export default function WriteCodePage() {
  const { problemId, examId } = useParams() as { problemId: string; examId: string };

  const problem = problems.find((p) => p.problemId === problemId && p.examId === examId);
  const exam = exams.find((e) => e.examId === examId);
  const group = groups.find((g) => g.groupId === problem?.groupId);

  const isTestMode = testExams.some((test) => test.examId === examId);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [panelWidth, setPanelWidth] = useState(400);

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
    <div className="flex h-screen overflow-hidden ml-[4rem]"> {/* 💡 사이드바 너비만큼 왼쪽 여백 추가 */}
      {/* 문제 설명 */}
      <aside
        className="border-r border-gray-300 p-6 overflow-y-auto resize-x bg-white"
        style={{ width: `${panelWidth}px`, minWidth: "250px", maxWidth: "50%" }}
      >
        <h1 className="text-xl font-bold">{problem?.title}</h1>
        <p className="text-gray-600">{problem.description}</p>

        <h2 className="mt-4 font-semibold">입력</h2>
        <pre className="bg-gray-100 p-3 rounded-md">{problem.input}</pre>

        <h2 className="mt-4 font-semibold">출력</h2>
        <pre className="bg-gray-100 p-3 rounded-md">{problem.output}</pre>
      </aside>

      {/* 코드 작성 영역 */}
      <main className="flex-1 p-6 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">나의 코드</h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">언어:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded-md p-2"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="여기에 코드를 작성하세요..."
          className="w-full h-[60vh] border rounded-md p-3 font-mono text-sm"
          onPaste={(e) => isTestMode && e.preventDefault()}
          onCopy={(e) => isTestMode && e.preventDefault()}
          onCut={(e) => isTestMode && e.preventDefault()}
          onContextMenu={(e) => isTestMode && e.preventDefault()}
          onKeyDown={(e) => {
            if (isTestMode) {
              if (
                (e.ctrlKey || e.metaKey) &&
                ["c", "v", "x", "a", "u", "i"].includes(e.key)
              ) {
                e.preventDefault();
              }
            }
          }}
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white py-2 px-4 rounded-md text-lg"
        >
          제출하기
        </button>
      </main>
    </div>
  );
}
