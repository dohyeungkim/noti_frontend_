"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"

const PROTECTED_PATHS = ["/", "/registered-problems"] // 보호된 페이지 목록
const AUTH_PATHS = ["/auth"]

export default function AuthNavigator() {
	const { isAuth, checkAuthStatus } = useAuth()
	const pathname = usePathname()
	const router = useRouter()

	// ✅ 최초 로드 시 한 번만 인증 상태 체크
	useEffect(() => {
		checkAuthStatus()
	}, []) // ✅ 빈 의존성 배열로 한 번만 실행

	// ✅ 인증 상태에 따른 리다이렉트
	useEffect(() => {
		if (isAuth === null) return // 인증 상태 확인 중

		if (isAuth && AUTH_PATHS.includes(pathname)) {
			router.replace("/")
		}

		if (!isAuth && PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
			router.replace("/auth")
		}
	}, [isAuth, pathname, router])

	return null
}
