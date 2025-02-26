//문제 리스트 기본페이지입니당
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

// ✅ Question 인터페이스 정의
interface Question {
  problem_id: number;
  title: string;
  group: string;
  paper: string;
  solvedCount: number;
  description?: string;
}

export default function MyRegisteredProblemView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [filteredData, setFilteredData] = useState<Question[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Question | null>(null);
  
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
      fetchProblems(); // 문제 목록을 다시 불러오기
    } catch (error) {
      console.error("문제 삭제 중 에러 발생:", error);
    }
  };

  const fetchProblems = useCallback(async () => {
    try {
      const res = await problem_api.problem_get();
      console.log(res);
      setQuestions(res);
      setFilteredData(res); // 초기 필터링 데이터 설정
    } catch (error) {
      console.error("내 문제 목록 불러오기 오류:", error);
      alert("내 문제 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }, []); // 의존성 배열 비워서 최초 마운트 시 실행

  // 검색어 변경 시 필터링
  useEffect(() => {
    const filteredQuestion = questions.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filteredQuestion);
  }, [search, questions]); // 검색어 변경 시 필터링 적용

  // 최초 마운트 시 문제 목록 불러오기
  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]); // useCallback으로 묶어 최신 함수 참조 유지

  // 문제 등록 페이지로 이동
  const handleNavigate = () => {
    router.push("/registered-problems/create"); // '/'을 추가하여 경로를 정확하게 지정
  };

  const handleHoverStartProblem = (problem: Question) => {   
      setSelectedProblem(problem);
  };

  const handleHoverEndProblem = () => {   
    setSelectedProblem(null);
  };


  const handleCloseDetail = () => {
    setSelectedProblem(null);
  };

  return (
    <motion.div>
      {/* 생성하기 버튼 */}
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

      {/* 버튼 영역 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}>
        <div className="flex-grow min-w-0">
          <SearchBar searchQuery={search} setSearchQuery={setSearch} />
        </div>
        {/* 보기 방식 & 정렬 버튼 */}
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortButton onSortChange={() => {}} />
      </motion.div>

      {/* 문제 목록 */}
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

      {/* 🔹 갤러리 뷰 */}
      <GalleryView
        filteredData={filteredData}
        selectedProblem={selectedProblem}
        handleCloseDetail={handleCloseDetail}
        handleHoverStartProblem={handleHoverStartProblem}
        handleHoverEndProblem={handleHoverEndProblem}
        handleDeleteButtonClick={handleDeleteButtonClick}
      />
    </motion.div>
  );
}
