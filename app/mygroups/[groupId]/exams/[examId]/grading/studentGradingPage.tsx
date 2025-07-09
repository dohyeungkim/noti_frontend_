"use client"

import StudentGradingPage from "@/components/GradingPage/StudentGradingPage"

export default function StudentGradingRoute({
	params,
}: {
	params: {
		groupId: string
		examId: string
		studentId: string
	}
}) {
	return <StudentGradingPage params={params} />
}
