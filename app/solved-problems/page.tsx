"use client";

import { problems } from "@/data/problems";
import { problemStatus } from "@/data/problemstatus";
import Link from "next/link";
import { useState } from "react";

// ✅ 기존 문제 데이터에 상태 추가
const problemsWithStatus = problems.map((problem) => ({
  ...problem,
  status: problemStatus[problem.problemId] || "푸는 중",
}));

export default function MySolvedProblems() {
  const [search, setSearch] = useState("");

  // 검색 적용
  const filteredProblems = problemsWithStatus.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">✅ 내가 푼 문제들</h1>

      {/* 🔍 검색 */}
      <input
        type="text"
        placeholder="문제 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border rounded-md w-1/3 mb-4"
      />

      {/* 📝 문제 목록 */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProblems.map((problem) => (
          <div key={problem.problemId} className="p-4 border rounded-lg shadow bg-white">
            <h3 className="font-bold">{problem.title}</h3>
            <p className="text-gray-500 text-sm">{problem.examName}</p>
            <p className="text-gray-400 text-sm">상태: {problem.status}</p>

            {/* ✅ 상태별 버튼 다르게 표시 */}
            {problem.status === "푸는 중" ? (
              <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">계속 풀기</button>
            ) : (
              <Link href={`/feedback/${problem.problemId}`}>
                <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded">
                  피드백 보기
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
