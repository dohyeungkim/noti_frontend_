"use client"

import { useMemo, useState, useEffect } from "react"

interface ExamCardProps {
	workbook: {
		workbook_id: number
		group_id: number
		workbook_name: string
		problem_cnt: number
		description: string
		creation_date: string
		// 시험모드 관련
		is_test_mode: boolean
		test_start_time: string
		test_end_time: string
		publication_start_time: string
		publication_end_time: string
		workbook_total_points: number
	}
	onClick: () => void
	isGroupOwner: boolean
}

export default function ExamCard({ workbook, onClick, isGroupOwner }: ExamCardProps) {
	// ✅ 실시간 현재 시간 상태 추가
	const [currentTime, setCurrentTime] = useState(new Date())

	// ✅ 1초마다 현재 시간 업데이트
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000) // 1초마다 업데이트

		return () => clearInterval(timer)
	}, [])

	// 시간 포맷 함수
	const dateTimeFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat("ko-KR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
		[]
	)
	
	const pubStartDate = useMemo(() => new Date(workbook.publication_start_time), [workbook.publication_start_time])
	const pubEndDate = useMemo(() => new Date(workbook.publication_end_time), [workbook.publication_end_time])
	const testStartDate = useMemo(() => new Date(workbook.test_start_time), [workbook.test_start_time])
	const testEndDate = useMemo(() => new Date(workbook.test_end_time), [workbook.test_end_time])

	// 표시용 문자열
	const pubStartStr = dateTimeFormatter.format(pubStartDate)
	const pubEndStr = dateTimeFormatter.format(pubEndDate)
	const testStartStr = dateTimeFormatter.format(testStartDate)
	const testEndStr = dateTimeFormatter.format(testEndDate)

	// ✅ currentTime을 사용하여 실시간 체크
	const inPublication = workbook.is_test_mode ? currentTime >= pubStartDate && currentTime <= pubEndDate : true
	const inTestPeriod = workbook.is_test_mode ? currentTime >= testStartDate && currentTime <= testEndDate : true
	const isBeforeTest = workbook.is_test_mode && currentTime < testStartDate // ✅ <= 대신 < 사용

	const isButtonDisabled = !isGroupOwner && workbook.is_test_mode && isBeforeTest
	const buttonLabel = !workbook.is_test_mode
		? "문제지 펼치기 →"
		: isGroupOwner
		? "시험 관리 →"
		: isBeforeTest
		? "시험 시작 전"
		: inTestPeriod
		? "시험 보러가기 →"
		: "결과 보러가기 →"

	const showTestBanner = workbook.is_test_mode && (isGroupOwner || inPublication)

	return (
		<div
			onClick={onClick}
			className="group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl transform-gpu flex flex-col justify-between w-full"
		>
			{/* 문제지 제목 */}
			<div>
				<h2 className="text-xl font-semibold mb-2 overflow-hidden text-ellipsis">
					📄 {workbook.workbook_name.length > 24 ? `${workbook.workbook_name.slice(0, 24)}...` : workbook.workbook_name}
				</h2>
			</div>

			{/* 설명 + 문제 수 */}
			<div>
				<p
					title={workbook.description}
					className="mb-1 w-full text-gray-600 text-sm overflow-hidden text-ellipsis line-clamp-2"
				>
					{workbook.description}
				</p>
				<p className="mb-2">📌 문제 수: {workbook.problem_cnt}개</p>
			</div>

			{/*  =========== 시험모드 배너 (교수) =========== */}
			{showTestBanner && (
				<div className="bg-red-50 rounded-lg p-4 mb-4 space-y-2">
					<div className="flex items-center gap-2 mb-3">
						<span className="font-medium text-red-800">🎯 시험 모드</span>
					</div>
					<div className="text-xs text-gray-700">
						📅 게시 기간: {pubStartStr} ~ {pubEndStr}
					</div>
					<div className="text-xs text-gray-700">
						📝 제출 기간: {testStartStr} ~ {testEndStr}
					</div>
					<div className="text-xs text-gray-700">✔️ 총 배점: {workbook.workbook_total_points}</div>
				</div>
			)}

			{/* ✅ 시험 시작 전일 때 카운트다운 표시 (선택사항) */}
			{!isGroupOwner && workbook.is_test_mode && isBeforeTest && (
				<div className="text-xs text-center text-gray-500 mb-2">
					시험 시작: {testStartStr}
				</div>
			)}

			<button
				onClick={(e) => {
					e.stopPropagation()
					if (isButtonDisabled) return
					onClick()
				}}
				disabled={isButtonDisabled}
				aria-disabled={isButtonDisabled}
				className={`w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
					isButtonDisabled
						? "bg-gray-300 text-gray-600 cursor-not-allowed"
						: "bg-mygreen text-white hover:bg-opacity-80"
				}`}
			>
				{buttonLabel}
			</button>
		</div>
	)
}