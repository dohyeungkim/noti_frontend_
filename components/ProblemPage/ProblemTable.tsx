"use client";
import { useRouter } from "next/navigation";

interface ProblemTableProps {
  problems: any[];
  groupId: string;
  examId: string;
  handleSelectProblem: (problemId: string) => void;
}

const ProblemTable = ({ problems, groupId, examId, handleSelectProblem }: ProblemTableProps) => {
  const router = useRouter();

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-auto bg-transparent border-collapse m-2">
        <thead>
          <tr className="border-b-4 border-gray-200 text-gray-800">
            <th className="p-4 text-left text-lg font-semibold">문제 제목</th>
            <th className="p-4 text-left text-lg font-semibold">설명</th>
            <th className="p-4 text-center text-lg font-semibold">액션</th>
          </tr>
        </thead>
        <tbody>
          {problems.length > 0 ? (
            problems.map((problem) => (
              <tr
                key={problem.problemId}
                className="hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300 cursor-pointer"
                onClick={() => handleSelectProblem(problem.problemId)}
              >
                <td className="p-4 text-left text-gray-800">{problem.title}</td>
                <td className="p-4 text-left text-gray-600">{problem.description}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/groups/${groupId}/exams/${examId}/problems/${problem.problemId}`);
                    }}
                    className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium 
                               transition-all duration-300 ease-in-out hover:bg-gray-700 active:scale-95"
                  >
                    풀기
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 text-lg p-6">
                등록된 문제가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemTable;
