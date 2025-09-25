"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { auth_api } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnlockAlt } from "@fortawesome/free-solid-svg-icons";

export interface PasswordChangeHandles {
  openModal: () => void;
}

const PasswordChange = forwardRef<PasswordChangeHandles>((props, ref) => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 주의: userName(닉네임)이 아니라 userId(로그인 아이디/학번) 사용
  const { userId, userName } = useAuth();

  const handleOpenModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setError("");
    setOpen(true);
  };

  const handlePasswordChange = async () => {
    setError("");

    // ✅ userId 확인 (백엔드는 user_id를 기대)
    if (!userId) {
      setError("사용자 ID를 확인할 수 없습니다. 다시 로그인해 주세요.");
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
      const res = await auth_api.changePassword(userId, currentPassword, newPassword);
      alert(res?.message || "비밀번호가 성공적으로 변경되었습니다.");
      setOpen(false);
    } catch (e: any) {
      // 백엔드에서 온 메시지를 최대한 보여주기
      const msg =
        (e && e.message) ||
        "비밀번호 변경에 실패했습니다.";
      setError(msg);
      console.error("비밀번호 변경 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  // 부모에서 openModal을 호출할 수 있도록 ref에 함수 노출
  useImperativeHandle(ref, () => ({
    openModal: handleOpenModal,
  }));

  return (
    <>
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
            zIndex: 1100,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#333",
              }}
              aria-label="닫기"
            >
              X
            </button>
            <h2>비밀번호 변경</h2>
            {/* 참고용: 현재 로그인 정보 표시 (디버깅에 도움) */}
            <p style={{ fontSize: 12, color: "#666", margin: "6px 0 12px" }}>
              로그인 ID: <b>{userId ?? "(없음)"}</b> / 이름: {userName ?? "(없음)"}
            </p>

            {error && <p style={{ color: "red", whiteSpace: "pre-line" }}>{error}</p>}
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordChange();
              }}
              style={{
                display: "block",
                width: "100%",
                margin: "10px 0",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordChange();
              }}
              style={{
                display: "block",
                width: "100%",
                margin: "10px 0",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#589960",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                margin: "10px 0",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "변경 중..." : "변경하기"}
            </button>
          </div>
        </div>
      )}

      {/* 아이콘 클릭만으로도 모달을 열 수 있게 연결 (원하면 이 한 줄만 추가해도 됨) */}
      <FontAwesomeIcon
        icon={faUnlockAlt}
        className="text-gray-500"
        style={{ cursor: "pointer" }}
        onClick={handleOpenModal}
        title="비밀번호 변경"
      />
    </>
  );
});

PasswordChange.displayName = "PasswordChange";
export default PasswordChange;
