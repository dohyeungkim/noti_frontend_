import { useState } from "react";

interface ExamTableProps {
  workbooks: {
    workbook_id: string;
    group_id: string;
    workbook_name: string;
    problem_cnt: number;
    description: string;
    creation_date: string;
  }[];
  exams: {
    examId: string;
    startTime: string;
    endTime: string;
  }[];
  handleEnterExam: (examId: string) => void;
}

// ✅ 'YY.MM.DD' 형식으로 날짜 변환
const formatShortDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

// ✅ 'YY.MM.DD HH:MM' 형식으로 시간 변환
const formatShortDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

export default function ExamTable({ workbooks, exams, handleEnterExam }: ExamTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
        <thead className="bg-gray-200">
          <tr className="border-b-4 border-gray-300 text-gray-800">
            <th className="p-4 text-left text-lg font-semibold">문제지 이름</th>
            <th className="p-4 text-left text-lg font-semibold">문제지 설명</th>
            <th className="p-4 text-left text-lg font-semibold">문제 수</th>
            <th className="p-4 text-left text-lg font-semibold">생성일</th>
            <th className="p-4 text-center text-lg font-semibold">들어가기</th>
          </tr>
        </thead>
        <tbody>
          {workbooks.length > 0 ? (
            workbooks.map((workbook) => {
              const matchedExam = exams.find((e) => e.examId === workbook.workbook_id) || null;

              let rowBgColor = "bg-white"; // 기본 배경색
              let hoverBgColor = "hover:bg-gray-100"; // 기본 호버 색상
              let status: "none" | "ready" | "in_progress" | "completed" = "none";

              if (matchedExam) {
                const now = new Date();
                const start = new Date(matchedExam.startTime);
                const end = new Date(matchedExam.endTime);

                if (now < start) {
                  rowBgColor = "bg-yellow-50"; // 시험 준비중 (연한 노란색)
                  hoverBgColor = "hover:bg-yellow-100";
                  status = "ready";
                } else if (now >= start && now <= end) {
                  rowBgColor = "bg-red-50"; // 시험 중 (연한 빨간색)
                  hoverBgColor = "hover:bg-red-100";
                  status = "in_progress";
                } else {
                  rowBgColor = "bg-green-50"; // 시험 완료 (연한 초록색)
                  hoverBgColor = "hover:bg-green-100";
                  status = "completed";
                }
              }

              return (
                <tr
                  key={workbook.workbook_id}
                  className={`${rowBgColor} ${hoverBgColor} transition-colors duration-200 border-b border-gray-300 cursor-pointer group`}
                  onClick={() => handleEnterExam(workbook.workbook_id)}
                >
                  <td className="p-4 text-left text-gray-800 font-medium">📄 {workbook.workbook_name}</td>
                  <td className="p-4 text-left text-gray-600">{workbook.description}</td>
                  <td className="p-4 text-left text-gray-500">{workbook.problem_cnt}개</td>

                  <td className="p-4 text-left text-gray-500">📅 {formatShortDate(workbook.creation_date)}</td>
                  
                  <td className="p-4 text-center">
                    <button
                      className={`w-full py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out active:scale-95
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
                  </td>

                  {/* ✅ 시험 일정 (마우스 호버 시 표시) */}
                  {matchedExam && (
                    <td className="absolute bg-white border border-gray-300 shadow-md rounded-md p-3 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 w-56 left-1/2 transform -translate-x-1/2 mt-1">
                      <p className="text-gray-800 text-sm font-semibold mb-1">📌 시험 일정</p>
                      <p className="text-gray-700 text-xs">⏳ 시작: {formatShortDateTime(matchedExam.startTime)}</p>
                      <p className="text-gray-700 text-xs">⏳ 종료: {formatShortDateTime(matchedExam.endTime)}</p>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 text-lg p-6">
                등록된 문제지가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
