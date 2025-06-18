"use client";

import { useAuth } from "@/stores/auth";
import { usePathname } from "next/navigation";

import { useState } from "react";
import DrawerWrapper from "@/components/Layout/DrawerWrapper";
import PageHeaderWrapper from "@/components/Layout/PageHeaderWrapper";
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuth } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const [isExamSidebarOpen, setIsExamSidebarOpen] = useState(false);

  // 좌우 패딩 조절 값 (열리면 사이드바 너비 고려)
  const leftPadding = isDrawerOpen
    ? "pl-[15%] pr-[10%]"
    : "pl-[5%] pr-[5%] md:pl-[8%] md:pr-[8%] lg:pl-[10%] lg:pr-[10%]";

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
            <div className="w-full px-0">
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
