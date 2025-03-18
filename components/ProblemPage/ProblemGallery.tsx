"use client";

import { useRouter } from "next/navigation";

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

const ProblemGallery = ({ problems, groupId, workbookId }: ProblemGalleryProps) => {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 m-2">
      {problems.map((p: Problem) => (
        <div
          key={p.problem_id}
          className="relative bg-white border border-gray-200 p-6 rounded-2xl shadow-md 
                     transition-transform overflow-hidden duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-gray-800 truncate">{p.title}</h2>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/mygroups/${groupId}/exams/${workbookId}/problems/${p.problem_id}`);
            }}
            className="mt-4 w-full bg-mygreen text-white py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-opacity-80 active:scale-95"
          >
            도전하기
          </button>
        </div>
      ))}
    </section>
  );
};

export default ProblemGallery;
