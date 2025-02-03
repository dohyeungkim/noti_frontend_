"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { groups } from "../../data/groups"; // 그룹 데이터 import

export default function GroupsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  // 입력 상태 관리
  const [groupName, setGroupName] = useState("머신러닝");
  const [groupNumber, setGroupNumber] = useState("20251101");
  const [inviteCode, setInviteCode] = useState("MLQ1@34AD");
  const [maxStudents, setMaxStudents] = useState("30");
  const [year, setYear] = useState("2025");
  const [semester, setSemester] = useState("1");

  // 그룹 클릭 시 문제지 페이지로 이동
  const handleEnterGroup = (groupId: string) => {
    router.push(`/groups/${groupId}/exams`);
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9f9f9", minHeight: "100vh", margin: "2rem" }}>
      {/* 헤더 */}
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "1rem" }}>🌳 서연님의 그룹</h1>
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
          + 그룹 생성하기
        </button>
      </header>

      {/* 그룹 리스트 (네모 박스 유지) */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {groups.map((group) => (
          <div
            key={group.groupId}
            onClick={() => handleEnterGroup(group.groupId)}
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
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{group.name}</h2>
            <p style={{ margin: "0.5rem 0" }}>교수: {group.professor}</p>
            <p style={{ margin: "0.5rem 0" }}>학기: {group.semester}</p>
            <p style={{ margin: "0.5rem 0" }}>수강생: {group.students}명</p>
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
        ))}
      </section>

      {/* 모달 (isModalOpen 상태에 따라 표시) */}
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
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>그룹 생성하기</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ fontSize: "1.2rem", cursor: "pointer" }}>❌</button>
            </div>

            {/* 입력 폼 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="그룹 이름"
                style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
              <input type="text" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)}
                style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
                style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)}
                  style={{ flex: 1, padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
                <span>명</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                  style={{ flex: 1, padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
                <span>년</span>
                <input type="number" value={semester} onChange={(e) => setSemester(e.target.value)}
                  style={{ flex: 1, padding: "0.5rem", border: "1px solid #ddd", borderRadius: "5px" }} />
                <span>학기</span>
              </div>
            </div>

            {/* 그룹 생성 버튼 */}
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
              그룹 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
