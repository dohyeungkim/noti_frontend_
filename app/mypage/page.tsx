"use client";

import { useState } from "react";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

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
      },
    ],
  };

  return (
    <div className="flex h-screen">
     
      {/* ✅ 콘텐츠 영역 */}
      <div className="flex-1 p-6">
        {/* 🏠 환영 메시지 */}
        <h1 className="text-3xl font-bold">🚀 안녕하세요, 서연님!</h1>
        <p className="text-gray-600 mb-4">오늘도 열심히 공부해볼까요?</p>

        {/* 🔥 추천 문제 */}
        <h2 className="text-xl font-semibold mb-2">📌 추천 문제</h2>
        <div className="grid grid-cols-2 gap-4">
          {problems.map((problem, index) => (
            <div key={index} className="p-4 border rounded-lg shadow bg-white">
              <h3 className="font-bold">{problem.title}</h3>
              <p className="text-gray-500 text-sm">{problem.category}</p>
              <p className="text-gray-700">{problem.description}</p>
              <p className="text-gray-400 text-sm">시험 날짜: {problem.date}</p>
              <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">풀기</button>
            </div>
          ))}
        </div>

        {/* 📊 학습 진행 상황 */}
        <h2 className="text-xl font-semibold mt-6">📊 학습 진행 상황</h2>
        <div className="w-2/3">
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}
