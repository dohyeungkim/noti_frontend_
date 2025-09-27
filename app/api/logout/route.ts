// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 발급 때와 동일 옵션으로 지워야 함 (domain 썼으면 domain도 추가!)
function clearCookie(name: string) {
  cookies().set({
    name,
    value: "",
    path: "/",          // 발급 시 path와 동일
    httpOnly: true,     // 동일
    secure: true,       // 로컬 http면 false, https면 true
    sameSite: "lax",    // 발급 시 값과 동일 (None이면 "none")
    maxAge: 0,          // 즉시 만료
  });
}

export async function POST() {
  // 실제 쿠키 이름에 맞게
  clearCookie("access_token");
  clearCookie("refresh_token");

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

// (선택) GET 요청으로 테스트할 때도 동작하게
export async function GET() {
  return POST();
}

// (선택) Next가 정적으로 프리즈하지 않도록
export const dynamic = "force-dynamic";
