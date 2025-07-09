"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"
import { group_api } from "@/lib/api"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, MessageSquare } from "lucide-react"
import ReactMarkdown from "react-markdown"

import {
	studentSubmission,
	studentSubmissionsCollection,
	gradingDummy,
	GradingStudent,
	gradingDetailDummy,
} from "@/data/gradingDummy"
import { feedbackDummy } from "@/data/examModeFeedbackDummy"
import { motion } from "framer-motion"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface Submission {
	problemId: number
	answerType: string
	answer: string
	score: number
}

export default function StudentGradingPage() {
	const { groupId, examId, studentId } = useParams() as {
		groupId: string
		examId: string
		studentId: string
	}
	const router = useRouter()
	const { userName } = useAuth()

	// 1️⃣ 그룹장 여부
	const [groupOwner, setGroupOwner] = useState<string | null>(null)
	useEffect(() => {
		group_api
			.my_group_get()
			.then((data) => {
				const grp = data.find((g: any) => g.group_id === Number(groupId))
				setGroupOwner(grp?.group_owner ?? null)
			})
			.catch(console.error)
	}, [groupId])
	const isGroupOwner = userName === groupOwner

	// 2️⃣ 제출 데이터 & 페이징
	const [submissions, setSubmissions] = useState<Submission[]>([])
	const [studentName, setStudentName] = useState("")
	const [currentIdx, setCurrentIdx] = useState(0)
	useEffect(() => {
		const data =
			studentId === studentSubmission.studentId ? studentSubmission : (studentSubmissionsCollection as any)[studentId]
		if (!data) {
			router.back()
			return
		}
		setStudentName(data.studentName)
		setSubmissions(data.submissions)
	}, [studentId, router])
	const lastIdx = submissions.length - 1
	const current = submissions[currentIdx]

	// 3️⃣ 네비게이션 핸들러
	const goPrev = useCallback(() => {
		if (currentIdx > 0) setCurrentIdx((i) => i - 1)
		else router.back()
	}, [currentIdx, router])
	const goNext = useCallback(() => {
		if (currentIdx < lastIdx) setCurrentIdx((i) => i + 1)
	}, [currentIdx, lastIdx])

	// 4️⃣ 점수 수정
	const problemMeta = gradingDetailDummy.problems.find((p) => p.problemId === current?.problemId)
	const maxScore = problemMeta?.score ?? 0
	const [isEditingScore, setIsEditingScore] = useState(false)
	const [editedScore, setEditedScore] = useState(current?.score ?? 0)
	useEffect(() => {
		if (current) setEditedScore(current.score)
	}, [current])
	const saveEditedScore = useCallback(() => {
		const updated = [...submissions]
		updated[currentIdx].score = editedScore
		setSubmissions(updated)
		const stu = gradingDummy.find((s: GradingStudent) => s.studentId === studentId)
		if (stu) stu.problemScores[currentIdx] = editedScore
		setIsEditingScore(false)
	}, [currentIdx, editedScore, submissions, studentId])

	// 5️⃣ 검토 완료
	const handleCompleteReview = useCallback(() => {
		if (!isGroupOwner) {
			alert("접근 권한이 없습니다")
			return
		}
		const stu = gradingDummy.find((s: GradingStudent) => s.studentId === studentId)
		if (stu) {
			// 전부 true 로
			stu.problemStatus = stu.problemStatus.map(() => true)
		}
		router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
	}, [groupId, examId, isGroupOwner, studentId, router])

	// 6️⃣ AI/교수 피드백 탭
	const { professorFeedback: dummyProfessorFeedback } = feedbackDummy
	const [activeFeedbackTab, setActiveFeedbackTab] = useState<"ai" | "professor">("ai")
	const [isEditingProfessor, setIsEditingProfessor] = useState(false)
	const [newProfessorFeedback, setNewProfessorFeedback] = useState(dummyProfessorFeedback)
	const [aiFeedback] = useState("(더미 AI 피드백)")
	const [isAILoaded] = useState(true)

	// 7️⃣ 조건 검사 결과
	const passedCondition = current?.score! >= maxScore
	const conditionFeedback = passedCondition ? "조건을 충족했습니다." : "다시 확인해주세요."

	// ———— 렌더링 ————

	return submissions.length === 0 ? (
		<motion.div
			className="w-full min-h-screen flex items-center justify-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
		>
			<p>제출물을 불러오는 중...</p>
		</motion.div>
	) : (
		<div className="flex min-h-screen bg-gray-50">
			<div className="flex-1 max-w-7xl mx-auto p-6 space-y-6">
				{/* 헤더 */}
				<div className="flex items-center justify-between">
					<button onClick={goPrev} className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
						{currentIdx > 0 ? <ChevronLeft /> : <ArrowLeft />} {currentIdx > 0 ? "이전 문제" : "목록으로"}
					</button>
					<h2 className="text-lg font-bold">
						{studentName} – 문제 {current.problemId} ({current.score}점)
					</h2>
					<button
						onClick={goNext}
						disabled={currentIdx === lastIdx}
						className="flex items-center gap-1 text-gray-600 hover:text-gray-800 disabled:opacity-40"
					>
						다음 문제 <ChevronRight />
					</button>
				</div>

				{/* 코드 & 피드백 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<motion.div
						className="bg-white rounded-lg shadow border p-4 h-[600px]"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
					>
						<MonacoEditor
							height="100%"
							defaultLanguage={current.answerType === "code" ? "javascript" : "plaintext"}
							value={current.answer}
							options={{
								readOnly: true,
								minimap: { enabled: false },
								wordWrap: "on",
								fontSize: 14,
							}}
						/>
					</motion.div>
					<motion.div
						className="bg-white rounded-lg shadow border flex flex-col"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
					>
						{/* 탭 헤더 */}
						<div className="flex border-b items-center">
							<button
								className={`flex-1 py-2 text-center ${
									activeFeedbackTab === "ai" ? "bg-blue-50 text-blue-600" : "text-gray-600"
								}`}
								onClick={() => setActiveFeedbackTab("ai")}
							>
								AI 피드백
							</button>
							<button
								className={`flex-1 py-2 text-center ${
									activeFeedbackTab === "professor" ? "bg-blue-50 text-blue-600" : "text-gray-600"
								}`}
								onClick={() => setActiveFeedbackTab("professor")}
							>
								교수 피드백
							</button>
							{activeFeedbackTab === "professor" && (
								<button
									onClick={() => setIsEditingProfessor(true)}
									className="p-2 text-green-600 hover:text-green-800"
									title="교수 피드백 작성"
								>
									＋
								</button>
							)}
						</div>
						{/* 탭 콘텐츠 */}
						<div className="p-4 flex-1 overflow-y-auto">
							{activeFeedbackTab === "ai" ? (
								isAILoaded ? (
									<div className="prose prose-sm">
										<ReactMarkdown>{aiFeedback}</ReactMarkdown>
									</div>
								) : (
									<p className="text-sm text-gray-500">AI 피드백 로딩 중...</p>
								)
							) : isEditingProfessor ? (
								<div className="flex flex-col space-y-2">
									<textarea
										className="w-full h-24 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
										value={newProfessorFeedback}
										onChange={(e) => setNewProfessorFeedback(e.target.value)}
									/>
									<div className="flex justify-end gap-2">
										<button
											onClick={() => setIsEditingProfessor(false)}
											className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
										>
											저장
										</button>
										<button
											onClick={() => {
												setNewProfessorFeedback(dummyProfessorFeedback)
												setIsEditingProfessor(false)
											}}
											className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
										>
											취소
										</button>
									</div>
								</div>
							) : (
								<div className="prose prose-sm">
									<ReactMarkdown>{newProfessorFeedback}</ReactMarkdown>
								</div>
							)}
						</div>
					</motion.div>
				</div>

				{/* 조건 검사 */}
				<div className="bg-white rounded-lg border shadow-sm p-4">
					<h3 className="font-semibold text-gray-800 mb-2">조건 검사 결과</h3>
					<div
						className={`p-3 rounded-lg border-l-4 ${
							passedCondition ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
						}`}
					>
						<div className="flex justify-between mb-1">
							<span className="font-medium">{problemMeta.title} 요구사항</span>
							<span className="text-sm font-medium">{passedCondition ? "✔️ 통과" : "❌ 미통과"}</span>
						</div>
						<p className="text-sm text-gray-600">{conditionFeedback}</p>
					</div>
				</div>

				{/* 점수 수정 & 검토 완료 */}
				<div className="mt-4 flex items-center justify-end space-x-4">
					{!isEditingScore ? (
						<div className="flex items-baseline space-x-2">
							<span className="text-gray-600">총점:</span>
							<span className="font-semibold">{maxScore}점</span>
							<span className="text-gray-600">받은 점수:</span>
							<span className="font-semibold">{current.score}점</span>
							<button onClick={() => setIsEditingScore(true)} className="text-blue-500 hover:text-blue-700">
								✏️ 점수 수정
							</button>
						</div>
					) : (
						<div className="flex items-center space-x-2">
							<input
								type="number"
								min={0}
								max={maxScore}
								value={editedScore}
								onChange={(e) => setEditedScore(Number(e.target.value))}
								className="w-16 p-1 border rounded"
							/>
							<button
								onClick={saveEditedScore}
								className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
							>
								저장
							</button>
							<button
								onClick={() => {
									setEditedScore(current.score)
									setIsEditingScore(false)
								}}
								className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
							>
								취소
							</button>
						</div>
					)}
					<button onClick={handleCompleteReview} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
						검토 완료
					</button>
				</div>
			</div>
		</div>
	)
}
