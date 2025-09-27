"use client"

import SearchBar from "@/components/ui/SearchBar"
import SortButton from "@/components/ui/SortButton"
import ViewToggle from "@/components/ui/ViewToggle"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { solve_api } from "@/lib/api"
import { formatTimestamp } from "../util/dageUtils"

interface ProblemSolve {
  id: number
  solve_id: number
  problem_id: number
  problem_name: string
  user_id: string
  passed: boolean
  code_language: string
  code_len: number
  timestamp: string
  group_id: number
  group_name: string
  workbook_id: number
  workbook_name: string
}

// framer-motion 멤버 표현식을 식별자로 치환 (SWC 파서 회피)
const MotionDiv = motion.div
const MotionH2 = motion.h2
const MotionHr = motion.hr

export default function MySolved() {
  const [search, setSearch] = useState<string>("")
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery")
  const [sortOrder, setSortOrder] = useState("제목순")
  const [correctProblems, setCorrectProblems] = useState<ProblemSolve[]>([])
  const [filteredProblems, setFilteredProblems] = useState<ProblemSolve[]>([])

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

  // 동일 (group_id, workbook_id, problem_id) 묶고 하나라도 통과면 passed=true, 최신 timestamp로 갱신
  const processSolves = (solveData: ProblemSolve[]) => {
    const grouped: Record<string, ProblemSolve> = {}
    for (const s of solveData) {
      const key = `${s.group_id}-${s.workbook_id}-${s.problem_id}`
      if (!grouped[key]) grouped[key] = { ...s }
      if (s.passed) grouped[key].passed = true
      if (new Date(s.timestamp).getTime() > new Date(grouped[key].timestamp).getTime()) {
        grouped[key].timestamp = s.timestamp
      }
    }
    return Object.values(grouped)
  }

  const fetchSolves = useCallback(async () => {
    try {
      const data: ProblemSolve[] = await solve_api.solve_get_me()
      const processed = processSolves(data)
      const passedOnly = processed.filter((p) => p.passed === true)
      setCorrectProblems(passedOnly)
      setFilteredProblems(passedOnly)
    } catch (err) {
      console.error("제출 데이터를 가져오는 데 실패했습니다.", err)
    }
  }, [])

  useEffect(() => {
    fetchSolves()
  }, [fetchSolves])

  // 검색
  useEffect(() => {
    const filtered = correctProblems.filter((p) =>
      p.problem_name.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredProblems(filtered)
  }, [search, correctProblems])

  // 정렬
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (sortOrder === "제목순") {
      return a.problem_name.localeCompare(b.problem_name)
    }
    if (sortOrder === "날짜순") {
      return new Date(b.timestamp ?? "1970-01-01").getTime() - new Date(a.timestamp ?? "1970-01-01").getTime()
    }
    return 0
  })

  // 전역 유일 key
  const rowKey = (p: ProblemSolve) => `${p.group_id}-${p.workbook_id}-${p.problem_id}`

  return (
    <MotionDiv className="scale-90 origin-top-left w-[111%]">
      {/* 검색/뷰/정렬 */}
      <MotionDiv
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SearchBar searchQuery={search} setSearchQuery={setSearch} />
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortButton
          sortOptions={["제목순", "날짜순"]}
          onSortChange={(s) => setSortOrder(s)}
        />
      </MotionDiv>

      <MotionH2
        className="text-2xl font-bold mb-4 m-2 pt-3.5"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        ✅ 맞은 문제
      </MotionH2>

      <MotionHr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />

      {correctProblems.length === 0 ? (
        <p className="text-center text-gray-500 mt-7">아직 푼 문제가 없습니다.</p>
      ) : sortedProblems.length === 0 ? (
        <p className="text-center text-gray-500 mt-7">검색 결과가 없습니다.</p>
      ) : (
        <MotionDiv
          key={`correct-${viewMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === "gallery" ? (
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
                {sortedProblems.map((p) => (
                  <div
                    key={rowKey(p)} // ✅ 복합키
                    className="group relative bg-white border border-gray-200 rounded-xl p-5 cursor-pointer 
                      shadow-md transition-all duration-300 ease-in-out 
                      hover:-translate-y-1 hover:shadow-xl transform-gpu 
                      flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-xl font-semibold mb-2">📄 {truncateText(p.problem_name, 15)}</h2>
                    </div>

                    <p className="text-gray-500 text-sm">
                      {truncateText(p.group_name, 10)} &gt; {truncateText(p.workbook_name, 10)}
                    </p>

                    <div className="flex justify-between items-center text-sm mb-3">
                      <p className="font-medium text-mygreen">맞았습니다!</p>
                      <p className="text-gray-400">{formatTimestamp(p.timestamp)}</p>
                    </div>

                    <Link href={`/mygroups/${p.group_id}/exams/${p.workbook_id}/problems/${p.problem_id}/result`}>
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
                {sortedProblems.map((p) => (
                  <tr key={rowKey(p)} className="hover:bg-gray-100">
                    <td className="px-4.5 py-3.5 text-center">{truncateText(p.problem_name, 20)}</td>
                    <td className="px-4.5 py-3.5 text-center">{truncateText(p.group_name, 15)}</td>
                    <td className="px-4.5 py-3.5 text-center">{truncateText(p.workbook_name, 15)}</td>
                    <td className="px-4.5 py-3.5 text-center">{formatTimestamp(p.timestamp)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/mygroups/${p.group_id}/exams/${p.workbook_id}/problems/${p.problem_id}/result`}>
                        <button className="w-full py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 bg-mygreen text-white hover:bg-opacity-80">
                          피드백 보기
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </MotionDiv>
      )}
    </MotionDiv>
  )
}
