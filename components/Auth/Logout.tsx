"use client";

import { useAuth } from "@/stores/auth";
import { auth_api } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function Logout() {
  const { setIsAuth } = useAuth();

  const handleLogout = async () => {
    const res = await auth_api.logout();
    console.log(res);
    setIsAuth(false);
  };

  return (
    <button onClick={handleLogout}>
      <FontAwesomeIcon icon={faRightFromBracket} className="text-gray-500" />
      {/* 로그아웃 */}
    </button>
  );
}
