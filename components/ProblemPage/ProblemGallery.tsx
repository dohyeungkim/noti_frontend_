import { problem_like_api, problem_api } from "@/lib/api"
import { motion } from "framer-motion"
import { Heart, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { studentSubmission } from "@/data/gradingDummy"

interface Problem {
	problem_id: number
	title: string
	description: string
	attempt_count: number
	pass_count: number
	is_like: boolean
	problem_type?: string // 문제 유형 (옵션) 새로 추가하는 내용. 일단 지금은 코딩- 홍
	problem_score?: number // 배점 (옵션) 새로 추가하는 내용. 일단 지금은 10점으로 써놈- 홍
}

interface ProblemGalleryProps {
	problems: Problem[]
	groupId: number
	workbookId: number
	isGroupOwner: boolean
	refresh: boolean
	setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ProblemGallery({
	problems,
	groupId,
	workbookId,
	isGroupOwner,
	refresh,
	setRefresh,
}: ProblemGalleryProps) {
	const router = useRouter()
	const [likedProblems, setLikedProblems] = useState<Record<number, boolean>>({})
	const [currentProblems, setCurrentProblems] = useState<Problem[]>(problems)

	// 시험 모드는 아직 미완성이지만 UI는 보이도록 함 (개발용)
	const isExamMode = true // 개발 중이므로 항상 true로 설정 (실제로는 props나 context에서 가져와야 함)
	// 더미데이터ㅓ 한 학생 제출 데이터, 문제별 점수 가젿오기
	const mySubmissions = studentSubmission.submissions

	const toggleLike = async (problemId: number) => {
		try {
			const response = await problem_like_api.problem_like(problemId, groupId, workbookId)
			const isLiked = response.liked
			setLikedProblems((prev) => ({
				...prev,
				[problemId]: isLiked,
			}))
		} catch (error) {
			console.error("좋아요 토글 실패:", error)
			alert("좋아요 처리 중 오류가 발생했습니다.")
		}
	}

	const deleteProblem = async (problemId: number) => {
		if (!confirm("정말 삭제하시겠습니까?")) return
		try {
			await problem_api.problem_ref_delete(problemId, groupId, workbookId)
			setCurrentProblems((prev) => prev.filter((p) => p.problem_id !== problemId))
			setRefresh(!refresh) // Trigger refresh by toggling the state
		} catch (error) {
			console.error("문제 삭제 실패:", error)
			alert("문제 삭제 중 오류가 발생했습니다.")
		}
	}

	return (
		<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 m-2">
			{currentProblems.map((p) => {
				// 이 문제에 대한 내 점수 찾기
				const myEntry = mySubmissions.find((s) => s.problemId === p.problem_id)
				const score = myEntry?.score ?? 0
				// p.problem_score 가 있으면 그걸 최대점수로, 없으면 10점 기본
				const maxScore = p.problem_score ?? 10
				// 성적에 따라 배경색 결정 (교수뷰나 시험모드가 아닐 때만 적용)
				const cardBgColor =
					!isGroupOwner && isExamMode
						? score === maxScore
							? "bg-green-50"
							: score === 0
							? "bg-red-50"
							: "bg-yellow-50"
						: "bg-white"

				const isLiked = likedProblems[p.problem_id] ?? p.is_like

				// 버튼 텍스트: 시험모드에서 그룹장일 경우 "문제 보기", 그 외에는 "도전하기"
				const buttonText = isExamMode && isGroupOwner ? "문제 보기" : "도전하기"

				return (
					<div
						key={p.problem_id}
						className="relative bg-white border border-gray-200 p-6 rounded-2xl shadow-md
                       transition-transform overflow-hidden duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
					>
						{/* X 삭제 버튼: 그룹장만 표시 */}
						{isGroupOwner && (
							<button
								className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
								onClick={(e) => {
									e.stopPropagation()
									deleteProblem(p.problem_id)
								}}
							>
								<X size={20} />
							</button>
						)}

						{/* 문제 유형 및 배점 표시 -> 시험모드일때, 교수: 문제보기 학생: 결과보기 */}
						<div className="flex items-center gap-2 mb-2">
							{/* 문제 유형 - 실제 데이터가 없으면 기본값 표시 */}
							<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								{p.problem_type || "코딩"}
							</span>

							{/* 배점 - 실제 데이터가 없으면 기본값 표시 */}
							<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
								{p.problem_score || 10}점
							</span>
						</div>

						<h2 className="text-xl font-semibold text-gray-800 truncate">{p.title}</h2>

						{/* 좋아요 버튼 */}
						<motion.button
							whileTap={{ scale: 0.9 }}
							onClick={(e) => {
								e.stopPropagation()
								toggleLike(p.problem_id)
							}}
							className={`mt-2 flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
								isLiked ? "bg-red-200 text-white" : "bg-gray-200 text-gray-600"
							}`}
						>
							<motion.div
								animate={{
									scale: isLiked ? 1.2 : 1,
									color: isLiked ? "#ff4757" : "#4B5563",
								}}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<Heart fill={isLiked ? "#ff4757" : "none"} strokeWidth={2} size={24} />
							</motion.div>
						</motion.button>

						<button
							onClick={(e) => {
								e.stopPropagation()
								router.push(`/mygroups/${groupId}/exams/${workbookId}/problems/${p.problem_id}`)
							}}
							className="mt-4 w-full bg-mygreen text-white py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-opacity-80 active:scale-95"
						>
							{buttonText}
						</button>
					</div>
				)
			})}
		</section>
	)
}
