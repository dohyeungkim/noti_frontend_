import { create } from "zustand"
import { auth_api } from "@/lib/api"

interface AuthState {
	userName: string | null
	setUserName: (value: string) => void
	isAuth: boolean | null
	setIsAuth: (value: boolean) => void
	checkAuthStatus: () => Promise<void>
	logout: () => void
}

export const useAuth = create<AuthState>()((set, get) => ({
	userName: null,
	setUserName: (value) => set({ userName: value }),
	isAuth: null,
	setIsAuth: (value) => set({ isAuth: value }),

	// ✅ 완전히 안전한 인증 상태 확인
	checkAuthStatus: async () => {
		try {
			// 먼저 조용히 인증 상태만 확인
			const isAuthenticated = await auth_api.checkAuthStatus()

			if (isAuthenticated) {
				// 인증된 경우에만 사용자 정보 가져오기
				try {
					const res = await auth_api.getUser()
					set({
						isAuth: true,
						userName: res.username || res.user_id,
					})
				} catch (userError) {
					// 사용자 정보 가져오기 실패해도 인증은 성공한 것으로 처리
					console.warn("Failed to get user info:", userError)
					set({ isAuth: true, userName: null })
				}
			} else {
				// 인증되지 않은 경우 - 에러 로그 없이 조용히 처리
				set({ isAuth: false, userName: null })
			}
		} catch (error) {
			// 모든 에러는 조용히 처리
			set({ isAuth: false, userName: null })
		}
	},

	logout: () => {
		set({ isAuth: false, userName: null })
	},
}))
