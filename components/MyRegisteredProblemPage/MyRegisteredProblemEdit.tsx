"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { problem_api } from "@/lib/api";
import Toolbar from "../markdown/Toolbar";
import { useProblemForm } from "@/hooks/useProblemForm";
import { useProblemEditor } from "@/hooks/useProblemEditor";
import ReferenceCodeEditor from "../ProblemForm/ReferenceCodeEditor";
import ProblemConditions from "../ProblemForm/ProblemConditions";
import TestCaseSection from "../ProblemForm/TestCaseSection";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import ReactMarkdown from "react-markdown";
import { dummyCodingProblem } from "../../data/dummyCodingProblem"//진형준 추가


export default function ProblemEdit() {
	const router = useRouter();
	const { id } = useParams();
	const [description, setDescription] = useState("");
	const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
	const [testResults, setTestResults] = useState<(boolean | null)[]>([]);
	const [problemType, setProblemType] = useState<"코딩" | "디버깅" | "객관식" | "주관식" | "단답형">("코딩"); //진형준 추가


	const {
		title,
		setTitle,
		difficulty,
		setDifficulty,
		ratingMode,
		setRatingMode,
		tags,
		setTags,
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
		setInitialData,
	} = useProblemForm();

	const { editor, addLocalImage } = useProblemEditor();

	useEffect(() => {
  const fetchProblem = async () => {
    try {
      let data;

      if (id === "dummy") {
        data = dummyCodingProblem;
      } else {
        data = await problem_api.problem_get_by_id(Number(id));
      }

      setInitialData({
        title: data.title,
        difficulty: data.difficulty || "easy",
        ratingMode: data.rating_mode || "Hard",
        tags: data.tags || [],
        conditions: data.problem_condition || [""],
        referenceCodes: data.reference_codes?.length > 0
          ? data.reference_codes.map((code: any, index: number) => ({
              language: code.language,
              code: code.code,
              is_main: index === 0,
            }))
          : [{ language: "python", code: "", is_main: true }],
        testCases: data.test_cases?.length > 0
          ? data.test_cases.map((tc: any) => ({
              input: tc.input,
              expected_output: tc.expected_output,
              is_sample: tc.is_sample,
            }))
          : [{ input: "", expected_output: "", is_sample: true }],
      });

      setDescription(data.description || "");
      setProblemType(data.problem_type || "코딩");

      if (editor) {
        editor.commands.setContent(data.description);
      }
    } catch (error) {
      console.error("Failed to fetch problem:", error);
    }
  };

  fetchProblem();
}, [id, editor, setInitialData]);

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
					expected_output: tc.expected_output
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
			alert("Editor is not loaded yet.");
			return;
		}

		const content = editor.getHTML();
		const filteredConditions = conditions.filter((condition) => condition.trim() !== "");

		try {
			await problem_api.problem_update(
				id as string,
				title,
				description,
				difficulty,
				ratingMode,
				tags,
				filteredConditions,
				referenceCodes,
				testCases
			);
			alert("문제가 성공적으로 업데이트되었습니다.");
			router.push(`/registered-problems/view/${id}`);
		} catch (error) {
			console.error("문제 업데이트 실패:", error);
			alert("문제 업데이트 중 오류가 발생했습니다.");
		}
	};

	// 로딩 상태 체크는 모든 훅 호출 이후에
	if (!editor) return <p>Editor is loading...</p>;

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
					🚀 수정완료
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
							<label className="block text-xs font-medium text-gray-700 mb-1">태그 추가</label>
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									placeholder="태그 입력 후 Enter 또는 쉼표"
									className="flex-1 px-3 py-1 border rounded-md text-sm"
									onKeyPress={(e) => {
										if (e.key === 'Enter' || e.key === ',') {
											e.preventDefault();
											const input = e.target as HTMLInputElement;
											const newTag = input.value.trim();
											if (newTag && !tags.includes(newTag)) {
												setTags([...tags, newTag]);
												input.value = '';
											}
										}
									}}
									onBlur={(e) => {
										const newTag = e.target.value.trim();
										if (newTag && !tags.includes(newTag)) {
											setTags([...tags, newTag]);
											e.target.value = '';
										}
									}}
								/>
								<button
									type="button"
									onClick={(e) => {
										const input = e.currentTarget.previousElementSibling as HTMLInputElement;
										const newTag = input.value.trim();
										if (newTag && !tags.includes(newTag)) {
											setTags([...tags, newTag]);
											input.value = '';
										}
									}}
									className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
								>
									추가
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{tags.map((tag, idx) => (
									<span key={idx} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1">
										{tag}
										<button
											type="button"
											className="text-red-500 hover:text-red-700"
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

				{/* 오른쪽: 문제 유형에 따라 분기 렌더링 */}
{problemType === "코딩" || problemType === "디버깅" ? (
  // ✅ 참조 코드 에디터: 코딩/디버깅 유형일 때만 표시
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
) : problemType === "객관식" ? (
  // ✅ 객관식 보기 및 정답 UI
  <div className="w-1/2">
    <h2 className="text-sm font-semibold mb-2">✅ 객관식 정답 및 항목</h2>
    <p className="text-gray-500 text-xs mb-2">👉 여기에 객관식 항목 UI 들어갈 예정</p>
    {/* TODO: 객관식 항목들 UI 구성 예정 */}
  </div>
) : problemType === "주관식" ? (
  // ✅ 주관식 정답 입력 (AI 채점 기준)
  <div className="w-1/2">
    <h2 className="text-sm font-semibold mb-2">📝 주관식 정답 (AI 채점 기준)</h2>
    <textarea
      className="w-full h-40 text-sm border rounded p-2"
      placeholder="AI 채점 기준 입력..."
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />
  </div>
) : problemType === "단답형" ? (
  // ✅ 단답형 정답 입력
  <div className="w-1/2">
    <h2 className="text-sm font-semibold mb-2">✏️ 단답형 정답</h2>
    <textarea
      className="w-full h-20 text-sm border rounded p-2"
      placeholder="예상 정답을 입력하세요"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />
  </div>
) : null}
			</div>

			{(problemType === "코딩" || problemType === "디버깅") && (
  <>
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
  </>
)}
		</div>
	);
}
