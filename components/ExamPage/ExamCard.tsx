"use client"

import { ExamCardData } from "@/data/examCardDummy"
import { GradingStudent, gradingDetailDummy } from "@/data/gradingDummy"

interface ExamCardProps {
	data: ExamCardData
	onClick: () => void
	isGroupOwner?: boolean // 그룹장 여부
	studentPerformance?: GradingStudent // 학생 채점 정보
}

export default function ExamCard({ data, onClick, isGroupOwner = false, studentPerformance }: ExamCardProps) {
	const { workbook, exam } = data
	const { problemCount, maxScorePerProblem, problems } = gradingDetailDummy

	// 총 가능한 점수
	const totalPossibleScore = problemCount * maxScorePerProblem

	// 학생 총점 계산
	const totalScore = studentPerformance
		? studentPerformance.totalScore ?? studentPerformance.problemScores.reduce((sum, s) => sum + s, 0)
		: 0

	// 카드 배경색 설정 (학생 채점 상태에 따라)
	const cardBgColor =
		!isGroupOwner && studentPerformance
			? totalScore === totalPossibleScore
				? "bg-green-50"
				: totalScore === 0
				? "bg-red-50"
				: "bg-yellow-50"
			: "bg-white"

	// 날짜 포맷팅 함수
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	// 시험 상태 판단
	const getExamStatus = () => {
		if (!exam) return null
		const now = new Date()
		const creationDate = new Date(workbook.creation_date)
		const start = new Date(exam.startTime)
		const end = new Date(exam.endTime)
		if (now < creationDate) return { text: "게시 예정", color: "bg-gray-100 text-gray-600" }
		if (now < start) return { text: "게시됨", color: "bg-blue-100 text-blue-600" }
		if (now <= end) return { text: "제출 가능", color: "bg-green-100 text-green-600" }
		return { text: "제출 마감", color: "bg-red-100 text-red-600" }
	}
	const examStatus = exam ? getExamStatus() : null

	return (
		<div
			onClick={onClick}
			className={`group relative ${cardBgColor} border border-gray-200 rounded-2xl p-6 cursor-pointer
        shadow-md transition-all duration-300 ease-in-out
        hover:-translate-y-1 hover:shadow-xl transform-gpu
        flex flex-col justify-between h-full`}
		>
			{/* 상단: 제목 및 시험 상태 / 점수 / 문제 유형 */}
			<div className="flex-shrink-0 relative">
				<div className="flex items-start justify-between mb-3">
					<h2 className="text-xl font-semibold flex-1 overflow-hidden text-ellipsis" title={workbook.workbook_name}>
						📄{" "}
						{workbook.workbook_name.length > 20 ? `${workbook.workbook_name.slice(0, 20)}...` : workbook.workbook_name}
					</h2>
					<div className="flex flex-col items-end">
						{exam && examStatus && (
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${examStatus.color}`}>
								{examStatus.text}
							</span>
						)}
						{isGroupOwner ? (
							<div className="flex flex-wrap space-x-1 mt-1">
								{problems.map((p, idx) => (
									<span key={idx} className="px-1 py-0.5 bg-gray-200 text-xs rounded">
										{p.type}({p.score}점)
									</span>
								))}
							</div>
						) : studentPerformance ? (
							<div className="mt-1 text-sm font-medium text-gray-800">
								{totalScore}/{totalPossibleScore}
							</div>
						) : null}
					</div>
				</div>

				{/* 학생별 문제 정답 상태 인디케이터 (점수에 따라 색상 표시) */}
				{!isGroupOwner && studentPerformance && (
					<div className="flex items-center space-x-1 mt-2">
						{studentPerformance.problemScores.map((score, idx) => {
							const color = score === maxScorePerProblem ? "bg-green-500" : score === 0 ? "bg-red-500" : "bg-yellow-500"
							return <span key={idx} className={`w-3 h-3 rounded-full ${color}`} />
						})}
					</div>
				)}
			</div>

			{/* 중간: 설명 */}
			<div className="flex-1 flex flex-col justify-center my-4">
				<p title={workbook.description} className="text-gray-600 text-sm overflow-hidden text-ellipsis line-clamp-3">
					{workbook.description}
				</p>
			</div>

			{/* 시험 정보 블록: 그룹장일 때 */}
			{isGroupOwner && (
				<div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-2">
					<div className="flex items-center gap-2 text-sm">
						<span className="font-medium text-blue-800">🎯 시험 모드</span>
					</div>
					<div className="text-xs text-gray-700">
						<span className="font-medium">📅 게시 일시:</span>
						<div className="ml-2 mt-1">{formatDate(workbook.creation_date)}</div>
					</div>
					<div className="text-xs text-gray-700">
						<span className="font-medium">📝 제출 기간:</span>
						<div className="ml-2 mt-1">
							{exam ? (
								<>
									{formatDate(exam.startTime)} ~<br />
									{formatDate(exam.endTime)}
								</>
							) : (
								"미설정"
							)}
						</div>
					</div>
					<div className="flex items-center justify-between text-xs text-gray-700">
						<span>📌 문제 수: {workbook.problem_cnt}개</span>
						<span>💯 총 배점: {exam ? `${exam.totalScore}점` : "미설정"}</span>
					</div>
				</div>
			)}

			{/* 하단: 버튼 */}
			<div className="flex-shrink-0">
				<button
					className="w-full py-2 rounded-xl text-lg font-semibold
            transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80"
				>
					{isGroupOwner ? "문제 보기" : exam ? "시험 입장하기 →" : "문제지 펼치기 →"}
				</button>
			</div>
		</div>
	)
}
