"use client" //클라이언트 컴포넌트 선언
//훅, 모듈 가져오기
import { useEffect, useCallback } from "react" 
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"

const PROTECTED_PATHS = ["/", "/registered-problems"] as const // 보호된 페이지 목록
//로그인 해야지만 접근가능
const AUTH_PATHS = ["/auth"] as const
//??..
export default function AuthNavigator() {//컴포넌트 정의
	const { isAuth, checkAuthStatus } = useAuth() //인증여부 확인
	const pathname = usePathname()
	const router = useRouter()

	// ✅ checkAuthStatus를 useCallback으로 래핑 (의존성 배열 경고 해결)
	const handleCheckAuthStatus = useCallback(() => {
		checkAuthStatus()
	}, [checkAuthStatus])

	// ✅ 최초 로드 시 한 번만 인증 상태 체크
	useEffect(() => {
		handleCheckAuthStatus()
	}, [handleCheckAuthStatus])

	// ✅ 인증 상태에 따른 리다이렉트
	useEffect(() => {
		if (isAuth === null) return // 인증 상태 확인 중

		// 인증된 사용자가 인증 페이지에 접근하는 경우
		if (isAuth && AUTH_PATHS.includes(pathname as typeof AUTH_PATHS[number])) {
			router.replace("/")
			return
		}

		// 미인증 사용자가 보호된 페이지에 접근하는 경우
		if (!isAuth && PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
			router.replace("/auth")
			return
		}
	}, [isAuth, pathname, router])

	return null
}//로그인 한 사람과 하지않은 사람의 페이지 이동을 설계..