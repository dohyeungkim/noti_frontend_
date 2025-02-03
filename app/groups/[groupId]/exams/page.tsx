"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { exams } from "../../../../data/exams"; // 문제지 데이터 import
import { testExams } from "../../../../data/testmode"; // 시험 모드 데이터 import
///Users/lauran1/PJ_25_1/labpj/my-app/data/testmode.ts
export default function ExamsPage() {
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 그룹 ID에 따른 문제지 필터링
  const filteredExams = exams.filter((exam) => exam.groupId === groupId);

  // 시험 모드 확인 함수
  const isTestMode = (examId: string) => testExams.some((test: { examId: string; }) => test.examId === examId);

  // 문제지 클릭 시 이동
  const handleEnterExam = (examId: string) => {
    router.push(`/groups/${groupId}/exams/${examId}`);
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9f9f9", minHeight: "100vh", margin: "2rem" }}>
      {/* 헤더 */}
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "1rem" }}>
          🌳 그룹 ID: {groupId}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          + 문제지 생성하기
        </button>
      </header>

      {/* 문제지 리스트 */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => {
            const testMode = isTestMode(exam.examId); // 시험 모드 확인

            return (
              <div
                key={exam.examId}
                onClick={() => handleEnterExam(exam.examId)}
                style={{
                  backgroundColor: testMode ? "#ffcccc" : "white", // 시험 모드일 경우 연한 빨간색 적용
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.transform = "scale(1.03)";
                  target.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.transform = "scale(1)";
                  target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                }}
              >
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{exam.name}</h2>
                <p style={{ margin: "0.5rem 0" }}>{exam.description}</p>
                <p style={{ margin: "0.5rem 0", color: "#666" }}>시작 날짜: {exam.startDate}</p>

                {testMode && (
                  <p style={{ color: "red", fontWeight: "bold" }}>🔥 시험 모드 진행 중</p>
                )}

                <button
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem",
                    backgroundColor: "black",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "1rem",
                  }}
                >
                  들어가기
                </button>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "#999", fontSize: "1.2rem" }}>
            등록된 문제지가 없습니다.
          </p>
        )}
      </section>
    </div>
  );
}
