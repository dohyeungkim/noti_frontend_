"use client";

import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { motion } from "framer-motion";
import "react-calendar-heatmap/dist/styles.css";
import { groups } from "@/data/groups";

Chart.register(...registerables);

export default function MyPage() {
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

  return (
    <motion.div>
      {/* 📌 모든 그룹 */}
      <motion.h2
        className="text-2xl font-bold mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}>
        📌 모든 그룹
      </motion.h2>
      <motion.hr
        className="border-gray-300 my-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />

      {/* 🔥 그룹 카드 리스트 (4개씩 정렬) */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {groups
          .filter((group) => group.group_state) // ✅ 공개 그룹만 필터링
          .map((group, index) => (
            <motion.div
              key={index}
              className="relative p-6 border rounded-2xl shadow-md bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
            >
              {/* 🔵 그룹 상태 배지 */}
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                ${group.group_private_state ? "bg-gray-500 text-white" : "bg-blue-500 text-white"}`}
              >
                {group.group_private_state ? "비공개" : "공개"}
              </div>

              {/* 그룹 정보 */}
              <h2 className="text-xl font-bold mb-2 text-gray-800">{group.group_name}</h2>
              <p className="mb-1 text-gray-600">📌 그룹 번호: <span className="font-medium text-gray-700">{group.group_id}</span></p>
              <p className="mb-1 text-gray-600">👥 수강생: <span className="font-medium text-gray-700">{group.member_count}명</span></p>

              <div className="flex justify-between items-center text-sm font-semibold mt-4">
                <span className="text-gray-700">👨‍🏫 그룹장: <span className="text-gray-900">{group.group_owner}</span></span>
              </div>

              {/* ✅ 그룹 참여 버튼 */}
              <button
                className="mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  const isConfirmed = window.confirm("그룹에 참여하시겠습니까?");
                  if (isConfirmed) {
                    window.location.href = `/mygroups/${group.group_id}`; // ✅ 확인을 누르면 페이지 이동
                  }
                }}
              >
                그룹 참여하기 →
              </button>
            </motion.div>
          ))}
      </motion.div>

      {/* 📊 학습 진행 상황 */}
      <motion.h2
        className="text-2xl font-bold mt-10 mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}>
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
        transition={{ duration: 0.3, delay: 0.4 }}>
        <Bar data={data} />
      </motion.div>
    </motion.div>
  );
}
