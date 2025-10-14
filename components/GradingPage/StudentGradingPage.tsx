"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth"
import {
  group_api,
  grading_api,
  ai_feedback_api,
  problem_ref_api,
  auth_api,
  type SubmissionSummary,
} from "@/lib/api"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Code } from "lucide-react"
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
      console.log(`학생 ID: ${studentId}`);
      
      const allSubs: SubmissionSummary[] = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId),
      )
      
      console.log('GET submissions 전체:', allSubs);
      
      const studentSubs = allSubs.filter(s => String(s.user_id) === String(studentId))
      console.log(`✅ 학생 제출물 필터링 완료: ${studentSubs.length}개`);
      
      const mapped: Submission[] = await Promise.all(
        studentSubs.map(async (s: any) => {
          let profScore = null
          let profFeedback = ""
          
          try {
            const scores = await grading_api.get_submission_scores(s.submission_id)
            
            const profScores = scores.filter((score: any) => {
              const hasGradedBy = score.graded_by && !score.graded_by.startsWith('auto:');
              const hasProfScore = score.prof_score !== undefined && score.prof_score !== null;
              return hasGradedBy && hasProfScore;
            })
            
            if (profScores.length > 0) {
              const latestProf = profScores.reduce((latest: any, current: any) => {
                return current.submission_score_id > latest.submission_score_id ? current : latest
              })
              
              profScore = latestProf.prof_score
              profFeedback = latestProf.prof_feedback || ""
            }
            
          } catch (err) {
            console.error(`❌ 제출물 ${s.submission_id} 점수 조회 실패:`, err)
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
            aiScore: s.ai_score,
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
      
      console.log(`\n===== 최종 결과 =====`);
      console.log(`문제 수: ${mapped.length}개`);
      
      setSubmissions(mapped)
      
      if (mapped.length > 0) {
        setStudentName(mapped[0].userName || "")
      }
    } catch (err) {
      console.error("학생 제출물 불러오기 실패", err)
    }
  }, [groupId, examId, studentId])

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
      console.log("📚 문제 목록 로드 완료:", list)
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
      
      console.log("👤 본인 ID:", me?.user_id)
      console.log("👑 그룹장 ID:", ownerId)
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err)
    }
  }, [groupId])

  useEffect(() => {
    fetchUserInfo()
    fetchSubmissions()
    fetchProblemPoints()
  }, [fetchUserInfo, fetchSubmissions, fetchProblemPoints])

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
    
    console.log(`🔍 문제 ${current.problemId} 찾기:`, foundProblem)
    
    if (foundProblem) {
      setCurrentProblem(foundProblem)
    } else {
      setCurrentProblem(null)
    }
    
    setProblemLoading(false)
  }, [current?.problemId, allProblems])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1)
    else router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
  }, [currentIdx, router, groupId, examId])

  const goNext = useCallback(() => {
    if (currentIdx < lastIdx) setCurrentIdx((i) => i + 1)
  }, [currentIdx, lastIdx])

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

      console.log(`\n💾 저장 전 상태:`);
      console.log(`  제출 ID: ${current.submissionId}`);
      console.log(`  현재 AI 점수: ${current.aiScore}`);
      console.log(`  현재 교수 점수: ${current.profScore}`);
      console.log(`  저장할 교수 점수: ${clamped}`);

      await grading_api.post_submission_score(
        current.submissionId,
        clamped,
        editedProfFeedback,
        myUserId ?? undefined
      )

      console.log(`✅ 저장 API 호출 완료`);
      
      const updatedScores = await grading_api.get_submission_scores(current.submissionId);
      console.log(`\n📊 저장 후 점수 확인:`, updatedScores);
      
      const profScores = updatedScores.filter((score: any) => {
        return score.graded_by && !score.graded_by.startsWith('auto:');
      });
      console.log(`  교수 점수 목록:`, profScores);

      setSubmissions((prev) => {
        const next = [...prev]
        const originalAiScore = next[currentIdx].aiScore
        
        console.log(`\n🔄 로컬 상태 업데이트:`);
        console.log(`  AI 점수 유지: ${originalAiScore}`);
        console.log(`  교수 점수 변경: ${next[currentIdx].profScore} → ${clamped}`);
        
        next[currentIdx] = { 
          ...next[currentIdx], 
          aiScore: originalAiScore,
          profScore: clamped,
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

  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"ai" | "professor">("ai")

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

  const renderAnswer = () => {
    if (!current) return null

    const problemType = current.problemType

    if (problemType === "Coding" || problemType === "코딩" || problemType === "디버깅") {
      return (
        <MonacoEditor
          height="calc(100% - 30px)"
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
      return <p className="text-gray-500 text-sm">문제 정보를 불러오는 중...</p>
    }

    if (!currentProblem) {
      return <p className="text-gray-500 text-sm">문제 정보가 없습니다.</p>
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-base text-gray-800 mb-2">
            {currentProblem.title || "제목 없음"}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
              {currentProblem.problem_type || currentProblem.problemType || "유형 미지정"}
            </span>
            {currentProblem.difficulty && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                난이도: {currentProblem.difficulty}
              </span>
            )}
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
              배점: {currentProblem.points || 0}점
            </span>
          </div>
        </div>

        {currentProblem.description && (
          <div>
            <h5 className="font-semibold text-sm text-gray-700 mb-2">문제 설명</h5>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentProblem.description}
              </p>
            </div>
          </div>
        )}

        {currentProblem.tags && currentProblem.tags.length > 0 && (
          <div>
            <h5 className="font-semibold text-sm text-gray-700 mb-2">태그</h5>
            <div className="flex flex-wrap gap-2">
              {currentProblem.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            전체 문제 데이터 보기 (개발용)
          </summary>
          <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(currentProblem, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 max-w-7xl mx-auto p-6 space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="bg-white rounded-lg shadow border p-4 h-[600px] overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={current?.submissionId}
          >
            <h3 className="font-semibold mb-3 text-gray-800">학생 답안</h3>
            <div className="mb-2 text-sm text-gray-600">
              문제 유형: <span className="font-medium">{current?.problemType}</span>
            </div>
            {renderAnswer()}
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow border p-4 h-[600px] overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={`problem-${current?.problemId}`}
          >
            <h3 className="font-semibold mb-3 text-gray-800">문제 정보</h3>
            {renderProblemDescription()}
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow border flex flex-col h-[600px]"
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
                <div className="h-full flex flex-col">
                  {!isEditingProfessor ? (
                    <>
                      <div className="prose prose-sm max-w-none flex-1 overflow-y-auto">
                        {editedProfFeedback ? (
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
              )}
            </div>
          </motion.div>
        </div>

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
  )
}