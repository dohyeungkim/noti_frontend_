"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { exams } from "../../../../data/exams"; // 문제지 데이터 import

export default function ExamsPage() {
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  // 입력 상태 관리
  const [examName, setExamName] = useState("머신러닝");
  const [examId, setExamId] = useState("ML12");
  const [examDescription, setExamDescription] = useState("");
  const [startDate, setStartDate] = useState("2025-12-31 00:00");
  const [endDate, setEndDate] = useState("2025-12-31 00:00");

  // 그룹 ID에 따른 문제지 필터링
  const filteredExams = exams.filter((exam) => exam.groupId === groupId);

  // 문제지 클릭 시 이동
  const handleEnterExam = (examId: string) => {
    router.push(`/groups/${groupId}/exams/${examId}`);
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9f9f9", minHeight: "100vh", margin: "2rem" }}>
      {/* 헤더 */}
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "1rem" }}>🌳 그룹 ID: {groupId}</h1>
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
          filteredExams.map((exam) => (
            <div
              key={exam.examId}
              onClick={() => handleEnterExam(exam.examId)}
              style={{
                backgroundColor: "white",
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
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#999", fontSize: "1.2rem" }}>등록된 문제지가 없습니다.</p>
        )}
      </section>

      {/* 모달 (isModalOpen이 true일 때만 표시) */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "10px",
            width: "400px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            {/* 모달 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>문제지 추가하기</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ fontSize: "1.2rem", cursor: "pointer" }}>❌</button>
            </div>

            {/* 입력 폼 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="문제지 이름"
                style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
              <input type="text" value={examId} onChange={(e) => setExamId(e.target.value)}
                style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
              <textarea value={examDescription} onChange={(e) => setExamDescription(e.target.value)} placeholder="문제지 소개"
                style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px", height: "80px" }} />
              <div>
                <label>공개 시간 설정</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  style={{ marginLeft: "1rem", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
                ~
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  style={{ marginLeft: "1rem", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
              </div>
            </div>

            {/* 문제지 생성 버튼 */}
            <button onClick={() => setIsModalOpen(false)} style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
              fontSize: "1rem",
            }}>
              문제지 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
