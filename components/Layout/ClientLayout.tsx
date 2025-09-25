"use client"

import { useAuth } from "@/stores/auth"
import { usePathname } from "next/navigation"

import { useState } from "react"
import DrawerWrapper from "@/components/Layout/DrawerWrapper"
import PageHeaderWrapper from "@/components/Layout/PageHeaderWrapper"
import BackFloatingButton from "@/components/Layout/BackFloatingButton"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuth } = useAuth()
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/auth")

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 좌우 패딩 조절 값 (열리면 사이드바 너비 고려)
  const leftPadding = isDrawerOpen
    ? "ml-[15%] mr-[5%]"
    : "ml-[13%] mr-[5%] md:ml-[15%] md:mr-[8%] lg:ml-[8%] lg:mr-[4%]"

  if (isAuthPage) {
    return <div className="min-h-screen w-full">{children}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {isAuth ? (
        <div className="flex-grow flex w-full">
          <DrawerWrapper onToggle={setIsDrawerOpen} />
          <main
            className={`flex-grow mx-auto transition-all duration-300 flex justify-center ${leftPadding}`}
          >
            <div className="w-full px-0">
              <PageHeaderWrapper />
              {children}
            </div>
          </main>

          {/* ✅ 전역 뒤로가기 버튼 (사이드바와 독립적으로 항상 고정) */}
          <BackFloatingButton hidden={isDrawerOpen} fallback="/mypage" />
        </div>
      ) : (
        <div className="min-h-screen w-full">{children}</div>
      )}
    </div>
  )
}
