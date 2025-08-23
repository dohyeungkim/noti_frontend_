//

export type ProblemType = "코딩" | "디버깅" | "객관식" | "단답형" | "주관식"
export type RatingMode = "hard" | "space" | "regex" | "none" | "exact" | "partial" | "soft" | "active" | "deactive"

export interface ReferenceCodeRequest {
	language: "javascript" | "typescript" | "python" | "cpp" | "java"
	code: string
	is_main: boolean
}
export interface BaseCodeRequest {
	language: "javascript" | "typescript" | "python" | "cpp" | "java"
	code: string
}
export interface TestCaseRequest {
	input: string
	expected_output: string
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
	problemType: ProblemType
	// 문제 참조 관련 필드들
	group_ids: number[]
	group_names: string[]
	workbook_ids: number[]
	workbook_names: string[]
}

// 코딩
export interface CodingProblem extends ProblemBase {
	problemType: "코딩"
	rating_mode: RatingMode
	reference_codes: ReferenceCodeRequest[]
	test_cases: TestCaseRequest[]
}

// 디버깅
export interface DebuggingProblem extends ProblemBase {
	problemType: "디버깅"
	rating_mode: RatingMode
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
	grading_criteria: string[]
}

// 주관식
export interface SubjectiveProblem extends ProblemBase {
	problemType: "주관식"
	rating_mode: "active" | "deactive"
	answer_text: string
	grading_criteria: string[]
}

export type ProblemDetail =
	| CodingProblem
	| DebuggingProblem
	| MultipleChoiceProblem
	| ShortAnswerProblem
	| SubjectiveProblem

export const dummyProblems: ProblemDetail[] = [
	{
		problem_id: 101,
		maker_id: "u_001",
		title: "두 수의 합",
		description: "배열에서 합이 target이 되는 두 인덱스를 반환하세요.",
		difficulty: "easy",
		tags: ["배열", "해시맵"],
		problem_condition: ["O(n) 권장"],
		created_at: "2025-08-20T10:00:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "hard",
		reference_codes: [
			{
				language: "javascript",
				is_main: true,
				code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [-1, -1];
}`,
			},
		],
		test_cases: [
			{ input: "nums=[2,7,11,15], target=9", expected_output: "[0,1]" },
			{ input: "nums=[3,2,4], target=6", expected_output: "[1,2]" },
		],
	},
	{
		problem_id: 102,
		maker_id: "u_002",
		title: "문자열 뒤집기 (디버깅)",
		description: "주어진 문자열을 뒤집는 코드의 버그를 수정하세요.",
		difficulty: "easy",
		tags: ["문자열", "디버깅"],
		problem_condition: ["O(n)"],
		created_at: "2025-08-20T11:30:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [10, 11],
		group_names: ["알고리즘 기초", "파과기"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "regex",
		base_code: [
			{
				language: "javascript",
				code: `function reverseStr(s) {
  let arr = s.split('');
  let l = 0, r = arr.length; // ❌ off-by-one 버그
  while (l < r) {
    const tmp = arr[l];
    arr[l] = arr[r];
    arr[r] = tmp;
    l++; r--;
  }
  return arr.join('');
}`,
			},
		],
		test_cases: [
			{ input: "s='hello'", expected_output: "'olleh'" },
			{ input: "s='abc'", expected_output: "'cba'" },
		],
	},
	{
		problem_id: 103,
		maker_id: "u_003",
		title: "HTTP 메서드",
		description: "리소스를 생성할 때 주로 사용하는 HTTP 메서드는?",
		difficulty: "easy",
		tags: ["HTTP", "네트워크"],
		problem_condition: [], //객관식은 문제 조건 없어서 빈 배여로 넘겨줌
		created_at: "2025-08-21T09:15:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		options: ["GET", "POST", "PUT", "DELETE"],
		rating_mode: "none",
		correct_answers: [1], // POST (문제 정답 인)
	},
	{
		problem_id: 104,
		maker_id: "u_004",
		title: "프로세스 vs 스레드",
		description: "프로세스와 스레드의 차이를 간단히 설명하시오.",
		difficulty: "medium",
		tags: ["운영체제"],
		problem_condition: ["핵심 차이 2가지 이상"],
		created_at: "2025-08-22T13:45:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "active",
		answer_text: "프로세스는 독립 메모리를 갖고, 스레드는 프로세스 내에서 자원을 공유하는 실행 단위입니다.",
		grading_criteria: ["정의 명확성", "자원 공유 언급", "예시 포함"],
	},
	{
		problem_id: 105,
		maker_id: "u_005",
		title: "파이썬 길이 함수",
		description: "파이썬에서 리스트의 길이를 구하는 함수는?",
		difficulty: "easy",
		tags: ["Python", "기초"],
		problem_condition: [],
		created_at: "2025-08-23T08:10:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "exact",
		answer_text: ["len"],
		grading_criteria: ["정확히 'len' 이어야 함"],
	},
	{
		problem_id: 106,
		maker_id: "u_001",
		title: "두 수의 합",
		description: "배열에서 합이 target이 되는 두 인덱스를 반환하세요.",
		difficulty: "easy",
		tags: ["배열", "해시맵"],
		problem_condition: ["O(n) 권장"],
		created_at: "2025-08-20T10:00:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "hard",
		reference_codes: [
			{
				language: "javascript",
				is_main: true,
				code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [-1, -1];
}`,
			},
		],
		test_cases: [
			{ input: "nums=[2,7,11,15], target=9", expected_output: "[0,1]" },
			{ input: "nums=[3,2,4], target=6", expected_output: "[1,2]" },
		],
	},
	{
		problem_id: 107,
		maker_id: "u_002",
		title: "문자열 뒤집기 (디버깅)",
		description: "주어진 문자열을 뒤집는 코드의 버그를 수정하세요.",
		difficulty: "easy",
		tags: ["문자열", "디버깅"],
		problem_condition: ["O(n)"],
		created_at: "2025-08-20T11:30:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "regex",
		base_code: [
			{
				language: "javascript",
				code: `function reverseStr(s) {
  let arr = s.split('');
  let l = 0, r = arr.length; // ❌ off-by-one 버그
  while (l < r) {
    const tmp = arr[l];
    arr[l] = arr[r];
    arr[r] = tmp;
    l++; r--;
  }
  return arr.join('');
}`,
			},
		],
		test_cases: [
			{ input: "s='hello'", expected_output: "'olleh'" },
			{ input: "s='abc'", expected_output: "'cba'" },
		],
	},
	{
		problem_id: 108,
		maker_id: "u_003",
		title: "HTTP 메서드",
		description: "리소스를 생성할 때 주로 사용하는 HTTP 메서드는?",
		difficulty: "easy",
		tags: ["HTTP", "네트워크"],
		problem_condition: [], //객관식은 문제 조건 없어서 빈 배여로 넘겨줌
		created_at: "2025-08-21T09:15:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		options: ["GET", "POST", "PUT", "DELETE"],
		rating_mode: "none",
		correct_answers: [1], // POST (문제 정답 인)
	},
	{
		problem_id: 109,
		maker_id: "u_004",
		title: "프로세스 vs 스레드",
		description: "프로세스와 스레드의 차이를 간단히 설명하시오.",
		difficulty: "medium",
		tags: ["운영체제"],
		problem_condition: ["핵심 차이 2가지 이상"],
		created_at: "2025-08-22T13:45:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "active",
		answer_text: "프로세스는 독립 메모리를 갖고, 스레드는 프로세스 내에서 자원을 공유하는 실행 단위입니다.",
		grading_criteria: ["정의 명확성", "자원 공유 언급", "예시 포함"],
	},
	{
		problem_id: 110,
		maker_id: "u_005",
		title: "파이썬 길이 함수",
		description: "파이썬에서 리스트의 길이를 구하는 함수는?",
		difficulty: "easy",
		tags: ["Python", "기초"],
		problem_condition: [],
		created_at: "2025-08-23T08:10:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "exact",
		answer_text: ["len"],
		grading_criteria: ["정확히 'len' 이어야 함"],
	},
	{
		problem_id: 111,
		maker_id: "u_001",
		title: "두 수의 합",
		description: "배열에서 합이 target이 되는 두 인덱스를 반환하세요.",
		difficulty: "easy",
		tags: ["배열", "해시맵"],
		problem_condition: ["O(n) 권장"],
		created_at: "2025-08-20T10:00:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "hard",
		reference_codes: [
			{
				language: "javascript",
				is_main: true,
				code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [-1, -1];
}`,
			},
		],
		test_cases: [
			{ input: "nums=[2,7,11,15], target=9", expected_output: "[0,1]" },
			{ input: "nums=[3,2,4], target=6", expected_output: "[1,2]" },
		],
	},
	{
		problem_id: 112,
		maker_id: "u_002",
		title: "문자열 뒤집기 (디버깅)",
		description: "주어진 문자열을 뒤집는 코드의 버그를 수정하세요.",
		difficulty: "easy",
		tags: ["문자열", "디버깅"],
		problem_condition: ["O(n)"],
		created_at: "2025-08-20T11:30:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "regex",
		base_code: [
			{
				language: "javascript",
				code: `function reverseStr(s) {
  let arr = s.split('');
  let l = 0, r = arr.length; // ❌ off-by-one 버그
  while (l < r) {
    const tmp = arr[l];
    arr[l] = arr[r];
    arr[r] = tmp;
    l++; r--;
  }
  return arr.join('');
}`,
			},
		],
		test_cases: [
			{ input: "s='hello'", expected_output: "'olleh'" },
			{ input: "s='abc'", expected_output: "'cba'" },
		],
	},
	{
		problem_id: 113,
		maker_id: "u_003",
		title: "HTTP 메서드",
		description: "리소스를 생성할 때 주로 사용하는 HTTP 메서드는?",
		difficulty: "easy",
		tags: ["HTTP", "네트워크"],
		problem_condition: [], //객관식은 문제 조건 없어서 빈 배여로 넘겨줌
		created_at: "2025-08-21T09:15:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		options: ["GET", "POST", "PUT", "DELETE"],
		rating_mode: "none",
		correct_answers: [1], // POST (문제 정답 인)
	},
	{
		problem_id: 114,
		maker_id: "u_004",
		title: "프로세스 vs 스레드",
		description: "프로세스와 스레드의 차이를 간단히 설명하시오.",
		difficulty: "medium",
		tags: ["운영체제"],
		problem_condition: ["핵심 차이 2가지 이상"],
		created_at: "2025-08-22T13:45:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "active",
		answer_text: "프로세스는 독립 메모리를 갖고, 스레드는 프로세스 내에서 자원을 공유하는 실행 단위입니다.",
		grading_criteria: ["정의 명확성", "자원 공유 언급", "예시 포함"],
	},
	{
		problem_id: 115,
		maker_id: "u_005",
		title: "파이썬 길이 함수",
		description: "파이썬에서 리스트의 길이를 구하는 함수는?",
		difficulty: "easy",
		tags: ["Python", "기초"],
		problem_condition: [],
		created_at: "2025-08-23T08:10:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [10],
		group_names: ["알고리즘 기초"],
		workbook_ids: [1001, 1002],
		workbook_names: ["중간고사", "기말고사"],
		rating_mode: "exact",
		answer_text: ["len"],
		grading_criteria: ["정확히 'len' 이어야 함"],
	},
]
