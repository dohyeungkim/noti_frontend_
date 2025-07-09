// app/mygroups/[groupId]/exams/[examId]/grading/[studentId]/page.tsx
import React from "react"
// 경로는 본인의 프로젝트 구조에 맞게 조정하세요.
// tsconfig.json의 `baseUrl`이 설정돼 있다면 '@/components/…' 같은 절대경로도 가능합니다.
import StudentGradingPage from "@/components/GradingPage/StudentGradingPage"

interface PageProps {
	params: {
		groupId: string
		examId: string
		studentId: string
	}
}

export default function Page({ params }: PageProps) {
	const { groupId, examId, studentId } = params
	return <StudentGradingPage groupId={groupId} examId={examId} studentId={studentId} />
}
