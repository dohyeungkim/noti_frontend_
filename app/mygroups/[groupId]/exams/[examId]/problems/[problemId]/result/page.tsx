"use client";

import { useParams } from "next/navigation";
import { problemStatus } from "@/data/problemstatus"; // ✅ 문제 상태 데이터

export default function ResultPage() {
  const { problemId } = useParams();

  if (!problemId) {
    return <p>⚠️ 잘못된 접근입니다.</p>;
  }

  // ✅ 문제 상태 가져오기 (맞음/틀림)
  const status = problemStatus[problemId as keyof typeof problemStatus] || "푸는 중";

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">🎯 제출 결과</h1>

      {status === "맞음" ? (
        <p className="text-2xl font-semibold text-green-500">✅ 맞았습니다!</p>
      ) : (
        <>
          <p className="text-2xl font-semibold text-red-500">❌ 틀렸습니다!</p>
          <button
            onClick={() => window.location.href = `/feedback/${problemId}`} // ✅ 피드백 페이지 이동
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            피드백 보기
          </button>
        </>
      )}

      <button
        onClick={() => window.location.href = "/my-solved"} // ✅ 내 문제 모음으로 이동
        className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-lg"
      >
        내 문제 모음으로 돌아가기
      </button>
    </div>
  );
}
