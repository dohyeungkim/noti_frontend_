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
  const { userName } = useAuth()

  const [groupOwnerId, setGroupOwnerId] = useState<string | number | null>(null)
  const [myUserId, setMyUserId] = useState<string | number | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [studentName, setStudentName] = useState<string>("")
  const [currentIdx, setCurrentIdx] = useState(0)

  // 문제별 배점 맵
  const [pointsByProblem, setPointsByProblem] = useState<Record<number, number>>({})

  // 제출 목록 로드
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
            
            // 교수 점수 필터링
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
    
    // 저장 후 다시 조회해서 확인
    const updatedScores = await grading_api.get_submission_scores(current.submissionId);
    console.log(`\n📊 저장 후 점수 확인:`, updatedScores);
    
    const profScores = updatedScores.filter((score: any) => {
      return score.graded_by && !score.graded_by.startsWith('auto:');
    });
    console.log(`  교수 점수 목록:`, profScores);

    // 로컬 상태 업데이트
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

  // 피드백만 저장
  const saveProfFeedback = useCallback(async () => {
    if (!current) return
    if (!isGroupOwner) {
      alert("그룹장만 피드백을 수정할 수 있습니다.")
      return
    }

    try {
      const scoreToSave = current.profScore !== null ? current.profScore : editedProfScore

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

  // 검토 완료
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

  // 통과 조건
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

  // 답안 렌더링 함수
  const renderAnswer = () => {
    if (!current) return null

    const problemType = current.problemType

    // 코딩 또는 디버깅 문제
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

    // 객관식
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

    // 주관식
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

    // 단답형
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

    // 기본값
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        답안이 없습니다
      </div>
    )
  }

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
            className="bg-white rounded-lg shadow border p-4 h-[600px] overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={current?.submissionId}
          >
            <div className="mb-2 text-sm text-gray-600">
              문제 유형: <span className="font-medium">{current?.problemType}</span>
            </div>
            {renderAnswer()}
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