"use client";

import { workbook_api } from "@/lib/api";
import { useState } from "react";

interface WorkBookCreateModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  WorkBookName: string;
  setWorkBookName: (name: string) => void;
  WorkBookDescription: string;
  setWorkBookDescription: (description: string) => void;
  group_id: number;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
}

export default function WorkBookCreateModal({
  isModalOpen,
  setIsModalOpen,
  WorkBookName,
  setWorkBookName,
  WorkBookDescription,
  setWorkBookDescription,
  refresh,
  setRefresh,
  group_id,
}: WorkBookCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCreateWorkbook = async () => {
    setRefresh(!refresh);
    setIsLoading(true);

    if (!WorkBookName.trim()) {
      alert("문제지 이름을 입력해주세요.");
      return;
    }

    try {
      await workbook_api.workbook_create(group_id, WorkBookName, WorkBookDescription);

      setWorkBookName("");
      setWorkBookDescription("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("문제지 생성 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">문제지 추가하기</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-red-500 hover:text-red-700 text-2xl">
            ✖
          </button>
        </div>

        {/* 입력 폼 */}
        {!isConfirming ? (
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
          </div>
        ) : (
          // ✅ 문제지 생성 확인 단계
          <div className="text-center my-4">
            <h3 className="text-lg font-semibold mb-4">
              &quot;{WorkBookName}&quot; 문제지를 생성하시겠습니까?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCreateWorkbook}
                disabled={isLoading}
                className={`bg-green-600 text-white py-2 px-6 rounded-md transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}>
                {isLoading ? "생성 중..." : "예"}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition">
                아니요
              </button>
            </div>
          </div>
        )}

        {/* 문제지 생성 버튼 */}
        {!isConfirming && (
          <button
            onClick={() => setIsConfirming(true)}
            disabled={isLoading}
            className={`mt-4 w-full bg-black text-white py-3 rounded-md text-lg cursor-pointer hover:bg-gray-800 transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}>
            {isLoading ? "생성 중..." : "문제지 생성하기"}
          </button>
        )}
      </div>
    </div>
  );
}
