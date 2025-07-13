"use client" //클라이언트 컴포넌트
//사용할 훅, 모듈 추가
import { useAuth } from "@/stores/auth"
import { usePathname } from "next/navigation"

import { useState } from "react"
import DrawerWrapper from "@/components/Layout/DrawerWrapper"
import PageHeaderWrapper from "@/components/Layout/PageHeaderWrapper"

export default function ClientLayout({ children }: { children: React.ReactNode }) {//외부에서 접근가능하게
	const { isAuth } = useAuth() 
	const pathname = usePathname()
	const isAuthPage = pathname.startsWith("/auth")

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	// const [isExamSidebarOpen, setIsExamSidebarOpen] = useState(false);

	// 좌우 패딩 조절 값 (열리면 사이드바 너비 고려)
	const leftPadding = isDrawerOpen
		? "pl-[15%] pr-[10%]"
		: "pl-[5%] pr-[5%] md:pl-[8%] md:pr-[8%] lg:pl-[10%] lg:pr-[10%]"

	if (isAuthPage) {
		return <div className="min-h-screen w-full">{children}</div>
	}

	return ( //사용자 UI
		<div className="flex flex-col min-h-screen">
			{isAuth ? (
				<div className="flex-grow flex w-full">
					<DrawerWrapper onToggle={setIsDrawerOpen} />
					<main className={`flex-grow mx-auto transition-all duration-300 flex justify-center ${leftPadding}`}>
						<div className="w-full px-0">
							<PageHeaderWrapper />
							{children}
						</div>
					</main>
				</div>
			) : (
				<div className="min-h-screen w-full">{children}</div>
			)}
		</div>
	)
}
