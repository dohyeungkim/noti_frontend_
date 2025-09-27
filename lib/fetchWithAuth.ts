// lib/fetchWithAuth.ts
"use client";

import { useLoadingStore } from "@/lib/loadingStore";

/** 401 이후 루프 방지 플래그 */
let isLoggingOut = false;

export class AuthError extends Error {
  constructor(message = "인증이 만료되었습니다.") {
    super(message);
    this.name = "AuthError";
  }
}

type FetchOpts = {
  /** 401 시 refresh 시도 여부 (기본 false: 리프레시 없음) */
  retryOn401?: boolean;
  /** 요청 타임아웃(ms) 기본 15초 */
  timeoutMs?: number;
};

/** 서버 라우트에서 httpOnly 쿠키 제거 (프록시 경로로 고정) */
async function forceLogout() {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // 무시
  }
}


/** 리프레시 안 씀: 항상 false 반환 */
async function refreshToken(): Promise<boolean> {
  return false;
}

/**
 * 전역 로딩 + 401 처리 (리프레시 없이 바로 로그아웃 → /auth 이동)
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
  opts: FetchOpts = {}
): Promise<Response> {
  const { start, stop } = useLoadingStore.getState();
  const { retryOn401 = false, timeoutMs = 15000 } = opts;

  // 타임아웃
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);

  // 안전한 헤더 구성
  const headers = new Headers({
    "Cache-Control": "no-store",
    ...(init.headers || {}),
  });
  const hasBody = init.body != null && init.body !== undefined;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  start();
  try {
    const res = await fetch(input, {
      ...init,
      credentials: "include",
      headers,
      signal: controller.signal,
    });

    // 권한 없음은 호출부에서 처리하도록 그대로 반환
    if (res.status === 403) return res;

    // 정상 또는 기타 에러
    if (res.status !== 401) return res;

    // 이미 /auth면 리다이렉트 루프 방지
    const onAuthPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/auth");

    // (옵션) retryOn401이 true여도 refreshToken은 항상 false라 아무 일 없음
    if (retryOn401) {
      const ok = await refreshToken();
      if (ok) {
        const res2 = await fetchWithAuth(input, init, {
          retryOn401: false,
          timeoutMs,
        });
        if (res2.status !== 401) return res2;
      }
    }

    // 리프레시 없이 즉시 로그아웃
    await forceLogout();

    // 401이면 /auth로 이동
    if (!onAuthPage && typeof window !== "undefined") {
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.replace(`/auth?next=${next}`);
    }

    throw new AuthError();
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다.");
    }
    throw e;
  } finally {
    clearTimeout(tid);
    stop();
  }
}
