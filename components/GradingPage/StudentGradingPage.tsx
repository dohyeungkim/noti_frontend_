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
  aiScore: number | null  // AI 점수 (읽기 전용)
  profScore: number | null  // 교수 점수 (편집 가능)
  profFeedback: string
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
      const studentSubs = allSubs.filter(s => String(s.user_id) === String(studentId))
      const mapped: Submission[] = await Promise.all(
        studentSubs.map(async (s) => {
          let profScore = null
          let profFeedback = ""
          
          try {
            const scores = await grading_api.get_submission_scores(s.submission_id)
            console.log(`📊 제출물 ${s.submission_id} 점수 목록:`, scores)
            
            // 교수 점수 찾기 - grading-list.tsx와 동일한 필터링 로직 적용
            const profScores = scores.filter((score: any) => {
              const gradedBy = score.graded_by;
              
              // graded_by가 없거나 null이면 제외
              if (!gradedBy) {
                console.log(`  ❌ 제외 (graded_by가 null)`);
                return false;
              }
              
              // auto:로 시작하면 AI 자동 채점이므로 제외
              if (typeof gradedBy === 'string' && gradedBy.startsWith('auto:')) {
                console.log(`  ❌ 제외 (AI 자동 채점: ${gradedBy})`);
                return false;
              }
              
              // prof_score 필드가 있어야 함
              if (score.prof_score === undefined || score.prof_score === null) {
                console.log(`  ❌ 제외 (prof_score가 없음)`);
                return false;
              }
              
              console.log(`  ✅ 포함 (교수 점수: ${score.prof_score})`);
              return true;
            })
            
            if (profScores.length > 0) {
              // 가장 최신 교수 점수만 선택
              const latestProf = profScores.reduce((latest: any, current: any) => {
                return current.submission_score_id > latest.submission_score_id ? current : latest
              })
              profScore = latestProf.prof_score
              profFeedback = latestProf.prof_feedback || ""
              console.log(`✅ 교수 점수 설정: ${profScore}`);
            } else {
              console.log(`ℹ️ 교수가 수정한 점수 없음`);
            }
            
          } catch (err) {
            console.error(`❌ 점수 조회 실패:`, err)
          }
          
          console.log(`📋 문제 ${s.problem_id}: AI=${s.ai_score}, Prof=${profScore}`);
          
          return {
            submissionId: s.submission_id,
            problemId: s.problem_id,
            problemTitle: s.problem_title,
            problemType: s.problme_type || "code",
            answerType: s.problme_type || "code",
            answer: "",
            aiScore: s.ai_score,  // AI 점수는 get_all_submissions에서 직접 가져옴 (원본 유지)
            profScore: profScore,  // 교수 점수 (실제 교수가 수정한 것만)
            profFeedback: profFeedback,  // 교수 피드백
            reviewed: s.reviewed,
            userName: s.user_name,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            passed: s.passed,
          }
        })
      )
      mapped.sort((a, b) => a.problemId - b.problemId)
      
      console.log("📋 최종 제출물 목록:", mapped);
      
      // 최종 점수 상태 확인
      console.log("\n📊 최종 점수 분리 상태:");
      mapped.forEach(sub => {
        console.log(`  문제${sub.problemId}: AI=${sub.aiScore}, Prof=${sub.profScore}`);
      });
      
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

  // 점수 수정 상태 (독립적)
  const [isEditingScore, setIsEditingScore] = useState(false)
  const [editedProfScore, setEditedProfScore] = useState(0)

  // 피드백 수정 상태 (독립적)
  const [isEditingProfessor, setIsEditingProfessor] = useState(false)
  const [editedProfFeedback, setEditedProfFeedback] = useState("")

  // 현재 제출물이 바뀔 때 편집 상태 초기화
  useEffect(() => {
    if (current) {
      // 교수 점수가 없으면 0으로 시작 (AI 점수를 복사하지 않음)
      setEditedProfScore(current.profScore ?? 0)
      setEditedProfFeedback(current.profFeedback || "")
      setIsEditingScore(false)
      setIsEditingProfessor(false)
    }
  }, [current])

  // 점수만 저장
  const saveProfScore = useCallback(async () => {
    if (!current) return
    if (!isGroupOwner) {
      alert("그룹장만 점수를 수정할 수 있습니다.")
      return
    }

    try {
      const num = Number(editedProfScore)
      const clamped = Number.isNaN(num) ? 0 : Math.max(0, Math.min(num, maxScore || num))

      console.log("💾 교수 점수 저장 중:", {
        submissionId: current.submissionId,
        prof_score: clamped,
        prof_feedback: editedProfFeedback
      })

      await grading_api.post_submission_score(
        current.submissionId,
        clamped,
        editedProfFeedback,
        myUserId ?? undefined
      )

      // 로컬 상태 업데이트 (AI 점수는 절대 변경하지 않음)
      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = { 
          ...next[currentIdx], 
          profScore: clamped,  // 교수 점수만 업데이트
          profFeedback: editedProfFeedback  // 피드백도 함께 업데이트
        }
        return next
      })
      
      setIsEditingScore(false)
      alert("교수 점수가 저장되었습니다.")
    } catch (e: any) {
      console.error("점수 저장 실패:", e)
      alert(e?.message || "점수 저장 실패")
    }
  }, [currentIdx, current, editedProfScore, editedProfFeedback, maxScore, isGroupOwner, myUserId])

  // 피드백만 저장
  const saveProfFeedback = useCallback(async () => {
    if (!current) return
    if (!isGroupOwner) {
      alert("그룹장만 피드백을 수정할 수 있습니다.")
      return
    }

    try {
      // 교수 점수가 있으면 그대로 사용, 없으면 편집 중인 값 사용
      const scoreToSave = current.profScore !== null ? current.profScore : editedProfScore

      console.log("💾 교수 피드백 저장 중:", {
        submissionId: current.submissionId,
        prof_score: scoreToSave,
        prof_feedback: editedProfFeedback
      })

      await grading_api.post_submission_score(
        current.submissionId,
        scoreToSave,
        editedProfFeedback,
        myUserId ?? undefined
      )

      // 서버 재조회 없이 바로 로컬 상태 업데이트
      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = { 
          ...next[currentIdx], 
          profScore: scoreToSave,
          profFeedback: editedProfFeedback,  // 입력한 값 그대로 저장
        }
        return next
      })
      
      setIsEditingProfessor(false)
      alert("교수 피드백이 저장되었습니다.")
    } catch (e: any) {
      console.error("피드백 저장 실패:", e)
      alert(e?.message || "피드백 저장 실패")
    }
  }, [currentIdx, current, editedProfScore, editedProfFeedback, isGroupOwner, myUserId])

  // 검토 완료 (점수와 피드백 모두 저장)
  const handleCompleteReview = useCallback(async () => {
    if (!isGroupOwner) {
      alert("그룹장만 검토를 완료할 수 있습니다.")
      return
    }

    if (!current) return

    try {
      const num = Number(editedProfScore)
      const clamped = Number.isNaN(num) ? 0 : Math.max(0, Math.min(num, maxScore || num))

      console.log("💾 검토 완료 - 점수와 피드백 저장 중:", {
        submissionId: current.submissionId,
        prof_score: clamped,
        prof_feedback: editedProfFeedback
      })

      await grading_api.post_submission_score(
        current.submissionId,
        clamped,
        editedProfFeedback,
        myUserId ?? undefined
      )

      // 로컬 상태 업데이트
      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = { 
          ...next[currentIdx], 
          profScore: clamped,
          profFeedback: editedProfFeedback,
          reviewed: true 
        }
        return next
      })

      alert("검토가 완료되었습니다.")
      router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
    } catch (e: any) {
      console.error("검토 완료 실패:", e)
      alert(e?.message || "검토 완료 실패")
    }
  }, [currentIdx, current, editedProfScore, editedProfFeedback, maxScore, isGroupOwner, groupId, examId, router, myUserId])

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
                      {editedProfFeedback ? (
                        <ReactMarkdown>{editedProfFeedback}</ReactMarkdown>
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
                        value={editedProfFeedback}
                        onChange={(e) => setEditedProfFeedback(e.target.value)}
                        placeholder="교수 피드백을 입력하세요..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveProfFeedback}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setEditedProfFeedback(current.profFeedback || "")
                            setIsEditingProfessor(false)
                          }}
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
                교수 점수: <b>{current?.profScore !== null ? current.profScore : "-"}</b>점
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
                <span className="font-semibold text-lg">
                  {current?.profScore !== null ? `${current.profScore}점` : "-"}
                </span>
                <span className="text-gray-400">/ {maxScore}점</span>
                {isGroupOwner && (
                  <button onClick={() => setIsEditingScore(true)} className="text-blue-500 hover:text-blue-700 ml-2">
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
                  value={editedProfScore}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    const clamped = Number.isNaN(v) ? 0 : Math.max(0, Math.min(v, maxScore || v))
                    setEditedProfScore(clamped)
                  }}
                  className="w-20 p-2 border rounded"
                />
                <span>/ {maxScore}점</span>
                <button onClick={saveProfScore} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  저장
                </button>
                <button
                  onClick={() => {
                    setEditedProfScore(current?.profScore ?? 0)
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