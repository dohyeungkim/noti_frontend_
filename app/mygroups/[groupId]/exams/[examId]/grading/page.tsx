"use client"

import GradingPage from "@/components/GradingPage/GradingPage"

export default function GradingRoute({ params }: { params: { groupId: string; examId: string } }) {
	return <GradingPage params={params} />
}
