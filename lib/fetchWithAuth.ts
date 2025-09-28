// lib/fetchWithAuth.ts
"use client";

import { useLoadingStore } from "@/lib/loadingStore";

export class AuthError extends Error {
  constructor(message = "로그인을 다시 시도해주세요.") {
    super(message);
    this.name = "AuthError";
  }
}

type SimpleFetchOpts = {
  /** 요청 타임아웃(ms). 기본 15초 */
  timeoutMs?: number;
};

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
  opts: SimpleFetchOpts = {}
): Promise<Response> {
  const { start, stop } = useLoadingStore.getState();
  const { timeoutMs = 30000 } = opts; //만약 너무 짧으면 오류문을 뱉을 수도있다...

  // 타임아웃용 AbortController
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
      credentials: "include", // 쿠키 포함(중요)
      headers,
      signal: controller.signal,
    });

    // 401: 인증 만료 → /auth?next= 로 이동
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        const onAuthPage = window.location.pathname.startsWith("/auth");
        if (!onAuthPage) {
          const next = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          window.location.replace(`/auth?next=${next}`);
        }
      }
      throw new AuthError();
    }

    // 403은 호출부에서 케이스별 처리할 수 있게 그대로 반환
    return res;
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
