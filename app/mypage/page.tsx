"use client";

import { useState } from "react";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import PageHeader from "@/components/Header/PageHeader";
import dynamic from "next/dynamic";

// ✅ react-calendar-heatmap 동적 로드
const CalendarHeatmap = dynamic(() => import("react-calendar-heatmap"), {
  ssr: false,
});
import "react-calendar-heatmap/dist/styles.css";

Chart.register(...registerables);

export default function MyPage() {
  const problems = [
    { title: "두 수의 합", category: "페이커 기초", description: "정수 배열에서 두 수의 합이 특정 값이 되는 인덱스를 찾으세요.", date: "2023-06-01" },
    { title: "무한 동력", category: "알고리즘", description: "영원히 끝나지 않는 무한 동력을 만들어보세요.", date: "2023-06-01" },
  ];

  const data = {
    labels: ["JavaScript", "Python", "Java", "C++"],
    datasets: [
      {
        label: "학습 진행 상황",
        data: [8, 4, 3, 7],
        backgroundColor: ["#FF5733", "#33A1FF", "#FF8C33", "#9933FF"],
        borderRadius: 6,
      },
    ],
  };

  // ✅ 깃허브 잔디밭 데이터
  const today = new Date();
  const heatmapData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - i),
    count: Math.floor(Math.random() * 5), // 0~4 랜덤 값 (학습 횟수)
  }));

  return (
    <div className="flex h-screen">
      {/* ✅ 콘텐츠 영역 */}
      <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
        {/* 🏠 환영 메시지 */}
        <PageHeader className="animate-slide-in mb-6" />

        {/* 🔥 추천 문제 */}
        <h2 className="text-2xl font-bold mb-4">📌 추천 문제</h2>
        <hr className="border-gray-300 my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <div key={index} className="p-5 border rounded-xl shadow bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-gray-800">{problem.title}</h3>
              <p className="text-gray-500 text-sm">{problem.category}</p>
              <p className="text-gray-700 mt-1">{problem.description}</p>
              <p className="text-gray-400 text-sm mt-1">시험 날짜: {problem.date}</p>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 active:scale-95">
                풀기
              </button>
            </div>
          ))}
        </div>

        {/* 📊 학습 진행 상황 */}
        <h2 className="text-2xl font-bold mt-10 mb-4">📊 학습 진행 상황</h2>
        <hr className="border-gray-300 my-4" />
        <div className="w-full lg:w-2/3 mx-auto">
          <Bar data={data} />
        </div>

        {/* 🌱 깃허브 잔디밭 */}
        <h2 className="text-2xl font-bold mt-10 mb-4">🌱 학습 기록</h2>
        <hr className="border-gray-300 my-4" />
        <div className="bg-white p-6 rounded-xl shadow-md">
          <CalendarHeatmap
            startDate={new Date(today.getFullYear(), today.getMonth() - 5, today.getDate())}
            endDate={today}
            values={heatmapData}
            classForValue={(value) => {
              if (!value) return "color-empty";
              return `color-scale-${value.count}`;
            }}
          />
          <style>
            {`
              .color-empty { fill: #ebedf0; }
              .color-scale-1 { fill: #c6e48b; }
              .color-scale-2 { fill: #7bc96f; }
              .color-scale-3 { fill: #239a3b; }
              .color-scale-4 { fill: #196127; }
            `}
          </style>
        </div>
      </div>
    </div>
  );
}
