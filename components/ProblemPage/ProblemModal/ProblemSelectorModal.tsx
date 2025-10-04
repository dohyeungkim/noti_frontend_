// 문제지 내에서 내가 등록한 문제 리스트들로 문제 선택하는 모달창

import { useRouter } from "next/navigation"
import { problem_api, problem_ref_api } from "@/lib/api"
import type { ProblemDetail, ProblemRef } from "@/lib/api"
import { Dispatch, SetStateAction, useEffect, useState, useCallback, useRef, useMemo } from "react"
import { PoundSterling, X, Eye } from "lucide-react"
import SearchBar from "components/ui/SearchBar"
import ProblemPreviewModal from "./ProblemPreviewModal"

export type Problem = ProblemRef

interface ProblemSelectorProps {
	groupId: number
	workbookId: number
	isModalOpen: boolean
	setIsModalOpen: (open: boolean) => void

	// ProblemStructure 에서 받는 문제 참조 리스트
	selectedProblems: ProblemRef[]
	setSelectedProblems: Dispatch<SetStateAction<ProblemRef[]>>

	refresh: boolean
	setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ProblemSelector({
	groupId,
	workbookId,

	isModalOpen,
	setIsModalOpen,

	selectedProblems,
	setSelectedProblems,
	refresh,
	setRefresh,
}: ProblemSelectorProps) {
	const [problems, setProblems] = useState<ProblemDetail[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isAlreadySelected, setIsAlreadySelected] = useState<ProblemDetail[]>([])
	const [newlyAddedProblemIds, setNewlyAddedProblemIds] = useState<Set<number>>(new Set()) // Track newly added problems by ID
	const [tempSelectedIds, setTempSelectedIds] = useState<Set<number>>(new Set())
	const isFetched = useRef(false)
	const [points, setPoints] = useState<number>(10)

	// 미리보기 모달 상태
	const [previewProblem, setPreviewProblem] = useState<ProblemDetail | null>(null)
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)

	// tempSelectedIds 는 '모달이 열려있는 동안'만 쓸 로컬셋

	const handleSelect = (problem: ProblemDetail) => {
		if (isAlreadySelected.some((p) => p.problem_id === problem.problem_id)) return // 이미 부모에 등록된 건 토글 금지

		setTempSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(problem.problem_id)) next.delete(problem.problem_id)
			else next.add(problem.problem_id)
			return next
		})
	}

	// 미리보기 핸들러
	const handlePreview = (problem: ProblemDetail, e: React.MouseEvent) => {
		e.stopPropagation()
		setPreviewProblem(problem)
		setIsPreviewOpen(true)
	}

	const handleClosePreview = () => {
		setIsPreviewOpen(false)
		setPreviewProblem(null)
	}

	// 문제 가져오기 함수 (useCallback 적용)
	// 문제 리스트만 가져오는 함수
	const fetchProblem = useCallback(async () => {
		try {
			console.log("📢 문제 가져오기 요청 시작!")
			const res = await problem_api.problem_get()
			if (Array.isArray(res)) {
				setProblems(res)
				// 이미 부모(문제지)에 붙어있는 것들만 골라두기
				const already = res.filter((p) => selectedProblems.some((sp) => sp.problem_id === p.problem_id))
				setIsAlreadySelected(already)
			}
		} catch (error) {
			console.error("❌ 문제를 가져오는 데 실패했습니다.", error)
			setProblems([])
		}
	}, [selectedProblems])

	// 모달이 열릴 때 한 번만 fetchProblem 실행
	useEffect(() => {
		if (isModalOpen && !isFetched.current) {
			fetchProblem()
			isFetched.current = true
		}
	}, [isModalOpen, fetchProblem])

	useEffect(() => {
		if (isModalOpen) {
			// 부모에서 이미 선택된 문제 ID 들을 tempSelectedIds 에 초기화
			setTempSelectedIds(new Set(selectedProblems.map((p) => p.problem_id)))
			// 클릭 금지 처리할 목록도 동기화
			setIsAlreadySelected(problems.filter((p) => selectedProblems.some((sp) => sp.problem_id === p.problem_id)))
			// 문제 목록은 한 번만 가져오기 위해 플래그 초기화
			isFetched.current = false
		}
	}, [isModalOpen, selectedProblems])

	// 문제 추가하기 버튼
	const handleAddProblemButton = async () => {
		// console.log("handleAddProblemButton 호출됨", new Date().toISOString())
		if (isSubmitting) return
		setIsSubmitting(true)

		try {
			// 모달에서 새로 선택된 ID 중, 이미 추가된 건 제외
			// const uniqueProblemIds = Array.from(new Set(selectedProblems.map((p) => p.problem_id)))
			const idsToAdd = Array.from(tempSelectedIds).filter((id) => !isAlreadySelected.some((p) => p.problem_id === id))

			await problem_ref_api.problem_ref_create(groupId, workbookId, idsToAdd, 10)

			const newlyAdded = problems.filter((p) => idsToAdd.includes(p.problem_id))

			// 2) ProblemDetail → ProblemRef 로 매핑
			const newRefs: ProblemRef[] = newlyAdded.map((p) => ({
				problem_id: p.problem_id,
				title: p.title,
				description: p.description,
				// 여기서 횟수는 필요 없음, 그래서 일단 걍 0으로 전달.
				attempt_count: 0,
				pass_count: 0,
				points, // 모달의 points 상태
			}))

			// 3) 중복 없이 부모 상태에 붙여 주기
			setSelectedProblems((prev) => {
				const existing = new Set(prev.map((x) => x.problem_id))
				// const filtered = newRefs.filter((r) => !existing.has(r.problem_id))
				const toAdd = newRefs.filter((r) => !existing.has(r.problem_id))
				return [...prev, ...newRefs.filter((r) => !existing.has(r.problem_id))]
			})

			setRefresh((prev) => !prev)
			setIsModalOpen(false)
		} catch (error) {
			console.error("문제지 - 문제 링크에 실패했습니다.", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const modalSelected = problems.filter((p) => tempSelectedIds.has(p.problem_id))

	// 👻 v0 - 문제 이름 검색 기능
	const [searchQuery, setSearchQuery] = useState("")
	const [filteredProblems, setFilteredProblems] = useState<ProblemDetail[]>([])

	// 1) problems 가 바뀔 때마다, filteredProblems 를 초기화
	useEffect(() => {
		setFilteredProblems(problems)
	}, [problems])

	// 2) searchQuery 나 problems 가 바뀔 때마다 필터링
	useEffect(() => {
		const q = searchQuery.trim().toLowerCase()
		if (q === "") {
			setFilteredProblems(problems)
		} else {
			setFilteredProblems(problems.filter((p) => p.title.toLowerCase().includes(q)))
		}
	}, [searchQuery, problems])

	// useEffect(() => {
	// 	const filtered = problems.filter((problem) => problem.title.toLowerCase().includes(searchQuery.toLowerCase()))
	// 	setFilteredProblems(filtered)
	// }, [searchQuery, problems, refresh])

	return (
		<>
			{isModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl relative flex flex-col">
						<button
							className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 z-10"
							onClick={() => setIsModalOpen(false)}
						>
							<X className="w-6 h-6" />
						</button>

						<div className="p-8 flex flex-col h-full overflow-hidden">
							<div className="mb-6">
								<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
							</div>
							<div className="flex gap-x-6 flex-1 min-h-0">
								{/* 🔹 문제 리스트 */}
								<div className="flex-1 flex flex-col min-w-0">
									<h2 className="text-2xl font-bold mb-4">문제 목록</h2>
									<ul className="border border-gray-200 p-5 rounded-lg shadow-sm bg-white flex-1 overflow-y-auto">
										{filteredProblems.map((problem) => {
											const isDisabled = isAlreadySelected.some((p) => p.problem_id === problem.problem_id)
											return (
												<li
													key={`list-${problem.problem_id}`}
													onClick={() => !isDisabled && handleSelect(problem)}
													className={`cursor-pointer rounded-md p-3 mb-2 border transition flex items-center justify-between ${
														isDisabled
															? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
															: tempSelectedIds.has(problem.problem_id)
															? "bg-mygreen text-white border-mygreen"
															: "bg-gray-50 hover:bg-gray-100 border-gray-200"
													}`}
												>
													<span className="truncate flex-1">
														📌 {problem.title}
													</span>
													<button
														onClick={(e) => handlePreview(problem, e)}
														className={`ml-2 p-1.5 rounded hover:bg-opacity-80 transition flex-shrink-0 ${
															isDisabled 
																? "opacity-50" 
																: tempSelectedIds.has(problem.problem_id)
																? "hover:bg-green-600"
																: "hover:bg-gray-300"
														}`}
														title="미리보기"
													>
														<Eye className="w-4 h-4" />
													</button>
												</li>
											)
										})}
									</ul>
								</div>

								{/* 🔹 선택한 문제 리스트 */}
								<div className="flex-1 flex flex-col min-w-0">
									<h2 className="text-2xl font-bold mb-4">선택한 문제</h2>
									<ul className="border border-gray-200 p-5 rounded-lg shadow-sm bg-white flex-1 overflow-y-auto">
										{modalSelected.length > 0 ? (
											modalSelected.map((p) => {
												return (
													<li
														key={`selected-${p.problem_id}`}
														onClick={() => handleSelect(p)}
														className="p-3 mb-2 border border-gray-200 rounded-md cursor-pointer hover:bg-red-100 hover:border-red-300 transition flex items-center justify-between"
													>
														<span className="truncate flex-1">
															📌 {p.title}
														</span>
														<button
															onClick={(e) => handlePreview(p, e)}
															className="ml-2 p-1.5 rounded hover:bg-red-200 transition flex-shrink-0"
															title="미리보기"
														>
															<Eye className="w-4 h-4" />
														</button>
													</li>
												)
											})
										) : (
											<li className="text-gray-400 text-center py-8">선택한 문제가 없습니다.</li>
										)}
									</ul>
								</div>
							</div>

							{/* 🔹 Submit 버튼 */}
							<div className="mt-6 flex justify-end pt-4 border-t border-gray-200">
								<button
									onClick={handleAddProblemButton}
									disabled={isSubmitting}
									className="bg-mygreen text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50"
								>
									문제 추가하기
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 미리보기 모달 */}
			<ProblemPreviewModal 
				problem={previewProblem} 
				isOpen={isPreviewOpen} 
				onClose={handleClosePreview} 
			/>
		</>
	)
}