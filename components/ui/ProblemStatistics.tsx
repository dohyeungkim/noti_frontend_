"use client";

import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ProblemStats } from "@/types/ProblemStats";
import { dummyProblemStats } from "@/data/dummyProblemStats";
import { UserIcon } from "lucide-react";

// ✅ 더미 댓글 데이터
const dummyComments = [
  {
    user_id: "alice123",
    comment: "이 문제 진짜 어렵네요...😅",
    timestamp: "2025-03-18T14:45:00Z",
  },
  {
    user_id: "bob456",
    comment: "해설 강의 어디서 보나요?",
    timestamp: "2025-03-18T15:10:00Z",
  },
  {
    user_id: "charlie789",
    comment: "이거 조건 하나 빼면 틀리던데...",
    timestamp: "2025-03-18T16:05:00Z",
  },
];

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProblemStatistics({
  problem_id,
}: {
  problem_id: number;
}) {
  const selectedProblem: ProblemStats | undefined = dummyProblemStats.find(
    (stat: { problem_id: number }) => stat.problem_id === problem_id
  );

  if (!selectedProblem) {
    return (
      <p className="text-center text-gray-500">
        해당 문제에 대한 통계가 없습니다.
      </p>
    );
  }

  // ✅ 변수 설정
  const likeCount = selectedProblem.likes;
  const mygreen = "#589960";

  // ✅ 날짜 포맷 함수
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:
      ${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // ✅ 성공률 도넛 차트 데이터
  const doughnutData = {
    labels: ["맞은 사람", "도전 중"],
    datasets: [
      {
        data: [
          selectedProblem.total_solutions,
          selectedProblem.total_submissions - selectedProblem.total_solutions,
        ],
        backgroundColor: [mygreen, "#D9D9D9"],
        hoverBackgroundColor: [mygreen, "#BDBDBD"],
      },
    ],
  };

  return (
    <div className="p-6">
      {/* ✅ 차트 & 댓글 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 🎯 도넛 차트 */}
        <div className="flex flex-col items-center">
          <h3 className="text-md font-semibold mb-2">📊 문제 성공률</h3>
          <div className="w-60 h-60">
            <Doughnut data={doughnutData} />
          </div>
          <p className="text-center text-gray-600 mt-3">
            이 문제는 {selectedProblem.total_submissions}명 중{" "}
            {selectedProblem.total_solutions}명이 성공했습니다!
          </p>
        </div>

        {/* 💬 댓글 리스트 */}
        <div className="flex flex-col items-center w-full">
          <h3 className="text-md font-semibold mb-2">📌 이 문제의 댓글들</h3>
          <div className="w-full max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow p-4 bg-white">
            {dummyComments.length === 0 ? (
              <p className="text-gray-500 text-center">
                💬 아직 댓글이 없습니다.
              </p>
            ) : (
              dummyComments.map((comment, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border-b last:border-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">
                        {comment.user_id}
                      </span>
                      <span className="text-sm text-gray-500">
                        {comment.timestamp
                          ? formatTime(comment.timestamp)
                          : "방금 전"}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ✅ 좋아요 표시 */}
      <div className="flex flex-col items-center justify-start my-8">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={mygreen}
            />
          </svg>
          <span className="absolute text-white text-5xl font-bold">
            {likeCount}
          </span>
        </div>
        <p className="text-center text-gray-600 mt-3">
          총 {likeCount}명이 좋아합니다!
        </p>
      </div>

      {/* ✅ 문제 그룹 & 문제지 통계 테이블 */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-300">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3">📌 그룹</th>
              <th className="px-6 py-3">📖 문제지</th>
              <th className="px-6 py-3">❤️ 좋아요</th>
              <th className="px-6 py-3">🚀 도전한 사람</th>
              <th className="px-6 py-3">✅ 맞은 사람</th>
            </tr>
          </thead>
          <tbody>
            {selectedProblem.referenced_groups.map((group, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-6 py-3">{group}</td>
                <td className="px-6 py-3">
                  {selectedProblem.referenced_papers[idx]}
                </td>
                <td className="px-6 py-3">{likeCount}</td>
                <td className="px-6 py-3">
                  {selectedProblem.total_submissions}
                </td>
                <td className="px-6 py-3">{selectedProblem.total_solutions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
