"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"
import { group_api } from "@/lib/api"
import { ArrowLeft } from "lucide-react"
import { gradingDummy } from "@/data/gradingDummy" // 더미 데이터 가져오기

export default function GradingPage({ params }: { params: { groupId: string; examId: string } }) {
	const router = useRouter()
	const { userName } = useAuth()
	const { groupId, examId } = params

	const numericGroupId = useMemo(() => Number(groupId), [groupId])
	const numericExamId = useMemo(() => Number(examId), [examId])

	// 그룹 오너 정보 상태
	const [groupOwner, setGroupOwner] = useState<string | null>(null)
	const isGroupOwner = userName === groupOwner

	// 채점 데이터 상태
	const [gradingData, setGradingData] = useState(gradingDummy)

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
	}, [groupId, fetchMyOwner])

	// 학생 선택 처리 - 학생 페이지로 이동
	const handleStudentSelect = (studentId: string) => {
		router.push(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`)
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

	return (
		<div className="pb-10">
			{/* 상단 영역: 뒤로가기 및 제목 */}
			<div className="flex items-center mb-6">
				<button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
					<ArrowLeft size={20} />
				</button>
				<h1 className="text-2xl font-bold">학생 제출물 채점</h1>
			</div>

			{/* 학생 리스트 */}
			<div className="mb-8">
				{gradingData.map((student) => (
					<motion.div
						key={student.studentId}
						className="flex items-center p-4 border-b cursor-pointer transition-colors hover:bg-gray-50"
						onClick={() => handleStudentSelect(student.studentId)}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex-shrink-0 w-1/4">
							<span className="font-medium text-lg">{student.studentName}</span>
						</div>

						<div className="flex-grow flex items-center">
							{/* 점수 표시 */}
							<div className="flex-shrink-0 mr-6 flex items-center space-x-2">
								{student.problemScores.map((score, idx) => (
									<div key={idx} className="w-10 h-10 flex items-center justify-center">
										<span className={`text-sm font-medium ${score === 0 ? "text-gray-400" : "text-blue-600"}`}>
											{score}
										</span>
									</div>
								))}
							</div>

							{/* 문제 상태 동그라미 */}
							<div className="flex items-center space-x-2">
								{student.problemStatus.map((isReviewed, idx) => (
									<div
										key={idx}
										className={`w-8 h-8 rounded-full border-2 ${
											isReviewed ? "bg-green-500 border-green-600" : "bg-gray-200 border-gray-300"
										}`}
									>
										{isReviewed && (
											<span className="flex items-center justify-center h-full text-white text-xs">✓</span>
										)}
									</div>
								))}
							</div>
						</div>

						{/* 완료 상태 표시 */}
						<div className="flex-shrink-0 w-24 text-right">
							{student.problemStatus.every((status) => status) ? (
								<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">채점 완료</span>
							) : (
								<span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
									{student.problemStatus.filter((status) => status).length}/{student.problemStatus.length} 완료
								</span>
							)}
						</div>
					</motion.div>
				))}
			</div>
		</div>
	)
}
