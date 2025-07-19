"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useAuth } from "@/stores/auth";
import { auth_api } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export interface LogoutHandles {
  logout: () => void;
}

const Logout = forwardRef<LogoutHandles>((props, ref) => {
  const { setIsAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await auth_api.logout();
      setIsAuth(false);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  useImperativeHandle(ref, () => ({
    logout: handleLogout,
  }));

  return (
    <FontAwesomeIcon
      icon={faRightFromBracket}
      className="text-gray-500"
      style={{ cursor: "pointer" }}
    />
  );
});

Logout.displayName = "Logout";
export default Logout;
