"use client";

import { useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa"; // 📅 달력 아이콘 추가

interface WorkBookCreateModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  WorkBookName: string;
  setWorkBookName: (name: string) => void;
  WorkBookDescription: string;
  setWorkBookDescription: (description: string) => void;
}

export default function WorkBookCreateModal({
  isModalOpen,
  setIsModalOpen,
  WorkBookName,
  setWorkBookName,
  WorkBookDescription,
  setWorkBookDescription,
}: WorkBookCreateModalProps) {
  const [isWorkBookMode, setIsWorkBookMode] = useState(false); // ✅ 시험 모드 상태 추가
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">문제지 추가하기</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-red-500 hover:text-red-700 text-2xl"
          >
            ✖
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="flex flex-col gap-4 mt-4">
          {/* 문제지 이름 */}
          <input
            type="text"
            value={WorkBookName}
            onChange={(e) => setWorkBookName(e.target.value)}
            placeholder="문제지 이름"
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:outline-none transition"
          />

          {/* 문제지 소개 */}
          <textarea
            value={WorkBookDescription}
            onChange={(e) => setWorkBookDescription(e.target.value)}
            placeholder="문제지 소개"
            className="p-2 border border-gray-300 rounded-md h-20 focus:ring-2 focus:ring-gray-500 focus:outline-none transition"
          />

          {/* 시험 모드 토글 */}
          <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md cursor-pointer">
            <span className="text-sm text-gray-600">시험 모드</span>
            <label className="relative inline-block w-10 h-5">
              <input
                type="checkbox"
                checked={isWorkBookMode}
                onChange={() => setIsWorkBookMode(!isWorkBookMode)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></div>
              <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
            </label>
          </div>

          {/* ✅ 시험 모드 선택 시 공개 시간 설정 표시 */}
          {/* ✅ 시험 모드 선택 시 공개 시간 설정 표시 */}
{isWorkBookMode && (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">공개 시간 설정</label>
    <div className="flex items-center gap-2">
      {/* 시작 날짜 입력 */}
      <div className="relative flex-1 min-w-[150px] max-w-[220px]"> {/* 크기 조절 */}
        <input
          type="datetime-local"
          value={startDate ? startDate.toISOString().slice(0, 16) : ""}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          className="text-xs p-2 border border-gray-300 rounded-md w-full pl-3 focus:ring-2 focus:ring-gray-500 focus:outline-none transition"
        />
      </div>

      <span>~</span>

      {/* 종료 날짜 입력 */}
      <div className=" relative flex-1 min-w-[150px] max-w-[220px]"> {/* 크기 조절 */}
        <input
          type="datetime-local"
          value={endDate ? endDate.toISOString().slice(0, 16) : ""}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          className=" text-xs p-2 border border-gray-300 rounded-md w-full pl-3 focus:ring-2 focus:ring-gray-500 focus:outline-none transition"
        />
      </div>
    </div>
  </div>
)}

        </div>

        {/* 문제지 생성 버튼 */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="mt-4 w-full bg-black text-white py-3 rounded-md text-lg cursor-pointer hover:bg-gray-800 transition"
        >
          문제지 생성하기
        </button>
      </div>
    </div>
  );
}