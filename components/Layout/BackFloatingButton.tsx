"use client";
//뒤로가기 버튼 관련페이지입니다. 
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo } from "react";

export default function BackFloatingButton({
  hidden = false, // 👈 Drawer 열렸을 때 true로 주면 숨김
  fallback = "/",
}: {
  hidden?: boolean;
  fallback?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem("notiEntry")) {
      const entry =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      sessionStorage.setItem("notiEntry", entry);
    }
  }, []);


  //마지막 경로를 기억했다가 밖으로 나가지지않게 했습니다.
  const atFloor = useMemo(() => {
    if (typeof window === "undefined") return false;
    const entry = sessionStorage.getItem("notiEntry") || "";
    const here =
      window.location.pathname +
      window.location.search +
      window.location.hash;
    return here === entry;
  }, []);

  const canGoBack = useMemo(() => {
    if (typeof window === "undefined") return false;
    const sameOriginRef =
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin;
    return window.history.length > 1 && !!sameOriginRef;
  }, []);

  const handleBack = () => {
    if (atFloor) {
      router.push(fallback);
      return;
    }
    if (canGoBack) router.back();
    else router.push(fallback);
  };

  if (hidden) return null; // 👈 숨기기 처리

  return (
    <button
      onClick={handleBack}
      aria-label="뒤로가기"
      title="뒤로가기"
      className="
        fixed top-1/2 left-2 -translate-y-1/2
        z-[9999] flex items-center justify-center
        w-8 h-8 rounded-full bg-gray-100 text-gray-600 shadow-md
        hover:bg-gray-200 active:scale-[0.95] transition
      "
    >
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
  );
}
