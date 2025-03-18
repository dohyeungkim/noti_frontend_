"use client";

import SearchBar from "@/components/ui/SearchBar";
import SortButton from "@/components/ui/SortButton";
import ViewToggle from "@/components/ui/ViewToggle";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { solve_api } from "@/lib/api";

export default function MySolved() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");

  // useEffect(()=>{
  //   const filteredProblemsData = problems.filter((p) =>
  //     p.problem_name.toLowerCase().includes(search.toLowerCase())
  //   );
  //   setFilteredProblems(filteredProblemsData);
  // },[search])

  const [correctProblems, setCorrectProblems] = useState([]);
  const [ongoingProblems, setOngoingProblems] = useState([]);
  // const [solves, setSolves] = useState([]);

  const getStatusColor = (passed: boolean) => {
    return passed ? "text-mygreen" : "text-myred";
  };

  const getButtonColor = (passed: boolean) => {
    return passed ? "bg-mygreen hover:bg-green-600" : "bg-myred hover:bg-opacity-80";
  };

  const processSolves = (solveData) => {
    const groupedSolves = {};

    solveData.forEach((solve) => {
      const { group_id, problem_id, workbook_id, passed } = solve;
      const key = `${group_id}-${problem_id}-${workbook_id}`;

      // 기존 키가 없으면 solve 객체 전체를 저장
      if (!groupedSolves[key]) {
        groupedSolves[key] = { ...solve }; // 기존 solve 데이터를 유지
      }

      // 하나라도 passed=true가 있으면 최종 상태를 true로 변경
      if (passed) {
        groupedSolves[key].passed = true;
      }
    });

    return Object.values(groupedSolves);
  };

  // solve 데이터 가져오는 함수 (useCallback 적용)
  const fetchSolves = useCallback(async () => {
    try {
      const data = await solve_api.solve_get_me();
      const processedData = processSolves(data);

      setCorrectProblems(processedData.filter((p) => p.passed === true));
      setOngoingProblems(processedData.filter((p) => p.passed === false));

      console.log("원본 데이터:", data);
    } catch (error) {
      console.error(`제출 데이터를 가져오는 데 실패했습니다. ${error}`);
    }
  }, []); // 의존성 배열 비워서 최초 마운트 시 실행

  // 최초 마운트 시 fetchSolves 실행
  useEffect(() => {
    fetchSolves();
  }, [fetchSolves]); // useCallback을 활용하여 의존성 배열을 안전하게 유지

  // correctProblems가 변경될 때 로그 출력
  useEffect(() => {
    console.log("정답 문제 개수:", correctProblems.length);
  }, [correctProblems]);

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
        <SortButton onSortChange={() => {}} />
      </motion.div>

      {/* 맞은 문제 섹션 */}
      {correctProblems.length > 0 && (
        <>
          <motion.h2 className="text-2xl font-bold mb-4">✅ 맞은 문제</motion.h2>
          <motion.hr
            className="border-b-1 border-gray-300 my-4 m-2"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          />
          <motion.div
            key={`correct-${viewMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "gallery" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {correctProblems.map((problem) => (
                  <div
                    key={problem.problem_id}
                    className="p-5 border rounded-2xl shadow bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{problem.problem_name}</h3>
                    <p className="text-gray-500 text-sm">
                      {problem.group_name} &gt; {problem.workbook_name}
                    </p>
                    <p className={`text-sm font-medium mt-1 ${getStatusColor(problem.passed)}`}>
                      상태: {problem.passed ? "맞음" : "도전 중"}
                    </p>

                    <Link
                      href={`mygroups/${problem.group_id}/exams/${problem.workbook_id}/problems/${problem.problem_id}/result`}
                    >
                      <button
                        className={`mt-4 w-1/2 text-white py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 ${getButtonColor(
                          problem.passed
                        )}`}
                      >
                        제출 기록 보기
                      </button>
                    </Link>
                    <Link
                      href={`mygroups/${problem.group_id}/exams/${problem.workbook_id}/problems/${problem.problem_id}/result/${problem.solve_id}`}
                    >
                      <button
                        className={`mt-4 w-1/2 text-white py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 ${getButtonColor(
                          problem.passed
                        )}`}
                      >
                        피드백 보기
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full bg-white shadow-md rounded-xl overflow-hidden border border-gray-300">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="p-4">문제 제목</th>
                    <th className="p-4">그룹</th>
                    <th className="p-4">문제지</th>
                    <th className="p-4">마지막 제출 일시</th>
                    <th className="p-4 text-center">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {correctProblems.map((problem) => (
                    <tr key={problem.problem_id} className="border-t">
                      <td className="p-4">{problem.problem_name}</td>
                      <td className="p-4 text-gray-500">{problem.group_name}</td>
                      <td className="p-4 text-gray-500">{problem.workbook_name}</td>
                      <td className="p-4 text-gray-500">{problem.timestamp}</td>
                      <td className="p-4 text-center">
                        <Link
                          href={`mygroups/${problem.group_id}/exams/${problem.workbook_id}/problems/${problem.problem_id}/result`}
                        >
                          <button
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 text-white ${getButtonColor(
                              problem.passed
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
            )}
          </motion.div>
        </>
      )}

      {/* 도전 중 문제 섹션 */}
      {ongoingProblems.length > 0 && (
        <>
          <motion.h2 className="text-2xl font-bold mb-4 mt-8">🚀 도전 중 문제</motion.h2>
          <motion.hr
            className="border-b-1 border-gray-300 my-4 m-2"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          />
          <motion.div
            key={`ongoing-${viewMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "gallery" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ongoingProblems.map((problem) => (
                  <div
                    key={problem.problem_id}
                    className="p-5 border rounded-2xl shadow bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{problem.problem_name}</h3>
                    <p className="text-gray-500 text-sm">
                      {problem.group_name} &gt; {problem.workbook_name}
                    </p>
                    <p className={`text-sm font-medium mt-1 ${getStatusColor(problem.passed)}`}>
                      상태: {problem.passed ? "맞음" : "틀림"}
                    </p>

                    <Link
                      href={`mygroups/${problem.group_id}/exams/${problem.workbook_id}/problems/${problem.problem_id}/write`}
                    >
                      <button
                        className={`mt-4 w-full text-white py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 ${getButtonColor(
                          problem.passed
                        )}`}
                      >
                        문제 풀기
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full bg-white shadow-md rounded-xl overflow-hidden border border-gray-300">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="p-4">문제 제목</th>
                    <th className="p-4">그룹</th>
                    <th className="p-4">문제지</th>
                    <th className="p-4">마지막 제출 일시</th>
                    <th className="p-4 text-center">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {ongoingProblems.map((problem) => (
                    <tr key={problem.problem_id} className="border-t">
                      <td className="p-4">{problem.problem_name}</td>
                      <td className="p-4 text-gray-500">{problem.group_name}</td>
                      <td className="p-4 text-gray-500">{problem.workbook_name}</td>
                      <td className="p-4 text-gray-500">{problem.timestamp}</td>
                      <td className="p-4 text-center">
                        <Link
                          href={`mygroups/${problem.group_id}/exams/${problem.workbook_id}/problems/${problem.problem_id}/result`}
                        >
                          <button
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 text-white ${getButtonColor(
                              problem.passed
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
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
