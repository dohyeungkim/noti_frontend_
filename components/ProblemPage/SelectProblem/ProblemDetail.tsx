"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { problem_api } from "@/lib/api"

export default function ProblemDetail() {
	const router = useRouter()
	const params = useParams()

	const groupId = params?.groupId as string | undefined
	const examId = params?.examId as string | undefined
	const problemId = params?.problemId as string | undefined

	const [problem, setProblem] = useState<{
		title: string
		description: string // ✅ HTML 형식으로 저장된 설명
		input: string
		output: string
		testMode?: boolean
	} | null>(null)

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchProblem = useCallback(async () => {
		try {
			const res = await problem_api.problem_get_by_id_group(
				Number(params.groupId),
				Number(params.examId),
				Number(params.problemId)
			)
			setLoading(true)
			setError(null)
			setProblem(res)
		} catch (error) {
			setError(`알 수 없는 오류 발생 ${error}`)
		} finally {
			setLoading(false)
		}
	}, [params.groupId, params.examId, params.problemId])

	useEffect(() => {
		fetchProblem()
	}, [fetchProblem]) // problemId 변경 시 다시 실행

	if (loading) {
		return (
			<div className="p-8 text-center">
				<h1 className="text-2xl font-bold">로딩 중...</h1>
			</div>
		)
	}

	if (error || !problem) {
		return (
			<div className="p-8 text-center">
				<h1 className="text-2xl font-bold">문제를 찾을 수 없습니다</h1>
				<p className="text-gray-600">{error || "잘못된 경로로 접근했거나 문제가 삭제되었습니다."}</p>
			</div>
		)
	}

	const handleNavigate = () => {
		router.push(`/mygroups/${groupId}/exams/${examId}/problems/${problemId}/write`)
	}

	return (
		<>
			<motion.div
				className="flex items-center gap-2 justify-end"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				<motion.button
					onClick={handleNavigate}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="flex items-center bg-gray-800 text-white px-6 sm:px-8 md:px-10 lg:px-12 py-1.5 rounded-xl m-2 text-md cursor-pointer
    hover:bg-gray-500 transition-all duration-200 ease-in-out active:scale-95"
				>
					문제 풀기
				</motion.button>
			</motion.div>

			{/* ✅ 문제 설명 (높이 `%` 적용) */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="mt-6 border p-4 sm:p-6 md:px-16 lg:px-20 rounded-lg bg-white shadow-md w-full max-w-[100%] mx-auto 
             h-[55vh] min-h-[50vh] overflow-hidden"
			>
				{/* ✅ 제목과 구분선을 고정 */}
				{/* ✅ 제목과 구분선을 고정 */}
				<div className="sticky top-0 bg-white z-10 pb-4">
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
						{problem.title.length > 35 ? `${problem.title.slice(0, 35)}...` : problem.title}
					</h1>
					<hr className="border-t-2 border-gray-400" />
				</div>

				{/* ✅ 본문 내용 (스크롤 가능) */}
				<div className="overflow-y-auto h-full p-2 pr-2">
					<div className="editor-content" dangerouslySetInnerHTML={{ __html: problem.description }} />
				</div>

				{/* ✅ 테이블 테두리 강제 적용 */}
				<style>
					{`
          .editor-content h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
          .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }

         /* ✅ 전체 테이블 스타일 */
.editor-content table {
  width: 100%;
  border-collapse: collapse !important; /* ✅ 테두리 겹침 방지 */
  border-spacing: 0 !important; /* ✅ 셀 간격 제거 */
  margin-top: 10px !important;
  border: 2px solid #d4d4d4 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  background-color: #f9f9f9 !important;
}

/* ✅ 헤더 스타일 */
.editor-content th {
  background-color: #f1f1f1 !important;
  font-weight: 600 !important;
  text-align: center !important;
  color: #333 !important;
  padding: 14px !important;
  border-bottom: 1.5px solid #d4d4d4 !important;
  border-right: 1px solid #d4d4d4 !important; /* ✅ 오른쪽 테두리 조정 */
}

/* ✅ 내부 셀 스타일 */
.editor-content td {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  padding: 12px !important;
  text-align: left !important;
  font-size: 1rem !important;
  color: #444 !important;
  transition: background 0.2s ease-in-out !important;
  border-radius: 0 !important;
}

/* ✅ 강조된 셀 (제목 스타일) */
.editor-content td[data-header="true"] {
  background-color: #e7e7e7 !important;
  font-weight: bold !important;
  text-align: center !important;
  color: #222 !important;
}

/* ✅ 마우스 오버 효과 */
.editor-content td:hover {
  background-color: #f5f5f5 !important;
}

/* ✅ 테이블 전체 둥글게 조정 */
.editor-content tr:first-child th:first-child {
  border-top-left-radius: 12px !important;
}
.editor-content tr:first-child th:last-child {
  border-top-right-radius: 12px !important;
}
.editor-content tr:last-child td:first-child {
  border-bottom-left-radius: 12px !important;
}
.editor-content tr:last-child td:last-child {
  border-bottom-right-radius: 12px !important;
}

        
        `}
				</style>
			</motion.div>
		</>
	)
}
