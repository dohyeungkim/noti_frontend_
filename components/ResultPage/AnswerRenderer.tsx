// components/AnswerRenderer.tsx
import React from "react"
import ReactMarkdown from "react-markdown"

// 네가 가진 인터페이스들을 그대로 사용
// (경로에 맞게 import만 바꿔줘)
import type { CodingProblem, MultipleChoiceProblem, ShortAnswerProblem, SubjectiveProblem } from "@/lib/api" // 혹은 실제 위치

type ProblemVariant = CodingProblem | MultipleChoiceProblem | ShortAnswerProblem | SubjectiveProblem

interface AnswerRendererProps {
	problem: ProblemVariant
	solveData: any // solve_get_by_solve_id 응답 (백엔드 형식 그대로)
}

/** solve 응답을 화면용으로 정규화 */
function normalizeSolve(s: any): {
	type?: ProblemVariant["problemType"]
	code?: string
	language?: string
	selectedOptions?: number[]
	answers?: string[]
	writtenText?: string
} {
	const type = s?.problemType as ProblemVariant["problemType"] | undefined
	const n: any = { type }

	switch (type) {
		case "코딩":
		case "디버깅": {
			n.code = s?.submitted_code ?? s?.code ?? ""
			n.language = s?.code_language ?? s?.language ?? ""
			break
		}
		case "객관식": {
			// 가능한 모든 케이스 흡수
			const arr =
				s?.selected_options ??
				s?.selectedOptions ??
				(Array.isArray(s?.selected_index) ? s?.selected_index : s?.selected_index != null ? [s?.selected_index] : [])
			n.selectedOptions = Array.isArray(arr) ? arr : []
			break
		}
		case "단답형": {
			// answers가 배열, submitted_text가 단일 문자열일 수 있음
			const a = s?.answers ?? (s?.submitted_text ? [s?.submitted_text] : [])
			n.answers = Array.isArray(a) ? a : []
			break
		}
		case "주관식": {
			n.writtenText = s?.written_text ?? s?.submitted_text ?? ""
			break
		}
		default:
			break
	}
	return n
}

/** 문자열 비교용: 공백/대소문자 무시 */
const norm = (v: string) => v.replace(/\s+/g, " ").trim().toLowerCase()

export default function AnswerRenderer({ problem, solveData }: AnswerRendererProps) {
	const s = normalizeSolve(solveData)
	/** 객체/배열이 와도 항상 문자열로 바꿔 렌더에 안전하게 쓰기 */
	function toInlineString(val: any): string {
		if (val == null) return ""
		if (typeof val === "string") return val
		if (typeof val === "object") {
			// { language, code } 패턴 우선 지원
			if ("code" in val && typeof (val as any).code === "string") {
				return (val as any).code
			}
			// 그 외 객체는 안전하게 문자열화
			try {
				return JSON.stringify(val)
			} catch {
				return String(val)
			}
		}
		console.log("[check code]", typeof s.code, s.code)

		return String(val)
	}

	switch (problem.problemType) {
		/** 코딩/디버깅 */
		case "코딩":
		case "디버깅": {
			return (
				<div className="p-4 bg-white rounded-lg border">
					<h3 className="font-semibold mb-2">내가 제출한 코드</h3>
					<div className="text-sm text-gray-600 mb-2">언어: {s.language || "알 수 없음"}</div>
					<pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
						{toInlineString(s.code) || "제출한 코드가 없습니다."}
					</pre>
				</div>
			)
		}

		/** 객관식 */
		case "객관식": {
			const options = (problem as MultipleChoiceProblem).options || []
			const correct = new Set<number>((problem as MultipleChoiceProblem).correct_answers || [])
			const selected = s.selectedOptions ?? []

			return (
				<div className="p-4 bg-white rounded-lg border">
					<h3 className="font-semibold mb-3">내가 선택한 보기</h3>
					{selected.length === 0 ? (
						<p className="text-gray-500">선택한 보기가 없습니다.</p>
					) : (
						<ol className="list-decimal list-inside space-y-1">
							{selected.map((idx) => {
								const text = toInlineString(options[idx] ?? `(삭제된 보기 ${idx + 1})`)

								const isCorrect = correct.has(idx)
								return (
									<li key={idx} className="flex items-start gap-2">
										<span
											className={`px-2 py-0.5 text-xs rounded ${
												isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
											}`}
										>
											{isCorrect ? "정답" : "오답"}
										</span>
										<span className="whitespace-pre-wrap">{text}</span>
									</li>
								)
							})}
						</ol>
					)}

					{/* 정답 공개 (필요하면 주석 해제) */}
					{/* {options.length > 0 && (
						<div className="mt-4 text-sm text-gray-600">
							<div className="font-medium mb-1">정답</div>
							<ol className="list-decimal list-inside space-y-1">
								{[...correct].map((idx) => (
									<li key={idx}>{options[idx] ?? `(삭제된 보기 ${idx + 1})`}</li>
								))}
							</ol>
						</div>
					)} */}
				</div>
			)
		}

		/** 단답형 */
		case "단답형": {
			const correctListRaw = (problem as ShortAnswerProblem).answer_text || []
			const correctList = correctListRaw.map(toInlineString)
			const correctSet = new Set(correctList.map(norm))
			const myAnswers = (s.answers ?? []).map(toInlineString)

			return (
				<div className="p-4 bg-white rounded-lg border">
					<h3 className="font-semibold mb-3">내가 입력한 답안</h3>
					{myAnswers.length === 0 ? (
						<p className="text-gray-500">입력한 답안이 없습니다.</p>
					) : (
						<ul className="space-y-1">
							{myAnswers.map((ans: string, i: number) => {
								const ok = correctSet.has(norm(ans))
								return (
									<li key={i} className="flex items-start gap-2">
										<span
											className={`px-2 py-0.5 text-xs rounded ${
												ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
											}`}
										>
											{ok ? "정답" : "오답"}
										</span>
										<span className="whitespace-pre-wrap">{ans}</span>
									</li>
								)
							})}
						</ul>
					)}

					{/* {correctList.length > 0 && (
						<div className="mt-4 text-sm text-gray-600">
							<div className="font-medium mb-1">정답(허용 표현)</div>
							<ul className="list-disc list-inside space-y-1">
								{correctList.map((a, i) => (
									<li key={i} className="whitespace-pre-wrap">
										{a}
									</li>
								))}
							</ul>
						</div>
					)} */}
				</div>
			)
		}

		/** 주관식 */
		case "주관식": {
			const sample = (problem as SubjectiveProblem).answer_text || ""
			const my = s.writtenText ?? ""

			return (
				<div className="p-4 bg-white rounded-lg border prose max-w-none">
					<h3 className="font-semibold mb-2">내가 작성한 서술형 답안</h3>
					{my ? <ReactMarkdown>{String(my)}</ReactMarkdown> : <p className="text-gray-500">작성한 답안이 없습니다.</p>}

					{/* {sample && (
						<div className="mt-6">
							<h4 className="font-semibold mb-2">예시 답안</h4>
							<div className="prose-sm">
								<ReactMarkdown>{String(sample)}</ReactMarkdown>
							</div>
						</div>
					)} */}
				</div>
			)
		}

		default:
			return null
	}
}
