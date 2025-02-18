"use client";

import PageHeader from "@/components/Header/PageHeader";
import SearchBar from "@/components/Header/SearchBar";
import SortButton from "@/components/Header/SortButton";
import ViewToggle from "@/components/Header/ViewToggle";
import { problems } from "@/data/problems";
import { problemStatus } from "@/data/problemstatus";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

// ✅ 문제 데이터에 상태 추가
const problemsWithStatus = problems.map((problem) => ({
  ...problem,
  status: problemStatus[problem.problemId] || "푸는 중",
}));

export default function MySolvedProblems() {
  const { groupId, examId, problemId } = useParams() as {
    groupId?: string;
    examId?: string;
    problemId?: string;
  };
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");

  // 🔍 검색 적용 (단, "푸는 중" 문제는 제외)
  const filteredProblems = problemsWithStatus
    .filter((p) => p.status !== "푸는 중") // "푸는 중" 문제 제외
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  // ✅ 상태별 색상 설정
  const getStatusColor = (status: string) => {
    switch (status) {
      case "틀림":
        return "text-red-500";
      case "맞음":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // ✅ 버튼 색상도 상태에 따라 변경
  const getButtonColor = (status: string) => {
    switch (status) {
      case "틀림":
        return "bg-red-500 hover:bg-red-600"; // ❌ 틀림: 빨강
      case "맞음":
        return "bg-green-500 hover:bg-green-600"; // ✅ 맞음: 초록
      default:
        return "bg-gray-500 hover:bg-gray-600"; // ⏳ 기본값: 회색
    }
  };

  return (
    <motion.div
    //   className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8"
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   transition={{ duration: 0.3 }}
    >
      {" "}
      {/* 🔍 검색, 보기 방식 변경, 정렬 버튼 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {" "}
        <div className="flex-grow min-w-0">
          <SearchBar
            searchQuery={search}
            setSearchQuery={setSearch}
            className="animate-fade-in"
          />
        </div>
        <ViewToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          className="animate-fade-in"
        />
        <SortButton onSortChange={() => {}} className="animate-fade-in" />
      </motion.div>
      {/* 문제 목록 */}
      <motion.h2
        className="text-2xl font-bold mb-4 m-2 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        푼 문제{" "}
      </motion.h2>
      <motion.hr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />
      {/* 📌 문제 목록 */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {filteredProblems.length === 0 ? (
          <p className="text-gray-500 text-center text-lg mt-10">
            검색된 문제가 없습니다. 🧐
          </p>
        ) : viewMode === "gallery" ? (
          // 📌 **갤러리 형식 (4열)**
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProblems.map((problem) => (
              <motion.div
                key={problem.problemId}
                className="p-5 border rounded-2xl shadow bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {problem.title}
                </h3>
                <p className="text-gray-500 text-sm">{problem.examName}</p>
                <p
                  className={`text-sm font-medium mt-1 ${getStatusColor(
                    problem.status
                  )}`}
                >
                  상태: {problem.status}
                </p>

                <Link href={`/feedback/${problem.problemId}`}>
                  <button
                    className={`mt-4 w-full text-white py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 ${getButtonColor(
                      problem.status
                    )}`}
                  >
                    피드백 보기
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // 📌 **테이블 형식**
          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <table className="w-full bg-white shadow-md rounded-xl overflow-hidden border border-gray-300">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-4">문제 제목</th>
                  <th className="p-4">문제지</th>
                  <th className="p-4">상태</th>
                  <th className="p-4 text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr key={problem.problemId} className="border-t">
                    <td className="p-4">{problem.title}</td>
                    <td className="p-4 text-gray-500">{problem.examName}</td>
                    <td
                      className={`p-4 font-medium ${getStatusColor(
                        problem.status
                      )}`}
                    >
                      {problem.status}
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/feedback/${problem.problemId}`}>
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 text-white ${getButtonColor(
                            problem.status
                          )}`}
                        >
                          피드백 보기
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
