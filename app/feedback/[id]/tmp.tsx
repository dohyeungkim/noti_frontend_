"use client";

import { useParams } from "next/navigation";
import { feedbackData, Feedback } from "@/data/feedbackdata"; // ✅ 타입 가져오기
import { useEffect, useState } from "react";
import PageHeader from "@/components/Header/PageHeader";

export default function FeedbackPage() {
  const { id } = useParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null); // ✅ 명확한 타입 지정

  useEffect(() => {
    console.log("📌 현재 문제 ID:", id);
    console.log("📌 사용 가능한 피드백 키:", Object.keys(feedbackData));

    if (id && feedbackData[id as keyof typeof feedbackData]) {
      setFeedback(feedbackData[id as keyof typeof feedbackData]);
    }
  }, [id]);

  if (!feedback) {
    return <p>⚠️ 해당 문제의 피드백이 없습니다.</p>;
  }

  return (
    <div className="container mx-auto p-6">
<PageHeader></PageHeader>
      {/* ✅ 정답 */}
      <div className="p-4 border rounded-lg bg-green-100">
        <h2 className="text-xl font-semibold">✅ 정답</h2>
        <p>{feedback.correctAnswer}</p>
      </div>

      {/* 👍 잘한 점 */}
      <div className="p-4 border rounded-lg bg-blue-100 mt-4">
        <h2 className="text-xl font-semibold">👍 잘한 점</h2>
        <p>{feedback.goodPoints}</p>
      </div>

      {/* 🔥 개선할 점 */}
      <div className="p-4 border rounded-lg bg-yellow-100 mt-4">
        <h2 className="text-xl font-semibold">🔥 개선할 점</h2>
        <p>{feedback.improvementPoints}</p>
      </div>

      {/* ❌ 비슷한 오답 */}
      <div className="p-4 border rounded-lg bg-red-100 mt-4">
        <h2 className="text-xl font-semibold">❌ 비슷한 오답</h2>
        <ul>
          {feedback.similarMistakes.map((mistake: string, index: number) => ( // ✅ 명확한 타입 추가
            <li key={index}>- {mistake}</li>
          ))}
        </ul>
      </div>

      {/* 💬 토론 (댓글) */}
      <div className="p-4 border rounded-lg bg-gray-100 mt-4">
        <h2 className="text-xl font-semibold">💬 토론 & 댓글</h2>
        <ul>
          {feedback.comments.map((comment: { user: string; text: string }, index: number) => ( // ✅ 명확한 타입 추가
            <li key={index} className="border-b py-2">
              <strong>{comment.user}</strong>: {comment.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
