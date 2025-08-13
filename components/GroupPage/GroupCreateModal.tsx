"use client"
import { group_api } from "@/lib/api"
import { useState, useEffect, useCallback } from "react"

interface GroupCreateModalProps {
	isOpen: boolean
	onClose: () => void
	groupName: string
	setGroupName: (value: string) => void
	isPublic: boolean
	setIsPublic: (value: boolean) => void
	onCreate: () => void
	refresh: boolean
	setRefresh: (refresh: boolean) => void
}

export default function GroupCreateModal({
	isOpen,
	onClose,
	groupName,
	setGroupName,
	isPublic,
	setIsPublic,
	onCreate,
	refresh,
	setRefresh,
}: GroupCreateModalProps) {
	const [isConfirming, setIsConfirming] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const resetState = useCallback(() => {
		setGroupName("")
		setIsPublic(true)
		setIsConfirming(false)
		setIsLoading(false)
		setErrorMessage(null)
	}, [setGroupName, setIsPublic])

	useEffect(() => {
		if (!isOpen) {
			resetState()
		}
	}, [isOpen, resetState])

	if (!isOpen) return null

	const handleCreate = async () => {
		if (!groupName.trim()) {
			setErrorMessage("그룹 이름을 입력하세요!")
			return
		}

		setIsLoading(true)
		setErrorMessage(null)

		try {
			await group_api.group_create(groupName.trim(), !isPublic)
			setRefresh(!refresh)
			onCreate()
			resetState()
			onClose()
		} catch (error) {
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
			onClick={onClose}
		>
			<div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative" onClick={(e) => e.stopPropagation()}>
				{/* 헤더 */}
				<div className="flex justify-between items-center border-b pb-4">
					<h2 className="text-lg font-semibold">그룹 생성하기</h2>
					<button
						onClick={() => {
							resetState()
							onClose()
						}}
						className="text-gray-800 hover:text-opacity-80 text-2xl"
					>
						✖
					</button>
				</div>

				{/* 그룹 생성 확인 단계 */}
				{isConfirming ? (
					<div className="text-center my-4">
						<h3 className="text-lg font-semibold mb-4">&quot;{groupName}&quot; 그룹을 생성하시겠습니까?</h3>
						<div className="flex justify-center gap-4">
							<button
								onClick={handleCreate}
								disabled={isLoading}
								className={`bg-green-600 text-white py-2 px-6 rounded-md transition ${
									isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
								}`}
							>
								{isLoading ? "생성 중..." : "예"}
							</button>
							<button
								onClick={() => setIsConfirming(false)}
								className="bg-myred text-white py-2 px-6 rounded-md hover:bg-opacity-80 transition"
							>
								아니요
							</button>
						</div>
					</div>
				) : (
					// 입력 폼
					<div className="flex flex-col gap-3 mt-4">
						{/* 그룹 이름 입력 */}
						<input
							type="text"
							value={groupName}
							onChange={(e) => {
								setGroupName(e.target.value)
								setErrorMessage(null) // ✅ 입력하면 에러 메시지 제거
							}}
							placeholder="그룹 이름을 입력하세요"
							className={`w-full p-2 border rounded-lg bg-gray-50 transition text-gray-700 ${
								errorMessage ? "border-red-500" : "border-gray-300"
							} focus:ring-2 focus:ring-gray-500 focus:outline-none`}
						/>
						{/* ✅ 에러 메시지 출력 */}
						{errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

						{/* 공개/비공개 선택 */}
						<div className="flex justify-between items-center border border-gray-300 p-2 rounded-lg">
							<span className="text-sm text-gray-600">그룹 상태</span>
							<button
								onClick={() => setIsPublic(!isPublic)}
								className={`px-4 py-1 rounded-lg text-sm transition ${
									isPublic ? "bg-mygreen text-white" : "bg-mygray text-white"
								}`}
							>
								{isPublic ? "공개" : "비공개"}
							</button>
						</div>
					</div>
				)}

				{/* 그룹 생성 버튼 */}
				{!isConfirming && (
					<div className="mt-6">
						<button
							onClick={() => setIsConfirming(true)}
							disabled={!groupName.trim()} // ✅ 공백이면 버튼 비활성화
							className={`w-full bg-mygreen text-white py-2 rounded-lg text-lg cursor-pointer hover:bg-opacity-80 transition ${
								!groupName.trim() ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{isLoading ? "생성 중..." : "그룹 생성하기"}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
