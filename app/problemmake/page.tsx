"use client";
import { useRef, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { problem_api } from "@/lib/api";

type ProblemType = "코딩" | "디버깅" | "객관식" | "주관식" | "단답형";

// JSON 문자열을 객체로 안전하게 파싱하는 헬퍼 함수
const tryParseJson = (value: any) => {
  if (
    typeof value === "string" &&
    ((value.startsWith("[") && value.endsWith("]")) ||
      (value.startsWith("{") && value.endsWith("}")))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

// 문제 유형을 한국어 표준으로 정규화 (영/한/대소문자/스페이스/하이픈 허용 + 추가 별칭)
const normalizeProblemType = (raw: any): ProblemType | null => {
  if (!raw) return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const TYPE_MAP: Record<string, ProblemType> = {
    // 코딩
    코딩: "코딩",
    코딩문제: "코딩",
    coding: "코딩",
    code: "코딩",

    // 디버깅
    디버깅: "디버깅",
    debugging: "디버깅",
    debug: "디버깅",
    디버그: "디버깅",
    코드debug: "디버깅",
    코드_debug: "디버깅",

    // 객관식
    객관식: "객관식",
    multiple_choice: "객관식",
    mcq: "객관식",

    // 단답형
    단답형: "단답형",
    단답식: "단답형",
    short_answer: "단답형",

    // 주관식
    주관식: "주관식",
    subjective: "주관식",
  };

  return TYPE_MAP[s] ?? null;
};

// 엑셀의 한국어/영어 헤더를 내부 표준 키로 매핑
const mapRowAliasesToStandardKeys = (row: any) => {
  const r: any = { ...row };

  // 공백이 많은 헤더 정리 (예: "정답        " -> "정답")
  const normalizedEntries = Object.entries(r).reduce((acc: any, [k, v]) => {
    const nk = String(k).replace(/\s+/g, "").trim();
    acc[nk] = v;
    return acc;
  }, {});

  // 여러 후보 키 중 먼저 있는 값을 선택
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (normalizedEntries[k] != null) return normalizedEntries[k];
    }
    return undefined;
  };

  const out: any = { ...r };

  // type
  out.problem_type =
    out.problem_type ?? out.problemType ?? get("유형", "type", "Type");

  // title
  out.title =
    out.title ??
    get("문제이름", "문제명", "제목", "name", "Name", "title", "Title");

  // description
  out.description =
    out.description ??
    get("문제내용", "내용", "설명", "description", "Description");

  // difficulty
  out.difficulty = out.difficulty ?? get("난이도", "difficulty", "Difficulty");

  // conditions
  out.problem_condition =
    out.problem_condition ?? get("조건", "조건들", "conditions", "condition");

  // test_cases
  out.test_cases =
    out.test_cases ?? get("testcase", "testcases", "테스트케이스");

  // reference_codes (정답 코드)
  out.reference_codes =
    out.reference_codes ??
    get("참조코드", "정답코드", "answercode", "referencecode");

  // base_code (제공 코드/버그 코드)
  out.base_code = out.base_code ?? get("제공코드", "bugcode", "basecode");

  // options (객관식 보기)
  out.options = out.options ?? get("보기", "options", "option");

  // correct_answers (객관식 정답 인덱스)
  out.correct_answers =
    out.correct_answers ?? get("정답", "정답들", "answers", "answerindex");

  // answer_text (단답/주관식)
  out.answer_text =
    out.answer_text ?? get("모범답안", "주관식정답", "단답정답", "answervalue");

  // tags
  out.tags = out.tags ?? get("태그", "tags");

  // grading_criteria
  out.grading_criteria =
    out.grading_criteria ?? get("채점기준", "ai채점기준", "gradingcriteria");

  return out;
};

export default function ProblemMakePage() {
  const currentIndexRef = useRef(0);
  const [deleted, setDeleted] = useState<boolean[]>([]);
  const [fileSelected, setFileSelected] = useState(false);
  const [flattenedProblems, setFlattenedProblems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadProblems = async () => {
    const problemsToUpload = flattenedProblems.filter(
      (problem, i) => problem && typeof problem === "object" && !deleted[i]
    );

    if (problemsToUpload.length === 0) {
      alert("업로드할 문제가 없습니다.");
      return;
    }

    try {
      setIsUploading(true);

      const uploadPromises = problemsToUpload.map((problem) => {
        const {
          title = "",
          description = "",
          difficulty = "",
          problem_type,
          tags = [],
          rating_mode = "none",
          test_cases = [],
          reference_codes = [],
          base_code = [],
          problem_condition = [],
          options = [],
          correct_answers = [],
          answer_text = "",
          grading_criteria = [],
        } = problem;

        const type = (problem_type as ProblemType) || "코딩";

        let finalAnswerText: string | string[] | undefined;
        let finalCorrectAnswers: number[] | undefined;

        if (type === "객관식") {
          finalCorrectAnswers = correct_answers;
          finalAnswerText = undefined;
        } else if (type === "단답형") {
          finalAnswerText = Array.isArray(answer_text)
            ? answer_text
            : [String(answer_text)];
          finalCorrectAnswers = undefined;
        } else if (type === "주관식") {
          finalAnswerText = String(answer_text);
          finalCorrectAnswers = undefined;
        } else {
          finalAnswerText = undefined;
          finalCorrectAnswers = undefined;
        }

        return problem_api.problem_create_by_excel(
          title,
          description,
          difficulty,
          type,
          tags,
          rating_mode,
          test_cases,
          reference_codes,
          base_code,
          problem_condition,
          options,
          finalCorrectAnswers,
          finalAnswerText,
          grading_criteria
        );
      });

      await Promise.all(uploadPromises);
      alert("선택된 문제들이 성공적으로 업로드되었습니다. 🎉");

      setFileSelected(false);
      setFlattenedProblems([]);
      setDeleted([]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      console.error(`🛑 문제 업로드 오류: ${errorMessage}`);
      alert(`문제 업로드 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentIndex((i) => {
          const newIndex = Math.min(i + 1, flattenedProblems.length - 1);
          currentIndexRef.current = newIndex;
          return newIndex;
        });
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => {
          const newIndex = Math.max(i - 1, 0);
          currentIndexRef.current = newIndex;
          return newIndex;
        });
      }
      if (e.code === "Space") {
        e.preventDefault();
        const idx = currentIndexRef.current;
        setDeleted((prev) => {
          const copy = [...prev];
          copy[idx] = !copy[idx];
          return copy;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flattenedProblems]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    const reader = new FileReader();

    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (!result) return;

      const workbook = XLSX.read(result, {
        type: isXlsx ? "binary" : "string",
        codepage: 65001,
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const processedData = rawData.map((row) => {
        // 1) 헤더 별칭 → 내부 표준 키로 통일
        let newRow: any = mapRowAliasesToStandardKeys(row);

        // 2) problemType로 들어온 경우 병합(안전)
        if (newRow.problem_type == null && newRow.problemType != null) {
          newRow.problem_type = newRow.problemType;
        }

        // 3) JSON 문자열 필드 파싱
        for (const key of [
          "tags",
          "test_cases",
          "reference_codes",
          "base_code",
          "problem_condition",
          "options",
          "correct_answers",
          "grading_criteria",
        ]) {
          newRow[key] = tryParseJson(newRow[key]);
        }

        // 4) 타입 정규화
        newRow.problem_type = normalizeProblemType(newRow.problem_type);

        // 5) 단답/객관식 보정
        if (newRow.problem_type === "단답형" && newRow.answer_text != null) {
          newRow.answer_text = Array.isArray(newRow.answer_text)
            ? newRow.answer_text
            : [String(newRow.answer_text)];
        }
        if (newRow.problem_type === "객관식") {
          if (typeof newRow.options === "string") {
            // "보기1, 보기2" 형태일 경우
            newRow.options = newRow.options
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
          if (typeof newRow.correct_answers === "string") {
            // "1,3" → [1,3]
            const trimmed = newRow.correct_answers.replace(/\s/g, "");
            newRow.correct_answers = trimmed
              ? trimmed.split(",").map((x: string) => Number(x))
              : [];
          }
        }

        return newRow;
      });

      const newCategorized: Record<ProblemType, any[]> = {
        코딩: [],
        디버깅: [],
        객관식: [],
        주관식: [],
        단답형: [],
      };

      // 정규화 실패(null) 타입은 스킵
      processedData.forEach((row) => {
        const type = row.problem_type as ProblemType | null;
        if (!type) return;
        newCategorized[type].push(row);
      });

      const flatList = Object.values(newCategorized).flat();
      setFlattenedProblems(flatList);
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      setDeleted(Array(flatList.length).fill(false));
      setFileSelected(true);
    };

    if (isXlsx) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file, "utf-8");
    }
  };

  return (
    <div className="p-6">
      {!fileSelected && (
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileUpload}
          className="mb-6"
        />
      )}

      {flattenedProblems.length > 0 &&
        (() => {
          const problem = flattenedProblems[currentIndex];
          if (!problem) return null;

          // 이미 정규화된 한국어 표준 타입
          const type = (problem.problem_type || "") as ProblemType;

          const isDebug = type === "디버깅";
          const isMCQ = type === "객관식";
          const isShort = type === "단답형";
          const isSubjective = type === "주관식";
          const title: string = problem.title || "";
          const tags: string[] = Array.isArray(problem.tags)
            ? problem.tags
            : [];
          const difficulty: string = problem.difficulty || "";
          const description: string = problem.description || "";
          const conditions: string = problem.problem_condition || "";

          const examples: string =
            typeof problem.test_cases === "object"
              ? JSON.stringify(problem.test_cases, null, 2)
              : problem.test_cases || "";

          const answerCode: string =
            typeof problem.reference_codes === "object"
              ? JSON.stringify(problem.reference_codes, null, 2)
              : problem.reference_codes || "";

          const baseCode: string =
            typeof problem.base_code === "object"
              ? JSON.stringify(problem.base_code, null, 2)
              : problem.base_code || "";

          const options: string[] = Array.isArray(problem.options)
            ? problem.options
            : typeof problem.options === "string"
            ? problem.options.split(",").map((opt: string) => opt.trim())
            : [];

          const correctAnswers = Array.isArray(problem.correct_answers)
            ? problem.correct_answers
            : typeof problem.correct_answers === "string"
            ? [problem.correct_answers]
            : [];

          const answerText: string = problem.answer_text || "";
          const gradingCriteria: string = problem.grading_criteria || "";

          return (
            <div
              className={`flex flex-col md:flex-row items-stretch gap-4 p-6 w-full border rounded mb-6 shadow min-h-[400px] ${
                deleted[currentIndex]
                  ? "bg-red-100 border-red-400 text-red-700 opacity-70"
                  : "bg-white"
              }`}
            >
              {/* 왼쪽 영역 */}
              <div className="w-full md:w-1/2 flex flex-col gap-4 justify-between">
                <div>
                  <label className="font-bold">문제 이름</label>
                  <input
                    type="text"
                    value={title}
                    readOnly
                    className="w-full border rounded p-2 mt-1 bg-gray-100"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="font-bold">난이도</label>
                    <input
                      type="text"
                      value={difficulty}
                      readOnly
                      className="w-full border rounded p-2 mt-1 bg-gray-100"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="font-bold">문제 유형</label>
                    <input
                      type="text"
                      value={type}
                      readOnly
                      className="w-full border rounded p-2 mt-1 bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold">문제 설명</label>
                  <textarea
                    rows={3}
                    value={description}
                    readOnly
                    className="w-full border rounded p-2 mt-1 bg-gray-100 resize-none"
                  />
                </div>
                {!isMCQ && !isShort && !isSubjective && (
                  <div>
                    <label className="font-bold">문제 조건</label>
                    <textarea
                      rows={2}
                      value={conditions}
                      readOnly
                      className="w-full border rounded p-2 mt-1 bg-gray-100 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* 오른쪽 영역 */}
              <div className="w-full md:w-1/2 flex flex-col h-full">
                {!isMCQ && !isShort && !isSubjective && (
                  <div>
                    <label className="font-bold">입출력 예시</label>
                    <textarea
                      value={examples}
                      readOnly
                      className="
                        w-full border rounded p-2 mt-1 bg-gray-100 font-mono resize-none
                        overflow-y-auto
                        min-h-[calc(1.5rem*3)] max-h-[calc(1.5rem*3)]
                      "
                    />
                  </div>
                )}

                {!isMCQ && !isShort && !isSubjective && (
                  <>
                    <label className="font-bold">정답 코드</label>
                    <div className="flex-1 border rounded p-2 mt-1 font-mono bg-gray-100 overflow-y-auto min-h-[calc(1.5rem*3)] max-h-[calc(1.5rem*3)]">
                      <pre className="whitespace-pre-wrap break-words">
                        {answerCode}
                      </pre>
                    </div>
                  </>
                )}

                {isDebug && (
                  <>
                    <label className="font-bold mt-6">제공 코드</label>
                    <div className="flex-1 border rounded p-2 mt-1 font-mono bg-gray-100 overflow-auto min-h-[144px] max-h-[400px] h-full">
                      <pre className="whitespace-pre-wrap break-words h-full">
                        {baseCode}
                      </pre>
                    </div>
                  </>
                )}

                {isMCQ && (
                  <>
                    <label className="font-bold">보기</label>
                    <div className="border rounded p-2 mt-1 bg-gray-100 space-y-2">
                      {options.length > 0 ? (
                        options.map((opt, i) => (
                          <div key={i} className="text-sm">
                            {i + 1}. {opt}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">보기 없음</div>
                      )}
                    </div>

                    <label className="font-bold mt-6">정답</label>
                    <div className="border rounded p-2 mt-1 bg-gray-100">
                      {correctAnswers.length > 0
                        ? correctAnswers.join(", ")
                        : "정답 없음"}
                    </div>
                  </>
                )}

                {(isShort || isSubjective) && (
                  <>
                    <label className="font-bold">정답</label>
                    <div className="border rounded p-2 mt-1 bg-gray-100">
                      {answerText || "정답 없음"}
                    </div>
                    <label className="font-bold mt-6">AI채점기준</label>
                    <div className="border rounded p-2 mt-1 bg-gray-100">
                      {gradingCriteria || "채점 기준 없음"}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

      {flattenedProblems.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-700 font-medium">
          <button
            onClick={() =>
              setCurrentIndex((i) => {
                const newIndex = Math.max(i - 1, 0);
                currentIndexRef.current = newIndex;
                return newIndex;
              })
            }
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-100 border rounded disabled:opacity-50"
          >
            ←
          </button>

          <div className="text-sm">
            ({currentIndex + 1} / {flattenedProblems.length})
          </div>

          <button
            onClick={() =>
              setCurrentIndex((i) => {
                const newIndex = Math.min(i + 1, flattenedProblems.length - 1);
                currentIndexRef.current = newIndex;
                return newIndex;
              })
            }
            disabled={currentIndex === flattenedProblems.length - 1}
            className="px-4 py-2 bg-gray-100 border rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}

      {flattenedProblems.length > 0 && (
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={() =>
              setDeleted((prev) => {
                const copy = [...prev];
                copy[currentIndex] = !copy[currentIndex];
                return copy;
              })
            }
            className="text-sm px-4 py-1 border rounded bg-gray-100"
          >
            {deleted[currentIndex] ? "복구하기" : "삭제하기 (스페이스바)"}
          </button>

          <button
            onClick={uploadProblems}
            className="text-sm px-4 py-2 border rounded bg-green-100 text-green-800 font-semibold disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? "업로드 중..." : "문제 업로드"}
          </button>
        </div>
      )}
    </div>
  );
}
