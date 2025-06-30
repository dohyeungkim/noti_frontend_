"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import SearchBar from "@/components/ui/SearchBar"
import SortButton from "@/components/ui/SortButton"
import GroupCreateModal from "@/components/GroupPage/GroupCreateModal"
import ViewToggle from "@/components/ui/ViewToggle"
import GroupList from "@/components/GroupPage/GroupGallery"
import GroupTable from "@/components/GroupPage/GroupTable"
import { group_api } from "@/lib/api"

export default function GroupsClient() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const [sortOrder, setSortOrder] = useState("제목순")
	const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery")
	const [refresh, setRefresh] = useState(false)

	const [isPublic, setIsPublic] = useState(true)
	const [groupName, setGroupName] = useState("")
	const [myGroups, setMyGroups] = useState<
		{
			group_id: number
			group_name: string
			group_owner: string
			group_private_state: boolean
			member_count: number
			createdAt?: string
			is_member: boolean
		}[]
	>([])

	async function fetchMyGroups() {
		try {
			const data = await group_api.group_get()
			setMyGroups(Array.isArray(data) ? data : [])
		} catch (error) {
			console.error("내 그룹 정보 가져오기 실패:", error)
			setMyGroups([])
		}
	}

	useEffect(() => {
		fetchMyGroups()
	}, [refresh])

	// ✅ 내가 속한 그룹만 필터링
	const myJoinedGroups = myGroups.filter((group) => group.is_member)

	// ✅ 검색 필터
	const filteredGroups = myJoinedGroups.filter((group) =>
		group.group_name.toLowerCase().includes(searchQuery.toLowerCase())
	)

	// ✅ 정렬
	const sortedGroups = [...filteredGroups].sort((a, b) => {
		if (sortOrder === "제목순") {
			return a.group_name.localeCompare(b.group_name)
		} else if (sortOrder === "공개순") {
			return a.group_private_state === b.group_private_state ? 0 : a.group_private_state ? -1 : 1
		}
		return 0
	})

	return (
		<div className="space-y-3">
			{/* 그룹 생성 버튼 */}
			<motion.div
				className="flex justify-end mb-2"
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				<button
					onClick={() => setIsModalOpen(true)}
					className="transition transform hover:scale-105 hover:bg-gray-600 duration-200 px-3 py-2 text-xs rounded-lg bg-gray-800 text-white border-none cursor-pointer"
				>
					그룹 생성하기
				</button>
			</motion.div>

			{/* 검색 & 정렬 & 보기 방식 토글 */}
			<motion.div
				className="flex items-center gap-2 mb-2 w-full"
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
			>
				<div className="flex-grow min-w-0">
					<SearchBar
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						className="animate-fade-in text-xs h-6 px-2 py-1"
					/>
				</div>
				<ViewToggle viewMode={viewMode} setViewMode={setViewMode} className="animate-fade-in scale-75 h-6" />
				<SortButton
					sortOptions={["제목순", "공개순"]}
					onSortChange={(selectedSort) => setSortOrder(selectedSort)}
					className="text-xs px-3 py-2 h-7"
				/>
			</motion.div>

			<motion.h2
				className="text-lg font-bold mb-3 m-1.5 pt-3"
				initial={{ opacity: 0, x: -8 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.3, delay: 0.3 }}
			>
				나의 그룹
			</motion.h2>

			<motion.hr
				className="border-b-1 border-gray-300 my-3 m-1.5"
				initial={{ opacity: 0, scaleX: 0 }}
				animate={{ opacity: 1, scaleX: 1 }}
				transition={{ duration: 0.3, delay: 0.3 }}
			/>

			{/* 그룹 리스트 또는 테이블 뷰 */}
			<motion.div
				key={viewMode}
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.4 }}
				className="text-sm"
			>
				{myJoinedGroups.length === 0 ? (
					<p className="text-center text-gray-500 py-6 text-sm">내가 속한 그룹이 없습니다.</p>
				) : sortedGroups.length > 0 ? (
					viewMode === "gallery" ? (
						<div className="scale-75 origin-top-left w-[133.33%]">
							<GroupList groups={sortedGroups} />
						</div>
					) : (
						<div className="scale-75 origin-top-left w-[133.33%]">
							<GroupTable groups={sortedGroups} />
						</div>
					)
				) : (
					<p className="text-center text-gray-500 py-6 text-sm">검색 결과가 없습니다.</p>
				)}
			</motion.div>

			{/* 그룹 생성 모달 */}
			<GroupCreateModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				groupName={groupName}
				setGroupName={setGroupName}
				isPublic={isPublic}
				setIsPublic={setIsPublic}
				onCreate={() => console.log("그룹 생성 로직 추가 필요")}
				refresh={refresh}
				setRefresh={setRefresh}
			/>
		</div>
	)
}
