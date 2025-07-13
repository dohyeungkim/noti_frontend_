"use client";//클라이언트 사용

import { useEffect, useState } from "react";//훅, 모듈 추가
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { problem_api } from "@/lib/api";
import { UserIcon } from "lucide-react";
import { formatTimestamp } from "../util/dageUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProblemStatsResponse {
  problem_id: number;
  group_id: number;
  group_name: string;
  workbook_id: number;
  workbook_name: string;
  like: number;
  attempt_count: number;
  pass_count: number;
  comments: {
    user_id: string;
    comment: string;
    timestamp: string;
    is_problem_message: boolean;
  }[];
}

interface ApiResponse {
  msg: string;
  data: ProblemStatsResponse[];
}

export default function ProblemStatistics({ problem_id }: { problem_id: number }) {
  const [problemStatsList, setProblemStatsList] = useState<ProblemStatsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response: ApiResponse = await problem_api.problem_get_stats(problem_id);
        console.log("📦 응답 데이터:", response);
        setProblemStatsList(response.data);
      } catch (err) {
        console.error("❌ 에러 발생:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [problem_id]);

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (error || problemStatsList.length === 0)
    return <p className="text-center text-gray-500">{error || "통계가 없습니다."}</p>;

  // ✅ 문제별로 그룹화
  const groupedByProblemId = problemStatsList.reduce((acc, curr) => {
    const id = curr.problem_id;
    if (!acc[id]) acc[id] = [curr];
    else acc[id].push(curr);
    return acc;
  }, {} as Record<number, ProblemStatsResponse[]>);

  console.log("📊 groupedByProblemId:", groupedByProblemId);

  return (//사용자UI
    <div className="p-6 space-y-12">
      {Object.entries(groupedByProblemId).map(([pid, statsList]) => {
        // ✅ 전체 통계 (합산)
        const totalLikes = statsList.reduce((sum, p) => sum + p.like, 0);
        const totalAttempts = statsList.reduce((sum, p) => sum + p.attempt_count, 0);
        const totalPasses = statsList.reduce((sum, p) => sum + p.pass_count, 0);
        const totalComments = statsList.flatMap((p) =>
          p.comments.filter((c) => c.is_problem_message === true)
        );

        console.log("❤️ totalLikes:", totalLikes);
        console.log("🚀 totalAttempts:", totalAttempts);
        console.log("✅ totalPasses:", totalPasses);
        console.log("💬 totalComments:", totalComments);

        const doughnutData = {
          labels: ["맞은 사람", "도전 중"],
          datasets: [
            {
              data: [totalPasses, totalAttempts - totalPasses],
              backgroundColor: ["#589960", "#D9D9D9"],
              hoverBackgroundColor: ["#589960", "#BDBDBD"],
            },
          ],
        };

        // ✅ 그룹-문제지별로 유일하게 통계 집계
        const groupedStats = statsList.reduce((acc, curr) => {
          const key = `${curr.group_id}-${curr.workbook_id}`;
          if (!acc[key]) {
            acc[key] = { ...curr };
          }
          return acc;
        }, {} as Record<string, ProblemStatsResponse>);

        console.log("📄 groupedStats:", groupedStats);

        return (
          <div key={pid} className="border-t pt-8">
            {/* 도넛 + 댓글 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h3 className="text-md font-semibold mb-2">📊 성공률</h3>
                <div className="w-60 h-60">
                  <Doughnut data={doughnutData} />
                </div>
                <p className="text-center text-gray-600 mt-3">
                  총 {totalAttempts}명 중 {totalPasses}명이 맞혔습니다!
                </p>
              </div>

              <div className="flex flex-col items-center w-full">
                <h3 className="text-md font-semibold mb-2">📌 댓글</h3>
                <div className="w-full max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow p-4 bg-white">
                  {totalComments.length === 0 ? (
                    <p className="text-gray-500 text-center">💬 아직 댓글이 없습니다.</p>
                  ) : (
                    totalComments.map((comment, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border-b last:border-none">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-semibold">{comment.user_id}</span>
                            <span className="text-sm text-gray-500">
                              {comment.timestamp ? formatTimestamp(comment.timestamp) : "방금 전"}
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

            {/* 하트 */}
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
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                    2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 
                    3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 
                    3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="#589960"
                  />
                </svg>
                <span className="absolute text-white text-5xl font-bold">{totalLikes}</span>
              </div>
              <p className="text-center text-gray-600 mt-3">총 {totalLikes}명이 좋아합니다!</p>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-300">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-3">📌 그룹</th>
                    <th className="px-6 py-3">📖 문제지</th>
                    <th className="px-6 py-3">❤️ 좋아요</th>
                    <th className="px-6 py-3">🚀 도전</th>
                    <th className="px-6 py-3">✅ 성공</th>
                  </tr>
                </thead>
                <tbody>
                  {statsList.map((stat, idx) => (
                    <tr key={`${stat.group_id}-${stat.workbook_id}-${idx}`} className="border-t">
                      <td className="px-6 py-3">{stat.group_name}</td>
                      <td className="px-6 py-3">{stat.workbook_name}</td>
                      <td className="px-6 py-3">{stat.like}</td>
                      <td className="px-6 py-3">{stat.attempt_count}</td>
                      <td className="px-6 py-3">{stat.pass_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
