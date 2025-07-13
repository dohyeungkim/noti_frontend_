"use client" //클라이언트 컴포넌트


import Link from "next/link" //필요한 모듈 훅 추가
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	faArrowLeft,
	faHouse,
	faScroll,
	faUsers,
	faPen,
	faUserCircle,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons"
import Logout, { LogoutHandles } from "../Auth/Logout"
import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/stores/auth"
import PasswordChange, { PasswordChangeHandles } from "../Auth/PasswordChange"
import { group_api } from "@/lib/api"

interface DrawerProps { //drawerprops의 props타입정의
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}

export default function Drawer({ isOpen, setIsOpen }: DrawerProps) {//외부에서 사용가능하고 isopen과 setisopen을 props로 받음
	const { userName, checkAuthStatus } = useAuth()
	const [groups, setGroups] = useState<
		{
			group_id: number
			group_name: string
			group_owner: string
			group_private_state: boolean
			member_count: number
			createdAt?: string
		}[]
	>([])

	// PasswordChange와 Logout 컴포넌트의 ref 생성
	const passwordChangeRef = useRef<PasswordChangeHandles>(null)
	const logoutRef = useRef<LogoutHandles>(null)

	const fetchGroup = async () => { //비동기 함수 선언
		try {
			const data = await group_api.my_group_get() //group 값가져오기
			if (Array.isArray(data) && data.length > 0) { //뭔가 있으면 data저장
				setGroups(data)
			} else {
				setGroups([]) //없으면 빈배열저장
			}
		} catch (error) { //에러시
			console.error("내 그룹 정보 가져오기 실패:", error)
			setGroups([]) //빈배열저장
		}
	}

	useEffect(() => { //chekckauthsataus가 갱신될때마다 동장
		// 컴포넌트 마운트 시 인증 상태 확인
		checkAuthStatus()
		fetchGroup()
	}, [checkAuthStatus])

	const truncateText = (text: string, maxLength: number) => //일정 값을 초과하는 텍스트를 ...으로만듬
		text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

	return ( //사용자 UI
		<>
			{/* 사이드바 */}
			<div
				className={`fixed top-0 left-0 h-full bg-[#E5E7EB] shadow-lg overflow-hidden rounded-r-2xl transition-all duration-300 z-[1000] ${
					isOpen ? "w-48" : "w-11"
				}`}
			>
				{/* 프로필 영역 */}
				<div className="flex items-center p-3 bg-gray-200 text-gray-700">
					<button className="text-sm cursor-pointer bg-transparent border-none">
						<FontAwesomeIcon icon={faUserCircle} size="lg" className="text-gray-500" />
					</button>
					<p className={`ml-1.5 transition-all duration-300 text-xs ${isOpen ? "block" : "hidden"}`}>
						{userName ? `안녕하세요. ${userName}님!` : "Loading..."}
					</p>
					<button
						className={`ml-auto transition-all duration-300 ${isOpen ? "block" : "hidden"}`}
						onClick={() => setIsOpen(false)}
					>
						<FontAwesomeIcon icon={faArrowLeft} className="text-gray-500 text-sm" />
					</button>
				</div>

				{/* 네비게이션 메뉴 */}
				<div className="p-3">
					<ul className="list-none p-0">
						{[
							{ href: "/mypage", icon: faHouse, text: "홈" },
							{ href: "/mygroups", icon: faUsers, text: "나의 그룹" },
							{
								href: "/solved-problems",
								icon: faScroll,
								text: "내가 푼 문제 모음",
							},
							{
								href: "/registered-problems",
								icon: faPen,
								text: "내가 등록한 문제들",
							},
						].map(({ href, icon, text }) => (
							<li key={href} className="my-3 flex items-center gap-1.5">
								<Link href={href} className="no-underline text-gray-700 flex items-center hover:text-black">
									<button className="border-none bg-transparent text-sm cursor-pointer">
										<FontAwesomeIcon icon={icon} className="text-gray-500" />
									</button>
									<span className={`ml-1.5 transition-all duration-300 text-xs ${isOpen ? "inline" : "hidden"}`}>
										{text}
									</span>
								</Link>
							</li>
						))}
					</ul>

					{/* "나의 그룹" 목록 */}
					<div className={`${isOpen ? "block" : "hidden"}`}>
						<p className="text-gray-500 text-xs mt-3">나의 그룹</p>
						<div className="mt-1.5 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
							{groups.length > 0 ? (
								groups.map((group) => (
									<Link
										key={group.group_id}
										href={`/mygroups/${group.group_id}`}
										className="block text-gray-900 text-xs hover:text-black transition-all duration-200 pl-2 pt-1.5"
									>
										🏡 <span className="text-gray-700">{truncateText(group.group_name, 12)}</span>
									</Link>
								))
							) : (
								<p className="text-gray-700 text-xs">등록된 그룹이 없습니다.</p>
							)}
						</div>
					</div>
				</div>

				{/* 비밀번호 변경, 로그아웃 */}
				<div className="absolute bottom-0 left-0 w-full pl-3 pb-2">
					<ul className="list-none p-0">
						<li
							className="my-3 flex items-center gap-1.5 cursor-pointer"
							onClick={() => passwordChangeRef.current?.openModal()}
						>
							<PasswordChange ref={passwordChangeRef} />
							<span
								className={`text-gray-700 ml-1.5 transition-all duration-300 text-xs ${isOpen ? "inline" : "hidden"}`}
							>
								비밀번호 변경하기
							</span>
						</li>
						<li className="my-3 flex items-center gap-1.5 cursor-pointer" onClick={() => logoutRef.current?.logout()}>
							<Logout ref={logoutRef} />
							<span
								className={`text-gray-700 ml-1.5 transition-all duration-300 text-xs ${isOpen ? "inline" : "hidden"}`}
							>
								로그아웃
							</span>
						</li>
					</ul>
				</div>
			</div>

			<button
				className={`fixed z-[9999] top-[8px] left-[52px] bg-gray-100 text-black rounded-full w-6 h-6 text-sm cursor-pointer ${
					isOpen ? "hidden" : "block"
				}`}
				onClick={() => setIsOpen(true)}
			>
				<FontAwesomeIcon icon={faArrowRight} className="text-gray-500 text-xs" />
			</button>
		</>
	)
}
