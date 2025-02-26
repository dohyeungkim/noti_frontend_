"use client";

import { useAuth } from "@/stores/auth";
import { auth_api } from "@/lib/api";

export default function Logout() {
  const { setIsAuth } = useAuth();

  const handleLogout = async () => {
    const res = await auth_api.logout();
    console.log(res);
    setIsAuth(false);
  };

  return <button onClick={handleLogout}>로그아웃</button>;
}
