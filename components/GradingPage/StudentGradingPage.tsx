"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"
import {
  group_api,
  grading_api,
  ai_feedback_api,
  code_log_api,
  problem_ref_api,
  auth_api,
  type SubmissionSummary,
} from "@/lib/api"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface Submission {
  submissionId: number
  problemId: number
  problemTitle: string
  problemType: string
  answerType: string
  answer: string
  aiScore: number | null  // AI 점수
  profScore: number | null  // 교수 점수
  reviewed: boolean
  userName: string
  createdAt: string
  updatedAt: string
  passed: boolean
}

export default function StudentGradingPage() {
  const { groupId, examId, studentId } = useParams() as {
    groupId: string
    examId: string
    studentId: string
  }
  const router = useRouter()
  const { userName } = useAuth()

  const [groupOwnerId, setGroupOwnerId] = useState<string | number | null>(null)
  const [myUserId, setMyUserId] = useState<string | number | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [studentName, setStudentName] = useState<string>("")
  const [currentIdx, setCurrentIdx] = useState(0)

  // 최신 코드 로그 캐시
  const [latestLogCache, setLatestLogCache] = useState<Record<number, { code: string; timestamp: string }>>({})

  // 문제별 배점 맵
  const [pointsByProblem, setPointsByProblem] = useState<Record<number, number>>({})

  // 가장 마지막 코드 로그 추출
  function pickLatestLog(data: any): { code: string; timestamp: string } | null {
    if (Array.isArray(data?.code_logs) && Array.isArray(data?.timestamp)) {
      const zipped = data.code_logs
        .map((code: string, i: number) => ({ code, timestamp: data.timestamp[i] }))
        .filter((x: any) => !!x?.timestamp)
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      return zipped.at(-1) ?? null
    }
    if (Array.isArray(data) && data.length) {
      const arr = data
        .filter((x) => typeof x?.timestamp === "string" && typeof x?.code === "string")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      return arr.at(-1) ?? null
    }
    return null
  }

  // 제출 목록 로드
  const fetchSubmissions = useCallback(async () => {
    try {
      const allSubs: SubmissionSummary[] = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId),
      )

      // 현재 학생의 제출물만 필터링
      const studentSubs = allSubs.filter(s => String(s.user_id) === String(studentId))

      // 교수 점수 조회를 위한 병렬 처리
      const mapped: Submission[] = await Promise.all(
        studentSubs.map(async (s) => {
          let profScore = null
          try {
            const scores = await grading_api.get_submission_scores(s.submission_id)
            // 교수가 매긴 점수 찾기 (graded_by가 있는 것)
            const profScoreRecord = scores.find((score: any) => score.graded_by != null)
            if (profScoreRecord) {
              profScore = profScoreRecord.score
            }
          } catch (err) {
            console.error(`교수 점수 조회 실패 (submission_id: ${s.submission_id}):`, err)
          }

          return {
            submissionId: s.submission_id,
            problemId: s.problem_id,
            problemTitle: s.problem_title,
            problemType: s.problme_type || "code",
            answerType: s.problme_type || "code",
            answer: "",
            aiScore: s.score,  // AI 점수
            profScore: profScore,  // 교수 점수
            reviewed: s.reviewed,
            userName: s.user_name,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            passed: s.passed,
          }
        })
      )

      // problem_id 순으로 정렬
      mapped.sort((a, b) => a.problemId - b.problemId)

      setSubmissions(mapped)
      if (mapped.length > 0) {
        setStudentName(mapped[0].userName || "")
      }
    } catch (err) {
      console.error("학생 제출물 불러오기 실패", err)
    }
  }, [groupId, examId, studentId])

  // 문제 배점 로드
  const fetchProblemPoints = useCallback(async () => {
    try {
      const list = await problem_ref_api.problem_ref_get(Number(groupId), Number(examId))
      const map: Record<number, number> = {}
      for (const item of list as any[]) {
        if (item?.problem_id != null && typeof item?.points === "number") {
          map[item.problem_id] = item.points
        }
      }
      setPointsByProblem(map)
    } catch (e) {
      console.error("배점 불러오기 실패:", e)
      setPointsByProblem({})
    }
  }, [groupId, examId])

  // 그룹장 및 본인 ID 조회
  const fetchUserInfo = useCallback(async () => {
    try {
      const [me, grp]: [{ user_id: string | number }, any] = await Promise.all([
        auth_api.getUser(),
        group_api.group_get_by_id(Number(groupId)),
      ])
      
      setMyUserId(me?.user_id)
      
      const ownerId =
        grp?.group_owner ??
        grp?.owner_id ??
        grp?.group_owner_id ??
        grp?.owner_user_id ??
        grp?.ownerId ??
        grp?.leader_id ??
        grp?.owner?.user_id
      
      setGroupOwnerId(ownerId)
      
      console.log("👤 본인 ID:", me?.user_id)
      console.log("👑 그룹장 ID:", ownerId)
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err)
    }
  }, [groupId])

  // 초기 로드
  useEffect(() => {
    fetchUserInfo()
    fetchSubmissions()
    fetchProblemPoints()
  }, [fetchUserInfo, fetchSubmissions, fetchProblemPoints])

  // 그룹장 여부 확인
  const isGroupOwner = useMemo(() => {
    if (myUserId == null || groupOwnerId == null) return false
    return String(myUserId) === String(groupOwnerId)
  }, [myUserId, groupOwnerId])

  const lastIdx = submissions.length - 1
  const current = submissions[currentIdx]

  // 코드 로그 로드
  useEffect(() => {
    const subId = current?.submissionId
    if (!subId) return
    if (latestLogCache[subId]) return

    let cancelled = false
    ;(async () => {
      try {
        const data = await code_log_api.code_logs_get_by_solve_id(subId)
        if (cancelled) return
        const last = pickLatestLog(data)
        setLatestLogCache((prev) => ({
          ...prev,
          [subId]: last ?? { code: "", timestamp: "" },
        }))
      } catch (e) {
        console.error("코드 로그 로드 실패:", e)
        setLatestLogCache((prev) => ({ ...prev, [subId]: { code: "", timestamp: "" } }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [current?.submissionId, latestLogCache])

  // 네비게이션
  const goPrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1)
    else router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
  }, [currentIdx, router, groupId, examId])

  const goNext = useCallback(() => {
    if (currentIdx < lastIdx) setCurrentIdx((i) => i + 1)
  }, [currentIdx, lastIdx])

  // 총점
  const maxScore = useMemo(() => {
    if (!current) return 0
    return pointsByProblem[current.problemId] ?? 10
  }, [pointsByProblem, current])

  // 점수 수정
  const [isEditingScore, setIsEditingScore] = useState(false)
  const [editedScore, setEditedScore] = useState(0)

  useEffect(() => {
    if (current) setEditedScore(current.profScore ?? 0)
  }, [current])

  // 교수 피드백
  const [professorFeedback, setProfessorFeedback] = useState("")
  const [isEditingProfessor, setIsEditingProfessor] = useState(false)

  // 교수 피드백 로드
  useEffect(() => {
    const loadProfFeedback = async () => {
      if (!current?.submissionId) return
      
      try {
        const scores = await grading_api.get_submission_scores(current.submissionId)
        const profScoreRecord = scores.find((score: any) => score.graded_by != null)
        if (profScoreRecord && profScoreRecord.prof_feedback) {
          setProfessorFeedback(profScoreRecord.prof_feedback)
        } else {
          setProfessorFeedback("")
        }
      } catch (err) {
        console.error("교수 피드백 조회 실패:", err)
        setProfessorFeedback("")
      }
    }

    loadProfFeedback()
  }, [current?.submissionId])

  const saveScoreAndFeedback = useCallback(async () => {
    if (!current) return
    if (!isGroupOwner) {
      alert("그룹장만 점수를 수정할 수 있습니다.")
      return
    }

    try {
      const num = Number(editedScore)
      const clamped = Number.isNaN(num) ? 0 : Math.max(0, Math.min(num, maxScore || num))

      await grading_api.post_submission_score(
        current.submissionId,
        clamped,
        professorFeedback
      )

      // 로컬 상태 업데이트
      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = { 
          ...next[currentIdx], 
          profScore: clamped, 
          reviewed: true 
        }
        return next
      })
      
      setIsEditingScore(false)
      alert("점수와 피드백이 저장되었습니다.")
    } catch (e: any) {
      alert(e?.message || "점수 저장 실패")
    }
  }, [currentIdx, current, editedScore, professorFeedback, maxScore, isGroupOwner])

  const handleCompleteReview = useCallback(() => {
    if (!isGroupOwner) {
      alert("그룹장만 검토를 완료할 수 있습니다.")
      return
    }
    router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
  }, [groupId, examId, isGroupOwner, router])

  // 피드백 탭
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"ai" | "professor">("ai")

  // AI 피드백
  const [aiFeedback, setAiFeedback] = useState<string>("")
  const [isAILoaded, setIsAILoaded] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const fetchAiFeedback = useCallback(async (submissionId: number) => {
    setIsAILoaded(false)
    setAiError(null)
    try {
      const data: any = await ai_feedback_api.get_ai_feedback(submissionId)
      const text =
        (typeof data === "string" && data) ||
        data?.feedback ||
        data?.ai_feedback ||
        data?.message ||
        (Array.isArray(data) ? data.join("\n") : JSON.stringify(data, null, 2))
      setAiFeedback(text || "AI 피드백이 없습니다.")
    } catch (e: any) {
      setAiFeedback("")
      setAiError(e?.message || "AI 피드백 로드 실패")
    } finally {
      setIsAILoaded(true)
    }
  }, [])

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

  // 통과 조건 (교수 점수 우선, 없으면 AI 점수)
  const finalScore = current?.profScore ?? current?.aiScore ?? 0
  const passedCondition = finalScore >= (maxScore ?? 0)

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

  // 에디터 표시
  const latestLog = current?.submissionId ? latestLogCache[current.submissionId] : undefined
  const effectiveAnswerType = current?.answerType === "code" ? "code" : "text"
  const effectiveLanguage = effectiveAnswerType === "code" ? "javascript" : "plaintext"
  const effectiveAnswer = latestLog?.code ?? current?.answer ?? ""

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 max-w-7xl mx-auto p-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <button onClick={goPrev} className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
            {currentIdx > 0 ? <ChevronLeft /> : <ArrowLeft />} {currentIdx > 0 ? "이전 문제" : "목록으로"}
          </button>
          <h2 className="text-lg font-bold">
            {studentName} – {current?.problemTitle} (문제 {current?.problemId})
          </h2>
          <button
            onClick={goNext}
            disabled={currentIdx === lastIdx}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 disabled:opacity-40"
          >
            다음 문제 <ChevronRight />
          </button>
        </div>

        {/* 본문 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌: 답안 */}
          <motion.div
            className="bg-white rounded-lg shadow border p-4 h-[600px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={`${current?.submissionId}-${effectiveAnswerType}`}
          >
            <div className="mb-2 text-sm text-gray-600">
              문제 유형: <span className="font-medium">{current?.problemType}</span>
            </div>
            {effectiveAnswer == null ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                답안 불러오는 중…
              </div>
            ) : (
              <MonacoEditor
                height="calc(100% - 30px)"
                language={effectiveLanguage}
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
                className={`flex-1 py-2 text-center ${activeFeedbackTab === "ai" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setActiveFeedbackTab("ai")}
              >
                AI 피드백
              </button>
              <button
                className={`flex-1 py-2 text-center ${activeFeedbackTab === "professor" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600"}`}
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
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                  </div>
                )
              ) : (
                <div className="prose prose-sm max-w-none">
                  {!isEditingProfessor ? (
                    <>
                      {professorFeedback ? (
                        <ReactMarkdown>{professorFeedback}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-500">교수 피드백이 없습니다.</p>
                      )}
                      {isGroupOwner && (
                        <div className="mt-3">
                          <button
                            onClick={() => setIsEditingProfessor(true)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                          >
                            ✏️ 편집
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        className="w-full h-56 border rounded p-2 text-sm font-sans"
                        value={professorFeedback}
                        onChange={(e) => setProfessorFeedback(e.target.value)}
                        placeholder="교수 피드백을 입력하세요..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditingProfessor(false)
                            saveScoreAndFeedback()
                          }}
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

        {/* 조건 검사 */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-2">조건 검사 결과</h3>
          <div
            className={`p-3 rounded-lg border-l-4 ${
              passedCondition ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium">통과 여부</span>
              <span className="text-sm font-medium">{passedCondition ? "✔️ 통과" : "❌ 미통과"}</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                AI 점수: <b>{current?.aiScore ?? 0}</b>점
              </p>
              <p>
                교수 점수: <b>{current?.profScore ?? "-"}</b>점
              </p>
              <p>
                최종 점수: <b>{finalScore}</b>점 / 총점: <b>{maxScore}</b>점
              </p>
            </div>
          </div>
        </div>

        {/* 점수 수정 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            제출 시간: {new Date(current?.updatedAt || "").toLocaleString("ko-KR")}
          </div>
          <div className="flex items-center space-x-4">
            {!isEditingScore ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-gray-600">AI 점수:</span>
                <span className="font-semibold">{current?.aiScore ?? 0}점</span>
                <span className="mx-2">|</span>
                <span className="text-gray-600">교수 점수:</span>
                <span className="font-semibold text-lg">{current?.profScore ?? "-"}점</span>
                <span className="text-gray-400">/ {maxScore}점</span>
                {isGroupOwner && (
                  <button onClick={() => setIsEditingScore(true)} className="text-blue-500 hover:text-blue-700">
                    ✏️ 점수 수정
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">교수 점수:</span>
                <input
                  type="number"
                  min={0}
                  max={maxScore || undefined}
                  value={editedScore}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    const clamped = Number.isNaN(v) ? 0 : Math.max(0, Math.min(v, maxScore || v))
                    setEditedScore(clamped)
                  }}
                  className="w-20 p-2 border rounded"
                />
                <span>/ {maxScore}점</span>
                <button onClick={saveScoreAndFeedback} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  저장
                </button>
                <button
                  onClick={() => {
                    setEditedScore(current?.profScore ?? 0)
                    setIsEditingScore(false)
                  }}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            )}
            {isGroupOwner && (
              <button onClick={handleCompleteReview} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                검토 완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}