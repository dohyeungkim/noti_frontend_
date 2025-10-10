"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { problem_api } from "@/lib/api"
import type {
	ProblemDetail,
	MultipleChoiceProblem,
	ShortAnswerProblem,
	SubjectiveProblem,
	ReferenceCodeRequest,
	BaseCodeRequest,
	TestCaseRequest,
	ProblemUpdateRequest,
} from "@/lib/api"
import { useProblemForm, type ProblemType } from "@/hooks/useProblemForm"
// import { useProblemEditor } from "@/hooks/useProblemEditor"
import ReferenceCodeEditor from "@/components/ProblemForm/ReferenceCodeEditor"
// import MultipleChoiceEditor from "@/components/ProblemForm/MultipleChoiceEditor"
import ProblemConditions from "@/components/ProblemForm/ProblemConditions"
import TestCaseSection from "@/components/ProblemForm/TestCaseSection"
import ReactMde from "react-mde"
import "react-mde/lib/styles/css/react-mde-all.css"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

function MultipleChoiceEditor({
	options,
	setOptions,
	answerIndexes,
	setAnswerIndexes,
}: {
	options: string[]
	setOptions: (opts: string[]) => void
	answerIndexes: number[]
	setAnswerIndexes: (indexes: number[]) => void
}) {
	const handleChange = (i: number, value: string) => {
		const updated = [...options]
		updated[i] = value
		setOptions(updated)
	}

	const handleAdd = () => setOptions([...options, ""])

	const handleRemove = (i: number) => {
		const updatedOptions = options.filter((_, idx) => idx !== i)
		setOptions(updatedOptions)

		const updatedAnswers = answerIndexes.filter((idx) => idx !== i).map((idx) => (idx > i ? idx - 1 : idx))
		setAnswerIndexes(updatedAnswers)
	}

	const toggleAnswer = (i: number) => {
		if (answerIndexes.includes(i)) {
			setAnswerIndexes(answerIndexes.filter((idx) => idx !== i))
		} else {
			setAnswerIndexes([...answerIndexes, i])
		}
	}

	return (
		<div className="flex flex-col gap-2 w-full">
			<label className="text-sm font-semibold text-gray-700 mb-1">객관식 보기 및 정답 선택 (복수 선택 가능)</label>
			{options.map((option, i) => (
				<div key={i} className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={answerIndexes.includes(i)}
						onChange={() => toggleAnswer(i)}
						className="w-4 h-4"
					/>
					<input
						type="text"
						value={option}
						onChange={(e) => handleChange(i, e.target.value)}
						placeholder={`보기 ${i + 1}`}
						className="flex-1 px-3 py-1.5 border rounded-md text-sm"
					/>
					<button onClick={() => handleRemove(i)} type="button" className="text-red-500 text-sm">
						삭제
					</button>
				</div>
			))}
			<button onClick={handleAdd} type="button" className="text-blue-600 text-sm hover:underline mt-1 w-fit">
				+ 항목 추가
			</button>
		</div>
	)
}

export default function EditRegisteredProblem() {
	const router = useRouter()
	const { id } = useParams() as { id: string }
  const problemId = id
	const [baseCode, setBaseCode] = useState<string>("")
	// 문제 유형 버튼 상수
	const PROBLEM_TYPES: { value: ProblemType; label: string; color: string }[] = [
		{ value: "코딩", label: "코딩", color: "bg-blue-100 text-blue-800" },
		{ value: "디버깅", label: "디버깅", color: "bg-red-100 text-red-800" },
		{ value: "객관식", label: "객관식", color: "bg-green-100 text-green-800" },
		{ value: "주관식", label: "주관식", color: "bg-purple-100 text-purple-800" },
		{ value: "단답형", label: "단답형", color: "bg-yellow-100 text-yellow-800" },
	]

	// useProblemForm 훅에서 필요한 상태 및 셋터
	const {
		setInitialData,
		title,
		setTitle,
		description,
		setDescription,
		difficulty,
		setDifficulty,
		ratingMode,
		setRatingMode,
		tags,
		setTags,
		removeTag,
		conditions,
		setConditions,
		addCondition,
		removeCondition,
		updateCondition,
		referenceCodes,
		setReferenceCodes,
		addReferenceCode,
		removeReferenceCode,
		updateReferenceCodeLanguage,
		updateReferenceCode,
		setMainReferenceCode,
		testCases,
		setTestCases,
		addTestCase,
		removeTestCase,
		updateTestCase,
		activeCodeTab,
		setActiveCodeTab,
	} = useProblemForm()

	// const { editor, addLocalImage } = useProblemEditor()

	// 로컬 상태
	const [loaded, setLoaded] = useState(false)
	const [problemType, setProblemType] = useState<ProblemType>("코딩")
	const [problemScore, setProblemScore] = useState<number>(10)

	const [options, setOptions] = useState<string[]>([])
	const [answerIndexes, setAnswerIndexes] = useState<number[]>([])
	const [answerTexts, setAnswerTexts] = useState<string[]>([])
	const [gradingCriteria, setGradingCriteria] = useState<string[]>([""])
	const [subjectiveAnswer, setSubjectiveAnswer] = useState<string>("")
	const [subjectiveCriteria, setSubjectiveCriteria] = useState<string[]>([""])

	const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write")
	const [testResults, setTestResults] = useState<(boolean | null)[]>([])

	// 기존 문제 불러와 훅에 주입 및 로컬 상태 초기화
	useEffect(() => {
		if (!problemId) return
		;(async () => {
			try {
				const data: ProblemDetail = await problem_api.problem_get_by_id(Number(problemId))
        console.log("📥 백엔드에서 받은 전체 데이터:", data)
            console.log("📊 rating_mode 값 (snake_case):", (data as any).rating_mode)
            console.log("📊 ratingMode 값 (camelCase):", (data as any).ratingMode)
            console.log("🔍 rating_mode 타입:", typeof (data as any).rating_mode)
            console.log("🔍 ratingMode 타입:", typeof (data as any).ratingMode)
            // ================================
            
            setInitialData(data)
            setProblemType(data.problemType)

            if ((data as any).rating_mode !== undefined) {
                console.log("✅ rating_mode (snake_case) 사용:", (data as any).rating_mode)
                setRatingMode((data as any).rating_mode)
            } else if ((data as any).ratingMode !== undefined) {
                console.log("✅ ratingMode (camelCase) 사용:", (data as any).ratingMode)
                setRatingMode((data as any).ratingMode)
            } else {
                console.log("⚠️ rating_mode 값이 없음 - 기본값 유지")
            }

        if ((data as any).base_code && Array.isArray((data as any).base_code) && (data as any).base_code.length > 0) {
        setReferenceCodes(
          (data as any).base_code.map((bc: any, idx: number) => ({
            language: bc.language,
            code: bc.code,
            is_main: idx === 0
          }))
        );
      } else if (Array.isArray((data as any).reference_codes) && (data as any).reference_codes.length > 0) {
        setReferenceCodes((data as any).reference_codes);
      }

				// 배점이 API에 있다면
				if ((data as any).problemScore) setProblemScore((data as any).problemScore)
				// 유형별 추가 필드 초기화
				if (data.problemType === "객관식") {
					const mc = data as MultipleChoiceProblem
					setOptions(mc.options)
					setAnswerIndexes(mc.correct_answers)
				} else if (data.problemType === "단답형") {
					const sa = data as ShortAnswerProblem
					setAnswerTexts(sa.answer_text)
					setGradingCriteria(sa.grading_criteria)
				} else if (data.problemType === "주관식") {
					const sb = data as SubjectiveProblem
					setSubjectiveAnswer((sb as any).answer_text || "")
					setSubjectiveCriteria(sb.grading_criteria)
				}
        if (Array.isArray((data as any).problem_condition)) {
        setConditions(data.problem_condition);
        }
        if (Array.isArray((data as any).test_cases)) {
        setTestCases((data as any).test_cases);
        }

				setLoaded(true)
			} catch (err) {
				console.error("문제 불러오기 실패:", err)
			}
		})()
	}, [problemId])

	// if (!loaded) return <p>Loading...</p>

	// 테스트 실행 핸들러 (생성 페이지와 동일)
	const handleTestRun = async () => {
		setTestResults([])
		if (referenceCodes.length === 0) {
			alert("참조 코드가 없습니다.")
			return
		}
		if (testCases.length === 0) {
			alert("테스트케이스가 없습니다.")
			return
		}
		const mainCode = referenceCodes.find((c) => c.is_main) || referenceCodes[0]
		try {
			const requestData = {
				language: mainCode.language,
				code: mainCode.code,
				test_cases: testCases.map((tc) => ({ input: tc.input, expected_output: tc.expected_output })),
				rating_mode: ratingMode as "hard" | "space" | "regex" | "none",
			}
			console.log("테스트 실행 요청:", JSON.stringify(requestData))
			const res = await fetch("/api/proxy/solves/run_code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestData),
			})
			const result = await res.json()
			if (!result || !Array.isArray(result.results)) {
				alert("API 응답이 올바르지 않습니다. (테스트케이스 실행 실패)")
				return
			}
			const passedCount = result.results.filter((r: any) => r.passed).length
			const totalCount = result.results.length
			if (passedCount === totalCount) alert(`✅ 모든 테스트케이스 통과! 성공: ${passedCount}/${totalCount}`)
			else if (passedCount === 0) alert(`❌ 모든 테스트케이스 실패 성공: 0/${totalCount}`)
			else alert(`❌ 일부 테스트케이스 실패 성공: ${passedCount}/${totalCount}`)
			setTestResults(result.results.map((r: any) => r.passed))
		} catch (err) {
			console.error(err)
			alert("테스트케이스 실행 중 오류가 발생했습니다.")
		}
	}

	// 저장 핸들러
	const handleSave = async () => {
		try {
			// 모든 타입에 공통으로 들어가는 최소 필드만 정의
			const base = {
				title,
				description,
				difficulty,
				tags,
			}

			let payload: ProblemUpdateRequest
			switch (problemType) {
				case "코딩":
				case "디버깅": {
          const base_code =
          referenceCodes.find((c) => c.is_main)?.code ??
          referenceCodes[0]?.code ??
          "";
					payload = {
						...base,
						problem_condition: conditions, // 코딩·디버깅만
						rating_mode: ratingMode as "hard" | "space" | "regex" | "none",
						problemType,
						reference_codes: referenceCodes,
						base_code: base_code,
						test_cases: testCases,
					}
					break;
				}

				case "객관식":
					payload = {
						...base,
						problemType: "객관식",
						options,
						correct_answers: answerIndexes,
					}
					break

				case "단답형": {

				const allowedShortAnswerModes = ["exact", "partial", "soft", "none"];
        const safeRatingMode = allowedShortAnswerModes.includes(ratingMode) ? ratingMode : "exact";
				const safeAnswerTexts = Array.isArray(answerTexts) && answerTexts.every(v => typeof v === "string" && v.trim() !== "") ? answerTexts : [""];
					payload = {
						...base,
						problemType: "단답형",
						rating_mode: safeRatingMode as "exact" | "partial" | "soft" | "none",
						answer_texts: safeAnswerTexts,
						grading_criteria: gradingCriteria,
					}
					break
				}

				case "주관식": {
					const allowedSubjectiveModes = ["active", "deactive"];
					const safeRatingMode = allowedSubjectiveModes.includes(ratingMode) ? ratingMode : "active";
					payload = {
						...base,
						problemType: "주관식",
						rating_mode: safeRatingMode as "active" | "deactive",
						grading_criteria: subjectiveCriteria,
						answer_texts: subjectiveAnswer,
					}
					break
			}
		}

			await problem_api.problem_update(problemId, payload)
			alert("✅ 문제가 성공적으로 수정되었습니다.")
			router.push("/registered-problems")
			console.log("description:", payload.description)
		} catch (err) {
			console.error(err)
			alert("❌ 문제 수정 중 오류가 발생했습니다.")
		}
	}

	return (
		<div>
			{/* 상단 버튼 */}
			<motion.div className="flex gap-2 justify-end mb-6">
				<button
					onClick={handleTestRun}
					className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700"
				>
					▶️ 테스트 실행
				</button>
				<button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
					💾 수정 저장
				</button>
				<button
					onClick={() => router.back()}
					className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-400"
				>
					← 뒤로가기
				</button>
			</motion.div>
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
						onClick={async () => {
							await handleSave()
							router.back()
						}}
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

							{/* 문제 유형 선택 (추가) */}
							<div className="mb-3">
								<label className="block text-xs font-medium text-gray-700 mb-1">문제 유형</label>
								<div className="grid grid-cols-5 gap-2">
									{PROBLEM_TYPES.map((type) => (
										<button
											key={type.value}
											onClick={() => setProblemType(type.value as ProblemType)}
											className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
												problemType === (type.value as ProblemType)
													? `${type.color} font-medium`
													: "bg-gray-100 text-gray-700 hover:bg-gray-200"
											}`}
										>
											{type.label}
										</button>
									))}
								</div>
							</div>

							{/* 태그 입력 */}
							<div className="mb-3">
								<label className="block text-xs font-medium text-gray-700 mb-1">태그 추가</label>
								<div className="flex gap-2 mb-2">
									<input
										type="text"
										placeholder="태그 입력 후 Enter 또는 쉼표"
										className="flex-1 px-3 py-1 border rounded-md text-sm"
										onKeyPress={(e) => {
											if (e.key === "Enter" || e.key === ",") {
												e.preventDefault()
												const input = e.target as HTMLInputElement
												const newTag = input.value.trim()
												if (newTag && !tags.includes(newTag)) {
													setTags([...tags, newTag])
													input.value = ""
												}
											}
										}}
										onBlur={(e) => {
											const newTag = e.target.value.trim()
											if (newTag && !tags.includes(newTag)) {
												setTags([...tags, newTag])
												e.target.value = ""
											}
										}}
									/>
									<button
										type="button"
										onClick={(e) => {
											const input = e.currentTarget.previousElementSibling as HTMLInputElement
											const newTag = input.value.trim()
											if (newTag && !tags.includes(newTag)) {
												setTags([...tags, newTag])
												input.value = ""
											}
										}}
										className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
									>
										추가
									</button>
								</div>
								<div className="flex flex-wrap gap-2">
									{tags.map((tag, idx) => (
										<span
											key={idx}
											className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1"
										>
											{tag}
											<button type="button" className="text-red-500 hover:text-red-700" onClick={() => removeTag(idx)}>
												×
											</button>
										</span>
									))}
								</div>
							</div>

							{/* 난이도와 평가 모드 */}
							<div className="flex gap-4 mb-13">
								{/* 문제 난이도 */}
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

								{/* 문제 채점 모드 */}
								{/* 채점 모드 None 추가 - 👻 */}
								<div className="flex-1">
									<label className="block text-xs font-medium text-gray-700 mb-1">채점 모드</label>
									<select
										value={ratingMode}
										onChange={(e) => setRatingMode(e.target.value as "hard" | "space" | "regex" | "none")}
										className="w-full px-3 py-1.5 border rounded-md text-sm"
									>
										{problemType === "객관식" ? (
											<option value="none">None</option>
										) : problemType === "단답형" ? (
											<>
												<option value="exact">exact</option>
												<option value="partial">partial</option>
												<option value="soft">soft</option>
												<option value="none">none</option>
											</>
										) : problemType === "주관식" ? (
											<>
												<option value="active">Active</option>
												<option value="deactive">Deactive</option>
											</>
										) : (
											<>
												<option value="hard">Hard</option>
												<option value="space">Space</option>
												<option value="regex">Regex</option>
												<option value="none">None</option>
											</>
										)}
									</select> 
								</div>

								{/* 배점 설정 (텍스트 입력 방식으로 변경) */}
								<div className="mb-3">
									<label className="block text-xs font-medium text-gray-700 mb-1">배점</label>
									<div className="flex items-center">
										<input
											type="number"
											min="10"
											max="10"
											value={problemScore}
											onChange={(e) => setProblemScore(parseInt(e.target.value) || 1)}
											className="w-full px-3 py-1.5 border rounded-md text-sm"
											placeholder="배점dms 10접입니다."
										/>
										<span className="ml-2 text-sm text-gray-600">점</span>
									</div>
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
									Promise.resolve(<ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{markdown}</ReactMarkdown>)
								}
								childProps={{
									writeButton: {
										tabIndex: -1,
									},
								}}
							/>
						</div>
					</div>

					{/* ✨ 오른쪽 - 코딩/디버깅: 참조 코드 에디터 */}
					{/* ✨ 오른쪽 - 객관, 단답, 주관: 문제 유형에 따른 조건부 렌더링 */}
					{problemType === "객관식" ? (
						<div className="w-1/2">
							<MultipleChoiceEditor
								options={options}
								setOptions={setOptions}
								answerIndexes={answerIndexes}
								setAnswerIndexes={setAnswerIndexes}
							/>
						</div>
					) : problemType === "주관식" ? (
						<div className="w-1/2 flex flex-col gap-6">
							{/* 주관식 정답 입력 */}
							<div>
								<label className="text-sm font-semibold text-gray-700 mb-1 block">주관식 정답</label>
								<textarea
									value={subjectiveAnswer}
									onChange={(e) => setSubjectiveAnswer(e.target.value)}
									placeholder="정답 예시 혹은 기준"
									className="w-full h-24 px-3 py-2 border rounded-md text-sm"
								/>
							</div>

							{/* AI 채점 기준 입력 */}
							<div>
								<label className="text-sm font-semibold text-gray-700 mb-1 block">AI채점기준</label>
								{subjectiveCriteria.map((rubric, idx) => (
									<div key={idx} className="flex items-center gap-2 mb-2">
										<input
											type="text"
											value={rubric}
											onChange={(e) => {
												const updated = [...subjectiveCriteria]
												updated[idx] = e.target.value
												setSubjectiveCriteria(updated)
											}}
											placeholder={`기준 ${idx + 1}`}
											className="flex-1 px-3 py-1.5 border rounded-md text-sm"
										/>
										<button
											onClick={() => {
												const updated = subjectiveCriteria.filter((_, i) => i !== idx)
												setSubjectiveCriteria(updated)
											}}
											className="text-red-500 text-sm"
										>
											삭제
										</button>
									</div>
								))}
								<button
									onClick={() => setSubjectiveCriteria([...subjectiveCriteria, ""])}
									type="button"
									className="text-blue-600 text-sm hover:underline w-fit"
								>
									+ 기준 추가
								</button>
							</div>
						</div>
					) : problemType === "단답형" ? (
						<div className="w-1/2 flex flex-col gap-6">
							{/* 단답형 정답 항목 리스트 */}
							<div>
								<label className="text-sm font-semibold text-gray-700 mb-1 block">단답형 정답</label>
								{answerTexts.map((answer, idx) => (
									<div key={idx} className="flex items-center gap-2 mb-2">
										<input
											type="text"
											value={answer}
											onChange={(e) => {
												const updated = [...answerTexts]
												updated[idx] = e.target.value
												setAnswerTexts(updated)
											}}
											placeholder={`정답 ${idx + 1}`}
											className="flex-1 px-3 py-1.5 border rounded-md text-sm"
										/>
										<button
											onClick={() => {
												const updated = answerTexts.filter((_, i) => i !== idx)
												setAnswerTexts(updated)
											}}
											className="text-red-500 text-sm"
										>
											삭제
										</button>
									</div>
								))}
								<button
									onClick={() => setAnswerTexts([...answerTexts, ""])}
									type="button"
									className="text-blue-600 text-sm hover:underline w-fit"
								>
									+ 정답 추가
								</button>
							</div>

							{/* AI 채점 기준 입력 */}
							<div>
								<label className="text-sm font-semibold text-gray-700 mb-1 block">AI채점기준</label>
								{gradingCriteria.map((criteria, idx) => (
									<div key={idx} className="flex items-center gap-2 mb-2">
										<input
											type="text"
											value={criteria}
											onChange={(e) => {
												const updated = [...gradingCriteria]
												updated[idx] = e.target.value
												setGradingCriteria(updated)
											}}
											placeholder={`기준 ${idx + 1}`}
											className="flex-1 px-3 py-1.5 border rounded-md text-sm"
										/>
										<button
											onClick={() => {
												const updated = gradingCriteria.filter((_, i) => i !== idx)
												setGradingCriteria(updated)
											}}
											className="text-red-500 text-sm"
										>
											삭제
										</button>
									</div>
								))}
								<button
									onClick={() => setGradingCriteria([...gradingCriteria, ""])}
									type="button"
									className="text-blue-600 text-sm hover:underline w-fit"
								>
									+ 기준 추가
								</button>
							</div>
						</div>
					) : (
						// ------- 코딩, 디버깅 문제일 때 -------
						<ReferenceCodeEditor
							referenceCodes={referenceCodes}
							activeCodeTab={activeCodeTab}
							setActiveCodeTab={setActiveCodeTab}
							addReferenceCode={addReferenceCode}
							removeReferenceCode={removeReferenceCode}
							updateReferenceCodeLanguage={updateReferenceCodeLanguage}
							updateReferenceCode={updateReferenceCode}
							setMainReferenceCode={setMainReferenceCode}
							problemType={problemType} // 디버깅일 때 베이스 코드 버튼 렌더링
							baseCode={baseCode} // 현재 선택된 베이스 코드 문자열
							onSetBaseCode={setBaseCode} // “베이스 코드로 지정” 클릭 시 호출
						/>
					)}
				</div>

				{/* 문제 조건 섹션 */}
				{problemType !== "객관식" && problemType !== "주관식" && problemType !== "단답형" && (
					<ProblemConditions
						conditions={conditions}
						addCondition={addCondition}
						removeCondition={removeCondition}
						updateCondition={updateCondition}
					/>
				)}

				{/* 테스트 케이스 섹션 */}
				{problemType !== "객관식" && problemType !== "주관식" && problemType !== "단답형" && (
					<TestCaseSection
						testCases={testCases}
						addTestCase={addTestCase}
						removeTestCase={removeTestCase}
						updateTestCase={updateTestCase}
						testResults={testResults}
					/>
				)}
			</div>
		</div>
	)
}
