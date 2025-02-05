"use client";
import { useRouter } from "next/navigation";

interface ProblemGalleryProps {
  problems: any[];
  groupId: string;
  examId: string;
  handleSelectProblem: (problemId: string) => void;
}

const ProblemGallery = ({ problems, groupId, examId, handleSelectProblem }: ProblemGalleryProps) => {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {problems.map((problem) => (
        <div
          key={problem.problemId}
          className="relative bg-white border border-gray-200 p-6 rounded-2xl shadow-md 
                     transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          onClick={() => handleSelectProblem(problem.problemId)}
        >
          <h2 className="text-xl font-semibold text-gray-800">{problem.title}</h2>
          <p className="text-gray-600 text-sm">{problem.description}</p>

          {/* 오른쪽 상단 점 표시 */}
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
            문제
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/groups/${groupId}/exams/${examId}/problems/${problem.problemId}`);
            }}
            className="mt-4 w-full bg-gray-800 text-white py-2 rounded-xl text-lg font-semibold 
                       transition-all duration-300 ease-in-out hover:bg-gray-700 active:scale-95"
          >
            풀기 →
          </button>
        </div>
      ))}
    </section>
  );
};

export default ProblemGallery;
