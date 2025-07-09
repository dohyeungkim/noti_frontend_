"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"
import { group_api } from "@/lib/api"
import { ArrowLeft } from "lucide-react"
import { gradingDummy, GradingStudent } from "@/data/gradingDummy"

interface GradingListPageProps {
	groupId: string
	examId: string
}

export default function GradingListPage({ groupId, examId }: GradingListPageProps) {
	const router = useRouter()
	const { userName } = useAuth()

	// 그룹장 여부 판별
	const [groupOwner, setGroupOwner] = useState<string | null>(null)
	const isGroupOwner = userName === groupOwner

	// 더미 채점 데이터
	const [gradingData, setGradingData] = useState<GradingStudent[]>([])

	// 그룹장 정보 fetch
	const fetchGroupOwner = useCallback(async () => {
		try {
			const data = await group_api.my_group_get()
			const current = data.find((g: any) => g.group_id === Number(groupId))
			setGroupOwner(current?.group_owner || null)
		} catch (err) {
			console.error("그룹장 정보 로드 실패", err)
		}
	}, [groupId])

	useEffect(() => {
		fetchGroupOwner()
		// 더미 데이터 세팅
		setGradingData(gradingDummy)
	}, [fetchGroupOwner])

	// 학생 클릭 시 상세 페이지로 이동
	const handleStudentSelect = (studentId: string) => {
		router.push(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`)
	}

	// 권한 체크
	if (!isGroupOwner) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h2>
				<p className="text-gray-600 mb-6">이 페이지는 그룹장만 접근할 수 있습니다.</p>
				<button onClick={() => router.back()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
					이전으로
				</button>
			</div>
		)
	}

	return (
		<div className="pb-10">
			{/* 헤더 */}
			<div className="flex items-center mb-6">
				<button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition">
					<ArrowLeft size={20} />
				</button>
				<h1 className="text-2xl font-bold">학생 제출물 채점</h1>
			</div>

			{/* 학생 리스트 */}
			<div className="mb-8">
				{gradingData.map((stu) => (
					<motion.div
						key={stu.studentId}
						className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 transition"
						onClick={() => handleStudentSelect(stu.studentId)}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
					>
						{/* 이름 */}
						<div className="w-1/4 font-medium text-lg">{stu.studentName}</div>

						{/* 점수 */}
						<div className="flex-grow flex items-center">
							<div className="flex space-x-2 mr-6">
								{stu.problemScores.map((score, i) => (
									<div key={i} className="w-10 h-10 flex items-center justify-center">
										<span className={`text-sm font-medium ${score === 0 ? "text-gray-400" : "text-blue-600"}`}>
											{score}
										</span>
									</div>
								))}
							</div>

							{/* 상태 동그라미 */}
							<div className="flex space-x-2">
								{stu.problemStatus.map((ok, i) => (
									<div
										key={i}
										className={`w-8 h-8 rounded-full border-2 ${
											ok ? "bg-green-500 border-green-600" : "bg-gray-200 border-gray-300"
										} flex items-center justify-center`}
									>
										{ok && <span className="text-white text-xs">✓</span>}
									</div>
								))}
							</div>
						</div>

						{/* 완료 현황 */}
						<div className="w-24 text-right">
							{stu.problemStatus.every((s) => s) ? (
								<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">채점 완료</span>
							) : (
								<span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
									{stu.problemStatus.filter((s) => s).length}/{stu.problemStatus.length} 완료
								</span>
							)}
						</div>
					</motion.div>
				))}
			</div>
		</div>
	)
}
