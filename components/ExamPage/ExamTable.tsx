"use client"

import { formatTimestamp } from "../util/dageUtils"

interface ExamTableProps {
	workbooks: {
		workbook_id: number
		group_id: number
		workbook_name: string
		problem_cnt: number
		description: string
		creation_date: string
	}[]

	handleEnterExam: (examId: string) => void
}

export default function ExamTable({ workbooks, handleEnterExam }: ExamTableProps) {
	return (
		<div className="w-full overflow-x-auto">
			<table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
				<thead className="bg-gray-200">
					<tr className="border-b-4 border-gray-200 text-gray-800">
						<th className="px-5 py-4 text-center text-lg font-semibold">문제지 이름</th>
						<th className="px-5 py-4 text-center text-lg font-semibold">문제지 설명</th>
						<th className="px-5 py-4 text-center text-lg font-semibold">문제 수</th>
						<th className="px-5 py-4 text-center text-lg font-semibold">생성일</th>
						<th className="px-5 py-4 text-center text-lg font-semibold">들어가기</th>
					</tr>
				</thead>
				<tbody>
					{workbooks.length > 0 ? (
						workbooks.map((workbook) => {
							const rowBgColor = "bg-white"
							const hoverBgColor = "hover:bg-gray-100"

							return (
								<tr
									key={workbook.workbook_id}
									className={`${rowBgColor} ${hoverBgColor} transition-colors duration-200 border-b border-gray-300 cursor-pointer group`}
									onClick={() => handleEnterExam(workbook.workbook_id)}
								>
									<td className="px-5 py-4 text-center text-gray-800 font-medium">
										<h2 className="px-5 py-4 text-center text-gray-600">
											{workbook.workbook_name.length > 10
												? `${workbook.workbook_name.slice(0, 10)}...`
												: workbook.workbook_name}
										</h2>
									</td>
									<td className="px-5 py-4 text-center text-gray-600">
										<h2 className="px-5 py-4 text-center text-gray-600">
											{workbook.description.length > 10
												? `${workbook.description.slice(0, 10)}...`
												: workbook.description}
										</h2>
									</td>
									<td className="px-5 py-4 text-center text-gray-500">{workbook.problem_cnt}개</td>

									<td className="px-5 py-4 text-center text-gray-500">📅 {formatTimestamp(workbook.creation_date)}</td>

									<td className="px-5 py-4 text-center">
										<button
											className={
												"w-full py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80"
											}
										>
											문제지 펼치기
										</button>
									</td>
								</tr>
							)
						})
					) : (
						<tr>
							<td colSpan={4} className="text-center text-gray-500 text-lg p-6">
								등록된 문제지가 없습니다.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}
