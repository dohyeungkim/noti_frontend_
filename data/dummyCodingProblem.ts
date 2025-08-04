// dummyCodingProblem.ts
type RatingMode = "hard" | "space" | "regex" | "none"
type ProblemType = "코딩" | "디버깅" | "객관식" | "주관식" | "단답형"

export interface DummyProblem {
	title: string
	description: string
	difficulty: string
	rating_mode: RatingMode
	problem_type: ProblemType
	problem_score: number
	tags: string[]
	conditions: string[]
	referenceCodes: { language: string; code: string; is_main: boolean }[]
	testCases: { input: string; expected_output: string }[]
}

// ⬇️ 정확한 타입 지정
export const dummyCodingProblem: DummyProblem = {
	title: "예제 문제",
	description: "설명",
	difficulty: "easy",
	rating_mode: "hard",
	problem_type: "주관식",
	problem_score: 10,
	tags: ["배열", "정렬"],
	conditions: ["조건1", "조건2"],
	referenceCodes: [{ language: "python", code: "print('Hello')", is_main: true }],
	testCases: [
		{ input: "1\n2", expected_output: "3" },
		{ input: "4\n5", expected_output: "9" },
	],
}
