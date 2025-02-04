"use client";

import { useParams } from "next/navigation";
import { problems } from "../../../../../../../../data/problems"; // 문제 데이터 import
import { testExams } from "../../../../../../../../data/testmode"; // 시험 모드 데이터 import
import { useState } from "react";

export default function WriteCodePage() {
  const { problemId, examId } = useParams() as { problemId: string; examId: string }; // URL에서 `examId` 가져오기

  // ✅ URL의 `problemId`와 `examId`가 **모두 일치하는 문제 찾기**
  const problem = problems.find((p) => p.problemId === problemId && p.examId === examId);

  // ✅ 시험 모드 여부 확인
  const isTestMode = testExams.some((test) => test.examId === examId);

  if (!problem) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>문제를 찾을 수 없습니다</h1>
        <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
      </div>
    );
  }

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");

  const handleSubmit = () => {
    alert(`제출된 코드:\n${code}\n선택된 언어: ${language}`);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 문제 설명 */}
      <aside style={{ width: "25%", padding: "2rem", borderRight: "1px solid #ddd" }}>
        <h1>{problem.title}</h1>
        <p>{problem.description}</p>
        <h2>입력</h2>
        <pre style={{ backgroundColor: "#f5f5f5", padding: "1rem" }}>{problem.input}</pre>
        <h2>출력</h2>
        <pre style={{ backgroundColor: "#f5f5f5", padding: "1rem" }}>{problem.output}</pre>
      </aside>

      {/* 코드 입력 */}
      <main style={{ flex: 1, padding: "2rem", position: "relative" }}>
        <h2>나의 코드</h2>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            언어:
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ marginLeft: "1rem", padding: "0.5rem", fontSize: "1rem" }}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>
          </label>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="여기에 코드를 작성하세요..."
          style={{
            width: "100%",
            height: "300px",
            marginBottom: "1rem",
            padding: "1rem",
            borderRadius: "5px",
            border: "1px solid #ddd",
            fontFamily: "monospace",
            fontSize: "1rem",
          }}
          onPaste={(e) => isTestMode && e.preventDefault()} // 붙여넣기 차단
          onCopy={(e) => isTestMode && e.preventDefault()} // 복사 차단
          onCut={(e) => isTestMode && e.preventDefault()} // 잘라내기 차단
          onContextMenu={(e) => isTestMode && e.preventDefault()} // 우클릭 차단
          onKeyDown={(e) => {
            if (isTestMode) {
              if (
                (e.ctrlKey || e.metaKey) && 
                (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a" || e.key === "u" || e.key === "i")
              ) {
                e.preventDefault();
              }
            }
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          제출하기
        </button>
      </main>
    </div>
  );
}
