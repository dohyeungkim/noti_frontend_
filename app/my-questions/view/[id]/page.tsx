"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

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
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>문제 보기</h1>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div>
          {isEditing ? (
            // ✅ 수정 모드 (입력 폼)
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: "1rem" }}>
                <label>문제 제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문제 제목을 입력하세요"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    marginTop: "0.5rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>문제 설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="문제 설명을 입력하세요"
                  style={{
                    width: "100%",
                    height: "150px",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    marginTop: "0.5rem",
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "blue",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)} // ❌ 수정 취소
                style={{
                  marginLeft: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "gray",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </form>
          ) : (
            // ✅ 일반 보기 모드 (텍스트 출력)
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
              <button
                onClick={() => setIsEditing(true)} // ✏️ 수정 모드 활성화
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "orange",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                수정하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
