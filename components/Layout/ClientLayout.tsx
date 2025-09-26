"use client";

import { useAuth } from "@/stores/auth";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import DrawerWrapper from "@/components/Layout/DrawerWrapper";
import PageHeaderWrapper from "@/components/Layout/PageHeaderWrapper";
import BackFloatingButton from "@/components/Layout/BackFloatingButton";
import GlobalLoading from "@/components/GlobalLoading";
import { useLoadingStore } from "@/lib/loadingStore"; // ✅ 추가

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuth } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ✅ 라우트가 바뀌면 전역 로딩 무조건 끄기
  const { forceHide } = useLoadingStore();
  useEffect(() => {
    forceHide();
  }, [pathname, forceHide]);

  const leftPadding = isDrawerOpen
    ? "ml-[15%] mr-[5%]"
    : "ml-[13%] mr-[5%] md:ml-[15%] md:mr-[8%] lg:ml-[8%] lg:mr-[4%]";

  return (
    <div className="flex flex-col min-h-screen">
      {/* 전역 로딩 오버레이 */}
      <GlobalLoading />

      {isAuthPage ? (
        <div className="min-h-screen w-full">{children}</div>
      ) : isAuth ? (
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
          <BackFloatingButton hidden={isDrawerOpen} fallback="/mypage" />
        </div>
      ) : (
        <div className="min-h-screen w-full">{children}</div>
      )}
    </div>
  );
}
