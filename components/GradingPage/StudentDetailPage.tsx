// "use client"

// import { useEffect, useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import dynamic from "next/dynamic"
// import { studentSubmission, studentSubmissionsCollection } from "@/data/gradingDummy"

// const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
// 	ssr: false,
// })

// export default function StudentGradingDetailPage() {
// 	const { groupId, examId, studentId } = useParams()
// 	const router = useRouter()

// 	// 해당 학생 제출물
// 	const [submissions, setSubmissions] = useState<
// 		{ problemId: number; answerType: string; answer: string; score: number }[]
// 	>([])
// 	const [studentName, setStudentName] = useState<string>("")

// 	useEffect(() => {
// 		// 더미데이터에서 studentId 로 찾아오기
// 		const data = studentId === "student-001" ? studentSubmission : (studentSubmissionsCollection as any)[studentId]

// 		if (!data) {
// 			// 유효하지 않은 ID 면 뒤로
// 			router.back()
// 			return
// 		}

// 		setStudentName(data.studentName)
// 		setSubmissions(data.submissions)
// 	}, [studentId, router])

// 	return (
// 		<div className="max-w-3xl mx-auto py-8 space-y-8">
// 			<button onClick={() => router.back()} className="text-sm text-blue-500 hover:underline">
// 				← 목록으로
// 			</button>

// 			<h1 className="text-2xl font-bold">{studentName} 제출물</h1>

// 			{submissions.map((s) => (
// 				<div key={s.problemId} className="space-y-2">
// 					<h2 className="text-lg font-semibold">
// 						문제 {s.problemId} (점수: {s.score})
// 					</h2>

// 					{s.answerType === "code" ? (
// 						<MonacoEditor
// 							height="300px"
// 							defaultLanguage="javascript"
// 							value={s.answer}
// 							options={{
// 								readOnly: true,
// 								minimap: { enabled: false },
// 								fontSize: 14,
// 								wordWrap: "on",
// 							}}
// 						/>
// 					) : s.answerType === "text" ? (
// 						<div className="p-4 bg-gray-50 rounded whitespace-pre-wrap">{s.answer}</div>
// 					) : (
// 						// 객관식 등 기타 타입
// 						<div className="p-4 bg-gray-50 rounded">선택 답안: {s.answer}</div>
// 					)}
// 				</div>
// 			))}
// 		</div>
// 	)
// }
