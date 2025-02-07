interface ExamTableProps {
  exams: {
    examId: string;
    name: string;
    description: string;
    startDate: string;
  }[];
  handleEnterExam: (examId: string) => void;
  isTestMode: (examId: string) => boolean;
}

export default function ExamTable({ exams, handleEnterExam, isTestMode }: ExamTableProps) {
  return (
    <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
        <thead className="bg-gray-200">
          <tr className="border-b-4 border-gray-200  text-gray-800">
            <th className="p-4 text-left text-lg font-semibold">문제지 이름</th>
            <th className="p-4 text-left text-lg font-semibold">설명</th>
            <th className="p-4 text-left text-lg font-semibold">시작 날짜</th>
            <th className="p-4 text-center text-lg font-semibold">시험 모드</th>
            <th className="p-4 text-center text-lg font-semibold">액션</th>
          </tr>
        </thead>
        <tbody>
          {exams.length > 0 ? (
            exams.map((exam) => (
              <tr
                key={exam.examId}
                className="hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300 cursor-pointer"
                onClick={() => handleEnterExam(exam.examId)}
              >
                <td className="p-4 text-left text-gray-800">{exam.name}</td>
                <td className="p-4 text-left text-gray-600">{exam.description}</td>
                <td className="p-4 text-left text-gray-500">{exam.startDate}</td>
                <td className="p-4 text-center">
                  {isTestMode(exam.examId) ? (
                    <span className="text-red-500 font-bold text-sm bg-red-100 px-3 py-1 rounded-md">
                      🔥 진행 중
                    </span>
                  ) : (
                    <span className="text-gray-400">❌</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button
                    className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium 
                               transition-all duration-300 ease-in-out hover:bg-gray-700 active:scale-95"
                  >
                    들어가기
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 text-lg p-6">
                등록된 문제지가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
