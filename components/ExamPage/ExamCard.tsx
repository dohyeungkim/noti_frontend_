interface ExamCardProps {
  exam: {
    workbook_id: string;
    group_id: string;
    workbook_name: string;
    description:string;
    creation_date: string
  };
  isTestMode: boolean;
  onClick: () => void;
}

export default function ExamCard({ exam, isTestMode, onClick }: ExamCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer 
                  shadow-md transition-all duration-300 ease-in-out 
                  hover:-translate-y-1 hover:shadow-lg
                  ${isTestMode ? "bg-red-50 border-red-400" : "hover:border-gray-300"}`}
    >
      {/* 🔥 시험 모드 배지 (오른쪽 상단 고정) */}
      {isTestMode && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          시험 모드
        </div>
      )}

      <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
        📄 {exam.workbook_name}
      </h2>
      <p className="text-gray-600 text-sm">{exam.description}</p>
      <p className="text-gray-500 text-sm mt-1">📅 {exam.creation_date}</p>

      <button
        className="mt-5 w-full bg-gray-800 text-white py-2 rounded-xl text-lg font-semibold 
                   transition-all duration-300 ease-in-out hover:bg-gray-700 active:scale-95"
      >
        문제 풀기 →
      </button>
    </div>
  );
}
