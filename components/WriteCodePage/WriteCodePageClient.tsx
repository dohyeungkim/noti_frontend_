"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useRef } from "react"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
// import { testExams } from "@/data/testmode";
import { AnimatePresence, motion } from "framer-motion"
import { auth_api, problem_api, code_log_api, solve_api, ai_feeedback_api, run_code_api } from "@/lib/api"
import { Problem } from "../ProblemPage/ProblemModal/ProblemSelectorModal"
import { editor } from "monaco-editor"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
})

export default function WriteCodePageClient({
	params,
}: {
	params: { problemId: string; examId: string; groupId: string }
}) {
	const router = useRouter()
	const { groupId } = useParams()
	// const [isExpanded, setIsExpanded] = useState(true);

	const [problem, setProblem] = useState<Problem | undefined>(undefined)
	const [problemConditions, setProblemConditions] = useState<string[]>([]) // 빈 배열로 초기화

	// const isTestMode = testExams.some((test) => test.examId === params.examId);
	const searchParams = useSearchParams()
	const solveId = searchParams.get("solve_id")
	const queryLanguage = searchParams.get("language")

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

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	// const [isPrevEnter, setPrevIsEnter] = useState(false);
	const [codeLogs, setCodeLogs] = useState<string[]>([])
	const [timeStamps, setTimeStamps] = useState<string[]>([])

	const [userId, setUserId] = useState("")

	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

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
			// userId가 비어 있을 때만 실행
			try {
				const res = await auth_api.getUser()
				setUserId(res.user_id)
			} catch (error) {
				console.error("유저 정보를 불러오는 중 오류 발생:", error)
			}
		}
	}, [userId]) // userId 변경 시만 실행

	// 문제 정보 가져오기
	const fetchProblem = useCallback(async () => {
		try {
			console.log("문제 API 호출 파라미터:", params.groupId, params.examId, params.problemId)
			const res = await problem_api.problem_get_by_id_group(
				Number(params.groupId),
				Number(params.examId),
				Number(params.problemId)
			)
			console.log("📋 전체 문제 API 응답:", res)
			console.log("📋 조건 데이터:", res.conditions)
			console.log("📋 조건 타입:", typeof res.conditions)
			console.log("📋 조건 배열 여부:", Array.isArray(res.conditions))
			// 평가 기준은 로그에서만 확인하고 UI에는 표시하지 않음
			console.log("📋 평가 기준 (UI에 표시되지 않음):", res.evaluation_criteria)

			setProblem(res)

			// 문제 조건만 설정 (평가 기준은 제외)
			if (res.conditions && Array.isArray(res.conditions) && res.conditions.length > 0) {
				console.log("✅ 조건 설정됨:", res.conditions)
				setProblemConditions(res.conditions)
			} else {
				console.log("❌ 조건 없음 - 백엔드에서 아직 지원하지 않음")
				// 🔧 임시: 백엔드 개발 전까지 샘플 조건 표시 (UI 확인용)
				setProblemConditions(["조건1) LC 사용", "조건2) numpy 사용", "조건3) pandas 사용"])

				// 🔧 TODO: 백엔드에서 conditions 필드 지원 시 제거
				console.log("🚨 백엔드 개발자에게 알림: problems 테이블에 conditions 필드 추가 필요")
			}
		} catch (error) {
			console.error("문제 불러오기 중 오류 발생:", error)
		}
	}, [params.groupId, params.examId, params.problemId]) // problemId 변경 시 실행

	useEffect(() => {
		fetchUser()
	}, [fetchUser]) // userId가 변경되면 다시 실행

	useEffect(() => {
		fetchProblem()
	}, [fetchProblem]) // problemId 변경 시 다시 실행

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

	const handleSubmit = async () => {
		if (!params.groupId || !params.examId || !params.problemId) {
			alert("❌ 오류: 필요한 값이 없습니다!")
			return
		}

		await submitLogs()
		await new Promise((resolve) => setTimeout(resolve, 100))
	}

	const submitLogs = async () => {
		setLoading(true)
		setError("")

		try {
			const newCode = editorRef.current?.getValue() || ""
			const newCodeLogs = [...codeLogs, newCode]
			const newTimeStamps = [...timeStamps, new Date().toISOString()]

			const data = await solve_api.sovle_create(
				Number(params.groupId),
				Number(params.examId),
				Number(params.problemId),
				userId,
				newCode,
				language
			)
			await code_log_api.code_log_create(Number(data.solve_id), userId, newCodeLogs, newTimeStamps)
			ai_feeedback_api.get_ai_feedback(Number(data.solve_id)).catch((err) => {
				console.error("AI 피드백 호출 실패:", err)
			})
			console.log("제출 성공:", newCodeLogs, newTimeStamps)
			setCodeLogs([])
			setTimeStamps([])

			// 제출 후 해당 문제의 모든 언어 코드 삭제
			Object.keys(localStorage).forEach((key) => {
				if (key.startsWith("aprofi_code_") && key.endsWith(`_${params.problemId}`)) {
					localStorage.removeItem(key)
				}
			})

			router.push(`/mygroups/${groupId}/exams/${params.examId}/problems/${params.problemId}/result/${data.solve_id}`)
		} catch (err) {
			alert(`❌ 제출 오류: ${err instanceof Error ? err.message : String(err)}`)
		} finally {
			setLoading(false)
		}
	}

	// 테스트케이스 실행 관련 상태 (중복 선언 방지)
	const [testCases, setTestCases] = useState<{ input: string; output: string }[]>([{ input: "", output: "" }])
	const [runResults, setRunResults] = useState<{ input: string; expected: string; output: string; passed: boolean }[]>(
		[]
	)
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
		if (!code.trim()) {
			alert("코드를 입력해주세요.")
			return
		}

		if (testCases.length === 0) {
			alert("테스트케이스를 추가해주세요.")
			return
		}

		setIsTestRunning(true)
		setRunResults([])
		try {
			const data = await run_code_api.run_code(
				language,
				code,
				testCases.map((tc) => ({ input: tc.input, output: tc.output }))
			)
			console.log("run_code_api 반환값:", data)

			// API 응답 구조에 맞게 결과 매핑
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

	if (!problem) return <div>로딩 중...</div>

	return !problem ? (
		<div className="flex items-center gap-2 justify-end"></div>
	) : (
		<>
			<motion.div
				className="flex items-center gap-2 justify-end"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.2 }}
			>
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
						{problemConditions && problemConditions.length > 0 && (
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

								{/* 🔧 임시 알림 - 백엔드 개발 완료 시 제거 */}
								<div className="mt-3 pt-3 border-t border-gray-200">
									<p className="text-xs text-gray-500 italic">
										💡 현재는 샘플 조건이 표시됩니다. 백엔드 개발 완료 후 실제 등록된 조건이 표시됩니다.
									</p>
								</div>
							</motion.div>
						)}

						{/* 🔧 디버깅용 백엔드 상태 알림 - 개발 완료 후 제거 */}
						<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
							<h3 className="text-sm font-bold mb-2 text-blue-800">📋 문제 조건 기능 개발 상태</h3>
							<div className="text-xs text-blue-700">
								<p>• 프론트엔드: ✅ 완료 (조건 표시 UI 구현됨)</p>
								<p>• 백엔드: ❌ 개발 필요 (problems 테이블에 conditions 필드 추가 필요)</p>
								<p>• 현재 표시: 임시 샘플 조건 ({problemConditions?.length || 0}개)</p>
								<p>• 참고: 평가 기준은 문제 풀이 페이지에서 표시하지 않음</p>
							</div>
						</div>
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
						<div className="flex items-center mb-2 max-w-full overflow-hidden">
							<h2 className="text-lg font-semibold flex-shrink-0 mr-2">나의 코드</h2>
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
									automaticLayout: false, // 자동 레이아웃 비활성화로 성능 개선
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
							className="bg-white rounded-xl shadow-lg mt-4 overflow-hidden max-w-full"
							style={{ maxHeight: "calc(50vh - 100px)" }}
						>
							{/* 실행하기 버튼 */}
							<div className="flex items-center p-3 border-b max-w-full overflow-hidden">
								<div className="font-bold text-sm mr-2 flex-shrink-0">테스트케이스</div>
								<button
									onClick={handleTestRun}
									disabled={isTestRunning}
									className={`flex items-center ${
										isTestRunning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
													<button
														onClick={() => removeTestCase(index)}
														className="px-1 py-0.5 bg-red-200 hover:bg-red-300 text-red-700 rounded text-xs"
													>
														×
													</button>
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
										className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
									>
										+ 추가
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}
