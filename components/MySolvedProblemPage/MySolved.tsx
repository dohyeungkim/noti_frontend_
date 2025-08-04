"use client"

import SearchBar from "@/components/ui/SearchBar"
import SortButton from "@/components/ui/SortButton"
import ViewToggle from "@/components/ui/ViewToggle"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { solve_api } from "@/lib/api"
import { formatTimestamp } from "../util/dageUtils"

// ✅ 문제 풀이 데이터 타입 정의
// interface ProblemSolve {
// 	group_id: number
// 	problem_id: number
// 	workbook_id: number
// 	workbook_name: string
// 	group_name: string
// 	problem_name: string
// 	passed: boolean
// 	solve_id: number
// 	timestamp?: string
// }

interface ProblemSolve {
	id: number // 고유 DB ID
	solve_id: number // 제출 ID
	problem_id: number // 문제 ID
	problem_name: string // 문제 제목
	user_id: string // 제출자 ID
	passed: boolean // 통과 여부

	// 코딩|디버깅 문제일 때만 이 필드 사용. 나머지 유형은 따로 또 만들어야됨.
	code_language: string // 언어 (python, cpp, etc)
	code_len: number // 코드 길이 (문자수)
	timestamp: string // 제출 시간 (ISO8601)
	group_id: number // 그룹 ID
	group_name: string
	workbook_id: number // 문제집 ID
	workbook_name: string
}

export default function MySolved() {
	const [search, setSearch] = useState<string>("")
	const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery")
	const [sortOrder, setSortOrder] = useState("제목순")
	const [correctProblems, setCorrectProblems] = useState<ProblemSolve[]>([])
	const [filteredProblems, setFilteredProblems] = useState<ProblemSolve[]>([])

	// ✅ 문자열 길이 제한 함수 (너무 길면 `...` 표시)
	const truncateText = (text: string, maxLength: number) =>
		text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

	// ✅ 문제 데이터 가공 함수
	const processSolves = (solveData: ProblemSolve[]) => {
		const groupedSolves: Record<string, ProblemSolve> = {}

		solveData.forEach((solve) => {
			const { group_id, problem_id, workbook_id, passed } = solve
			const key = `${group_id}-${problem_id}-${workbook_id}`

			if (!groupedSolves[key]) {
				groupedSolves[key] = { ...solve }
			}

			if (passed) {
				groupedSolves[key].passed = true
			}
		})

		return Object.values(groupedSolves)
	}

	// ✅ solve 데이터 가져오는 함수
	const fetchSolves = useCallback(async () => {
		try {
			const data: ProblemSolve[] = await solve_api.solve_get_me()
			const processedData = processSolves(data)

			setCorrectProblems(processedData.filter((p) => p.passed === true))
			setFilteredProblems(processedData.filter((p) => p.passed === true))
		} catch (error) {
			console.error(`제출 데이터를 가져오는 데 실패했습니다. ${error}`)
		}
	}, [])

	useEffect(() => {
		fetchSolves()
	}, [fetchSolves])

	// ✅ 검색 기능
	useEffect(() => {
		const filtered = correctProblems.filter((problem) =>
			problem.problem_name.toLowerCase().includes(search.toLowerCase())
		)
		setFilteredProblems(filtered)
	}, [search, correctProblems])

	// ✅ 정렬 기능
	const sortedProblems = [...filteredProblems].sort((a, b) => {
		if (sortOrder === "제목순") {
			return a.problem_name.localeCompare(b.problem_name)
		} else if (sortOrder === "날짜순") {
			return new Date(b.timestamp ?? "1970-01-01").getTime() - new Date(a.timestamp ?? "1970-01-01").getTime()
		}
		return 0
	})

	return (
		<motion.div className="scale-90 origin-top-left w-[111%]">
			{/* 🔍 검색, 보기 방식 변경, 정렬 버튼 */}
			<motion.div
				className="flex items-center gap-4 mb-4 w-full"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
			>
				<SearchBar searchQuery={search} setSearchQuery={setSearch} />
				<ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
				<SortButton sortOptions={["제목순", "날짜순"]} onSortChange={(selectedSort) => setSortOrder(selectedSort)} />
			</motion.div>
			<motion.h2
				className="text-2xl font-bold mb-4 m-2 pt-3.5"
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.3, delay: 0.3 }}
			>
				✅ 맞은 문제
			</motion.h2>

			<motion.hr
				className="border-b-1 border-gray-300 my-4 m-2"
				initial={{ opacity: 0, scaleX: 0 }}
				animate={{ opacity: 1, scaleX: 1 }}
				transition={{ duration: 0.3, delay: 0.3 }}
			/>
			{/* ✅ 맞은 문제 리스트 */}
			{correctProblems.length === 0 ? (
				<p className="text-center text-gray-500 mt-7">아직 푼 문제가 없습니다.</p>
			) : sortedProblems.length === 0 ? (
				<p className="text-center text-gray-500 mt-7">검색 결과가 없습니다.</p>
			) : (
				<motion.div
					key={`correct-${viewMode}`}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					{viewMode === "gallery" ? (
						<div className="w-full">
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
								{sortedProblems.map((problem) => (
									<div
										key={problem.problem_id}
										className="group relative bg-white border border-gray-200 rounded-xl p-5 cursor-pointer 
              shadow-md transition-all duration-300 ease-in-out 
              hover:-translate-y-1 hover:shadow-xl transform-gpu 
              flex flex-col justify-between"
									>
										<div>
											<h2 className="text-xl font-semibold mb-2">📄 {truncateText(problem.problem_name, 15)}</h2>
										</div>

										<p className="text-gray-500 text-sm">
											{truncateText(problem.group_name, 10)} &gt; {truncateText(problem.workbook_name, 10)}
										</p>

										<div className="flex justify-between items-center text-sm mb-3">
											<p className="font-medium text-mygreen">맞았습니다!</p>
											<p className="text-gray-400">{formatTimestamp(problem.timestamp)}</p>
										</div>

										<Link
											href={`mygroups/${problem.group_id}/exams/${problem.workbook_id}/problems/${problem.problem_id}/result`}
										>
											<button className="w-full py-2 text-white rounded-xl text-lg font-semibold transition-all active:scale-95 bg-mygreen hover:bg-opacity-80">
												피드백 보기
											</button>
										</Link>
									</div>
								))}
							</div>
						</div>
					) : (
						<table className="w-full border-collapse bg-white shadow-md rounded-xl overflow-hidden">
							<thead className="bg-gray-200">
								<tr className="border-b-4 border-gray-200 text-gray-800">
									<th className="px-4.5 py-3.5 text-center text-base font-semibold">문제명</th>
									<th className="px-4.5 py-3.5 text-center text-base font-semibold">그룹명</th>
									<th className="px-4.5 py-3.5 text-center text-base font-semibold">문제집 이름</th>
									<th className="px-4.5 py-3.5 text-center text-base font-semibold">풀이 날짜</th>
									<th className="px-4.5 py-3.5 text-center text-base font-semibold">행동</th>
								</tr>
							</thead>
							<tbody>
								{sortedProblems.map((problem) => (
									<tr key={problem.solve_id} className="hover:bg-gray-100">
										<td className="px-4.5 py-3.5 text-center">{truncateText(problem.problem_name, 20)}</td>
										<td className="px-4.5 py-3.5 text-center">{truncateText(problem.group_name, 15)}</td>
										<td className="px-4.5 py-3.5 text-center">{truncateText(problem.workbook_name, 15)}</td>
										<td className="px-4.5 py-3.5 text-center">{formatTimestamp(problem.timestamp)}</td>
										<td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-medium">
											<button className="w-full py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 bg-mygreen text-white hover:bg-opacity-80">
												피드백 보기
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</motion.div>
			)}
		</motion.div>
	)
}
