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

interface ProblemListProps {
  problems: Problem[];
  groupId: number;
  workbookId: number;
 }

const ProblemList = ({
  problems,
  groupId,
  workbookId,
}: ProblemListProps) => {
  const router = useRouter();
  console.log("문제 리스트:", problems);

  return (
    <section>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
          <thead className="bg-gray-200">
            <tr className="border-b-4 border-gray-200 text-gray-800">
              <th className="px-5 py-4 text-center text-lg font-semibold">#</th>
              <th className="px-5 py-4 text-center text-lg font-semibold">
                문제 제목
              </th>
              <th className="px-5 py-4 text-center text-lg font-semibold">
                시도한 횟수
              </th>
              <th className="px-5 py-4 text-center text-lg font-semibold">
                맞은 횟수
              </th>
              <th className="px-5 py-4 text-center text-lg font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {problems.length > 0 ? (
              problems.map((p, index) => (
                <tr
                  key={p.problem_id}
                  className="transition-colors duration-200 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
                >
                  <td className="px-5 py-4 text-center">{index + 1}</td>
                  <td
                    className="px-5 py-4 text-center truncate max-w-[200px] overflow-hidden whitespace-nowrap"
                    title={p.title} // 🔹 툴팁으로 전체 제목 보기 가능
                    onClick={() => handleSelectProblem(p.problem_id)}
                  >
                    {p.title.length > 15
                      ? `${p.title.slice(0, 15)}...`
                      : p.title}
                  </td>

                  <td className="px-5 py-4 text-center">{p.attempt_count}</td>
                  <td className="px-5 py-4 text-center">{p.pass_count}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() =>
                        router.push(
                          `/mygroups/${groupId}/exams/${workbookId}/problems/${p.problem_id}`
                        )
                      }
                      className="w-full py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out active:scale-95 bg-gray-800 text-white hover:bg-gray-700"
                    >
                      도전하기
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-500">
                  📌 문제가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProblemList;
