"use client";

import { useParams } from "next/navigation";
import { submissions } from "@/data/submissions"; // ✅ 제출 데이터

export default function SubmissionPage() {
  const { problemId } = useParams();

  if (!problemId) {
    return <p>⚠️ 잘못된 접근입니다.</p>;
  }

  // ✅ 문제 ID에 해당하는 제출 내역 필터링
  const filteredSubmissions = submissions.filter(
    (submission) => submission.problemId.toString() === problemId
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">🎯 제출 현황</h1>

      {filteredSubmissions.length === 0 ? (
        <p className="text-xl text-gray-500">제출 내역이 없습니다.</p>
      ) : (
        <table className="border-collapse border border-gray-300 w-full max-w-4xl text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">문제 ID</th>
              <th className="border p-2">사용자 ID</th>
              <th className="border p-2">결과</th>
              <th className="border p-2">메모리</th>
              <th className="border p-2">시간</th>
              <th className="border p-2">언어</th>
              <th className="border p-2">코드 길이</th>
              <th className="border p-2">제출 시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((submission) => (
              <tr key={submission.id} className="border">
                <td className="border p-2">{submission.id}</td>
                <td className="border p-2">{submission.problemId}</td>
                <td className="border p-2">{submission.userId}</td>
                <td
                  className={`border p-2 font-semibold ${
                    submission.result === "Accepted" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {submission.result}
                </td>
                <td className="border p-2">{submission.memory}</td>
                <td className="border p-2">{submission.time}</td>
                <td className="border p-2">{submission.language}</td>
                <td className="border p-2">{submission.codeLength}</td>
                <td className="border p-2">{submission.submissionTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => window.location.href = "/my-solved"}
        className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-lg"
      >
        내 문제 모음으로 돌아가기
      </button>
    </div>
  );
}
