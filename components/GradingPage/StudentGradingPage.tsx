"use client"
// 이 페이지가 채점 페이지에서 학생 블록 클릭했을 때 나오는 페이지인데...

import { useEffect, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"
import { group_api } from "@/lib/api"
import { ArrowLeft, CheckCircle, ThumbsUp, MessageSquare } from "lucide-react"
import { studentSubmission, gradingDetailDummy, studentSubmissionsCollection } from "@/data/gradingDummy"
import dynamic from "next/dynamic"

// 코드 에디터를 위한 동적 import
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
})

export default function StudentGradingPage({
	params,
}: {
	params: {
		groupId: string
		examId: string
		studentId: string
	}
}) {
	const router = useRouter()
	const { userName } = useAuth()
	const { groupId, examId, studentId } = params

	const numericGroupId = useMemo(() => Number(groupId), [groupId])
	const numericExamId = useMemo(() => Number(examId), [examId])

	// 그룹 오너 정보 상태
	const [groupOwner, setGroupOwner] = useState<string | null>(null)
	const isGroupOwner = userName === groupOwner

	// 학생 제출물 상태
	const [studentData, setStudentData] = useState(() => {
		// studentId에 해당하는 학생 데이터 찾기
		return studentSubmissionsCollection[studentId] || studentSubmission
	})
	const [problemData, setProblemData] = useState(gradingDetailDummy)

	// 현재 선택된 문제 및 피드백
	const [selectedProblemIndex, setSelectedProblemIndex] = useState(0)
	const [feedback, setFeedback] = useState<string[]>(Array(problemData.problems.length).fill(""))
	const [problemScores, setProblemScores] = useState<number[]>(Array(problemData.problems.length).fill(0))
	const [reviewedStatus, setReviewedStatus] = useState<boolean[]>(Array(problemData.problems.length).fill(false))

	// 그룹 오너 정보 가져오기
	const fetchMyOwner = useCallback(async () => {
		try {
			const data = await group_api.my_group_get()
			const currentGroup = data.find(
				(group: { group_id: number; group_owner: string }) => group.group_id === Number(groupId)
			)
			setGroupOwner(currentGroup?.group_owner || null)
		} catch (error) {
			console.error("그룹장 불러오기 중 오류:", error)
		}
	}, [groupId])

	useEffect(() => {
		if (groupId) {
			fetchMyOwner()
		}

		// 학생 데이터가 로드되면 초기 점수와 상태를 설정
		// 실제 구현에서는 API에서 데이터를 가져오도록 변경
		const initialScores = gradingDetailDummy.problems.map((_, index) => {
			return studentSubmissionDummy.submissions[index]?.score || 0
		})
		setProblemScores(initialScores)

		// 검토 상태는 임의로 설정 (실제 구현에서는 API에서 가져옴)
		setReviewedStatus(Array(gradingDetailDummy.problems.length).fill(false))
	}, [groupId, fetchMyOwner, studentId])

	// 피드백 저장 처리
	const handleSaveFeedback = () => {
		// 실제 구현에서는 API 호출로 피드백 저장
		const newReviewedStatus = [...reviewedStatus]
		newReviewedStatus[selectedProblemIndex] = true
		setReviewedStatus(newReviewedStatus)

		alert("피드백이 저장되었습니다.")
	}

	// 점수 업데이트 처리
	const handleScoreUpdate = (problemIndex: number, score: number) => {
		const newScores = [...problemScores]
		newScores[problemIndex] = score
		setProblemScores(newScores)
	}

	// 문제 선택 처리
	const handleProblemSelect = (index: number) => {
		setSelectedProblemIndex(index)
	}

	// 그룹장이 아니면 접근 권한 없음 표시
	if (!isGroupOwner) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h2>
				<p className="text-gray-600 mb-6">이 페이지는 그룹장만 접근할 수 있습니다.</p>
				<button onClick={() => router.back()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
					이전 페이지로 돌아가기
				</button>
			</div>
		)
	}

	// 현재 선택된 문제의 제출물
	const currentSubmission = studentData.submissions[selectedProblemIndex]
	const currentProblem = problemData.problems[selectedProblemIndex]

	return (
		<div className="pb-10">
			{/* 상단 영역: 뒤로가기 및 제목 */}
			<div className="flex items-center mb-6">
				<button
					onClick={() => router.push(`/mygroups/${groupId}/exams/${examId}/grading`)}
					className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
				>
					<ArrowLeft size={20} />
				</button>
				<h1 className="text-2xl font-bold">{studentData.studentName}의 제출물 채점</h1>
			</div>

			<div className="grid grid-cols-12 gap-4">
				{/* 왼쪽: 문제 목록 */}
				<div className="col-span-3">
					<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
						<div className="bg-gray-50 p-3 border-b border-gray-200">
							<h2 className="font-bold">문제 목록</h2>
						</div>
						<div className="divide-y">
							{problemData.problems.map((problem, index) => (
								<div
									key={problem.problemId}
									className={`p-3 cursor-pointer transition-colors ${
										selectedProblemIndex === index ? "bg-blue-50" : "hover:bg-gray-50"
									}`}
									onClick={() => handleProblemSelect(index)}
								>
									<div className="flex items-center justify-between">
										<div>
											<span className="text-sm font-medium">{problem.title}</span>
											<div className="flex items-center mt-1">
												<span
													className={`px-2 py-0.5 rounded-full text-xs ${
														problem.type === "코딩"
															? "bg-blue-100 text-blue-800"
															: problem.type === "객관식"
															? "bg-green-100 text-green-800"
															: "bg-purple-100 text-purple-800"
													}`}
												>
													{problem.type}
												</span>
												<span className="ml-2 text-xs text-gray-500">{problem.score}점</span>
											</div>
										</div>

										{reviewedStatus[index] ? (
											<CheckCircle size={18} className="text-green-500" />
										) : (
											<span className="w-4 h-4 rounded-full bg-gray-200"></span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* 오른쪽: 제출물 및 채점 */}
				<div className="col-span-9">
					<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
						<div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
							<h2 className="font-bold">{currentProblem.title}</h2>
							<div className="flex items-center">
								<span
									className={`px-2 py-0.5 rounded-full text-xs mr-2 ${
										currentProblem.type === "코딩"
											? "bg-blue-100 text-blue-800"
											: currentProblem.type === "객관식"
											? "bg-green-100 text-green-800"
											: "bg-purple-100 text-purple-800"
									}`}
								>
									{currentProblem.type}
								</span>
								<div className="flex items-center">
									<input
										type="number"
										min="0"
										max={currentProblem.score}
										value={problemScores[selectedProblemIndex]}
										onChange={(e) =>
											handleScoreUpdate(
												selectedProblemIndex,
												Math.min(currentProblem.score, Math.max(0, parseInt(e.target.value) || 0))
											)
										}
										className="w-16 p-1 border rounded-md text-center text-sm"
									/>
									<span className="ml-1 text-sm text-gray-600">/ {currentProblem.score}점</span>
								</div>
							</div>
						</div>

						{/* 제출물 내용 */}
						<div className="p-4">
							{currentSubmission.answerType === "code" ? (
								<div className="h-[400px] border rounded">
									<MonacoEditor
										height="400px"
										language="javascript" // 실제로는 제출된 언어에 맞게 설정
										value={currentSubmission.answer}
										options={{
											readOnly: true,
											minimap: { enabled: false },
											scrollBeyondLastLine: false,
											fontSize: 14,
										}}
									/>
								</div>
							) : currentSubmission.answerType === "multipleChoice" ? (
								<div className="p-4 border rounded bg-gray-50">
									<p className="text-gray-700 mb-2">
										선택한 답: <strong>보기 {parseInt(currentSubmission.answer) + 1}</strong>
									</p>
									<p className="text-gray-500 text-sm">이 문제는 객관식입니다. 학생이 선택한 답변이 표시됩니다.</p>
								</div>
							) : (
								<div className="p-4 border rounded bg-gray-50">
									<p className="text-gray-700 whitespace-pre-line">{currentSubmission.answer}</p>
								</div>
							)}
						</div>
					</div>

					{/* 피드백 영역 */}
					<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
						<div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center">
							<MessageSquare size={18} className="mr-2 text-blue-600" />
							<h2 className="font-bold">피드백 작성</h2>
						</div>

						<div className="p-4">
							<textarea
								value={feedback[selectedProblemIndex]}
								onChange={(e) => {
									const newFeedback = [...feedback]
									newFeedback[selectedProblemIndex] = e.target.value
									setFeedback(newFeedback)
								}}
								placeholder="학생에게 피드백을 작성해주세요..."
								className="w-full p-3 border rounded-md text-sm h-32"
							/>

							<div className="flex justify-end mt-4">
								<button
									onClick={handleSaveFeedback}
									className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
								>
									<CheckCircle size={18} className="mr-2" />
									검토 완료 및 저장
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
