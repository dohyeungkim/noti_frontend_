"use client";

import { useState } from "react";
import { auth_api } from "@/lib/api";
import { useAuth } from "@/stores/auth";

export default function PasswordChange() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { userName } = useAuth();

  const handleOpenModal = () => {
    setCurrentPassword(""); // 입력값 초기화
    setNewPassword("");
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const handlePasswordChange = async () => {
    setError("");
    setSuccess("");

    if (!userName) {
      setError("사용자 이름을 확인할 수 없습니다.");
      return;
    }

    if (!currentPassword || !newPassword) {
      setError("모든 필드를 입력하세요.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.");
      return;
    }

    setLoading(true);
    try {
      await auth_api.changePassword(userName, currentPassword, newPassword);
      setSuccess("비밀번호가 성공적으로 변경되었습니다.");
      alert("비밀번호가 성공적으로 변경되었습니다.");
      // ✅ 새 비밀번호를 현재 비밀번호로 갱신
      setCurrentPassword(newPassword);
      setNewPassword("");
      setOpen(false); // 성공 시에만 모달 닫기
    } catch (error) {
      setError("비밀번호 변경에 실패했습니다.");
      console.log("비밀번호 변경 실패: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 비밀번호 변경 버튼 */}
      <button onClick={handleOpenModal}>비밀번호 변경하기</button>

      {/* 모달 */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            if (!success) return; // 성공하지 않으면 닫히지 않음
            setOpen(false);
          }}>
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              minWidth: "300px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}>
            <h2>비밀번호 변경</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ display: "block", width: "100%", margin: "10px 0", padding: "8px" }}
            />
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ display: "block", width: "100%", margin: "10px 0", padding: "8px" }}
            />

            <button
              onClick={handlePasswordChange}
              disabled={loading}
              style={{ marginRight: "10px" }}>
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
            <button onClick={() => setOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </>
  );
}
