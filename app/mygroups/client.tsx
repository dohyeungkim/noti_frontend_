"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { groups } from "../../data/groups";
import SearchBar from "@/components/Header/SearchBar";
import SortButton from "@/components/Header/SortButton";
import OpenModalButton from "@/components/Header/OpenModalButton";
import GroupCreateModal from "@/components/GroupPage/GroupCreateModal";
import ViewToggle from "@/components/Header/ViewToggle";
import GroupList from "@/components/GroupPage/GroupGallery";
import GroupTable from "@/components/GroupPage/GroupTable";

export default function GroupsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("제목순");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");

  // ✅ 공개 여부 상태 추가
  const [isPublic, setIsPublic] = useState(true); // 기본값: 공개

  // ✅ 그룹 이름 상태
  const [groupName, setGroupName] = useState("");

  // ✅ 그룹 생성 함수
  const handleCreateGroup = () => {
    console.log("새로운 그룹 생성:", { groupName, isPublic });

    // 여기에 실제 그룹 생성 로직 추가 (API 요청 등)
    
    setIsModalOpen(false); // 모달 닫기
  };

  // ✅ 검색어 필터링
  const filteredGroups = groups.filter((group) =>
    group.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.group_name.localeCompare(b.group_name);
    } else if (sortOrder === "생성일순") {
      return (
        new Date(b.createdAt || "1970-01-01").getTime() -
        new Date(a.createdAt || "1970-01-01").getTime()
      );
    } else if (sortOrder === "공개순") {
      return a.group_owner === b.group_owner ? 0 : a.group_owner ? -1 : 1;
    }
    return 0;
  });
  

  const formattedGroups = sortedGroups.map(group => ({
    group_name: group.group_name,
    group_owner: group.group_owner,
    group_state: group.group_state,
    group_id: group.group_id,
    member_count: group.member_count,
    createdAt: group.createdAt,
  }));

  return (
    <div>
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
          <GroupList groups={formattedGroups}  />
        ) : (
          <GroupTable groups={formattedGroups} className="animate-fade-in-up" />
        )}
      </motion.div>

      {/* ✅ 모달창 */}
      <GroupCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupName={groupName}
        setGroupName={setGroupName}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        onCreate={handleCreateGroup}
       
      />
    </div>
  );
}
