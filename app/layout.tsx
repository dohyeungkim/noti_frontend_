import DrawerWrapper from "../components/layout/DrawerWrapper";
import ExamSidebarWrapper from "../components/layout/ExamSidebarWrapper";
import PageHeaderWrapper from "../components/layout/PageHeaderWrapper";
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>

      <body className="flex flex-col min-h-screen">
        <div className="flex-grow flex w-full">
          {/* 왼쪽 Drawer */}
          <DrawerWrapper />

          {/* 메인 콘텐츠 (좌우 여백 추가 + 중앙 정렬) */}
          <main className="flex-grow mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px]">
            <div className="w-full">
              <PageHeaderWrapper />
              {children}
            </div>
          </main>

          {/* 오른쪽 사이드바 */}
          <ExamSidebarWrapper />
        </div>

        {/* ✅ 푸터 (항상 하단 고정) */}
        <footer className="w-full text-center py-10 text-gray-600 text-sm mt-auto">
          © {new Date().getFullYear()} My App. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
