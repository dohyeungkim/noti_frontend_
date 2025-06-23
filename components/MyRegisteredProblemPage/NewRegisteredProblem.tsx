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
import { problem_api, run_code_api } from "@/lib/api"
import Toolbar from "../markdown/Toolbar"
import { ResizableTable } from "../markdown/ResizableTable"
import TableCellExtension from "../markdown/TableCellExtension"
import dynamic from "next/dynamic"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
})

export default function NewRegisteredProblem() {
	const router = useRouter()
	const [title, setTitle] = useState("")
	const [inputs, setInputs] = useState([{ input: "", output: "", isPublic: false }])
	const [conditions, setConditions] = useState([""])
	const [evaluationCriteria, setEvaluationCriteria] = useState("Regex")

	// 테스트 실행 관련 상태
	const [runResults, setRunResults] = useState<{ input: string; expected: string; output: string; passed: boolean }[]>(
		[]
	)
	const [isTestRunning, setIsTestRunning] = useState(false)

	// 코드 에디터 관련 상태
	const [language, setLanguage] = useState("python")
	const [code, setCode] = useState("")

	// 언어별 디폴트 코드 템플릿
	const defaultTemplates: { [lang: string]: string } = {
		python: "",
		c: "#include<stdio.h>\n\nint main() {\n    return 0;\n}",
		cpp: "#include<iostream>\n\nint main() {\n    return 0;\n}",
		java: "public class Main {\n    public static void main(String[] args) {\n    }\n}",
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

	// ✅ 로컬 이미지를 Base64 URL로 변환하여 삽입
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

	// 언어 변경 핸들러
	const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newLang = e.target.value
		setLanguage(newLang)
		setCode(defaultTemplates[newLang] || "")
	}

	// 테스트 실행 핸들러
	const handleTestRun = async () => {
		if (!code.trim()) {
			alert("코드를 입력해주세요.")
			return
		}

		if (inputs.length === 0) {
			alert("테스트케이스를 추가해주세요.")
			return
		}

		setIsTestRunning(true)
		setRunResults([])

		try {
			// run_code_api를 사용하여 실제 코드 실행
			const testCases = inputs.map((testCase) => ({
				input: testCase.input,
				output: testCase.output,
			}))

			const data = await run_code_api.run_code(language, code, testCases)

			// API 응답 구조에 맞게 결과 매핑
			const results =
				data.results?.map((result: any, index: number) => ({
					input: inputs[index].input,
					expected: inputs[index].output,
					output: result.output || result.actual_output || "",
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

		// 빈 조건들 필터링
		const filteredConditions = conditions.filter((condition) => condition.trim() !== "")

		console.log("📝 저장할 문제 설명:", content)
		console.log("💻 저장할 코드:", code)
		console.log("🔤 선택된 언어:", language)
		console.log("📋 문제 조건:", filteredConditions)
		console.log("⚖️ 평가 기준:", evaluationCriteria)
		console.log("🧪 입출력 예제:", inputs)

		try {
			// API 호출 시 조건과 평가 기준 포함
			await problem_api.problem_create(
				title,
				content,
				"", // input_description (현재 사용하지 않음)
				"", // output_description (현재 사용하지 않음)
				inputs.map((input) => ({ input: input.input, output: input.output })),
				filteredConditions, // 조건 추가
				evaluationCriteria // 평가 기준 추가
			)

			console.log("✅ 문제 등록 성공!")
			router.back()
		} catch (error: unknown) {
			console.error("❌ 문제 등록 실패:", error)

			// TypeScript에서 안전하게 error 처리
			const errorMessage = error instanceof Error ? error.message : String(error)
			console.error("❌ 에러 상세:", errorMessage)

			// 네트워크 에러와 백엔드 에러 구분
			if (errorMessage.includes("문제 생성 실패")) {
				alert("백엔드에서 문제 처리 중 오류가 발생했습니다. 백엔드 로그를 확인해주세요.")
			} else {
				alert(`문제 등록 중 오류가 발생했습니다: ${errorMessage}`)
			}
		}
	}

	return (
		<div>
			<motion.div
				className="flex items-center gap-2 justify-end mb-8"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				<button
					onClick={handleSubmitButtonClick}
					className="flex items-center bg-gray-800 text-white px-8 py-1.5 rounded-xl m-2 text-md cursor-pointer
          hover:bg-gray-500 transition-all duration-200 ease-in-out
          active:scale-95"
				>
					🚀 등록하기
				</button>
			</motion.div>

			{/* 🔹 전체 좌우 분할 레이아웃 */}
			<div className="flex gap-6 w-full mb-8">
				{/* 왼쪽: 문제 등록 영역 */}
				<div className="w-1/2">
					<h2 className="text-xl font-bold mb-2">문제 등록</h2>
					<div className="border-t border-gray-300 my-4"></div>

					{/* 🔹 문제 제목 입력 */}
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="문제 제목"
						className="w-full px-4 py-2 border rounded-md mb-4"
					/>

					{/* 🔹 문제 설명 영역 */}
					<div className="w-full">
						<h3 className="text-lg font-semibold mb-2">문제 설명</h3>
						<div className="border rounded-md bg-white h-[500px] flex flex-col">
							<Toolbar editor={editor} addLocalImage={addLocalImage} />
							<EditorContent editor={editor} className="flex-1 p-4 text-black overflow-y-auto rounded-b-md" />
						</div>
					</div>
				</div>

				{/* 오른쪽: 코드 에디터 */}
				<div className="w-1/2 flex flex-col">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-lg font-semibold">예시 코드</h3>
						<select value={language} onChange={handleLanguageChange} className="border rounded-lg p-2">
							<option value="python">Python</option>
							<option value="c">C</option>
							<option value="cpp">C++</option>
							<option value="java">Java</option>
						</select>
					</div>
					<div className="border-b-2 border-black my-2"></div>

					<div className="bg-white p-0 rounded shadow flex-1">
						<MonacoEditor
							height="100%"
							width="100%"
							language={language}
							value={code}
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
						/>
					</div>
				</div>
			</div>

			{/* 🔹 문제 조건 & 평가 기준 섹션 */}
			<div className="mb-8 flex gap-6">
				{/* 왼쪽: 문제 조건 */}
				<div className="flex-1">
					<h2 className="text-xl font-bold mb-2">문제 조건</h2>
					<div className="border-t border-gray-300 my-4"></div>
					<div className="bg-white shadow-md rounded-xl p-4">
						{conditions.map((condition, index) => (
							<div key={index} className="flex items-center gap-3 mb-3">
								<span className="text-lg font-semibold text-gray-700 min-w-[30px]">{index + 1}.</span>
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
									className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-hidden"
								/>
								<button
									onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
									className="px-3 py-2 bg-red-200 hover:bg-red-300 text-red-700 rounded-lg text-sm transition-colors"
								>
									삭제
								</button>
							</div>
						))}

						{/* 조건 추가 버튼 */}
						<div className="mt-4">
							<button
								onClick={() => setConditions([...conditions, ""])}
								className="bg-green-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
							>
								+ 조건 추가
							</button>
						</div>
					</div>
				</div>

				{/* 오른쪽: 평가 기준 */}
				<div className="w-1/3">
					<h2 className="text-xl font-bold mb-2">평가 기준</h2>
					<div className="border-t border-gray-300 my-4"></div>
					<div className="bg-white shadow-md rounded-xl p-4">
						<div className="space-y-3">
							{["Regex", "Space", "Hard"].map((criteria) => (
								<label key={criteria} className="flex items-center gap-3 cursor-pointer">
									<input
										type="radio"
										name="evaluationCriteria"
										value={criteria}
										checked={evaluationCriteria === criteria}
										onChange={(e) => setEvaluationCriteria(e.target.value)}
										className="w-4 h-4 text-blue-600"
									/>
									<span className="text-lg">{criteria}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* 🔹 입출력 예제 섹션 (하단) */}
			<div>
				<h2 className="text-xl font-bold mb-2">입출력 예제</h2>
				<div className="border-t border-gray-300 my-4"></div>
				<div className="bg-white shadow-md rounded-xl p-4">
					{/* 실행하기 버튼 */}
					<div className="flex items-center mb-4">
						<div className="font-bold text-lg mr-4">테스트케이스 실행</div>
						<button
							onClick={handleTestRun}
							disabled={isTestRunning}
							className={`flex items-center ${
								isTestRunning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
							} text-white px-6 py-1.5 rounded-xl text-md transition-colors`}
							style={{ minWidth: 100 }}
						>
							{isTestRunning ? "실행 중..." : "실행하기"}
						</button>
					</div>

					<div className="space-y-4">
						{inputs.map((pair, index) => (
							<div
								key={index}
								className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
									runResults[index]?.passed === true
										? "border-green-300 bg-green-50"
										: runResults[index]?.passed === false
										? "border-red-300 bg-red-50"
										: "border-gray-200"
								}`}
							>
								{/* 번호 */}
								<div className="flex-shrink-0 w-8 text-center">
									<span className="text-lg font-semibold text-gray-700">{index + 1}</span>
								</div>

								{/* 입력값 */}
								<div className="flex-1">
									<label className="block text-sm font-medium text-gray-700 mb-1">입력값</label>
									<textarea
										rows={1}
										value={pair.input}
										onChange={(e) => {
											const newInputs = [...inputs]
											newInputs[index].input = e.target.value
											setInputs(newInputs)
										}}
										onInput={(e) => {
											const ta = e.currentTarget
											ta.style.height = "auto"
											ta.style.height = `${ta.scrollHeight}px`
										}}
										placeholder="입력값을 입력하세요"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-hidden font-mono"
									/>
								</div>

								{/* 예상 출력값 */}
								<div className="flex-1">
									<label className="block text-sm font-medium text-gray-700 mb-1">예상 출력</label>
									<textarea
										rows={1}
										value={pair.output}
										onChange={(e) => {
											const newInputs = [...inputs]
											newInputs[index].output = e.target.value
											setInputs(newInputs)
										}}
										onInput={(e) => {
											const ta = e.currentTarget
											ta.style.height = "auto"
											ta.style.height = `${ta.scrollHeight}px`
										}}
										placeholder="예상 출력값을 입력하세요"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-hidden font-mono"
									/>
								</div>

								{/* 실제 출력값 */}
								<div className="flex-1">
									<label className="block text-sm font-medium text-gray-700 mb-1">실제 출력</label>
									<div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono min-h-[42px] flex items-center">
										{runResults[index]?.output ? (
											<span className="whitespace-pre-wrap">{runResults[index].output}</span>
										) : (
											<span className="text-gray-400">-</span>
										)}
									</div>
								</div>

								{/* 결과 */}
								<div className="flex-shrink-0 w-16 text-center">
									<label className="block text-sm font-medium text-gray-700 mb-1">결과</label>
									<div className="text-2xl mt-1">
										{runResults[index]?.passed === true ? (
											<span className="text-green-600">✔</span>
										) : runResults[index]?.passed === false ? (
											<span className="text-red-600">✗</span>
										) : (
											<span className="text-gray-500">-</span>
										)}
									</div>
								</div>

								{/* 공개여부 */}
								<div className="flex-shrink-0 w-24">
									<label className="block text-sm font-medium text-gray-700 mb-1">공개여부</label>
									<select
										value={pair.isPublic ? "public" : "private"}
										onChange={(e) => {
											const newInputs = [...inputs]
											newInputs[index].isPublic = e.target.value === "public"
											setInputs(newInputs)
										}}
										className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
									>
										<option value="public">공개</option>
										<option value="private">비공개</option>
									</select>
								</div>

								{/* 삭제 버튼 */}
								<div className="flex-shrink-0">
									<label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
									<button
										onClick={() => setInputs(inputs.filter((_, i) => i !== index))}
										className="px-3 py-2 bg-red-200 hover:bg-red-300 text-red-700 rounded-lg text-sm transition-colors"
									>
										삭제
									</button>
								</div>
							</div>
						))}
					</div>

					{/* 추가 버튼 */}
					<div className="mt-6">
						<button
							onClick={() => setInputs([...inputs, { input: "", output: "", isPublic: false }])}
							className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
						>
							+ 예제 추가
						</button>
					</div>
				</div>
				<div className="pb-20"></div>
			</div>

			{/* ✅ 스타일 추가 */}
			<style>
				{`
  .ProseMirror {
    outline: none;
    min-height: 150px;
    padding: 12px;
  }

  /* ✅ H1, H2, H3 적용 */
  .ProseMirror h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
  .ProseMirror h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
  .ProseMirror h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }

  /* ✅ 리스트 스타일 */
  .ProseMirror ul { list-style-type: disc; margin-left: 1.5rem; }
  .ProseMirror ol { list-style-type: decimal; margin-left: 1.5rem; }
  .ProseMirror li { margin-bottom: 0.5rem; }

  /* ✅ 테이블 스타일 */
  .ProseMirror table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    border: 1px solid #ccc;
  }

  .ProseMirror th, .ProseMirror td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .ProseMirror th {
    background-color: #f4f4f4;
    font-weight: bold;
  }

  /* ✅ 툴바 버튼 */
  .toolbar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.1s ease-in-out;
  }
  .toolbar-icon:hover {
    transform: scale(1.1);
  }

  /* ✅ 형광펜 버튼 */
  .highlight-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.1s ease-in-out;
  }
  .highlight-btn:hover {
    transform: scale(1.1);
  }
`}
			</style>
		</div>
	)
}
