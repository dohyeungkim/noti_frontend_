"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from 'remark-gfm'

interface Question {
	problem_id: number
	title: string
	group: string
	paper: string
	solvedCount: number
	description?: string
}

interface GalleryViewProps {
	filteredData: Question[]
	selectedProblem: Question | null
	handleCloseDetail: () => void
	handleHoverStartProblem: (problem: Question) => void
	handleHoverEndProblem: () => void
	handleDeleteButtonClick: (problem_id: number) => Promise<void>
}

export default function GalleryView({ filteredData, selectedProblem }: GalleryViewProps) {
	const router = useRouter()

	return (
		<>
			<motion.div className="flex transition-all duration-300">
				<motion.div
					className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${
						selectedProblem ? "w-2/3" : "w-full"
					}`}
				>
					{filteredData.length > 0 ? (
						filteredData.map((item) => (
							<motion.div
								key={item.problem_id}
								className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col h-[240px]"
							>
								<div className="flex flex-col flex-1">
									{/* 제목 영역 - 고정 높이 */}
									<h3 
										className="text-lg font-semibold w-auto line-clamp-2 whitespace-pre-wrap break-words mb-3 h-[56px]" 
										title={item.title}
									>
										✏️ {item.title}
									</h3>

									{/* 설명 영역 - 고정 높이 줄임 */}
									<p 
										className="text-gray-500 text-sm break-words mb-2 h-[60px]"
										style={{
											display: '-webkit-box',
											WebkitLineClamp: 3,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											whiteSpace: 'pre-wrap'
										}}
									>
										<ReactMarkdown>{item.group}</ReactMarkdown>
									</p>

									{/* 날짜 영역 */}
									<p className="text-gray-400 text-xs mb-3">{item.paper}</p>

									{/* 버튼 영역 - 하단 고정 */}
									<div className="mt-auto">
										<button
											onClick={(e) => {
												e.stopPropagation()
												router.push(`/registered-problems/view/${item.problem_id}`)
											}}
											className="bg-mygreen text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-opacity-80 transition-all w-full"
										>
											문제 보기
										</button>
									</div>
								</div>
							</motion.div>
						))
					) : (
						<div className="col-span-full text-center text-gray-500">
							문제가 없습니다.
						</div>
					)}
				</motion.div>
			</motion.div>
		</>
	)
}
