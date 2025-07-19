import { fetchWithAuth } from "./fetchWithAuth"

// ====================== 타입 정의 ===========================
interface ProfileInfo {
	age: "under_18" | "18_24" | "25_29" | "30_34" | "35_39" | "over_40"
	// academic_year
	grade: "high_school" | "freshman" | "sophomore" | "junior" | "senior" | "graduate" | "working_professional" | "other"
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
	programming_experience_level: "beginner" | "intermediate" | "advanced"
	preferred_programming_languages: ("python" | "java" | "cpp" | "javascript" | "c" | "other")[]
}

interface ExtendedUserRegisterRequest {
	email: string
	password: string
	user_id: string
	username: string
	gender: string
	profile_info: ProfileInfo
}

// interface UserProfileResponse {
// 	user_id: number
// 	basic_info: {
// 		email: string
// 		username: string
// 		full_name: string
// 		created_at: string
// 		last_login: string
// 	}
// 	profile_info: ProfileInfo & {
// 		profile_completion: {
// 			percentage: number
// 			missing_fields: string[]
// 		}
// 	}
// 	learning_analytics: {
// 		problems_solved: number
// 		total_submissions: number
// 		success_rate: number
// 		active_days: number
// 		skill_level: "beginner" | "intermediate" | "advanced"
// 		achievements: string[]
// 	}
// 	personalized_recommendations: {
// 		next_problems: Array<{
// 			problem_id: number
// 			title: string
// 			difficulty: string
// 			reason: string
// 		}>
// 		learning_paths: Array<{
// 			path_id: number
// 			name: string
// 			description: string
// 			compatibility_score: number
// 		}>
// 	}
// }

// interface RecommendationResponse {
// 	user_id: number
// 	recommendation_type: string
// 	generated_at: string
// 	recommendations: Array<{
// 		id: number
// 		type: "problem" | "course" | "path"
// 		title: string
// 		description: string
// 		difficulty: string
// 		estimated_time: string
// 		compatibility_score: number
// 		reason: string
// 		tags: string[]
// 	}>
// 	recommendation_basis: {
// 		profile_factors: string[]
// 		learning_history: string
// 		performance_analysis: string
// 	}
// }

// interface ProfileUpdateRequest {
// 	profile_info: ProfileInfo
// }

// interface ProfileUpdateResponse {
// 	success: boolean
// 	message: string
// 	updated_fields: string[]
// 	recommendations_updated: boolean
// }

// ====================== Auth 관련 API ===========================
export const auth_api = {
	// 새로운 확장된 register 함수
	// 회원가입 학번,
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

	// // 인증 상태 확인 (안전한 버전)
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

export type ProblemType = "코딩" | "디버깅" | "객관식" | "단답형" | "주관식"

export type RatingMode = "Hard" | "Space" | "Regex" | "None" | "exact" | "partial" | "soft"

export interface ProblemBase {
	problem_id: number
	maker_id: string
	title: string
	description: string
	difficulty: string
	tags: string[]
	problem_condition: string[]
	created_at: string
	deleted_at?: string | null
	problemType: ProblemType
}

// 코딩/디버깅 공통
export interface CodingProblem extends ProblemBase {
	problemType: "코딩" | "디버깅"
	rating_mode: RatingMode
	reference_codes: ReferenceCodeRequest[]
	test_cases: TestCaseRequest[]
}

// 객관식
export interface MultipleChoiceProblem extends ProblemBase {
	problemType: "객관식"
	options: string[]
	rating_mode: "None"
	correct_answers: number[]
}

// 단답형
export interface ShortAnswerProblem extends ProblemBase {
	problemType: "단답형"
	rating_mode: RatingMode
	answer_text: string[]
	grading_criteria: string[]
}

// 주관식
export interface SubjectiveProblem extends ProblemBase {
	problemType: "주관식"
	rating_mode: "active" | "deactive"
	grading_criteria: string[]
}

// —————————————— Update Request 타입들 ——————————————
export type CodingProblemUpdateRequest = {
	title: string
	description: string
	difficulty: string
	rating_mode: RatingMode
	tags: string[]
	problem_condition: string[]
	reference_codes: ReferenceCodeRequest[]
	test_cases: TestCaseRequest[]
	problemType: "코딩" | "디버깅"
}

export type MultipleChoiceProblemUpdateRequest = {
	title: string
	description: string
	difficulty: string
	tags: string[]
	options: string[]
	correct_answers: number[]
	problemType: "객관식"
}

export type ShortAnswerProblemUpdateRequest = {
	title: string
	description: string
	difficulty: string
	rating_mode: RatingMode // exact|partial|soft|None
	tags: string[]
	answer_texts: string[]
	problemType: "단답형"
	grading_criteria: string[]
}

export type SubjectiveProblemUpdateRequest = {
	title: string
	description: string
	difficulty: string
	rating_mode: RatingMode // active|deactive
	tags: string[]
	problemType: "주관식"
	grading_criteria: string[]
}

// 전체 리턴 타입 (discriminated union)
export type ProblemDetail = CodingProblem | MultipleChoiceProblem | ShortAnswerProblem | SubjectiveProblem
// 문제 업데이트 전체 리턴 타입
export type ProblemUpdateRequest =
	| CodingProblemUpdateRequest
	| MultipleChoiceProblemUpdateRequest
	| ShortAnswerProblemUpdateRequest
	| SubjectiveProblemUpdateRequest

export const problem_api = {
	//
	// ✨ 코딩·디버깅 문제 생성 (기존과 동일하게 problem_condition 포함)
	//
	async problem_create(
		title: string,
		description: string,
		difficulty: string,
		rating_mode: "Hard" | "Space" | "Regex" | "None",
		tags: string[],
		problem_condition: string[],
		reference_codes: ReferenceCodeRequest[],
		test_cases: TestCaseRequest[],
		problemType: "코딩" | "디버깅",
		base_code?: string // 디버깅 문제일 때만 제공
	) {
		const body: any = {
			title,
			description,
			difficulty,
			rating_mode,
			tags,
			problem_condition,
			problemType,
			reference_codes,
			test_cases,
		}
		if (problemType === "디버깅") {
			body.base_code = base_code || ""
		}

		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "코딩·디버깅 문제 생성 실패")
		}
		return res.json()
	},

	//
	// 📝 객관식 문제 생성 (problem_condition 삭제, rating_mode 없음)
	//
	async problem_create_multiple_choice(
		title: string,
		description: string,
		difficulty: string,
		tags: string[],
		options: string[],
		correct_answers: number[] // 복수 정답 지원
	) {
		const body = {
			title,
			description,
			difficulty,
			tags,
			problemType: "객관식",
			options,
			correct_answers,
		}
		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "객관식 문제 생성 실패")
		}
		return res.json()
	},

	//
	// ✏️ 단답형 문제 생성 (grading_criterion 제거, rating_mode 에만 exact/partial/soft/none)
	//
	async problem_create_short_answer(
		title: string,
		description: string,
		difficulty: string,
		rating_mode: "exact" | "partial" | "soft" | "none",
		tags: string[],
		answer_text: string[],
		grading_criteria: string[] // 👻 AI 채점 기준 텍스트 배열
	) {
		const body = {
			title,
			description,
			difficulty,
			rating_mode,
			tags,
			problemType: "단답형",
			answer_text,
			grading_criteria,
		}
		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "단답형 문제 생성 실패")
		}
		return res.json()
	},

	//
	// 📄 주관식 문제 생성 (problem_condition 삭제, ai 평가 모드만 rating_mode에 사용)
	//
	async problem_create_subjective(
		title: string,
		description: string,
		difficulty: string,
		rating_mode: "active" | "deactive",
		tags: string[],
		grading_criteria: string[] // 👻 AI 채점 기준 텍스트 배열
	) {
		const body = {
			title,
			description,
			difficulty,
			rating_mode,
			tags,
			problemType: "주관식",
			grading_criteria,
		}
		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "주관식 문제 생성 실패")
		}
		return res.json()
	},

	// ---------------------- GET/DELETE ----------------------

	/** 내가 등록한 모든 문제 조회 */
	async problem_get(): Promise<ProblemDetail[]> {
		const res = await fetchWithAuth("/api/proxy/problems/me", {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "내 문제 정보 가져오기 실패")
		}
		return res.json()
	},

	/** 문제 ID 단일 조회 */
	async problem_get_by_id(problem_id: number): Promise<ProblemDetail> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "문제 정보 가져오기 실패")
		}
		return res.json()
	},

	/** 그룹/시험/문제별 조회 */
	async problem_get_by_id_group(group_id: number, workbook_id: number, problem_id: number): Promise<ProblemDetail> {
		const res = await fetchWithAuth(`/api/proxy/problems/${group_id}/${workbook_id}/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "문제 정보 가져오기 실패")
		}
		return res.json()
	},

	/** 문제 삭제 */
	async problem_delete(problem_id: number): Promise<{ success: boolean }> {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "DELETE",
			credentials: "include",
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "문제 삭제 실패")
		}
		return res.json()
	},

	// async problem_update(
	// 	id: string | string[],
	// 	title: string,
	// 	description: string,
	// 	difficulty: string,
	// 	rating_mode: "Hard" | "Space" | "Regex" | "None",
	// 	tags: string[],
	// 	problem_condition: string[],
	// 	reference_codes: ReferenceCodeRequest[],
	// 	test_cases: TestCaseRequest[],
	// 	problemType: "코딩" | "객관식" | "주관식" | "단답형" | "디버깅" // 문제 유형 추가
	// 	// problemScore: number // 배점 추가
	// ) {
	// 	const requestBody: EnhancedProblemCreateRequest = {
	// 		title,
	// 		description,
	// 		difficulty,
	// 		rating_mode,
	// 		tags,
	// 		problem_condition,
	// 		reference_codes,
	// 		test_cases,
	// 		problemType, // 문제 유형 추가
	// 	}

	// 	const response = await fetchWithAuth(`/api/proxy/problems/${id}`, {
	// 		method: "PUT",
	// 		headers: { "Content-Type": "application/json" },
	// 		body: JSON.stringify(requestBody),
	// 	})

	// 	if (!response.ok) {
	// 		const errorText = await response.text()
	// 		console.error("API 응답 에러:", errorText)
	// 		throw new Error("문제 업데이트 실패")
	// 	}
	// 	return response.json()
	// },

	/** 문제 수정 */
	async problem_update(id: string | string[], requestBody: ProblemUpdateRequest): Promise<ProblemDetail> {
		const res = await fetchWithAuth(`/api/proxy/problems/${id}`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "문제 업데이트 실패")
		}
		return res.json()
	},

	/** 문제 통계 조회 */
	async problem_get_stats(problem_id: number): Promise<Record<string, any>> {
		const res = await fetchWithAuth(`/api/proxy/problems/stats/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "문제 통계 가져오기 실패")
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

	// 문제지에 문제 추가할 때 선택된 문제들 바탕으로 레퍼런스 만들기
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

	// 문제 삭제
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
	// 그룹관리페이지에서 해당 그룹의 멤버 리스트 조회
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

	// 비공개 그룹에 참가신청 보낸 멤버들 조회
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

// ====================== member_request 관련 API ===========================

export const member_request_api = {
	// 그룹에 참가 신청 보내는 api
	// group_id로, Path Parameter로 전달되고, 로그인상태도 여기서 다 처리되니까 별도 request값 필요 없음.
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

	// 현재 사용자(아마 그룹장?)가 소속된 그룹들에 대한 멤버 요청 목록을 한번에 가져오는 함수 -> 일괄수락 관련 api 👻 아직 미완성?
	// async member_request_get() {
	// 	const res = await fetchWithAuth("/api/proxy/member_request/my-group", {
	// 		method: "GET",
	// 		credentials: "include",
	// 	})

	// 	if (!res.ok) {
	// 		const errorData = await res.json().catch(() => ({}))
	// 		throw new Error(errorData.detail?.msg || errorData.message || "그룹의 요청 정보 가져오기 실패")
	// 	}

	// 	return res.json()
	// },
}

// ====================== workbook 관련 API ===========================

export const workbook_api = {
	// 문제지 생성
	async workbook_create(
		group_id: number,
		workbook_name: string,
		description: string,
		is_test_mode: any,
		test_start_time: any,
		test_end_time: any,
		publication_start_time: any,
		publication_end_time: any
		// workbook_total_points: number
	) {
		const res = await fetchWithAuth("/api/proxy/workbook", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				group_id,
				workbook_name,
				description,
				is_test_mode,
				test_start_time,
				test_end_time,
				publication_start_time,
				publication_end_time,
				// workbook_total_points,
			}),
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(errorData.detail?.msg || errorData.message || "문제지 생성 실패")
		}

		return res.json()
	},

	// 문제지 관련 모든 정보 조회 (+ 기본 정보, 시험모드, 총 배점)
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
		// is_anonymous: boolean,
		// nickname: string,
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
				// is_anonymous: is_anonymous,
				// nickname: nickname,
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

// ====================== 새로운 타입 정의 ===========================
export type SupportedLanguage = "python" | "javascript" | "c" | "cpp" | "java"
// 필요하면 더 추가

export interface ReferenceCodeRequest {
	language: SupportedLanguage
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
	rating_mode: "Hard" | "Space" | "Regex" | "None"
	tags: string[]
	problem_condition: string[]
	reference_codes: ReferenceCodeRequest[]
	test_cases: TestCaseRequest[]
	problemType: "코딩" | "객관식" | "주관식" | "단답형" | "디버깅"
	// problemScore: number // 배점 추가
}

// interface ReferenceCodeResponse {
// 	id: number
// 	language: string
// 	code: string
// 	is_main: boolean
// 	created_at: string
// }

// interface EnhancedProblemResponse {
// 	problem_id: number
// 	maker_id: string
// 	title: string
// 	description: string
// 	difficulty: string
// 	rating_mode: "Hard" | "Space" | "Regex" | "None"
// 	tags: string[]
// 	problem_condition: string[]
// 	reference_codes: ReferenceCodeResponse[]
// 	test_cases: TestCaseRequest[]
// 	parent_problem_id: number | null
// 	root_problem_id: number
// 	make_at: string
// }

// interface RunCodeForProblemRequest {
// 	code: string
// 	language: string
// 	test_cases: Array<{
// 		input: string
// 		expected_output: string
// 	}>
// }

// interface RunCodeForProblemResponse {
// 	success: boolean
// 	results: Array<{
// 		test_case_index: number
// 		status: "success" | "error" | "timeout"
// 		output: string
// 		error: string
// 		execution_time: number
// 		memory_usage: number
// 		passed: boolean
// 	}>
// 	overall_status: "all_passed" | "some_failed" | "all_failed"
// }
