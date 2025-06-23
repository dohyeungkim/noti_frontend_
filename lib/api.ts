import { fetchWithAuth } from "./fetchWithAuth"

// ====================== Auth 관련 api ===========================
export const auth_api = {
	async register(userId: string, username: string, password: string, email: string) {
		const res = await fetch(`/api/proxy/user/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ user_id: userId, username, password, email }),
		})
		if (!res.ok) throw new Error("회원가입 실패")
		return res.json()
	},

	async login(userId: string, password: string) {
		const res = await fetch("/api/proxy/user/login", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ user_id: userId, password }),
		})
		if (!res.ok) throw new Error("로그인 실패")
		return res.json()
	},

	async changePassword(userId: string, currentPassword: string, newPassword: string) {
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
		if (!res.ok) throw new Error("비밀번호 변경 실패")
		return res.json()
	},

	async logout() {
		const res = await fetchWithAuth("/api/logout", {
			method: "POST",
		})
		if (!res.ok) throw new Error("로그아웃 실패")
		return res.json()
	},

	async getUser() {
		const res = await fetch("/api/proxy/user/me", {
			method: "GET",
			credentials: "include",
		})
		console.log(res)
		if (!res.ok) throw new Error("인증되지 않은 사용자")
		return res.json()
	},
}

// ====================== problem 관련 api ===========================
export const problem_api = {
	async problem_create(
		title: string,
		description: string,
		testcase: { input: string; output: string; isvisible: boolean }[], // 백엔드 스키마에 맞는 testcase 타입
		conditions?: string[], // 조건 필드 추가 (새로 추가!)
		evaluation_criteria?: string // 평가 기준 필드 추가 (새로 추가!)
	) {
		const requestBody: any = {
			title,
			description,
			testcase,
		}

		// 조건이 있으면 추가
		if (conditions && conditions.length > 0) {
			requestBody.conditions = conditions
		}

		// 평가 기준이 있으면 추가
		if (evaluation_criteria) {
			requestBody.evaluation_criteria = evaluation_criteria
		}

		console.log("📤 백엔드로 전송할 데이터:", requestBody)

		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		})

		if (!res.ok) throw new Error("문제 생성 실패")
		return res.json()
	},

	async problem_get() {
		const res = await fetchWithAuth("/api/proxy/problems/me", {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("내 문제 정보 가져오기 실패")
		return res.json()
	},

	async problem_get_by_id(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("문제 정보 가져오기 실패")
		return res.json()
	},

	async problem_get_by_id_group(group_id: number, workbook_id: number, problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/problems/${group_id}/${workbook_id}/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("문제 정보 가져오기 실패")
		return res.json()
	},

	async problem_ref_delete(problem_id: number, group_id: number, workbook_id: number) {
		const res = await fetch(`/api/proxy/problems_ref/${group_id}/${workbook_id}/${problem_id}`, {
			method: "DELETE",
			credentials: "include",
		})
		if (!res.ok) throw new Error("문제 지우기 실패")
		return res.json()
	},

	async problem_delete(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/problems/${problem_id}`, {
			method: "DELETE",
			credentials: "include",
		})
		if (!res.ok) throw new Error("문제 지우기 실패")
		return res.json()
	},

	async problem_get_small() {
		const res = await fetchWithAuth("/api/proxy/problems/me/small", {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) {
			const errorText = await res.text()
			console.error("API 응답 에러:", errorText)
			throw new Error("내 문제 정보 가져오기 실패")
		}
		return res.json()
	},

	// 문제 업데이트 함수 - 조건과 평가 기준 포함
	async problem_update(
		id: string | string[],
		title: string,
		description: string,
		testcase: { input: string; output: string; isvisible: boolean }[], // 백엔드 스키마에 맞는 testcase 타입
		conditions?: string[], // 조건 필드 추가 (선택적)
		evaluation_criteria?: string // 평가 기준 필드 추가 (선택적)
	) {
		const requestBody: any = {
			title,
			description,
			testcase,
		}

		// 조건이 있으면 추가
		if (conditions && conditions.length > 0) {
			requestBody.conditions = conditions
		}

		// 평가 기준이 있으면 추가
		if (evaluation_criteria) {
			requestBody.evaluation_criteria = evaluation_criteria
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

	// 문제 통계 가져오기
	async problem_get_stats(problem_id: number) {
		const response = await fetchWithAuth(`/api/proxy/problems/stats/${problem_id}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
		if (!response.ok) {
			throw new Error("문제 통계를 불러오지 못했습니다.")
		}
		return response.json()
	},
}

// ====================== problem_ref 관련 api ===========================
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

		if (!res.ok) throw new Error("좋아요 실패")
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

		if (!res.ok) throw new Error("문제 연결 실패")
		return res.json()
	},
}

// "내가 등록한 문제"에서 제목 가져오기
// ====================== problem_like 관련 api ===========================
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

		if (!res.ok) throw new Error("좋아요 실패")
		return res.json()
	},
}

// ====================== group 관련 api ===========================
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

		if (!res.ok) throw new Error("그룹 생성 실패")
		return res.json()
	},

	async group_get() {
		const res = await fetchWithAuth("/api/proxy/groups", {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("내 그룹 정보 가져오기 실패")
		return res.json()
	},

	async group_get_by_id(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/groups/${group_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error("내 문제지 가져오기 실패")
		return res.json()
	},

	async my_group_get() {
		const res = await fetchWithAuth("/api/proxy/groups/my", {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("그룹 정보 가져오기 실패")
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
		if (!res.ok) throw new Error("그룹 업데이트 실패")
		return res.json()
	},

	// ❌ 그룹 삭제하기
	async group_delete_by_id(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/groups/${group_id}`, {
			method: "DELETE",
			credentials: "include",
		})
		if (!res.ok) throw new Error("그룹 삭제 실패")
		return res.json()
	},
}

// ====================== group member 관련 api ===========================
export const group_member_api = {
	async group_get_member(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/groups/members/${group_id}`, {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("멤버 정보 가져오기 실패")
		return res.json()
	},

	async group_private_member_req(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/member_request/my-group?group_id=${group_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error("멤버 정보 가져오기 실패")

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
				request_state, // true: 수락, false: 거절
			}),
		})
		if (!res.ok) throw new Error("멤버 요청 처리 실패")
		return res.json()
	},

	async group_member_kickoff(group_id: number, user_id: string) {
		const res = await fetchWithAuth(`/api/proxy/groups/kickoff/${group_id}/${user_id}`, {
			method: "DELETE",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		})
		if (!res.ok) {
			const errorData = await res.json()
			throw new Error(errorData.detail?.msg || "그룹원 추방 실패")
		}
		return res.json()
	},
}

// ====================== workbook 관련 api ===========================
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

		if (!res.ok) throw new Error("문제지 생성 실패")
		return res.json()
	},

	async workbook_get(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/workbook/group_id/${group_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error("문제지 가져오기 실패")
		return res.json()
	},

	// 백엔드에서 만들어야함.
	async workbook_get_by_id(workbook_id: number) {
		const res = await fetchWithAuth(`/api/proxy/workbook/${workbook_id}`, {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("문제지 가져오기 실패")
		return res.json()
	},

	// 문제지 관리 페이지에 문제지 설정부분 api 입니당구리
	async workbook_update(workbook_id: number, workbook_name: string, description: string) {
		const res = await fetchWithAuth(`/api/proxy/workbook/${workbook_id}`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ workbook_name, description }),
		})
		if (!res.ok) throw new Error("문제지 업데이트 실패")
		return res.json()
	},

	// 문제지 삭제...
	async workbook_delete(group_id: number, workbook_id: number) {
		const res = await fetchWithAuth(`/api/proxy/workbook/${group_id}/${workbook_id}`, {
			method: "DELETE",
			credentials: "include",
		})
		if (!res.ok) throw new Error("문제지 삭제 실패")
		return res.json()
	},
}

// ====================== solves 관련 api ===========================
export const solve_api = {
	async sovle_create(
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

		if (!res.ok) throw new Error("제출 생성 실패")
		return res.json()
	},
	async solve_get_by_problem_id(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/solves/problem/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error("채점 내용 가져오기 실패")
		return res.json()
	},

	async solve_get_by_solve_id(solve_id: number) {
		const res = await fetchWithAuth(`/api/proxy/solves/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error("제출 내용 가져오기 실패")
		return res.json()
	},

	async solve_get_me() {
		const res = await fetchWithAuth(`/api/proxy/solves/me`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error("제출 내용 가져오기 실패")
		return res.json()
	},
}

// ====================== code_logs 관련 api ===========================
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

		if (!res.ok) throw new Error(`코드 로깅 실패 ${res.text()}`)
		return res.json()
	},
	async code_logs_get_by_solve_id(solve_id: number) {
		const res = await fetchWithAuth(`/api/proxy/code_logs/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error(" 코드 로그 내용 가져오기 실패")
		return res.json()
	},
}

// ====================== comments 관련 api ===========================
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

		if (!res.ok) throw new Error(`코멘트 작성 실패 ${res.text()}`)
		return res.json()
	},

	async comments_get_by_problem_id(problem_id: number) {
		const res = await fetchWithAuth(`/api/proxy/comments/problem_id/${problem_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error(" 코멘트 불러오기 실패")
		return res.json()
	},
	async comments_get_by_solve_id(solve_id: number) {
		const res = await fetchWithAuth(`/api/proxy/comments/solve_id/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error(" 코멘트 불러오기 실패")
		return res.json()
	},
}

// ====================== member_request 관련 api ===========================
export const member_request_api = {
	async member_request_create(group_id: number) {
		const res = await fetchWithAuth(`/api/proxy/member_request/${group_id}`, {
			method: "POST",
			credentials: "include",
		})

		return res.json()
	},

	async member_request_get() {
		const res = await fetchWithAuth("/api/proxy/member_request/my-group", {
			method: "GET",
			credentials: "include",
		})
		if (!res.ok) throw new Error("그룹의 요청 정보 가져오기 실패")
		return res.json()
	},
}

export const ai_feeedback_api = {
	async get_ai_feedback(solve_id: number) {
		const res = await fetch(`/api/proxy/feedback/${solve_id}`, {
			method: "GET",
			credentials: "include",
		})

		if (!res.ok) throw new Error("ai 피드백 불러오기 실패")
		return res.json()
	},
}

// ====================== 코드 실행(run_code) api ===========================
export const run_code_api = {
	async run_code(language: string, code: string, test_cases: { input: string; output?: string }[]) {
		const fixedTestCases = test_cases.map((tc) => ({
			input: tc.input,
			output: tc.output ?? "", // output이 없으면 빈 문자열로 보정
		}))
		const res = await fetchWithAuth("/api/proxy/solves/run_code", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ language, code, test_cases: fixedTestCases }),
		})
		if (!res.ok) throw new Error("코드 실행 실패")
		return res.json()
	},
}
