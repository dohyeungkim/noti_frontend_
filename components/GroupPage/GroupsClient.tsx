"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SearchBar from "@/components/ui/SearchBar";
import SortButton from "@/components/ui/SortButton";
import OpenModalButton from "@/components/ui/OpenModalButton";
import GroupCreateModal from "@/components/GroupPage/GroupCreateModal";
import ViewToggle from "@/components/ui/ViewToggle";
import GroupList from "@/components/GroupPage/GroupGallery";
import GroupTable from "@/components/GroupPage/GroupTable";

export default function GroupsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("제목순");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [refresh, setRefresh] = useState(false);

  const [isPublic, setIsPublic] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [myGroups, setMyGroups] = useState<
    {
      group_id: number;
      group_name: string;
      group_owner: string;
      group_private_state: boolean;
      member_count: number;
      createdAt?: string;
      is_member: boolean;
    }[]
  >([]);

  async function fetchMyGroups() {
    try {
      const response = await fetch("/api/proxy/groups");
      if (!response.ok) {
        throw new Error("내 그룹 데이터를 가져오는 데 실패했습니다.");
      }
      const data = await response.json();
      setMyGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("내 그룹 정보 가져오기 실패:", error);
      setMyGroups([]);
    }
  }

  useEffect(() => {
    fetchMyGroups();
  }, [refresh]);

  const filteredGroups = myGroups.filter((group) =>
    group.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.group_name.localeCompare(b.group_name);
    } else if (sortOrder === "생성일순") {
      return (
        new Date(b.createdAt ?? "1970-01-01").getTime() -
        new Date(a.createdAt ?? "1970-01-01").getTime()
      );
    } else if (sortOrder === "공개순") {
      return a.group_private_state === b.group_private_state ? 0 : a.group_private_state ? -1 : 1;
    }
    return 0;
  });

  return (
    <div>
      {/* 그룹 생성 버튼 */}
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}>
        <OpenModalButton
          onClick={() => setIsModalOpen(true)}
          label="그룹 생성하기"
          className="transition transform hover:scale-105 hover:bg-gray-600 duration-200"
        />
      </motion.div>

      {/* 검색 & 정렬 & 보기 방식 토글 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}>
        <div className="flex-grow min-w-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            className="animate-fade-in"
          />
        </div>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} className="animate-fade-in" />
        <SortButton onSortChange={setSortOrder} className="animate-fade-in" />
      </motion.div>

      <motion.h2
        className="text-2xl font-bold mb-4 m-2 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}>
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
        transition={{ duration: 0.3, delay: 0.4 }}>
        {viewMode === "gallery" ? (
          <GroupList groups={sortedGroups} />
        ) : (
          <GroupTable groups={sortedGroups} />
        )}
      </motion.div>

      {/* ✅ 그룹 생성 모달 */}
      <GroupCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupName={groupName}
        setGroupName={setGroupName}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        onCreate={() => console.log("그룹 생성 로직 추가 필요")}
        refresh={refresh}
        setRefresh={setRefresh}
      />
    </div>
  );
}
