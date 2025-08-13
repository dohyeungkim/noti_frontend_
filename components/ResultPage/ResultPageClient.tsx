"use client"
// 채점 기능 관련, 현재 목데이터로 진행중.

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import CodeLogReplay, { CodeLog } from "@/components/ResultPage/CodeLogReplay"
import { code_log_api, problem_api, solve_api, ai_feedback_api, comment_api, auth_api } from "@/lib/api"
import type { ProblemDetail } from "@/lib/api"
import ResultPageProblemDetail from "./ResultPageProblemDetail"
// import { ProblemDetail } from "../ProblemPage/ProblemModal/ProblemSelectorModal"
import { useRouter } from "next/navigation"
import { formatTimestamp } from "../util/dageUtils"
import { UserIcon } from "lucide-react"
// 시험 모드 isExamMode 로 시험모드 상태관리 가능 - 홍
import { useExamMode } from "@/hooks/useExamMode"
// 시험 모드 관련 임시 더미데이터 - 홍
import { feedbackDummy } from "@/data/examModeFeedbackDummy"
import ReactMarkdown from "react-markdown"
import ProblemDetailRenderer from "@/components/ResultPage/ProblemDetailRenderer"
import AnswerRenderer from "@/components/ResultPage/AnswerRenderer"

interface SolveData {
	problemType: string
	solve_id: number
	user_id: string
	group_id: number
	group_name: string
	workbook_id: number
	workbook_name: string
	problem_id: number
	problem_name: string
	submitted_code: string
	code_language: string
	code_len: number
	result: boolean
	passed: boolean
	timestamp: string
	rating_mode: string
	test_cases: any[]
	test_results: any[]
	overall_status: string
	execution_time: number
	condition_check_results: {
		condition: string
		is_required: boolean
		check_type: string
		description: string
		passed: boolean
		feedback: string
	}[]
	ai_feedback: string
	test_success_rate: number
	condition_success_rate: number
	passed_count?: number
	total_count?: number
	success_rate?: number
}

interface ConditionResult {
	id: number
	condition: string
	is_required: boolean
	check_type: string
	description: string
	passed: boolean
	feedback: string
	status: "pass" | "fail"
}

interface Comment {
	user_id: string
	problem_id: number
	solve_id: number
	comment: string
	is_anonymous: boolean
	nickname: string
	is_problem_message: boolean
	timestamp?: string
}

export default function FeedbackWithSubmissionPageClient({
	params,
}: {
	params: {
		groupId: string
		examId: string
		problemId: string
		resultId: string
	}
}) {
	// const [problem, setProblem] = useState<Problem | null>(null)
	const [problemDetail, setProblemDetail] = useState<ProblemDetail | null>(null)
	const [codeLogs, setCodeLogs] = useState<CodeLog[]>([])
	const [aiFeedback, setAiFeedback] = useState<string>("")
	const [isLoaded, setIsLoaded] = useState(false)
	const [isAILoaded, setIsAILoaded] = useState(false)
	const [solveData, setSolveData] = useState<SolveData | null>(null)
	const [conditionResults, setConditionResults] = useState<ConditionResult[]>([])
	const [isConditionLoaded, setIsConditionLoaded] = useState(false)
	const [comments, setComments] = useState<Comment[]>([])
	const [newComment, setNewComment] = useState("")
	const [isAnonymous, setIsAnonymous] = useState(false)
	const [activeTab, setActiveTab] = useState<"problem" | "submission">("submission")
	const [userId, setUserId] = useState<string>("")
	const router = useRouter()
	const { isExamMode } = useExamMode()

	// 시험모드 더미데이터 총점, 각 조건별 최대 배점과 획득 점수 정보 배열, Markdown 형식 교수 피드백 - 홍
	const { totalScore, maxScore, professorFeedback: dummyProfessorFeedback } = feedbackDummy
	// const { conditionScores } = feedbackDummy

	const [activeFeedbackTab, setActiveFeedbackTab] = useState<"ai" | "professor">("ai")

	// AI 피드백 가져오기
	useEffect(() => {
		const fetchAiFeedback = async () => {
			try {
				const res = await ai_feedback_api.get_ai_feedback(Number(params.resultId))
				setAiFeedback(res.feedback)
				setIsAILoaded(true)
			} catch (error) {
				console.error("AI 피드백 가져오기 실패:", error)
				// solveData에서 AI 피드백을 사용하는 경우를 대비
				setIsAILoaded(true)
			}
		}

		fetchAiFeedback()
	}, [params.resultId])

	const fetchProblem = useCallback(async () => {
		try {
			const res = await problem_api
				.problem_get_by_id_group(Number(params.groupId), Number(params.examId), Number(params.problemId))
				.then(setProblemDetail)
			// setProblem(res)
		} catch (error) {
			console.error("문제 불러오기 중 오류 발생:", error)
		}
	}, [params.groupId, params.examId, params.problemId])

	const fetchSolve = useCallback(async () => {
		try {
			const res = await solve_api.solve_get_by_problem_ref_id(
				Number(params.groupId),
				Number(params.examId),
				Number(params.problemId)
			)
			setSolveData(res)

			console.log(res)
			// AI 피드백이 solveData에 포함되어 있다면 사용
			if (res.ai_feedback && !aiFeedback) {
				setAiFeedback(res.ai_feedback)
				setIsAILoaded(true)
			}

			// 조건 검사 결과 처리
			if (res.condition_check_results && res.condition_check_results.length > 0) {
				// condition_check_results 상세 정보 활용
				const conditionCheckResults = res.condition_check_results.map((conditionResult: any, index: number) => ({
					id: index + 1,
					condition: conditionResult.condition || `조건 ${index + 1}`,
					is_required: conditionResult.is_required || false,
					check_type: conditionResult.check_type || "unknown",
					description: conditionResult.description || "",
					passed: conditionResult.passed || false,
					feedback: conditionResult.feedback || "",
					status: conditionResult.passed ? ("pass" as const) : ("fail" as const),
				}))
				setConditionResults(conditionCheckResults)
			} else if (problemDetail && problemDetail.problem_condition && problemDetail.problem_condition.length > 0) {
				// problem_condition을 기반으로 조건 결과 생성
				const problemConditionResults = problemDetail.problem_condition.map((condition: string, index: number) => ({
					id: index + 1,
					condition,
					is_required: true,
					check_type: "problem_requirement",
					description: "문제에서 요구하는 조건입니다",
					passed: res.passed || false, // 전체 통과 여부를 기반으로 설정
					feedback: res.passed ? "조건을 만족했습니다." : "조건을 확인해주세요.",
					status: res.passed ? ("pass" as const) : ("fail" as const),
				}))
				setConditionResults(problemConditionResults)
			} else {
				// 조건이 없으면 빈 배열로 설정
				setConditionResults([])
			}
		} catch (error) {
			console.error("제출 기록 불러오기 중 오류 발생:", error)
		}
	}, [params.resultId, aiFeedback])

	const fetchCodeLogs = useCallback(async () => {
		try {
			const res = await code_log_api.code_logs_get_by_solve_id(Number(params.resultId))
			setCodeLogs(res)
		} catch (error) {
			console.error("코드 로그 불러오기 중 오류 발생:", error)
		}
	}, [params.resultId])

	// 댓글 가져오기
	const fetchComments = useCallback(async () => {
		try {
			console.log(`댓글 조회 시작: ${activeTab}, problemId: ${params.problemId}, resultId: ${params.resultId}`)

			const data =
				activeTab === "problem"
					? await comment_api.comments_get_by_problem_id(Number(params.problemId))
					: await comment_api.comments_get_by_solve_id(Number(params.resultId))

			console.log("댓글 조회 결과:", data)
			setComments(data || [])
		} catch (error) {
			console.error(`코멘트 불러오기 오류:`, error)
			setComments([])
		}
	}, [activeTab, params.problemId, params.resultId])

	// 사용자 정보 가져오기
	const fetchUserId = useCallback(async () => {
		try {
			console.log("사용자 정보 조회 시작")
			const user = await auth_api.getUser()
			console.log("사용자 정보:", user)
			setUserId(user.user_id)
		} catch (error) {
			console.error("사용자 아이디 불러오기 실패:", error)
		}
	}, [])

	useEffect(() => {
		fetchProblem()
		fetchSolve()
		fetchCodeLogs()
	}, [fetchProblem, fetchSolve, fetchCodeLogs])

	// 컴포넌트 마운트시 사용자 정보 먼저 가져오기
	useEffect(() => {
		fetchUserId()
	}, [fetchUserId])

	// 사용자 정보 로드 후 댓글 가져오기
	useEffect(() => {
		if (userId) {
			console.log("사용자 ID 확인됨, 댓글 조회:", userId)
			fetchComments()
		}
	}, [userId, fetchComments])

	// activeTab 변경시에만 댓글 새로고침
	useEffect(() => {
		if (userId) {
			console.log("탭 변경됨, 댓글 새로고침:", activeTab)
			fetchComments()
		}
	}, [activeTab])

	useEffect(() => {
		if (problemDetail && solveData && codeLogs) {
			setIsLoaded(true)
		}
	}, [problemDetail, solveData, codeLogs])

	// 댓글 전송 핸들러
	const handleAddComment = async () => {
		if (!newComment.trim()) {
			alert("댓글을 입력하세요.")
			return
		}

		if (!userId) {
			alert("사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.")
			return
		}

		try {
			console.log("댓글 생성 시작:", {
				userId,
				problemId: params.problemId,
				resultId: params.resultId,
				comment: newComment,
				// isAnonymous,

				isProblemMessage: activeTab === "problem",
			})

			await comment_api.comment_create(
				userId,
				Number(params.problemId),
				Number(params.resultId),
				newComment,
				// isAnonymous,
				// "익명",
				activeTab === "problem"
			)

			console.log("댓글 생성 완료, 목록 새로고침")
			await fetchComments()
			setNewComment("")
		} catch (error) {
			console.error("코멘트 생성 오류:", error)
			alert("댓글 작성에 실패했습니다.")
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleAddComment()
		}
	}

	// 긴 문자열을 줄 바꿈하는 함수
	const formatCommentWithLineBreaks = (comment: string, maxLength: number = 50) => {
		return comment.split("").reduce((acc, char, idx) => {
			if (idx > 0 && idx % maxLength === 0) acc += "\n"
			return acc + char
		}, "")
	}

	if (!isLoaded) {
		return (
			<motion.div
				className="w-full min-h-screen flex items-center justify-center"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className="text-2xl font-bold text-gray-800">문제를 불러오는 중입니다...</h1>
			</motion.div>
		)
	}

	return (
		<div className="flex min-h-screen">
			{/* 메인 컨텐츠 영역 */}
			<div className="flex-1 max-w-7xl mx-auto">
				{/* 헤더 */}
				<motion.div
					className="mb-6"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="flex items-center gap-2 mb-2 mt-8">
						<div className="w-8 h-8 rounded flex items-center justify-center">
							<span className="text-xl">📓</span>
						</div>
						<h1 className="text-xl font-bold text-gray-800">
							문제 {solveData?.problem_name || solveData?.problem_id || "PY31-0001"} 문제의 피드백
						</h1>
					</div>
					<div className="flex items-center gap-4 ml-2">
						{/* <span className="text-sm text-gray-600">🔥 열심히다.</span> */}
						{isExamMode && (
							<span className="text-sm text-gray-600">
								✔️ 점수: {totalScore}/{maxScore}점
							</span>
						)}
						{solveData && (
							<>
								<span className={`text-sm font-bold ${solveData.passed ? "text-green-600" : "text-red-600"}`}>
									{solveData.passed ? "🟢 맞았습니다" : "🔴 틀렸습니다"}
								</span>
								<span className="text-sm text-gray-500">
									언어: {solveData.code_language} | 길이: {solveData.code_len}자
								</span>
								{solveData.execution_time && (
									<span className="text-sm text-gray-500">실행시간: {solveData.execution_time}ms</span>
								)}
							</>
						)}
					</div>
				</motion.div>

				{/* 레이아웃 그리드 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* 왼쪽: 사용자가 작성한 답안 */}
					{/* 코딩, 디버깅 문제일 때 코드 랜더링 */}
					{problemDetail?.problemType === "코딩" || problemDetail?.problemType === "디버깅" ? (
						<motion.div
							className="bg-white rounded-lg shadow-sm border p-4"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<CodeLogReplay codeLogs={codeLogs} idx={0} />
						</motion.div>
					) : (
						// 객관식, 주관식, 단답형 문제일 때
						<motion.div
							className="bg-white rounded-lg shadow-sm border p-4"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<AnswerRenderer problem={problemDetail!} solveData={solveData!} />
						</motion.div>
					)}
					{/* 오른쪽: 조건 및 AI 피드백 조건 뜨는 창*/}
					<div className="space-y-6 h-[600px] flex flex-col">
						{/* 조건 검사 결과 섹션 - 높이 확장 */}
						<motion.div
							className="bg-white rounded-lg shadow-sm border flex-1"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
						>
							<div className="p-4 border-b">
								<h3 className="font-semibold text-gray-800">조건 검사 결과</h3>
								{solveData && (
									<div className="flex items-center gap-4 mt-2 flex-wrap">
										{solveData.condition_success_rate !== undefined && (
											<span className="text-sm text-gray-600">
												조건 성공률: {Math.round(solveData.condition_success_rate * 100)}%
											</span>
										)}
										{solveData.success_rate !== undefined && (
											<span className="text-sm text-gray-600">
												전체 성공률: {Math.round(solveData.success_rate * 100)}%
											</span>
										)}
										{solveData.passed_count !== undefined && solveData.total_count !== undefined && (
											<span className="text-sm text-gray-600">
												통과: {solveData.passed_count}/{solveData.total_count}
											</span>
										)}
										<span
											className={`text-xs px-2 py-1 rounded ${
												solveData.overall_status === "all_passed" || solveData.overall_status === "success"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{solveData.overall_status}
										</span>
									</div>
								)}
							</div>
							<div className="p-4 space-y-4 h-full overflow-y-auto">
								{!isConditionLoaded ? (
									// 조건 로딩 중
									<div className="flex items-center justify-center h-32">
										<div className="flex items-center gap-3 text-gray-500">
											<div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
											<div className="text-center">
												<p className="text-sm font-medium">조건 검사 결과를 불러오는 중...</p>
												<p className="text-xs mt-1">잠시만 기다려주세요.</p>
											</div>
										</div>
									</div>
								) : conditionResults.length === 0 ? (
									// 조건이 없을 때
									<div className="flex items-center justify-center h-32 text-gray-500">
										<div className="text-center">
											<p className="text-sm">조건 검사 결과가 없습니다.</p>
											<p className="text-xs mt-1">코드가 실행되지 않았거나 조건이 설정되지 않았습니다.</p>
										</div>
									</div>
								) : (
									// 조건 목록
									conditionResults.map((condition) => (
										<motion.div
											key={condition.id}
											className={`p-4 rounded-lg border-l-4 ${
												condition.status === "pass"
													? "bg-green-50 border-l-green-500 border border-green-200"
													: "bg-red-50 border-l-red-500 border border-red-200"
											}`}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: condition.id * 0.1 }}
										>
											{/* 조건 헤더 */}
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h4 className="font-semibold text-gray-800 text-base">조건 {condition.id}</h4>
														{condition.is_required && (
															<span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
																필수
															</span>
														)}
														<span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
															{condition.check_type}
														</span>
													</div>
													<p className="font-medium text-gray-700 text-sm">{condition.condition}</p>
												</div>
												{/* 오른쪽: 점수 / 아이콘 */}
												<div className="ml-3 text-right">
													{/* 이 3/5 부분은 시험모드일 때만 뜨도록 해야됨 - 홍 */}
													{isExamMode && <div className="text-xs font-medium mb-1">3/5점</div>}
													{/* pass/fail 아이콘 */}
													{condition.status === "pass" ? (
														<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
															<span className="text-white text-lg">✓</span>
														</div>
													) : (
														<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
															<span className="text-white text-lg">✗</span>
														</div>
													)}
												</div>
											</div>

											{/* 조건 설명 */}
											{condition.description && (
												<div className="mb-3">
													<p className="text-sm text-gray-600 leading-relaxed">📋 {condition.description}</p>
												</div>
											)}

											{/* AI 피드백 */}
											{condition.feedback && (
												<div
													className={`p-3 rounded-lg ${
														condition.status === "pass"
															? "bg-green-100 text-green-800 border border-green-200"
															: "bg-red-100 text-red-800 border border-red-200"
													}`}
												>
													<div className="flex items-start gap-2">
														<span className="text-base">💬</span>
														<p className="text-sm font-medium leading-relaxed">{condition.feedback}</p>
													</div>
												</div>
											)}
										</motion.div>
									))
								)}
							</div>
						</motion.div>

						{/* AI 피드백 섹션 - 고정 높이 */}
						<motion.div
							className="bg-white rounded-lg shadow-sm border h-48"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.3 }}
						>
							{/* 탭 헤더 */}
							<div className="p-2 flex space-x-2 border-b">
								<button
									className={`px-4 py-1 text-sm font-medium ${
										activeFeedbackTab === "ai" ? "bg-green-100 text-green-700 border-b-white" : "text-gray-600 "
									}`}
									onClick={() => setActiveFeedbackTab("ai")}
								>
									AI 피드백
								</button>
								<button
									className={`px-4 py-1 text-sm font-medium ${
										activeFeedbackTab === "professor" ? "bg-green-100 text-green-700 border-b-white" : "text-gray-600"
									}`}
									onClick={() => setActiveFeedbackTab("professor")}
								>
									교수 피드백
								</button>
							</div>

							{/* 탭 내용 */}
							<div className="p-4 h-32 overflow-y-auto">
								{!isAILoaded && activeFeedbackTab === "ai" ? (
									<div className="flex items-center gap-2 text-gray-500">
										<div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
										<span className="text-sm">AI 피드백을 불러오는 중...</span>
									</div>
								) : (
									<div className="prose prose-sm max-w-none text-gray-800">
										<ReactMarkdown>
											{activeFeedbackTab === "ai"
												? aiFeedback || solveData?.ai_feedback || "AI 피드백이 없습니다."
												: dummyProfessorFeedback}
										</ReactMarkdown>
									</div>
								)}
							</div>
						</motion.div>
					</div>
				</div>

				{/* 하단: 문제별 | 제출별 탭과 코멘트 */}
				<motion.div
					className="mt-6 bg-white rounded-lg shadow-sm border"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.4 }}
				>
					{/* 탭 헤더 */}
					<div className="border-b">
						<div className="flex">
							<button
								className={`px-6 py-3 text-sm font-medium ${
									activeTab === "submission"
										? "text-green-600 border-b-2 border-green-600 bg-green-50"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => {
									console.log("제출별 탭 클릭")
									setActiveTab("submission")
								}}
							>
								제출별
							</button>
							<button
								className={`px-6 py-3 text-sm font-medium ${
									activeTab === "problem"
										? "text-green-600 border-b-2 border-green-600 bg-green-50"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => {
									console.log("문제별 탭 클릭")
									setActiveTab("problem")
								}}
							>
								문제별
							</button>
						</div>
					</div>

					{/* 코멘트 섹션 */}
					<div className="p-6">
						<h4 className="font-semibold text-gray-800 mb-4">
							{activeTab === "problem" ? `📝 문제 ${params.problemId}번의 댓글` : `💬 제출별 댓글`}
						</h4>

						{/* 기존 코멘트 목록 */}
						<div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
							{comments.length === 0 ? (
								<div className="bg-gray-50 rounded-lg p-6 text-center">
									<div className="flex items-center justify-center gap-2 text-gray-500">
										<p className="text-sm">댓글이 없습니다.</p>
									</div>
								</div>
							) : (
								comments.map((comment, index) => (
									<motion.div
										key={`${comment.user_id}-${comment.timestamp}-${index}`}
										className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
									>
										{/* 프로필 아이콘 */}
										<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
											<UserIcon className="w-6 h-6 text-gray-600" />
										</div>

										{/* 댓글 내용 */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2 mb-1">
												<strong className="text-gray-900 text-sm">
													{comment.is_anonymous ? comment.nickname : comment.user_id}
												</strong>
												{comment.is_anonymous && (
													<span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">익명</span>
												)}
												<span className="text-xs text-gray-500">
													{comment.timestamp ? formatTimestamp(comment.timestamp) : "방금 전"}
												</span>
											</div>
											<p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
												{formatCommentWithLineBreaks(comment.comment, 50)}
											</p>
										</div>
									</motion.div>
								))
							)}
						</div>

						{/* 새 코멘트 작성 */}
						<div className="border-t pt-6">
							<div className="space-y-3">
								<div className="flex items-center gap-4 mb-3">
									<label className="block text-sm font-medium text-gray-700">새 댓글 작성</label>
									{/* 익명 체크박스 */}
									<label className="flex items-center space-x-2 cursor-pointer">
										<input
											type="checkbox"
											className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
											checked={isAnonymous}
											onChange={(e) => setIsAnonymous(e.target.checked)}
										/>
										<span className="text-sm text-gray-700">익명으로 작성</span>
									</label>
								</div>

								<div className="flex items-end gap-3">
									<textarea
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
										onKeyPress={handleKeyPress}
										placeholder="댓글을 입력하세요... (Shift+Enter로 줄바꿈, Enter로 등록)"
										className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={3}
									/>
									<div className="flex flex-col gap-2">
										<button
											onClick={handleAddComment}
											disabled={!newComment.trim()}
											className="px-4 py-2 bg-mygreen text-white text-sm rounded-lg hover:bg-mydarkgreen disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
										>
											등록
										</button>
										<button
											onClick={() => setNewComment("")}
											className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
										>
											취소
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* 액션 버튼들 */}
				<motion.div
					className="mt-6 flex gap-3"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.5 }}
				>
					<button
						className="px-6 py-2 bg-mygreen text-white rounded-lg shadow hover:bg-mydarkgreen transition-colors"
						onClick={() =>
							router.push(`/mygroups/${params.groupId}/exams/${params.examId}/problems/${params.problemId}/result/`)
						}
					>
						전체 제출 보러가기
					</button>
					<button
						className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
						onClick={() =>
							router.push(
								`/mygroups/${params.groupId}/exams/${params.examId}/problems/${params.problemId}/write?solve_id=${
									params.resultId
								}&language=${solveData?.code_language?.toLowerCase() || ""}`
							)
						}
					>
						다시 풀러 가기
					</button>
				</motion.div>

				{/* 문제 상세 정보 */}
				{problemDetail && (
					<motion.div
						className="mt-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.6 }}
					>
						<ResultPageProblemDetail problem={problemDetail} />
						<div className="mt-6">
							<h2 className="text-lg font-bold mb-2">문제 유형별 상세 정보</h2>
							<ProblemDetailRenderer problem={problemDetail} />
						</div>
					</motion.div>
				)}
			</div>
		</div>
	)
}
