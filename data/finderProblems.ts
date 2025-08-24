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
	// === 단답형 ===
	{
		problem_id: 201,
		maker_id: "u_101",
		title: "C언어 출력 함수",
		description: "C언어에서 출력에 사용하는 함수는?",
		difficulty: "easy",
		tags: ["C", "기초"],
		problem_condition: [],
		created_at: "2025-08-24T09:00:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [20],
		group_names: ["프로그래밍 기초"],
		workbook_ids: [2001],
		workbook_names: ["중간고사"],
		rating_mode: "exact",
		answer_text: ["printf"],
		grading_criteria: ["정확히 'printf' 이어야 함"],
	},
	{
		problem_id: 202,
		maker_id: "u_102",
		title: "SQL 집계 함수",
		description: "SQL에서 행 개수를 세는 함수는?",
		difficulty: "easy",
		tags: ["SQL", "데이터베이스"],
		problem_condition: [],
		created_at: "2025-08-24T09:05:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [21],
		group_names: ["데이터베이스"],
		workbook_ids: [2002],
		workbook_names: ["연습문제"],
		rating_mode: "exact",
		answer_text: ["COUNT"],
		grading_criteria: ["대소문자 무관 허용"],
	},
	{
		problem_id: 203,
		maker_id: "u_103",
		title: "HTML 제목 태그",
		description: "HTML에서 가장 큰 제목을 표시하는 태그는?",
		difficulty: "easy",
		tags: ["HTML", "웹"],
		problem_condition: [],
		created_at: "2025-08-24T09:10:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [22],
		group_names: ["웹프로그래밍"],
		workbook_ids: [2003],
		workbook_names: ["실습"],
		rating_mode: "soft",
		answer_text: ["h1", "<h1>"],
		grading_criteria: ["h1 포함 여부"],
	},
	{
		problem_id: 204,
		maker_id: "u_104",
		title: "리눅스 현재 경로 확인",
		description: "리눅스에서 현재 작업 디렉토리를 출력하는 명령어는?",
		difficulty: "medium",
		tags: ["리눅스", "명령어"],
		problem_condition: [],
		created_at: "2025-08-24T09:15:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [23],
		group_names: ["운영체제"],
		workbook_ids: [2004],
		workbook_names: ["중간고사"],
		rating_mode: "exact",
		answer_text: ["pwd"],
		grading_criteria: ["정확히 'pwd' 이어야 함"],
	},
	{
		problem_id: 205,
		maker_id: "u_105",
		title: "Python 정렬 함수",
		description: "파이썬에서 리스트를 정렬하는 함수는?",
		difficulty: "easy",
		tags: ["Python", "정렬"],
		problem_condition: [],
		created_at: "2025-08-24T09:20:00.000Z",
		deleted_at: null,
		problemType: "단답형",
		group_ids: [24],
		group_names: ["프로그래밍 기초"],
		workbook_ids: [2005],
		workbook_names: ["연습문제"],
		rating_mode: "partial",
		answer_text: ["sort", "sorted"],
		grading_criteria: ["둘 중 하나면 정답 처리"],
	},

	// === 주관식 ===
	{
		problem_id: 206,
		maker_id: "u_106",
		title: "TCP와 UDP 차이",
		description: "TCP와 UDP의 차이를 설명하시오.",
		difficulty: "medium",
		tags: ["네트워크"],
		problem_condition: ["전송방식 비교"],
		created_at: "2025-08-24T09:30:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [30],
		group_names: ["네트워크"],
		workbook_ids: [3001],
		workbook_names: ["기말고사"],
		rating_mode: "active",
		answer_text: "TCP는 연결 지향, UDP는 비연결 지향이며 신뢰성 보장 여부가 다르다.",
		grading_criteria: ["연결 지향 언급", "신뢰성 차이 언급"],
	},
	{
		problem_id: 207,
		maker_id: "u_107",
		title: "자료구조 Stack",
		description: "스택의 특징을 설명하시오.",
		difficulty: "easy",
		tags: ["자료구조"],
		problem_condition: ["LIFO 언급"],
		created_at: "2025-08-24T09:35:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [31],
		group_names: ["자료구조"],
		workbook_ids: [3002],
		workbook_names: ["퀴즈"],
		rating_mode: "active",
		answer_text: "스택은 LIFO 구조를 따르는 선형 자료구조이다.",
		grading_criteria: ["LIFO 언급", "선형 구조 언급"],
	},
	{
		problem_id: 208,
		maker_id: "u_108",
		title: "OS 스케줄링",
		description: "라운드 로빈 스케줄링의 특징을 설명하시오.",
		difficulty: "hard",
		tags: ["운영체제"],
		problem_condition: ["공평성 언급"],
		created_at: "2025-08-24T09:40:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [32],
		group_names: ["운영체제"],
		workbook_ids: [3003],
		workbook_names: ["연습문제"],
		rating_mode: "active",
		answer_text: "라운드 로빈은 각 프로세스가 동일한 시간 할당량을 받는 공평한 스케줄링 방식이다.",
		grading_criteria: ["시간 할당량 언급", "공평성 언급"],
	},
	{
		problem_id: 209,
		maker_id: "u_109",
		title: "AI 정의",
		description: "인공지능의 정의를 서술하시오.",
		difficulty: "medium",
		tags: ["AI", "정의"],
		problem_condition: ["자율적 학습 언급"],
		created_at: "2025-08-24T09:45:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [33],
		group_names: ["AI 개론"],
		workbook_ids: [3004],
		workbook_names: ["중간고사"],
		rating_mode: "deactive",
		answer_text: "인간의 지능적 행동을 컴퓨터로 모방하는 기술.",
		grading_criteria: ["지능 모방 언급", "학습 언급"],
	},
	{
		problem_id: 210,
		maker_id: "u_110",
		title: "RESTful API 특징",
		description: "RESTful API의 핵심 특징을 설명하시오.",
		difficulty: "hard",
		tags: ["API", "웹"],
		problem_condition: ["무상태성 언급"],
		created_at: "2025-08-24T09:50:00.000Z",
		deleted_at: null,
		problemType: "주관식",
		group_ids: [34],
		group_names: ["웹개발"],
		workbook_ids: [3005],
		workbook_names: ["과제"],
		rating_mode: "active",
		answer_text: "클라이언트-서버 구조, 무상태성, 캐시 가능성 등의 특징이 있다.",
		grading_criteria: ["무상태성 언급", "클라이언트-서버 구조 언급"],
	},

	// === 객관식 ===
	{
		problem_id: 211,
		maker_id: "u_111",
		title: "HTTP 상태코드 200",
		description: "HTTP 200 상태코드의 의미는?",
		difficulty: "easy",
		tags: ["HTTP", "네트워크"],
		problem_condition: [],
		created_at: "2025-08-24T10:00:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [40],
		group_names: ["네트워크"],
		workbook_ids: [4001],
		workbook_names: ["연습"],
		options: ["리다이렉트", "요청 성공", "권한 없음", "서버 에러"],
		rating_mode: "none",
		correct_answers: [1],
	},
	{
		problem_id: 212,
		maker_id: "u_112",
		title: "Python 불변 자료형",
		description: "다음 중 불변(immutable) 자료형은?",
		difficulty: "medium",
		tags: ["Python", "자료형"],
		problem_condition: [],
		created_at: "2025-08-24T10:05:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [41],
		group_names: ["Python"],
		workbook_ids: [4002],
		workbook_names: ["퀴즈"],
		options: ["list", "dict", "tuple", "set"],
		rating_mode: "none",
		correct_answers: [2],
	},
	{
		problem_id: 213,
		maker_id: "u_113",
		title: "Java 접근제어자",
		description: "Java에서 가장 제한적인 접근제어자는?",
		difficulty: "easy",
		tags: ["Java", "접근제어자"],
		problem_condition: [],
		created_at: "2025-08-24T10:10:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [42],
		group_names: ["Java"],
		workbook_ids: [4003],
		workbook_names: ["기말"],
		options: ["public", "protected", "private", "default"],
		rating_mode: "none",
		correct_answers: [2],
	},
	{
		problem_id: 214,
		maker_id: "u_114",
		title: "SQL 키워드",
		description: "중복을 제거하고 조회할 때 사용하는 SQL 키워드는?",
		difficulty: "medium",
		tags: ["SQL", "데이터베이스"],
		problem_condition: [],
		created_at: "2025-08-24T10:15:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [43],
		group_names: ["데이터베이스"],
		workbook_ids: [4004],
		workbook_names: ["중간"],
		options: ["DISTINCT", "GROUP BY", "ORDER BY", "HAVING"],
		rating_mode: "none",
		correct_answers: [0],
	},
	{
		problem_id: 215,
		maker_id: "u_115",
		title: "리눅스 권한 변경",
		description: "리눅스에서 파일 권한을 변경하는 명령어는?",
		difficulty: "medium",
		tags: ["리눅스", "명령어"],
		problem_condition: [],
		created_at: "2025-08-24T10:20:00.000Z",
		deleted_at: null,
		problemType: "객관식",
		group_ids: [44],
		group_names: ["운영체제"],
		workbook_ids: [4005],
		workbook_names: ["과제"],
		options: ["ls", "chmod", "chown", "cat"],
		rating_mode: "none",
		correct_answers: [1],
	},

	// === 코딩 ===
	{
		problem_id: 216,
		maker_id: "u_116",
		title: "배열 최대값",
		description: "정수 배열에서 최대값을 찾으시오.",
		difficulty: "easy",
		tags: ["배열"],
		problem_condition: ["O(n)"],
		created_at: "2025-08-24T10:30:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [50],
		group_names: ["알고리즘"],
		workbook_ids: [5001],
		workbook_names: ["연습"],
		rating_mode: "hard",
		reference_codes: [
			{
				language: "python",
				is_main: true,
				code: `def findMax(arr): return max(arr)`,
			},
		],
		test_cases: [
			{ input: "arr=[1,2,3]", expected_output: "3" },
			{ input: "arr=[-1,-5,0]", expected_output: "0" },
		],
	},
	{
		problem_id: 217,
		maker_id: "u_117",
		title: "팩토리얼",
		description: "n의 팩토리얼을 계산하시오.",
		difficulty: "medium",
		tags: ["수학"],
		problem_condition: [],
		created_at: "2025-08-24T10:35:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [51],
		group_names: ["알고리즘"],
		workbook_ids: [5002],
		workbook_names: ["과제"],
		rating_mode: "space",
		reference_codes: [
			{
				language: "cpp",
				is_main: true,
				code: `int fact(int n){ return n<=1?1:n*fact(n-1); }`,
			},
		],
		test_cases: [
			{ input: "n=5", expected_output: "120" },
			{ input: "n=0", expected_output: "1" },
		],
	},
	{
		problem_id: 218,
		maker_id: "u_118",
		title: "문자열 회문 검사",
		description: "문자열이 회문인지 판별하시오.",
		difficulty: "medium",
		tags: ["문자열"],
		problem_condition: [],
		created_at: "2025-08-24T10:40:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [52],
		group_names: ["문자열"],
		workbook_ids: [5003],
		workbook_names: ["기말"],
		rating_mode: "regex",
		reference_codes: [
			{
				language: "javascript",
				is_main: true,
				code: `function isPalindrome(s){ return s===s.split('').reverse().join(''); }`,
			},
		],
		test_cases: [
			{ input: "s='madam'", expected_output: "true" },
			{ input: "s='hello'", expected_output: "false" },
		],
	},
	{
		problem_id: 219,
		maker_id: "u_119",
		title: "피보나치 수열",
		description: "n번째 피보나치 수를 구하시오.",
		difficulty: "medium",
		tags: ["수학"],
		problem_condition: [],
		created_at: "2025-08-24T10:45:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [53],
		group_names: ["알고리즘"],
		workbook_ids: [5004],
		workbook_names: ["연습"],
		rating_mode: "hard",
		reference_codes: [
			{
				language: "java",
				is_main: true,
				code: `int fib(int n){ if(n<=1) return n; return fib(n-1)+fib(n-2); }`,
			},
		],
		test_cases: [
			{ input: "n=5", expected_output: "5" },
			{ input: "n=10", expected_output: "55" },
		],
	},
	{
		problem_id: 220,
		maker_id: "u_120",
		title: "소수 판별",
		description: "정수가 소수인지 판별하시오.",
		difficulty: "hard",
		tags: ["수학"],
		problem_condition: [],
		created_at: "2025-08-24T10:50:00.000Z",
		deleted_at: null,
		problemType: "코딩",
		group_ids: [54],
		group_names: ["알고리즘"],
		workbook_ids: [5005],
		workbook_names: ["과제"],
		rating_mode: "regex",
		reference_codes: [
			{
				language: "typescript",
				is_main: true,
				code: `function isPrime(n:number){ if(n<2) return false; for(let i=2;i*i<=n;i++){ if(n%i===0) return false; } return true; }`,
			},
		],
		test_cases: [
			{ input: "n=7", expected_output: "true" },
			{ input: "n=10", expected_output: "false" },
		],
	},

	// === 디버깅 ===
	{
		problem_id: 221,
		maker_id: "u_121",
		title: "배열 합계 (디버깅)",
		description: "배열 합계를 구하는 코드의 버그를 수정하시오.",
		difficulty: "easy",
		tags: ["배열", "디버깅"],
		problem_condition: [],
		created_at: "2025-08-24T11:00:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [60],
		group_names: ["알고리즘"],
		workbook_ids: [6001],
		workbook_names: ["중간"],
		rating_mode: "hard",
		base_code: [
			{
				language: "python",
				code: `def sumArr(arr): total=1; for x in arr: total+=x; return total`,
			},
		],
		test_cases: [
			{ input: "arr=[1,2,3]", expected_output: "6" },
			{ input: "arr=[]", expected_output: "0" },
		],
	},
	{
		problem_id: 222,
		maker_id: "u_122",
		title: "문자열 대문자화 (디버깅)",
		description: "문자열을 대문자로 변환하는 코드의 버그를 수정하시오.",
		difficulty: "easy",
		tags: ["문자열", "디버깅"],
		problem_condition: [],
		created_at: "2025-08-24T11:05:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [61],
		group_names: ["문자열"],
		workbook_ids: [6002],
		workbook_names: ["실습"],
		rating_mode: "regex",
		base_code: [
			{
				language: "javascript",
				code: `function toUpper(s){ return s.toUppercase(); }`,
			},
		],
		test_cases: [{ input: "s='hello'", expected_output: "'HELLO'" }],
	},
	{
		problem_id: 223,
		maker_id: "u_123",
		title: "리스트 뒤집기 (디버깅)",
		description: "리스트를 뒤집는 코드의 버그를 수정하시오.",
		difficulty: "medium",
		tags: ["리스트", "디버깅"],
		problem_condition: [],
		created_at: "2025-08-24T11:10:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [62],
		group_names: ["자료구조"],
		workbook_ids: [6003],
		workbook_names: ["연습"],
		rating_mode: "regex",
		base_code: [
			{
				language: "cpp",
				code: `void reverse(vector<int>& v){ for(int i=0;i<=v.size()/2;i++){ swap(v[i],v[v.size()-i]); } }`,
			},
		],
		test_cases: [{ input: "v=[1,2,3]", expected_output: "[3,2,1]" }],
	},
	{
		problem_id: 224,
		maker_id: "u_124",
		title: "홀수 판별 (디버깅)",
		description: "숫자가 홀수인지 판별하는 코드의 버그를 수정하시오.",
		difficulty: "easy",
		tags: ["조건문", "디버깅"],
		problem_condition: [],
		created_at: "2025-08-24T11:15:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [63],
		group_names: ["알고리즘"],
		workbook_ids: [6004],
		workbook_names: ["퀴즈"],
		rating_mode: "space",
		base_code: [
			{
				language: "java",
				code: `boolean isOdd(int n){ return n%2==0; }`,
			},
		],
		test_cases: [
			{ input: "n=3", expected_output: "true" },
			{ input: "n=4", expected_output: "false" },
		],
	},
	{
		problem_id: 225,
		maker_id: "u_125",
		title: "문자열 길이 (디버깅)",
		description: "문자열 길이를 구하는 코드의 버그를 수정하시오.",
		difficulty: "easy",
		tags: ["문자열", "디버깅"],
		problem_condition: [],
		created_at: "2025-08-24T11:20:00.000Z",
		deleted_at: null,
		problemType: "디버깅",
		group_ids: [64],
		group_names: ["문자열"],
		workbook_ids: [6005],
		workbook_names: ["실습"],
		rating_mode: "regex",
		base_code: [
			{
				language: "typescript",
				code: `function length(s:string){ return s.size; }`,
			},
		],
		test_cases: [{ input: "s='test'", expected_output: "4" }],
	},
]
