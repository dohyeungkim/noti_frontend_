"use client";
// 내가 등록한 문제들 조회하는 페이지
/**
 * 파일 탐색기 기능
 *
 *
 */
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

interface Question {
  problem_id: number;
  title: string;
  group: string;
  paper: string;
  solvedCount: number;
  createdAt?: string;
  description?: string;
}

export default function MyRegisteredProblemView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredData, setFilteredData] = useState<Question[]>([]);
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [sortOrder, setSortOrder] = useState("등록일순");
  const [selectedProblem, setSelectedProblem] = useState<Question | null>(null);

  const handleDeleteButtonClick = async (problem_id: number) => {
    try {
      await problem_api.problem_delete(problem_id);
      fetchProblems();
    } catch (error) {
      console.error("문제 삭제 중 에러 발생:", error);
    }
  };

  // ✅ ProblemDetail -> Question 어댑터 (API에 없을 수도 있는 필드는 기본값)
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // ✅ ProblemDetail -> Question 어댑터
  const toQuestion = (p: any): Question => ({
    problem_id: p?.problem_id,
    title: p?.title ?? "(제목 없음)",
    group: p?.description ?? "-", // 기존 group_name 대신 description왜 변수명이 이러냐고요? 원래는 그룹을 넣으려고 했던것 같아서 일딴은 사용하는 변수명만 바꿨습니다<div className=""></div>(진형준)
    paper: formatDate(p?.created_at), // YYYY-MM-DD 포맷으로 마찬가지로 변수명이 왜이러냐 불편하면 바꿔주세요 혹시몰라서 안바꿨어요 (진형준)
    solvedCount: Number(p?.attempt_count ?? 0),
    createdAt: p?.created_at,
    description: p?.description ?? "",
  });
  // 문제 목록 가져오기
  const fetchProblems = useCallback(async () => {
    try {
      const res = await problem_api.problem_get(); // ProblemDetail[]
      // ✅ 상태에 바로 넣지 말고 UI 모델로 변환
      const normalized = Array.isArray(res) ? res.map(toQuestion) : [];
      setQuestions(normalized);
      setFilteredData(normalized);
    } catch (error) {
      console.error("내 문제 목록 불러오기 오류:", error);
      alert("내 문제 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // 검색 필터
  const filteredQuestions = questions.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // 정렬
  const sortedData = [...filteredQuestions].sort((a, b) => {
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

  const handleNavigate = () => {
    router.push("/registered-problems/create");
  };

  return (
    <div className="space-y-2">
      {/* 🔹  버튼 */}
      <motion.div
        className="flex justify-end mb-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button
          onClick={handleNavigate}
          className="flex items-center bg-black text-white px-3 py-2 rounded-lg text-xs cursor-pointer
          hover:bg-gray-500 transition-all duration-200 ease-in-out
          active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1.5 text-xs" />
          
        </button>
      </motion.div>

      {/* 🔹 검색 + 보기 전환 + 정렬 버튼 */}
      <motion.div
        className="flex items-center gap-2 mb-2 w-full"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex-grow min-w-0">
          <SearchBar
            searchQuery={search}
            setSearchQuery={setSearch}
            className="animate-fade-in text-xs h-6 px-2 py-1"
          />
        </div>
        <ViewToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          className="animate-fade-in scale-75 h-6"
        />
        <SortButton
          sortOptions={["등록일순", "제목순"]}
          onSortChange={(selectedSort) => setSortOrder(selectedSort)}
          className="text-xs px-3 py-2 h-7"
        />
      </motion.div>

      {/* 🔹 문제 목록 제목 */}
      <motion.h2
        className="text-lg font-bold mb-3 m-1.5 pt-3"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        나의 문제
      </motion.h2>

      <motion.hr
        className="border-b-1 border-gray-300 my-3 m-1.5"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />

      {/* 🔹 갤러리 뷰 OR 테이블 뷰 */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-sm"
      >
        {sortedData.length === 0 ? (
          search ? (
            <p className="text-center text-gray-500 py-6 text-sm">
              🔍 <strong>&quot;{search}&quot;</strong>에 대한 검색 결과가
              없습니다.
            </p>
          ) : (
            <p className="text-center text-gray-500 py-6 text-sm">
              📭 등록된 문제가 없습니다. 문제를 추가해보세요!
            </p>
          )
        ) : viewMode === "gallery" ? (
          <div className="origin-top-left">
            <GalleryView
              filteredData={sortedData}
              selectedProblem={selectedProblem}
              handleCloseDetail={() => setSelectedProblem(null)}
              handleHoverStartProblem={(problem) => setSelectedProblem(problem)}
              handleHoverEndProblem={() => setSelectedProblem(null)}
              handleDeleteButtonClick={handleDeleteButtonClick}
            />
          </div>
        ) : (
          <div className="">
            <TableView
              filteredData={sortedData}
              handleDeleteButtonClick={handleDeleteButtonClick}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
