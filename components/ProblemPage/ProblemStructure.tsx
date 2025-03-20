"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ProblemSelector from "@/components/ProblemPage/ProblemModal/ProblemSelectorModal";
import OpenModalButton from "@/components/ui/OpenModalButton";
import SearchBar from "@/components/ui/SearchBar";
import ViewToggle from "@/components/ui/ViewToggle";
import ProblemGallery from "@/components/ProblemPage/ProblemGallery";
import { motion } from "framer-motion";
import ProblemList from "./ProblemList";

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  attempt_count: number;
  pass_count: number;
  is_like: boolean;
}

export default function ProblemStructure({
  params,
}: {
  params: { groupId: string; examId: string };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]); // ✅ 필터링된 문제 목록 저장
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  // const [sortOrder, setSortOrder] = useState("제목순");
  const { groupId, examId } = params; // params에서 직접 구조 분해 할당

  // `useMemo`로 캐싱하여 불필요한 재연산 방지
  const numericGroupId = useMemo(() => Number(groupId), [groupId]);
  const numericExamId = useMemo(() => Number(examId), [examId]);

  const [refresh, setRefresh] = useState(false);

  // ✅ 문제 가져오기 함수
  const fetchProblems = useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy/problems_ref/get`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: numericGroupId,
          workbook_id: numericExamId,
        }),
      });

      if (!res.ok) throw new Error("문제 데이터를 가져오는 데 실패했습니다.");

      const data = await res.json();
      console.log(data);
      setSelectedProblems(data);
      setFilteredProblems(data); // ✅ 초기 문제 목록 저장
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [numericGroupId, numericExamId]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // ✅ 검색어 변경 시 필터링 적용
  useEffect(() => {
    const filtered = selectedProblems.filter((problem) =>
      problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProblems(filtered);
  }, [searchQuery, selectedProblems]); // ✅ 검색어 또는 문제 목록이 변경될 때 필터링 실행

  return (
    <>
      {/* 문제 추가 버튼 */}
      <motion.div
        className="flex items-center gap-2 justify-end"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}>
        <OpenModalButton onClick={() => setIsModalOpen(true)} label="문제 추가하기" />
      </motion.div>

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -10 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
        }}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </motion.div>

      <h2 className="text-2xl font-bold mb-4 m-2 pt-2">나의 문제들</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      {/* 🔹 선택된 보기 방식에 따라 다르게 렌더링 */}
      {viewMode === "gallery" ? (
        <ProblemGallery
          problems={selectedProblems}
          groupId={numericGroupId}
          workbookId={numericExamId}
        />
      ) : (
        <ProblemList
          problems={selectedProblems} // ✅ 현재 선택된 문제 목록
          groupId={numericGroupId} // ✅ 그룹 ID
          workbookId={numericExamId}
        />
      )}

      <ProblemSelector
        groupId={numericGroupId}
        workbookId={numericExamId}
        selectedProblems={selectedProblems}
        setSelectedProblems={setSelectedProblems}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        refresh={refresh}
        setRefresh={setRefresh}
      />
    </>
  );
}
