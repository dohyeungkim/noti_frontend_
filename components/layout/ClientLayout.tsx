"use client";

import { useAuth } from "@/stores/auth";
import { usePathname } from "next/navigation";

import { useState } from "react";
import DrawerWrapper from "@/components/Layout/DrawerWrapper";
import PageHeaderWrapper from "./PageHeaderWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuth } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const [isExamSidebarOpen, setIsExamSidebarOpen] = useState(false);

  // 좌우 패딩 조절 값 (열리면 사이드바 너비 고려)
  const leftPadding = isDrawerOpen
    ? "pl-[20%] pr-[15%]" // 사이드바 열릴 때 (전체 화면에서 사이드바 너비와 추가 마진 고려)
    : "pl-[2%] pr-[2%] md:pl-[3%] md:pr-[3%] lg:pl-[5%] lg:pr-[5%] xl:pl-[10%] xl:pr-[10%] 2xl:pl-[20%] 2xl:pr-[20%]"; // 닫혔을 때 좌우 균형 유지

  if (isAuthPage) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {isAuth ? (
        <div className="flex-grow flex w-full">
          <DrawerWrapper onToggle={setIsDrawerOpen} />
          <main
            className={`flex-grow mx-auto transition-all duration-300 flex justify-center ${leftPadding}`}>
            <div className="w-full px-[2%] md:px-[3%] lg:px-[5%]">
              <PageHeaderWrapper />
              {children}
            </div>
          </main>
        </div>
      ) : (
        <div className="min-h-screen w-full">{children}</div>
      )}

      <footer className="w-full text-center py-10 text-gray-600 text-sm mt-auto">
        © {new Date().getFullYear()} APROFI. All rights reserved.
      </footer>
    </div>
  );
}
