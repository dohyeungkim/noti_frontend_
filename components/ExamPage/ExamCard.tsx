"use client"

interface ExamCardProps {
	workbook: {
		workbook_id: number
		group_id: number
		workbook_name: string
		problem_cnt: number
		description: string
		creation_date: string
		workbook_total_points: number
	}
	exam?: {
		examId: string
		startTime: string
		endTime: string
	} | null
	onClick: () => void
	isGroupOwner: boolean
}

export default function ExamCard({ workbook, onClick, isGroupOwner }: ExamCardProps) {
	return (
		<div
			onClick={onClick}
			className="group relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer 
                shadow-md transition-all duration-300 ease-in-out 
                hover:-translate-y-1 hover:shadow-xl transform-gpu 
                flex flex-col justify-between h-full"
		>
			{/* 문제지 제목 */}
			<div>
				<h2 className="text-xl font-semibold mb-2 overflow-hidden text-ellipsis">
					📄 {workbook.workbook_name.length > 24 ? `${workbook.workbook_name.slice(0, 24)}...` : workbook.workbook_name}
				</h2>
			</div>

			{/* 문제지 정보 - 문제지 설명 + 문제 수 <- 일반학생만 보이게*/}
			<div>
				<p
					title={workbook.description}
					className="mb-1 w-full text-gray-600 text-sm overflow-hidden text-ellipsis line-clamp-2"
				>
					{workbook.description}
				</p>
				<p className="mb-2  ">📌 문제 수: {workbook.problem_cnt}개</p>
			</div>

			{/* 👻 시험모드이고, 그룹장일 때는 이 영역이 랜더링 되도록 할 것 */}
			{isGroupOwner && (
				<div className="bg-red-50 rounded-lg p-4 mb-4 space-y-2">
					{/* 시험 모드 배너 */}
					<div className="flex items-center gap-2 text-100 mb-3">
						<span className="font-medium text-red-800">🎯 시험 모드</span>
					</div>

					{/* 문제지 게시 일시 */}
					<div className="text-xs text-gray-700">
						<span className="font-medium">📅 게시 기간:</span>
					</div>

					{/* 제출 가능 기간 */}
					<div className="text-xs text-gray-700">
						<span className="font-medium">📝 제출 기간:</span>
					</div>

					{/* 문제 수 */}
					<div className="text-xs text-gray-700">
						<p className="font-medium">📌 문제 수: {workbook.problem_cnt}개</p>
					</div>

					{/* 문제 배점 - Problem쪽에 total_points DB 필드가 있음. 이 문제지의 총 배점 나타내는 */}
					<div className="text-xs text-gray-700">
						<span className="font-medium">✔️ 총 배점: {workbook.workbook_total_points}</span>
					</div>
				</div>
			)}

			{/* ✅ 버튼 - 항상 아래에 위치 */}
			<button className="w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80">
				문제지 펼치기 →
			</button>
		</div>
	)
}
