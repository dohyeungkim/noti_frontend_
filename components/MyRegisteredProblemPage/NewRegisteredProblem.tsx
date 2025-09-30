"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { EditorContent } from "@tiptap/react"
import { motion } from "framer-motion";
import { problem_api } from "@/lib/api";
import { run_code_example_api } from "@/lib/api";
import type { ReferenceCodeRequest, BaseCodeRequest } from "@/lib/api";

// import Toolbar from "../markdown/Toolbar"
import { useProblemForm, type ProblemType } from "@/hooks/useProblemForm";
import { useProblemEditor } from "@/hooks/useProblemEditor";
// import ProblemBasicInfo from "../ProblemForm/ProblemBasicInfo"
import ReferenceCodeEditor from "../ProblemForm/ReferenceCodeEditor";
import ProblemConditions from "../ProblemForm/ProblemConditions";
import TestCaseSection from "../ProblemForm/TestCaseSection";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import ReactMarkdown from "react-markdown";

// 문제 유형
const PROBLEM_TYPES: { value: ProblemType; label: string; color: string }[] = [
  { value: "코딩", label: "코딩", color: "bg-blue-100 text-blue-800" },
  { value: "디버깅", label: "디버깅", color: "bg-red-100 text-red-800" },
  { value: "객관식", label: "객관식", color: "bg-green-100 text-green-800" },
  { value: "주관식", label: "주관식", color: "bg-purple-100 text-purple-800" },
  { value: "단답형", label: "단답형", color: "bg-yellow-100 text-yellow-800" },
];

// 객관식 문제 생성 관련 컴포넌트
function MultipleChoiceEditor({
  options,
  setOptions,
  answerIndexes,
  setAnswerIndexes,
}: {
  options: string[];
  setOptions: (opts: string[]) => void;
  answerIndexes: number[];
  setAnswerIndexes: (indexes: number[]) => void;
}) {
  const handleChange = (i: number, value: string) => {
    const updated = [...options];
    updated[i] = value;
    setOptions(updated);
  };

  const handleAdd = () => setOptions([...options, ""]);

  const handleRemove = (i: number) => {
    const updatedOptions = options.filter((_, idx) => idx !== i);
    setOptions(updatedOptions);

    const updatedAnswers = answerIndexes
      .filter((idx) => idx !== i)
      .map((idx) => (idx > i ? idx - 1 : idx));
    setAnswerIndexes(updatedAnswers);
  };

  const toggleAnswer = (i: number) => {
    if (answerIndexes.includes(i)) {
      setAnswerIndexes(answerIndexes.filter((idx) => idx !== i));
    } else {
      setAnswerIndexes([...answerIndexes, i]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        객관식 보기 및 정답 선택 (복수 선택 가능)
      </label>
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
          <button
            onClick={() => handleRemove(i)}
            type="button"
            className="text-red-500 text-sm"
          >
            삭제
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        type="button"
        className="text-blue-600 text-sm hover:underline mt-1 w-fit"
      >
        + 항목 추가
      </button>
    </div>
  );
}

export default function NewRegisteredProblem() {
  // 실행 결과(각 테스트케이스의 출력)
  const [runOutputs, setRunOutputs] = useState<string[]>([]);
  // 실행 로그/에러 메시지(옵션)
  const [runError, setRunError] = useState<string | null>(null);
  // 실행 중 표시
  const [isRunning, setIsRunning] = useState(false);
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [testResults, setTestResults] = useState<(boolean | null)[]>([]);
  const [baseCode, setBaseCode] = useState<string>("");

  // 문제 유형 및 배점 추가
  const [problemType, setProblemType] = useState<ProblemType>("코딩");
  const [problemScore, setProblemScore] = useState<number>(10);

  // 객관식 옵션과 정답 관리
  const [options, setOptions] = useState<string[]>([]);
  // const [correctAnswers, setCorrectAnswers] = useState<number[]>([])
  const [answerIndexes, setAnswerIndexes] = useState<number[]>([]);

  // 단답형 정답과 채점 기준
  const [answerTexts, setAnswerTexts] = useState<string[]>([]);
  const [gradingCriteria, setGradingCriteria] = useState<string[]>([]);

  // 주관식 정답과 채점 기준 (채점기준은 위에꺼랑 ===)
  const [subjectiveAnswer, setSubjectiveAnswer] = useState<string>("");
  const [subjectiveCriteria, setSubjectiveCriteria] = useState<string[]>([]);

  //진형준 추가항목start
  // const [subjectiveRubrics, setSubjectiveRubrics] = useState<string[]>([""])

  // const [options, setOptions] = useState<string[]>(["", ""]) // 객관식 보기 항목
  // const [shortAnswers, setAnswerTexts] = useState<string[]>([""])

  //진형준 추가항목end

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
    loadDraft,
    saveDraft,
  } = useProblemForm();

  const { editor, addLocalImage } = useProblemEditor();

  // 컴포넌트 마운트 시 드래프트 로드
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // 상태 변경 시 드래프트 저장
  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  useEffect(() => {
    switch (problemType) {
      case "코딩":
      case "디버깅":
        setRatingMode("regex");
        break;
      case "단답형":
        setRatingMode("exact");
        break;
      case "주관식":
        setRatingMode("active");
        break;
      default:
        setRatingMode("none");
    }
  }, [problemType]);

  if (!editor) return <p>Editor is loading...</p>;

  // ⬇️ 기존 handleTestRun 전체 교체
  const handleTestRun = async () => {
    setTestResults([]);
    setRunError(null);
    setRunOutputs([]);
    setIsRunning(true);

    if (referenceCodes.length === 0) {
      setIsRunning(false);
      alert("참조 코드가 없습니다.");
      return;
    }
    if (testCases.length === 0) {
      setIsRunning(false);
      alert("테스트케이스가 없습니다.");
      return;
    }

    const mainCode =
      referenceCodes.find((code) => code.is_main) || referenceCodes[0];

    try {
      // textarea 입력을 배열로 정규화, "입력 없음" 처리
      const payload = {
        language: mainCode.language,
        code: mainCode.code,
        // run_code_example_api 타입이 좁다면 as any로 임시 캐스팅 or 타입 확장(AnyRatingMode)
        rating_mode: ratingMode as any,
        test_cases: testCases.map((tc: any) => {
          const noInput =
            tc?.no_input === true ||
            (typeof tc.input === "string" && tc.input.trim() === "X");
          const arr = noInput
            ? []
            : String(tc.input ?? "")
                .split("\n")
                .map((s) => s.replace(/\r$/, ""))
                .filter((s) => s.length > 0);
          return {
            input: arr,
            expected_output: String(tc.expected_output ?? "").replace(
              /\r?\n$/,
              ""
            ),
          };
        }),
      };

      const result = await run_code_example_api.run(payload);

      if (!result || !Array.isArray(result.results)) {
        console.error("API 응답:", result);
        alert("API 응답이 올바르지 않습니다. (테스트케이스 실행 실패)");
        setIsRunning(false);
        return;
      }

      // ✅ 통계/상태 업데이트
      const passedArr = result.results.map((r: any) => !!r.passed);
      const outputsArr = result.results.map((r: any) =>
        typeof r?.output === "string" ? r.output : String(r?.output ?? "")
      );
      setTestResults(passedArr);
      setRunOutputs(outputsArr);

      const passedCount = passedArr.filter(Boolean).length;
      const totalCount = passedArr.length;
      if (passedCount === totalCount) {
        alert(`✅ 모든 테스트케이스 통과!\n성공: ${passedCount}/${totalCount}`);
      } else if (passedCount === 0) {
        alert(`❌ 모든 테스트케이스 실패\n성공: 0/${totalCount}`);
      } else {
        alert(`❌ 일부 테스트케이스 실패\n성공: ${passedCount}/${totalCount}`);
      }
    } catch (error: any) {
      console.error("테스트케이스 실행 실패:", error);
      setRunError(
        error?.message || "테스트케이스 실행 중 오류가 발생했습니다."
      );
      alert(error?.message || "테스트케이스 실행 중 오류가 발생했습니다.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = async () => {
    if (!editor) {
      alert("Editor is not loaded yet.");
      return;
    }

    const filteredConditions = conditions.filter(
      (condition) => condition.trim() !== ""
    );
    const refCodes = referenceCodes.length > 0 ? referenceCodes : [];
    const testCasesPayload =
      testCases.length > 0
        ? testCases.map((tc: any) => {
            const noInput =
              tc?.no_input === true ||
              String(tc?.input ?? "")
                .trim()
                .toUpperCase() === "X" ||
              String(tc?.input ?? "").trim() === "";

            return {
              ...tc,
              input: noInput ? "X" : String(tc.input ?? ""),
              expected_output: String(tc.expected_output ?? "").replace(
                /\r?\n$/,
                ""
              ),
            };
          })
        : [];
    // 문제 생성 Api 호출
    try {
      if (problemType === "코딩") {
        // base_code 파라미터 없이 호출
        await problem_api.problem_create(
          title,
          description,
          difficulty,
          ratingMode as "hard" | "space" | "regex" | "none",
          tags,
          filteredConditions,
          refCodes,
          testCasesPayload,
          "코딩" // problemType 여기는 무조건 "코딩"
        );
      } else if (problemType === "디버깅") {
        // 디버깅 전용 base_code payload
        const basePayload =
          problemType === "디버깅"
            ? [{ language: referenceCodes[0].language, code: baseCode }]
            : undefined;

        await problem_api.problem_create(
          title,
          description,
          difficulty,
          ratingMode as "hard" | "space" | "regex" | "none",
          tags,
          filteredConditions,
          refCodes,
          testCasesPayload,
          "디버깅", // problemType 여기는 무조건 "디버깅"
          basePayload
        );
      } else if (problemType === "객관식") {
        // PROBLEM_TYPES 에서 options, correctAnswers 훑어 오실 거라 가정
        await problem_api.problem_create_multiple_choice(
          title,
          description,
          difficulty,
          tags,
          options, // 추가하신 옵션 리스트
          answerIndexes // 정답 인덱스 배열
        );
      } else if (problemType === "단답형") {
        await problem_api.problem_create_short_answer(
          title,
          description,
          difficulty,
          ratingMode as "exact" | "partial" | "soft" | "none",
          tags,
          answerTexts, // TEXT[] 형식의 정답들
          gradingCriteria // AI 채점 기준
        );
      } else if (problemType === "주관식") {
        await problem_api.problem_create_subjective(
          title,
          description,
          difficulty,
          ratingMode as "active" | "deactive",
          subjectiveAnswer,
          tags,
          subjectiveCriteria // AI 채점 기준
        );

        // 1) API 로 보낼 payload 조립
        const payload = {
          problemType: "subjective",
          title,
          description,
          difficulty,
          ratingMode,
          subjectiveAnswer,
          tags,
          gradingCriteria, // ❌ 이게 시발 안 보내짐 백엔드로... 장난하나
        };

        console.log(
          "▶▶▶ 백엔드로 보내는 payload:",
          JSON.stringify(payload, null, 2)
        );
      }
      alert("문제가 성공적으로 등록되었습니다.");
      localStorage.removeItem("problemDraft");
      router.push("/registered-problems");
    } catch (err) {
      console.error("문제 등록 실패:", err);
      alert("문제 등록 중 오류가 발생했습니다.");
    }
  };

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
          테스트 실행
        </button>
        <button
          onClick={async () => {
            await handleSave();
            router.back();
          }}
          className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg text-sm cursor-pointer
					hover:bg-blue-700 transition-all duration-200 ease-in-out
					active:scale-95 shadow-md"
        >
          등록하기
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                문제 유형
              </label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                태그 추가
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="태그 입력 후 Enter"
                  className="flex-1 px-3 py-1 border rounded-md text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Enter 키를 누를 때 기본 동작(폼 제출 등)을 막기
                      const input = e.target as HTMLInputElement;
                      const newTag = input.value.trim();
                      if (newTag && !tags.includes(newTag)) {
                        setTags([...tags, newTag]);
                        input.value = ""; // 태그 추가 후 입력창 비우기
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const newTag = e.target.value.trim();
                    if (newTag && !tags.includes(newTag)) {
                      setTags([...tags, newTag]);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget
                      .previousElementSibling as HTMLInputElement;
                    const newTag = input.value.trim();
                    if (newTag && !tags.includes(newTag)) {
                      setTags([...tags, newTag]);
                      input.value = "";
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
            <div className="flex gap-4 mb-13">
              {/* 문제 난이도 */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  난이도
                </label>
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
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  채점 모드
                </label>
                <select
                  value={ratingMode}
                  onChange={(e) =>
                    setRatingMode(
                      e.target.value as "hard" | "space" | "regex" | "none"
                    )
                  }
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                >
                  {problemType === "객관식" ? (
                    <option value="None">None</option>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  배점
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="10"
                    max="10"
                    value={problemScore}
                    onChange={(e) =>
                      setProblemScore(parseInt(e.target.value) || 1)
                    }
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              문제 설명
            </label>
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
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                주관식 정답
              </label>
              <textarea
                value={subjectiveAnswer}
                onChange={(e) => setSubjectiveAnswer(e.target.value)}
                placeholder="정답 예시 혹은 기준"
                className="w-full h-24 px-3 py-2 border rounded-md text-sm"
              />
            </div>

            {/* AI 채점 기준 입력 */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                AI채점기준
              </label>
              {subjectiveCriteria.map((rubric, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={rubric}
                    onChange={(e) => {
                      const updated = [...subjectiveCriteria];
                      updated[idx] = e.target.value;
                      setSubjectiveCriteria(updated);
                    }}
                    placeholder={`기준 ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => {
                      const updated = subjectiveCriteria.filter(
                        (_, i) => i !== idx
                      );
                      setSubjectiveCriteria(updated);
                    }}
                    className="text-red-500 text-sm"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setSubjectiveCriteria([...subjectiveCriteria, ""])
                }
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
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                단답형 정답
              </label>
              {answerTexts.map((answer, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      const updated = [...answerTexts];
                      updated[idx] = e.target.value;
                      setAnswerTexts(updated);
                    }}
                    placeholder={`정답 ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => {
                      const updated = answerTexts.filter((_, i) => i !== idx);
                      setAnswerTexts(updated);
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
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                AI채점기준
              </label>
              {gradingCriteria.map((rubric, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={rubric}
                    onChange={(e) => {
                      const updated = [...gradingCriteria];
                      updated[idx] = e.target.value;
                      setGradingCriteria(updated);
                    }}
                    placeholder={`기준 ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => {
                      const updated = gradingCriteria.filter(
                        (_, i) => i !== idx
                      );
                      setGradingCriteria(updated);
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
      {(problemType === "코딩" || problemType === "디버깅") && (
        <div className="mt-4 bg-white shadow-md rounded-xl border border-gray-200">
          <div className="px-4 py-2 border-b text-sm font-semibold text-gray-700 flex items-center justify-between">
            <span>실행 결과</span>
            {isRunning && (
              <span className="text-xs text-gray-500">실행 중...</span>
            )}
          </div>

          {/* 에러 메시지 */}
          {runError ? (
            <div className="p-4">
              <div className="text-red-600 text-sm font-medium mb-1">오류</div>
              <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                {runError}
              </pre>
            </div>
          ) : (
            <div className="p-4">
              {runOutputs.length === 0 ? (
                <p className="text-sm text-gray-500">
                  아직 실행 결과가 없습니다. 상단의 <b>테스트 실행</b>을
                  눌러주세요.
                </p>
              ) : (
                <ul className="space-y-3">
                  {runOutputs.map((out, idx) => {
                    const passed = testResults[idx] ?? null;
                    const hasInput = Array.isArray(testCases[idx]?.input)
                      ? (testCases[idx]?.input as string[]).length > 0
                      : String(testCases[idx]?.input ?? "").trim().length > 0;

                    return (
                      <li
                        key={idx}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="px-3 py-2 flex items-center justify-between">
                          <div className="text-sm font-medium">
                            케이스 {idx + 1}
                          </div>
                          <div className="text-sm">
                            {passed === true && (
                              <span className="text-green-600">✅ 통과</span>
                            )}
                            {passed === false && (
                              <span className="text-red-600">❌ 실패</span>
                            )}
                            {passed === null && (
                              <span className="text-gray-500">-</span>
                            )}
                          </div>
                        </div>
                        <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              실제 출력
                              {!hasInput && (
                                <span className="ml-1 text-[10px] text-gray-400">
                                  (입력 없음)
                                </span>
                              )}
                            </div>
                            <pre className="bg-gray-50 border border-gray-200 rounded-md p-2 text-xs whitespace-pre-wrap break-all">
                              {out}
                            </pre>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      <div className="mb-10"></div>

      {/* 문제 조건 섹션 */}
      {problemType !== "객관식" &&
        problemType !== "주관식" &&
        problemType !== "단답형" && (
          <ProblemConditions
            conditions={conditions}
            addCondition={addCondition}
            removeCondition={removeCondition}
            updateCondition={updateCondition}
          />
        )}
      <div className="mb-10"></div>
      {/* 테스트 케이스 섹션 */}
      {problemType !== "객관식" &&
        problemType !== "주관식" &&
        problemType !== "단답형" && (
          <TestCaseSection
            testCases={testCases}
            addTestCase={addTestCase}
            removeTestCase={removeTestCase}
            updateTestCase={updateTestCase}
            testResults={testResults}
          />
        )}
    </div>
  );
}
