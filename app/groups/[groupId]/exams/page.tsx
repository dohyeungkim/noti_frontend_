"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { exams } from "../../../../data/exams";
import { testExams } from "../../../../data/testmode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faSort } from "@fortawesome/free-solid-svg-icons";
import { groups } from "@/data/groups";

export default function ExamsPage() {
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    // <div className="p-8 bg-gray-100 min-h-screen ml-[4rem]">
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <header className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
        🏡 {myGroup ? myGroup.name : ""}
        </h1>
      </header>
      {/* 이건뭘까 */}

      <div className="flex justify-between items-center mb-6">
        {/* 검색바 */}
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
        <div className="flex gap-2 flex-shrink-0">
          <button className="border border-gray-300 rounded-md px-4 py-2">
            <FontAwesomeIcon icon={faSort} className="mr-2" />
            제목순
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-black text-white px-4 py-2 rounded-md text-lg cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            문제지 생성하기
          </button>
        </div>
      </div>

      {/* 문제지 리스트 */}
      <h2 className="text-xl font-bold mb-4">나의 문제지</h2>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => {
            const testMode = isTestMode(exam.examId);

            return (
              <div
                key={exam.examId}
                onClick={() => handleEnterExam(exam.examId)}
                className={`relative bg-white border border-gray-300 rounded-lg p-6 cursor-pointer shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg
                  ${testMode ? "bg-red-100 border-red-400" : ""}`}
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  📄 {exam.name}
                </h2>
                <p className="text-gray-600 text-sm">그룹: 프로그래밍 기초</p>
                <p className="text-gray-600 text-sm">{exam.description}</p>
                <p className="text-gray-500 text-sm">
                  시작 날짜: {exam.startDate}
                </p>

                {testMode && (
                  <p className="text-red-500 font-bold">🔥 시험 모드 진행 중</p>
                )}

                <button className="mt-4 w-full bg-black text-white py-2 rounded-md text-lg cursor-pointer">
                  들어가기
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 text-lg">
            등록된 문제지가 없습니다.
          </p>
        )}
      </section>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button className="px-4 py-2 border border-gray-400 rounded-md bg-gray-100 cursor-pointer">
          &lt;
        </button>
        <span className="text-lg font-semibold">1 / 1</span>
        <button className="px-4 py-2 border border-gray-400 rounded-md bg-gray-100 cursor-pointer">
          &gt;
        </button>
      </div>

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
