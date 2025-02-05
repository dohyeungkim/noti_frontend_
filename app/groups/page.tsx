"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { groups } from "../../data/groups";
import SearchBar from "@/components/SearchBar";
import SortButton from "@/components/SortButton";
import OpenModalButton from "@/components/OpenModalButton";
import PageHeader from "@/components/PageHeader";
import GroupCreateModal from "@/components/GroupCreateModal";
import ViewToggle from "@/components/ViewToggle";
import GroupList from "@/components/grouppage/GroupList"; // ✅ 추가
import GroupTable from "@/components/grouppage/GroupTable"; // ✅ 추가

export default function GroupsPage() {
  const router = useRouter();
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

  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <PageHeader title="🏡 서연님의 그룹" />

      <div className="flex items-center gap-2 justify-end">
        <OpenModalButton onClick={() => setIsModalOpen(true)} label="그룹 생성하기" />
      </div>

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}
      <div className="flex items-center gap-4 mb-4 w-full">
        <div className="flex-grow min-w-0">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortButton onSortChange={setSortOrder} />
      </div>

      <h2 className="text-xl font-bold mb-4 m-2 pt-4">나의 그룹</h2>
      <hr className="border-t border-gray-300 my-4 m-2" />

      {/* ✅ 선택된 보기 방식에 따라 컴포넌트 사용 */}
      {viewMode === "gallery" ? <GroupList groups={sortedGroups} /> : <GroupTable groups={sortedGroups} />}

      {/* 모달창 */}
      <GroupCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupName={groupName}
        setGroupName={setGroupName}
        groupNumber={groupNumber}
        setGroupNumber={setGroupNumber}
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
        maxStudents={maxStudents}
        setMaxStudents={setMaxStudents}
        year={year}
        setYear={setYear}
        semester={semester}
        setSemester={setSemester}
      />
    </div>
  );
}
