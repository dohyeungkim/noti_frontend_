"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { groups } from "../../data/groups";
import SearchBar from "@/components/SearchBar";
import SortButton from "@/components/SortButton";
import OpenModalButton from "@/components/OpenModalButton";
import PageHeader from "@/components/PageHeader";
import GroupCreateModal from "@/components/GroupCreateModal";

export default function GroupsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("제목순"); // 기본 정렬 방식 설정

  // ✅ 상태 추가
  const [groupName, setGroupName] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [year, setYear] = useState("2025");
  const [semester, setSemester] = useState("1");

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //✅ 정렬 방식에 따라 그룹 데이터 정렬
  const sortedGroups = [...groups].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.name.localeCompare(b.name); // 이름(제목)순 정렬 (오름차순)
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // 최신 생성일순 정렬 (내림차순)
    }
  });

  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <PageHeader title="🏡 서연님의 그룹" />
      <div className="flex items-center gap-2 justify-end">
        <OpenModalButton
          onClick={() => setIsModalOpen(true)}
          label="그룹 생성하기"
        />
      </div>
      {/* 검색바 컨테이너 */}
      <div className="flex items-center gap-4 mb-4 w-full">
        {/* 검색바 (남는 공간 전부 차지) */}
        <div className="flex-grow min-w-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* 정렬 버튼 */}
        <div className="flex items-center gap-2">
          <SortButton onSortChange={setSortOrder} />
        </div>
      </div>

      {/* 카드 생성 */}
      <h2 className="text-xl font-bold mb-4 m-2 pt-4">나의 그룹</h2>
      <hr className="border-t border-gray-300 my-4 m-2" />

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-2">
        {filteredGroups.map((group) => (
          <div
            key={group.groupId}
            onClick={() => router.push(`/groups/${group.groupId}/exams`)}
            className="relative bg-white border border-gray-300 rounded-lg p-6 cursor-pointer shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
            <p className="mb-1 text-gray-600">그룹 번호: {group.groupId}</p>
            <p className="mb-1 text-gray-600">수강생: {group.students}명</p>
            <div className="absolute top-4 right-4 w-3 h-3 bg-black rounded-full"></div>
            <div className="flex justify-between items-center text-gray-700 text-sm font-semibold mt-2">
              <span>교수: {group.professor}</span>
              <span>{group.semester}</span>
            </div>
            <button className="mt-4 w-full bg-black text-white py-2 rounded-md text-lg cursor-pointer">
              들어가기
            </button>
          </div>
        ))}
      </section>

      {/* 모달창 불러오기 */}
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
