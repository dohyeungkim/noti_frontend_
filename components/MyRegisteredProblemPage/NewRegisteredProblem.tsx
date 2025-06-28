"use client"

import { useRouter } from "next/navigation"
import { EditorContent } from "@tiptap/react"
import { motion } from "framer-motion"
import { problem_api, enhanced_run_code_api } from "@/lib/api"
import Toolbar from "../markdown/Toolbar"
import { useProblemForm } from "@/hooks/useProblemForm"
import { useProblemEditor } from "@/hooks/useProblemEditor"
import ProblemBasicInfo from "../ProblemForm/ProblemBasicInfo"
import ReferenceCodeEditor from "../ProblemForm/ReferenceCodeEditor"
import ProblemConditions from "../ProblemForm/ProblemConditions"
import TestCaseSection from "../ProblemForm/TestCaseSection"
import ReactMde from "react-mde"
import "react-mde/lib/styles/css/react-mde-all.css"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"

export default function NewRegisteredProblem() {
	const router = useRouter()
	const [description, setDescription] = useState("")
	const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write")
	const [testResults, setTestResults] = useState<(boolean | null)[]>([])
	
	const {
		title,
		setTitle,
		difficulty,
		setDifficulty,
		ratingMode,
		setRatingMode,
		tags,
		conditions,
		referenceCodes,
		testCases,
		activeCodeTab,
		setActiveCodeTab,
		addReferenceCode,
		removeReferenceCode,
		updateReferenceCodeLanguage,
		updateReferenceCode,
		setMainReferenceCode,
		addTestCase,
		removeTestCase,
		updateTestCase,
		addCondition,
		removeCondition,
		updateCondition,
		updateTags,
		removeTag,
		loadDraft,
		saveDraft,
	} = useProblemForm()

	const { editor, addLocalImage } = useProblemEditor()

	// 컴포넌트 마운트 시 드래프트 로드
	useEffect(() => {
		loadDraft();
	}, [loadDraft]);

	// 상태 변경 시 드래프트 저장
	useEffect(() => {
		saveDraft();
	}, [saveDraft]);

	// 로딩 상태 체크는 모든 훅 호출 이후에
	if (!editor) return <p>Editor is loading...</p>

	const handleTestRun = async () => {
		setTestResults([]); // 테스트 실행 직전에 추가
		if (referenceCodes.length === 0) {
			alert("참조 코드가 없습니다.")
			return
		}
		if (testCases.length === 0) {
			alert("테스트케이스가 없습니다.")
			return
		}
		const mainCode = referenceCodes.find(code => code.is_main) || referenceCodes[0]

		try {
			const requestData = {
				language: mainCode.language,
				code: mainCode.code,
				test_cases: testCases.map(tc => ({
					input: tc.input,
					output: tc.expected_output
				})),
				rating_mode: ratingMode
			}

			console.log("테스트 실행 요청:", JSON.stringify(requestData, null, 2))

			const response = await fetch("/api/proxy/solves/run_code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestData)
			});

			const result = await response.json();

			if (!result || !Array.isArray(result.results)) {
				alert("API 응답이 올바르지 않습니다. (테스트케이스 실행 실패)");
				console.error("API 응답:", result);
				return;
			}

			const passedCount = result.results.filter(r => r.passed).length;
			const totalCount = result.results.length;

			if (passedCount === totalCount) {
				alert(`✅ 모든 테스트케이스 통과!\n성공: ${passedCount}/${totalCount}`);
			} else if (passedCount === 0) {
				alert(`❌ 모든 테스트케이스 실패\n성공: 0/${totalCount}`);
			} else {
				alert(`❌ 일부 테스트케이스 실패\n성공: ${passedCount}/${totalCount}`);
			}

			setTestResults(result.results.map(r => r.passed));
		} catch (error) {
			console.error("테스트케이스 실행 실패:", error);
			alert("테스트케이스 실행 중 오류가 발생했습니다.");
		}
	}

	const handleSave = async () => {
		if (!editor) {
			alert("Editor is not loaded yet.")
			return
		}

		const content = editor.getHTML()
		const filteredConditions = conditions.filter((condition) => condition.trim() !== "")

		try {
			await problem_api.problem_create(
				title,
				description,
				difficulty,
				ratingMode,
				tags,
				filteredConditions,
				referenceCodes,
				testCases
			)
			alert("문제가 성공적으로 등록되었습니다.")
			// 성공 시 드래프트 삭제
			localStorage.removeItem("problemDraft")
			router.push("/registered-problems")
		} catch (error) {
			console.error("문제 등록 실패:", error)
			alert("문제 등록 중 오류가 발생했습니다.")
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
					onClick={handleTestRun}
					className="flex items-center bg-green-600 text-white px-6 py-2 rounded-lg text-sm cursor-pointer
					hover:bg-green-700 transition-all duration-200 ease-in-out
					active:scale-95 shadow-md"
				>
					▶️ 테스트 실행
				</button>
				<button
					onClick={handleSave}
					className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg text-sm cursor-pointer
					hover:bg-blue-700 transition-all duration-200 ease-in-out
					active:scale-95 shadow-md"
				>
					🚀 등록하기
				</button>
			</motion.div>

			{/* 전체 좌우 분할 레이아웃 */}
			<div className="flex gap-4 w-full mb-6">
				{/* 왼쪽: 문제 정보 및 설명 */}
				<div className="w-1/2">
					{/* 문제 기본 정보 */}
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
								onChange={(e) => {
									const tagString = e.target.value;
									updateTags(tagString);
								}}
								placeholder="예: 구현, 수학, 문자열"
								className="w-full px-3 py-1 border rounded-md text-sm"
							/>
							<div className="flex flex-wrap gap-2 mt-1">
								{tags.map((tag, idx) => (
									<span key={idx} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
										{tag}
										<button
											type="button"
											className="ml-1 text-red-500 hover:text-red-700"
											onClick={() => removeTag(idx)}
										>
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
									<option value="hard">Hard</option>
								</select>
							</div>

							<div className="flex-1">
								<label className="block text-xs font-medium text-gray-700 mb-1">채점 모드</label>
								<select
									value={ratingMode}
									onChange={(e) => setRatingMode(e.target.value as "Hard" | "Space" | "Regex")}
									className="w-full px-3 py-1.5 border rounded-md text-sm"
								>
									<option value="Hard">Hard</option>
									<option value="Space">Space</option>
									<option value="Regex">Regex</option>
								</select>
							</div>
						</div>
					</div>

					{/* 문제 설명 */}
					<div className="mb-3">
						<label className="block text-xs font-medium text-gray-700 mb-1">문제 설명</label>
						<ReactMde
							value={description}
							onChange={setDescription}
							selectedTab={selectedTab}
							onTabChange={setSelectedTab}
							generateMarkdownPreview={(markdown: string) =>
								Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>)
							}
							childProps={{
								writeButton: {
									tabIndex: -1,
								},
							}}
						/>
					</div>
				</div>

				{/* 오른쪽: 참조 코드 에디터 */}
				<ReferenceCodeEditor
					referenceCodes={referenceCodes}
					activeCodeTab={activeCodeTab}
					setActiveCodeTab={setActiveCodeTab}
					addReferenceCode={addReferenceCode}
					removeReferenceCode={removeReferenceCode}
					updateReferenceCodeLanguage={updateReferenceCodeLanguage}
					updateReferenceCode={updateReferenceCode}
					setMainReferenceCode={setMainReferenceCode}
				/>
			</div>

			{/* 문제 조건 섹션 */}
			<div className="mb-6 flex gap-4">
				<ProblemConditions
					conditions={conditions}
					addCondition={addCondition}
					removeCondition={removeCondition}
					updateCondition={updateCondition}
				/>
			</div>

			{/* 테스트 케이스 섹션 */}
			<TestCaseSection
				testCases={testCases}
				addTestCase={addTestCase}
				removeTestCase={removeTestCase}
				updateTestCase={updateTestCase}
				testResults={testResults}
			/>

		</div>
	)
}
