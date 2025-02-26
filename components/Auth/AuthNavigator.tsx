"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";

const PROTECTED_PATHS = ["/", "/registered-problems"]; // 보호된 페이지 목록
const AUTH_PATHS = ["/auth"];

export default function AuthNavigator() {
  const { isAuth, getUserName } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // 최초 로드/새로고침 시 인증 상태 체크
  // 로그인 완료 시 유저 이름 불러오기
  useEffect(() => {
    getUserName();
  }, [isAuth, getUserName]);

  // ✅ 인증 확인이 끝날 때까지 리다이렉트 방지
  useEffect(() => {
    if (isAuth === null) return; // ✅ 인증 상태가 `null`이면 리다이렉트 안함

    if (isAuth && AUTH_PATHS.includes(pathname)) {
      router.replace("/");
    }

    if (!isAuth && PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
      router.replace("/auth");
    }
  }, [isAuth, pathname, router]);

  return null;
}
