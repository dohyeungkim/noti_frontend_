"use client"
// 문제지 생성하는 모달창

import { workbook_api } from "@/lib/api"
import { useState } from "react"

interface WorkBookCreateModalProps {
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
  WorkBookName: string
  setWorkBookName: (name: string) => void
  WorkBookDescription: string
  setWorkBookDescription: (description: string) => void

  group_id: number
  refresh: boolean
  setRefresh: (refresh: boolean) => void
}

export default function WorkBookCreateModal({
  isModalOpen,
  setIsModalOpen,
  WorkBookName,
  setWorkBookName,
  WorkBookDescription,
  setWorkBookDescription,

  refresh,
  setRefresh,
  group_id,
}: WorkBookCreateModalProps) {
  const formatForDatetimeLocal = (d: Date) => {
    // timezone offset(ms) 빼서 로컬 기준 ISO 문자열로 변환
    const tzoffset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16)
  }

  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 시험모드 관련 상태 (UI 구현용)
  const [isExamMode, setIsExamMode] = useState(false)
  const [publication_start_time, setPublicationStartDate] = useState<string>(formatForDatetimeLocal(new Date()))
  const [publication_end_time, setPublicationEndDate] = useState<string>(
    formatForDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  )
  const [test_start_time, setSubmitStartDate] = useState<string>(formatForDatetimeLocal(new Date()))
  const [test_end_time, setSubmitEndDate] = useState<string>(
    formatForDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000))
  )

  // 날짜 검증 공통 함수 (버튼/실제 생성 시 모두 사용)
  const validateExamDates = () => {
    if (!isExamMode) return true

    const pubStartDate = new Date(publication_start_time)
    const pubEndDate = new Date(publication_end_time)
    const startDate = new Date(test_start_time)
    const endDate = new Date(test_end_time)

    const now = new Date()

    if (pubStartDate < now) {
      setErrorMessage("📌 게시 시작 일시는 현재 시간 이후여야 합니다!")
      return false
    }
    if (pubEndDate <= pubStartDate) {
      setErrorMessage("📌 게시 종료 일시는 게시 시작 일시 이후여야 합니다!")
      return false
    }
    if (startDate < pubStartDate) {
      setErrorMessage("📌 제출 시작 일시는 게시 시작 일시 이후여야 합니다!")
      return false
    }
    if (endDate <= startDate) {
      setErrorMessage("📌 제출 종료 일시는 제출 시작 일시 이후여야 합니다!")
      return false
    }
    if (endDate > pubEndDate) {
      setErrorMessage("📌 제출 종료 일시는 게시 종료 일시 이전이어야 합니다!")
      return false
    }
    return true
  }

  const handleCreateWorkbook = async () => {
    if (!WorkBookName.trim()) {
      setErrorMessage("📌 문제지 이름을 입력해주세요!")
      return
    }
    if (!WorkBookDescription.trim()) {
      setErrorMessage("📌 문제지 소개를 입력해주세요!")
      return
    }

    // 시험모드인 경우 UI 유효성 검증
    if (!validateExamDates()) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const payload = {
        group_id,
        workbook_name: WorkBookName.trim(),
        description: WorkBookDescription.trim(),
        is_test_mode: isExamMode,
        test_start_time: isExamMode ? test_start_time : null,
        test_end_time: isExamMode ? test_end_time : null,
        publication_start_time: isExamMode ? publication_start_time : null,
        publication_end_time: isExamMode ? publication_end_time : null,
      }

      // 문제지 생성 API 호출
      await workbook_api.workbook_create(
        payload.group_id,
        payload.workbook_name,
        payload.description,
        payload.is_test_mode,
        payload.test_start_time,
        payload.test_end_time,
        payload.publication_start_time,
        payload.publication_end_time
      )

      // 성공 처리
      setWorkBookName("")
      setWorkBookDescription("")
      setIsExamMode(false)
      setIsModalOpen(false)
      setRefresh(!refresh)
    } catch (error) {
      console.error("문제지 생성 실패:", error)
      setErrorMessage("문제지 생성 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center border-b pb-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">문제지 추가하기</h2>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null)
              setIsModalOpen(false)
            }}
            className="text-gray-800 hover:text-opacity-80 text-2xl"
          >
            ✖
          </button>
        </div>

        {/* 입력 폼 */}
        {!isConfirming ? (
          <div className="flex flex-col gap-4 mt-4">
            {/* 문제지 이름 입력 */}
            <input
              type="text"
              value={WorkBookName}
              onChange={(e) => {
                setWorkBookName(e.target.value)
                setErrorMessage(null)
              }}
              placeholder="문제지 이름"
              className={`p-2 border rounded-md transition ${
                errorMessage && WorkBookName.trim() === "" ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-gray-500 focus:outline-none`}
            />

            {/* 문제지 소개 입력 */}
            <textarea
              value={WorkBookDescription}
              onChange={(e) => {
                setWorkBookDescription(e.target.value)
                setErrorMessage(null)
              }}
              placeholder="문제지 소개"
              className={`p-2 border rounded-md h-20 transition ${
                errorMessage && WorkBookDescription.trim() === "" ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-gray-500 focus:outline-none`}
            />

            {/* ----- 시험모드 설정 ----- */}
            <div className="flex justify-between items-center border border-gray-300 p-3 rounded-lg">
              <span className="text-sm text-gray-600">시험 모드</span>
              <button
                type="button"
                onClick={() => setIsExamMode((v) => !v)}
                className={`px-4 py-1 rounded-lg text-sm transition ${
                  isExamMode ? "bg-mygreen text-white" : "bg-gray-300 text-gray-700"
                }`}
              >
                {isExamMode ? "활성화" : "비활성화"}
              </button>
            </div>

            {/* 시험모드가 활성화된 경우 추가 설정 표시 */}
            {isExamMode && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3 my-4">
                <h3 className="font-medium text-blue-800 mb-2">🎯 시험 모드 설정</h3>

                {/* 설명 텍스트 */}
                <div className="bg-white p-3 rounded-md text-xs text-gray-600 mb-2">
                  시험 모드에서는 문제지 게시 기간과 답안 제출 기간을 별도로 설정할 수 있습니다. 학생들은 제출 기간
                  내에만 답안을 제출할 수 있습니다.
                </div>

                {/* 문제지 게시 시작 일시 */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">📅 게시 시작 일시</label>
                  <input
                    type="datetime-local"
                    value={publication_start_time}
                    onChange={(e) => setPublicationStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500">이 시점에 문제지가 공개됩니다</p>
                </div>

                {/* 문제지 게시 종료 일시 */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">📅 게시 종료 일시</label>
                  <input
                    type="datetime-local"
                    value={publication_end_time}
                    onChange={(e) => setPublicationEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500">이 시점에 문제지가 비공개로 전환됩니다</p>
                </div>

                {/* 제출 시작 일시 */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">📝 제출 시작 일시</label>
                  <input
                    type="datetime-local"
                    value={test_start_time}
                    onChange={(e) => setSubmitStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500">이 시점부터 답안 제출이 가능합니다</p>
                </div>

                {/* 제출 종료 일시 */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">🏁 제출 종료 일시</label>
                  <input
                    type="datetime-local"
                    value={test_end_time}
                    onChange={(e) => setSubmitEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500">이 시점 이후 답안 제출이 마감됩니다</p>
                </div>
              </div>
            )}

            {/* 에러 메시지 출력 */}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          </div>
        ) : (
          // 문제지 생성 확인 단계
          <div className="text-center my-4">
            <h3 className="text-lg font-semibold mb-4">&quot;{WorkBookName}&quot; 문제지를 생성하시겠습니까?</h3>
            {isExamMode && <p className="text-sm text-blue-600 mb-4">🎯 시험 모드가 활성화됩니다</p>}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCreateWorkbook}
                disabled={isLoading}
                className={`bg-mygreen text-white py-2 px-6 rounded-md transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                {isLoading ? "생성 중..." : "예"}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="bg-myred text-white py-2 px-6 rounded-md hover:bg-red-700 transition"
              >
                아니요
              </button>
            </div>
          </div>
        )}

        {/* 문제지 생성 버튼 */}
        {!isConfirming && (
          <button
            type="button"
            onClick={() => {
              if (!WorkBookName.trim() || !WorkBookDescription.trim()) {
                setErrorMessage("📌 문제지 이름과 소개를 입력해주세요!")
                return
              }
              // ✅ 확인 단계로 넘어가기 전에 시험모드 날짜 선검증
              if (isExamMode && !validateExamDates()) return

              setIsConfirming(true)
            }}
            disabled={isLoading}
            className={`mt-4 w-full bg-mygreen text-white py-3 rounded-md text-lg cursor-pointer hover:bg-opacity-80 transition sticky bottom-0 z-10 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "생성 중..." : "문제지 생성하기"}
          </button>
        )}
      </div>
    </div>
  )
}
