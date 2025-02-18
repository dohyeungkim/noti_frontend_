import { useState } from "react";

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  setGroupName: (value: string) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;

  onCreate: () => void; // ✅ 그룹 생성 함수 추가
}


export default function GroupCreateModal({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  isPublic,
  setIsPublic,
  onCreate, // ✅ 그룹 생성 함수
}: GroupCreateModalProps) {
  if (!isOpen) return null; // 모달이 닫혀 있으면 렌더링하지 않음

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">그룹 생성하기</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 text-2xl"
          >
            ✖
          </button>
        </div>

        {/* 입력 필드 */}
        <div className="flex flex-col gap-3 mt-4">
          <InputField value={groupName} setValue={setGroupName} placeholder="그룹 이름" />

          {/* 공개/비공개 선택 */}
          <div className="flex justify-between items-center border border-gray-300 p-2 rounded-lg">
            <span className="text-sm text-gray-600">그룹 상태</span>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`px-4 py-1 rounded-lg text-sm transition ${
                isPublic ? "bg-gray-800 text-white" : "bg-gray-400 text-gray-800"
              }`}
            >
              {isPublic ? "공개" : "비공개"}
            </button>
          </div>
        </div>

        {/* ✅ 그룹 생성 버튼 */}
        <div className="mt-6">
          <button
            onClick={() => {
              console.log("✅ 그룹 생성 버튼 클릭됨!"); // ✅ 실행 확인용 로그 추가
              onCreate(); // 그룹 생성 함수 실행
            }}
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
          >
            그룹 생성하기
          </button>
        </div>
      </div>
    </div>
  );
}

// 입력 필드 컴포넌트 추가
function InputField({
  value,
  setValue,
  placeholder,
  type = "text",
}: {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none transition text-gray-700"
    />
  );
}
