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
  problem_api,
  auth_api,
  type SubmissionSummary,
} from "@/lib/api"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
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
  const [myProblems, setMyProblems] = useState<any[]>([])

  // 채점 상태
  const [editedProfScore, setEditedProfScore] = useState("")
  const [editedProfFeedback, setEditedProfFeedback] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    try {
      console.log("===== 학생 제출물 로딩 시작 =====")
      console.log(`학생 ID: ${studentId}`)

      const allSubs: SubmissionSummary[] = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId),
      )

      console.log("GET submissions 전체:", allSubs)

      const studentSubs = allSubs.filter(s => String(s.user_id) === String(studentId))
      console.log(`✅ 학생 제출물 필터링 완료: ${studentSubs.length}개`)

      const mapped: Submission[] = await Promise.all(
        studentSubs.map(async (s: any) => {
          let aiScore = null
          let profScore = null
          let profFeedback = ""

          try {
            const score = await grading_api.get_submission_scores(s.submission_id)

            if (score) {
              aiScore = score.ai_score ?? null
              profScore = score.prof_score !== null && score.prof_score !== undefined ? score.prof_score : null
              profFeedback = score.prof_feedback || ""
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

      const problemIdParam = searchParams.get("problemId")
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

  const fetchMyProblems = useCallback(async () => {
    try {
      const problems = await problem_api.problem_get()
      setMyProblems(problems as any[])
      return problems
    } catch (e) {
      console.error("내 문제 목록 가져오기 실패:", e)
      setMyProblems([])
      return []
    }
  }, [])

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
    fetchMyProblems()
  }, [fetchUserInfo, fetchProblemPoints, fetchMyProblems])

  useEffect(() => {
    if (allProblems.length > 0 && myProblems.length > 0) {
      fetchSubmissions()
    }
  }, [allProblems.length, myProblems.length, fetchSubmissions])

  const isGroupOwner = useMemo(() => {
    if (myUserId == null || groupOwnerId == null) return false
    return String(myUserId) === String(groupOwnerId)
  }, [myUserId, groupOwnerId])

  const lastIdx = submissions.length - 1
  const current = submissions[currentIdx]

  useEffect(() => {
    if (!current?.problemId || myProblems.length === 0) {
      setCurrentProblem(null)
      setProblemLoading(false)
      return
    }

    setProblemLoading(true)

    const foundProblem = myProblems.find((prob: any) => {
      return prob.problem_id === current.problemId
    })

    if (foundProblem) {
      const problemFromExam = allProblems.find(
        (prob: any) => prob.problem_id === current.problemId
      )

      const mergedProblem = {
        ...foundProblem,
        points: problemFromExam?.points || foundProblem.points || pointsByProblem[current.problemId] || 0
      }

      setCurrentProblem(mergedProblem)
    } else {
      setCurrentProblem(null)
    }

    setProblemLoading(false)
  }, [current?.problemId, myProblems, allProblems, pointsByProblem])

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

  // 현재 문제 변경 시 채점 상태 초기화
  useEffect(() => {
    if (current) {
      setEditedProfScore(current.profScore !== null ? String(current.profScore) : "")
      setEditedProfFeedback(current.profFeedback || "")
      setShowConfirmModal(false)
    }
  }, [current])

  // 통합 저장 함수
  const saveSubmissionGrade = useCallback(async () => {
    if (!current) return
    if (!isGroupOwner) {
      alert("그룹장만 채점을 완료할 수 있습니다.")
      return
    }

    try {
      const num = Number(editedProfScore)
      const clamped = Number.isNaN(num) ? 0 : Math.max(0, Math.min(num, maxScore || num))

      console.log(`\n💾 채점 저장:`)
      console.log(`  제출 ID: ${current.submissionId}`)
      console.log(`  교수 점수: ${clamped}`)
      console.log(`  피드백: ${editedProfFeedback ? "있음" : "없음"}`)

      // 한 번의 API 호출로 점수 + 피드백 모두 저장
      await grading_api.post_submission_score(
        current.submissionId,
        clamped,
        editedProfFeedback,
        myUserId ?? undefined
      )

      console.log(`✅ 저장 API 호출 완료`)

      const updatedScore = await grading_api.get_submission_scores(current.submissionId)

      let updatedAiScore = current.aiScore
      let updatedProfScore = clamped

      if (updatedScore) {
        updatedAiScore = updatedScore.ai_score ?? current.aiScore
        updatedProfScore = updatedScore.prof_score ?? clamped
      }

      setSubmissions((prev) => {
        const next = [...prev]
        next[currentIdx] = {
          ...next[currentIdx],
          aiScore: updatedAiScore,
          profScore: updatedProfScore,
          profFeedback: editedProfFeedback,
          reviewed: true,
        }
        return next
      })

      setShowConfirmModal(false)
      alert("채점이 완료되었습니다.")
      router.push(`/mygroups/${groupId}/exams/${examId}/grading`)
    } catch (e: any) {
      console.error("채점 저장 실패:", e)
      alert(e?.message || "채점 저장 실패")
    }
  }, [currentIdx, current, editedProfScore, editedProfFeedback, maxScore, isGroupOwner, myUserId, groupId, examId, router])

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

  // 확인 모달 컴포넌트
  const ConfirmModal = () => {
    if (!showConfirmModal) return null

    const num = Number(editedProfScore)
    const clamped = Number.isNaN(num) ? 0 : Math.max(0, Math.min(num, maxScore || num))

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">채점 완료 확인</h3>

          <div className="space-y-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">학생: <span className="font-medium">{studentName}</span></p>
              <p className="text-sm text-gray-600">문제: <span className="font-medium">{current?.problemTitle}</span></p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">교수 점수:</p>
              <p className="text-xl font-bold text-blue-600">{clamped}점 / {maxScore}점</p>
            </div>

            {editedProfFeedback && editedProfFeedback.trim() && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">피드백:</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {editedProfFeedback}
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-6">
            위의 내용으로 채점을 완료하시겠습니까?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={saveSubmissionGrade}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderProblemAnswer = () => {
    if (!currentProblem) {
      return (
        <div className="p-4 flex items-center justify-center">
          <p className="text-gray-500">답안 정보를 불러올 수 없습니다.</p>
        </div>
      )
    }

    const problemType = currentProblem.problemType || currentProblem.problem_type || current?.problemType

    if (problemType === "객관식") {
      return (
        <div className="space-y-3">
          {currentProblem.options?.map((option: string, index: number) => {
            const isCorrect = currentProblem.correct_answers?.includes(index + 1)
            return (
              <div
                key={index}
                className={`border rounded-lg p-3 transition-colors ${
                  isCorrect
                    ? "bg-green-50 border-green-300"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`font-bold ${isCorrect ? "text-green-700" : "text-gray-600"}`}>
                    {index + 1}.
                  </span>
                  <span className={`flex-1 ${isCorrect ? "text-green-900 font-medium" : "text-gray-700"}`}>
                    {option}
                  </span>
                  {isCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            )
          })}

          {currentProblem.correct_answers && currentProblem.correct_answers.length > 0 && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
              <p className="text-green-800 font-semibold text-sm">
                정답: {currentProblem.correct_answers.join(", ")}번
              </p>
            </div>
          )}
        </div>
      )
    }

    if (problemType === "단답형") {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <h5 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              정답
            </h5>
            <div className="space-y-2">
              {currentProblem.answer_text && currentProblem.answer_text.length > 0 ? (
                currentProblem.answer_text.map((answer: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span className="text-green-900 font-medium">{answer}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">정답 정보가 없습니다.</p>
              )}
            </div>
          </div>

          {currentProblem.grading_criteria && currentProblem.grading_criteria.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="text-xs font-semibold text-blue-700 mb-2">AI 채점 기준</h5>
              <ul className="space-y-1">
                {currentProblem.grading_criteria.map((criteria: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }

    if (problemType === "주관식") {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <h5 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              모범 답안
            </h5>
            <div className="text-green-900 whitespace-pre-wrap leading-relaxed">
              {currentProblem.answer_text || "모범 답안이 없습니다."}
            </div>
          </div>

          {currentProblem.grading_criteria && currentProblem.grading_criteria.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="text-xs font-semibold text-blue-700 mb-2">AI 채점 기준</h5>
              <ul className="space-y-1">
                {currentProblem.grading_criteria.map((criteria: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }

    if (problemType === "코딩") {
      return (
        <div className="space-y-4">
          {currentProblem.reference_codes && currentProblem.reference_codes.length > 0 ? (
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700">정답 코드 (Reference Code)</h5>
              {currentProblem.reference_codes.map((code: any, index: number) => (
                <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2">
                    <span className="text-white text-sm font-semibold">
                      {code.language || "코드"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 font-mono">
                      <code>{code.code || "// 코드가 없습니다"}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 text-center">정답 코드가 없습니다.</p>
            </div>
          )}

          {currentProblem.test_cases && currentProblem.test_cases.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-purple-700">테스트 케이스</h5>
              {currentProblem.test_cases.map((testCase: any, index: number) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-purple-700 mb-2">
                    Test Case {index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Input:</span>
                      <pre className="mt-1 text-gray-800 font-mono text-xs bg-white p-2 rounded border border-purple-100">
                        {testCase.input || ""}
                      </pre>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Expected Output:</span>
                      <pre className="mt-1 text-gray-800 font-mono text-xs bg-white p-2 rounded border border-purple-100">
                        {testCase.expected_output || testCase.output || ""}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (problemType === "디버깅") {
      return (
        <div className="space-y-4">
          {currentProblem.base_code && currentProblem.base_code.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700">기본 코드 (디버깅 대상)</h5>
              {currentProblem.base_code.map((code: any, index: number) => (
                <div key={index} className="border border-orange-300 rounded-lg overflow-hidden">
                  <div className="bg-orange-600 px-4 py-2">
                    <span className="text-white text-sm font-semibold">
                      {code.language || "코드"}
                    </span>
                    <span className="text-orange-100 text-xs ml-2">버그가 있는 코드</span>
                  </div>
                  <div className="bg-orange-50 p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 font-mono">
                      <code>{code.code || "// 코드가 없습니다"}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentProblem.reference_codes && currentProblem.reference_codes.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-green-700">정답 코드 (수정된 코드)</h5>
              {currentProblem.reference_codes.map((code: any, index: number) => (
                <div key={index} className="border border-green-300 rounded-lg overflow-hidden">
                  <div className="bg-green-600 px-4 py-2">
                    <span className="text-white text-sm font-semibold">
                      {code.language || "코드"}
                    </span>
                    <span className="text-green-100 text-xs ml-2">정답</span>
                  </div>
                  <div className="bg-green-50 p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 font-mono">
                      <code>{code.code || "// 코드가 없습니다"}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentProblem.test_cases && currentProblem.test_cases.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-purple-700">테스트 케이스</h5>
              {currentProblem.test_cases.map((testCase: any, index: number) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-purple-700 mb-2">
                    Test Case {index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Input:</span>
                      <pre className="mt-1 text-gray-800 font-mono text-xs bg-white p-2 rounded border border-purple-100">
                        {testCase.input || ""}
                      </pre>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Expected Output:</span>
                      <pre className="mt-1 text-gray-800 font-mono text-xs bg-white p-2 rounded border border-purple-100">
                        {testCase.expected_output || testCase.output || ""}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">답안 정보를 불러올 수 없습니다.</p>
      </div>
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
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h4 className="font-bold text-lg text-gray-900 mb-3">
            {currentProblem.title || "제목 없음"}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {currentProblem.problemType || currentProblem.problem_type || "유형 미지정"}
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
      </div>
    )
  }

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 max-w-[1800px] mx-auto p-6 w-full">
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

        <div className="space-y-6">
          <div className="flex gap-6 h-[700px]">
            <div className="flex-[7] bg-white rounded-lg shadow border flex flex-col">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800">문제 정보 및 답안</h3>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-6">
                {renderProblemDescription()}

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">문제 답안</h4>
                  {renderProblemAnswer()}
                </div>
              </div>
            </div>

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

          <div className="flex gap-6 overflow-x-auto pb-2">
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

            <div className="min-w-[500px] w-[calc(50%-12px)] bg-white rounded-lg shadow border flex flex-col h-[300px]">
              <div className="px-4 py-3 border-b bg-green-50">
                <h3 className="font-semibold text-green-600">교수 채점</h3>
              </div>
              <div className="p-4 flex-1 overflow-auto flex flex-col">
                <div className="flex flex-col h-full space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      점수 ({editedProfScore || 0} / {maxScore}점)
                    </label>
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
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!isGroupOwner}
                    />
                  </div>

                  <div className="flex-1 flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">피드백 (선택사항)</label>
                    <textarea
                      className="flex-1 w-full border rounded-lg p-2 text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editedProfFeedback}
                      onChange={(e) => setEditedProfFeedback(e.target.value)}
                      placeholder="교수 피드백을 입력하세요..."
                      disabled={!isGroupOwner}
                    />
                  </div>

                  {!isGroupOwner && (
                    <p className="text-xs text-gray-500">그룹장만 채점할 수 있습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white rounded-lg border shadow-sm p-4">
            <div className="text-sm text-gray-600">
              제출 시간: {new Date(current?.updatedAt || "").toLocaleString("ko-KR")}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-gray-600">AI 점수:</span>
                <span className="font-semibold">{current?.aiScore ?? 0}점</span>
                <span className="mx-2">|</span>
                <span className="text-gray-600">최종 점수:</span>
                <span className="font-semibold text-lg">
                  {editedProfScore || current?.profScore !== null ? `${editedProfScore || current?.profScore}점` : "-점"}
                </span>
                <span className="text-gray-400">/ {maxScore}점</span>
              </div>
              {isGroupOwner && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  검토 완료
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal />
    </div>
  )
}