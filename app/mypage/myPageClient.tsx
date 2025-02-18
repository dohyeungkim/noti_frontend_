"use client";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import PageHeader from "@/components/Header/PageHeader";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// ✅ react-calendar-heatmap 동적 로드
const CalendarHeatmap = dynamic(() => import("react-calendar-heatmap"), {
  ssr: false,
});
import "react-calendar-heatmap/dist/styles.css";

Chart.register(...registerables);

export default function MyPage() {
  const problems = [
    {
      title: "두 수의 합",
      category: "페이커 기초",
      description: "정수 배열에서 두 수의 합이 특정 값이 되는 인덱스를 찾으세요.",
      date: "2023-06-01",
    },
    {
      title: "무한 동력",
      category: "알고리즘",
      description: "영원히 끝나지 않는 무한 동력을 만들어보세요.",
      date: "2023-06-01",
    },
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

  // ✅ 깃허브 잔디밭 데이터 (최근 20일만 채우기)
  const today = new Date();
  const heatmapData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - i),
    count: i < 20 ? Math.floor(Math.random() * 4) + 1 : 0, // 최근 20일만 랜덤 값 추가
  }));

  return (
    <motion.div
     
    >
      {/* 🏠 환영 메시지 */}

      {/* 🔥 추천 문제 */}
      <motion.h2
        className="text-2xl font-bold mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        📌 추천 문제
      </motion.h2>
      <motion.hr
        className="border-gray-300 my-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {problems.map((problem, index) => (
          <motion.div
            key={index}
            className="p-5 border rounded-xl shadow bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">{problem.title}</h3>
            <p className="text-gray-500 text-sm">{problem.category}</p>
            <p className="text-gray-700 mt-1">{problem.description}</p>
            <p className="text-gray-400 text-sm mt-1">시험 날짜: {problem.date}</p>
            <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 active:scale-95">
              풀기
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* 📊 학습 진행 상황 */}
      <motion.h2
        className="text-2xl font-bold mt-10 mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        📊 학습 진행 상황
      </motion.h2>
      <motion.hr
        className="border-gray-300 my-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />
      <motion.div
        className="w-full lg:w-2/3 mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Bar data={data} />
      </motion.div>

      
    </motion.div>
  );
}
