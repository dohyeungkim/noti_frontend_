"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/ProblemPage/Modal_makeProblem";
import { problems } from "@/data/problems";
import { groups } from "@/data/groups";
import { testExams } from "@/data/testmode";
import PageHeader from "@/components/Header/PageHeader";
import OpenModalButton from "@/components/Header/OpenModalButton";
import SearchBar from "@/components/Header/SearchBar";
import ViewToggle from "@/components/Header/ViewToggle";
import SortButton from "@/components/Header/SortButton";
import ProblemGallery from "@/components/ProblemPage/ProblemGallery";
import ProblemTable from "@/components/ProblemPage/ProblemTable";
import Pagination from "@/components/Header/Pagination";

// 문제 데이터를 트리 구조로 변환하는 함수
const buildTree = (problems: any[]) => {
  const tree: any = {};

  problems.forEach((problem) => {
    if (!tree[problem.groupId]) {
      tree[problem.groupId] = {
        name: problem.groupId,
        type: "folder",
        children: {},
      };
    }
    if (!tree[problem.groupId].children[problem.examId]) {
      tree[problem.groupId].children[problem.examId] = {
        name: problem.examName,
        type: "folder",
        children: [],
      };
    }
    tree[problem.groupId].children[problem.examId].children.push({
      name: problem.title,
      type: "file",
      problemId: problem.problemId,
    });
  });

  return Object.values(tree).map((group: any) => ({
    ...group,
    children: Object.values(group.children),
  }));
};

export default function ProblemsPage() {
  const { examId, groupId } = useParams() as {
    examId: string;
    groupId: string;
  };
  const group = groups.find((g) => g.groupId === groupId);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [sortOrder, setSortOrder] = useState("제목순");

  // // ✅ 페이지네이션 추가
  // const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
  // const itemsPerPage = 10; // 한 페이지당 표시할 그룹 수

  const isTestMode = (examId: string) =>
    testExams.some((test) => test.examId === examId);

  // 현재 문제 필터링
  const filteredProblems = problems.filter(
    (problem) => problem.examId === examId
  );

  // 트리 구조 데이터 생성
  const treeData = buildTree(problems);

  // 검색 시 자동으로 펼쳐질 노드 저장
  const expandedNodes = new Set<string>();

  const searchedTreeData = searchTerm
    ? treeData
        .map((group) => {
          const filteredExams = group.children
            .map((exam: { children: any[]; name: string }) => {
              const filteredProblems = exam.children.filter((problem) =>
                problem.name.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (filteredProblems.length > 0) {
                expandedNodes.add(group.name);
                expandedNodes.add(exam.name);
              }

              return { ...exam, children: filteredProblems };
            })
            .filter((exam: { children: any[] }) => exam.children.length > 0);

          return { ...group, children: filteredExams };
        })
        .filter((group) => group.children.length > 0)
    : treeData;

  // 문제 선택 핸들러 (여러 개 선택 가능)
  const handleSelectProblem = (problemId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  };

  // ✅ 검색어 필터링
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ 정렬 적용
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.name.localeCompare(b.name);
    } else {
      return (
        new Date(b.createdAt || "1970-01-01").getTime() -
        new Date(a.createdAt || "1970-01-01").getTime()
      );
    }
  });

  // ✅ 페이지네이션 추가
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
  const itemsPerPage = 9; // 한 페이지당 표시할 항목 수
  const totalItems = sortedGroups.length; // ✅ 전체 항목 개수를 직접 사용
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage)); // ✅ 최소 1페이지 보장

  const paginatedGroups = sortedGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // ✅ 변환하여 넘김

  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      {/* 헤더 */}
      <PageHeader />

      {/* 문제추가버튼 */}
      <div className="flex items-center gap-2 justify-end">
        <OpenModalButton
          onClick={() => setIsModalOpen(true)}
          label="문제 추가하기"
        />
      </div>

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}
      <div className="flex items-center gap-4 mb-4 w-full">
        {/* 검색바 */}
        <div className="flex items-center gap-4 mb-4 w-full">
          <div className="flex-grow min-w-0">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <SortButton onSortChange={setSortOrder} />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 m-2 pt-2">나의 문제지</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      {/* 선택된 보기 방식에 따라 다르게 렌더링 */}
      {/* 선택된 보기 방식에 따라 다르게 렌더링 */}
      {viewMode === "gallery" ? (
        <ProblemGallery
          problems={filteredProblems}
          groupId={groupId}
          examId={examId}
          handleSelectProblem={handleSelectProblem}
        />
      ) : (
        <ProblemTable
          problems={filteredProblems}
          groupId={groupId}
          examId={examId}
          handleSelectProblem={handleSelectProblem}
        />
      )}

      <Pagination
        totalItems={totalItems} // ✅ 정확한 전체 항목 수 전달
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* 문제 추가 모달 */}
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        searchedTreeData={searchedTreeData}
        selectedProblems={selectedProblems}
        handleSelectProblem={handleSelectProblem}
        expandedNodes={expandedNodes}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
}
