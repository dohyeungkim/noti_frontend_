"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { exams } from "../../../../data/exams";
import { testExams } from "../../../../data/testmode";

import { groups } from "@/data/groups";
import PageHeader from "@/components/Header/PageHeader";
import OpenModalButton from "@/components/Header/OpenModalButton";
import SearchBar from "@/components/Header/SearchBar";
import ViewToggle from "@/components/Header/ViewToggle";
import SortButton from "@/components/Header/SortButton";
import Pagination from "@/components/Header/Pagination";
import ExamGallery from "@/components/ExamPage/ExamGallery";
import ExamTable from "@/components/ExamPage/ExamTable";

export default function ExamsPage() {
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("제목순");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");

  const [examName, setExamName] = useState("머신러닝");
  const [examId, setExamId] = useState("ML12");
  const [examDescription, setExamDescription] = useState("");
  const [startDate, setStartDate] = useState("2025-12-31 00:00");
  const [endDate, setEndDate] = useState("2025-12-31 00:00");

  const filteredExams = exams
    .filter((exam) => exam.groupId === groupId)
    .filter((exam) =>
      exam.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const isTestMode = (examId: string) =>
    testExams.some((test) => test.examId === examId);

  const handleEnterExam = (examId: string) => {
    router.push(`/groups/${groupId}/exams/${examId}`);
  };

  const myGroup = groups.find((group) => group.groupId === groupId);

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
  const itemsPerPage = 10; // 한 페이지당 표시할 그룹 수

  // ✅ 페이지네이션 적용
  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  const paginatedGroups = sortedGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    // <div className="p-8 bg-gray-100 min-h-screen ml-[4rem]">
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <PageHeader title={`🏡 ${myGroup ? myGroup.name : ""}`} />
      <div className="flex items-center gap-2 justify-end">
        <OpenModalButton
          onClick={() => setIsModalOpen(true)}
          label="문제지 생성하기"
        />
      </div>

      <h2 className="text-2xl font-bold mb-4 m-2 pt-4">나의 문제지</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}

      <div className="flex justify-between items-center mb-6">
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
      {viewMode === "gallery" ? (
        <ExamGallery exams={filteredExams} handleEnterExam={handleEnterExam} isTestMode={isTestMode} />
      ) : (
        <ExamTable exams={filteredExams} handleEnterExam={handleEnterExam} isTestMode={isTestMode} />
      )}

      {/* ✅ 페이지네이션 추가 */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">문제지 추가하기</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-black text-2xl"
              >
                ❌
              </button>
            </div>

            {/* 입력 폼 */}
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="문제지 이름"
                className="p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              />
              <textarea
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                placeholder="문제지 소개"
                className="p-2 border border-gray-300 rounded-md h-20"
              />

              {/* 공개 시간 설정 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">공개 시간 설정</label>
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <span>~</span>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* 문제지 생성 버튼 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full bg-black text-white py-3 rounded-md text-lg cursor-pointer"
            >
              문제지 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
