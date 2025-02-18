"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { groups } from "../../data/groups";
import SearchBar from "@/components/Header/SearchBar";
import SortButton from "@/components/Header/SortButton";
import OpenModalButton from "@/components/Header/OpenModalButton";
import PageHeader from "@/components/Header/PageHeader";
import GroupCreateModal from "@/components/GroupPage/GroupCreateModal";
import ViewToggle from "@/components/Header/ViewToggle";
import GroupList from "@/components/GroupPage/GroupGallery";
import GroupTable from "@/components/GroupPage/GroupTable";
import Pagination from "@/components/Header/Pagination";

export default function GroupsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("제목순");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");

  // ✅ 모달 상태 추가
  const [groupName, setGroupName] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [year, setYear] = useState("2025");
  const [semester, setSemester] = useState("1");

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalItems = sortedGroups.length;
  const paginatedGroups = sortedGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      // className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8"
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.3 }}
    >

      {/* 생성하기 버튼 */}
      <motion.div
        className="flex items-center gap-2 justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <OpenModalButton
          onClick={() => setIsModalOpen(true)}
          label="그룹 생성하기"
          className="transition transform hover:scale-105 hover:bg-gray-600 duration-200"
        />
      </motion.div>

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex-grow min-w-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            className="animate-fade-in"
          />
        </div>
        <ViewToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          className="animate-fade-in"
        />
        <SortButton onSortChange={setSortOrder} className="animate-fade-in" />
      </motion.div>

      <motion.h2
        className="text-2xl font-bold mb-4 m-2 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        나의 그룹
      </motion.h2>
      <motion.hr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />

      {/* ✅ 선택된 보기 방식에 따라 애니메이션 적용 */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {viewMode === "gallery" ? (
          <GroupList groups={paginatedGroups} className="animate-fade-in-up" />
        ) : (
          <GroupTable groups={paginatedGroups} className="animate-fade-in-up" />
        )}
      </motion.div>

      {/* 모달창 */}
      <GroupCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupName=""
        setGroupName={setGroupName}
        groupNumber=""
        setGroupNumber={setGroupNumber}
        inviteCode=""
        setInviteCode={setInviteCode}
        maxStudents=""
        setMaxStudents={setMaxStudents}
        year="2025"
        setYear={setYear}
        semester="1"
        setSemester={setSemester}
        className="animate-fade-in"
      />

      {/* 페이지네이션 */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          className="animate-fade-in"
        />
      </motion.div>
    </motion.div>
  );
}
