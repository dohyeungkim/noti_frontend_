"use client";

import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { problem_api } from "@/lib/api";
import { UserIcon } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProblemStatsResponse {
  problem_id: number;
  group_id: number;
  workbook_id: number;
  like: number;
  attempt_count: number;
  pass_count: number;
  comments: { user_id: string; comment: string; timestamp: string }[];
}

interface ApiResponse {
  msg: string;
  data: ProblemStatsResponse[];
}

export default function ProblemStatistics({ problem_id }: { problem_id: number }) {
  const [problemStats, setProblemStats] = useState<ProblemStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response: ApiResponse = await problem_api.problem_get_stats(problem_id);
        // 응답 데이터에서 첫 번째 항목 사용 (배열의 첫 번째만 필요하다고 가정)
        const stats = response.data[0];
        setProblemStats(stats);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [problem_id]);

  if (loading) {
    return <p className="text-center text-gray-500">로딩 중...</p>;
  }

  if (error || !problemStats) {
    return (
      <p className="text-center text-gray-500">{error || "해당 문제에 대한 통계가 없습니다."}</p>
    );
  }

  // ✅ 변수 설정
  const likeCount = problemStats.like;
  const mygreen = "#589960";

  // ✅ 날짜 포맷 함수
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:
      ${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // ✅ 성공률 도넛 차트 데이터
  const doughnutData = {
    labels: ["맞은 사람", "도전 중"],
    datasets: [
      {
        data: [problemStats.pass_count, problemStats.attempt_count - problemStats.pass_count],
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
            이 문제는 {problemStats.attempt_count}명 중 {problemStats.pass_count}명이 성공했습니다!
          </p>
        </div>

        {/* 💬 댓글 리스트 */}
        <div className="flex flex-col items-center w-full">
          <h3 className="text-md font-semibold mb-2">📌 이 문제의 댓글들</h3>
          <div className="w-full max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow p-4 bg-white">
            {problemStats.comments.length === 0 ? (
              <p className="text-gray-500 text-center">💬 아직 댓글이 없습니다.</p>
            ) : (
              problemStats.comments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border-b last:border-none">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">{comment.user_id}</span>
                      <span className="text-sm text-gray-500">
                        {comment.timestamp ? formatTime(comment.timestamp) : "방금 전"}
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
            xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={mygreen}
            />
          </svg>
          <span className="absolute text-white text-5xl font-bold">{likeCount}</span>
        </div>
        <p className="text-center text-gray-600 mt-3">총 {likeCount}명이 좋아합니다!</p>
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
            <tr className="border-t">
              <td className="px-6 py-3">{problemStats.group_id}</td>
              <td className="px-6 py-3">{problemStats.workbook_id}</td>
              <td className="px-6 py-3">{likeCount}</td>
              <td className="px-6 py-3">{problemStats.attempt_count}</td>
              <td className="px-6 py-3">{problemStats.pass_count}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
