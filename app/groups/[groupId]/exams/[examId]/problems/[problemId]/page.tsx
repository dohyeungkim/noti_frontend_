"use client";

import { problems } from "@/data/problems";
import { testExams } from "@/data/testmode";
import { useParams, useRouter } from "next/navigation";

export default function ProblemDetailPage() {
  const router = useRouter();
  const { groupId, examId, problemId } = useParams() as {
    groupId: string;
    examId: string;
    problemId: string;
  };

  const problem = problems.find((p) => p.problemId === problemId);
  const isTestMode = testExams.some((test) => test.examId === examId);

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">문제를 찾을 수 없습니다</h1>
        <p className="text-gray-600">잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
      </div>
    );
  }

  const handleNavigate = () => {
    const destination = `/groups/${groupId}/exams/${examId}/problems/${problemId}/write`;
    router.push(destination);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold flex items-center gap-2">✏️ {problem.title}</h1>
        </div>

        <div className="flex gap-2">
          {isTestMode && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
              시험 모드 🚨
            </span>
          )}
          <button
            onClick={handleNavigate}
            className="bg-black text-white px-4 py-2 rounded-md text-lg hover:bg-gray-800 transition"
          >
            문제 풀기
          </button>
        </div>
      </header>

      {/* 문제 설명 */}
      <section className="mb-6 border p-4 rounded-md bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">문제</h2>
        <p className="text-gray-700">{problem.description}</p>
      </section>

      {/* 입력 & 출력 예시 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 입력 */}
        <section className="border p-4 rounded-md bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">입력</h3>
          <p className="text-gray-600">{problem.input}</p>
          <pre className="border p-4 rounded-md bg-gray-100 font-mono text-sm mt-2">
            {problem.input}
          </pre>
        </section>

        {/* 출력 */}
        <section className="border p-4 rounded-md bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">출력</h3>
          <p className="text-gray-600">{problem.output}</p>
          <pre className="border p-4 rounded-md bg-gray-100 font-mono text-sm mt-2">
            {problem.output}
          </pre>
        </section>
      </div>
    </div>
  );
}
