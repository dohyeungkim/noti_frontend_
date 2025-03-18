"use client";

import SearchBar from "@/components/ui/SearchBar";
import SortButton from "@/components/ui/SortButton";
import ViewToggle from "@/components/ui/ViewToggle";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { solve_api } from "@/lib/api";

// ✅ 문제 풀이 데이터 타입 정의
interface ProblemSolve {
  group_id: number;
  problem_id: number;
  workbook_id: number;
  workbook_name: string;
  group_name: string;
  problem_name: string;
  passed: boolean;
  solve_id: number;
  timestamp?: string;
}

export default function MySolved() {
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [sortOrder, setSortOrder] = useState("제목순");
  const [correctProblems, setCorrectProblems] = useState<ProblemSolve[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<ProblemSolve[]>([]);

  // ✅ 날짜 포맷 함수
  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "yyyy-MM-dd HH:mm");
  };

  // ✅ 문자열 길이 제한 함수 (너무 길면 `...` 표시)
  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  // ✅ 문제 데이터 가공 함수
  const processSolves = (solveData: ProblemSolve[]) => {
    const groupedSolves: Record<string, ProblemSolve> = {};

    solveData.forEach((solve) => {
      const { group_id, problem_id, workbook_id, passed } = solve;
      const key = `${group_id}-${problem_id}-${workbook_id}`;

      if (!groupedSolves[key]) {
        groupedSolves[key] = { ...solve };
      }

      if (passed) {
        groupedSolves[key].passed = true;
      }
    });

    return Object.values(groupedSolves);
  };

  // ✅ solve 데이터 가져오는 함수
  const fetchSolves = useCallback(async () => {
    try {
      const data: ProblemSolve[] = await solve_api.solve_get_me();
      const processedData = processSolves(data);

      setCorrectProblems(processedData.filter((p) => p.passed === true));
      setFilteredProblems(processedData.filter((p) => p.passed === true));
    } catch (error) {
      console.error(`제출 데이터를 가져오는 데 실패했습니다. ${error}`);
    }
  }, []);

  useEffect(() => {
    fetchSolves();
  }, [fetchSolves]);

  // ✅ 검색 기능
  useEffect(() => {
    const filtered = correctProblems.filter((problem) =>
      problem.problem_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProblems(filtered);
  }, [search, correctProblems]);

  // ✅ 정렬 기능
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.problem_name.localeCompare(b.problem_name);
    } else if (sortOrder === "날짜순") {
      return (
        new Date(b.timestamp ?? "1970-01-01").getTime() -
        new Date(a.timestamp ?? "1970-01-01").getTime()
      );
    }
    return 0;
  });

  return (
    <motion.div>
      {/* 🔍 검색, 보기 방식 변경, 정렬 버튼 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SearchBar searchQuery={search} setSearchQuery={setSearch} />
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortButton
          sortOptions={["제목순", "날짜순"]}
          onSortChange={(selectedSort) => setSortOrder(selectedSort)}
        />
      </motion.div>

      {/* ✅ 맞은 문제 리스트 */}
      {sortedProblems.length > 0 && (
        <>
          <motion.h2 className="text-2xl font-bold mb-4">
            ✅ 맞은 문제
          </motion.h2>
          <hr className="border-b-1 border-gray-300 my-4 m-2" />

          <motion.div
            key={`correct-${viewMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "gallery" ? (
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                  {sortedProblems.map((problem) => (
                    <div
                      key={problem.problem_id}
                      className="group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer 
                      shadow-md transition-all duration-300 ease-in-out 
                      hover:-translate-y-1 hover:shadow-xl transform-gpu 
                      flex flex-col justify-between"
                    >
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          📄 {truncateText(problem.problem_name, 15)}
                        </h2>
                      </div>

                      <p className="text-gray-500 text-sm">
                        {truncateText(problem.group_name, 10)} &gt;{" "}
                        {truncateText(problem.workbook_name, 10)}
                      </p>

                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm font-medium text-mygreen">맞았습니다!</p>
                        <p className="text-sm text-gray-400">{formatDate(problem.timestamp)}</p>
                      </div>

                      <Link
                        href={`mygroups/${problem.group_id}/exams/${problem.workbook_id}/problems/${problem.problem_id}/result`}
                      >
                        <button className="mt-3 w-full py-2 text-white rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-mygreen hover:bg-green-600">
                          피드백 보기
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">검색된 문제가 없습니다.</p>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
