"use client";

import { useParams } from "next/navigation";
import { problems } from "@/data/problems";
import { testExams } from "@/data/testmode";
import { useState } from "react";
import { groups } from "@/data/groups";
import { exams } from "@/data/exams";

export default function WriteCodePage() {
  const { problemId, examId } = useParams() as {
    problemId: string;
    examId: string;
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const problem = problems.find(
    (p) => p.problemId === problemId && p.examId === examId
  );
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
    <div className="h-screen ml-[4rem] mt-[3rem] p-8">
      {/* 헤더 영역: 그룹, 시험 이름, 문제 제목 */}
      <header className="w-full flex flex-col space-y-2">
        <h4>
          🏡 {group?.name} &gt; 📔 {exam?.name}
        </h4>
        <h1 className="text-4xl font-black">📝 {problem?.title}</h1>
      </header>

      {/* 제출 버튼 영역 */}
      <div className=" flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-black text-white rounded-md text-lg w-auto px-10"
          style={{ position: "absolute" }}
        >
          제출하기
        </button>
      </div>

      {/* 코드 작성 영역과 문제 설명 영역 */}
      <main className="flex-1 flex space-x-4 mt-20 mr-4 ">
        {/* 코드 작성 영역 */}
        <div className="flex-1">
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
          <div className="border-b-2 border-black my-2"></div>
          <div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="여기에 코드를 작성하세요..."
              className="w-full h-[60vh] border rounded-md p-2 font-mono text-sm"
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
          </div>
        </div>
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 border rounded-md "
          >
            {isExpanded ? "<" : ">"}
          </button>
        </div>

        {/* 문제 정보들 - 오른쪽에 */}
        {!isExpanded && (
          <div className="flex-1 min-w-0 overflow-auto">
            <h2 className="text-lg font-semibold pb-2">문제</h2>
            <div className="border-b-2 border-black my-2 overflow-auto"></div>
            <p className="text-gray-600">{problem.description}</p>

            {/* 입력 */}
            <div className="flex space-x-4 mt-4 min-w-0 overflow-auto">
              <div className="flex-1">
                <h2 className="mt-4 font-semibold">입력</h2>
                <div className="border-b-2 border-black my-2 overflow-auto"></div>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto max-h-[300px">
                  {problem.input}
                </pre>
              </div>
              {/* 출력 */}
              <div className="flex-1">
                <h2 className="mt-4 font-semibold">출력</h2>
                <div className="border-b-2 border-black my-2 overflow-auto"></div>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto max-h-[300px">
                  {problem.output}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
