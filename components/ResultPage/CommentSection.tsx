"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import CodeLogReplay, { CodeLog } from "@/components/ResultPage/CodeLogReplay"
import { code_log_api, problem_api, solve_api, ai_feedback_api, comment_api, auth_api } from "@/lib/api"
import ResultPageProblemDetail from "./ResultPageProblemDetail"
import { Problem } from "../ProblemPage/ProblemModal/ProblemSelectorModal"
import { useRouter } from "next/navigation"
import { formatTimestamp } from "../util/dageUtils"
import { UserIcon } from "lucide-react"

interface SolveData {
	passed: boolean
	user_id: string
	language: string
	code_length: number
}

interface TestCase {
	id: number
	status: "pass" | "fail"
	description: string
}

interface Comment {
	user_id: string
	problem_id: number
	solve_id: number
	comment: string
	// is_anonymous: boolean
	// nickname: string
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
	const [problem, setProblem] = useState<Problem | null>(null)
	const [codeLogs, setCodeLogs] = useState<CodeLog[]>([])
	const [aiFeedback, setAiFeedback] = useState<string>("")
	const [isLoaded, setIsLoaded] = useState(false)
	const [isAILoaded, setIsAILoaded] = useState(false)
	const [solveData, setSolveData] = useState<SolveData | null>(null)
	const [testCases, setTestCases] = useState<TestCase[]>([
		{ id: 1, status: "pass", description: "기본 입력 테스트" },
		{ id: 2, status: "fail", description: "경계값 테스트" },
		{ id: 3, status: "pass", description: "음수 입력 테스트" },
		{ id: 4, status: "pass", description: "큰 수 입력 테스트" },
	])
	const [comments, setComments] = useState<Comment[]>([])
	const [newComment, setNewComment] = useState("")
	const [isAnonymous, setIsAnonymous] = useState(false)
	const [activeTab, setActiveTab] = useState<"problem" | "submission">("submission")
	const [userId, setUserId] = useState<string>("")
	const router = useRouter()

	useEffect(() => {
		setSolveData({
			user_id: "user123",
			passed: false,
			language: "Python",
			code_length: 250,
		})
	}, [])

	useEffect(() => {
		const fetchAiFeedback = async () => {
			try {
				const res = await ai_feedback_api.get_ai_feedback(Number(params.resultId))
				setAiFeedback(res.feedback)
				setIsAILoaded(true)
			} catch (error) {
				console.error("AI 피드백 가져오기 실패:", error)
			}
		}

		fetchAiFeedback()
	}, [params.resultId])

	const fetchProblem = useCallback(async () => {
		try {
			const res = await problem_api.problem_get_by_id_group(
				Number(params.groupId),
				Number(params.examId),
				Number(params.problemId)
			)
			setProblem(res)
		} catch (error) {
			console.error("문제 불러오기 중 오류 발생:", error)
		}
	}, [params.groupId, params.examId, params.problemId])

	const fetchSolve = useCallback(async () => {
		try {
			const res = await solve_api.solve_get_by_solve_id(Number(params.resultId))
			setSolveData(res)
		} catch (error) {
			console.error("제출 기록 불러오기 중 오류 발생:", error)
		}
	}, [params.resultId])

	const fetchCodeLogs = useCallback(async () => {
		try {
			const res = await code_log_api.code_logs_get_by_solve_id(Number(params.resultId))
			setCodeLogs(res)
		} catch (error) {
			console.error("코드 로그 불러오기 중 오류 발생:", error)
		}
	}, [params.resultId])

	// ✅ 댓글 가져오기 - 의존성 배열 단순화
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

	// ✅ 사용자 정보 가져오기 - 의존성 배열 단순화
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
		if (problem && solveData && codeLogs) {
			setIsLoaded(true)
		}
	}, [problem, solveData, codeLogs])

	// ✅ 댓글 전송 핸들러
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
			// 댓글 목록 새로고침
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

	// 🔹 긴 문자열을 줄 바꿈하는 함수
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
		<div className="flex min-h-screen bg-gray-50">
			{/* 메인 컨텐츠 영역 - 최대 너비 확장 */}
			<div className="flex-1 max-w-7xl mx-auto p-6">
				{/* 헤더 */}
				<motion.div
					className="mb-6"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="flex items-center gap-2 mb-2">
						<div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
							<span className="text-white font-bold text-sm">📘</span>
						</div>
						<h1 className="text-xl font-bold text-gray-800">문제 {problem?.problem_id || "PY31-0001"} 문제의 피드백</h1>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-600">🔥 열심히다.</span>
					</div>
				</motion.div>

				{/* 레이아웃 그리드 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* 왼쪽: 코드 로그 */}
					<motion.div
						className="bg-white rounded-lg shadow-sm border p-4"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
					>
						<CodeLogReplay codeLogs={codeLogs} idx={0} />
					</motion.div>

					{/* 오른쪽: 조건 및 AI 피드백 */}
					<div className="space-y-6">
						{/* 조건 섹션 */}
						<motion.div
							className="bg-white rounded-lg shadow-sm border"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
						>
							<div className="p-4 border-b">
								<h3 className="font-semibold text-gray-800">조건</h3>
							</div>
							<div className="p-4 space-y-2">
								{testCases.map((testCase) => (
									<div
										key={testCase.id}
										className={`flex items-center gap-3 p-3 rounded-lg ${
											testCase.status === "pass"
												? "bg-green-50 border border-green-200"
												: "bg-red-50 border border-red-200"
										}`}
									>
										<span className="font-medium text-gray-700">{testCase.id}.</span>
										<span className="flex-1 text-sm text-gray-600">{testCase.description}</span>
										<div className="flex items-center gap-1 text-sm">
											{testCase.status === "pass" ? (
												<span className="text-green-600">✓</span>
											) : (
												<span className="text-red-600">✗</span>
											)}
										</div>
									</div>
								))}
							</div>
						</motion.div>

						{/* AI 피드백 섹션 */}
						<motion.div
							className="bg-white rounded-lg shadow-sm border"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.3 }}
						>
							<div className="p-4 border-b">
								<h3 className="font-semibold text-gray-800">AI 피드백</h3>
							</div>
							<div className="p-4">
								{!isAILoaded ? (
									<div className="flex items-center gap-2 text-gray-500">
										<div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
										<span className="text-sm">AI 피드백을 불러오는 중...</span>
									</div>
								) : (
									<p className="text-gray-700 text-sm leading-relaxed">
										{aiFeedback || "❌ 조건문에서 edge case 처리를 추가하면 더 정확한 결과를 얻을 수 있습니다."}
									</p>
								)}
							</div>
						</motion.div>
					</div>
				</div>

				{/* 하단: 문제별 | 제출별 탭과 코멘트 - 전체 너비 사용 */}
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
										? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
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
										? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
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
										<div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"></div>
										<p className="text-sm">댓글을 불러오는 중...</p>
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
										{/* 🔹 프로필 아이콘 */}
										<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
											<UserIcon className="w-6 h-6 text-gray-600" />
										</div>

										{/* 🔹 댓글 내용 */}
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
									{/* 🔸 익명 체크박스 */}
									<label className="flex items-center space-x-2 cursor-pointer">
										<input
											type="checkbox"
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
											className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
						className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
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
								}&language=${solveData?.language?.toLowerCase() || ""}`
							)
						}
					>
						다시 풀러 가기
					</button>
				</motion.div>

				{/* 문제 상세 정보 */}
				{problem && (
					<motion.div
						className="mt-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.6 }}
					>
						<ResultPageProblemDetail problem={problem} />
					</motion.div>
				)}
			</div>
		</div>
	)
}
