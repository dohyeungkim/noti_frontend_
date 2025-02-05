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
import ExamCreateModal from "@/components/ExamPage/ExamModal"; // ✅ 모달 import

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

  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      {/* 헤더 */}
      <PageHeader title={`🏡 ${myGroup ? myGroup.name : ""}`} />

      {/* 생성하기 버튼 */}
      <div className="flex items-center gap-2 justify-end">
        <OpenModalButton onClick={() => setIsModalOpen(true)} label="문제지 생성하기" />
      </div>

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}
      <div className="flex items-center gap-4 mb-4 w-full">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortButton onSortChange={setSortOrder} />
      </div>

      <h2 className="text-2xl font-bold mb-4 m-2 pt-4">나의 문제지</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      {viewMode === "gallery" ? (
        <ExamGallery exams={filteredExams} handleEnterExam={handleEnterExam} isTestMode={isTestMode} />
      ) : (
        <ExamTable exams={filteredExams} handleEnterExam={handleEnterExam} isTestMode={isTestMode} />
      )}

      {/* ✅ 페이지네이션 추가 */}
      <Pagination totalPages={Math.ceil(filteredExams.length / 10)} currentPage={1} setCurrentPage={() => {}} />

      {/* ✅ 모달을 외부 파일에서 가져와 사용 */}
      <ExamCreateModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        examName={examName}
        setExamName={setExamName}
        examId={examId}
        setExamId={setExamId}
        examDescription={examDescription}
        setExamDescription={setExamDescription}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
    </div>
  );
}
