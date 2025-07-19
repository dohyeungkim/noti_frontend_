// components/ProblemDetailRenderer.tsx
import React from "react"
import { ProblemDetail } from "@/lib/api" // union 타입

export default function ProblemDetailRenderer({ problem }: { problem: ProblemDetail }) {
	switch (problem.problemType) {
		case "코딩":
		case "디버깅":
			return (
				<div>
					<h3>✨ 참조 코드</h3>
					{problem.reference_codes.map((rc, i) => (
						<pre key={i}>
							<code>{rc.code}</code>
						</pre>
					))}
					<h3>🧪 테스트 케이스</h3>
					<ul>
						{problem.test_cases.map((tc, i) => (
							<li key={i}>
								{tc.input} → {tc.expected_output}
							</li>
						))}
					</ul>
					{problem.problemType === "디버깅" && (
						<>
							<h3>🔧 Base 코드</h3>
							<pre>
								<code>{(problem as any).base_code}</code>
							</pre>
						</>
					)}
				</div>
			)
		case "객관식":
			return (
				<div>
					<h3>📋 선택지</h3>
					<ol>
						{problem.options.map((opt, i) => (
							<li key={i}>{opt}</li>
						))}
					</ol>
					<p>✅ 정답 인덱스: {problem.correct_answers.join(", ")}</p>
				</div>
			)
		case "단답형":
			return (
				<div>
					<h3>✏️ 정답 예시</h3>
					<ul>
						{problem.answer_text.map((txt, i) => (
							<li key={i}>{txt}</li>
						))}
					</ul>
					<h3>📑 채점 기준</h3>
					<ul>
						{problem.grading_criteria.map((gc, i) => (
							<li key={i}>{gc}</li>
						))}
					</ul>
				</div>
			)
		case "주관식":
			return (
				<div>
					<h3>📑 채점 기준</h3>
					<ul>
						{problem.grading_criteria.map((gc, i) => (
							<li key={i}>{gc}</li>
						))}
					</ul>
				</div>
			)
		default:
			return null
	}
}
