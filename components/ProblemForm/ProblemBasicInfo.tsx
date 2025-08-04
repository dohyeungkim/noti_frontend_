import ReactMde from "react-mde"
import "react-mde/lib/styles/css/react-mde-all.css"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

// Add a module declaration for react-mde to handle missing types
declare module "react-mde"

interface ProblemBasicInfoProps {
	title: string
	setTitle: (title: string) => void
	difficulty: string
	setDifficulty: (difficulty: string) => void
	ratingMode: "hard" | "space" | "regex"
	setRatingMode: (mode: "hard" | "space" | "regex") => void
	tags: string[]
	updateTags: (tagString: string) => void
	removeTag: (index: number) => void
}

export default function ProblemBasicInfo({
	title,
	setTitle,
	difficulty,
	setDifficulty,
	ratingMode,
	setRatingMode,
	tags,
	updateTags,
	removeTag,
}: ProblemBasicInfoProps) {
	const [description, setDescription] = useState("")
	const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write")

	return (
		<div className="mb-6">
			<h2 className="text-lg font-bold mb-2">문제 기본 정보</h2>
			<div className="border-t border-gray-300 my-3"></div>

			{/* 문제 제목 */}
			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="문제 제목"
				className="w-full px-3 py-1.5 border rounded-md mb-3 text-sm"
			/>

			{/* 태그 입력 */}
			<div className="mb-3">
				<label className="block text-xs font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
				<input
					type="text"
					value={tags.join(", ")}
					onChange={(e) => updateTags(e.target.value)}
					placeholder="예: 구현, 수학, 문자열"
					className="w-full px-3 py-1 border rounded-md text-sm"
				/>
				<div className="flex flex-wrap gap-2 mt-1">
					{tags.map((tag, idx) => (
						<span key={idx} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
							{tag}
							<button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => removeTag(idx)}>
								×
							</button>
						</span>
					))}
				</div>
			</div>

			{/* 난이도와 평가 모드 */}
			<div className="flex gap-4 mb-3">
				<div className="flex-1">
					<label className="block text-xs font-medium text-gray-700 mb-1">난이도</label>
					<select
						value={difficulty}
						onChange={(e) => setDifficulty(e.target.value)}
						className="w-full px-3 py-1.5 border rounded-md text-sm"
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">hard</option>
					</select>
				</div>

				<div className="flex-1">
					<label className="block text-xs font-medium text-gray-700 mb-1">채점 모드</label>
					<select
						value={ratingMode}
						onChange={(e) => setRatingMode(e.target.value as "hard" | "space" | "regex")}
						className="w-full px-3 py-1.5 border rounded-md text-sm"
					>
						<option value="hard">hard</option>
						<option value="space">Space</option>
						<option value="regex">regex</option>
					</select>
				</div>
			</div>
		</div>
	)
}
