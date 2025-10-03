"use client"

import { useEffect, useState } from "react"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import ProblemStatistics from "../ui/ProblemStatistics"
import ConfirmationModal from "./View/MyRefisteredProblemDeleteModal"
import { problem_api } from "@/lib/api"
import dynamic from "next/dynamic"
import { CheckCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

import type { CodingProblem, MultipleChoiceProblem, ShortAnswerProblem, SubjectiveProblem } from "@/lib/api"

type ProblemDetail = CodingProblem | MultipleChoiceProblem | ShortAnswerProblem | SubjectiveProblem

const languageDisplayNames: Record<string, string> = {
	python: "Python",
	java: "Java",
	cpp: "C++",
	c: "C",
	javascript: "JavaScript",
}

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

	// 볼 문제 GET 해서 setData
	useEffect(() => {
		const fetchProblem = async () => {
			setLoading(true)
			try {
				const data = await problem_api.problem_get_by_id(Number(id))
				console.log("====== GET 할 문제 데이터 ======", data)
				setProblem(data)
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

	const handleDeleteButtonClick = async (problem_id: number) => {
		try {
			await problem_api.problem_delete(problem_id)
			alert("문제가 삭제되었습니다.")
			router.push("/registered-problems")
		} catch (error) {
			console.error("삭제 실패:", error)
			alert(`⚠️ 이 문제를 참조하는 문제지가 있어 삭제가 불가합니다.`)
		}
	}

	const openDeleteModal = (problem_id: number) => {
		setTargetProblemId(problem_id)
		setIsConfirming(true)
	}

	const handleDelete = async () => {
		if (targetProblemId !== null) {
			await handleDeleteButtonClick(targetProblemId)
		}
		setIsConfirming(false)
	}

	// 백엔드는 값을 한글로 줌. 프론트는 한글로 받음. 매핑 시켜줘야됨
	const rawToDisplay: Record<string, string> = {
		multiple_choice: "객관식",
		short_answer: "단답형",
		subjective: "주관식",
		coding: "코딩",
		debugging: "디버깅",
	}

	const displayType = rawToDisplay[problem.problemType] ?? problem.problemType

	const getTypeStyle = (type: string) => {
		switch (type) {
			case "코딩":
				return "bg-blue-100 text-blue-800"
			case "디버깅":
				return "bg-red-100 text-red-800"
			case "객관식":
				return "bg-green-100 text-green-800"
			case "주관식":
				return "bg-purple-100 text-purple-800"
			case "단답형":
				return "bg-yellow-100 text-yellow-800"
			default:
				return "bg-gray-100 text-gray-700"
		}
	}
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case "easy":
				return "bg-green-500"
			case "medium":
				return "bg-yellow-500"
			case "hard":
				return "bg-red-500"
			default:
				return "bg-gray-500"
		}
	}
	const getRatingModeColor = (mode: string) => {
		switch (mode) {
			case "hard":
				return "bg-red-500"
			case "space":
				return "bg-blue-500"
			case "regex":
				return "bg-purple-500"
			case "none":
				return "bg-gray-500"
			case "exact":
				return "bg-indigo-500"
			case "partial":
				return "bg-yellow-500"
			case "soft":
				return "bg-pink-500"
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
			{/* 수정 버튼 */}
			<div className="flex items-center gap-2 justify-end mb-6">
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
				<div className="flex justify-between items-start mb-4">
					<div className="flex-1">
						<h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
						<div className="mb-1">
							<span className={`text-xs px-2 py-1 rounded font-medium ${getTypeStyle(displayType)}`}>
								문제 유형: {displayType}
							</span>
						</div>
						<div className="flex items-center gap-2 mb-1">
							<span className={`text-white text-xs px-2 py-1 rounded ${getDifficultyColor(problem.difficulty)}`}>
								난이도: {problem.difficulty.toUpperCase()}
							</span>
							<span className={`text-white text-xs px-2 py-1 rounded ${getRatingModeColor(problem.rating_mode)}`}>
								채점모드: {problem.rating_mode}
							</span>
						</div>
						{problem.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-1">
								{problem.tags.map((tag, idx) => (
									<span key={idx} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
										# {tag}
									</span>
								))}
							</div>
						)}
					</div>
					<div className="text-right text-sm text-gray-500">
						<div>작성일: {(problem.created_at || "").split("T")[0]}</div>
						<div>문제 ID: {problem.problem_id}</div>
					</div>
				</div>

				{/* 설명 */}
				<div className="border-t border-gray-200 pt-4">
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-lg font-semibold">문제 설명</h3>
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
						>
							{isExpanded ? (
								<>
									<FaChevronUp className="mr-1" /> 접기
								</>
							) : (
								<>
									<FaChevronDown className="mr-1" /> 펼치기
								</>
							)}
						</button>
					</div>
					<div
						className={`transition-all duration-300 overflow-hidden ${
							isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
						}`}
					>
						<div 
						className="prose max-w-none break-words" 
						style={{
								display: '-webkit-box',
								WebkitLineClamp: 3,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden'
						}}
					>
          <ReactMarkdown>{problem.description}</ReactMarkdown>
					</div>
				</div>
			</div>
		</div>

			{/* 문제 조건 */}
			{problem.problem_condition?.length > 0 && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">문제 조건</h3>
					<div className="space-y-2">
						{problem.problem_condition.map((cond, idx) => (
							<div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
								<span className="text-sm font-semibold text-gray-700 mt-0.5">{idx + 1}.</span>
								<span className="text-sm text-gray-700 flex-1">{cond}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 문제 유형별로 다른 속성값들 랜더링 👻 */}
			{/* 단답형/주관식 AI 채점 기준 및 정답 */}
			{displayType === "단답형" && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-3">✏️ 정답 및 AI 채점 기준</h3>
					<div className="mb-2">
						<strong>정답:</strong> {(problem as ShortAnswerProblem).answer_text.join(", ")}
					</div>

					{/* 여기서도 타입 에러 남 1 */}
					<div>
						<strong>AI 채점 기준:</strong> {(problem as ShortAnswerProblem).grading_criteria.join(", ")}
					</div>
				</div>
			)}

			{/* ❌ 왜 안 됨 ㅠㅠㅠㅠ */}
			{displayType === "주관식" && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-3">✏️ 정답 및 AI 채점 기준</h3>
					<div className="mb-2">
						<strong>정답:</strong> {(problem as SubjectiveProblem).answer_text}
					</div>

					{/* 여기서도 타입 에러 남 2 */}
					{(problem as SubjectiveProblem).grading_criteria.length > 0 ? (
						<div>
							<strong>AI 채점 기준:</strong> {(problem as SubjectiveProblem).grading_criteria.join(", ")}
						</div>
					) : (
						<div>
							<strong>AI 채점 기준: </strong>
							<span className="text-gray-500"> AI 채점 기준이 설정되지 않았습니다.</span>
						</div>
					)}
				</div>
			)}

			{/* 객관식 */}
			{displayType === "객관식" && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">객관식 보기 및 정답</h3>
					<div className="space-y-2">
						{(problem as MultipleChoiceProblem).options.map((opt, idx) => (
							<div key={idx} className="flex items-center gap-2">
								<CheckCircle
									className={`text-${
										(problem as MultipleChoiceProblem).correct_answers.includes(idx) ? "green" : "gray"
									}-500`}
								/>
								<span className="text-sm">{opt}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 참조 코드 / 베이스 코드 */}
			{(displayType === "코딩" || displayType === "디버깅") && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">{displayType === "디버깅" ? "베이스 코드" : "참조 코드"}</h3>
					<div className="flex gap-1 mb-4 overflow-x-auto">
						{(displayType === "디버깅"
							? (problem as CodingProblem).base_code
							: (problem as CodingProblem).reference_codes
						).map((ref, idx) => (
							<div key={idx} className="shrink-0">
								<button
									className={`px-3 py-2 rounded-t-md text-sm ${
										activeCodeTab === idx ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
									}`}
									onClick={() => setActiveCodeTab(idx)}
								>
									{languageDisplayNames[ref.language]}
									{displayType != "디버깅" && (ref as any).is_main && (
										<span className="ml-1 text-xs bg-yellow-400 text-black px-1 rounded">메인</span>
									)}
								</button>
							</div>
						))}
					</div>
					<div className="bg-gray-900 rounded-lg overflow-hidden">
						{(displayType === "디버깅"
							? (problem as CodingProblem).base_code
							: (problem as CodingProblem).reference_codes)[activeCodeTab] && (
							<MonacoEditor
								height="400px"
								language={
									(displayType === "디버깅"
										? (problem as CodingProblem).base_code
										: (problem as CodingProblem).reference_codes)[activeCodeTab].language
								}
								value={
									(displayType === "디버깅"
										? (problem as CodingProblem).base_code
										: (problem as CodingProblem).reference_codes)[activeCodeTab].code
								}
								options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
							/>
						)}
					</div>
				</div>
			)}

			{/* 테스트 케이스 */}
			{(displayType === "코딩" || displayType === "디버깅") && (problem as CodingProblem).test_cases.length > 0 && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">테스트 케이스</h3>
					<div className="space-y-4">
						{(problem as CodingProblem).test_cases.map((tc, idx) => (
							<div key={idx} className="border p-4 rounded-lg">
								<div className="flex justify-between mb-3">
									<span className="font-semibold">테스트 케이스 {idx + 1}</span>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">입력</label>
										<pre className="bg-gray-100 p-3 rounded text-sm">{tc.input}</pre>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">예상 출력</label>
										<pre className="bg-gray-100 p-3 rounded text-sm">{tc.expected_output}</pre>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 문제 통계 - v0 에서는 미완성 기능 👻 */}
			{/* <div className="bg-white shadow-md rounded-lg p-6 mb-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">📊 이 문제의 통계</h3>
					<button
						onClick={() => setIsExpandedStats(!isExpandedStats)}
						className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
					>
						{isExpandedStats ? (
							<>
								<FaChevronUp className="mr-1" /> 접기
							</>
						) : (
							<>
								<FaChevronDown className="mr-1" /> 펼치기
							</>
						)}
					</button>
				</div>
				{isExpandedStats && <ProblemStatistics problem_id={problem.problem_id} />}
			</div> */}

			{/* 삭제 */}
			<div className="flex justify-end mb-10">
				<motion.button
					onClick={() => openDeleteModal(problem.problem_id)}
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

;<style jsx>{`
	.prose h1,
	.prose h2,
	.prose h3 {
		font-weight: bold;
	}
	.prose ul,
	.prose ol {
		margin-left: 1.5rem;
	}
`}</style>
