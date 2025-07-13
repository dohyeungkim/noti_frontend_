"use client";//클라이언트 사용

import { useEffect, useState, useCallback, useMemo } from "react";//훅, 모듈 추가
import ProblemSelector, { Problem } from "@/components/ProblemPage/ProblemModal/ProblemSelectorModal";
import OpenModalButton from "@/components/ui/OpenModalButton";
import SearchBar from "@/components/ui/SearchBar";
import ViewToggle from "@/components/ui/ViewToggle";
import ProblemGallery from "@/components/ProblemPage/ProblemGallery";
import { motion } from "framer-motion";
import ProblemList from "./ProblemList";
import { useAuth } from "@/stores/auth";
import { group_api, problem_ref_api } from "@/lib/api";

export default function ProblemStructure({
  params,
}: {
  params: { groupId: string; examId: string };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const { groupId, examId } = params;
  const { userName } = useAuth();

  const numericGroupId = useMemo(() => Number(groupId), [groupId]);
  const numericExamId = useMemo(() => Number(examId), [examId]);

  const [refresh, setRefresh] = useState(false);

  // 그룹 오너 정보 상태
  const [groupOwner, setGroupOwner] = useState<string | null>(null);
  const isGroupOwner = userName === groupOwner;

  // 그룹 오너 정보 가져오기
  const fetchMyOwner = useCallback(async () => {
    try {
      const data = await group_api.my_group_get();
      const currentGroup = data.find(
        (group: { group_id: number; group_owner: string }) => group.group_id === Number(groupId)
      );
      setGroupOwner(currentGroup?.group_owner || null);
    } catch (error) {
      console.error("그룹장 불러오기 중 오류:", error);
    }
  }, [groupId]);

  // 문제 가져오기 함수
  const fetchProblems = useCallback(async () => {
    try {
      const data = await problem_ref_api.problem_ref_get(numericGroupId, numericExamId);
      setSelectedProblems(data);
      setFilteredProblems(data);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [numericGroupId, numericExamId]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems, refresh]);

  // 그룹 오너 정보도 가져오기 (그룹 ID가 변경되거나 컴포넌트 마운트 시)
  useEffect(() => {
    if (groupId) {
      fetchMyOwner();
    }
  }, [groupId, fetchMyOwner]);

  useEffect(() => {
    const filtered = selectedProblems.filter((problem) =>
      problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProblems(filtered);
  }, [searchQuery, selectedProblems, refresh]);

  return (//사용자 UI
    <>
      {/* 문제 추가 버튼: 그룹 오너일 때만 보임 */}
      <motion.div
        className="flex items-center gap-2 justify-end"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}>
        {isGroupOwner && (
          <OpenModalButton onClick={() => setIsModalOpen(true)} label="문제 추가하기" />
        )}
      </motion.div>

      {/* 검색바 & 보기 방식 토글 */}
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

      {filteredProblems.length === 0 ? (
        searchQuery ? (
          <p className="text-center text-gray-500 mt-10">
            🔍 <strong>&quot;{searchQuery}&quot;</strong>에 대한 검색 결과가 없습니다.
          </p>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            📭 등록된 문제가 없습니다. 문제를 추가해보세요!
          </p>
        )
      ) : viewMode === "gallery" ? (
        <ProblemGallery
          problems={filteredProblems}
          groupId={numericGroupId}
          workbookId={numericExamId}
          isGroupOwner={isGroupOwner}
          refresh = {refresh}
          setRefresh={setRefresh}
        />
      ) : (
        <ProblemList
          problems={filteredProblems}
          groupId={numericGroupId}
          workbookId={numericExamId}
          isGroupOwner={isGroupOwner}
          refresh = {refresh}
          setRefresh={setRefresh}
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
