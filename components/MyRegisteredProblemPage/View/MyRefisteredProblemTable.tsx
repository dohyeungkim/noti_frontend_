"use client"
// 내가 등록한 문제들 페이지의 문제 테이블뷰 컴포넌트

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface Question {
	problem_id: number
	title: string
	group: string
	paper: string
	solvedCount: number
	description?: string
}

interface TableViewProps {
	filteredData: Question[]
	handleDeleteButtonClick: (problem_id: number) => Promise<void>
}

export default function TableView({ filteredData }: TableViewProps) {
	const router = useRouter()

	return (
		<motion.div className="w-full overflow-hidden shadow-md rounded-2xl">
			<table className="w-full border-collapse bg-white">
				<thead className="bg-gray-100">
					<tr>
						<th className="p-4 text-left">문제 제목</th>
						<th className="p-4 text-center">작업</th>
					</tr>
				</thead>
				<tbody>
					{filteredData.length > 0 ? (
						filteredData.map((item) => (
							<tr key={item.problem_id} className="border-t transition-all duration-200 hover:bg-gray-50">
								<td className="p-4">{item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title}</td>
								<td className="p-4 flex justify-center gap-3">
									{/* 문제 보기 버튼 */}
									<button
										onClick={() => router.push(`/registered-problems/view/${item.problem_id}`)}
										className="bg-mygreen text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-opacity-80 transition-all"
									>
										문제 보기
									</button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={4} className="text-center text-gray-500 p-5">
								📌 등록된 문제가 없습니다.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</motion.div>
	)
}
