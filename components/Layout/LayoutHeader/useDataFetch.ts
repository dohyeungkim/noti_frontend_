// MySol, 페이지 상단 헤더들에 띄우는 정보들 가져오려고 쓰이는 훅
// 현재 페이지 정보(현재 어디 그룹이나 어디 문제지 페이지에 머물고 있는지)가 바뀌면 api 호출해서

import { useState, useEffect } from "react"
import { group_api, problem_api, ProblemDetail, workbook_api } from "@/lib/api"

export function useDataFetch(groupId: unknown, examId: unknown, problemId: unknown) {
	const [group, setGroup] = useState(null)
	const [exam, setExam] = useState(null) // 문제지
	const [problem, setProblem] = useState<ProblemDetail | null>(null)
	const [loading, setLoading] = useState({
		group: false,
		exam: false,
		problem: false,
	})
	const [error, setError] = useState({
		group: null,
		exam: null,
		problem: null,
	})

	useEffect(() => {
		async function fetchGroup() {
			if (!groupId) return
			setLoading((prev) => ({ ...prev, group: true }))
			try {
				const data = await group_api.group_get_by_id(Number(groupId))
				setGroup(data)
				setError((prev) => ({ ...prev, group: null }))
			} catch (error) {
				console.error("!!!!!!!!그룹 정보 가져오기 실패:", error)
			}
		}
		fetchGroup()
	}, [groupId])

	useEffect(() => {
		async function fetchExam() {
			if (!examId) return
			try {
				const data = await workbook_api.workbook_get_by_id(Number(examId))
				setExam(data)
			} catch (error) {
				console.error("!!!!!!1시험 정보 가져오기 실패:", error)
			}
		}
		fetchExam()
	}, [examId])

	useEffect(() => {
		async function fetchProblem() {
			if (!problemId) return
			try {
				const data = await problem_api.problem_get_by_id(Number(problemId))
				setProblem(data)
			} catch (error) {
				console.error("!!!!!!!!1문제 정보 가져오기 실패:", error)
			}
		}
		fetchProblem()
	}, [problemId])

	return { group, exam, problem, loading, error }
}
