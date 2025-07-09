// app/mygroups/[groupId]/exams/[examId]/page.tsx
import React from "react"
// import 경로는 프로젝트 설정에 맞게 수정하세요.
import GradingListPage from "@/components/GradingPage/GradingListPage"

interface PageProps {
	params: {
		groupId: string
		examId: string
	}
}

export default function Page({ params }: PageProps) {
	const { groupId, examId } = params

	return <GradingListPage groupId={groupId} examId={examId} />
}
