"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { groups } from "../../data/groups";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faSort } from "@fortawesome/free-solid-svg-icons";

export default function GroupsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("title");

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

  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <header className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">🏡 서연님의 그룹</h1>
      </header>
  
  {/* 검색바 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 w-full max-w-md">
          <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
          <input
            type="text"
            placeholder="그룹 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 w-full outline-none bg-transparent"
          />
        </div>

  {/* 정렬 & 그룹 생성 버튼 */}

        <div className="flex items-center gap-2">
          <button className="flex items-center border border-gray-300 rounded-md px-4 py-2">
            <FontAwesomeIcon icon={faSort} className="mr-2" />
            제목순
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-black text-white px-4 py-2 rounded-md text-lg cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            그룹 생성하기
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">나의 그룹</h2>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">그룹 생성하기</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-black text-2xl">❌</button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col">그룹 이름<input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="p-2 border border-gray-300 rounded-md mt-1"/></label>
              <label className="flex flex-col">그룹 번호<input type="text" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)} className="p-2 border border-gray-300 rounded-md mt-1"/></label>
              <label className="flex flex-col">초대 코드<input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="p-2 border border-gray-300 rounded-md mt-1"/></label>

              <div className="flex items-center gap-2">
                <label className="flex flex-col flex-1">인원 제한
                  <div className="flex items-center gap-2">
                    <input type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full mt-1"/>
                    <span className="mt-1">명</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex flex-col flex-1">연도<input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full mt-1"/></label>
                <span className="mt-6">년</span>
                <label className="flex flex-col flex-1">학기<input type="number" value={semester} onChange={(e) => setSemester(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full mt-1"/></label>
                <span className="mt-6">학기</span>
              </div>
            </div>

            <button onClick={() => setIsModalOpen(false)} className="mt-6 w-full bg-black text-white py-3 rounded-md text-lg cursor-pointer">그룹 생성하기</button>
          </div>
        </div>
      )}
    </div>
  );
}
