"use client"
/** ==================== 8월 9일에 해야될 내용 ====================
 * 코딩 - 가져올 값 없음
 * ✨ 디버깅 - 베이스코드 가져와서 모나코 에디터에 그대로 랜더링
 * 단답형 - 가져올 값 없음
 * 객관식 - 선지 가져와야됨 + 답 인덱스 갯수 가져와서 답 여러개면 복수형 문제라고 알려주고 복수 선택 가능하게 하기 !!
 * 주관식 - 가져올 값 없음
 */

import { useRouter, useSearchParams } from "next/navigation"
import { useRef } from "react"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion } from "framer-motion"
import {
	auth_api,
	problem_api, // 디버깅: 베이스 코드,  객관식
	code_log_api,
	solve_api,
	ai_feedback_api,
	run_code_api,
	ProblemType,
	SolveRequest,
} from "@/lib/api"
import type { ProblemDetail } from "@/lib/api"
import { editor } from "monaco-editor"
import * as monaco from "monaco-editor"
// 🔥 CHANGE 1: 새로운 PresenceIndicator import 추가
// import { PresenceIndicator } from "./PresenceIndicator"

// Problem 타입 정의 (확장)
// interface Problem {
// 	// 학생에게 보여주는 핃르들
// 	id: number
// 	title: string
// 	description: string
// 	problem_condition?: string[]
// 	problemType: string
// 	// 학생에게 안 보여지는 필드들
// 	rating_mode?: string
// 	test_cases?: Array<{
// 		input: string
// 		expected_output: string
// 		is_sample: boolean
// 	}>
// }

// TestCase 타입 정의
interface TestCase {
	input: string
	output: string
	isSample?: boolean
}

// RunResult 타입 정의
interface RunResult {
	input: string
	expected: string
	output: string
	passed: boolean
}

// WriteCodePageClient Props 인터페이스
interface WriteCodePageClientProps {
	params: {
		problemId: string
		examId: string
		groupId: string
	}
}

// 🔥 CHANGE 2: 기존 inline PresenceIndicator 컴포넌트 제거 (삭제됨)
// export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ pageId, user }) => {
//   const participantsCount = usePresence(pageId, user)
//   return (
//     <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md text-sm text-gray-700 border border-gray-300">
//       현재 접속 인원: <span className="font-semibold">{participantsCount}</span>명
//     </div>
//   )
// }

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
})

export default function WriteCodePageClient({ params }: WriteCodePageClientProps) {
	const router = useRouter()
	const { groupId } = useParams()

	const [problem, setProblem] = useState<ProblemDetail | undefined>(undefined)
	type BackendProblemType = "coding" | "debugging" | "multiple_choice" | "short_answer" | "subjective"
	// const EN_TO_KO: Record<BackendProblemType, ProblemType> = {
	// 	coding: "코딩",
	// 	debugging: "디버깅",
	// 	multiple_choice: "객관식",
	// 	short_answer: "단답형",
	// 	subjective: "주관식",
	// }

	// 👻❌ solve 쪽은 문제 유형 영어로. 프론트는 한글로
	const isCodingOrDebugging = problem?.problemType === "coding" || problem?.problemType === "debugging"
	const isMultiple = problem?.problemType === "multiple_choice"
	const isShort = problem?.problemType === "short_answer"
	const isSubjective = problem?.problemType === "subjective"

	const [problemConditions, setProblemConditions] = useState<string[]>([]) // 빈 배열로 초기화

	const searchParams = useSearchParams()
	const solveId = searchParams.get("solve_id")
	const queryLanguage = searchParams.get("language")
	// const [problemType, setProblemType] = useState<String>("coding")

	// 언어별 디폴트 코드 템플릿
	const defaultTemplates: { [lang: string]: string } = {
		python: "",
		c: "#include<stdio.h>\n\nint main() {\n    return 0;\n}",
		cpp: "#include<iostream>\n\nint main() {\n    return 0;\n}",
		java: "public class Main {\n    public static void main(String[] args) {\n    }\n}",
	}

	// 언어/문제별 언어 선택 저장 키
	const languageStorageKey = `aprofi_language_${params.problemId}`

	// 언어 초기값: 쿼리파라미터 > localStorage > python
	const initialLanguage =
		(typeof window !== "undefined" && (queryLanguage || localStorage.getItem(languageStorageKey))) || "python"
	const [language, setLanguage] = useState(initialLanguage)

	// 코드 초기값: localStorage > 템플릿
	const storageKey = `aprofi_code_${initialLanguage}_${params.problemId}`
	const initialCode =
		(typeof window !== "undefined" && localStorage.getItem(storageKey)) || defaultTemplates[initialLanguage]
	const [code, setCode] = useState<string>(initialCode)

	// 객관식 문제: 옵션, 복수정답 여부, 선택된 인덱스(단일, 복수)
	const [choiceOptions, setChoiceOptions] = useState<string[]>([])
	const [allowMultiple, setAllowMultiple] = useState<boolean>(false)

	const [selectedSingle, setSelectedSingle] = useState<number | null>(null)
	const [selectedMultiple, setSelectedMultiple] = useState<number[]>([])

	// 주관식 문제 답
	const [subjectiveAnswer, setSubjectiveAnswer] = useState<string>("")

	// 단답형 문제 답
	const [shortAnswer, setShortAnswer] = useState<string>("")

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [codeLogs, setCodeLogs] = useState<string[]>([])
	const [timeStamps, setTimeStamps] = useState<string[]>([])

	const [userId, setUserId] = useState("")
	const [userNickname, setUserNickname] = useState("")

	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

	// const [testCases, setTestCases] = useState<TestCase[]>([])
	// const [runResults, setRunResults] = useState<RunResult[]>([])
	// const [isTestRunning, setIsTestRunning] = useState(false)

	// 언어가 바뀔 때 localStorage에 저장
	useEffect(() => {
		if (language) {
			localStorage.setItem(languageStorageKey, language)
		}
	}, [language, params.problemId, languageStorageKey])

	// 코드가 바뀔 때 localStorage에 저장
	useEffect(() => {
		if (language && params.problemId) {
			localStorage.setItem(`aprofi_code_${language}_${params.problemId}`, code)
		}
	}, [code, language, params.problemId])

	// 유저 정보 가져오기
	const fetchUser = useCallback(async () => {
		if (userId === "") {
			try {
				const res = await auth_api.getUser()
				setUserId(res.user_id)
				// nickname 속성이 없으므로 username 사용
				setUserNickname(res.username || "사용자")
			} catch (error) {
				console.error("유저 정보를 불러오는 중 오류 발생:", error)
			}
		}
	}, [userId])

	// 문제 정보 가져오기
	const fetchProblem = useCallback(async () => {
		try {
			console.log("문제 API 호출 파라미터:", params.groupId, params.examId, params.problemId)
			const res = await problem_api.problem_get_by_id_group(
				Number(params.groupId),
				Number(params.examId),
				Number(params.problemId)
			)
			console.log("📋 문제 풀기 페이지 해당 문제 GET Api 응답:", res)
			setProblem(res)

			// 문제 조건만 설정 (problem_condition 사용)
			if (
				"problem_condition" in res &&
				Array.isArray((res as any).problem_condition) &&
				(res as any).problem_condition.length > 0
			) {
				setProblemConditions((res as any).problem_condition)
			} else {
				setProblemConditions([])
			}

			// ========== 디버깅 문제 ==========
			// 디버깅 문제 베이스(현재 백엔드는 reference_codes로 넘겨주고 있어서 일단은 이렇게 함) 코드 랜더링 -  에디터에 띄워야됨
			// if ("base_codes" in res && Array.isArray((res as any).base_codes) && (res as any).base_codes.length > 0) {
			if (
				"reference_codes" in res &&
				Array.isArray((res as any).reference_codes) &&
				(res as any).reference_codes.length > 0
			) {
				setCode((res as any).reference_codes[0].code)
			} else {
				setCode("")
			}

			// 지정해놨던 케이스들
			let sampleTestCases: TestCase[] = []
			if ("test_case" in res && Array.isArray((res as any).test_case)) {
				sampleTestCases = (res as any).test_cases.filter((tc: any) => ({
					input: tc.input,
					output: tc.expected_ouput,
				}))
			}
			// 샘플이 하나라도 있으면 그걸로, 없으면 기존처럼 빈 테스트케이스
			if (sampleTestCases.length > 0) {
				setTestCases(sampleTestCases)
			} else {
				setTestCases([{ input: "", output: "" }])
			}

			// ========== 객관식 문제 ==========
			if (
				"options" in res &&
				"correct_answers" in res &&
				Array.isArray((res as any).options) &&
				Array.isArray((res as any).correct_answers)
			) {
				// 안전하게 배열 보장
				const opts: string[] = Array.isArray((res as any).options) ? (res as any).options : []
				setChoiceOptions(opts)

				// 정답 개수로 복수 여부 결정
				const correct = Array.isArray((res as any).correct_answers) ? (res as any).correct_answers : []
				setAllowMultiple(correct.length > 1)

				// 초기 선택값 리셋(경고 방지)
				setSelectedSingle(null)
				setSelectedMultiple([])
			}
		} catch (error) {
			console.error("문제 불러오기 중 오류 발생:", error)
		}
	}, [params.groupId, params.examId, params.problemId])

	useEffect(() => {
		fetchUser()
	}, [fetchUser])

	useEffect(() => {
		fetchProblem()
	}, [fetchProblem])

	useEffect(() => {
		if (solveId) {
			console.log("solveId로 코드 불러오기 시도:", solveId)
			solve_api
				.solve_get_by_solve_id(Number(solveId))
				.then((res) => {
					console.log("solve_get_by_solve_id 응답:", res)
					setCode(res.submitted_code ?? "")
				})
				.catch((err) => {
					console.error("solve_get_by_solve_id 에러:", err)
				})
		}
	}, [solveId])

	useEffect(() => {
		if (editorRef.current && code !== editorRef.current.getValue()) {
			editorRef.current.setValue(code)
		}
	}, [code])

	// ========== 문제 제출 하는 함수 ==========
	const handleSubmit = async () => {
		if (!params.groupId || !params.examId || !params.problemId) {
			alert("❌ 오류: 필요한 값이 없습니다!")
			return
		}
		if (!problem) {
			alert("문제 정보가 없습니다.")
			return
		}

		const { newCode, newCodeLogs, newTimeStamps } = collectLogs()

		const pType = problem.problemType as SolveRequest["problemType"]
		let request: SolveRequest

		switch (pType) {
			case "coding":
			case "debugging": {
				if (!code.trim()) {
					alert("코드를 입력해주세요.")
					return
				}
				request = {
					problemType: pType,
					codes: [{ language, code }],
				}
				break
			}

			// 👻❌
			case "multiple_choice": {
				const selections = allowMultiple ? selectedMultiple : selectedSingle !== null ? [selectedSingle] : []

				if (!selections.length) {
					alert("객관식 답안을 선택해주세요.")
					return
				}

				request = {
					problemType: pType, // "multiple_choice"
					selected_options: selections, // number[] (인덱스 배열)
				}

				break
			}

			case "short_answer": {
				if (!shortAnswer.trim()) {
					alert("단답형 답안을 입력해주세요.")
					return
				}
				request = {
					problemType: pType,
					answers: [shortAnswer],
				}
				break
			}

			case "subjective": {
				if (!subjectiveAnswer.trim()) {
					alert("주관식 답안을 입력해주세요.")
					return
				}
				request = {
					problemType: pType,
					written_text: subjectiveAnswer,
				}
				break
			}

			default: {
				alert("알 수 없는 문제 유형입니다.")
				return
			}
		}

		try {
			const data = await solve_api.solve_create(
				Number(params.groupId),
				Number(params.examId),
				Number(params.problemId),
				userId,
				request
			)
			await code_log_api.code_log_create(Number(data.solve_id), userId, newCodeLogs, newTimeStamps)
			ai_feedback_api.get_ai_feedback(Number(data.solve_id)).catch(() => {})

			router.push(`/mygroups/${groupId}/exams/${params.examId}/problems/${params.problemId}/result/${data.solve_id}`)
		} catch (err) {
			alert(`❌ 제출 오류: ${err instanceof Error ? err.message : String(err)}`)
		}

		await new Promise((resolve) => setTimeout(resolve, 100))
	}

	const collectLogs = () => {
		const newCode = editorRef.current?.getValue() || ""
		const newCodeLogs = [...codeLogs, newCode]
		const newTimeStamps = [...timeStamps, new Date().toISOString()]
		setCodeLogs([])
		setTimeStamps([])
		return { newCode, newCodeLogs, newTimeStamps }
	}

	// const submitLogs = async () => {
	// 	setLoading(true)
	// 	setError("")

	// 	try {
	// 		const newCode = editorRef.current?.getValue() || ""
	// 		const newCodeLogs = [...codeLogs, newCode]
	// 		const newTimeStamps = [...timeStamps, new Date().toISOString()]

	// 		const data = await solve_api.solve_create(
	// 			Number(params.groupId),
	// 			Number(params.examId),
	// 			Number(params.problemId),
	// 			userId,
	// 			newCode,
	// 			language
	// 		)
	// 		await code_log_api.code_log_create(Number(data.solve_id), userId, newCodeLogs, newTimeStamps)
	// 		ai_feedback_api.get_ai_feedback(Number(data.solve_id)).catch((err) => {
	// 			console.error("AI 피드백 호출 실패:", err)
	// 		})
	// 		console.log("제출 성공:", newCodeLogs, newTimeStamps)
	// 		setCodeLogs([])
	// 		setTimeStamps([])

	// 		if (problemType === "coding" || problemType === "debugging") {
	// 			Object.keys(localStorage).forEach((key) => {
	// 				if (key.startsWith("aprofi_code_") && key.endsWith(`_${params.problemId}`)) {
	// 					localStorage.removeItem(key)
	// 				}
	// 			})
	// 		}

	// 		router.push(`/mygroups/${groupId}/exams/${params.examId}/problems/${params.problemId}/result/${data.solve_id}`)
	// 	} catch (err) {
	// 		alert(`❌ 제출 오류: ${err instanceof Error ? err.message : String(err)}`)
	// 	} finally {
	// 		setLoading(false)
	// 	}
	// }

	// 테스트케이스 실행 관련 상태
	const [testCases, setTestCases] = useState<TestCase[]>([])
	const [runResults, setRunResults] = useState<RunResult[]>([])
	const [isTestRunning, setIsTestRunning] = useState(false)

	const handleTestCaseChange = (idx: number, field: "input" | "output", value: string) => {
		setTestCases((prev) => prev.map((tc, i) => (i === idx ? { ...tc, [field]: value } : tc)))
	}
	const addTestCase = () => {
		setTestCases((prev) => {
			const next = [...prev, { input: "", output: "" }]
			console.log("테스트케이스 추가됨", next)
			return next
		})
	}
	const removeTestCase = (idx: number) => setTestCases((prev) => prev.filter((_, i) => i !== idx))

	const handleTestRun = async () => {
		if (!problem) {
			alert("문제 정보가 없습니다.")
			return
		}
		if (!code.trim()) {
			alert("코드를 입력해주세요.")
			return
		}
		if (!Array.isArray(testCases) || testCases.length === 0) {
			alert("테스트케이스를 추가해주세요.")
			return
		}

		setIsTestRunning(true)
		setRunResults([])

		try {
			const data = await run_code_api.run_code({
				language: language,
				code: code,
				rating_mode: problem.rating_mode || "default",
				test_cases: testCases.map((tc) => ({
					input: tc.input,
					expected_output: tc.output,
				})),
			})

			console.log("run_code_api 반환값:", data)

			const results =
				data.results?.map((result: any, index: number) => ({
					input: testCases[index].input,
					expected: testCases[index].output,
					output: result.output || result.actual_output || "",
					passed: result.passed || result.success || false,
				})) || []

			setRunResults(results)
		} catch (err) {
			console.error("run_code_api 에러:", err)
			setRunResults([])
			alert(`테스트 실행 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`)
		} finally {
			setIsTestRunning(false)
		}
	}

	// 언어 변경 핸들러: 코드도 localStorage에서 복원
	const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newLang = e.target.value
		setLanguage(newLang)
		const saved = localStorage.getItem(`aprofi_code_${newLang}_${params.problemId}`)
		setCode(saved !== null && saved !== "" ? saved : defaultTemplates[newLang])
	}

	// **리사이즈 구현**
	const containerRef = useRef<HTMLDivElement>(null)
	const isResizing = useRef(false)
	const [leftWidth, setLeftWidth] = useState<number>(300) // 왼쪽을 더 작게 (300px로 설정)

	// leftWidth 변경 시 Monaco Editor 리사이즈
	useEffect(() => {
		if (editorRef.current) {
			// 즉시 실행 + requestAnimationFrame으로 더 빠르게
			editorRef.current.layout()
			requestAnimationFrame(() => {
				editorRef.current?.layout()
			})
		}
	}, [leftWidth])

	const onMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		isResizing.current = true
		console.log("드래그 시작")
	}

	const onMouseMove = useCallback((e: MouseEvent) => {
		if (!isResizing.current || !containerRef.current) return

		const rect = containerRef.current.getBoundingClientRect()
		const containerWidth = rect.width
		let newWidth = e.clientX - rect.left

		// 최소/최대 너비 제한
		const minWidth = 400
		const maxLeftWidth = 800 // 왼쪽 최대 800px
		const minRightWidth = 400 // 오른쪽 최소 400px
		const maxWidth = containerWidth - minRightWidth

		// 왼쪽 영역 제한: 400px ~ 800px 또는 (전체 - 400px) 중 작은 값
		newWidth = Math.max(minWidth, Math.min(newWidth, Math.min(maxLeftWidth, maxWidth)))
		setLeftWidth(newWidth)

		// Monaco Editor 리사이즈 트리거 (즉시 실행)
		if (editorRef.current) {
			editorRef.current.layout()
		}

		console.log("드래그 중 - 새 너비:", newWidth, "오른쪽 너비:", containerWidth - newWidth)
	}, [])

	const onMouseUp = useCallback(() => {
		isResizing.current = false
		// 드래그 완료 후 Monaco Editor 리사이즈
		if (editorRef.current) {
			setTimeout(() => {
				editorRef.current?.layout()
			}, 100)
		}
		console.log("드래그 종료")
	}, [])

	useEffect(() => {
		document.addEventListener("mousemove", onMouseMove)
		document.addEventListener("mouseup", onMouseUp)
		return () => {
			document.removeEventListener("mousemove", onMouseMove)
			document.removeEventListener("mouseup", onMouseUp)
		}
	}, [onMouseMove, onMouseUp])

	if (!problem || !Array.isArray(testCases)) {
		return <div>로딩 중...</div>
	}

	// 실시간 사용자 현황을 위한 pageId와 user 데이터 생성
	const pageId = `problem-${params.groupId}-${params.examId}-${params.problemId}`
	const currentUser = {
		userId: userId,
		nickname: userNickname,
	}

	return !problem ? (
		<div className="flex items-center gap-2 justify-end"></div>
	) : (
		<>
			{/* 상단 영역: 제출 버튼과 실시간 사용자 현황 */}
			<motion.div
				className="flex items-center gap-2 justify-between"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.2 }}
			>
				{/* 👻 redis는 일단 v0에서는 생략. 추후에 추가하기 */}
				<div>
					{/* 🔥 CHANGE 3: 새로운 PresenceIndicator 컴포넌트 사용 */}
					{/* {userId && userNickname && <PresenceIndicator pageId={pageId} user={currentUser} />} */}
				</div>
				{/* 제출 버튼 (오른쪽) */}
				<motion.button
					onClick={handleSubmit}
					disabled={loading}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className={`flex items-center ${
						loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-500"
					} text-white px-16 py-1.5 rounded-xl m-2 text-md`}
				>
					{loading ? "제출 중..." : "제출하기"}
				</motion.button>
			</motion.div>

			{error && <p className="text-red-500 text-center mt-2">{error}</p>}

			<main
				ref={containerRef}
				className="flex mt-3 w-full overflow-hidden
              min-h-[75vh] sm:min-h-[70vh] md:min-h-[70vh] lg:min-h-[70vh]
              pb-20"
			>
				{/* 문제 설명 영역 (왼쪽) */}
				<div className="overflow-hidden pr-2" style={{ width: leftWidth, minWidth: 400, maxWidth: 800 }}>
					<div className="sticky top-0 pb-4">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
							{problem.title.length > 20 ? `${problem.title.slice(0, 20)}...` : problem.title}
						</h1>
						<hr className="border-t-2 border-gray-400" />
					</div>
					<div className="overflow-y-auto max-h-[calc(100%-120px)] p-2 pr-2">
						{/* 문제 설명 */}
						<div
							className="editor-content prose prose-headings:font-bold prose-h1:text-4xl prose-h1:mt-4 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-4 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-4 prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6 prose-li:mb-2 mb-6"
							dangerouslySetInnerHTML={{ __html: problem.description }}
						/>

						{/* 📌 문제 조건 섹션 */}
						{problemConditions && isCodingOrDebugging && problemConditions.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1 }}
								className="bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200"
							>
								<h3 className="text-lg font-bold mb-3 text-gray-800">문제 조건</h3>
								<div className="border-t border-gray-300 mb-3"></div>
								<div className="space-y-2">
									{problemConditions.map((condition, index) => (
										<div key={index} className="flex items-start gap-3">
											<span className="text-sm font-semibold text-gray-700 min-w-[20px] mt-0.5">{index + 1}.</span>
											<p className="text-sm text-gray-700 leading-relaxed">{condition}</p>
										</div>
									))}
								</div>
							</motion.div>
						)}
					</div>
				</div>

				{/* 드래그 핸들 */}
				<div
					onMouseDown={onMouseDown}
					className="w-2 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors flex-shrink-0 border-l border-r border-gray-200"
				/>

				{/* 코드 에디터 영역 (오른쪽) */}
				<div
					className="flex flex-col overflow-hidden"
					style={{
						width: `calc(100% - ${leftWidth + 10}px)`, // leftWidth + 드래그핸들 + 여백
						maxWidth: `calc(100% - ${leftWidth + 10}px)`,
						minWidth: 400,
					}}
				>
					<div className="flex flex-col h-full w-full max-w-full overflow-hidden pl-2">
						{/* 코딩/디버깅 타입일 때 */}
						{isCodingOrDebugging && (
							<>
								<div className="flex items-center mb-2 max-w-full overflow-hidden">
									<select
										value={language}
										onChange={handleLanguageChange}
										className="border rounded-lg p-2 flex-shrink-0 text-sm"
									>
										<option value="python">Python</option>
										<option value="c">C</option>
										<option value="cpp">C++</option>
										<option value="java">Java</option>
									</select>
								</div>

								<div className="bg-white rounded shadow flex-1 overflow-hidden max-w-full" style={{ height: "50vh" }}>
									<MonacoEditor
										key={`${solveId || "default"}-${language}`}
										height="50vh"
										language={language}
										value={code ?? ""}
										onChange={(value) => setCode(value ?? "")}
										options={{
											minimap: { enabled: false },
											scrollBeyondLastLine: false,
											fontSize: 16,
											lineNumbers: "off",
											roundedSelection: false,
											contextmenu: false,
											automaticLayout: false,
											copyWithSyntaxHighlighting: false,
											scrollbar: {
												vertical: "visible",
												horizontal: "visible",
											},
											padding: { top: 10, bottom: 10 },
											wordWrap: "on",
											scrollBeyondLastColumn: 0,
										}}
										onMount={(editor, monaco) => {
											editorRef.current = editor
											editor.onKeyDown((event) => {
												if (event.keyCode === monaco.KeyCode.Enter) {
													const newCode = editor.getValue()
													setCodeLogs((prevLogs) => [...prevLogs, newCode])
													setTimeStamps((prev) => [...prev, new Date().toISOString()])
												}
											})
										}}
									/>
								</div>

								{/* 📌 테스트케이스 실행 UI */}
								<div
									className="bg-white rounded-xl shadow-lg mt-4 overflow-hidden max-w-full mb-5"
									style={{ maxHeight: "calc(50vh - 100px)" }}
								>
									{/* 실행하기 버튼 */}
									<div className="flex items-center p-3 border-b max-w-full overflow-hidden">
										<div className="font-bold text-sm mr-2 flex-shrink-0">테스트케이스</div>
										<button
											onClick={handleTestRun}
											disabled={isTestRunning}
											className={`flex items-center ml-auto ${
												isTestRunning ? "bg-gray-400 cursor-not-allowed" : "bg-mygreen hover:bg-green-700"
											} text-white px-3 py-1 rounded text-sm transition-colors flex-shrink-0`}
										>
											{isTestRunning ? "실행중" : "실행"}
										</button>
									</div>

									<div className="p-3 overflow-y-auto max-w-full" style={{ maxHeight: "calc(50vh - 150px)" }}>
										<div className="space-y-2">
											{testCases.map((tc, index) => (
												<div
													key={index}
													className={`border rounded p-2 max-w-full overflow-hidden ${
														runResults[index]?.passed === true
															? "border-green-300 bg-green-50"
															: runResults[index]?.passed === false
															? "border-red-300 bg-red-50"
															: "border-gray-200"
													}`}
												>
													{/* 헤더 */}
													<div className="flex items-center justify-between mb-2 max-w-full overflow-hidden">
														<span className="text-xs font-semibold text-gray-700 flex-shrink-0">#{index + 1}</span>
														<div className="flex items-center gap-1 flex-shrink-0">
															<div className="text-xs">
																{runResults[index]?.passed === true ? (
																	<span className="text-green-600">✔</span>
																) : runResults[index]?.passed === false ? (
																	<span className="text-red-600">✗</span>
																) : (
																	<span className="text-gray-500">-</span>
																)}
															</div>
															{/* 샘플 테스트케이스는 삭제 불가 */}
															{!tc.isSample && (
																<button
																	onClick={() => removeTestCase(index)}
																	className="px-1 py-0.5 bg-red-200 hover:bg-red-300 text-red-700 rounded text-xs"
																>
																	×
																</button>
															)}
														</div>
													</div>

													{/* 입력/출력 영역 */}
													<div className="space-y-1 max-w-full overflow-hidden">
														<div className="max-w-full overflow-hidden">
															<label className="block text-xs text-gray-600 mb-1">입력</label>
															<textarea
																rows={1}
																value={tc.input}
																onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
																onInput={(e) => {
																	const ta = e.currentTarget
																	ta.style.height = "auto"
																	ta.style.height = `${ta.scrollHeight}px`
																}}
																placeholder="입력"
																className="w-full px-1 py-1 border border-gray-300 rounded text-xs resize-none font-mono"
																style={{ maxWidth: "100%" }}
															/>
														</div>

														<div className="max-w-full overflow-hidden">
															<label className="block text-xs text-gray-600 mb-1">예상</label>
															<textarea
																rows={1}
																value={tc.output}
																onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
																onInput={(e) => {
																	const ta = e.currentTarget
																	ta.style.height = "auto"
																	ta.style.height = `${ta.scrollHeight}px`
																}}
																placeholder="예상 출력"
																className="w-full px-1 py-1 border border-gray-300 rounded text-xs resize-none font-mono"
																style={{ maxWidth: "100%" }}
															/>
														</div>

														{runResults[index]?.output && (
															<div className="max-w-full overflow-hidden">
																<label className="block text-xs text-gray-600 mb-1">실제</label>
																<div className="w-full px-1 py-1 border border-gray-200 rounded bg-gray-50 font-mono text-xs overflow-hidden">
																	<span className="break-all">{runResults[index].output}</span>
																</div>
															</div>
														)}
													</div>
												</div>
											))}
										</div>

										{/* 추가 버튼 */}
										<div className="mt-3">
											<button
												onClick={addTestCase}
												className="bg-mygreen hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
											>
												+ 추가
											</button>
										</div>
									</div>
								</div>
							</>
						)}

						{/* ==================== ✨ 문제 유형별 답안 작성 UI ✨ =================== */}
						{/* 객관식 타입일 때 */}
						{isMultiple && (
							<div className="bg-white rounded-xl shadow-lg p-6 flex-1 overflow-y-auto mb-5">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold">객관식 답안 선택</h3>
									{allowMultiple ? (
										<span className="text-sm text-blue-600 font-medium">복수 선택 가능</span>
									) : (
										<span className="text-sm text-gray-500">단일 선택</span>
									)}
								</div>

								{choiceOptions.length === 0 ? (
									<p className="text-gray-500">선지가 없습니다.</p>
								) : (
									<div className="space-y-3">
										{choiceOptions.map((text, index) => {
											const labelNumber = `①②③④⑤⑥⑦⑧⑨⑩`.charAt(index) || `${index + 1}.`
											const id = `opt-${index}`

											return (
												<label
													key={id}
													htmlFor={id}
													className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
														(allowMultiple ? selectedMultiple.includes(index) : selectedSingle === index)
															? "border-blue-500 bg-blue-50"
															: "border-gray-200 hover:border-gray-300"
													}`}
												>
													<input
														id={id}
														type={allowMultiple ? "checkbox" : "radio"}
														name="multipleChoice"
														value={index}
														checked={allowMultiple ? selectedMultiple.includes(index) : selectedSingle === index}
														onChange={(e) => {
															if (allowMultiple) {
																setSelectedMultiple((prev) =>
																	e.target.checked ? [...prev, index] : prev.filter((i) => i !== index)
																)
															} else {
																setSelectedSingle(index)
															}
														}}
														className="mr-3 w-4 h-4 text-blue-600"
													/>

													<span className="font-medium mr-3">{labelNumber}</span>
													<span className="whitespace-pre-wrap">{text}</span>
												</label>
											)
										})}
									</div>
								)}
							</div>
						)}

						{/* 주관식 타입일 때 */}
						{isSubjective && (
							<div className="bg-white rounded-xl shadow-lg p-6 flex-1 overflow-y-auto mb-5">
								<h3 className="text-lg font-semibold mb-4">주관식 답안 작성</h3>
								<textarea
									value={subjectiveAnswer}
									onChange={(e) => setSubjectiveAnswer(e.target.value)}
									placeholder="답안을 자유롭게 작성해주세요..."
									className="w-full h-full min-h-[300px] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									style={{ fontSize: "14px", lineHeight: "1.5" }}
								/>
								<div className="mt-2 text-sm text-gray-500 text-right">{subjectiveAnswer.length} 글자</div>
							</div>
						)}

						{/* 단답형 타입일 때 */}
						{isShort && (
							<div className="bg-white rounded-xl shadow-lg p-6 flex-1 overflow-y-auto mb-5">
								<h3 className="text-lg font-semibold mb-4">단답형 답안 입력</h3>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">답안</label>
										<input
											type="text"
											value={shortAnswer}
											onChange={(e) => setShortAnswer(e.target.value)}
											placeholder="정답을 입력해주세요"
											className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div className="text-sm text-gray-500">간단명료하게 답안을 입력해주세요.</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</>
	)
}
