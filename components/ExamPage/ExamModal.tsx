"use client";

interface ExamCreateModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  examName: string;
  setExamName: (name: string) => void;
  examId: string;
  setExamId: (id: string) => void;
  examDescription: string;
  setExamDescription: (description: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export default function ExamCreateModal({
  isModalOpen,
  setIsModalOpen,
  examName,
  setExamName,
  examId,
  setExamId,
  examDescription,
  setExamDescription,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: ExamCreateModalProps) {
  if (!isModalOpen) return null;

  return (
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
  );
}
