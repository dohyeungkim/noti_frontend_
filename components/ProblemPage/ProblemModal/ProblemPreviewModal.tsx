// ProblemPreviewModal.tsx
// 문제 미리보기 모달 컴포넌트

import { X, Hash, User, Calendar, Tag, FileText, AlertCircle } from "lucide-react"
import type { ProblemBase } from "@/lib/api"

interface ProblemPreviewModalProps {
	problem: ProblemBase | null
	isOpen: boolean
	onClose: () => void
}

export default function ProblemPreviewModal({ problem, isOpen, onClose }: ProblemPreviewModalProps) {
	if (!isOpen || !problem) return null

	// 난이도에 따른 색상
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case "easy":
			case "쉬움":
				return "bg-green-100 text-green-800 border-green-300"
			case "medium":
			case "보통":
				return "bg-yellow-100 text-yellow-800 border-yellow-300"
			case "hard":
			case "어려움":
				return "bg-red-100 text-red-800 border-red-300"
			default:
				return "bg-gray-100 text-gray-800 border-gray-300"
		}
	}

	// 문제 타입에 따른 표시
	const getProblemTypeLabel = (type: string) => {
		const typeMap: Record<string, string> = {
			"multiple_choice": "객관식",
			"short_answer": "단답형",
			"essay": "서술형",
			"coding": "코딩",
		}
		return typeMap[type] || type
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[60]">
			<div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative max-h-[85vh] overflow-hidden">
				{/* 헤더 */}
				<div className="bg-gradient-to-r from-mygreen to-green-600 p-6 text-white relative">
					<button
						className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
						onClick={onClose}
					>
						<X className="w-5 h-5" />
					</button>
					<h2 className="text-2xl font-bold pr-12">문제 미리보기</h2>
					<p className="text-green-100 text-sm mt-1">Problem Preview</p>
				</div>

				{/* 컨텐츠 */}
				<div className="p-8 overflow-y-auto max-h-[calc(85vh-140px)]">
					{/* 문제 제목 */}
					<div className="mb-6">
						<div className="flex items-start gap-3">
							<FileText className="w-6 h-6 text-mygreen mt-1 flex-shrink-0" />
							<div className="flex-1">
								<h3 className="text-2xl font-bold text-gray-800 leading-tight">
									{problem.title}
								</h3>
							</div>
						</div>
					</div>

					{/* 메타 정보 카드 */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
						{/* 문제 ID */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<div className="flex items-center gap-2 mb-1">
								<Hash className="w-4 h-4 text-blue-600" />
								<span className="text-xs font-semibold text-blue-600">ID</span>
							</div>
							<p className="text-sm font-bold text-gray-800">{problem.problem_id}</p>
						</div>

						{/* 난이도 */}
						<div className={`border rounded-lg p-3 ${getDifficultyColor(problem.difficulty)}`}>
							<div className="flex items-center gap-2 mb-1">
								<AlertCircle className="w-4 h-4" />
								<span className="text-xs font-semibold">난이도</span>
							</div>
							<p className="text-sm font-bold">{problem.difficulty}</p>
						</div>

						{/* 문제 타입 */}
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
							<div className="flex items-center gap-2 mb-1">
								<FileText className="w-4 h-4 text-purple-600" />
								<span className="text-xs font-semibold text-purple-600">타입</span>
							</div>
							<p className="text-sm font-bold text-gray-800">
								{getProblemTypeLabel(problem.problemType)}
							</p>
						</div>

						{/* 작성자 */}
						<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
							<div className="flex items-center gap-2 mb-1">
								<User className="w-4 h-4 text-indigo-600" />
								<span className="text-xs font-semibold text-indigo-600">작성자</span>
							</div>
							<p className="text-sm font-bold text-gray-800 truncate" title={problem.maker_id}>
								{problem.maker_id}
							</p>
						</div>
					</div>

					{/* 문제 설명 */}
					<div className="mb-6">
						<label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
							<FileText className="w-4 h-4 text-gray-600" />
							문제 설명
						</label>
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-5 min-h-[150px]">
							<p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
								{problem.description || "설명이 없습니다."}
							</p>
						</div>
					</div>

					{/* 태그 */}
					{problem.tags && problem.tags.length > 0 && (
						<div className="mb-6">
							<label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
								<Tag className="w-4 h-4 text-gray-600" />
								태그
							</label>
							<div className="flex flex-wrap gap-2">
								{problem.tags.map((tag, index) => (
									<span
										key={index}
										className="bg-mygreen bg-opacity-10 text-mygreen border border-mygreen border-opacity-30 px-3 py-1.5 rounded-full text-sm font-medium"
									>
										#{tag}
									</span>
								))}
							</div>
						</div>
					)}

					{/* 문제 조건 */}
					{problem.problem_condition && problem.problem_condition.length > 0 && (
						<div className="mb-6">
							<label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
								<AlertCircle className="w-4 h-4 text-gray-600" />
								문제 조건
							</label>
							<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
								<ul className="space-y-2">
									{problem.problem_condition.map((condition, index) => (
										<li key={index} className="flex items-start gap-2 text-gray-700">
											<span className="text-amber-600 font-bold mt-0.5">•</span>
											<span className="text-sm">{condition}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}

					{/* 생성일 */}
					<div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
						<Calendar className="w-4 h-4" />
						<span>생성일: {new Date(problem.created_at).toLocaleDateString("ko-KR")}</span>
						{problem.deleted_at && (
							<span className="ml-4 text-red-500">
								• 삭제됨: {new Date(problem.deleted_at).toLocaleDateString("ko-KR")}
							</span>
						)}
					</div>
				</div>

				{/* 푸터 */}
				<div className="bg-gray-50 px-8 py-4 flex justify-end border-t border-gray-200">
					<button
						onClick={onClose}
						className="bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition font-medium"
					>
						닫기
					</button>
				</div>
			</div>
		</div>
	)
}