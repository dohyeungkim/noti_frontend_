"use client";

import { useState } from "react";
import { Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { ProblemStats } from "@/types/ProblemStats";
import { dummyProblemStats } from "@/data/dummyProblemStats";


// ✅ Chart.js 요소 등록
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

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

  // ✅ 좋아요 수 데이터 (큰 하트 아이콘과 함께 표시)
  const likeCount = selectedProblem.likes;
  const mygreen = "#589960";

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

  // ✅ 레이더 차트 데이터 (제출 수, 풀이 수, 코멘트 수 비교)
  const radarData = {
    labels: ["모든 제출 수", "모든 풀이 수", "모든 코멘트 수"],
    datasets: [
      {
        label: "이 문제",
        data: [
          selectedProblem.total_submissions,
          selectedProblem.total_solutions,
          selectedProblem.total_comments,
        ],
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderColor: mygreen,
        pointBackgroundColor: mygreen,
      },
    ],
  };

  return (
    <div className="p-6 ">
      {/* ✅ 상단: 그룹 & 문제지 태그 */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        {/* 왼쪽: 참조한 그룹 */}
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <h3 className="text-md font-semibold mb-2">
            📌 이 문제를 참조한 그룹
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedProblem.referenced_groups.map((group, idx) => (
              <span
                key={idx}
                className="bg-mygreen text-white px-3 py-1 rounded-md text-sm"
              >
                {group}
              </span>
            ))}
          </div>
        </div>

        {/* 오른쪽: 참조한 문제지 */}
        <div className="w-full md:w-1/2">
          <h3 className="text-md font-semibold mb-2">
            📖 이 문제를 참조한 문제지
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedProblem.referenced_papers.map((paper, idx) => (
              <span
                key={idx}
                className="bg-mygreen text-white px-3 py-1 rounded-md text-sm"              >
                {paper}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ 중간: 좋아요 (큰 하트 아이콘) */}
      <div className="flex flex-col items-center justify-start mb-8">
        {/* ✅ 하트 SVG */}
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

          {/* ✅ 좋아요 숫자 중앙 배치 */}
          <span className="absolute text-white text-5xl font-bold">
            {likeCount}
          </span>
        </div>

        {/* ✅ 좋아요 설명 텍스트 */}
        <p className="text-center text-gray-600 mt-3">
          총 {likeCount}명이 좋아합니다!
        </p>
      </div>

      {/* ✅ 하단: 차트 2개 (도넛 차트 + 레이더 차트) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 🎯 도넛 차트 */}
        <div className="flex flex-col items-center">
          <h3 className="text-md font-semibold mb-2">📊 문제 성공률</h3>
          <div className="w-60 h-60">
          <Doughnut data={doughnutData} />        </div>

          <p className="text-center text-gray-600 mt-3">
            이 문제는 9명 중 5명이 성공했습니다!
          </p>
        </div>

        {/* 📌 레이더 차트 */}
        <div className="flex flex-col items-center">
          <h3 className="text-md font-semibold mb-2">📌 문제 제출/풀이 통계</h3>
          <div className="w-70 h-70">
          <Radar data={radarData} /> </div>
          <p className="text-center text-gray-600 mt-3">
            이 문제는 모든 문제의 평균 제출 횟수보다 제출 수가 압도적으로
            큽니다!
          </p>
        </div>
      </div>
    </div>
  );
}
