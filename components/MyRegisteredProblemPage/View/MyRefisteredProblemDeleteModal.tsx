"use client";

import { useState } from "react";

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const [isConfirming, setIsConfirming] = useState(true); // ✅ 상태 추가

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={onCancel} // ✅ 바깥 클릭 시 닫기
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative"
        onClick={(e) => e.stopPropagation()} // ✅ 내부 클릭 시 닫히지 않음
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">문제 삭제하기</h2>
          <button
            onClick={onCancel} // ✅ 닫기 버튼
            className="text-red-500 hover:text-red-700 text-2xl">
            ✖
          </button>
        </div>

        {/* ✅ 확인 단계 */}
        {isConfirming && (
          <div className="text-center my-4">
            <h3 className="text-lg font-semibold mb-4">{message}</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setIsConfirming(false); // ✅ 버튼 비활성화 후 삭제 진행
                  onConfirm();
                }}
                className="bg-green-600 text-white py-2 px-6 rounded-md transition hover:bg-green-700">
                예
              </button>
              <button
                onClick={onCancel}
                className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition">
                아니요
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
