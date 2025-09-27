// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** ===== 설정 ===== */
const PROTECTED_PATHS = ["/", "/registered-problems"]; // 보호 경로 prefix
const AUTH_PATH = "/auth";

// 실제 발급과 동일한 쿠키 이름
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

// 배포/로컬에 따른 secure 플래그
const isProd = process.env.NODE_ENV === "production";

// (선택) 도메인 지정해서 발급했다면 여기에도 동일하게 맞춰줘
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// 항상 통과할 퍼블릭 경로
const PUBLIC_PATHS = [
  AUTH_PATH,
  "/_next",            // Next 정적 리소스
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images",           // public/images 사용 시
  "/api/auth/logout",  // 로그아웃 엔드포인트
  "/api/proxy/auth/refresh", // 리프레시 엔드포인트
];

/** base64url 디코딩 (Edge 런타임 OK) */
function b64urlDecode(str: string) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 2 ? "==" : base64.length % 4 === 3 ? "=" : "";
  const s = atob(base64 + pad);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** JWT payload(exp 등) 파싱 (서명검증 X) */
function parseJwtPayload<T = any>(jwt: string): T | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = b64urlDecode(parts[1]);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function clearCookieOn(res: NextResponse, name: string) {
  res.cookies.set(name, "", {
    path: "/",
    httpOnly: true,
    secure: isProd,            // 로컬 http면 false, 배포 https면 true
    sameSite: "lax",           // 발급 시 값과 동일하게 (None이면 "none"으로)
    maxAge: 0,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) 퍼블릭 경로는 통과
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 2) 토큰 읽기 (httpOnly라도 미들웨어에선 OK)
  const access = req.cookies.get(ACCESS_COOKIE)?.value;

  // 3) 보호 경로인데 토큰 없음 → /auth
  if (isProtectedPath(pathname) && !access) {
    return NextResponse.redirect(new URL(AUTH_PATH, req.url));
  }

  // 4) 토큰이 있으면 exp 검사 (파싱 실패나 exp 누락도 만료로 간주)
  if (access) {
    const payload = parseJwtPayload<{ exp?: number }>(access);
    const nowSec = Math.floor(Date.now() / 1000);
    const isExpiredOrInvalid = !payload?.exp || payload.exp <= nowSec;

    if (isExpiredOrInvalid) {
      const res = NextResponse.redirect(new URL(AUTH_PATH, req.url));
      clearCookieOn(res, ACCESS_COOKIE);
      clearCookieOn(res, REFRESH_COOKIE);
      return res;
    }
  }

  // 5) 로그인 상태에서 /auth 접근 → 메인으로
  if (pathname === AUTH_PATH && access) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 6) 그대로 통과
  return NextResponse.next();
}

/** 미들웨어 적용 경로 (API 제외 권장) */
export const config = {
  matcher: [
    "/",
    "/registered-problems",
    "/auth",
    // 필요하면 여기에 추가 (예: "/dashboard/:path*")
  ],
};
