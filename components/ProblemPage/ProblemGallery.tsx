"use client";

import { useRouter } from "next/navigation";
// import { Dispatch, SetStateAction } from "react";

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  attempt_count: number;
  pass_count: number;
}

interface ProblemGalleryProps {
  problems: Problem[];
  groupId: number;
  workbookId: number;
}

const ProblemGallery = ({
  problems,
  groupId,
  workbookId,
}: ProblemGalleryProps) => {
  const router = useRouter();
  
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-2">
      {problems.map((p : Problem) => (
        <div
          key={p.problem_id}
          className="relative bg-white border border-gray-200 p-6 rounded-2xl shadow-md 
                     transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
          <h2 className="text-xl font-semibold text-gray-800"> {p.title}</h2>

          {/* 오른쪽 상단 점 표시 */}
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
            문제
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/mygroups/${groupId}/exams/${workbookId}/problems/${p.problem_id}`);
            }}
            className="mt-4 w-full bg-gray-800 text-white py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-gray-700 active:scale-95">
            도전하기
          </button>
        </div>
      ))}
    </section>
  );
};

export default ProblemGallery;
