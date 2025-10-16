"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/stores/auth"
import {
  group_api,
  grading_api,
  ai_feedback_api,
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
  codes?: string
  selectedOptions?: number[]
  writtenText?: string
  writtenAnswers?: string[]
  aiScore: number | null
  profScore: number | null
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
  const searchParams = useSearchParams()
  const { userName } = useAuth()

  const [groupOwnerId, setGroupOwnerId] = useState<string | number | null>(null)
  const [myUserId, setMyUserId] = useState<string | number | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [studentName, setStudentName] = useState<string>("")
  const [currentIdx, setCurrentIdx] = useState(0)

  const [pointsByProblem, setPointsByProblem] = useState<Record<number, number>>({})

  const [currentProblem, setCurrentProblem] = useState<any | null>(null)
  const [problemLoading, setProblemLoading] = useState(false)
  const [allProblems, setAllProblems] = useState<any[]>([])

  const fetchSubmissions = useCallback(async () => {
    try {
      console.log("===== 학생 제출물 로딩 시작 =====");
      
      const allSubs: SubmissionSummary[] = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId),
      )
      
      const studentSubs = allSubs.filter(s => String(s.user_id) === String(studentId))
      
      const mapped: Submission[] = await Promise.all(
        studentSubs.map(async (s: any) => {
          let aiScore = null
          let profScore = null
          let profFeedback = ""
          
          try {
            const score = await grading_api.get_submission_scores(s.submission_id)
            
            if (score) {
              aiScore = score.ai_score ?? null;
              profScore = score.prof_score ?? null;
              profFeedback = score.prof_feedback || "";
            }
          } catch (err) {
            console.error(`제출물 ${s.submission_id} 점수 조회 실패:`, err)
          }
          
          return {
            submissionId: s.submission_id,
            problemId: s.problem_id,
            problemTitle: s.problem_title,
            problemType: s.problem_type || s.problme_type || "Coding",
            codes: s.codes,
            selectedOptions: s.selected_options,
            writtenText: s.written_text,
            writtenAnswers: s.written_answers,
            aiScore: aiScore,
            profScore: profScore,
            profFeedback: profFeedback,
            reviewed: s.reviewed,
            userName: s.user_name,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            passed: s.passed,
          }
        })
      )
      mapped.sort((a, b) => a.problemId - b.problemId)
      
      setSubmissions(mapped)
      
      if (mapped.length > 0) {
        setStudentName(mapped[0].userName || "")
      }

      const problemIdParam = searchParams.get('problemId')
      if (problemIdParam) {
        const targetProblemId = Number(problemIdParam)
        const targetIndex = mapped.findIndex(sub => sub.problemId === targetProblemId)
        
        if (targetIndex !== -1) {
          setCurrentIdx(targetIndex)
        }
      }
    } catch (err) {
      console.error("학생 제출물 불러오기 실패", err)
    }
  }, [groupId, examId, studentId, searchParams])

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
      setAllProblems(list as any[])
    } catch (e) {
      console.error("배점 불러오기 실패:", e)
      setPointsByProblem({})
      setAllProblems([])
    }
  }, [groupId, examId])

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
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err)
    }
  }, [groupId])

  useEffect(() => {
    fetchUserInfo()
    fetchProblemPoints()
  }, [fetchUserInfo, fetchProblemPoints])

  useEffect(() => {
    if (allProblems.length > 0) {
      fetchSubmissions()
    }
  }, [allProblems.length, fetchSubmissions])

  const isGroupOwner = useMemo(() => {
    if (myUserId == null || groupOwnerId == null) return false
    return String(myUserId) === String(groupOwnerId)
  }, [myUserId, groupOwnerId])

  const lastIdx = submissions.length - 1
  const current = submissions[currentIdx]

  useEffect(() => {
    if (!current?.problemId || allProblems.length === 0) {
      setCurrentProblem(null)
      setProblemLoading(false)
      return
    }
    
    setProblemLoading(true)
    
    const foundProblem = allProblems.find(
      (prob: any) => prob.problem_id === current.problemId
    )
    
    if (foundProblem) {
      setCurrentProblem(foundProblem)
    } else {
      setCurrentProblem(null)
    }
    
    setProblemLoading(false)
  }, [current?.problemId, allProblems])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1)
      router.replace(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`)
    } else {
      router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
    }
  }, [currentIdx, router, groupId, examId, studentId])

  const goNext = useCallback(() => {
    if (currentIdx < lastIdx) {
      setCurrentIdx((i) => i + 1)
      router.replace(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`)
    }
  }, [currentIdx, lastIdx, router, groupId, examId, studentId])

  const maxScore = useMemo(() => {
    if (!current) return 0
    return pointsByProblem[current.problemId] ?? 10
  }, [pointsByProblem, current])

  const [isEditingScore, setIsEditingScore] = useState(false)
  const [editedProfScore, setEditedProfScore] = useState("")

  const [isEditingProfessor, setIsEditingProfessor] = useState(false)
  const [editedProfFeedback, setEditedProfFeedback] = useState("")

  useEffect(() => {
    if (current) {
      setEditedProfScore(current.profScore !== null ? String(current.profScore) : "")
      setEditedProfFeedback(current.profFeedback || "")
      setIsEditingScore(false)
      setIsEditingProfessor(false)
    }
  }, [current])

  const saveProfScore = useCallback(async () => {
    if (!current) return
    if (!isGroupOwner) {
      alert("그룹장만 점수를 수정할 수 있습니다.")
      return
    }

    try {
      const num = Number(editedProfScore)
      const clamped = Number.isNaN(num) ? 0 : Math.max(0, Math.min(num, maxScore || num))

      await grading_api.post_submission_score(
        current.submissionId,
        clamped,
        editedProfFeedback,
        myUserId ?? undefined
      )

      const updatedScore = await grading_api.get_submission_scores(current.submissionId);
      
      let updatedAiScore = current.aiScore;
      let updatedProfScore = clamped;
      
      if (updatedScore) {
        updatedAiScore = updatedScore.ai_score ?? current.aiScore;
        updatedProfScore = updatedScore.prof_score ?? clamped;
      }

      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = { 
          ...next[currentIdx], 
          aiScore: updatedAiScore,
          profScore: updatedProfScore,
          profFeedback: editedProfFeedback
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

  const saveProfFeedback = useCallback(async () => {
    if (!current) return
    if (!isGroupOwner) {
      alert("그룹장만 피드백을 수정할 수 있습니다.")
      return
    }

    try {
      const scoreToSave = current.profScore !== null ? current.profScore : (Number(editedProfScore) || 0)

      await grading_api.post_submission_score(
        current.submissionId,
        scoreToSave,
        editedProfFeedback,
        myUserId ?? undefined
      )

      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = { 
          ...next[currentIdx], 
          profScore: scoreToSave,
          profFeedback: editedProfFeedback,
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

  const handleCompleteReview = useCallback(async () => {
    if (!isGroupOwner) {
      alert("그룹장만 검토를 완료할 수 있습니다.")
      return
    }

    if (!current) return

    try {
      const num = Number(editedProfScore)
      const clamped = Number.isNaN(num) ? 0 : Math.max(0, Math.min(num, maxScore || num))

      await grading_api.post_submission_score(
        current.submissionId,
        clamped,
        editedProfFeedback,
        myUserId ?? undefined
      )

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

  const [aiFeedback, setAiFeedback] = useState<string>("")
  const [isAILoaded, setIsAILoaded] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const fetchAiFeedback = useCallback(async (submissionId: number) => {
    setIsAILoaded(false)
    setAiError(null)
    try {
      const data: any = await ai_feedback_api.get_ai_feedback(submissionId)
      
      if (data?.ai_feedback && typeof data.ai_feedback === "string" && data.ai_feedback.trim()) {
        setAiFeedback(data.ai_feedback)
        return
      }
      
      if (data?.feedback && typeof data.feedback === "string" && data.feedback.trim()) {
        setAiFeedback(data.feedback)
        return
      }
      
      if (data?.message && typeof data.message === "string" && data.message.trim()) {
        setAiFeedback(data.message)
        return
      }
      
      if (typeof data === "string" && data.trim()) {
        setAiFeedback(data)
        return
      }
      
      if (Array.isArray(data) && data.length > 0) {
        setAiFeedback(data.join("\n"))
        return
      }
      
      setAiFeedback("AI 피드백이 없습니다.")
      
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

  const renderAnswer = () => {
    if (!current) return null

    const problemType = current.problemType

    if (problemType === "Coding" || problemType === "코딩" || problemType === "디버깅") {
      return (
        <MonacoEditor
          height="100%"
          language="python"
          value={current.codes || "// 코드가 없습니다"}
          options={{ readOnly: true, minimap: { enabled: false }, wordWrap: "on", fontSize: 14 }}
        />
      )
    }

    if (problemType === "객관식") {
      return (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">선택한 답:</p>
          <div className="space-y-2">
            {current.selectedOptions && current.selectedOptions.length > 0 ? (
              current.selectedOptions.map((option) => (
                <div key={option} className="p-2 bg-blue-50 rounded border border-blue-200">
                  선택 {option}
                </div>
              ))
            ) : (
              <p className="text-gray-400">선택된 답이 없습니다</p>
            )}
          </div>
        </div>
      )
    }

    if (problemType === "주관식") {
      return (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">작성한 답:</p>
          <div className="p-3 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
            {current.writtenText || "작성된 답이 없습니다"}
          </div>
        </div>
      )
    }

    if (problemType === "단답형") {
      return (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">작성한 답:</p>
          <div className="space-y-2">
            {current.writtenAnswers && current.writtenAnswers.length > 0 ? (
              current.writtenAnswers.map((answer, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
                  {answer}
                </div>
              ))
            ) : (
              <p className="text-gray-400">작성된 답이 없습니다</p>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        답안이 없습니다
      </div>
    )
  }

  const renderProblemDescription = () => {
    if (problemLoading) {
      return <p className="text-gray-500 text-sm p-4">문제 정보를 불러오는 중...</p>
    }

    if (!currentProblem) {
      return <p className="text-gray-500 text-sm p-4">문제 정보가 없습니다.</p>
    }

    return (
      <div className="p-4 space-y-4">
        <div className="border-b pb-4">
          <h4 className="font-bold text-lg text-gray-900 mb-3">
            {currentProblem.title || "제목 없음"}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {currentProblem.problem_type || currentProblem.problemType || "유형 미지정"}
            </span>
            {currentProblem.difficulty && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                난이도: {currentProblem.difficulty}
              </span>
            )}
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              배점: {currentProblem.points || 0}점
            </span>
          </div>
        </div>

        {currentProblem.description && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-5 shadow-sm">
            <h5 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded"></span>
              문제 설명
            </h5>
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {currentProblem.description}
            </div>
          </div>
        )}

        {currentProblem.tags && currentProblem.tags.length > 0 && (
          <div>
            <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded"></span>
              태그
            </h5>
            <div className="flex flex-wrap gap-2">
              {currentProblem.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {currentProblem.constraints && (
          <div>
            <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-yellow-500 rounded"></span>
              제약 조건
            </h5>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
              {currentProblem.constraints}
            </div>
          </div>
        )}

        {currentProblem.hints && (
          <div>
            <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded"></span>
              힌트
            </h5>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-700">
              {currentProblem.hints}
            </div>
          </div>
        )}

        {currentProblem.examples && (
          <div>
            <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded"></span>
              예제
            </h5>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {currentProblem.examples}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 max-w-[1800px] mx-auto p-6 w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
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

        {/* 메인 컨텐츠 */}
        <div className="space-y-6">
          {/* 상단: 왼쪽(문제정보+문제답안 세로배치) + 오른쪽(학생답안) */}
          <div className="flex gap-6 h-[700px]">
            {/* 왼쪽: 문제 정보 + 문제 답안 (세로 배치, 7) */}
            <div className="flex-[7] flex flex-col gap-6">
              {/* 문제 정보 (위) */}
              <div className="flex-1 bg-white rounded-lg shadow border flex flex-col">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-800">문제 정보</h3>
                </div>
                <div className="flex-1 overflow-auto">
                  {renderProblemDescription()}
                </div>
              </div>

              {/* 문제 답안 (아래) */}
              <div className="flex-1 bg-white rounded-lg shadow border flex flex-col">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-800">문제 답안</h3>
                </div>
                <div className="flex-1 overflow-auto flex items-center justify-center">
                  <p className="text-gray-400">문제 답안 준비 중...</p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 학생 답안 (4) */}
            <div className="flex-[4] bg-white rounded-lg shadow border flex flex-col">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800">학생 답안</h3>
                <div className="text-sm text-gray-600 mt-1">
                  문제 유형: <span className="font-medium">{current?.problemType}</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {renderAnswer()}
              </div>
            </div>
          </div>

          {/* 하단: AI 피드백 + 교수 피드백 (가로 스크롤) */}
          <div className="flex gap-6 overflow-x-auto pb-2">
            {/* AI 피드백 */}
            <div className="min-w-[500px] w-[calc(50%-12px)] bg-white rounded-lg shadow border flex flex-col h-[300px]">
              <div className="px-4 py-3 border-b bg-blue-50">
                <h3 className="font-semibold text-blue-600">AI 피드백</h3>
              </div>
              <div className="p-4 flex-1 overflow-auto">
                {!isAILoaded ? (
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
                )}
              </div>
            </div>

            {/* 교수 피드백 */}
            <div className="min-w-[500px] w-[calc(50%-12px)] bg-white rounded-lg shadow border flex flex-col h-[300px]">
              <div className="px-4 py-3 border-b bg-green-50">
                <h3 className="font-semibold text-green-600">교수 피드백</h3>
              </div>
              <div className="p-4 flex-1 overflow-auto">
                {!isEditingProfessor ? (
                  <>
                    <div className="prose prose-sm max-w-none flex-1 overflow-auto">
                      {editedProfFeedback && editedProfFeedback.trim() && editedProfFeedback !== "null" ? (
                        <ReactMarkdown>{editedProfFeedback}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-500">교수 피드백이 없습니다.</p>
                      )}
                    </div>
                    {isGroupOwner && (
                      <div className="mt-3 pt-3 border-t">
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
                  <div className="flex flex-col h-full space-y-2">
                    <textarea
                      className="flex-1 w-full border rounded p-2 text-sm font-sans resize-none"
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
            </div>
          </div>

          {/* 최하단: 제출 시간 + 점수 수정 + 검토 완료 */}
          <div className="flex items-center justify-between bg-white rounded-lg border shadow-sm p-4">
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
                      const val = e.target.value
                      if (val === "" || val === "-") {
                        setEditedProfScore(val)
                        return
                      }
                      const num = Number(val)
                      if (!Number.isNaN(num)) {
                        const clamped = Math.max(0, Math.min(num, maxScore || num))
                        setEditedProfScore(String(clamped))
                      }
                    }}
                    className="w-20 p-2 border rounded"
                  />
                  <span>/ {maxScore}점</span>
                  <button onClick={saveProfScore} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditedProfScore(current?.profScore !== null ? String(current.profScore) : "")
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
    </div>
  )
}