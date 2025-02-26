import { NextRequest, NextResponse } from "next/server";

export async function middlewareHandler(req: NextRequest) {
  const { pathname, search } = new URL(req.url);
  const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}${pathname.replace(
    "/api/proxy", // 클라이언트가 이렇게 보내면
    "/api" // FastAPI에는 이렇게 보내짐
  )}${search}`;

  const token = req.cookies.get("access_token")?.value;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body;
  if (req.method !== "GET") {
    body = await req.text(); // JSON이 아닌 경우도 고려
  }

  const response = await fetch(externalApiUrl, {
    method: req.method,
    headers,
    body: req.method !== "GET" ? body : undefined,
  });

  const responseData = await response.json();
  console.log(responseData);
  // ✅ 로그인 요청일 경우, `access_token`을 쿠키에 저장
  if (pathname === "/api/proxy/user/login" && response.ok && responseData.access_token) {
    const nextResponse = NextResponse.json(responseData, { status: response.status });

    nextResponse.cookies.set("access_token", responseData.access_token, {
      httpOnly: true, // 보안 강화를 위해 서버에서만 접근 가능
      secure: true, // HTTPS에서만 쿠키 전송 (프로덕션에서는 true)
      sameSite: "none", // CSRF 방지
      maxAge: 30 * 60, // 30분 유지
      path: "/", // 모든 경로에서 접근 가능
    });

    return nextResponse;
  }

  return NextResponse.json(responseData, { status: response.status });
}

// HTTP 메서드별 라우트 설정
export async function GET(req: NextRequest) {
  return middlewareHandler(req);
}
export async function POST(req: NextRequest) {
  return middlewareHandler(req);
}
export async function PUT(req: NextRequest) {
  return middlewareHandler(req);
}
export async function DELETE(req: NextRequest) {
  return middlewareHandler(req);
}
