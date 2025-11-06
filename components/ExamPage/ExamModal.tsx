"use client"
// 문제지 생성하는 모달창 (가독성 개선 버전)

import { workbook_api } from "@/lib/api"
import { useMemo, useState } from "react"

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

  // ───────────────── helpers ─────────────────
  const nowLocalISO = useMemo(() => formatForDatetimeLocal(new Date()), [])

  const asDate = (s: string) => new Date(s)
  const minutesBetween = (a: string, b: string) =>
    Math.round((asDate(b).getTime() - asDate(a).getTime()) / 60000)

  const validateExamDates = () => {
    if (!isExamMode) return true

    const pubStartDate = new Date(publication_start_time)
    const pubEndDate = new Date(publication_end_time)
    const startDate = new Date(test_start_time)
    const endDate = new Date(test_end_time)
    const now = new Date()

    if (pubStartDate < now) {
      setErrorMessage("📌 게시 시작 일시는 현재 시간 이후여야 해.")
      return false
    }
    if (pubEndDate <= pubStartDate) {
      setErrorMessage("📌 게시 종료는 게시 시작 이후여야 해.")
      return false
    }
    if (startDate < pubStartDate) {
      setErrorMessage("📌 제출 시작은 게시 시작 이후여야 해.")
      return false
    }
    if (endDate <= startDate) {
      setErrorMessage("📌 제출 종료는 제출 시작 이후여야 해.")
      return false
    }
    if (endDate > pubEndDate) {
      setErrorMessage("📌 제출 종료는 게시 종료 이전이어야 해.")
      return false
    }
    return true
  }

  const applyPreset = (preset: "today2h" | "tomorrowMorning" | "weekExam2h") => {
    const now = new Date()
    const fmt = (d: Date) => formatForDatetimeLocal(d)

    if (preset === "today2h") {
      const pubS = new Date(now.getTime() + 10 * 60 * 1000) // 10분 뒤 공개
      const pubE = new Date(pubS.getTime() + 7 * 24 * 60 * 60 * 1000)
      const testS = new Date(pubS.getTime())
      const testE = new Date(testS.getTime() + 2 * 60 * 60 * 1000) // 2시간 시험
      setPublicationStartDate(fmt(pubS))
      setPublicationEndDate(fmt(pubE))
      setSubmitStartDate(fmt(testS))
      setSubmitEndDate(fmt(testE))
    }

    if (preset === "tomorrowMorning") {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0)
      const pubS = new Date(tomorrow) // 내일 09:00 공개
      const testS = new Date(tomorrow) // 내일 09:00 시작
      const testE = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000) // 2시간
      const pubE = new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000) // 7일 공개
      setPublicationStartDate(fmt(pubS))
      setPublicationEndDate(fmt(pubE))
      setSubmitStartDate(fmt(testS))
      setSubmitEndDate(fmt(testE))
    }

    if (preset === "weekExam2h") {
      // 다음 주 월요일 09:00 ~ 11:00
      const nowDay = now.getDay() // 0:일 ~ 6:토
      const add = ((8 - nowDay) % 7) || 7
      const monday9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add - 1, 9, 0, 0)
      const pubS = new Date(monday9.getTime() - 2 * 24 * 60 * 60 * 1000) // 시험 이틀 전부터 공개
      const testS = monday9
      const testE = new Date(monday9.getTime() + 2 * 60 * 60 * 1000)
      const pubE = new Date(monday9.getTime() + 5 * 24 * 60 * 60 * 1000) // 금요일까지 공개
      setPublicationStartDate(fmt(pubS))
      setPublicationEndDate(fmt(pubE))
      setSubmitStartDate(fmt(testS))
      setSubmitEndDate(fmt(testE))
    }

    setErrorMessage(null)
  }

  const handleCreateWorkbook = async () => {
    if (!WorkBookName.trim()) {
      setErrorMessage("📌 문제지 이름을 입력해줘.")
      return
    }
    if (!WorkBookDescription.trim()) {
      setErrorMessage("📌 문제지 소개를 입력해줘.")
      return
    }
    if (!validateExamDates()) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      await workbook_api.workbook_create(
        group_id,
        WorkBookName.trim(),
        WorkBookDescription.trim(),
        isExamMode,
        isExamMode ? test_start_time : null,
        isExamMode ? test_end_time : null,
        isExamMode ? publication_start_time : null,
        isExamMode ? publication_end_time : null
      )

      setWorkBookName("")
      setWorkBookDescription("")
      setIsExamMode(false)
      setIsModalOpen(false)
      setRefresh(!refresh)
    } catch (error) {
      console.error("문제지 생성 실패:", error)
      setErrorMessage("문제지 생성 중 오류가 발생했어.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isModalOpen) return null

  // ─────────────── UI 조각: 공통 datetime 필드 ───────────────
  const DateField = ({
    label,
    value,
    onChange,
    min,
    note,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    min?: string
    note?: string
  }) => (
    <label className="flex flex-col gap-1 w-full">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <input
        type="datetime-local"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-gray-600 focus:outline-none"
      />
      {note && <span className="text-xs text-gray-500">{note}</span>}
    </label>
  )

  // ─────────────── 상태 요약/경고 타임라인 ───────────────
  const timeline = useMemo(() => {
    if (!isExamMode) return []
    const steps = [
      { key: "pubS", label: "게시 시작", ok: publication_start_time >= nowLocalISO },
      { key: "pubE", label: "게시 종료", ok: publication_end_time > publication_start_time },
      { key: "testS", label: "제출 시작", ok: test_start_time >= publication_start_time },
      { key: "testE", label: "제출 종료", ok: test_end_time > test_start_time && test_end_time <= publication_end_time },
    ]
    return steps
  }, [isExamMode, publication_start_time, publication_end_time, test_start_time, test_end_time, nowLocalISO])

  const durPubMin = useMemo(() => minutesBetween(publication_start_time, publication_end_time), [publication_start_time, publication_end_time])
  const durTestMin = useMemo(() => minutesBetween(test_start_time, test_end_time), [test_start_time, test_end_time])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
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

        {/* 본문 */}
        {!isConfirming ? (
          <div className="flex flex-col gap-5 mt-4">
            {/* 기본 정보 */}
            <div className="flex flex-col gap-3">
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
                } focus:ring-2 focus:ring-gray-600 focus:outline-none`}
              />
              <textarea
                value={WorkBookDescription}
                onChange={(e) => {
                  setWorkBookDescription(e.target.value)
                  setErrorMessage(null)
                }}
                placeholder="문제지 소개"
                className={`p-2 border rounded-md h-20 transition ${
                  errorMessage && WorkBookDescription.trim() === "" ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-gray-600 focus:outline-none`}
              />
            </div>

            {/* 시험 모드 토글 */}
            <div className="flex items-center justify-between border border-gray-300 p-3 rounded-lg">
              <span className="text-sm text-gray-700">시험 모드</span>
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

            {/* 시험 모드 설정 */}
            {isExamMode && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-blue-900">🎯 시험 모드 설정</h3>
                  {/* 빠른 설정 */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("today2h")}
                      className="text-xs px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
                    >
                      지금+10분 ~ 2시간
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("tomorrowMorning")}
                      className="text-xs px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
                    >
                      내일 09:00~11:00
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("weekExam2h")}
                      className="text-xs px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
                    >
                      다음 주 월 09~11
                    </button>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-xs text-gray-600 bg-white p-3 rounded-md">
                  제출 시간은 게시 기간 안에 넣어주셔야합니다!!
                </p>

                {/* 타임라인 요약 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {timeline.map((s, i) => (
                    <div key={s.key} className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          s.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {s.label} {s.ok ? "OK" : "확인"}
                      </span>
                      {i < timeline.length - 1 && <span className="text-gray-400">—</span>}
                    </div>
                  ))}
                </div>

                {/* 구간 카드: 게시 */}
                <section className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">📢 게시 구간</h4>
                    <span className="text-xs text-gray-500">
                      총 {Math.max(durPubMin, 0)}분
                    </span>
                  </div>
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <DateField
                      label="게시 시작"
                      value={publication_start_time}
                      min={nowLocalISO}
                      onChange={(v) => {
                        setPublicationStartDate(v)
                        // 게시 시작 당겨지면 제출 시작도 최소 맞춰주기(부드러운 보정)
                        if (test_start_time < v) setSubmitStartDate(v)
                        setErrorMessage(null)
                      }}
                      note="현재 이후여야 함"
                    />
                    <DateField
                      label="게시 종료"
                      value={publication_end_time}
                      min={publication_start_time}
                      onChange={(v) => {
                        setPublicationEndDate(v)
                        // 게시 종료가 제출 종료보다 앞서면 제출 종료도 보정
                        if (test_end_time > v) setSubmitEndDate(v)
                        setErrorMessage(null)
                      }}
                      note="시작 이후여야 함"
                    />
                  </div>
                </section>

                {/* 구간 카드: 제출(시험) */}
                <section className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">📝 제출 구간</h4>
                    <span className="text-xs text-gray-500">
                      총 {Math.max(durTestMin, 0)}분
                    </span>
                  </div>
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <DateField
                      label="제출 시작"
                      value={test_start_time}
                      min={publication_start_time}
                      onChange={(v) => {
                        setSubmitStartDate(v)
                        // 제출 시작이 종료를 넘으면 종료도 따라가게
                        if (test_end_time <= v) {
                          // 기본 60분 확보
                          const t = new Date(v)
                          t.setMinutes(t.getMinutes() + 60)
                          setSubmitEndDate(formatForDatetimeLocal(t))
                        }
                        setErrorMessage(null)
                      }}
                      note="게시 시작 이후"
                    />
                    <DateField
                      label="제출 종료"
                      value={test_end_time}
                      min={test_start_time}
                      onChange={(v) => {
                        setSubmitEndDate(v)
                        setErrorMessage(null)
                      }}
                      note="제출 시작 이후 · 게시 종료 이전"
                    />
                  </div>
                </section>
              </div>
            )}

            {/* 에러 메시지 */}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          </div>
        ) : (
          // 확인 단계
          <div className="text-center my-6">
            <h3 className="text-lg font-semibold mb-4">&quot;{WorkBookName}&quot; 문제지를 생성하시겠습니까?</h3>
            {isExamMode && (
              <div className="text-sm text-blue-700 mb-4 whitespace-pre-line">
                {`시험 모드
                게시시간 ${publication_start_time} → ${publication_end_time} 
                제출시간 ${test_start_time} → ${test_end_time}`
                }
              </div>
            )}
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

        {/* 하단 고정 버튼 */}
        {!isConfirming && (
          <button
            type="button"
            onClick={() => {
              if (!WorkBookName.trim() || !WorkBookDescription.trim()) {
                setErrorMessage("📌 문제지 이름과 소개를 입력해줘!")
                return
              }
              if (isExamMode && !validateExamDates()) return
              setIsConfirming(true)
            }}
            disabled={isLoading}
            className={`mt-5 w-full bg-mygreen text-white py-3 rounded-md text-lg cursor-pointer hover:bg-opacity-90 transition sticky bottom-0 z-10 ${
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
