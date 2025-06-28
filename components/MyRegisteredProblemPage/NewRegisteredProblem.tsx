"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { motion } from "framer-motion"
import { problem_api, run_code_api, EnhancedProblemCreateRequest } from "@/lib/api"
import Toolbar from "../markdown/Toolbar"
import { ResizableTable } from "../markdown/ResizableTable"
import TableCellExtension from "../markdown/TableCellExtension"
import dynamic from "next/dynamic"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
})

// 타입 정의
interface ReferenceCode {
	language: "python" | "java" | "cpp" | "c" | "javascript"
	code: string
	is_main: boolean
}

interface TestCase {
	input: string
	expected_output: string
	is_sample: boolean
}

interface RunResult {
	test_case_index: number
	status: "success" | "error" | "timeout"
	output: string
	error: string
	execution_time: number
	memory_usage: number
	passed: boolean
}

// API 응답 타입 정의
interface ApiResult {
	success: boolean
	output?: string
	actual_output?: string
	error?: string
	execution_time?: number
	memory_usage?: number
	passed?: boolean
}

export default function NewRegisteredProblem() {
	const router = useRouter()
	const [title, setTitle] = useState("")

	// 기존 inputs를 testCases로 변경
	const [testCases, setTestCases] = useState<TestCase[]>([{ input: "", expected_output: "", is_sample: true }])

	// Reference codes 상태 추가
	const [referenceCodes, setReferenceCodes] = useState<ReferenceCode[]>([
		{ language: "python", code: "", is_main: true },
	])

	const [conditions, setConditions] = useState([""])
	const [evaluationCriteria, setEvaluationCriteria] = useState("Hard")

	// 테스트 실행 관련 상태
	const [runResults, setRunResults] = useState<RunResult[]>([])
	const [isTestRunning, setIsTestRunning] = useState(false)

	// 현재 선택된 코드 탭
	const [activeCodeTab, setActiveCodeTab] = useState(0)

	// 언어별 디폴트 코드 템플릿
	const defaultTemplates: { [lang: string]: string } = {
		python: "# Python 코드를 작성하세요\n",
		c: "#include<stdio.h>\n\nint main() {\n    return 0;\n}",
		cpp: "#include<iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}",
		java: "public class Main {\n    public static void main(String[] args) {\n    }\n}",
		javascript: "// JavaScript 코드를 작성하세요\n",
	}

	const languageDisplayNames = {
		python: "Python",
		java: "Java",
		cpp: "C++",
		c: "C",
		javascript: "JavaScript",
	}

	const editor = useEditor({
		extensions: [
			StarterKit,
			Heading.configure({ levels: [1, 2, 3] }),
			BulletList,
			OrderedList,
			Highlight.configure({ multicolor: true }),
			Image,
			ResizableTable,
			TableRow,
			TableHeader,
			TableCellExtension,
		],
		content: " ",
	})

	if (!editor) return null

	// 로컬 이미지를 Base64 URL로 변환하여 삽입
	const addLocalImage = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = () => {
				const base64Image = reader.result as string
				editor.chain().focus().setImage({ src: base64Image }).run()
			}
			reader.readAsDataURL(file)
		}
	}

	// 새 참조 코드 탭 추가
	const addReferenceCode = () => {
		const newCode: ReferenceCode = {
			language: "python",
			code: defaultTemplates.python,
			is_main: referenceCodes.length === 0,
		}
		setReferenceCodes([...referenceCodes, newCode])
		setActiveCodeTab(referenceCodes.length)
	}

	// 참조 코드 삭제
	const removeReferenceCode = (index: number) => {
		if (referenceCodes.length <= 1) {
			alert("최소 하나의 참조 코드는 필요합니다.")
			return
		}

		const newCodes = referenceCodes.filter((_, i) => i !== index)
		// 삭제된 코드가 메인이었다면 첫 번째 코드를 메인으로 설정
		if (referenceCodes[index].is_main && newCodes.length > 0) {
			newCodes[0].is_main = true
		}

		setReferenceCodes(newCodes)
		setActiveCodeTab(Math.min(activeCodeTab, newCodes.length - 1))
	}

	// 참조 코드 언어 변경
	const updateReferenceCodeLanguage = (index: number, language: ReferenceCode["language"]) => {
		const newCodes = [...referenceCodes]
		newCodes[index].language = language
		newCodes[index].code = defaultTemplates[language] || ""
		setReferenceCodes(newCodes)
	}

	// 참조 코드 내용 변경
	const updateReferenceCode = (index: number, code: string) => {
		const newCodes = [...referenceCodes]
		newCodes[index].code = code
		setReferenceCodes(newCodes)
	}

	// 메인 코드 설정
	const setMainReferenceCode = (index: number) => {
		const newCodes = referenceCodes.map((code, i) => ({
			...code,
			is_main: i === index,
		}))
		setReferenceCodes(newCodes)
	}

	// 테스트 케이스 추가
	const addTestCase = () => {
		setTestCases([...testCases, { input: "", expected_output: "", is_sample: false }])
	}

	// 테스트 케이스 삭제
	const removeTestCase = (index: number) => {
		if (testCases.length <= 1) {
			alert("최소 하나의 테스트 케이스는 필요합니다.")
			return
		}
		setTestCases(testCases.filter((_, i) => i !== index))
	}

	// 테스트 케이스 업데이트
	const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
		const newTestCases = [...testCases]
		newTestCases[index] = { ...newTestCases[index], [field]: value }
		setTestCases(newTestCases)
	}

	// 현재 활성 코드로 테스트 실행
	const handleTestRun = async () => {
		const currentCode = referenceCodes[activeCodeTab]

		if (!currentCode?.code.trim()) {
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
			// 기존 run_code_api 사용 (새 API가 구현되기 전까지)
			const data = await run_code_api.run_code(
				currentCode.language,
				currentCode.code,
				testCases.map((tc) => ({ input: tc.input, output: tc.expected_output }))
			)

			// API 응답을 RunResult 형식으로 변환
			const results: RunResult[] =
				data.results?.map((result: ApiResult, index: number) => ({
					test_case_index: index,
					status: result.success ? "success" : "error",
					output: result.output || result.actual_output || "",
					error: result.error || "",
					execution_time: result.execution_time || 0,
					memory_usage: result.memory_usage || 0,
					passed: result.passed || result.success || false,
				})) || []

			setRunResults(results)
		} catch (err) {
			console.error("테스트 실행 에러:", err)
			setRunResults([])
			alert(`테스트 실행 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`)
		} finally {
			setIsTestRunning(false)
		}
	}

	// 문제 등록
	const handleSubmitButtonClick = async () => {
		if (title.trim() === "") {
			alert("제목을 입력해주세요")
			return
		}

		if (!editor) {
			alert("에디터가 로드되지 않았습니다.")
			return
		}

		const content = editor.getHTML()
		const filteredConditions = conditions.filter((condition) => condition.trim() !== "")

		// 새로운 API 형식에 맞게 데이터 구성
		const requestData: EnhancedProblemCreateRequest = {
			title,
			description: content,
			difficulty: "easy", // 기본값 설정
			rating_mode: evaluationCriteria as "Hard" | "Space" | "Regex",
			tags: [], // 기본 빈 배열
			problem_condition: filteredConditions,
			reference_codes: referenceCodes,
			test_cases: testCases,
		}

		console.log("📝 저장할 문제 데이터:", requestData)

		try {
			// 새로운 API 사용
			await problem_api.problem_create(
				requestData.title,
				requestData.description,
				requestData.difficulty,
				requestData.rating_mode,
				requestData.tags,
				requestData.problem_condition,
				requestData.reference_codes,
				requestData.test_cases
			)

			console.log("✅ 문제 등록 성공!")
			router.back()
		} catch (error: unknown) {
			console.error("❌ 문제 등록 실패:", error)
			const errorMessage = error instanceof Error ? error.message : String(error)
			alert(`문제 등록 중 오류가 발생했습니다: ${errorMessage}`)
		}
	}

	return (
		<div>
			<motion.div
				className="flex items-center gap-2 justify-end mb-6"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				<button
					onClick={handleSubmitButtonClick}
					className="flex items-center bg-gray-800 text-white px-6 py-1 rounded-lg m-2 text-sm cursor-pointer
          hover:bg-gray-500 transition-all duration-200 ease-in-out
          active:scale-95"
				>
					🚀 등록하기
				</button>
			</motion.div>

			{/* 문제 기본 정보 */}
			<div className="mb-6">
				<h2 className="text-lg font-bold mb-2">문제 기본 정보</h2>
				<div className="border-t border-gray-300 my-3"></div>

				{/* 문제 제목만 */}
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="문제 제목"
					className="w-full px-3 py-1.5 border rounded-md mb-3 text-sm"
				/>
			</div>

			{/* 전체 좌우 분할 레이아웃 */}
			<div className="flex gap-4 w-full mb-6">
				{/* 왼쪽: 문제 설명 */}
				<div className="w-1/2">
					<h2 className="text-lg font-bold mb-2">문제 설명</h2>
					<div className="border-t border-gray-300 my-3"></div>

					<div className="w-full">
						<div className="border rounded-md bg-white h-[375px] flex flex-col">
							<Toolbar editor={editor} addLocalImage={addLocalImage} />
							<EditorContent editor={editor} className="flex-1 p-3 text-black overflow-y-auto rounded-b-md text-sm" />
						</div>
					</div>
				</div>

				{/* 오른쪽: 참조 코드 에디터 */}
				<div className="w-1/2 flex flex-col">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-lg font-semibold">참조 코드</h3>
						<button
							onClick={addReferenceCode}
							className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 text-xs"
						>
							+ 코드 추가
						</button>
					</div>
					<div className="border-b-2 border-black my-2"></div>

					{/* 코드 탭 */}
					<div className="flex gap-1 mb-2 overflow-x-auto">
						{referenceCodes.map((refCode, index) => (
							<div key={index} className="flex items-center shrink-0">
								<div
									className={`px-2 py-1 rounded-t-md text-xs flex items-center gap-2 ${
										activeCodeTab === index ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
									}`}
								>
									<button onClick={() => setActiveCodeTab(index)} className="flex items-center gap-2">
										{languageDisplayNames[refCode.language]}
									</button>
									{referenceCodes.length > 1 && (
										<button
											onClick={() => removeReferenceCode(index)}
											className={`text-xs hover:bg-opacity-20 hover:bg-white rounded px-1 ${
												activeCodeTab === index ? "text-white" : "text-gray-600"
											}`}
										>
											×
										</button>
									)}
								</div>
							</div>
						))}
					</div>

					{/* 현재 활성 코드의 설정 */}
					{referenceCodes[activeCodeTab] && (
						<div className="flex items-center gap-2 mb-2">
							<select
								value={referenceCodes[activeCodeTab].language}
								onChange={(e) =>
									updateReferenceCodeLanguage(activeCodeTab, e.target.value as ReferenceCode["language"])
								}
								className="border rounded-md p-1 text-xs"
							>
								<option value="python">Python</option>
								<option value="java">Java</option>
								<option value="cpp">C++</option>
								<option value="c">C</option>
								<option value="javascript">JavaScript</option>
							</select>

							{!referenceCodes[activeCodeTab].is_main && (
								<button
									onClick={() => setMainReferenceCode(activeCodeTab)}
									className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600"
								>
									메인으로 설정
								</button>
							)}
						</div>
					)}

					{/* 코드 에디터 */}
					<div className="bg-white p-0 rounded shadow flex-1">
						{referenceCodes[activeCodeTab] && (
							<MonacoEditor
								height="100%"
								width="100%"
								language={
									referenceCodes[activeCodeTab].language === "cpp" ? "cpp" : referenceCodes[activeCodeTab].language
								}
								value={referenceCodes[activeCodeTab].code}
								onChange={(value) => updateReferenceCode(activeCodeTab, value ?? "")}
								options={{
									minimap: { enabled: false },
									scrollBeyondLastLine: false,
									fontSize: 12,
									lineNumbers: "on",
									roundedSelection: false,
									contextmenu: false,
									automaticLayout: true,
									copyWithSyntaxHighlighting: false,
									scrollbar: {
										vertical: "visible",
										horizontal: "visible",
									},
									padding: { top: 8, bottom: 8 },
								}}
							/>
						)}
					</div>
				</div>
			</div>

			{/* 문제 조건 & 평가 기준 섹션 */}
			<div className="mb-6 flex gap-4">
				{/* 왼쪽: 문제 조건 */}
				<div className="flex-1">
					<h2 className="text-lg font-bold mb-2">문제 조건</h2>
					<div className="border-t border-gray-300 my-3"></div>
					<div className="bg-white shadow-md rounded-xl p-3">
						{conditions.map((condition, index) => (
							<div key={index} className="flex items-center gap-2 mb-2">
								<span className="text-sm font-semibold text-gray-700 min-w-[20px]">{index + 1}.</span>
								<textarea
									rows={1}
									value={condition}
									onChange={(e) => {
										const newConditions = [...conditions]
										newConditions[index] = e.target.value
										setConditions(newConditions)
									}}
									onInput={(e) => {
										const ta = e.currentTarget
										ta.style.height = "auto"
										ta.style.height = `${ta.scrollHeight}px`
									}}
									placeholder="조건을 입력하세요"
									className="flex-1 px-2 py-1 border border-gray-300 rounded-lg resize-none overflow-hidden text-sm"
								/>
								<button
									onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
									className="px-2 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded-lg text-xs transition-colors"
								>
									삭제
								</button>
							</div>
						))}

						<div className="mt-3">
							<button
								onClick={() => setConditions([...conditions, ""])}
								className="bg-green-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors text-sm"
							>
								+ 조건 추가
							</button>
						</div>
					</div>
				</div>

				{/* 오른쪽: 평가 기준 */}
				<div className="w-1/3">
					<h2 className="text-lg font-bold mb-2">평가 기준</h2>
					<div className="border-t border-gray-300 my-3"></div>
					<div className="bg-white shadow-md rounded-xl p-3">
						<div className="space-y-2">
							{["Hard", "Space", "Regex"].map((criteria) => (
								<label key={criteria} className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="evaluationCriteria"
										value={criteria}
										checked={evaluationCriteria === criteria}
										onChange={(e) => setEvaluationCriteria(e.target.value)}
										className="w-3 h-3 text-blue-600"
									/>
									<span className="text-sm">{criteria}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* 테스트 케이스 섹션 */}
			<div>
				<h2 className="text-lg font-bold mb-2">테스트 케이스</h2>
				<div className="border-t border-gray-300 my-3"></div>
				<div className="bg-white shadow-md rounded-xl p-3">
					{/* 실행하기 버튼 */}
					<div className="flex items-center mb-3">
						<div className="font-bold text-sm mr-3">테스트케이스 실행</div>
						<button
							onClick={handleTestRun}
							disabled={isTestRunning}
							className={`flex items-center ${
								isTestRunning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
							} text-white px-4 py-1 rounded-lg text-sm transition-colors`}
							style={{ minWidth: 80 }}
						>
							{isTestRunning ? "실행 중..." : "실행하기"}
						</button>
					</div>

					<div className="space-y-3">
						{testCases.map((testCase, index) => (
							<div
								key={index}
								className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
									runResults[index]?.passed === true
										? "border-green-300 bg-green-50"
										: runResults[index]?.passed === false
										? "border-red-300 bg-red-50"
										: "border-gray-200"
								}`}
							>
								{/* 번호 */}
								<div className="flex-shrink-0 w-6 text-center">
									<span className="text-sm font-semibold text-gray-700">{index + 1}</span>
								</div>

								{/* 입력값 */}
								<div className="flex-1">
									<label className="block text-xs font-medium text-gray-700 mb-1">입력값</label>
									<textarea
										rows={1}
										value={testCase.input}
										onChange={(e) => updateTestCase(index, "input", e.target.value)}
										onInput={(e) => {
											const ta = e.currentTarget
											ta.style.height = "auto"
											ta.style.height = `${ta.scrollHeight}px`
										}}
										placeholder="입력값을 입력하세요"
										className="w-full px-2 py-1 border border-gray-300 rounded-lg resize-none overflow-hidden font-mono text-sm"
									/>
								</div>

								{/* 예상 출력값 */}
								<div className="flex-1">
									<label className="block text-xs font-medium text-gray-700 mb-1">예상 출력</label>
									<textarea
										rows={1}
										value={testCase.expected_output}
										onChange={(e) => updateTestCase(index, "expected_output", e.target.value)}
										onInput={(e) => {
											const ta = e.currentTarget
											ta.style.height = "auto"
											ta.style.height = `${ta.scrollHeight}px`
										}}
										placeholder="예상 출력값을 입력하세요"
										className="w-full px-2 py-1 border border-gray-300 rounded-lg resize-none overflow-hidden font-mono text-sm"
									/>
								</div>

								{/* 실제 출력값 */}
								<div className="flex-1">
									<label className="block text-xs font-medium text-gray-700 mb-1">실제 출력</label>
									<div className="w-full px-2 py-1 border border-gray-200 rounded-lg bg-gray-50 font-mono min-h-[32px] flex items-start text-sm">
										{runResults[index] ? (
											<div className="w-full">
												<div className="whitespace-pre-wrap text-xs">{runResults[index].output}</div>
												{runResults[index].error && (
													<div className="text-red-600 text-xs mt-1">오류: {runResults[index].error}</div>
												)}
												<div className="text-xs text-gray-500 mt-1">
													실행시간: {runResults[index].execution_time}ms | 메모리: {runResults[index].memory_usage}MB
												</div>
											</div>
										) : (
											<span className="text-gray-400">-</span>
										)}
									</div>
								</div>

								{/* 결과 */}
								<div className="flex-shrink-0 w-12 text-center">
									<label className="block text-xs font-medium text-gray-700 mb-1">결과</label>
									<div className="text-lg mt-1">
										{runResults[index]?.passed === true ? (
											<span className="text-green-600">✔</span>
										) : runResults[index]?.passed === false ? (
											<span className="text-red-600">✗</span>
										) : (
											<span className="text-gray-500">-</span>
										)}
									</div>
								</div>

								{/* 샘플 여부 */}
								<div className="flex-shrink-0 w-16">
									<label className="block text-xs font-medium text-gray-700 mb-1">샘플</label>
									<input
										type="checkbox"
										checked={testCase.is_sample}
										onChange={(e) => updateTestCase(index, "is_sample", e.target.checked)}
										className="w-3 h-3 mt-2"
									/>
								</div>

								{/* 삭제 버튼 */}
								<div className="flex-shrink-0">
									<label className="block text-xs font-medium text-gray-700 mb-1">&nbsp;</label>
									<button
										onClick={() => removeTestCase(index)}
										className="px-2 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded-lg text-xs transition-colors"
									>
										삭제
									</button>
								</div>
							</div>
						))}
					</div>

					{/* 추가 버튼 */}
					<div className="mt-4">
						<button
							onClick={addTestCase}
							className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition-colors text-sm"
						>
							+ 테스트 케이스 추가
						</button>
					</div>
					<div className="pb-20"></div>
				</div>
				<div className="pb-15"></div>
			</div>

			{/* 스타일 - 테일윈드로 대체 */}
			<style jsx>{`
				.ProseMirror {
					outline: none !important;
					min-height: 120px !important;
					padding: 10px !important;
					font-size: 14px !important;
				}

				.ProseMirror h1 {
					font-size: 1.5rem !important;
					font-weight: bold !important;
					margin-top: 0.75rem !important;
					margin-bottom: 0.75rem !important;
				}

				.ProseMirror h2 {
					font-size: 1.25rem !important;
					font-weight: bold !important;
					margin-top: 0.75rem !important;
					margin-bottom: 0.75rem !important;
				}

				.ProseMirror h3 {
					font-size: 1.125rem !important;
					font-weight: bold !important;
					margin-top: 0.75rem !important;
					margin-bottom: 0.75rem !important;
				}

				.ProseMirror ul {
					list-style-type: disc !important;
					margin-left: 1.25rem !important;
				}

				.ProseMirror ol {
					list-style-type: decimal !important;
					margin-left: 1.25rem !important;
				}

				.ProseMirror li {
					margin-bottom: 0.375rem !important;
				}

				.ProseMirror table {
					width: 100% !important;
					border-collapse: collapse !important;
					margin-top: 8px !important;
					border: 1px solid #ccc !important;
				}

				.ProseMirror th,
				.ProseMirror td {
					border: 1px solid #ddd !important;
					padding: 6px !important;
					text-align: left !important;
					font-size: 12px !important;
				}

				.ProseMirror th {
					background-color: #f4f4f4 !important;
					font-weight: bold !important;
				}

				.toolbar-icon {
					display: flex !important;
					align-items: center !important;
					justify-content: center !important;
					padding: 4px !important;
					cursor: pointer !important;
					background: none !important;
					border: none !important;
					transition: color 0.1s ease-in-out !important;
				}

				.toolbar-icon:hover {
					transform: scale(1.1) !important;
				}

				.highlight-btn {
					width: 20px !important;
					height: 20px !important;
					border-radius: 3px !important;
					cursor: pointer !important;
					transition: transform 0.1s ease-in-out !important;
				}

				.highlight-btn:hover {
					transform: scale(1.1) !important;
				}
			`}</style>
		</div>
	)
}
