"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import SearchBar from "@/components/ui/SearchBar";
import ViewToggle from "@/components/ui/ViewToggle";
import SortButton from "@/components/ui/SortButton";
import { motion } from "framer-motion";
import { problem_api } from "@/lib/api";
import GalleryView from "./MyRefisteredProblemGallary";
import TableView from "./MyRefisteredProblemTable";

// ✅ Question 인터페이스 정의
interface Question {
  problem_id: number;
  title: string;
  group: string;
  paper: string;
  solvedCount: number;
  createdAt?: string; // ✅ 등록일 추가
  description?: string;
}

export default function MyRegisteredProblemView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredData, setFilteredData] = useState<Question[]>([]);
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [sortOrder, setSortOrder] = useState("제목순"); // ✅ 기본 정렬: 제목순
  const [selectedProblem, setSelectedProblem] = useState<Question | null>(null);
  
  // ✅ 문제 삭제 함수
  const handleDeleteButtonClick = async (problem_id: number) => {
    try {
      const res = await fetch(`/api/proxy/problems/${problem_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`삭제 실패: ${errorText}`);
      }
      console.log("문제 삭제 성공");
      fetchProblems();
    } catch (error) {
      console.error("문제 삭제 중 에러 발생:", error);
    }
  };

  // ✅ 문제 목록 가져오기
  const fetchProblems = useCallback(async () => {
    try {
      const res = await problem_api.problem_get();
      setQuestions(res);
      setFilteredData(res);
    } catch (error) {
      console.error("내 문제 목록 불러오기 오류:", error);
      alert("내 문제 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // ✅ 검색 기능
  useEffect(() => {
    const filtered = questions.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filtered);
  }, [search, questions]);

  // ✅ 정렬 기능
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "등록일순") {
      return (
        new Date(b.createdAt ?? "1970-01-01").getTime() -
        new Date(a.createdAt ?? "1970-01-01").getTime()
      );
    }
    return 0;
  });

  // ✅ 페이지 이동
  const handleNavigate = () => {
    router.push("/registered-problems/create");
  };

  return (
    <motion.div>
      {/* 🔹 문제 만들기 버튼 */}
      <motion.div
        className="flex items-center gap-2 justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}>
        <button
          onClick={handleNavigate}
          className="flex items-center bg-black text-white px-4 py-1.5 rounded-xl m-2 text-md cursor-pointer
          hover:bg-gray-500 transition-all duration-200 ease-in-out
          active:scale-95">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          문제 만들기
        </button>
      </motion.div>

      {/* 🔹 검색 + 보기 전환 + 정렬 버튼 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}>
        <div className="flex-grow min-w-0">
          <SearchBar searchQuery={search} setSearchQuery={setSearch} />
        </div>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortButton
          sortOptions={["제목순", "등록일순"]}
          onSortChange={(selectedSort) => setSortOrder(selectedSort)}
        />
      </motion.div>

      {/* 🔹 문제 목록 제목 */}
      <motion.h2
        className="text-2xl font-bold mb-4 m-2 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}>
        나의 문제
      </motion.h2>
      <motion.hr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />

      {/* 🔹 갤러리 뷰 OR 테이블 뷰 */}
      {viewMode === "gallery" ? (
        <GalleryView
          filteredData={sortedData}
          selectedProblem={selectedProblem}
          handleCloseDetail={() => setSelectedProblem(null)}
          handleHoverStartProblem={(problem) => setSelectedProblem(problem)}
          handleHoverEndProblem={() => setSelectedProblem(null)}
          handleDeleteButtonClick={handleDeleteButtonClick}
        />
      ) : (
        <TableView
          filteredData={sortedData}
          handleDeleteButtonClick={handleDeleteButtonClick}
        />
      )}
    </motion.div>
  );
}
