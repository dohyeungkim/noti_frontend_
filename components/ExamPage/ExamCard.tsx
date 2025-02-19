import { useEffect, useState } from "react";

interface ExamCardProps {
  workbook: {
    workbook_id: string;
    group_id: string;
    workbook_name: string;
    problem_cnt: number;
    description: string;
    creation_date: string;
  };
  exam?: {
    examId: string;
    startTime: string;
    endTime: string;
  } | null;
  onClick: () => void;
}

// ✅ 생성일을 'YY.MM.DD' 형식으로 변환하는 함수
const formatShortDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(2); // YY (두 자리 연도)
  const month = String(date.getMonth() + 1).padStart(2, "0"); // MM (두 자리 월)
  const day = String(date.getDate()).padStart(2, "0"); // DD (두 자리 날짜)
  return `${year}.${month}.${day}`;
};

export default function ExamCard({ workbook, exam, onClick }: ExamCardProps) {
  const [status, setStatus] = useState<"none" | "ready" | "in_progress" | "completed">("none");

  // ✅ 시험 상태 업데이트 (시험이 있는 경우)
  useEffect(() => {
    if (!exam) {
      setStatus("none"); // 시험 없음 (일반 모드)
      return;
    }

    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);

    if (now < start) {
      setStatus("ready"); // 시험 준비중
    } else if (now >= start && now <= end) {
      setStatus("in_progress"); // 시험 중
    } else {
      setStatus("completed"); // 시험 완료
    }
  }, [exam]);

  // ✅ 시험 상태에 따른 스타일 지정
  const getStatusStyle = () => {
    switch (status) {
      case "ready":
        return { label: "시험 준비중", bgColor: "bg-yellow-500", textColor: "text-yellow-100" };
      case "in_progress":
        return { label: "시험 중", bgColor: "bg-red-500", textColor: "text-red-100", glow: "shadow-red-500/50" };
      case "completed":
        return { label: "시험 완료", bgColor: "bg-green-500", textColor: "text-green-100" };
      default:
        return { label: "", bgColor: "", textColor: "" };
    }
  };

  const statusInfo = getStatusStyle();
  const formatShortDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(2); // YY (두 자리 연도)
    const month = String(date.getMonth() + 1).padStart(2, "0"); // MM (두 자리 월)
    const day = String(date.getDate()).padStart(2, "0"); // DD (두 자리 날짜)
    const hours = String(date.getHours()).padStart(2, "0"); // HH (24시간제)
    const minutes = String(date.getMinutes()).padStart(2, "0"); // MM (분)
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };
  
  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer 
                  shadow-md transition-all duration-300 ease-in-out 
                  hover:-translate-y-1 hover:shadow-xl transform-gpu
                  ${status === "in_progress" ? "border-red-500 shadow-red-500/50" : "hover:border-gray-400"}
                  ${status === "completed" ? "border-green-500 shadow-green-500/50" : ""}
      `}
    >
      {/* ✅ 시험 상태 배지 */}
      {status !== "none" && (
        <div className={`absolute top-3 right-3 ${statusInfo.bgColor} ${statusInfo.textColor} text-xs font-semibold px-3 py-1 rounded-full`}>
          {statusInfo.label}
        </div>
      )}

      {/* ✅ 카드 컨텐츠 */}
      <div>
      <h2 className="text-xl font-semibold mb-2">
          📄 {workbook.workbook_name}
        </h2>
        <p className="mb-1">{workbook.description}</p>
        <p className="mb-1">문제 수: {workbook.problem_cnt}개</p>
        <p className="mb-1">📅 생성일: {formatShortDate(workbook.creation_date)}</p>
      </div>

      {exam && (
  <div className="relative">
    <div className="absolute top-[-3.5rem] left-1/2 transform -translate-x-1/2 opacity-0 scale-95 transition-all duration-300 ease-in-out 
                    group-hover:opacity-100 group-hover:scale-100 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border border-gray-300 w-64 text-center">
      <p className="text-gray-800 text-md font-semibold mb-1">📌 시험 일정</p>
      <p className="text-gray-700 text-sm">⏳ 시작: {formatShortDateTime(exam.startTime)}</p>
      <p className="text-gray-700 text-sm">⏳ 종료: {formatShortDateTime(exam.endTime)}</p>
    </div>
  </div>
)}



      {/* ✅ 버튼 - 시험 상태에 따라 다르게 표시 */}
      <button
        className={`mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95
                    ${
                      status === "in_progress"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : status === "completed"
                        ? "bg-green-700 text-white hover:bg-green-600"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
      >
        {status === "in_progress"
          ? "시험 응시하기 →"
          : status === "completed"
          ? "결과 보기 →"
          : "문제 풀기 →"}
      </button>
    </div>
  );
}
