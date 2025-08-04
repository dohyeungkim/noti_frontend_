// 문제지 내에서 내가 등록한 문제 리스트들로 문제 선택하는 모달창

import { useRouter } from "next/navigation"
import { problem_api, problem_ref_api } from "@/lib/api"
import type { ProblemDetail, ProblemRef } from "@/lib/api"
import { Dispatch, SetStateAction, useEffect, useState, useCallback, useRef } from "react"
import { PoundSterling, X } from "lucide-react"

// export interface Problem {
// 	problem_id: number
// 	title: string
// 	description: string
// 	points: number
// 	// attempt_count: number
// 	// pass_count: number
// 	// is_like: boolean
// }

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
				return [...prev, ...toAdd]
			})

			// setSelectedProblems((prev) => {
			// 	const existingIds = new Set(prev.map((p) => p.problem_id))
			// 	const filteredNew = newlyAdded.filter((p) => !existingIds.has(p.problem_id))
			// 	return [...prev, ...filteredNew]
			// })

			setRefresh((prev) => !prev)
			refresh = refresh
			setIsModalOpen(false)
		} catch (error) {
			console.error("문제지 - 문제 링크에 실패했습니다.", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const modalSelected = problems.filter((p) => tempSelectedIds.has(p.problem_id))

	// const router = useRouter()
	// const MakeProblemClick = () => {
	// 	router.push("/registered-problems/create")
	// }

	return (
		isModalOpen && (
			<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
				<div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg relative">
					<button
						className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
						onClick={() => setIsModalOpen(false)}
					>
						<X className="w-6 h-6" />
					</button>

					<div className="p-6">
						<div className="flex gap-x-6">
							{/* 🔹 문제 리스트 */}
							<div className="flex-1">
								<h2 className="text-xl font-bold mb-2">문제 목록</h2>
								<ul className="border p-4 rounded-md shadow-md bg-white h-64 overflow-y-auto">
									{problems.map((problem) => {
										const isDisabled = isAlreadySelected.some((p) => p.problem_id === problem.problem_id)
										return (
											<li
												key={`list-${problem.problem_id}`}
												onClick={() => !isDisabled && handleSelect(problem)}
												className={`cursor-pointer rounded-md p-2 border-b transition ${
													isDisabled
														? "bg-gray-300 text-gray-500 cursor-not-allowed"
														: tempSelectedIds.has(problem.problem_id)
														? "bg-mygreen text-white"
														: "bg-gray-100 hover:bg-gray-200"
												}`}
											>
												📌 {problem.title.length > 18 ? `${problem.title.slice(0, 18)}...` : problem.title}
											</li>
										)
									})}
								</ul>
							</div>

							{/* 🔹 선택한 문제 리스트 */}
							<div className="flex-1">
								<h2 className="text-xl font-bold mb-2">선택한 문제</h2>
								<ul className="border p-4 rounded-md shadow-md bg-white h-64 overflow-y-auto">
									{modalSelected.length > 0 ? (
										modalSelected.map((p) => {
											// const newProblem = problems.find((p) => p.problem_id === selected.problem_id)
											return (
												<li
													key={`selected-${p.problem_id}`}
													onClick={() => handleSelect(p)}
													className="p-2 border-b rounded-md cursor-pointer hover:bg-red-200"
												>
													📌{p.title.length > 18 ? `${p.title.slice(0, 18)}...` : p.title}
													{/* {newProblem
														? newProblem.title.length > 18
															? `${newProblem.title.slice(0, 18)}...`
															: newProblem.title
														: "알 수 없는 문제"} */}
												</li>
											)
										})
									) : (
										<li className="text-gray-500">선택한 문제가 없습니다.</li>
									)}
								</ul>
							</div>
						</div>

						{/* 🔹 Submit 버튼 */}
						<div className="mt-4 flex justify-end">
							{/* <button
								onClick={MakeProblemClick}
								className="bg-mydarkgreen text-white px-4 py-2 mr-2 rounded hover:bg-opacity-80 transition"
							>
								문제 만들기
							</button> */}
							<button
								onClick={handleAddProblemButton}
								disabled={isSubmitting}
								className="bg-mygreen text-white px-4 py-2 rounded hover:bg-opacity-80 transition"
							>
								문제 추가하기
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	)
}
