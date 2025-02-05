"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { groups } from "../../data/groups";
import SearchBar from "@/components/Header/SearchBar";
import SortButton from "@/components/Header/SortButton";
import OpenModalButton from "@/components/Header/OpenModalButton";
import PageHeader from "@/components/Header/PageHeader";
import GroupCreateModal from "@/components/GroupPage/GroupCreateModal";
import ViewToggle from "@/components/Header/ViewToggle";
import GroupList from "@/components/GroupPage/GroupGallery"; // ✅ 추가
import GroupTable from "@/components/GroupPage/GroupTable"; // ✅ 추가
import Pagination from "@/components/Header/Pagination"; // ✅ 추가

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

  // const itemsPerPage = 10; // 한 페이지당 표시할 그룹 수

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

  // // ✅ 페이지네이션 적용
  // const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  // const paginatedGroups = sortedGroups.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );
  // const totalItems = totalPages * itemsPerPage;  // ✅ 변환하여 넘김
  

  // ✅ 페이지네이션 추가
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
  const itemsPerPage = 9; // 한 페이지당 표시할 항목 수
  const totalItems = sortedGroups.length; // ✅ 전체 항목 개수를 직접 사용
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage)); // ✅ 최소 1페이지 보장
  
  const paginatedGroups = sortedGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  


  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <PageHeader title="🏡 서연님의 그룹" />

      <div className="flex items-center gap-2 justify-end">
        <OpenModalButton
          onClick={() => setIsModalOpen(true)}
          label="그룹 생성하기"
        />
      </div>

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}
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

      <h2 className="text-2xl font-bold mb-4 m-2 pt-4">나의 그룹</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      {/* ✅ 선택된 보기 방식에 따라 컴포넌트 사용 */}
      {viewMode === "gallery" ? (
        <GroupList groups={paginatedGroups} />
      ) : (
        <GroupTable groups={paginatedGroups} />
      )}

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
      />

<Pagination 
  totalItems={totalItems}  // ✅ 정확한 전체 항목 수 전달
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
/>


    </div>
  );
}
