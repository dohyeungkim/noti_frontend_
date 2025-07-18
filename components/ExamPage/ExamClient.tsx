"use client"

import { useRouter, useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import ExamGallery from "@/components/ExamPage/ExamGallery"
import ExamTable from "@/components/ExamPage/ExamTable"
import WorkBookCreateModal from "./ExamModal"
import { AnimatePresence, motion } from "framer-motion"
// import SortButton from "../ui/SortButton";
import ViewToggle from "../ui/ViewToggle"
import SearchBar from "../ui/SearchBar"
import OpenModalButton from "../ui/OpenModalButton"
import { useAuth } from "@/stores/auth"
import { group_api, workbook_api } from "@/lib/api"

interface WorkbookType {
	workbook_id: number
	group_id: number
	workbook_name: string
	problem_cnt: number
	description: string
	creation_date: string
	// 시험모드 관련 필드 추가
	is_test_mode: boolean
	test_start_time: any
	test_end_time: any
	publication_start_time: any
	publication_end_time: any
}

export default function ExamsClient() {
	const router = useRouter()
	const { userName } = useAuth()
	const { groupId } = useParams() as {
		groupId: string
	}

	const [workbooks, setWorkbooks] = useState<WorkbookType[]>([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [workBookName, setWorkBookName] = useState("")
	const [workBookDescription, setWorkBookDescription] = useState("")
	const [searchQuery, setSearchQuery] = useState("")
	const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery")
	const [filteredWorkbooks, setFilteredWorkbooks] = useState<WorkbookType[]>([])
	const [refresh, setRefresh] = useState(false)

	// 그룹장의 유저명 저장 (해당 그룹의 그룹장 ID를 저장)
	const [groupOwner, setGroupOwner] = useState<string | null>(null)

	// 그룹장인지 확인하는 함수
	const isGroupOwner = userName === groupOwner

	// 문제지에 대한 모든 정보 가져오기 -> 시험모드 정보들도 가져와야됨! 👻
	const fetchWorkbooks = useCallback(async () => {
		try {
			const data = await workbook_api.workbook_get(Number(groupId))
			setWorkbooks(data)
		} catch (error) {
			console.error("문제지 데이터를 가져오는 데 실패했습니다:", error)
		}
	}, [groupId])

	const handleEnterExam = (examId: string) => {
		router.push(`/mygroups/${groupId}/exams/${examId}`)
	}

	const handleClick = () => {
		router.push(`/manage/${groupId}`)
	}

	// 그룹장 정보 가져오기 (useCallback 적용)
	const fetchMyOwner = useCallback(async () => {
		try {
			const data = await group_api.my_group_get()
			const currentGroup = data.find((group: { group_id: number }) => group.group_id === Number(groupId))
			setGroupOwner(currentGroup?.group_owner || null)
		} catch (error) {
			console.error("그룹장 불러오기 중 오류:", error)
		}
	}, [groupId])

	useEffect(() => {
		const filteredWorkbooksdata = workbooks
			.filter((wb) => wb.group_id === Number(groupId))
			.filter((wb) => wb.workbook_name.toLowerCase().includes(searchQuery.toLowerCase()))
		setFilteredWorkbooks(filteredWorkbooksdata)
	}, [searchQuery, workbooks, groupId])

	useEffect(() => {
		if (!groupId) return
		fetchWorkbooks()
		fetchMyOwner()
	}, [refresh, groupId, fetchWorkbooks, fetchMyOwner])

	return (
		<div>
			<motion.div>
				<div>
					{/* ✅ 문제지 생성 버튼 (그룹장일 때만 활성화) */}
					<motion.div
						className="flex items-center gap-2 justify-end"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.2 }}
					>
						{isGroupOwner && <OpenModalButton onClick={() => setIsModalOpen(true)} label="문제지 생성하기" />}
						{isGroupOwner && (
							<button
								className="bg-gray-800 text-white px-4 py-1.5 rounded-xl text-md cursor-pointer
      hover:bg-gray-500 transition-all duration-200 ease-in-out
      active:scale-95"
								onClick={handleClick}
							>
								⚙️ 설정
							</button>
						)}
					</motion.div>
				</div>
				{/* 검색 & 정렬 & 보기 방식 변경 */}
				<motion.div
					className="flex items-center gap-4 mb-4 w-full"
					initial="hidden"
					animate="visible"
					variants={{
						hidden: { opacity: 0, y: -10 },
						visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
					}}
				>
					<motion.div className="flex-grow min-w-0" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
						<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
					</motion.div>
					<motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
						<ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
					</motion.div>
					<motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
						{/* <SortButton onSortChange={setSortOrder} /> */}
					</motion.div>
				</motion.div>

				{/* 문제지 목록 */}
				<h2 className="text-2xl font-bold mb-4 m-2 pt-2">나의 문제지</h2>
				<hr className="border-b-1 border-gray-300 my-4 m-2" />

				<motion.div
					key={viewMode}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.3 }}
				>
					{/* 밑에가 기존 코드입니다ㅏ */}
					{viewMode === "gallery" ? (
						<ExamGallery workbooks={filteredWorkbooks} handleEnterExam={handleEnterExam} isGroupOwner={isGroupOwner} />
					) : (
						<ExamTable workbooks={filteredWorkbooks} handleEnterExam={handleEnterExam} />
					)}

					{/* 더미데이터로 바꾸면서 이 코드로 수정했음 - 홍 */}
					{/* {viewMode === "gallery" ? (
						<ExamGallery
							examData={workbooks.map((workbook) => ({
								workbook,
								exam: null, // 또는 실제 exam 데이터가 있는 경우 해당 데이터 연결
							}))}
							handleEnterExam={handleEnterExam}
						/>
					) : (
						<ExamTable workbooks={filteredWorkbooks} handleEnterExam={handleEnterExam} />
					)} */}
				</motion.div>

				{/* 모달 */}
				<AnimatePresence>
					{isModalOpen && (
						<WorkBookCreateModal
							isModalOpen={isModalOpen}
							setIsModalOpen={setIsModalOpen}
							WorkBookName={workBookName}
							setWorkBookName={setWorkBookName}
							WorkBookDescription={workBookDescription}
							setWorkBookDescription={setWorkBookDescription}
							group_id={Number(groupId)}
							refresh={refresh}
							setRefresh={setRefresh}
						/>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}
