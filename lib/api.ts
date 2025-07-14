import { fetchWithAuth } from "./fetchWithAuth"

// ====================== 타입 정의 ===========================
interface ProfileInfo {
	age_range: "under_18" | "18_24" | "25_29" | "30_34" | "35_39" | "over_40"
	academic_year:
		| "high_school"
		| "freshman"
		| "sophomore"
		| "junior"
		| "senior"
		| "graduate"
		| "working_professional"
		| "other"
	major: string
	interests: ("web_development" | "mobile_app" | "data_science" | "ai_ml" | "game_development" | "embedded" | "other")[]
	learning_goals: (
		| "career_preparation"
		| "academic_improvement"
		| "skill_enhancement"
		| "hobby"
		| "certification"
		| "competition"
		| "other"
	)[]
	preferred_fields: (
		| "algorithms"
		| "data_structures"
		| "web_backend"
		| "web_frontend"
		| "mobile"
		| "database"
		| "ai_ml"
		| "system_programming"
		| "other"
	)[]
	programming_experience: "beginner" | "intermediate" | "advanced"
	preferred_languages: ("python" | "java" | "cpp" | "javascript" | "c" | "other")[]
}

interface ExtendedUserRegisterRequest {
	email: string
	password: string
	user_id: string
	username: string
	full_name: string
	profile_info: ProfileInfo
}

interface UserProfileResponse {
	user_id: number
	basic_info: {
		email: string
		username: string
		full_name: string
		created_at: string
		last_login: string
	}
	profile_info: ProfileInfo & {
		profile_completion: {
			percentage: number
			missing_fields: string[]
		}
	}
	learning_analytics: {
		problems_solved: number
		total_submissions: number
		success_rate: number
		active_days: number
		skill_level: "beginner" | "intermediate" | "advanced"
		achievements: string[]
	}
	personalized_recommendations: {
		next_problems: Array<{
			problem_id: number
			title: string
			difficulty: string
			reason: string
		}>
		learning_paths: Array<{
			path_id: number
			name: string
			description: string
			compatibility_score: number
		}>
	}
}

interface RecommendationResponse {
	user_id: number
	recommendation_type: string
	generated_at: string
	recommendations: Array<{
		id: number
		type: "problem" | "course" | "path"
		title: string
		description: string
		difficulty: string
		estimated_time: string
		compatibility_score: number
		reason: string
		tags: string[]
	}>
	recommendation_basis: {
		profile_factors: string[]
		learning_history: string
		performance_analysis: string
	}
}

interface ProfileUpdateRequest {
	profile_info: ProfileInfo
}

interface ProfileUpdateResponse {
	success: boolean
	message: string
	updated_fields: string[]
	recommendations_updated: boolean
}

// ====================== Auth 관련 API ===========================
export const auth_api = {
	// 새로운 확장된 register 함수
	async registerExtended(registerData: ExtendedUserRegisterRequest): Promise<{
		success: boolean
		message: string
		user_id: number
		profile_completion: number
	}> {
		console.log("Sending registration data:", JSON.stringify(registerData, null, 2))

		const res = await fetch(`/api/proxy/user/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(registerData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			console.error(
				"Registration error details:",
				JSON.stringify(
					{
						status: res.status,
						statusText: res.statusText,
						errorData: errorData,
						detail: errorData.detail,
					},
					null,
					2
				)
			)

			// detail 배열의 각 항목을 개별적으로 출력
			if (errorData.detail && Array.isArray(errorData.detail)) {
				console.error("Validation errors:")
				errorData.detail.forEach(
					(error: { type: string; loc: string[]; msg: string; input: Record<string, unknown> }, index: number) => {
						console.error(`Error ${index + 1}:`, JSON.stringify(error, null, 2))
					}
				)
			}

			throw new Error(errorData.detail?.msg || errorData.message || `회원가입 실패 (${res.status})`)
		}
		return res.json()
	},

	// 프로필 정보 업데이트 - 👻 지금 안 쓰는 api
	// async updateProfile(profileInfo: ProfileInfo): Promise<ProfileUpdateResponse> {
	// 	const requestData: ProfileUpdateRequest = {
	// 		profile_info: profileInfo,
	// 	}

	// 	const res = await fetchWithAuth(`/api/proxy/user/profile`, {
	// 		method: "PUT",
	// 		headers: { "Content-Type": "application/json" },
	// 		body: JSON.stringify(requestData),
	// 	})

	// 	if (!res.ok) {
	// 		const errorData = await res.json().catch(() => ({}))
	// 		throw new Error(errorData.detail?.msg || errorData.message || "프로필 업데이트 실패")
	// 	}
	// 	return res.json()
	// },

	// 프로필 정보 조회 - 👻 지금 안 쓰는 api
	// async getProfile(userId?: string): Promise<UserProfileResponse> {
	// 	const url = userId ? `/api/proxy/users/${userId}/profile` : `/api/proxy/user/profile`

	// 	const res = await fetchWithAuth(url, {
	// 		method: "GET",
	// 	})

	// 	if (!res.ok) {
	// 		const errorData = await res.json().catch(() => ({}))
	// 		throw new Error(errorData.detail?.msg || errorData.message || "프로필 조회 실패")
	// 	}
	// 	return res.json()
	// },

	// 개인화 추천 가져오기 (미완성 기능) - 👻 지금 안 쓰는 api
	// async getRecommendations(
	// 	type: "problems" | "courses" | "paths" = "problems",
	// 	limit: number = 10
	// ): Promise<RecommendationResponse> {
	// 	const params = new URLSearchParams({
	// 		type,
	// 		limit: limit.toString(),
	// 		refresh: "true",
	// 	})

	// 	const res = await fetchWithAuth(`/api/proxy/user/recommendations?${params}`, {
	// 		method: "GET",
	// 	})

	// 	if (!res.ok) {
	// 		const errorData = await res.json().catch(() => ({}))
	// 		throw new Error(errorData.detail?.msg || errorData.message || "추천 정보 조회 실패")
	// 	}
	// 	return res.json()
	// },

	// 추천 새로고침 (미완성 기능) - 👻 지금 안 쓰는 api
	// async refreshRecommendations(): Promise<{
	// 	success: boolean
	// 	message: string
	// 	recommendations_generated: number
	// }> {
	// 	const res = await fetchWithAuth("/api/proxy/user/recommendations/refresh", {
	// 		method: "POST",
	// 	})

	// 	if (!res.ok) {
	// 		const errorData = await res.json().catch(() => ({}))
	// 		throw new Error(errorData.detail?.msg || errorData.message || "추천 새로고침 실패")
	// 	}
	// 	return res.json()
	// },

	// 로그인
	async login(userId: string, password: string) {
		const res = await fetch("/api/proxy/user/login", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ user_id: userId, password }),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "로그인 실패")
		}
		return res.json()
	},

	// 비밀번호 변경
	async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string
	): Promise<{
		success: boolean
		message: string
	}> {
		const res = await fetchWithAuth("/api/proxy/user/change_password", {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				user_id: userId,
				current_password: currentPassword,
				new_password: newPassword,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "비밀번호 변경 실패")
		}
		return res.json()
	},

	// 로그아웃
	async logout(): Promise<{
		success: boolean
		message: string
	}> {
		const res = await fetchWithAuth("/api/logout", {
			method: "POST",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "로그아웃 실패")
		}
		return res.json()
	},

	// 사용자 정보 조회
	async getUser(): Promise<{
		user_id: string
		username: string
		email: string
		full_name: string
		created_at: string
		last_login: string
	}> {
		const res = await fetch("/api/proxy/user/me", {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			if (res.status === 401) {
				throw new Error("UNAUTHORIZED")
			}
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "사용자 정보 조회 실패")
		}
		return res.json()
	},

	// 인증 상태 확인 (안전한 버전)
	async checkAuthStatus(): Promise<boolean> {
		try {
			const res = await fetch("/api/proxy/user/me", {
				method: "GET",
				credentials: "include",
			})

			// 401이면 단순히 false 반환 (에러 로그 없음)
			if (res.status === 401) {
				return false
			}

			// 다른 에러가 있으면 false 반환
			if (!res.ok) {
				return false
			}

			// 성공하면 true 반환
			return true
		} catch {
			// 네트워크 에러 등은 조용히 false 반환
			return false
		}
	},
}

// ====================== problem 관련 API ===========================
export const problem_api = {
	async problem_create(
		title: string,
		description: string,
		difficulty: string,
		rating_mode: "Hard" | "Space" | "Regex",
		tags: string[],
		problem_condition: string[],
		reference_codes: ReferenceCodeRequest[],
		test_cases: TestCaseRequest[]
	) {
		const requestBody: EnhancedProblemCreateRequest = {
			title,
			description,
			difficulty,
			rating_mode,
			tags,
			problem_condition,
			reference_codes,
			test_cases,
		}

		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 생성 실패")
		}
		return res.json()
	},

	async problem_get() {
		const res = await fetchWithAuth("/api/proxy/problems/me", {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "내 문제 정보 가져오기 실패")
		}

		return res.json()
	},

	async problem_get_by_id(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 정보 가져오기 실패")
		}

		return res.json()
	},

	async problem_get_by_id_group(group_id: number, workbook_id: number, problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/problems/${group_id}/${workbook_id}/${problem_id}`, {
			method: "GET",

			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 정보 가져오기 실패")
		}
		return res.json()
	},

	async problem_ref_delete(problem_id: number, group_id: number, workbook_id: number) {
		const res = await fetch(`/api/proxy/problems_ref/${group_id}/${workbook_id}/${problem_id}`, {
			method: "DELETE",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 지우기 실패")
		}
		return res.json()
	},

	async problem_delete(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "DELETE",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 지우기 실패")
		}
		return res.json()
	},

	async problem_get_small() {
		const res = await fetchWithAuth("/api/proxy/problems/me/small", {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "내 문제 정보 가져오기 실패")
		}
		return res.json()
	},

	async problem_update(
		id: string | string[],
		title: string,
		description: string,
		difficulty: string,
		rating_mode: "Hard" | "Space" | "Regex",
		tags: string[],
		problem_condition: string[],
		reference_codes: ReferenceCodeRequest[],
		test_cases: TestCaseRequest[]
	) {
		const requestBody: EnhancedProblemCreateRequest = {
			title,
			description,
			difficulty,
			rating_mode,
			tags,
			problem_condition,
			reference_codes,
			test_cases,
		}

		const response = await fetchWithAuth(`/api/proxy/problems/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error("API 응답 에러:", errorText)
			throw new Error("문제 업데이트 실패")
		}
		return response.json()
	},

	async problem_get_stats(problem_id: number) {
		const response = await fetchWithAuth(`/api/proxy/problems/stats/${problem_id}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 통계를 불러오지 못했습니다.")
		}
		return response.json()
	},
}

export const additional_problem_api_functions = {
	// 확장된 문제 생성 (기존 problem_create를 대체)
	async problem_create_enhanced(requestData: EnhancedProblemCreateRequest) {
		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 생성 실패")
		}
		return res.json()
	},

	// 참조 코드와 함께 문제 조회
	async problem_get_with_reference_codes(problem_id: number): Promise<EnhancedProblemResponse> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}?include_reference_codes=true`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 정보 가져오기 실패")
		}
		return res.json()
	},

	// 확장된 문제 업데이트 (기존 problem_update를 대체)
	async problem_update_enhanced(problem_id: string | number, requestData: EnhancedProblemCreateRequest) {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 업데이트 실패")
		}
		return res.json()
	},

	// 문제 복사 (참조 코드 포함)
	async problem_copy_with_reference_codes(
		source_problem_id: number,
		new_title?: string
	): Promise<EnhancedProblemResponse> {
		const requestData: { source_problem_id: number; new_title?: string } = { source_problem_id }
		if (new_title) {
			requestData.new_title = new_title
		}

		const res = await fetchWithAuth("/api/proxy/problems/copy", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 복사 실패")
		}
		return res.json()
	},
}

// ====================== 기존 problem_api에 추가할 함수들 ===========================
export const enhanced_problem_api = {
	// 확장된 문제 생성 API
	async problem_create_enhanced(requestData: EnhancedProblemCreateRequest): Promise<EnhancedProblemResponse> {
		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "확장 문제 생성 실패")
		}
		return res.json()
	},

	// 확장된 문제 조회 API (참조 코드 포함)
	async problem_get_enhanced(problem_id: number): Promise<EnhancedProblemResponse> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "확장 문제 정보 가져오기 실패")
		}
		return res.json()
	},

	// 확장된 문제 업데이트 API
	async problem_update_enhanced(
		problem_id: number,
		requestData: EnhancedProblemCreateRequest
	): Promise<EnhancedProblemResponse> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "확장 문제 업데이트 실패")
		}
		return res.json()
	},

	// 참조 코드 관리 API
	async reference_codes_get(problem_id: number): Promise<ReferenceCodeResponse[]> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}/reference_codes`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "참조 코드 가져오기 실패")
		}
		return res.json()
	},

	async reference_codes_update(
		problem_id: number,
		reference_codes: ReferenceCodeRequest[]
	): Promise<ReferenceCodeResponse[]> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}/reference_codes`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ reference_codes }),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "참조 코드 업데이트 실패")
		}
		return res.json()
	},

	async reference_codes_delete(problem_id: number, code_id: number): Promise<{ success: boolean }> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}/reference_codes/${code_id}`, {
			method: "DELETE",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "참조 코드 삭제 실패")
		}
		return res.json()
	},
}

// ====================== problem_ref 관련 API ===========================

export const problem_ref_api = {
	async problem_ref_get(group_id: number, workbook_id: number) {
		const res = await fetchWithAuth("/api/proxy/problems_ref/get", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				group_id,
				workbook_id,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 참조 가져오기 실패")
		}

		return res.json()
	},

	async problem_ref_create(group_id: number, workbook_id: number, problem_id: number[]) {
		const res = await fetchWithAuth("/api/proxy/problems_ref", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				group_id,
				workbook_id,
				problem_id,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 연결 실패")
		}

		return res.json()
	},
}

// ====================== problem_like 관련 API ===========================

export const problem_like_api = {
	async problem_like(problem_id: number, group_id: number, workbook_id: number) {
		const res = await fetchWithAuth("/api/proxy/problems_like", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				problem_id: problem_id,
				group_id: group_id,
				workbook_id: workbook_id,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "좋아요 실패")
		}

		return res.json()
	},
}

// ====================== group 관련 API ===========================

export const group_api = {
	async group_create(group_name: string, group_private_state: boolean) {
		const res = await fetchWithAuth("/api/proxy/groups", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				group_name,
				group_private_state,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "그룹 생성 실패")
		}
		return res.json()
	},

	async group_get() {
		const res = await fetchWithAuth("/api/proxy/groups", {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "내 그룹 정보 가져오기 실패")
		}
		return res.json()
	},

	async group_get_by_id(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/groups/${group_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "그룹 정보 가져오기 실패")
		}
		return res.json()
	},

	async my_group_get() {
		const res = await fetchWithAuth("/api/proxy/groups/my", {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "그룹 정보 가져오기 실패")
		}
		return res.json()
	},

	async group_update(group_id: number, group_name: string, group_private_state: boolean) {
		const res = await fetchWithAuth(`/api/proxy/groups/${group_id}`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				group_name,
				group_private_state,
			}),
		})
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "그룹 업데이트 실패")
		}
		return res.json()
	},

	async group_delete_by_id(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/groups/${group_id}`, {
			method: "DELETE",
			credentials: "include",
		})
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "그룹 삭제 실패")
		}

		return res.json()
	},
}

// ====================== group member 관련 API ===========================
export const group_member_api = {
	async group_get_member(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/groups/members/${group_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "멤버 정보 가져오기 실패")
		}

		return res.json()
	},

	async group_private_member_req(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/member_request/my-group?group_id=${group_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "멤버 요청 정보 가져오기 실패")
		}
		return res.json()
	},

	async group_member_req_response(group_id: number, user_id: string, request_state: boolean) {
		const res = await fetchWithAuth(`/api/proxy/member_request/group-invites/${group_id}`, {
			method: "PATCH",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id,
				request_state,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "멤버 요청 처리 실패")
		}
		return res.json()
	},

	async group_member_kickoff(group_id: number, user_id: string) {
		const res = await fetchWithAuth(`/api/proxy/groups/kickoff/${group_id}/${user_id}`, {
			method: "DELETE",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "그룹원 추방 실패")
		}
		return res.json()
	},
}
// ====================== workbook 관련 API ===========================

export const workbook_api = {
	async workbook_create(group_id: number, workbook_name: string, description: string) {
		const res = await fetchWithAuth("/api/proxy/workbook", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				group_id,
				workbook_name,
				description,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제지 생성 실패")
		}

		return res.json()
	},

	async workbook_get(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/workbook/group_id/${group_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제지 가져오기 실패")
		}
		return res.json()
	},

	async workbook_get_by_id(workbook_id: number) {
		const res = await fetchWithAuth(`/api/proxy/workbook/${workbook_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제지 가져오기 실패")
		}
		return res.json()
	},

	async workbook_update(workbook_id: number, workbook_name: string, description: string) {
		const res = await fetchWithAuth(`/api/proxy/workbook/${workbook_id}`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ workbook_name, description }),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제지 업데이트 실패")
		}
		return res.json()
	},

	async workbook_delete(group_id: number, workbook_id: number) {
		const res = await fetchWithAuth(`/api/proxy/workbook/${group_id}/${workbook_id}`, {
			method: "DELETE",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제지 삭제 실패")
		}
		return res.json()
	},
}

// ====================== solves 관련 API ===========================
export const solve_api = {
	async solve_create(
		group_id: number,
		workbook_id: number,
		problem_id: number,
		user_id: string,
		submitted_code: string,
		code_language: string
	) {
		const res = await fetchWithAuth(
			`/api/proxy/solves?group_id=${group_id}&workbook_id=${workbook_id}&problem_id=${problem_id}`,
			{
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					submitted_code: submitted_code,
					user_id: user_id,
					code_language: code_language,
				}),
			}
		)

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "제출 생성 실패")
		}
		return res.json()
	},

	async solve_get_by_problem_id(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/solves/problem/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "채점 내용 가져오기 실패")
		}

		return res.json()
	},

	async solve_get_by_solve_id(solve_id: number) {
		const res = await fetchWithAuth(`/api/proxy/solves/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "제출 내용 가져오기 실패")
		}

		return res.json()
	},

	async solve_get_me() {
		const res = await fetchWithAuth(`/api/proxy/solves/me`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "제출 내용 가져오기 실패")
		}

		return res.json()
	},
}

// ====================== code_logs 관련 API ===========================
export const code_log_api = {
	async code_log_create(solve_id: number, user_id: string, code_logs: string[], timestamp: string[]) {
		const res = await fetchWithAuth("/api/proxy/code_logs", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				solve_id: solve_id,
				user_id: user_id,
				code_logs: code_logs,
				timestamp: timestamp,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "코드 로깅 실패")
		}
		return res.json()
	},

	async code_logs_get_by_solve_id(solve_id: number) {
		const res = await fetchWithAuth(`/api/proxy/code_logs/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "코드 로그 내용 가져오기 실패")
		}

		return res.json()
	},
}

// ====================== comments 관련 API ===========================

export const comment_api = {
	async comment_create(
		user_id: string,
		problem_id: number,
		solve_id: number,
		comment: string,
		is_anonymous: boolean,
		nickname: string,
		is_problem_message: boolean
	) {
		const res = await fetchWithAuth("/api/proxy/comments", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				user_id: user_id,
				problem_id: problem_id,
				solve_id: solve_id,
				comment: comment,
				is_anonymous: is_anonymous,
				nickname: nickname,
				is_problem_message: is_problem_message,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "코멘트 작성 실패")
		}

		return res.json()
	},

	async comments_get_by_problem_id(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/comments/problem_id/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "코멘트 불러오기 실패")
		}
		return res.json()
	},

	async comments_get_by_solve_id(solve_id: number) {
		const res = await fetchWithAuth(`/api/proxy/comments/solve_id/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "코멘트 불러오기 실패")
		}

		return res.json()
	},
}

// ====================== member_request 관련 API ===========================

export const member_request_api = {
	async member_request_create(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/member_request/${group_id}`, {
			method: "POST",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "멤버 요청 생성 실패")
		}

		return res.json()
	},

	async member_request_get() {
		const res = await fetchWithAuth("/api/proxy/member_request/my-group", {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "그룹의 요청 정보 가져오기 실패")
		}

		return res.json()
	},
}

// ====================== AI 피드백 관련 API ===========================
export const ai_feedback_api = {
	async get_ai_feedback(solve_id: number) {
		const res = await fetch(`/api/proxy/feedback/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "AI 피드백 불러오기 실패")
		}

		return res.json()
	},
}
// ====================== 코드 실행(run_code) API ===========================

export const run_code_api = {
	async run_code(requestData: {
		language: string
		code: string
		rating_mode: string
		test_cases: { input: string; expected_output: string }[]
	}) {
		const res = await fetchWithAuth("/api/proxy/solves/run_code", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "코드 실행 실패")
		}
		return res.json()
	},
}

// ====================== 확장된 run_code_api ===========================
export const enhanced_run_code_api = {
	// 문제 출제자용 코드 실행 API
	async run_code_for_problem(requestData: RunCodeForProblemRequest): Promise<RunCodeForProblemResponse> {
		const res = await fetchWithAuth("/api/proxy/problems/run_code", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제 출제자용 코드 실행 실패")
		}
		return res.json()
	},

	// 기존 solve용 코드 실행 (기존과 동일)
	async run_code(language: string, code: string, test_cases: { input: string; output?: string }[]) {
		const fixedTestCases = test_cases.map((tc) => ({
			input: tc.input,
			expected: tc.output ?? "",
		}))

		const res = await fetchWithAuth("/api/proxy/solves/run_code", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ language, code, test_cases: fixedTestCases }),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "코드 실행 실패")
		}
		return res.json()
	},
}

// ====================== 추천 시스템 API (미완성 기능) ===========================
export const recommendation_api = {
	// 개인화된 문제 추천
	async getProblemsRecommendation(limit: number = 10): Promise<RecommendationResponse> {
		return auth_api.getRecommendations("problems", limit)
	},

	// 개인화된 코스 추천
	async getCoursesRecommendation(limit: number = 5): Promise<RecommendationResponse> {
		return auth_api.getRecommendations("courses", limit)
	},

	// 개인화된 학습 경로 추천
	async getPathsRecommendation(limit: number = 3): Promise<RecommendationResponse> {
		return auth_api.getRecommendations("paths", limit)
	},

	// 추천 새로고침
	async refreshRecommendations(): Promise<{
		success: boolean
		message: string
		recommendations_generated: number
	}> {
		return auth_api.refreshRecommendations()
	},

	// 특정 추천에 대한 피드백 제공 (미완성 기능)
	async provideFeedback(
		recommendationId: number,
		feedback: {
			useful: boolean
			difficulty_accurate: boolean
			reason_helpful: boolean
			comments?: string
		}
	): Promise<{
		success: boolean
		message: string
	}> {
		const res = await fetchWithAuth(`/api/proxy/user/recommendations/${recommendationId}/feedback`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(feedback),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "피드백 제출 실패")
		}
		return res.json()
	},
}

// ====================== 프로필 분석 API (미완성 기능) ===========================
export const profile_api = {
	// 프로필 완성도 체크
	async getProfileCompletion(): Promise<{
		percentage: number
		missing_fields: string[]
		suggestions: string[]
	}> {
		const res = await fetchWithAuth("/api/proxy/user/profile/completion", {
			method: "GET",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "프로필 완성도 조회 실패")
		}
		return res.json()
	},

	// 학습 분석 데이터 조회
	async getLearningAnalytics(): Promise<{
		problems_solved: number
		total_submissions: number
		success_rate: number
		active_days: number
		skill_level: "beginner" | "intermediate" | "advanced"
		achievements: string[]
		progress_trends: Array<{
			date: string
			problems_solved: number
			accuracy: number
		}>
	}> {
		const res = await fetchWithAuth("/api/proxy/user/analytics", {
			method: "GET",
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "학습 분석 데이터 조회 실패")
		}
		return res.json()
	},

	// 개인화된 학습 경로 생성
	async generateLearningPath(preferences: {
		focus_areas: string[]
		difficulty_preference: "easy" | "medium" | "hard" | "mixed"
		time_commitment: "low" | "medium" | "high"
		learning_style: "visual" | "practical" | "theoretical" | "mixed"
	}): Promise<{
		path_id: number
		name: string
		description: string
		estimated_duration: string
		milestones: Array<{
			title: string
			description: string
			problems: number[]
			estimated_time: string
		}>
	}> {
		const res = await fetchWithAuth("/api/proxy/user/learning-path/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(preferences),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "학습 경로 생성 실패")
		}
		return res.json()
	},
}

// ====================== 새로운 타입 정의 ===========================
interface ReferenceCodeRequest {
	language: "python" | "java" | "cpp" | "c" | "javascript"
	code: string
	is_main: boolean
}

interface TestCaseRequest {
	input: string
	expected_output: string
	is_sample: boolean
}

export interface EnhancedProblemCreateRequest {
	title: string
	description: string
	difficulty: string
	rating_mode: "Hard" | "Space" | "Regex"
	tags: string[]
	problem_condition: string[]
	reference_codes: ReferenceCodeRequest[]
	test_cases: TestCaseRequest[]
}

interface ReferenceCodeResponse {
	id: number
	language: string
	code: string
	is_main: boolean
	created_at: string
}

interface EnhancedProblemResponse {
	problem_id: number
	maker_id: string
	title: string
	description: string
	difficulty: string
	rating_mode: "Hard" | "Space" | "Regex"
	tags: string[]
	problem_condition: string[]
	reference_codes: ReferenceCodeResponse[]
	test_cases: TestCaseRequest[]
	parent_problem_id: number | null
	root_problem_id: number
	make_at: string
}

interface RunCodeForProblemRequest {
	code: string
	language: string
	test_cases: Array<{
		input: string
		expected_output: string
	}>
}

interface RunCodeForProblemResponse {
	success: boolean
	results: Array<{
		test_case_index: number
		status: "success" | "error" | "timeout"
		output: string
		error: string
		execution_time: number
		memory_usage: number
		passed: boolean
	}>
	overall_status: "all_passed" | "some_failed" | "all_failed"
}
