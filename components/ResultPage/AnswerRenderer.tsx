// components/AnswerRenderer.tsx
import React from "react"
import ReactMarkdown from "react-markdown"
import { ProblemDetail } from "@/lib/api"

interface AnswerRendererProps {
	problem: ProblemDetail
	solveData: any // solve_api에서 반환된 상세 조회 타입
}

export default function AnswerRenderer({ problem, solveData }: AnswerRendererProps) {
	switch (problem.problemType) {
		case "객관식":
			// solveData.selected_options: number[] (인덱스 배열이라고 가정)
			return (
				<div className="p-4 bg-white rounded-lg border">
					<h3 className="font-semibold mb-2">내가 선택한 보기</h3>
					<ol className="list-decimal list-inside">
						{solveData.selected_options?.map((idx: number) => (
							<li key={idx}>{problem.options[idx]}</li>
						))}
					</ol>
				</div>
			)
		case "단답형":
			// solveData.submitted_text: string
			return (
				<div className="p-4 bg-white rounded-lg border">
					<h3 className="font-semibold mb-2">내가 입력한 답안</h3>
					<p className="whitespace-pre-wrap">{solveData.submitted_text}</p>
				</div>
			)
		case "주관식":
			// solveData.submitted_text: Markdown 포맷 문자열
			return (
				<div className="p-4 bg-white rounded-lg border prose max-w-none">
					<h3 className="font-semibold mb-2">내가 작성한 서술형 답안</h3>
					<ReactMarkdown>{solveData.submitted_text}</ReactMarkdown>
				</div>
			)
		default:
			return null
	}
}
