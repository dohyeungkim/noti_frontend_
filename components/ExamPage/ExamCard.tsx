"use client"

import { useExamMode } from "@/hooks/useExamMode"
import { ExamCardData } from "@/data/examCardDummy"

interface ExamCardProps {
	data: ExamCardData
	onClick: () => void
	isGroupOwner?: boolean // 그룹장 여부
}

export default function ExamCard({ data, onClick, isGroupOwner = false }: ExamCardProps) {
	const { isExamMode } = useExamMode()
	const { workbook, exam } = data

	// 날짜 포맷팅 함수
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	// 현재 시간 기준으로 상태 판단
	const getExamStatus = () => {
		if (!exam) return null

		const now = new Date()
		const creationDate = new Date(workbook.creation_date)
		const submitStart = new Date(exam.startTime)
		const submitEnd = new Date(exam.endTime)

		if (now < creationDate) {
			return { status: "upcoming", text: "게시 예정", color: "bg-gray-100 text-gray-600" }
		} else if (now >= creationDate && now < submitStart) {
			return { status: "published", text: "게시됨", color: "bg-blue-100 text-blue-600" }
		} else if (now >= submitStart && now <= submitEnd) {
			return { status: "active", text: "제출 가능", color: "bg-green-100 text-green-600" }
		} else {
			return { status: "ended", text: "제출 마감", color: "bg-red-100 text-red-600" }
		}
	}

	const examStatus = exam ? getExamStatus() : null

	return (
		<div
			onClick={onClick}
			className="group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer
                 shadow-md transition-all duration-300 ease-in-out
                 hover:-translate-y-1 hover:shadow-xl transform-gpu
                 flex flex-col justify-between h-full"
		>
			{/* 상단: 제목 및 상태 */}
			<div className="flex-shrink-0">
				<div className="flex items-start justify-between mb-3">
					<h2 className="text-xl font-semibold flex-1 overflow-hidden text-ellipsis" title={workbook.workbook_name}>
						📄{" "}
						{workbook.workbook_name.length > 20 ? `${workbook.workbook_name.slice(0, 20)}...` : workbook.workbook_name}
					</h2>

					{/* 시험 상태 뱃지 (exam이 있을 때만) */}
					{exam && examStatus && (
						<span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${examStatus.color}`}>
							{examStatus.text}
						</span>
					)}
				</div>
			</div>

			{/* 중간: 설명 */}
			<div className="flex-1 flex flex-col justify-center my-4">
				<p title={workbook.description} className="text-gray-600 text-sm overflow-hidden text-ellipsis line-clamp-3">
					{workbook.description}
				</p>
			</div>

			{/* 시험 정보 표시: 시험모드이고 그룹장일 때만 */}
			{isExamMode && isGroupOwner && exam && (
				<div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-2">
					{/* 시험 모드 배너 */}
					<div className="flex items-center gap-2 text-sm">
						<span className="font-medium text-blue-800">🎯 시험 모드</span>
					</div>

					{/* 문제지 게시 일시 */}
					<div className="text-xs text-gray-700">
						<span className="font-medium">📅 게시 일시:</span>
						<div className="ml-2 mt-1">{formatDate(workbook.creation_date)}</div>
					</div>

					{/* 제출 가능 기간 */}
					<div className="text-xs text-gray-700">
						<span className="font-medium">📝 제출 기간:</span>
						<div className="ml-2 mt-1">
							<>
								{formatDate(exam.startTime)} ~<br />
								{formatDate(exam.endTime)}
							</>
						</div>
					</div>

					{/* 문제 수 및 총 배점 */}
					<div className="flex items-center justify-between text-xs text-gray-700">
						<span>📌 문제 수: {workbook.problem_cnt}개</span>
						<span>💯 총 배점: {exam.totalScore}점</span>
					</div>
				</div>
			)}

			{/* 하단: 버튼 */}
			<div className="flex-shrink-0">
				<button className="w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80">
					{exam ? "시험 입장하기 →" : "문제지 펼치기 →"}
				</button>
			</div>
		</div>
	)
}

// ----- 기존 코드 -----
// "use client";

// interface ExamCardProps {
//   workbook: {
//     workbook_id: number;
//     group_id: number;
//     workbook_name: string;
//     problem_cnt: number;
//     description: string;
//     creation_date: string;
//   };
//   exam?: {
//     examId: string;
//     startTime: string;
//     endTime: string;
//   } | null;
//   onClick: () => void;
// }

// export default function ExamCard({ workbook, onClick }: ExamCardProps) {
//   return (
//     <div
//       onClick={onClick}
//       className="group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer
//                 shadow-md transition-all duration-300 ease-in-out
//                 hover:-translate-y-1 hover:shadow-xl transform-gpu
//                 flex flex-col justify-between h-full"
//     >
//       {/* ✅ 제목 (workbook_name) - 상단 고정 */}
//       <div>
//         <h2 className="text-xl font-semibold mb-2 overflow-hidden text-ellipsis">
//           📄{" "}
//           {workbook.workbook_name.length > 24
//             ? `${workbook.workbook_name.slice(0, 24)}...`
//             : workbook.workbook_name}
//         </h2>
//       </div>

//       {/* ✅ 설명 및 정보 - 하단 정렬 */}
//       <div>
//         <p
//           title={workbook.description}
//           className="mb-1 w-full text-gray-600 text-sm overflow-hidden text-ellipsis line-clamp-2"
//         >
//           {workbook.description}
//         </p>
//         <p className="mb-2  ">📌 문제 수: {workbook.problem_cnt}개</p>
//       </div>

//       {/* ✅ 버튼 - 항상 아래에 위치 */}
//       <button className="w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80">
//         문제지 펼치기 →
//       </button>
//     </div>
//   );
// }
