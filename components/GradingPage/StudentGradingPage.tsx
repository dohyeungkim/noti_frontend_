"use client"
// 교수자가 피드백 쓸 수 있어야됨!!

import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"
import { group_api, grading_api, ai_feedback_api, code_log_api } from "@/lib/api" // ★ code_log_api 추가
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { feedbackDummy } from "@/data/examModeFeedbackDummy"
import { motion } from "framer-motion"
import type { SubmissionSummary } from "@/lib/api"
import { gradingDetailDummy } from "@/data/gradingDummy"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface Submission {
  submissionId: number
  problemId: number
  answerType: string
  answer: string
  score: number
}

export default function StudentGradingPage() {
  const { groupId, examId, studentId } = useParams() as {
    groupId: string
    examId: string
    studentId: string
  }
  const router = useRouter()
  const { userName } = useAuth()

  const [groupOwner, setGroupOwner] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [studentName, setStudentName] = useState<string>("")
  const [currentIdx, setCurrentIdx] = useState(0)

  // === (NEW) 최신 코드 로그 캐시: solve_id → { code, timestamp } ===
  const [latestLogCache, setLatestLogCache] = useState<Record<number, { code: string; timestamp: string }>>({})

  // 응답이 평행배열이든 객체배열이든 안전하게 "가장 마지막"을 고르는 유틸
  function pickLatestLog(data: any): { code: string; timestamp: string } | null {
    // A) { code_logs: string[], timestamp: string[] }
    if (Array.isArray(data?.code_logs) && Array.isArray(data?.timestamp)) {
      const zipped = data.code_logs
        .map((code: string, i: number) => ({ code, timestamp: data.timestamp[i] }))
        .filter((x: any) => !!x?.timestamp)
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      return zipped.at(-1) ?? null
    }
    // B) [{ code, timestamp }, ...]
    if (Array.isArray(data) && data.length) {
      const arr = data
        .filter((x) => typeof x?.timestamp === "string" && typeof x?.code === "string")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      return arr.at(-1) ?? null
    }
    return null
  }

  // --- 데이터 로딩: 제출 목록 ---
  const fetchSubmissions = useCallback(async () => {
    try {
      const allSubs: SubmissionSummary[] = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId),
        studentId
      )

      // 기존 로직 유지(더미 메타로 기본 값 구성). 실제 표시값은 최신 로그가 있으면 그걸 사용.
      const grouped = allSubs.reduce((acc: Submission[], s) => {
        const meta = gradingDetailDummy.problems.find((p) => p.problemId === s.problem_id)
        acc.push({
          submissionId: s.submission_id,
          problemId: s.problem_id,
          answerType: meta?.type || "text",
          answer: meta?.answer || "",
          score: s.score ?? 0,
        })
        return acc
      }, [])
      setSubmissions(grouped)
      setStudentName(allSubs[0]?.user_name || "")
    } catch (err) {
      console.error("학생 제출물 불러오기 실패", err)
    }
  }, [groupId, examId, studentId])

  // --- 최초 로딩: 그룹장 확인 + 제출 목록 ---
  useEffect(() => {
    group_api
      .my_group_get()
      .then((data) => {
        const grp = data.find((g: any) => g.group_id === Number(groupId))
        setGroupOwner(grp?.group_owner ?? null)
      })
      .catch(console.error)

    fetchSubmissions()
  }, [groupId, fetchSubmissions])

  const isGroupOwner = userName === groupOwner
  const lastIdx = submissions.length - 1
  const current = submissions[currentIdx]

  // === (NEW) 현재 제출의 코드 로그 로드 & 캐시 ===
  useEffect(() => {
    const solveId = current?.submissionId
    if (!solveId) return
    if (latestLogCache[solveId]) return // 캐시에 있으면 스킵

    let cancelled = false
    ;(async () => {
      try {
        const data = await code_log_api.code_logs_get_by_solve_id(solveId)
        if (cancelled) return
        const last = pickLatestLog(data)
        if (last) {
          setLatestLogCache((prev) => ({ ...prev, [solveId]: last }))
        } else {
          // 못 찾았어도 캐싱해서 중복 요청 방지
          setLatestLogCache((prev) => ({ ...prev, [solveId]: { code: "", timestamp: "" } }))
        }
      } catch (e) {
        console.error("코드 로그 로드 실패:", e)
        setLatestLogCache((prev) => ({ ...prev, [solveId]: { code: "", timestamp: "" } }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [current?.submissionId, latestLogCache])

  // --- 네비게이션 ---
  const goPrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1)
    else router.back()
  }, [currentIdx, router])

  const goNext = useCallback(() => {
    if (currentIdx < lastIdx) setCurrentIdx((i) => i + 1)
  }, [currentIdx, lastIdx])

  // --- 문제 메타 / 점수 ---
  const problemMeta = useMemo(
    () => gradingDetailDummy.problems.find((p) => p.problemId === current?.problemId),
    [current?.problemId]
  )
  const maxScore = problemMeta?.score ?? 0

  const [isEditingScore, setIsEditingScore] = useState(false)
  const [editedScore, setEditedScore] = useState(current?.score ?? 0)

  useEffect(() => {
    if (current) setEditedScore(current.score)
  }, [current])

  const saveEditedScore = useCallback(async () => {
    if (!current) return
    try {
      await grading_api.post_submission_score(current.submissionId, editedScore)
      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = { ...next[currentIdx], score: editedScore }
        return next
      })
      setIsEditingScore(false)
    } catch (e) {
      alert("점수 저장 실패")
    }
  }, [currentIdx, current, editedScore])

  const handleCompleteReview = useCallback(() => {
    if (!isGroupOwner) {
      alert("접근 권한이 없습니다")
      return
    }
    router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
  }, [groupId, examId, isGroupOwner, router])

  // --- 피드백 탭 상태 ---
  const { professorFeedback: dummyProfessorFeedback } = feedbackDummy
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"ai" | "professor">("ai")

  // 교수 피드백 (지금은 로컬 편집만, 필요 시 API 연결)
  const [isEditingProfessor, setIsEditingProfessor] = useState(false)
  const [newProfessorFeedback, setNewProfessorFeedback] = useState(dummyProfessorFeedback)

  // --- AI 피드백 로딩 상태 ---
  const [aiFeedback, setAiFeedback] = useState<string>("")
  const [isAILoaded, setIsAILoaded] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const fetchAiFeedback = useCallback(async (solveId: number) => {
    setIsAILoaded(false)
    setAiError(null)
    try {
      const data: any = await ai_feedback_api.get_ai_feedback(solveId)
      const text =
        (typeof data === "string" && data) ||
        data?.feedback ||
        data?.ai_feedback ||
        data?.message ||
        (Array.isArray(data) ? data.join("\n") : JSON.stringify(data, null, 2))
      setAiFeedback(text || "내용이 없습니다.")
    } catch (e: any) {
      setAiFeedback("")
      setAiError(e?.message || "AI 피드백 로드 실패")
    } finally {
      setIsAILoaded(true)
    }
  }, [])

  // 현재 제출 변경 시 AI 피드백 호출 (기존 유지)
  useEffect(() => {
    if (!current?.submissionId) return
    let cancelled = false
    ;(async () => {
      await fetchAiFeedback(current.submissionId)
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [current?.submissionId, fetchAiFeedback])

  // 조건 검사는 일단 총점 기준 (기존 유지)
  const passedCondition = (current?.score ?? 0) >= maxScore
  const conditionFeedback = passedCondition ? "조건을 충족했습니다." : "다시 확인해주세요."

  if (submissions.length === 0) {
    return (
      <motion.div
        className="w-full min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p>제출물을 불러오는 중...</p>
      </motion.div>
    )
  }

  // === (NEW) 에디터 표시용 파생값 ===
  const latestLog = current?.submissionId ? latestLogCache[current.submissionId] : undefined
  const effectiveAnswerType = current?.answerType === "code" ? "code" : "text"
  const effectiveLanguage = effectiveAnswerType === "code" ? "javascript" : "plaintext"
  const fallbackAnswer =
    typeof current?.answer === "string" ? current.answer : JSON.stringify(current?.answer ?? "", null, 2)
  // 🚩 최신 로그가 있으면 그 코드, 없으면 기존 current.answer 유지
  const effectiveAnswer = latestLog?.code ?? fallbackAnswer

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 max-w-7xl mx-auto p-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <button onClick={goPrev} className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
            {currentIdx > 0 ? <ChevronLeft /> : <ArrowLeft />} {currentIdx > 0 ? "이전 문제" : "목록으로"}
          </button>
          <h2 className="text-lg font-bold">
            {studentName} – 문제 {current?.problemId} ({current?.score}점)
          </h2>
          <button
            onClick={goNext}
            disabled={currentIdx === lastIdx}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 disabled:opacity-40"
          >
            다음 문제 <ChevronRight />
          </button>
        </div>

        {/* 본문: 좌 코드/답안, 우 피드백 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌: 답안 뷰어 */}
          <motion.div
            className="bg-white rounded-lg shadow border p-4 h-[600px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            // 문제/답안 변경 시 리마운트로 값/하이라이팅 보장
            key={`${current?.submissionId ?? "no-sub"}-${effectiveAnswerType}`}
          >
            {effectiveAnswer == null ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                답안 불러오는 중…
              </div>
            ) : (
              <MonacoEditor
                height="100%"
                language={effectiveLanguage} // defaultLanguage 대신 language 사용
                value={effectiveAnswer}
                options={{ readOnly: true, minimap: { enabled: false }, wordWrap: "on", fontSize: 14 }}
              />
            )}
          </motion.div>

          {/* 우: 피드백 */}
          <motion.div
            className="bg-white rounded-lg shadow border flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex border-b items-center">
              <button
                className={`flex-1 py-2 text-center ${activeFeedbackTab === "ai" ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
                onClick={() => setActiveFeedbackTab("ai")}
              >
                AI 피드백
              </button>
              <button
                className={`flex-1 py-2 text-center ${activeFeedbackTab === "professor" ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
                onClick={() => setActiveFeedbackTab("professor")}
              >
                교수 피드백
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {activeFeedbackTab === "ai" ? (
                !isAILoaded ? (
                  <p className="text-sm text-gray-500">AI 피드백 로딩 중...</p>
                ) : aiError ? (
                  <div className="text-sm text-red-600 space-y-2">
                    <div>{aiError}</div>
                    <button
                      className="underline"
                      onClick={() => current?.submissionId && fetchAiFeedback(current.submissionId)}
                    >
                      다시 시도
                    </button>
                  </div>
                ) : (
                  <div className="prose prose-sm">
                    <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                  </div>
                )
              ) : (
                <div className="prose prose-sm">
                  {!isEditingProfessor ? (
                    <>
                      <ReactMarkdown>{newProfessorFeedback}</ReactMarkdown>
                      <div className="mt-3">
                        <button
                          onClick={() => setIsEditingProfessor(true)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        >
                          ✏️ 편집
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        className="w-full h-56 border rounded p-2 text-sm"
                        value={newProfessorFeedback}
                        onChange={(e) => setNewProfessorFeedback(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingProfessor(false)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setIsEditingProfessor(false)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* 조건 검사 결과 */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-2">조건 검사 결과</h3>
          <div
            className={`p-3 rounded-lg border-l-4 ${
              passedCondition ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium">{problemMeta?.title ?? "문제 제목"} 요구사항</span>
              <span className="text-sm font-medium">{passedCondition ? "✔️ 통과" : "❌ 미통과"}</span>
            </div>
            <p className="text-sm text-gray-600">
              {passedCondition ? "조건을 충족했습니다." : "다시 확인해주세요."}
            </p>
          </div>
        </div>

        {/* 점수/검토 */}
        <div className="mt-4 flex items-center justify-end space-x-4">
          {!isEditingScore ? (
            <div className="flex items-baseline space-x-2">
              <span className="text-gray-600">총점:</span>
              <span className="font-semibold">{maxScore}점</span>
              <span className="text-gray-600">받은 점수:</span>
              <span className="font-semibold">{current?.score}점</span>
              <button onClick={() => setIsEditingScore(true)} className="text-blue-500 hover:text-blue-700">
                ✏️ 점수 수정
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={0}
                max={maxScore}
                value={editedScore}
                onChange={(e) => setEditedScore(Number(e.target.value))}
                className="w-16 p-1 border rounded"
              />
              <button onClick={saveEditedScore} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                저장
              </button>
              <button
                onClick={() => {
                  setEditedScore(current?.score ?? 0)
                  setIsEditingScore(false)
                }}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          )}
          <button onClick={handleCompleteReview} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            검토 완료
          </button>
        </div>
      </div>
    </div>
  )
}
