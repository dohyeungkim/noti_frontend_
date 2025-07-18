"use client"

import ExamCard from "@/components/ExamPage/ExamCard"

interface ExamGalleryProps {
	workbooks: {
		workbook_id: number
		group_id: number
		workbook_name: string
		problem_cnt: number
		description: string
		creation_date: string
		is_test_mode: number
		workbook_total_points: number
	}[]
	handleEnterExam: (examId: string) => void
	isGroupOwner: boolean
}

export default function ExamGallery({ workbooks, handleEnterExam, isGroupOwner }: ExamGalleryProps) {
	if (!workbooks || workbooks.length === 0) {
		return <p className="text-center text-gray-500 text-lg">등록된 문제지가 없습니다.</p>
	}

	return (
		<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 m-2 minW">
			{workbooks.map((workbook) => (
				<ExamCard
					key={workbook.workbook_id}
					workbook={workbook}
					isGroupOwner={isGroupOwner}
					onClick={() => handleEnterExam(String(workbook.workbook_id))}
				/>
			))}
		</section>
	)
}

// "use client"

// import ExamCard from "@/components/ExamPage/ExamCard"
// import { ExamCardData } from "@/data/examCardDummy"
// import { gradingDummy } from "@/data/gradingDummy" // ← 여기에 더미 채점 데이터 import

// interface ExamGalleryProps {
// 	examData: ExamCardData[]
// 	handleEnterExam: (examId: string) => void
// 	isGroupOwner?: boolean
// }

// export default function ExamGallery({ examData, handleEnterExam, isGroupOwner = false }: ExamGalleryProps) {
// 	if (!examData || examData.length === 0) {
// 		return <p className="text-center text-gray-500 text-lg">등록된 문제지가 없습니다.</p>
// 	}

// 	// 개발 중에는 첫 번째 학생의 채점 정보만 사용
// 	const dummyPerformance = gradingDummy[0]

// 	return (
// 		<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 m-2 minW">
// 			{examData.map((data) => (
// 				<ExamCard
// 					key={data.workbook.workbook_id}
// 					data={data}
// 					onClick={() => handleEnterExam(data.exam?.examId || String(data.workbook.workbook_id))}
// 					isGroupOwner={isGroupOwner}
// 					// 그룹장이 아니면 더미 채점 정보 넘겨주기
// 					studentPerformance={!isGroupOwner ? dummyPerformance : undefined}
// 				/>
// 			))}
// 		</section>
// 	)
// }
