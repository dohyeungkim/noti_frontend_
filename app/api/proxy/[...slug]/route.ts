// // app/api/proxy/[...slug]/route.ts
// import { NextRequest, NextResponse } from "next/server"

// // solve 관련 route 포함, 공통 프록시 핸들러
// async function middlewareHandler(req: NextRequest): Promise<NextResponse> {
//   const { pathname, search } = new URL(req.url)

//   // 프런트 /api/proxy/*  -> 백엔드 /api/*
//   const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}${pathname.replace(
//     "/api/proxy",
//     "/api"
//   )}${search}`

//   // 요청 헤더 구성
//   const token = req.cookies.get("access_token")?.value
//   const headers: HeadersInit = {
//     "Content-Type": req.headers.get("content-type") ?? "application/json",
//   }
//   if (token) headers["Authorization"] = `Bearer ${token}`

//   // 👉 디버깅 로그
//   console.log("[Proxy] Incoming:", req.method, pathname + search)
//   console.log("[Proxy] Token from cookie:", token ? "✅ 존재함" : "❌ 없음")
//   console.log("[Proxy] Forward headers:", headers)

//   // 바디: GET/HEAD 제외
//   const hasBody = !(req.method === "GET" || req.method === "HEAD")
//   const body = hasBody ? await req.text() : undefined
//   if (hasBody) {
//     console.log("[Proxy] Forward body:", body)
//   }

//   // 업스트림 호출
//   let upstream: Response
//   try {
//     upstream = await fetch(externalApiUrl, {
//       method: req.method,
//       headers,
//       body,
//       redirect: "manual",
//     })
//   } catch (e: any) {
//     console.error("[Proxy] Fetch error:", e?.message ?? e)
//     return NextResponse.json(
//       { message: "Bad Gateway (proxy fetch failed)", detail: String(e?.message ?? e) },
//       { status: 502 },
//     )
//   }

//   // 👉 업스트림 응답 로깅
//   console.log("[Proxy] Upstream response:", upstream.status, upstream.statusText)

//   // 응답 본문 일부만 찍기 (403 같은 경우 디버깅용)
//   try {
//     const clone = upstream.clone()
//     const text = await clone.text()
//     console.log("[Proxy] Upstream body (truncated):", text.slice(0, 300))
//   } catch (err) {
//     console.log("[Proxy] Upstream body read error:", err)
//   }

//   const respHeaders = new Headers(upstream.headers)
//   respHeaders.delete("content-encoding")
//   respHeaders.delete("transfer-encoding")
//   respHeaders.set("cache-control", "no-store")

//   // 로그인 시 쿠키 저장 처리 (기존 로직 유지)
//   if (pathname === "/api/proxy/user/login" && upstream.ok) {
//     const ct = upstream.headers.get("content-type") || ""
//     if (ct.includes("application/json")) {
//       try {
//         const data = await upstream.clone().json()
//         if (data?.access_token) {
//           const isProd = process.env.NODE_ENV === "production"
//           const next = new NextResponse(upstream.body, {
//             status: upstream.status,
//             headers: respHeaders,
//           })
//           next.cookies.set("access_token", data.access_token, {
//             httpOnly: true,
//             secure: isProd,
//             sameSite: isProd ? "none" : "lax",
//             maxAge: 2 * 60 * 60,
//             path: "/",
//           })
//           console.log("[Proxy] Set-Cookie: access_token 저장 완료")
//           return next
//         }
//       } catch (err) {
//         console.log("[Proxy] Login response JSON parse 실패:", err)
//       }
//     }
//   }

//   // 기본 패스스루
//   return new NextResponse(upstream.body, {
//     status: upstream.status,
//     headers: respHeaders,
//   })
// }

// // HTTP 메서드별 라우트 설정
// export async function GET(req: NextRequest) {
//   return middlewareHandler(req)
// }
// export async function POST(req: NextRequest) {
//   return middlewareHandler(req)
// }
// export async function PUT(req: NextRequest) {
//   return middlewareHandler(req)
// }
// export async function PATCH(req: NextRequest) {
//   return middlewareHandler(req)
// }
// export async function DELETE(req: NextRequest) {
//   return middlewareHandler(req)
// }


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

  // 요청 헤더 구성
  const token = req.cookies.get("access_token")?.value
  const headers: HeadersInit = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  // 👉 디버깅 로그
  console.log("[Proxy] Incoming:", req.method, pathname + search)
  console.log("[Proxy] Token from cookie:", token ? "✅ 존재함" : "❌ 없음")
  console.log("[Proxy] Forward headers:", headers)

  // 바디: GET/HEAD 제외
  const hasBody = !(req.method === "GET" || req.method === "HEAD")
  const body = hasBody ? await req.text() : undefined
  if (hasBody) {
    console.log("[Proxy] Forward body:", body)
  }

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
    console.error("[Proxy] Fetch error:", e?.message ?? e)
    return NextResponse.json(
      { message: "Bad Gateway (proxy fetch failed)", detail: String(e?.message ?? e) },
      { status: 502 },
    )
  }

  // 👉 업스트림 응답 로깅
  console.log("[Proxy] Upstream response:", upstream.status, upstream.statusText)

  // 응답 본문 일부만 찍기 (403 같은 경우 디버깅용)
  try {
    const clone = upstream.clone()
    const text = await clone.text()
    console.log("[Proxy] Upstream body (truncated):", text.slice(0, 300))
  } catch (err) {
    console.log("[Proxy] Upstream body read error:", err)
  }

  const respHeaders = new Headers(upstream.headers)
  respHeaders.delete("content-encoding")
  respHeaders.delete("transfer-encoding")
  respHeaders.set("cache-control", "no-store")

  // 로그인 시 쿠키 저장 처리 (기존 로직 유지)
  if (pathname === "/api/proxy/user/login" && upstream.ok) {
    const ct = upstream.headers.get("content-type") || ""
    if (ct.includes("application/json")) {
      try {
        const data = await upstream.clone().json()
        if (data?.access_token) {
          const isProd = process.env.NODE_ENV === "production"
          const next = new NextResponse(upstream.body, {
            status: upstream.status,
            headers: respHeaders,
          })
          next.cookies.set("access_token", data.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 2 * 60 * 60,
            path: "/",
          })
          console.log("[Proxy] Set-Cookie: access_token 저장 완료")
          return next
        }
      } catch (err) {
        console.log("[Proxy] Login response JSON parse 실패:", err)
      }
    }
  }

  // 기본 패스스루
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  })
}

// HTTP 메서드별 라우트 설정
export async function GET(req: NextRequest) {
  return middlewareHandler(req)
}
export async function POST(req: NextRequest) {
  return middlewareHandler(req)
}
export async function PUT(req: NextRequest) {
  return middlewareHandler(req)
}
export async function PATCH(req: NextRequest) {
  return middlewareHandler(req)
}
export async function DELETE(req: NextRequest) {
  return middlewareHandler(req)
}
