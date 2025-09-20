// components/AnswerRenderer.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import type {
  CodingProblem,
  MultipleChoiceProblem,
  ShortAnswerProblem,
  SubjectiveProblem,
  ProblemDetail,
} from "@/lib/api";
import { solve_api } from "@/lib/api";

type ProblemVariant =
  | CodingProblem
  | MultipleChoiceProblem
  | ShortAnswerProblem
  | SubjectiveProblem;

interface AnswerRendererProps {
  problem: ProblemVariant | ProblemDetail;
  /** 목록 또는 단일 객체 아무거나 */
  solveData: any;
  /** 있으면 이 solve를 최우선으로 선택 */
  solveId?: number | string;
  /** 없으면 이 유저의 최신 제출을 우선 선택 */
  currentUserId?: string;
  /** true면 답 본문이 없을 때 solve_id 상세 재조회 */
  autofetchDetail?: boolean;
  /** 디버그 박스 표시 */
  debug?: boolean;
}

/** 공백/대소문자 무시 비교 */
const norm = (v: string) => v.replace(/\s+/g, " ").trim().toLowerCase();

/** 안전한 문자열화 */
function toInlineString(val: any): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if ("code" in val && typeof (val as any).code === "string")
      return (val as any).code;
    if ("text" in val && typeof (val as any).text === "string")
      return (val as any).text;
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}
//단답형 답 잘넣어지게끔
function parseListStringSafely(s: string): string[] | null {
  if (typeof s !== "string") return null;
  const t = s.trim();
  if (!t.startsWith("[") || !t.endsWith("]")) return null;
  try {
    // 서버가 작은따옴표로 내려주는 경우를 대비해 " 로 치환
    const jsonish = t.replace(/'/g, '"');
    const parsed = JSON.parse(jsonish);
    return Array.isArray(parsed) ? parsed.map((x) => String(x)) : null;
  } catch {
    return null;
  }
}

/** 서버에서 오는 타입 이름 보정 (동의어/오타 흡수) */
function coerceProblemType(t: any): ProblemVariant["problemType"] | undefined {
  const raw = String(t ?? "").trim();
  if (!raw) return undefined;
  if (raw === "단답식") return "단답형";
  return raw as any;
}

/** solveData가 배열이면 규칙에 따라 한 건 선택 */
function pickOneSolve(
  solveData: any,
  opts: {
    solveId?: number | string;
    currentUserId?: string;
    fallbackType?: ProblemVariant["problemType"];
  }
) {
  if (!Array.isArray(solveData)) return solveData;
  const { solveId, currentUserId, fallbackType } = opts;
  const parseTime = (t: any) => new Date(t ?? 0).getTime() || 0;

  const fixed = solveData.map((s) => ({
    ...s,
    problemType: coerceProblemType(s?.problemType),
  }));

  // 1) solveId 매칭
  if (solveId != null) {
    const one = fixed.find(
      (x) => String(x.solve_id ?? x.id) === String(solveId)
    );
    if (one) return one;
  }
  // 2) 내 제출 최신
  if (currentUserId) {
    const mine = fixed.filter((x) => x.user_id === currentUserId);
    if (mine.length) {
      mine.sort((a, b) => parseTime(b.timestamp) - parseTime(a.timestamp));
      return mine[0];
    }
  }
  // 3) 같은 타입 최신
  if (fallbackType) {
    const same = fixed.filter((x) => x.problemType === fallbackType);
    if (same.length) {
      same.sort((a, b) => parseTime(b.timestamp) - parseTime(a.timestamp));
      return same[0];
    }
  }
  // 4) 전체 최신
  const all = [...fixed];
  all.sort((a, b) => parseTime(b.timestamp) - parseTime(a.timestamp));
  return all[0] ?? null;
}

/** 제출 객체에 “답 본문”이 들어있는지 간단 판별 */
function hasAnswerPayload(s: any, type?: ProblemVariant["problemType"]) {
  const t = type ?? coerceProblemType(s?.problemType);
  if (!t || !s) return false;
  switch (t) {
    case "코딩":
    case "디버깅":
      return !!(s?.submitted_code || s?.code || s?.codes || s?.answer_code);
    case "객관식":
      return (
        s?.selected_options != null ||
        s?.selected_index != null ||
        s?.selected_indices != null
      );
    case "단답형":
      return (
        (Array.isArray(s?.answers) && s?.answers.length > 0) ||
        !!s?.submitted_text ||
        !!s?.answer_text
      );
    case "주관식":
      return !!(
        s?.written_text ||
        s?.submitted_text ||
        s?.text ||
        s?.answer ||
        s?.essay ||
        s?.content
      );
    default:
      return false;
  }
}

/** solve 응답 정규화 → 렌더용 */
function normalizeSolve(
  raw: any,
  fallbackType?: ProblemVariant["problemType"]
): {
  type?: ProblemVariant["problemType"];
  raw?: any;
  code?: string;
  language?: string;
  selectedOptions?: number[];
  answers?: string[];
  writtenText?: string;
} {
  const type = coerceProblemType(raw?.problemType) ?? fallbackType;
  const n: any = { type, raw };

  switch (type) {
    case "코딩":
    case "디버깅": {
      let codeCandidate: any =
        raw?.submitted_code ??
        raw?.code ??
        raw?.codes ?? // codes도 허용 (문자열 또는 {code,language}일 수 있음)
        raw?.answer_code;
      let langCandidate: any = raw?.code_language ?? raw?.language ?? raw?.lang;

      // codes가 객체/배열일 때 보정
      if (!codeCandidate && raw?.codes) {
        const c = Array.isArray(raw.codes)
          ? raw.codes.find((x: any) => typeof x?.code === "string")
          : raw.codes;
        if (c?.code) codeCandidate = c.code;
        if (!langCandidate && c?.language) langCandidate = c.language;
      }

      // 깊은 곳 탐색(최대 2단)
      if (!codeCandidate && raw?.answer && typeof raw.answer === "object")
        codeCandidate = raw.answer.code;
      if (!langCandidate && raw?.answer && typeof raw.answer === "object")
        langCandidate = raw.answer.language;

      n.code = toInlineString(codeCandidate ?? "");
      n.language = toInlineString(langCandidate ?? "");
      break;
    }

    case "객관식": {
      let arr =
        raw?.selected_options ??
        raw?.selectedOptions ??
        raw?.selected_indices ??
        raw?.selected_index;
      if (arr == null) {
        if (Array.isArray(raw?.answer)) arr = raw?.answer;
        else if (typeof raw?.answer === "number") arr = [raw?.answer];
      }
      n.selectedOptions = Array.isArray(arr)
        ? arr.map((x) => Number(x))
        : arr != null
        ? [Number(arr)]
        : [];
      break;
    }

    case "단답형": {
      let a =
        raw?.answers ??
        raw?.answer_text ??
        raw?.submitted_text ??
        raw?.submittedText ??
        raw?.text;

      // ✅ 문자열이 "[...]" 꼴이면 배열로 복구
      if (typeof a === "string") {
        const parsed = parseListStringSafely(a);
        if (parsed) a = parsed;
      }

      if (a == null && typeof raw?.answer === "string") a = [raw?.answer];
      if (a == null && typeof raw?.answer === "object" && raw?.answer?.text)
        a = [raw?.answer?.text];
      if (typeof a === "string") a = [a];

      n.answers = Array.isArray(a) ? a.map(toInlineString) : [];
      break;
    }

    case "주관식": {
      const candidate =
        raw?.written_text ??
        raw?.submitted_text ??
        raw?.writtenText ??
        raw?.content?.text ??
        raw?.content ??
        raw?.essay ??
        raw?.answer ??
        raw?.text;
      n.writtenText = toInlineString(candidate ?? "");
      break;
    }
    default:
      break;
  }
  return n;
}

export default function AnswerRenderer({
  problem,
  solveData,
  solveId,
  currentUserId,
  autofetchDetail = true,
  debug = false,
}: AnswerRendererProps) {
  const fallbackType = (problem as any)
    ?.problemType as ProblemVariant["problemType"];

  // 1) 우선 규칙에 따라 한 건 선택
  const picked = useMemo(
    () => pickOneSolve(solveData, { solveId, currentUserId, fallbackType }),
    [solveData, solveId, currentUserId, fallbackType]
  );

  // 2) 필요 시 상세 재조회해서 보강
  const [hydrated, setHydrated] = useState<any>(picked);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHydrated(picked);
      if (!autofetchDetail) return;
      if (!picked?.solve_id) return;
      const t = coerceProblemType(picked?.problemType) ?? fallbackType;
      if (hasAnswerPayload(picked, t)) return; // 이미 답 본문이 있으면 패스

      try {
        const detail = await solve_api.solve_get_by_solve_id(picked.solve_id);
        if (!cancelled) setHydrated(detail ?? picked);
      } catch {
        // 상세 없으면 그냥 picked 유지
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [picked, autofetchDetail, fallbackType]);

  // 3) 렌더용으로 정규화
  const s = useMemo(
    () => normalizeSolve(hydrated ?? picked, fallbackType),
    [hydrated, picked, fallbackType]
  );

  // 4) 타입 분기 렌더
  switch (fallbackType) {
    case "코딩":
    case "디버깅": {
      return (
        <div className="p-4 bg-white rounded-lg border">
          <h3 className="font-semibold mb-2">내가 제출한 코드</h3>
          <div className="text-sm text-gray-600 mb-2">
            언어: {s.language || "알 수 없음"}
          </div>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
            {toInlineString(s.code) || "제출한 코드가 없습니다."}
          </pre>

          {debug && <DebugBox title="코딩/디버깅 raw" obj={s.raw} />}
        </div>
      );
    }

    case "객관식": {
      const options = (problem as MultipleChoiceProblem).options || [];
      const correct = new Set<number>(
        (problem as MultipleChoiceProblem).correct_answers || []
      );
      const selected = s.selectedOptions ?? [];

      return (
        <div className="p-4 bg-white rounded-lg border">
          <h3 className="font-semibold mb-3">내가 선택한 보기</h3>
          {selected.length === 0 ? (
            <p className="text-gray-500">선택한 보기가 없습니다.</p>
          ) : (
            <ol className="list-decimal list-inside space-y-1">
              {selected.map((idx) => {
                const text = toInlineString(
                  options[idx] ?? `(삭제된 보기 ${idx + 1})`
                );
                const isCorrect = correct.has(idx);
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isCorrect ? "정답" : "오답"}
                    </span>
                    <span className="whitespace-pre-wrap">{text}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {debug && <DebugBox title="객관식 raw" obj={s.raw} />}
        </div>
      );
    }

    case "단답형": {
      const correctListRaw = (problem as ShortAnswerProblem).answer_text || [];
      const correctList = correctListRaw.map(toInlineString);
      const correctSet = new Set(correctList.map(norm));
      const myAnswers = (s.answers ?? []).map(toInlineString);

      return (
        <div className="p-4 bg-white rounded-lg border">
          <h3 className="font-semibold mb-3">내가 입력한 답안</h3>
          {myAnswers.length === 0 ? (
            <p className="text-gray-500">입력한 답안이 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {myAnswers.map((ans: string, i: number) => {
                const ok = correctSet.has(norm(ans));
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        ok
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ok ? "정답" : "오답"}
                    </span>
                    <span className="whitespace-pre-wrap">{ans}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {debug && <DebugBox title="단답형 raw" obj={s.raw} />}
        </div>
      );
    }

    case "주관식": {
      const my = s.writtenText ?? "";
      return (
        <div className="p-4 bg-white rounded-lg border prose max-w-none">
          <h3 className="font-semibold mb-2">내가 작성한 서술형 답안</h3>
          {my ? (
            <ReactMarkdown>{String(my)}</ReactMarkdown>
          ) : (
            <p className="text-gray-500">작성한 답안이 없습니다.</p>
          )}
          {debug && <DebugBox title="주관식 raw" obj={s.raw} />}
        </div>
      );
    }

    default:
      return (
        <div className="p-4 bg-white rounded-lg border">
          <p className="text-gray-500">지원되지 않는 문제 유형이야.</p>
          {debug && <DebugBox title="raw" obj={s.raw} />}
        </div>
      );
  }
}

/** 디버깅용 간단 박스 */
function DebugBox({ title, obj }: { title: string; obj: any }) {
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-gray-500">
        {title}
      </summary>
      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-60">
        {(() => {
          try {
            return JSON.stringify(obj, null, 2);
          } catch {
            return String(obj);
          }
        })()}
      </pre>
    </details>
  );
}
