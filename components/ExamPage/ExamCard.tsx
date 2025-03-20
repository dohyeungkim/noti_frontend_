"use client";

interface ExamCardProps {
  workbook: {
    workbook_id: number;
    group_id: number;
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


export default function ExamCard({ workbook, onClick }: ExamCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer 
                shadow-md transition-all duration-300 ease-in-out 
                hover:-translate-y-1 hover:shadow-xl transform-gpu 
                flex flex-col justify-between h-full"
    >
      {/* ✅ 제목 (workbook_name) - 상단 고정 */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          📄{" "}
          {workbook.workbook_name.length > 24
            ? `${workbook.workbook_name.slice(0, 24)}...`
            : workbook.workbook_name}
        </h2>
      </div>

      {/* ✅ 설명 및 정보 - 하단 정렬 */}
      <div>
        <p
          title={workbook.description}
          className="mb-1 w-full text-gray-600 text-sm overflow-hidden text-ellipsis line-clamp-2"
        >
          {workbook.description}
        </p>
        <p className="mb-2  ">📌 문제 수: {workbook.problem_cnt}개</p>
      </div>

      {/* ✅ 버튼 - 항상 아래에 위치 */}
      <button className="w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80">
        문제지 펼치기 →
      </button>
    </div>
  );
}
