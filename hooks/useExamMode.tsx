"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { testExams } from "../data/testmode" // 시험 데이터 가져오기

export function useExamMode() {
	const [isExamMode, setIsExamMode] = useState(false)
	const [examId, setExamId] = useState<string | null>(null)
	const [groupId, setGroupId] = useState<string | null>(null)
	const pathname = usePathname()

	useEffect(() => {
		const now = new Date()
		console.log("현재 pathname:", pathname)

		// ✅ 문제지 ID 및 그룹 ID 추출
		const pathSegments = pathname.split("/").filter(Boolean)
		let extractedExamId: string | null = null
		let extractedGroupId: string | null = null

		const examsIndex = pathSegments.findIndex((segment) => segment === "exams")
		if (examsIndex !== -1 && examsIndex + 1 < pathSegments.length) {
			extractedGroupId = pathSegments[examsIndex - 1]
			extractedExamId = pathSegments[examsIndex + 1]
		}

		console.log("추출된 groupId:", extractedGroupId)
		console.log("추출된 examId:", extractedExamId)

		const isExamActive = testExams.some((exam) => {
			const start = new Date(exam.startTime)
			const end = new Date(exam.endTime)
			const isValid = exam.examId === extractedExamId && now >= start && now <= end

			console.log(`시험 ID: ${exam.examId}, 시작: ${start}, 종료: ${end}, 현재: ${now}, 유효함: ${isValid}`)
			return isValid
		})

		console.log("시험 모드 활성화 여부:", isExamActive)

		// ✅ 불필요한 상태 변경 방지 (이전 값과 다를 때만 업데이트)
		setIsExamMode((prev) => (prev !== isExamActive ? isExamActive : prev))
		setExamId((prev) => (prev !== extractedExamId ? extractedExamId : prev))
		setGroupId((prev) => (prev !== extractedGroupId ? extractedGroupId : prev))
	}, [pathname])

	return { isExamMode, examId, groupId }
}
