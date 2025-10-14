import { fetchWithAuth} from "./fetchWithAuth"

// ====================== 타입 정의 ===========================

interface ProfileInfo {
	age: "under_18" | "18_24" | "25_29" | "30_34" | "35_39" | "over_40"
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
// ====================== chatting_ai 관련 타입 ===========================
export interface ChattingAIRequest {
  context_user: string; // 예: "C언어를 알고싶어"
}

export interface ChattingAIResponse {
  context_ai_ans: string; // 예: "C언어를 알고싶어"
}

// ====================== chatting_ai API ===========================
export const chating_ai = {
  /**
   * POST /api/proxy/chatting/groups/{group_id}/workbooks/{workbook_id}/problems/{problem_id}/submissions/{submission_id}
   * body: { context_user: string }
   * res : { context_ai_ans: string }
   */
  async ask(
    group_id: number,
    workbook_id: number,
    problem_id: number,
    submission_id: number,
    context_user: string
  ): Promise<ChattingAIResponse> {
    const gid = encodeURIComponent(String(group_id));
    const wid = encodeURIComponent(String(workbook_id));
    const pid = encodeURIComponent(String(problem_id));
    const sid = encodeURIComponent(String(submission_id));

    const url = `/api/proxy/chatting/groups/${gid}/workbooks/${wid}/problems/${pid}/submissions/${sid}`;

    const res = await fetchWithAuth(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(<ChattingAIRequest>{ context_user }),
    });

    // 안전 파싱 (text -> json)
    let bodyText = "";
    try { bodyText = await res.text(); } catch {}

    let body: any = {};
    try { body = bodyText ? JSON.parse(bodyText) : {}; } catch { body = {}; }

    if (!res.ok) {
      const msg = Array.isArray(body?.detail)
        ? body.detail
            .map((d: any) => {
              const loc = Array.isArray(d.loc) ? d.loc.join(" > ") : d.loc;
              return `${loc}: ${d.msg}`;
            })
            .join("\n")
        : body?.detail?.msg ||
          body?.detail ||
          body?.message ||
          `chatting_ai 실패 (${res.status}) [POST ${url}]`;
      throw new Error(msg);
    }

    // 최소 필드 보장
    if (typeof body?.context_ai_ans !== "string") {
      throw new Error("서버 응답에 context_ai_ans가 없습니다.");
    }

    return body as ChattingAIResponse;
  },
};
// ====================== Auth 관련 API ===========================
export const auth_api = {
	// 새로운 확장된 register 함수
	// 회원가입 학번,
	// 기존: fetch(...)  ▶ 변경: fetchWithAuth(...)
async registerExtended(registerData: ExtendedUserRegisterRequest): Promise<{
  success: boolean
  message: string
  user_id: number
  profile_completion: number
}> {
  console.log("Sending registration data:", JSON.stringify(registerData, null, 2))

  const res = await fetchWithAuth(`/api/proxy/user/register`, {
    method: "POST",
    // 회원가입에서도 쿠키 기반 세션을 쓸 수 있으니 include 권장
    credentials: "include",
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
        null
      )
    )

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
  const res = await fetchWithAuth("/api/proxy/user/login", {
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
	async logout(): Promise<void> {
    // ❗ 실제 라우트 경로 확인: /api/auth/logout 을 쓰고 있으면 여기도 맞춰줘
    const res = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Cache-Control": "no-store" },
    });

    // 204도 성공으로 처리 (res.ok는 2xx면 true)
    if (!res.ok) {
      // 서버가 가끔 JSON 바디를 보내는 경우를 대비해서만 안전 처리 (선택)
      let msg = `로그아웃 실패 (${res.status})`;
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json();
          msg = j?.message || j?.detail || msg;
        } else {
          const t = await res.text();
          if (t) msg = t;
        }
      } catch {}
      throw new Error(msg);
    }

    // ✅ 여기서는 절대 res.json() 호출하지 마!
    return;
  },

	// 사용자 정보 조회
	async getUser(): Promise<{
  user_id: string
  username: string
  email: string
  created_at: string
  last_login: string
}> {
  const res = await fetchWithAuth("/api/proxy/user/me", {
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

	// auth.ts 파일에서 사용되는 함수 -> 사용자 인증상태 확인
	async checkAuthStatus(): Promise<boolean> {
	try {
		const res = await fetchWithAuth("/api/proxy/user/me", {
		method: "GET",
		credentials: "include",
		})

		if (res.status === 401) return false
		if (!res.ok) return false
		return true
	} catch {
		return false
	}
  },
  async checkDuplicateUserId(user_id: string): Promise<{ is_user_id_exist: boolean }> {
    const res = await fetchWithAuth("/api/proxy/user/register_checker/id", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    })
    if (!res.ok) throw new Error("중복 검사 실패")

    // 백엔드 표준: {"is_user_id_exist": boolean}
    // 혹시 서버가 다른 키로 줄 경우 대비한 안전 가드
    const data = await res.json().catch(() => ({} as any))
    const is_user_id_exist =
      typeof data?.is_user_id_exist === "boolean"
        ? data.is_user_id_exist
        : // 과거/변형 키 대응 (방어적)
          !!(data?.is_user_exist ?? data?.exists ?? data?.exist ?? data?.data?.is_user_id_exist)

    return { is_user_id_exist }
  },

  // (참고) 이메일 중복확인: 백엔드가 {"is_email_exist": boolean}로 주면 그대로 유지 OK
  async checkDuplicateUserEmail(email: string): Promise<{ is_email_exist: boolean }> {
    const res = await fetchWithAuth("/api/proxy/user/register_checker/email", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error("중복 검사 실패")
    const data = await res.json().catch(() => ({} as any))
    const is_email_exist =
      typeof data?.is_email_exist === "boolean"
        ? data.is_email_exist
        : !!(data?.exists ?? data?.exist ?? data?.data?.is_email_exist)
    return { is_email_exist }
  },

}

// ====================== submissions trace 타입 ===========================
export type ProblemTypeKOR = "코딩" | "디버깅" | "객관식" | "단답형" | "주관식";

export type TraceRequest = {
  group_id: number;
  workbook_id: number;
  problem_id: number;
  user_id: string;
};

export type ConditionCheck = {
  condition: string;
  is_required: boolean;
  check_type: "static" | "rule" | "rubric";
  description: string;
  passed: boolean;
  feedback: string;
};

export type TraceBase = {
  solve_id: number;
  problem_id: number;
  problem_name: string;
  problemType: ProblemTypeKOR;
  passed: boolean;
  overall_status: string;
  condition_check_results: ConditionCheck[];
  ai_feedback: string;
};

export type TraceCodingOrDebugging = TraceBase & {
  // 코딩/디버깅
  submitted_code: string;
  code_language: string;
  code_len: number;
  test_cases: { input: string; expected_output: string }[];
  test_results: { input: string; actual_output: string; passed: boolean; time_ms: number }[];
  execution_time: number;
};

export type TraceMultipleChoice = TraceBase & {
  // 객관식
  selected_options: number[];
};

export type TraceShortAnswer = TraceBase & {
  // 단답형
  submitted_text: string;
};

export type TraceSubjective = TraceBase & {
  // 주관식
  submitted_text: string;
};

export type TraceResponse =
  | TraceCodingOrDebugging
  | TraceMultipleChoice
  | TraceShortAnswer
  | TraceSubjective;
// ✨====================== submissions trace API ===========================
export const submissions_trace_api = {
  /**
   * POST /api/proxy/submissions/trace
   * 요청: { group_id, workbook_id, problem_id, user_id }
   * 응답: 문제 유형별 TraceResponse (코딩/디버깅 | 객관식 | 단답형 | 주관식)
   */
  async get_trace_submission(
    group_id: number,
    workbook_id: number,
    problem_id: number,
    user_id: string
  ): Promise<TraceResponse> {
    const payload: TraceRequest = { group_id, workbook_id, problem_id, user_id };

    const res = await fetchWithAuth("/api/proxy/solves/trace", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // text → json 안전 파싱 (네 스타일에 맞춤)
    let bodyText = "";
    try { bodyText = await res.text(); } catch {}

    let body: any = {};
    try { body = bodyText ? JSON.parse(bodyText) : {}; } catch { body = {}; }

    if (!res.ok) {
      // detail 배열/문자열/기타 케이스를 보기 좋게 처리
      const msg = Array.isArray(body?.detail)
        ? body.detail.map((d: any) => {
            const loc = Array.isArray(d.loc) ? d.loc.join(" > ") : d.loc;
            return `${loc}: ${d.msg}`;
          }).join("\n")
        : body?.detail?.msg || body?.detail || body?.message || `trace 조회 실패 (${res.status})`;
      throw new Error(msg);
    }

    // 최소한의 형태 보정 (problemType 누락 방지 등) — 백엔드가 정확히 내려주면 불필요
    if (!body?.problemType) {
      throw new Error("서버 응답에 problemType이 없습니다.");
    }

    return body as TraceResponse;
  },
};
// ====================== problem 관련 API ===========================
export type ProblemType = "코딩" | "디버깅" | "객관식" | "단답형" | "주관식"
export type RatingMode = "hard" | "space" | "regex" | "none" | "exact" | "partial" | "soft"
export type SupportedLanguage = "python" | "javascript" | "c" | "cpp" | "java"

export interface ReferenceCodeRequest {
	language: SupportedLanguage
	code: string
	is_main: boolean
}

export interface BaseCodeRequest {
	language: SupportedLanguage
	code: string
}

export interface TestCaseRequest {
	input: string
	expected_output: string
	// is_sample: boolean
}

export interface EnhancedProblemCreateRequest {
	title: string
	description: string
	difficulty: string
	rating_mode: "hard" | "space" | "regex" | "none"
	tags: string[]
	problem_condition: string[]
	reference_codes: ReferenceCodeRequest[]
	test_cases: TestCaseRequest[]
	problemType: "코딩" | "객관식" | "주관식" | "단답형" | "디버깅"
	// problemScore: number // 배점 추가
}

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
	problemType: ProblemType // 매번 포함됨.
}

// 코딩/디버깅 공통
export interface CodingProblem extends ProblemBase {
	problemType: "코딩" | "디버깅"
	rating_mode: RatingMode
	reference_codes: ReferenceCodeRequest[]
	base_code: BaseCodeRequest[]
	test_cases: TestCaseRequest[]
}

// 객관식
export interface MultipleChoiceProblem extends ProblemBase {
	problemType: "객관식"
	options: string[]
	rating_mode: "none"
	correct_answers: number[]
}

// 단답형
export interface ShortAnswerProblem extends ProblemBase {
	problemType: "단답형"
	rating_mode: RatingMode
	answer_text: string[]
	grading_criteria: string[] // AI 채점 기준
}

// 주관식
export interface SubjectiveProblem extends ProblemBase {
	problemType: "주관식"
	rating_mode: "active" | "deactive"
	answer_text: string
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
	base_code: string;
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
	rating_mode: RatingMode // exact|partial|soft|none
	tags: string[]
	answer_texts: string[]
	problemType: "단답형"
	grading_criteria: string[]
}

export type SubjectiveProblemUpdateRequest = {
	title: string
	description: string
	difficulty: string
	rating_mode: "active" | "deactive" // active|deactive
	tags: string[]
	problemType: "주관식"
	grading_criteria: string[]
	answer_texts: string
}

// 전체 리턴 타입 (discriminated union)
export type ProblemDetail = CodingProblem | MultipleChoiceProblem | ShortAnswerProblem | SubjectiveProblem
// 문제 업데이트 전체 리턴 타입 -> Discriminated Union 구조
// 문제 업데이트 전체 리턴 타입
export type ProblemUpdateRequest =
	| CodingProblemUpdateRequest
	| MultipleChoiceProblemUpdateRequest
	| ShortAnswerProblemUpdateRequest
	| SubjectiveProblemUpdateRequest

export type InputDataTestCaseRequest = {
	input: string,
	expected_output: string,
	is_hidden: boolean
}

export type InputDataCodesRequest = {
	language: string,
	code: string,
	is_main: boolean
}
export const problem_api = {
	//
	// ✨ 코딩·디버깅 문제 생성 (기존과 동일하게 problem_condition 포함)
	//
	async problem_create_by_excel(
		title: string,
		description: string,
		difficulty: string,
		problemType: string,
		tags: string[],
		rating_mode: "hard" | "space" | "regex" | "none" | "exact" | "partial" | "soft" | "active" | "deactive",
		test_cases?: InputDataTestCaseRequest[],
		reference_codes?: InputDataCodesRequest[],
		base_code?: InputDataCodesRequest[],
		problem_condition?: string[],
		options?: string[],
		correct_answers?: number[],
		answer_text?: string | string[],
		grading_criteria?: string[]
	) {
		const body: any = {
			title,
			description,
			difficulty,
			problemType,
			tags,
			rating_mode,
			test_cases,
			reference_codes,
			base_code,
			problem_condition,
			options,
			correct_answers,
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
			console.error("🛑 problem_create error:", err)
			const messages = Array.isArray(err.detail)
				? err.detail.map((d: any) => `${d.loc.join(" → ")}: ${d.msg}`).join("\n")
				: err.detail?.msg || err.message
			throw new Error(messages || "Input Data 문제 생성 실패")
		}
		return res.json()
	},
	async problem_create(
		title: string,
		description: string,
		difficulty: string,
		rating_mode: "hard" | "space" | "regex" | "none",
		tags: string[],
		problem_condition: string[],
		reference_codes: ReferenceCodeRequest[],
		test_cases: TestCaseRequest[],
		problemType: "코딩" | "디버깅",
		base_code?: BaseCodeRequest[] // 디버깅 문제일 때만 제공
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
			base_code: base_code ?? [],
		}
		if (problemType === "디버깅" && base_code) {
			body.base_codes = base_code || []
		}

		const res = await fetchWithAuth("/api/proxy/problems", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			console.error("🛑 problem_create error:", err)
			const messages = Array.isArray(err.detail)
				? err.detail.map((d: any) => `${d.loc.join(" → ")}: ${d.msg}`).join("\n")
				: err.detail?.msg || err.message
			throw new Error(messages || "코딩·디버깅 문제 생성 실패")
			// throw new Error(err.detail?.msg || err.message || "코딩·디버깅 문제 생성 실패")
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
			console.error("MC creation error detail:", err)
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
			// throw new Error(err.detail?.msg || err.message || "단답형 문제 생성 실패")
			console.error("🛑 problem_create error:", err)
			const messages = Array.isArray(err.detail)
				? err.detail.map((d: any) => `${d.loc.join(" → ")}: ${d.msg}`).join("\n")
				: err.detail?.msg || err.message
			throw new Error(messages || "단답형 문제 생성 실패")
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
		answer_text: string,
		tags: string[],
		grading_criteria: string[] // 👻 AI 채점 기준 텍스트 배열
	) {
		const body = {
			title,
			description,
			difficulty,
			rating_mode,
			answer_text,
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
			// console.error("🛑 problem_create error:", err)
			const messages = Array.isArray(err.detail)
				? err.detail.map((d: any) => `${d.loc.join(" → ")}: ${d.msg}`).join("\n")
				: err.detail?.msg || err.message
			throw new Error(messages || "주관식 문제 생성 실패")
			// throw new Error(err.detail?.msg || err.message || "주관식 문제 생성 실패")
		}
		return res.json()
	},

	// ---------------------- GET/DELETE ----------------------

	/** 내가 등록한 모든 문제 조회
	 * Promise<ProblemDetail[]> 백엔드가 주는 값 보고 알아서 해당 문제 유형에 맞는 값들을 가져옴
	 */
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
			throw err
			throw new Error(err.detail?.msg || err.message || "문제 삭제 실패")
		}
		return res.json()
	},

	/** 문제 수정
	 * 문제 id만 백엔드에 넘겨주면 그 id의 ProblemType 보고 알아서 넘겨주면, 프론트가 해당 정보에 맞는 정보 걸러서 프론트에 넘겨준다
	 */
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
// 문제 참조 항목 타입
export interface ProblemRef {
	problem_id: number
	title: string
	description: string
	attempt_count: number
	pass_count: number
	points: number
}

export const problem_ref_api = {
	/**
	 * 문제지에 연결된 문제 목록 조회
	 * @param group_id  그룹 ID
	 * @param workbook_id  문제지 ID
	 * @returns Promise<ProblemRef[]>
	 */
	async problem_ref_get(group_id: number, workbook_id: number): Promise<ProblemRef[]> {
		const res = await fetchWithAuth("/api/proxy/problems_ref/get", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ group_id, workbook_id }),
		})
		if (!res.ok) {
			// 1) 실제 에러 페이로드를 받아와서
			const errorData = await res.json().catch(() => ({}))
			console.error("📌 problem_ref_get validation errors →", errorData)
			// 2) 다시 던져서 화면에도 띄우기
			throw new Error(
				errorData.detail ? JSON.stringify(errorData.detail, null, 2) : errorData.message || "문제 참조 가져오기 실패"
			)
		}

		return res.json()
	},

	/**
	 * 선택된 문제들을 문제지에 추가
	 * @param group_id
	 * @param workbook_id
	 * @param problem_id
	 * @param points
	 */
	async problem_ref_create(
		group_id: number,
		workbook_id: number,
		problem_id: number[],
		points: number = 10
	): Promise<unknown> {
		const res = await fetchWithAuth("/api/proxy/problems_ref", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ group_id, workbook_id, problem_id, points }),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "문제 연결 실패")
		}
		return res.json()
	},

	// 해당 문제의 배점 수정 (특정 그룹 문제지에 속해있는 문제의 배점 수정)
	async problem_ref_edit_points(group_id: number, workbook_id: number, problem_id: number, points: number) {
		const res = await fetchWithAuth(`/api/proxy/problems_ref/edit_points/${group_id}/${workbook_id}/${problem_id}`, {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ points }),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			throw new Error(err.detail?.msg || err.message || "배점 수정 실패")
		}
		return res.json()
	},

	// 문제 삭제
	async problem_ref_delete(group_id: number, workbook_id: number, problem_id: number ) {
  const res = await fetchWithAuth(`/api/proxy/problems_ref/${group_id}/${workbook_id}/${problem_id}`, {
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

	// 📂 기존 문제지에 추가할 때 이 함수 쓸듯 ?
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
// 문제 풀이용 SolveRequest 타입 정의
export type SolveRequest =
	| {
			problemType: "코딩" | "디버깅"
			codes: string // 코드랑 언어 딕셔너리 배열로 받음
			code_language: string
	  }
	| {
			problemType: "객관식"
			selected_options: number[]
	  }
	| {
			problemType: "단답형"
			answer_text: string[]
	  }
	| {
			problemType: "주관식"
			written_text: string
	  }

export const solve_api = {
	/**
	 * 문제 제출 - 유형별로 다 다른 제출
	 * @param group_id
	 * @param workbook_id
	 * @param problem_id
	 * @param user_id
	 * @param request
	 * @returns
	 */
	async solve_create(
		group_id: number,
		workbook_id: number,
		problem_id: number,
		user_id: string,
		request: SolveRequest
	) {
		// 공통값들 + 문제 유형에 따른 분기
		let body: any = { user_id, problemType: request.problemType }

		switch (request.problemType) {
			case "코딩":
			case "디버깅":
				body.codes = request.codes
				body.code_language = request.code_language
				break
			case "객관식":
				body.selected_options = request.selected_options
				break
			case "단답형":
				body.answer_text = request.answer_text
				break
			case "주관식":
				body.written_text = request.written_text
				break
		}

		const res = await fetchWithAuth(
			`/api/proxy/solves?group_id=${group_id}&workbook_id=${workbook_id}&problem_id=${problem_id}`,
			{
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			}
		)
		// api.ts (solve_create 부분의 에러 처리 개선)
		if (!res.ok) {
			let errText = "제출 생성 실패"
			try {
				const data = await res.json()
				console.error("solve_create error payload:", data)
				if (Array.isArray(data.detail)) {
					errText = data.detail
						.map((d: any) => {
							const loc = Array.isArray(d.loc) ? d.loc.join(" > ") : d.loc
							return `${loc}: ${d.msg}`
						})
						.join("\n")
				} else if (data.detail) {
					errText = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)
				} else if (data.message) {
					errText = data.message
				}
			} catch {}
			throw new Error(errText)
		}

		return res.json()
	},

	/**
	 * 기존이랑 == BUT, 응답 받을 때 코딩||디버깅 유형 말고 다른 유형에서는 코드 길이랑 언어만 안 받게 수정함
	 * @param problem_id
	 * @returns
	 */
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

	/**
	 * @param group_id
	 * @param workbook_id
	 * @param problem_id
	 * @returns
	 */
	async solve_get_by_problem_ref_id(group_id: number, workbook_id: number, problem_id: number) {
  		const url = `/api/proxy/solves/group_id/${group_id}/workbook_id/${workbook_id}/problem_id/${problem_id}`
  		const res = await fetchWithAuth(url, {
    	method: "GET",
    	credentials: "include",
  		})
  		if (!res.ok) {
    	const body = await res.json().catch(() => ({}))
    	const msg = body?.detail?.msg || body?.message || `채점 내용 가져오기 실패 (${res.status}) [GET ${url}]`
    	throw new Error(msg)
  	}
  	return res.json()
},

	// 피드백 페이지에서 호출되는 Api
	/**
	 *
	 * @param solve_id
	 * @returns
	 */
	// lib/api.ts (또는 solve_api가 선언된 곳)
	async solve_get_by_solve_id(solve_id: number) {
		const url = `/api/proxy/solves/${encodeURIComponent(String(solve_id))}`

		console.groupCollapsed(`🔎 [solve_get_by_solve_id] ${url}`)
		try {
			const res = await fetchWithAuth(url, {
				method: "GET",
				credentials: "include",
			})
			const text = await res.text()
			let body: any = text
			try {
				body = JSON.parse(text)
			} catch {
				/* text 그대로 둠 */
			}

			console.log("status:", res.status, res.statusText)
			console.log("response:", body)
			console.groupEnd()

			if (!res.ok) {
				// 백엔드가 detail을 주면 보기 좋게
				const msg =
					(body && (body.detail?.msg || body.message || body.detail)) || `GET ${url} failed with ${res.status}`
				throw new Error(msg)
			}
			return body
		} catch (err) {
			console.log("⚠️ fetch error:", err)
			console.groupEnd()
			throw err
		}
	},

	/**
	 * 내가 제출한 모든 기록 보기 (내가 제출한 문제 페이지 - 맞은 문제, 틀린문제 확인 페이지)
	 * 나중에 문제 보기 페이지에서 문제 간단한 정보도 같이 띄우고 싶은데
	 * @returns
	 */
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

// ✨====================== submission 시험모드 채점 관련 API ===========================
/**
 * 만약 그룹장이 한번 채점했던 문제여도 다시 수정하면 PATCH 안 쓰고 POST로 새로 채점할거야. 동일한 로직으로.
 * 그리고 점수 채점할 때 채점완료 버튼 만들고, 채점완료 버튼누르면 점수 post 되면서 reviewed도 되게 할거야.
 * 그리고 모든 문제에서 채점 완료 버튼 누르기 전까지는 검토 완료 버튼 막아놨다가 모든 문제 다 채점 완료 버튼이 눌리면
 * 그때 검토 완료 버튼 풀리고 그냥 별 기능 없이 이전 학생 리스트 페이지로 넘어가게
 */

export interface SubmissionSummary {
	submission_id: number
	user_id: string
  problem_ref_id: number
	problem_id: number
	problem_title: string
	problme_type?: string
	codes?: string
  selected_options?: number[]
  written_text?: string
  written_answers?: string[]
	user_name: string
	ai_score: number | null // AI 또는 교수 최종 점수
	reviewed: boolean // 검토 됐는지의 여부 -> 채점완료 버튼 만들어서 그거 누르면 reviewed==true
	created_at: string
	updated_at: string
	passed : boolean
}

type SubmissionScore = {
	submission_score_id: number // 점수 레코드 PK
	submission_id: number
	prof_score: number
	prof_feedback: string
	graded_by: string | null // null=AI, string=교수ID
	created_at: string // 채점 시각
}

export const grading_api = {
	/**
	 * 목데이터임 지금...!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
	 * 한 그룹·시험(workbook)의 모든 제출 조회
	 * - .env 파일에 MOCK 모드면 gradingDummy -> SubmissionSummary[] 로 변환
	 * @param group_id
	 * @param workbook_id
	 * @returns
	 */
async get_all_submissions(group_id: number, workbook_id: number): Promise<SubmissionSummary[]> {
	const url = `/api/proxy/solves/groups/${group_id}/workbooks/${workbook_id}/submissions`
	
	const res = await fetchWithAuth(url, {
		method: "GET",
		credentials: "include",
	})
	if (!res.ok) throw new Error("제출 목록 가져오기 실패")
	
	const data = await res.json()
	console.log('GET submissions:', { count: data.length, first: data[0] })
	return data
},

async get_submission_scores(solve_id: number): Promise<SubmissionScore[]> {
	const res = await fetchWithAuth(`/api/proxy/solves/${solve_id}/scores`, {
		method: "GET",
		credentials: "include",
	})
	if (!res.ok) throw new Error("채점 기록 조회 실패")
	
	const data = await res.json()

	const latest = data.length > 0 
		? data.reduce((prev: any, curr: any) => 
			curr.submission_score_id > prev.submission_score_id ? curr : prev
		)
		: null

	console.log('GET scores:', {
		solve_id,
		count: data.length,
		latest: latest,
		prof_score: latest?.prof_score,
		prof_feedback: latest?.prof_feedback,
		types: { score: typeof latest?.prof_score, feedback: typeof latest?.prof_feedback }
	})
	return data
},

async post_submission_score(
  solve_id: number,
  prof_score: number,
  prof_feedback: string,
  graded_by?: string | number
) {
  const payload = {
    prof_score,
    prof_feedback,
    ...(graded_by !== undefined && { graded_by })
  }
  
  console.log('POST score:', { solve_id, payload })

  const res = await fetchWithAuth(`/api/proxy/solves/grading/${solve_id}/score`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  let body: any = {}
  try { 
    body = await res.json() 
  } catch {}

  if (!res.ok) {
    const msg = Array.isArray(body?.detail)
      ? body.detail.map((d: any) => `${(d.loc||[]).join(" > ")}: ${d.msg}`).join("\n")
      : body?.detail?.msg || body?.detail || body?.message || "채점 저장 실패"
    console.error('POST error:', msg)
    throw new Error(msg)
  }
  
  console.log('POST result:', body)
  return body
}
}
// ====================== user(profile) 관련 타입/API ===========================
export interface UserProfile {
  user_id: string
  username: string
  email: string
  created_at: string

  gender: string
  birthday: string
  phone: string
  address: string
  school: string
  introduction: string

  grade: string
  major: string
  interests: string[]
  learning_goals: string[]
  preferred_fields: string[]
  programming_experience_level: "beginner" | "intermediate" | "advanced" | string
  preferred_programming_languages: string[]
}
export const user_api = {
  /** GET /api/proxy/user/profile */
  async user_profile_get(): Promise<UserProfile> {
  const res = await fetchWithAuth("/api/proxy/user/profile", {
    method: "GET",
    credentials: "include",
  })

  let bodyText = ""
  try {
    bodyText = await res.text()
  } catch {}

  if (!res.ok) {
    // 가능한 경우 JSON으로도 파싱해봄
    let parsed: any = null
    try { parsed = bodyText ? JSON.parse(bodyText) : null } catch {}

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED")
    }
    const serverMsg =
      parsed?.detail?.msg || parsed?.message || bodyText || res.statusText
    throw new Error(`프로필 조회 실패 (${res.status}) :: ${serverMsg}`)
  }

  // ok면 JSON으로 반환
  try {
    return JSON.parse(bodyText)
  } catch {
    throw new Error("프로필 응답 파싱 실패")
  }
},

  /** PATCH /api/proxy/user/profile */
  async user_profile_update(profile: UserProfile): Promise<UserProfile> {
    const res = await fetchWithAuth("/api/proxy/user/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      if (res.status === 401) throw new Error("UNAUTHORIZED")
      throw new Error(errorData.detail?.msg || errorData.message || `프로필 업데이트 실패 (${res.status})`)
    }

    return res.json()
  },
}
// ====================== code_logs 관련 API ===========================
export const code_log_api = {
  async code_log_create(
    solve_id: number,
    user_id: string,
    code_logs: string[],
    timestamp: string[]
  ) {
    const res = await fetchWithAuth("/api/proxy/code_logs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        solve_id,
        user_id,
        code_logs,
        timestamp,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail?.msg || errorData.message || "코드 로깅 실패"
      );
    }

    return res.json();
  },

	async code_logs_get_by_solve_id(solve_id: number): Promise<{
    copy_suspicion: boolean;
    logs: { code: string; timestamp: string }[];
  }> {
    const res = await fetchWithAuth(`/api/proxy/code_logs/${solve_id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail?.msg ||
          errorData.message ||
          "코드 로그 내용 가져오기 실패"
      );
    }

    return res.json();
  },
};

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
		const res = await fetch(`/api/proxy/comments/ai_feedback/${solve_id}`, {
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


// ====================== run_code_example API ===========================

/** 요청 타입: 문제 없이 예제 코드 실행 전용 */
export type RunCodeExampleTestCaseReq = {
  /** 문자열 한 줄 또는 여러 줄 입력 */
  input: string | string[]
  expected_output: string
}

export interface RunCodeExampleRequest {
  language: string            // "python" 등
  code: string                // 실행할 코드
  rating_mode: RatingMode | "space" | "regex" | "none" | "exact" | "partial" | "soft"
  test_cases: RunCodeExampleTestCaseReq[]
}

/** 응답 타입: 백엔드가 results 배열만 내려주는 간단형 */
export interface RunCodeExampleResult {
  output: string
  passed: boolean
}

export interface RunCodeExampleResponse {
  results: RunCodeExampleResult[]
  /** 백엔드가 여분 필드를 줄 수 있으니 확장 허용 */
  [k: string]: any
}

export const run_code_example_api = {
  /**
   * 예제 코드 실행 (문제 컨텍스트 없이)
   * POST /api/proxy/problems/run_code
   *
   * 사용 예:
   * await run_code_example_api.run({
   *   language: "python",
   *   code: 'a=input().strip(); b=input().strip(); print(f"{a} {b}")',
   *   rating_mode: "space",
   *   test_cases: [
   *     { input: ["Hello", "World"], expected_output: "Hello World" },
   *     { input: ["3", "5"], expected_output: "3 5" },
   *   ],
   * })
   */
  async run(requestData: RunCodeExampleRequest): Promise<RunCodeExampleResponse> {
    // 입력 정규화: input이 string이면 배열로 변환
    const normalized = {
      ...requestData,
      test_cases: requestData.test_cases.map(tc => ({
        ...tc,
        input: Array.isArray(tc.input) ? tc.input : (typeof tc.input === "string" ? [tc.input] : []),
      })),
    }

    const res = await fetchWithAuth("/api/proxy/problems/run_code", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    })

    // 응답 파싱 (text → json 안전 처리)
    let bodyText = ""
    try { bodyText = await res.text() } catch {}
    let body: any = {}
    try { body = bodyText ? JSON.parse(bodyText) : {} } catch { body = {} }

    if (!res.ok) {
      const msg = Array.isArray(body?.detail)
        ? body.detail.map((d: any) => `${(d.loc || []).join(" > ")}: ${d.msg}`).join("\n")
        : body?.detail?.msg || body?.message || `코드 실행 실패 (${res.status})`
      throw new Error(msg)
    }

    // 결과 형태 보장: results가 없으면 빈 배열
    if (!Array.isArray(body?.results)) {
      body.results = []
    }

    // 결과의 각 output을 문자열로 강제(혹시 null/undefined 방지)
    body.results = body.results.map((r: any) => ({
      output: typeof r?.output === "string" ? r.output : String(r?.output ?? ""),
      passed: !!r?.passed,
    }))

    return body as RunCodeExampleResponse
  },
}
// ====================== 코드 실행(run_code) API ===========================
/** run_code 요청/응답 타입 (백엔드 스키마에 맞춰 유연하게) */
export type RunCodeTestCaseReq = {
  /** 요청: 문자열 한 줄로 보낼 수도 있고, ["Hello","World"]처럼 배열로도 보낼 수 있게 허용 */
  input: string | string[]
  expected_output: string
}

export type RunCodeTestCaseRes = {
  /** 응답: 백엔드는 배열 형태(["Hello","World"])로 내려옴 */
  input: string[]
  expected_output: string
  /** 선택: 백엔드가 내려줄 수 있는 필드들 (있으면 활용) */
  actual_output?: string
  passed?: boolean
  message?: string
  error?: string
}

export interface RunCodeRequest {
  language: string
  code: string
  rating_mode: string | RatingMode
  /** 선택: 컨텍스트를 백엔드에 전달하고 싶을 때 */
  problem_id?: number
  group_id?: number
  workbook_id?: number
  /** 테스트케이스: 요청은 input이 string | string[] 둘 다 허용 */
  test_cases: RunCodeTestCaseReq[]
}

export interface RunCodeResponse {
  language: string
  code: string
  rating_mode: string
  group_id?: number
  workbook_id?: number
  problem_id?: number
  /** 응답은 input이 string[]로 내려옴 */
  test_cases: RunCodeTestCaseRes[]
  /** 그 외 추가로 내려올 수 있는 필드들 */
  [k: string]: any
}

export const run_code_api = {
  async run_code(requestData: RunCodeRequest): Promise<RunCodeResponse> {
    const res = await fetchWithAuth("/api/proxy/solves/run_code", {
      method: "POST",
      credentials: "include", // ✅ 쿠키 일관성
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })

    let body: any = {}
    try {
      body = await res.json()
    } catch {
      /* noop */
    }

    if (!res.ok) {
      const msg = Array.isArray(body?.detail)
        ? body.detail.map((d: any) => `${(d.loc || []).join(" > ")}: ${d.msg}`).join("\n")
        : body?.detail?.msg || body?.message || "코드 실행 실패"
      throw new Error(msg)
    }

    // 타입 보장: test_cases.input을 배열 형태로 정규화 (혹시 문자열로 오더라도 안전하게)
    if (Array.isArray(body?.test_cases)) {
      body.test_cases = body.test_cases.map((tc: any) => ({
        ...tc,
        input: Array.isArray(tc?.input) ? tc.input : (typeof tc?.input === "string" ? [tc.input] : []),
      }))
    }

    return body as RunCodeResponse
  },
}
// ====================== live watching 타입 ===========================
export interface WatchingSubmission {
  problem_id: number
  problem_name: string
  problem_type?: string        // ✅ 어떤 응답엔 없을 수 있으니 optional 처리
  is_passed: boolean
  max_score: number
  score: number
  created_at: string
  copy_suspicion?: boolean | 0 | 1 | "0" | "1" | "true" | "false"; // ★ 추가
}

export interface WatchingStudent {
  student_id: string
  student_name: string
  submission_problem_status: WatchingSubmission[]
}

export interface WatchingResponse {
  workbook_id: string
  total_students: number
  students: WatchingStudent[]
}


// ====================== live watching 관련 API ===========================
export const live_api = {
  /** 실시간 학생/문제 현황 */
  async watching_get(
    group_id: string | number,
    workbook_id: string | number
  ): Promise<WatchingResponse> {
    const gid = encodeURIComponent(String(group_id))
    const wid = encodeURIComponent(String(workbook_id))
    const url = `/api/proxy/live/${gid}/${wid}/watching`

    console.log("[live_api.watching_get] 요청 URL:", url)

    const res = await fetchWithAuth(url, {
      method: "GET",
      credentials: "include",
    })

    console.log("[live_api.watching_get] 상태코드:", res.status)

    if (!res.ok) {
      let body: any = {}
      try {
        body = await res.json()
      } catch {}
      console.error("[live_api.watching_get] 오류 응답:", body)

      const msg =
        body?.detail?.msg ||
        body?.message ||
        `실시간 현황 조회 실패 (${res.status}) [GET ${url}]`
      throw new Error(msg)
    }

    const json = await res.json()
    console.log("[live_api.watching_get] 성공 응답:", json)
    return json
  },

}
