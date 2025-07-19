import { useRouter } from "next/navigation"
import { useState } from "react"
import { problem_api, problem_ref_api } from "@/lib/api"

interface Problem {
	problem_id: number
	title: string
	description: string
	attempt_count: number
	pass_count: number
}

interface ProblemListProps {
	problems: Problem[]
	groupId: number
	workbookId: number
	isGroupOwner: boolean
	refresh: boolean // Added refresh prop
	setRefresh: React.Dispatch<React.SetStateAction<boolean>> // Added setRefresh prop
}

const ProblemList = ({ problems, groupId, workbookId, isGroupOwner, refresh, setRefresh }: ProblemListProps) => {
	const router = useRouter()
	const [currentProblems, setCurrentProblems] = useState<Problem[]>(problems)

	const deleteProblem = async (problemId: number) => {
		if (!confirm("정말 삭제하시겠습니까?")) return
		try {
			await problem_ref_api.problem_ref_delete(problemId, groupId, workbookId)
			setCurrentProblems((prev) => prev.filter((p) => p.problem_id !== problemId))
			setRefresh(!refresh) // Trigger refresh by toggling the state
		} catch (error) {
			console.error("문제 삭제 실패:", error)
			alert("문제 삭제 중 오류가 발생했습니다.")
		}
	}

	return (
		<section>
			<div className="w-full overflow-x-auto">
				<table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
					<thead className="bg-gray-200">
						<tr className="border-b-4 border-gray-200 text-gray-800">
							<th className="px-5 py-4 text-center text-lg font-semibold">#</th>
							<th className="px-5 py-4 text-center text-lg font-semibold">문제 제목</th>
							<th className="px-5 py-4 text-center text-lg font-semibold">시도한 횟수</th>
							<th className="px-5 py-4 text-center text-lg font-semibold">맞은 횟수</th>
							<th className="px-5 py-4 text-center text-lg font-semibold"></th>
							{isGroupOwner && <th className="px-5 py-4 text-center text-lg font-semibold">삭제</th>}
						</tr>
					</thead>
					<tbody>
						{currentProblems.length > 0 ? (
							currentProblems.map((p, index) => (
								<tr
									key={p.problem_id}
									className="transition-colors duration-200 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
								>
									<td className="px-5 py-4 text-center">{index + 1}</td>
									<td
										className="px-5 py-4 text-center truncate max-w-[200px] overflow-hidden whitespace-nowrap"
										title={p.title}
									>
										{p.title.length > 15 ? `${p.title.slice(0, 15)}...` : p.title}
									</td>
									<td className="px-5 py-4 text-center">{p.attempt_count}</td>
									<td className="px-5 py-4 text-center">{p.pass_count}</td>
									<td className="px-5 py-4 text-center">
										<button
											onClick={() => router.push(`/mygroups/${groupId}/exams/${workbookId}/problems/${p.problem_id}`)}
											className="w-full py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80"
										>
											도전하기
										</button>
									</td>
									{isGroupOwner && (
										<td className="px-5 py-4 text-center">
											<button
												onClick={() => deleteProblem(p.problem_id)}
												className="text-red-500 hover:text-red-700 text-sm font-semibold"
											>
												삭제
											</button>
										</td>
									)}
								</tr>
							))
						) : (
							<tr>
								<td colSpan={isGroupOwner ? 6 : 5} className="px-5 py-6 text-center text-gray-500">
									📌 문제가 없습니다.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	)
}

export default ProblemList
