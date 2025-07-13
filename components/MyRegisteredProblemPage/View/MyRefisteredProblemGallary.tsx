"use client"//클라이언트 사용

import { useRouter } from "next/navigation" //훅과 모듈을 추가
import { motion } from "framer-motion"

interface Question { //question의 타입정의
	problem_id: number
	title: string
	group: string
	paper: string
	solvedCount: number
	description?: string
}

interface GalleryViewProps { //Galleryview props속성타입정의
	filteredData: Question[]
	selectedProblem: Question | null
	handleCloseDetail: () => void
	handleHoverStartProblem: (problem: Question) => void
	handleHoverEndProblem: () => void
	handleDeleteButtonClick: (problem_id: number) => Promise<void>
}

export default function GalleryView({ filteredData, selectedProblem }: GalleryViewProps) {
	const router = useRouter()

	return ( //사용자UI
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
								className="bg-white p-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
							>
								<div className="p-1 rounded-lg">
									<h3 className="m-3 text-xl font-semibold w-auto truncate" title={item.title}>
										✏️ {item.title}
									</h3>

									<p className="text-gray-500 text-sm m-3">{item.group}</p>
									<p className="text-gray-400 text-sm">{item.paper}</p>

									{/* 문제 보기 버튼 (디자인 개선) */}
									<div className="flex justify-center mt-3">
										<button
											onClick={(e) => {
												e.stopPropagation() // ✅ 부모 div의 클릭 이벤트 방지
												router.push(`/registered-problems/view/${item.problem_id}`)
											}}
											className="bg-mygreen text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-opacity-80 transition-all w-full"
										>
											문제 보기
										</button>
									</div>
								</div>
							</motion.div>
						))
					) : (
						<p className="text-center text-gray-500 col-span-3">등록된 문제가 없습니다.</p>
					)}
				</motion.div>
			</motion.div>
		</>
	)
}
