"use client";
import { useRouter } from "next/navigation";

interface ProblemListProps {
  problems: any[];
  groupId: string;
  examId: string;
  handleSelectProblem: (problemId: string) => void;
}

const ProblemList = ({ problems, groupId, examId, handleSelectProblem }: ProblemListProps) => {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {problems.map((problem) => (
        <div
          key={problem.problemId}
          className="relative bg-white border border-gray-300 p-6 rounded-lg shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
          onClick={() => handleSelectProblem(problem.problemId)}
        >
          <h2 className="text-xl font-semibold">{problem.title}</h2>
          <p className="text-gray-600 text-sm">{problem.description}</p>

          {/* 오른쪽 상단 점 표시 */}
          <div className="absolute top-4 right-4 w-3 h-3 bg-black rounded-full"></div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/mygroups/${groupId}/exams/${examId}/problems/${problem.problemId}`);
            }}
            className="mt-4 w-full bg-black text-white py-2 rounded-md text-lg cursor-pointer"
          >
            풀기
          </button>
        </div>
      ))}
    </section>
  );
};

export default ProblemList;
