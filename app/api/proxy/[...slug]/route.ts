// app/api/proxy/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server"

// solve 관련 route 포함, 공통 프록시 핸들러
async function middlewareHandler(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = new URL(req.url)

  // 프런트 /api/proxy/*  -> 백엔드 /api/*
  const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}${pathname.replace(
    "/api/proxy",
    "/api"
  )}${search}`

  // 요청 헤더 구성 (기존 로직 유지)
  const token = req.cookies.get("access_token")?.value
  const headers: HeadersInit = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  // 바디: GET/HEAD 제외하고 text로 안전 처리 (기존 로직 유지)
  const hasBody = !(req.method === "GET" || req.method === "HEAD")
  const body = hasBody ? await req.text() : undefined

  // 업스트림 호출
  let upstream: Response
  try {
    upstream = await fetch(externalApiUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    })
  } catch (e: any) {
    // 네트워크 실패 시 프록시 502로 명확히
    const err = NextResponse.json(
      { message: "Bad Gateway (proxy fetch failed)\n", detail: String(e?.message ?? e)},
      { status: 502 },
    )
    console.log(e.message)
    return err
  }

  // 응답 헤더 정리 (스트리밍 안정화)
  const respHeaders = new Headers(upstream.headers)
  respHeaders.delete("content-encoding")
  respHeaders.delete("transfer-encoding")
  respHeaders.set("cache-control", "no-store")

  // ✅ 로그인 요청이면 access_token 쿠키 저장 (기존 기능 유지)
  // 주의: 프록시 경로 기준으로 비교
  if (pathname === "/api/proxy/user/login" && upstream.ok) {
    const ct = upstream.headers.get("content-type") || ""
    if (ct.includes("application/json")) {
      try {
        // 본문은 그대로 내보내야 하므로 clone으로 파싱
        const data = await upstream.clone().json()
        if (data?.access_token) {
          const isProd = process.env.NODE_ENV === "production"
          const next = new NextResponse(upstream.body, {
            status: upstream.status,
            headers: respHeaders,
          })
          next.cookies.set("access_token", data.access_token, {
            httpOnly: true,
            secure: isProd,                // dev에선 false, prod에선 true
            sameSite: isProd ? "none" : "lax",
            maxAge: 2 * 60 * 60,
            path: "/",
          })
          return next
        }
      } catch {
        // 로그인 응답이 JSON이 아니거나 파싱 실패하면 그냥 패스스루
      }
    }
  }

  // ✅ 기본: 본문을 그대로 패스스루 (JSON 파싱 금지)
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  })
}

// HTTP 메서드별 라우트 설정 (기존과 동일)
export async function GET(req: NextRequest): Promise<NextResponse> {
  return middlewareHandler(req)
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  return middlewareHandler(req)
}
export async function PUT(req: NextRequest): Promise<NextResponse> {
  return middlewareHandler(req)
}
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  return middlewareHandler(req)
}
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  return middlewareHandler(req)
}
