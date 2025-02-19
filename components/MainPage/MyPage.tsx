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
      {/* 🏠 환영 메시지 */}

      {/* 🔥 추천 문제 */}
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

<motion.div
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: 0.2 }}
>
  {groups
    .filter((group) => group.group_state) // ✅ 공개 그룹만 필터링
    .map((group, index) => (
      <motion.div
        key={index}
        className="relative p-5 border rounded-xl shadow bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        whileHover={{ scale: 1.02 }}
      >
        {/* 그룹 정보 */}
        <h2 className="text-xl font-semibold mb-2">{group.group_name}</h2>
        <p className="mb-1">📌 그룹 번호: {group.group_id}</p>
        <p className="mb-1">👥 수강생: {group.member_count}명</p>

        <div className="flex justify-between items-center text-sm font-semibold mt-3">
          <span>👨‍🏫 그룹장: {group.group_owner}</span>
        </div>

        <button
  className="mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-gray-800 text-white hover:bg-gray-700"
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
