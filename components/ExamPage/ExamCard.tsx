"use client"

import { useMemo } from "react"

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
	// 날짜 문자열을 Date 객체로 변환
	const pubStart = useMemo(() => new Date(workbook.publication_start_time), [workbook.publication_start_time])
	const pubEnd = useMemo(() => new Date(workbook.publication_end_time), [workbook.publication_end_time])
	const testStart = useMemo(() => new Date(workbook.test_start_time), [workbook.test_start_time])
	const testEnd = useMemo(() => new Date(workbook.test_end_time), [workbook.test_end_time])
	const now = useMemo(() => new Date(), [])

	// 조건 정의
	const inPublication = now >= pubStart && now <= pubEnd // 현재 시간이 게시기간 내에 있는지
	const inTestPeriod = now >= testStart && now <= testEnd // 현재 시간이 제출기간 내에 있는지
	// 👻 백엔드 구현 완료 후 주석 풀고 아래 코드 사용하기 (지금은 시험모드 정보가 없어서 그룹장인지로만 확인) -> 시험모드이고 교수자일 때만 시험 관련 정보 랜더링
	const showTestBanner = workbook.is_test_mode && inPublication && isGroupOwner
	// const showTestBanner = isGroupOwner
	const showScoreBanner = !isGroupOwner && inPublication && !inTestPeriod

	// 👻 백엔드 구현 후 버튼 디자인 구상 ~
	//   시험모드아님 => 문제풀기  *  시험모드+시험기간아님+게시기간+그룹장아님=> 결과 보러가기  *  시험모드+시험기간+그룹장아님=> 시험 보러가기
	const isExamButton = !workbook.is_test_mode || inTestPeriod

	// 📌 👻✨ - 7월 21일 회의에서 나온 내용
	// 버튼 막기 = 제출 한번 하면 끝나게. 버튼 막기. 백엔드에서 제출 횟수 보내줄거임. 그게 한번이면 버튼 바꾸기.
	// 게시기간+제출기간 수정할 수 있어야됨 => 게시기간
	return (
		<div
			onClick={onClick}
			className="group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl transform-gpu flex flex-col justify-between h-full"
		>
			{/* 문제지 제목 */}
			<div>
				<h2 className="text-xl font-semibold mb-2 overflow-hidden text-ellipsis">
					📄 {workbook.workbook_name.length > 24 ? `${workbook.workbook_name.slice(0, 24)}...` : workbook.workbook_name}
				</h2>
			</div>

			{/* 설명 + 문제 수 */}
			{/* 문제지 정보 - 문제지 설명 + 문제 수 <- 일반학생만 보이게*/}
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
						📅 게시 기간: {workbook.publication_start_time} ~ {workbook.publication_end_time}
					</div>
					<div className="text-xs text-gray-700">
						📝 제출 기간: {workbook.test_start_time} ~ {workbook.test_end_time}
					</div>
					<div className="text-xs text-gray-700">✔️ 총 배점: {workbook.workbook_total_points}</div>
				</div>
			)}

			{/*  =========== 시험모드 배너 (학생) =========== */}
			{showScoreBanner && (
				<div className="bg-red-50 rounded-lg p-4 mb-4 space-y-2">
					{/* 여기에 학생 체점 결과 동그라미들 뜨게 하기 */}
				</div>
			)}

			<button
				// disabled={!isButtonEnabled}
				className={`w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 ${"bg-mygreen text-white hover:bg-opacity-80"}`}
			>
				문제지 펼치기 →
			</button>
		</div>
	)
}
