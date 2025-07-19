// data/feedbackDummy.ts

export interface ConditionScore {
	/**
	 * 검사 조건 설명
	 */
	condition: string
	/**
	 * 해당 조건의 최대 배점
	 */
	maxScore: number
	/**
	 * 실제 획득한 점수
	 */
	earnedScore: number
}

export interface FeedbackData {
	/**
	 * 총점 (conditionScores의 earnedScore 합)
	 */
	totalScore: number
	/**
	 * 문제의 최대 배점
	 */
	maxScore: number
	/**
	 * 각 조건별 배점 정보
	 */
	conditionScores: ConditionScore[]
	/**
	 * 교수 피드백 (Markdown 형식)
	 */
	professorFeedback: string
}

export const feedbackDummy: FeedbackData = {
	totalScore: 10,
	maxScore: 15,
	conditionScores: [
		{ condition: "조건 1: ~~", maxScore: 5, earnedScore: 5 },
		{ condition: "조건 2: !!", maxScore: 5, earnedScore: 3 },
		{ condition: "조건 3: @@", maxScore: 5, earnedScore: 2 },
	],
	professorFeedback: `
교수 피드백 부분 더미데이터 내용~~
`,
}
