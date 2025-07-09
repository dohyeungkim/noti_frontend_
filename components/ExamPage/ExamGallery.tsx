"use client"
import ExamCard from "@/components/ExamPage/ExamCard"
import { ExamCardData } from "@/data/examCardDummy"

interface ExamGalleryProps {
	examData: ExamCardData[]
	handleEnterExam: (examId: string) => void
	isGroupOwner?: boolean
}

export default function ExamGallery({ examData, handleEnterExam, isGroupOwner = false }: ExamGalleryProps) {
	if (!examData || examData.length === 0) {
		return <p className="text-center text-gray-500 text-lg">등록된 문제지가 없습니다.</p>
	}

	return (
		<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 m-2 minW">
			{examData.map((data) => (
				<ExamCard
					key={data.workbook.workbook_id}
					data={data}
					onClick={() => handleEnterExam(data.exam?.examId || String(data.workbook.workbook_id))}
					isGroupOwner={isGroupOwner}
				/>
			))}
		</section>
	)
}

// "use client"
// import ExamCard from "@/components/ExamPage/ExamCard"

// interface ExamGalleryProps {
// 	workbooks: {
// 		workbook_id: number
// 		group_id: number
// 		workbook_name: string
// 		problem_cnt: number
// 		description: string
// 		creation_date: string
// 	}[]

// 	handleEnterExam: (examId: string) => void
// }

// export default function ExamGallery({ workbooks, handleEnterExam }: ExamGalleryProps) {
// 	if (!workbooks || workbooks.length === 0) {
// 		return <p className="text-center text-gray-500 text-lg">등록된 문제지가 없습니다.</p>
// 	}

// 	return (
// 		<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 m-2 minW">
// 			{workbooks.map((workbook) => (
// 				<ExamCard
// 					key={workbook.workbook_id}
// 					workbook={workbook}
// 					onClick={() => handleEnterExam(String(workbook.workbook_id))}
// 				/>
// 			))}
// 		</section>
// 	)
// }
