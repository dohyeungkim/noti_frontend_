"use client";
import { useLoadingStore } from "@/lib/loadingStore";

/**
 * 전역 로딩 + 401 리다이렉트 유지
 * 기존 기능은 그대로, fetch만 로딩 트래킹을 추가
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const { start, stop } = useLoadingStore.getState();
  start();
  try {
    const res = await fetch(input, init);

    // 401 처리 (기존 로직 유지)
    if (res.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/auth") {
      window.location.href = "/auth";
    }

    return res;
  } finally {
    stop();
  }
}
