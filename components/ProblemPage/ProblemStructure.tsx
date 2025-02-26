"use client";

import { useEffect, useState, useCallback } from "react";
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
}

export default function ProblemStructure({
  params,
}: {
  params: { groupId: string; examId: string };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  // const [sortOrder, setSortOrder] = useState("제목순");

  const [refresh, setRefresh] = useState(false);

  // 문제 가져오기 함수 (useCallback 적용 및 의존성 배열 추가)
  const fetchProblems = useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy/problems_ref/get`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: Number(params.groupId),
          workbook_id: Number(params.examId),
        }),
      });

      if (!res.ok) throw new Error("문제 데이터를 가져오는 데 실패했습니다.");

      const data = await res.json();
      console.log(data);
      setSelectedProblems(data);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [params.groupId || params.examId || refresh]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  
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
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />{" "}
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        {/* <SortButton onSortChange={setSortOrder} /> */}
      </motion.div>
      <h2 className="text-2xl font-bold mb-4 m-2 pt-2">나의 문제들</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />
      {/* 선택된 보기 방식에 따라 다르게 렌더링 */}
      {viewMode === "gallery" ? (
        <ProblemGallery
          problems={selectedProblems}
          groupId={Number(params.groupId)}
          workbookId={Number(params.examId)}
        />
      ) : (
        <ProblemList
          problems={selectedProblems} // ✅ 현재 선택된 문제 목록
          groupId={Number(params.groupId)} // ✅ 그룹 ID
          workbookId={Number(params.examId)}
        />
      )}

      <ProblemSelector
        groupId={Number(params.groupId)}
        workbookId={Number(params.examId)}
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
