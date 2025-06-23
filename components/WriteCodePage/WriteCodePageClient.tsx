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
			console.log("문제 API 응답:", res)
			setProblem(res)
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
		setIsTestRunning(true)
		setRunResults([])
		try {
			const data = await run_code_api.run_code(
				language,
				code,
				testCases.map((tc) => ({ input: tc.input, output: tc.output }))
			)
			console.log("run_code_api 반환값:", data)
			setRunResults(data.results ?? [])
		} catch (err) {
			console.error("run_code_api 에러:", err)
			setRunResults([])
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

	useEffect(() => {
		console.log("testCases 상태 변화:", testCases)
	}, [testCases])

	// **리사이즈 구현**
	const containerRef = useRef<HTMLDivElement>(null)
	const isResizing = useRef(false)
	const [leftWidth, setLeftWidth] = useState<number>(300)

	const onMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		isResizing.current = true
	}

	const onMouseMove = useCallback((e: MouseEvent) => {
		if (!isResizing.current || !containerRef.current) return
		const rect = containerRef.current.getBoundingClientRect()
		let newWidth = e.clientX - rect.left
		newWidth = Math.max(150, Math.min(newWidth, rect.width - 150))
		setLeftWidth(newWidth)
	}, [])

	const onMouseUp = useCallback(() => {
		isResizing.current = false
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
		<div className="flex items-center gap-2 justify-end">
			{/* <h1 className="text-2xl font-bold">문제를 가져오는 중입니다. </h1> */}
			{/* <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p> */}
		</div>
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
				className="flex flex-1 gap-x-2 mt-3 w-full
              min-h-[75vh] sm:min-h-[70vh] md:min-h-[70vh] lg:min-h-[70vh]
              pb-20"
			>
				{/* 문제 설명 영역 (왼쪽) */}
				<AnimatePresence>
					<motion.div
						layout
						initial={{ flex: 0, opacity: 0 }}
						animate={{ flex: 2, opacity: 1 }}
						exit={{ flex: 0, opacity: 0 }}
						transition={{ type: "spring", stiffness: 100 }}
						className="overflow-hidden border-r-2 pr-4"
						style={{ flex: 2, minWidth: 0 }}
					>
						<div className="sticky top-0z-10 pb-4">
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
								{problem.title.length > 20 ? `${problem.title.slice(0, 20)}...` : problem.title}
							</h1>
							<hr className="border-t-2 border-gray-400" />
						</div>
						<div className="overflow-y-auto max-h-[calc(100%-120px)] p-2 pr-2">
							<div className="editor-content" dangerouslySetInnerHTML={{ __html: problem.description }} />
						</div>
					</motion.div>
				</AnimatePresence>
				{/* 드래그 핸들 */}
				<div onMouseDown={onMouseDown} className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400" />

				<div className="flex-1 flex flex-col p-4">
					{/* 코드 에디터 */}
					{/* …MonacoEditor 부분 그대로… */}

					{/* 테스트케이스 실행 UI */}
					{/* …위에서 만든 가로/세로 스크롤 영역 그대로… */}
					{/* 코드 에디터 영역 (오른쪽) */}
					<div className="flex-1 flex-col min-w-0 transition-all duration-300" style={{ flex: 5, minWidth: 0 }}>
						<div className="flex justify-between items-center mb-2">
							<h2 className="text-lg font-semibold">나의 코드</h2>
							<select value={language} onChange={handleLanguageChange} className="border rounded-lg p-2">
								<option value="python">Python</option>
								<option value="c">C</option>
								<option value="cpp">C++</option>
								<option value="java">Java</option>
							</select>
						</div>
						<div className="border-b-2 border-black my-2"></div>

						<div className="bg-white p-0 rounded shadow">
							<MonacoEditor
								key={`${solveId || "default"}-${language}`}
								height="50vh"
								width="100%"
								language={language}
								value={code ?? ""}
								onChange={(value) => setCode(value ?? "")}
								options={{
									minimap: { enabled: false },
									scrollBeyondLastLine: false,
									fontSize: 20,
									lineNumbers: "off",
									roundedSelection: false,
									contextmenu: false,
									automaticLayout: true,
									copyWithSyntaxHighlighting: false,
									scrollbar: {
										vertical: "visible",
										horizontal: "visible",
									},
									padding: { top: 10, bottom: 10 },
								}}
								onMount={(editor, monaco) => {
									editorRef.current = editor
									editor.onKeyDown((event) => {
										if (event.keyCode === monaco.KeyCode.Enter) {
											// setCode는 하지 않고, 로그만 남김
											const newCode = editor.getValue()
											setCodeLogs((prevLogs) => [...prevLogs, newCode])
											setTimeStamps((prev) => [...prev, new Date().toISOString()])
										}
									})
								}}
							/>
						</div>

						{/* 📌 테스트케이스 실행 UI */}
						<div className="w-full bg-white rounded-xl shadow-lg p-6 min-h-[220px] mt-6 mb-6">
							<div className="flex items-center mb-2">
								<div className="font-bold text-lg mr-4">테스트케이스 실행</div>
								<motion.button
									onClick={handleTestRun}
									disabled={isTestRunning}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className={`flex items-center ${
										isTestRunning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
									} text-white px-6 py-1.5 rounded-xl text-md ml-2`}
									style={{ minWidth: 100 }}
								>
									{isTestRunning ? "실행 중..." : "실행하기"}
								</motion.button>
							</div>

							{/* 가로 스크롤 + 그라데이션 표시 */}
							<div className="relative mt-6">
								<div className="overflow-x-auto overflow-y-hidden">
									<table className="min-w-[800px] w-full table-auto text-center border text-lg whitespace-nowrap">
										<thead className="bg-gray-100">
											<tr>
												<th className="px-4 py-2">입력값</th>
												<th className="px-4 py-2">예상 출력</th>
												<th className="px-4 py-2">실제 출력</th>
												<th className="px-4 py-2">결과</th>
												<th className="px-4 py-2">삭제</th>
											</tr>
										</thead>
										<tbody>
											{testCases.map((tc, idx) => (
												<tr
													key={idx}
													className={
														runResults[idx]?.passed === true
															? "bg-green-50"
															: runResults[idx]?.passed === false
															? "bg-red-50"
															: "bg-gray-100"
													}
												>
													<td className="border px-4 py-2 font-mono whitespace-pre-wrap">
														<textarea
															rows={1}
															value={tc.input}
															onChange={(e) => handleTestCaseChange(idx, "input", e.target.value)}
															onInput={(e) => {
																const ta = e.currentTarget
																ta.style.height = "auto"
																ta.style.height = `${ta.scrollHeight}px`
															}}
															placeholder="입력값"
															className="border rounded p-2 w-full overflow-hidden"
														/>
													</td>
													<td className="border px-4 py-2 font-mono whitespace-pre">
														<textarea
															rows={1}
															value={tc.output}
															onChange={(e) => handleTestCaseChange(idx, "output", e.target.value)}
															onInput={(e) => {
																const ta = e.currentTarget
																ta.style.height = "auto"
																ta.style.height = `${ta.scrollHeight}px`
															}}
															placeholder="예상 출력값"
															className="border rounded p-2 w-full overflow-hidden"
														/>
													</td>
													<td className="border px-4 py-2 font-mono whitespace-pre">
														{runResults[idx]?.output ?? <span className="text-gray-400">-</span>}
													</td>
													<td className="border px-4 py-2 text-2xl">
														{runResults[idx]?.passed === true ? (
															<span className="text-green-600">✔</span>
														) : runResults[idx]?.passed === false ? (
															<span className="text-red-600">✗</span>
														) : (
															<span className="text-gray-500">-</span>
														)}
													</td>
													<td className="border px-4 py-2">
														<button
															onClick={() => removeTestCase(idx)}
															className="px-3 py-2 bg-red-200 rounded text-base"
														>
															삭제
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{/* 오른쪽 스크롤 가능 표시용 그라데이션 */}
								<div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
							</div>

							<button onClick={addTestCase} className="px-4 py-2 bg-gray-200 rounded mt-4 text-base cursor-pointer">
								테스트케이스 추가
							</button>
						</div>
					</div>
				</div>
			</main>

			{/* ✅ 테이블 테두리 강제 적용 */}
			<style>
				{`
          .editor-content h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
          .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }

         /* ✅ 전체 테이블 스타일 */
.editor-content table {
  width: 100%;
  border-collapse: collapse !important; /* ✅ 테두리 겹침 방지 */
  border-spacing: 0 !important; /* ✅ 셀 간격 제거 */
  margin-top: 10px !important;
  border: 2px solid #d4d4d4 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  background-color: #f9f9f9 !important;
}

/* ✅ 헤더 스타일 */
.editor-content th {
  background-color: #f1f1f1 !important;
  font-weight: 600 !important;
  text-align: center !important;
  color: #333 !important;
  padding: 14px !important;
  border-bottom: 1.5px solid #d4d4d4 !important;
  border-right: 1px solid #d4d4d4 !important; /* ✅ 오른쪽 테두리 조정 */
}

/* ✅ 내부 셀 스타일 */
.editor-content td {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  padding: 12px !important;
  text-align: left !important;
  font-size: 1rem !important;
  color: #444 !important;
  transition: background 0.2s ease-in-out !important;
  border-radius: 0 !important;
}

/* ✅ 강조된 셀 (제목 스타일) */
.editor-content td[data-header="true"] {
  background-color: #e7e7e7 !important;
  font-weight: bold !important;
  text-align: center !important;
  color: #222 !important;
}

/* ✅ 마우스 오버 효과 */
.editor-content td:hover {
  background-color: #f5f5f5 !important;
}

/* ✅ 테이블 전체 둥글게 조정 */
.editor-content tr:first-child th:first-child {
  border-top-left-radius: 12px !important;
}
.editor-content tr:first-child th:last-child {
  border-top-right-radius: 12px !important;
}
.editor-content tr:last-child td:first-child {
  border-bottom-left-radius: 12px !important;
}
.editor-content tr:last-child td:last-child {
  border-bottom-right-radius: 12px !important;
}

.cmd-window {
  background: #181818;
  color: #d4d4d4;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Fira Mono', 'Consolas', monospace;
  margin-top: 16px;
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
}
.cmd-input-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.cmd-input-row input {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 4px;
  margin-left: 8px;
  padding: 4px 8px;
  flex: 1;
}
.cmd-output {
  white-space: pre-wrap;
  color: #a6e22e;
}

.text-gray-400 {
  pointer-events: none; /* 이 클래스를 가진 요소는 클릭 이벤트를 막지 않음 */
}
        
        `}
			</style>
		</>
	)
}
