"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { workbook } from "@/data/workbook";
import { testExams } from "@/data/testmode";

import OpenModalButton from "@/components/Header/OpenModalButton";
import SearchBar from "@/components/Header/SearchBar";
import ViewToggle from "@/components/Header/ViewToggle";
import SortButton from "@/components/Header/SortButton";
import ExamGallery from "@/components/ExamPage/ExamGallery";
import ExamTable from "@/components/ExamPage/ExamTable";
import ExamCreateModal from "@/components/ExamPage/ExamModal";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamsClient() {
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();

  // 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("제목순");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");

  const [examName, setExamName] = useState("머신러닝");
  const [examId, setExamId] = useState("ML12");
  const [examDescription, setExamDescription] = useState("");
  const [startDate, setStartDate] = useState("2025-12-31 00:00");
  const [endDate, setEndDate] = useState("2025-12-31 00:00");

  const filteredExams = workbook
    .filter((workbook) => workbook.group_id === groupId)
    .filter((workbook) =>
      workbook.workbook_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const isTestMode = (examId: string) =>
    testExams.some((test) => test.examId === examId);

  const handleEnterExam = (examId: string) => {
    router.push(`/mygroups/${groupId}/exams/${examId}`);
  };

  const filteredworkbooks = workbook
  .filter((wb) => wb.group_id === groupId) // ✅ 그룹 ID 필터링 추가
  .filter((wb) =>
    wb.workbook_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedworkbook = [...filteredworkbooks].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.workbook_name.localeCompare(b.workbook_name);
    } else if (sortOrder === "생성일순") {
      return (
        new Date(b.creation_date ?? "1970-01-01").getTime() - 
        new Date(a.creation_date ?? "1970-01-01").getTime()
      );
    }
    return 0;
  });
  

  const formattedworkbook = sortedworkbook.map((workbook) => ({
    workbook_id: workbook.workbook_id,
    group_id: workbook.group_id,
    workbook_name: workbook.workbook_name,
    description: workbook.description,
    creation_date: workbook.creation_date,
  }));

  return (
    <motion.div>
      {/* 문제지 생성 버튼 */}
      <motion.div
        className="flex items-center gap-2 justify-end"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <OpenModalButton
          onClick={() => setIsModalOpen(true)}
          label="문제지 생성하기"
        />
      </motion.div>

      {/* 검색 & 정렬 & 보기 방식 변경 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -10 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div
          className="flex-grow min-w-0"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </motion.div>
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </motion.div>
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <SortButton onSortChange={setSortOrder} />
        </motion.div>
      </motion.div>

      {/* 문제지 목록 */}
      <h2 className="text-2xl font-bold mb-4 m-2 pt-2">나의 문제지</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {viewMode === "gallery" ? (
          <ExamGallery
            exams={formattedworkbook}
            handleEnterExam={handleEnterExam}
            isTestMode={isTestMode}
          />
        ) : (
          <ExamTable
            exams={formattedworkbook}
            handleEnterExam={handleEnterExam}
            isTestMode={isTestMode}
          />
        )}
      </motion.div>

      {/* 모달 */}
      <AnimatePresence>
        {isModalOpen && (
          <ExamCreateModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            WorkBookName={examName}
            setWorkBookName={setExamName}
           
            WorkBookDescription={examDescription}
            setWorkBookDescription={setExamDescription}
           
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}