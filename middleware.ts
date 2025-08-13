import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest, res: NextResponse) {
	const protectedPaths = ["/", "/registered-problems"]
	const authPath = "/auth"

	const { pathname } = req.nextUrl
	const token = req.cookies.get("access_token")?.value // HTTP-only 쿠키에서 토큰 가져오기

	// 보호된 경로에 접근하려고 하는데 토큰이 없는 경우 → 로그인 페이지로 리다이렉트
	if (protectedPaths.includes(pathname) && !token) {
		return NextResponse.redirect(new URL(authPath, req.url))
	}

	// 로그인 상태에서 로그인 페이지(/auth)로 접근 시 메인 페이지로 리다이렉트
	if (pathname === authPath && token) {
		return NextResponse.redirect(new URL("/", req.url))
	}

	return NextResponse.next()
}

// 미들웨어를 적용할 경로 설정
export const config = {
	matcher: ["/", "/registered-problems", "/auth", "/api/:path*"],
}
