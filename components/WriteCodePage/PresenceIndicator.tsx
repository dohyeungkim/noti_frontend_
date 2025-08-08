// Reids 실시간 관련 코드 - v0에서는 미완성 기능

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUserCircle, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { usePresence } from "../../hooks/usePresence"

interface PresenceUser {
	userId: string
	nickname: string
	joinedAt: string
	lastActivity: string
}

interface PresenceIndicatorProps {
	pageId: string
	user: {
		userId: string
		nickname: string
	}
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ pageId, user }) => {
	const presenceData = usePresence(pageId, user)
	const [showUserList, setShowUserList] = useState(false)

	// 현재 사용자 제외한 다른 사용자들 (아이콘 표시용)
	const otherUsers = presenceData.users?.filter((u) => u.userId !== user.userId) || []

	// 안전하게 값 추출
	const participantCount = presenceData.count || 0
	const usersList = presenceData.users || []

	return (
		<div className="relative">
			{/* 메인 표시 영역 */}
			<button
				onClick={() => setShowUserList(!showUserList)}
				className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm text-gray-700 border border-gray-300 transition-colors"
			>
				{/* 사용자 아이콘들 (최대 3개까지 표시) */}
				<div className="flex -space-x-2">
					{otherUsers.length > 0 ? (
						<>
							{otherUsers.slice(0, 3).map((otherUser) => (
								<UserIcon key={otherUser.userId} user={otherUser} size="sm" />
							))}
							{otherUsers.length > 3 && (
								<div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white">
									+{otherUsers.length - 3}
								</div>
							)}
						</>
					) : (
						// 다른 사용자가 없을 때 현재 사용자 아이콘 표시
						<UserIcon
							user={{
								userId: user.userId,
								nickname: user.nickname,
								joinedAt: new Date().toISOString(),
								lastActivity: new Date().toISOString(),
							}}
							size="sm"
						/>
					)}
				</div>

				{/* 접속 인원 수 */}
				<span className="font-semibold">{participantCount}명 접속중</span>

				{/* 드롭다운 화살표 */}
				<FontAwesomeIcon
					icon={faChevronDown}
					className={`w-3 h-3 transition-transform ${showUserList ? "rotate-180" : ""}`}
				/>
			</button>

			{/* 사용자 목록 드롭다운 */}
			{showUserList && (
				<div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
					<div className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
						현재 접속 중인 사용자 ({participantCount}명)
					</div>

					{usersList.length > 0 ? (
						usersList.map((presenceUser) => (
							<UserListItem
								key={presenceUser.userId}
								user={presenceUser}
								isCurrentUser={presenceUser.userId === user.userId}
							/>
						))
					) : (
						<div className="px-3 py-4 text-sm text-gray-500 text-center">접속 중인 사용자가 없습니다</div>
					)}
				</div>
			)}
		</div>
	)
}

// 사용자 목록 아이템 컴포넌트 (요청하신 레이아웃: 왼쪽 아이콘, 오른쪽 이름+아이디)
const UserListItem: React.FC<{
	user: PresenceUser
	isCurrentUser: boolean
}> = ({ user, isCurrentUser }) => {
	return (
		<div className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors">
			{/* 왼쪽: 프로필 아이콘 */}
			<div className="flex-shrink-0">
				<UserIcon user={user} size="md" />
			</div>

			{/* 오른쪽: 사용자 정보 */}
			<div className="flex-1 min-w-0">
				{/* 사용자 이름 + 나 뱃지 */}
				<div className="flex items-center gap-2 mb-1">
					<span className="text-sm font-medium text-gray-900 truncate">{user.nickname}</span>
					{isCurrentUser && (
						<span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">나</span>
					)}
				</div>

				{/* 사용자 아이디 (작게) */}
				<div className="text-xs text-gray-500 truncate">ID: {user.userId}</div>

				{/* 접속 시간 (더 작게) */}
				<div className="text-xs text-gray-400 mt-0.5">{formatJoinTime(user.joinedAt)}에 접속</div>
			</div>

			{/* 맨 오른쪽: 온라인 상태 표시 */}
			<div className="flex-shrink-0">
				<div className="w-2 h-2 bg-green-500 rounded-full"></div>
			</div>
		</div>
	)
}

// 사용자 아이콘 컴포넌트 (Font Awesome 기반)
const UserIcon: React.FC<{
	user: PresenceUser
	size: "sm" | "md"
}> = ({ user, size }) => {
	const sizeClasses = {
		sm: "w-6 h-6 text-lg",
		md: "w-8 h-8 text-xl",
	}

	// 사용자별 고유 색상 생성
	const generateColor = (userId: string): string => {
		const colors = [
			"#3B82F6", // blue-500
			"#EF4444", // red-500
			"#10B981", // mygreen
			"#F59E0B", // amber-500
			"#8B5CF6", // violet-500
			"#06B6D4", // cyan-500
			"#84CC16", // lime-500
			"#F97316", // orange-500
			"#EC4899", // pink-500
			"#6366F1", // indigo-500
		]

		let hash = 0
		for (let i = 0; i < userId.length; i++) {
			hash = userId.charCodeAt(i) + ((hash << 5) - hash)
		}

		return colors[Math.abs(hash) % colors.length]
	}

	return (
		<div className="relative">
			<FontAwesomeIcon
				icon={faUserCircle}
				className={`${sizeClasses[size]} border-2 border-white rounded-full`}
				style={{ color: generateColor(user.userId) }}
			/>

			{/* 온라인 상태 점 */}
			<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
		</div>
	)
}

// 시간 포맷팅 유틸리티
const formatJoinTime = (joinedAt: string): string => {
	const now = new Date()
	const joined = new Date(joinedAt)
	const diffMs = now.getTime() - joined.getTime()
	const diffMinutes = Math.floor(diffMs / (1000 * 60))

	if (diffMinutes < 1) return "방금"
	if (diffMinutes < 60) return `${diffMinutes}분 전`

	const diffHours = Math.floor(diffMinutes / 60)
	if (diffHours < 24) return `${diffHours}시간 전`

	return joined.toLocaleDateString()
}
