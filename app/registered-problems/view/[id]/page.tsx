"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ViewQuestionPage() {
  const router = useRouter();
  const { id } = useParams(); // ✅ URL에서 문제 ID 가져오기

  // 🔹 문제 데이터 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false); // ✅ 수정 모드 상태
  const [loading, setLoading] = useState(true);

  // ✅ 기존 문제 데이터 불러오기
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(
          `http://210.115.227.15:8000/api/problems/${id}`
        );
        if (!response.ok) throw new Error("문제를 불러오지 못했습니다.");

        const data = await response.json();
        setTitle(data.name);
        setDescription(data.description);
        setLoading(false);
      } catch (error) {
        console.error("문제 가져오기 오류:", error);
        alert("문제를 불러오는 데 실패했습니다.");
        router.push("/my-questions"); // 실패하면 목록 페이지로 이동
      }
    };

    if (id) fetchQuestion();
  }, [id, router]);

  // ✅ 문제 수정 요청 (PUT 요청)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://210.115.227.15:8000/api/problems/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: title, description }),
        }
      );

      if (!response.ok) throw new Error("문제 수정 실패");

      alert("문제가 성공적으로 수정되었습니다.");
      setIsEditing(false); // ✅ 수정 모드 종료
    } catch (error) {
      console.error("문제 수정 오류:", error);
      alert("문제 수정에 실패했습니다.");
    }
  };

  return (
    <motion.div
      className="bg-[#f9f9f9] min-h-screen flex justify-center items-center p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white shadow-lg rounded-3xl p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">
          ✏️ 문제 보기
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">로딩 중...</p>
        ) : (
          <motion.div
            key={isEditing ? "edit" : "view"} // 수정 모드 전환 애니메이션 적용
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isEditing ? (
              // ✅ 수정 모드 (입력 폼)
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="text-gray-600 font-medium">문제 제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="문제 제목을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-gray-600 font-medium">문제 설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="문제 설명을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-blue-600 active:scale-95"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-gray-500 active:scale-95"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              // ✅ 일반 보기 모드 (텍스트 출력)
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {title}
                  </h2>
                </div>
                <div>
                  <p className="text-gray-600">{description}</p>
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-orange-600 active:scale-95"
                  >
                    수정하기
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
