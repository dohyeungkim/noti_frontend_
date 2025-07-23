"use client"

import { useEffect, useState } from "react"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import ProblemStatistics from "../ui/ProblemStatistics"
import ConfirmationModal from "./View/MyRefisteredProblemDeleteModal"
import { problem_api, ProblemDetail } from "@/lib/api"
import dynamic from "next/dynamic"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
})

export default function ProblemView() {
	const router = useRouter()
	const { id } = useParams<{ id: string }>()
	const [problem, setProblem] = useState<ProblemDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const [isExpanded, setIsExpanded] = useState(true)
	const [isExpandedStats, setIsExpandedStats] = useState(true)
	const [isConfirming, setIsConfirming] = useState(false)
	const [targetProblemId, setTargetProblemId] = useState<number | null>(null)
	const [activeCodeTab, setActiveCodeTab] = useState(0)

	useEffect(() => {
		const fetchProblem = async () => {
			setLoading(true)
			try {
				const data = await problem_api.problem_get_by_id(Number(id))
				setProblem(data)
				// 문제 객체(problem)로부터 "created_at" 또는 "make_at" 필드를 안전하게 꺼냅니다.
			} catch (error) {
				console.error("Failed to fetch problem:", error)
			} finally {
				setLoading(false)
			}
		}
		if (id) fetchProblem()
	}, [id])

	if (loading) return <p>Loading...</p>
	if (!problem) return <p>문제 정보를 불러올 수 없습니다.</p>
	const createdAtRaw = (problem as any).created_at ?? (problem as any).make_at
	const createdAtDate = createdAtRaw ? createdAtRaw.split("T")[0] : "알 수 없음"
	const { problemType, problem_id, title, description, difficulty, tags, rating_mode, created_at } = problem

	const handleDelete = async () => {
		if (targetProblemId != null) {
			try {
				await problem_api.problem_delete(targetProblemId)
				alert("문제가 삭제되었습니다.")
				router.push("/registered-problems")
			} catch {
				alert("⚠️ 이 문제를 참조하는 문제지가 있어 삭제가 불가합니다.")
			}
		}
		setIsConfirming(false)
	}

	const getDifficultyColor = (d: string) =>
		(({ easy: "bg-green-500", medium: "bg-yellow-500", hard: "bg-red-500" } as any)[d.toLowerCase()] || "bg-gray-500")

	const getRatingModeColor = (m: string) => {
		switch (m) {
			case "Hard":
				return "bg-red-500"
			case "Space":
				return "bg-blue-500"
			case "Regex":
				return "bg-purple-500"
			case "exact":
				return "bg-indigo-500"
			case "partial":
				return "bg-yellow-500"
			case "soft":
				return "bg-pink-500"
			case "none":
				return "bg-gray-500"
			case "active":
				return "bg-green-500"
			case "deactive":
				return "bg-gray-400"
			default:
				return "bg-gray-500"
		}
	}

	return (
		<>
			{/* 상단 수정 버튼 */}
			<div className="flex justify-end mb-6">
				<motion.button
					onClick={() => router.push(`/registered-problems/edit/${id}`)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="bg-black text-white px-6 py-1.5 rounded-lg text-sm hover:bg-gray-700"
				>
					✏️ 문제 수정하기
				</motion.button>
			</div>

			{/* 기본 정보 */}
			<div className="bg-white shadow-md rounded-lg p-6 mb-6">
				<div className="flex justify-between">
					<div>
						<h1 className="text-2xl font-bold mb-2">{title}</h1>
						<div className="flex gap-2 items-center">
							<span className={`text-white text-xs px-2 py-1 rounded ${getDifficultyColor(difficulty)}`}>
								{difficulty.toUpperCase()}
							</span>
							{/* 객관식은 rating_mode가 없으므로 제외 */}
							{problemType !== "객관식" && rating_mode && (
								<span className={`text-white text-xs px-2 py-1 rounded ${getRatingModeColor(rating_mode)}`}>
									{rating_mode}
								</span>
							)}
							{tags.map((tag, i) => (
								<span key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
									{tag}
								</span>
							))}
						</div>
					</div>
					<div className="text-right text-sm text-gray-500">
						<div>작성일: {createdAtDate}</div> <div>문제 ID: {problem.problem_id}</div>{" "}
					</div>
				</div>

				{/* 설명 */}
				<div className="mt-4 border-t pt-4">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-lg font-semibold">문제 설명</h3>
						<button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-600 hover:text-gray-800 text-sm">
							{isExpanded ? <FaChevronUp /> : <FaChevronDown />} {isExpanded ? "접기" : "펼치기"}
						</button>
					</div>
					<div
						className={`transition-all duration-300 overflow-hidden ${
							isExpanded ? "max-h-96 overflow-y-auto" : "max-h-0 opacity-0"
						}`}
					>
						<div className="editor-content prose max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
					</div>
				</div>
			</div>

			{/* “코딩”·“디버깅”에서만: 문제 조건, 참조 코드, 테스트 케이스 */}
			{(problemType === "코딩" || problemType === "디버깅") && (
				<>
					{/* 문제 조건 */}
					{problem.problem_condition.length > 0 && (
						<div className="bg-white shadow-md rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold mb-4">문제 조건</h3>
							<div className="space-y-2">
								{problem.problem_condition.map((cond, idx) => (
									<div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
										<span className="font-semibold">{idx + 1}.</span>
										<p className="text-sm">{cond}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* 참조 코드 */}
					{problem.reference_codes.length > 0 && (
						<div className="bg-white shadow-md rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold mb-4">참조 코드</h3>
							<div className="flex gap-1 mb-4 overflow-x-auto">
								{problem.reference_codes.map((rc, idx) => (
									<div key={idx}>
										<div
											className={`px-3 py-2 rounded-t-md text-sm cursor-pointer ${
												activeCodeTab === idx ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
											}`}
											onClick={() => setActiveCodeTab(idx)}
										>
											{rc.language.toUpperCase()}
											{rc.is_main && <span className="ml-2 bg-yellow-500 text-white text-xs px-1 rounded">메인</span>}
										</div>
									</div>
								))}
							</div>
							<div className="bg-gray-900 rounded-lg overflow-hidden">
								<MonacoEditor
									height="400px"
									language={
										problem.reference_codes[activeCodeTab].language === "cpp"
											? "cpp"
											: problem.reference_codes[activeCodeTab].language
									}
									value={problem.reference_codes[activeCodeTab].code}
									options={{
										readOnly: true,
										minimap: { enabled: false },
										scrollBeyondLastLine: false,
										fontSize: 14,
										lineNumbers: "on",
										automaticLayout: true,
									}}
								/>
							</div>
						</div>
					)}

					{/* 테스트 케이스 */}
					{problem.test_cases.length > 0 && (
						<div className="bg-white shadow-md rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold mb-4">테스트 케이스</h3>
							<div className="space-y-4">
								{problem.test_cases.map((tc, idx) => (
									<div key={idx} className="border rounded-lg p-4 bg-gray-50">
										<div className="flex justify-between mb-2">
											<span className="font-semibold">케이스 {idx + 1}</span>
											{/* 없애기로 한 기능
											{tc.is_sample && (
												<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">샘플</span>
											)} */}
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm">입력</label>
												<pre className="bg-white p-2 rounded">{tc.input}</pre>
											</div>
											<div>
												<label className="block text-sm">예상 출력</label>
												<pre className="bg-white p-2 rounded">{tc.expected_output}</pre>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}

			{/* 객관식 */}
			{problemType === "객관식" && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">선지</h3>
					<ul className="list-disc pl-6 space-y-2">
						{problem.options.map((ch, idx) => (
							<li key={idx} className={problem.correct_answers.includes(idx) ? "font-semibold text-green-600" : ""}>
								{idx + 1}. {ch}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* 단답형 */}
			{problemType === "단답형" && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">정답</h3>
					<ul className="list-disc pl-6">
						{problem.answer_text.map((ans, idx) => (
							<li key={idx}>{ans}</li>
						))}
					</ul>
				</div>
			)}

			{/* 주관식 */}
			{problemType === "주관식" && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-2">AI 평가 모드</h3>
					<span className={`text-white text-xs px-2 py-1 rounded ${getRatingModeColor(rating_mode as string)}`}>
						{(rating_mode as "active" | "deactive") === "active" ? "활성화" : "비활성화"}
					</span>
				</div>
			)}

			{/* 통계 */}
			<div className="bg-white shadow-md rounded-lg p-6 mb-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">📊 이 문제의 통계</h3>
					<button
						onClick={() => setIsExpandedStats(!isExpandedStats)}
						className="text-gray-600 hover:text-gray-800 text-sm"
					>
						{isExpandedStats ? <FaChevronUp /> : <FaChevronDown />} {isExpandedStats ? "접기" : "펼치기"}
					</button>
				</div>
				<div
					className={`transition-all duration-300 ${
						isExpandedStats ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
					}`}
				>
					<ProblemStatistics problem_id={problem_id} />
				</div>
			</div>

			{/* 삭제 */}
			<div className="flex justify-end">
				<motion.button
					onClick={() => {
						setTargetProblemId(problem_id)
						setIsConfirming(true)
					}}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-600"
				>
					🗑️ 문제 삭제
				</motion.button>
			</div>

			{isConfirming && (
				<ConfirmationModal
					message="정말 이 문제를 삭제하시겠습니까?"
					onConfirm={handleDelete}
					onCancel={() => setIsConfirming(false)}
				/>
			)}
		</>
	)
}
