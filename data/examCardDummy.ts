// data/examCardDummy.ts

export interface Workbook {
	workbook_id: number
	group_id: number
	workbook_name: string
	problem_cnt: number
	description: string
	creation_date: string // 게시 시작일
}

export interface ExamInfo {
	examId: string
	startTime: string // 제출 가능 시작
	endTime: string // 제출 가능 종료
	totalScore: number // 총 배점
}

export interface ExamCardData {
	workbook: Workbook
	exam: ExamInfo | null
}

export const examCardDummy: ExamCardData[] = [
	{
		workbook: {
			workbook_id: 1,
			group_id: 101,
			workbook_name: "React 기초 문제집",
			problem_cnt: 15,
			description: "React 컴포넌트, 훅, 상태 관리 등 기초 개념 확인용 문제",
			creation_date: "2025-07-01T09:00:00+09:00",
		},
		exam: {
			examId: "exam-001",
			startTime: "2025-07-10T10:00:00+09:00",
			endTime: "2025-07-10T12:00:00+09:00",
			totalScore: 100,
		},
	},
	{
		workbook: {
			workbook_id: 2,
			group_id: 102,
			workbook_name: "TypeScript 심화 문제집",
			problem_cnt: 20,
			description: "Generics, Mapped Types 등 고급 기능 연습용 문제",
			creation_date: "2025-07-05T14:30:00+09:00",
		},
		exam: null,
	},
	{
		workbook: {
			workbook_id: 3,
			group_id: 103,
			workbook_name: "JavaScript 알고리즘 문제집",
			problem_cnt: 25,
			description: "배열, 객체, 문자열 조작 등 JavaScript 기본 알고리즘 문제",
			creation_date: "2025-07-08T16:00:00+09:00",
		},
		exam: {
			examId: "exam-003",
			startTime: "2025-07-12T09:00:00+09:00",
			endTime: "2025-07-12T11:30:00+09:00",
			totalScore: 150,
		},
	},
	{
		workbook: {
			workbook_id: 4,
			group_id: 104,
			workbook_name: "CSS 레이아웃 마스터",
			problem_cnt: 12,
			description: "Flexbox, Grid, 반응형 디자인 등 CSS 레이아웃 기법 문제",
			creation_date: "2025-07-03T11:00:00+09:00",
		},
		exam: null,
	},
	{
		workbook: {
			workbook_id: 5,
			group_id: 105,
			workbook_name: "Next.js 실전 프로젝트",
			problem_cnt: 18,
			description: "SSR, SSG, API Routes 등 Next.js 핵심 기능 실습 문제",
			creation_date: "2025-07-06T13:30:00+09:00",
		},
		exam: {
			examId: "exam-005",
			startTime: "2025-07-15T14:00:00+09:00",
			endTime: "2025-07-15T17:00:00+09:00",
			totalScore: 200,
		},
	},
	{
		workbook: {
			workbook_id: 6,
			group_id: 106,
			workbook_name: "데이터베이스 설계 기초",
			problem_cnt: 10,
			description: "SQL 쿼리, 정규화, 인덱스 등 데이터베이스 기본 개념 문제",
			creation_date: "2025-07-04T10:15:00+09:00",
		},
		exam: null,
	},
]
