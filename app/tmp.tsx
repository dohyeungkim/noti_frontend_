import DrawerWrapper from "../components/layout/DrawerWrapper";
import ExamSidebarWrapper from "../components/layout/ExamSidebarWrapper";
import PageHeaderWrapper from "../components/layout/PageHeaderWrapper";
import "./global.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>

<body className="flex flex-col min-h-screen w-full">
  <div className="flex-grow flex flex-col">
    <div
      className="container 
      w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[75vw] xl:w-[70vw] 
      min-w-[1100px] max-w-[1600px] mx-auto bg-[#f9f9f9]"
    >
      {/* 왼쪽 Drawer */}
      <DrawerWrapper />

      {/* 메인 콘텐츠 */}
      <main className="main-content flex-grow">
        <div className="content-area">
          <PageHeaderWrapper />
          {children}
            {/* ✅ 푸터 (항상 하단 고정) */}
  <footer className="w-full text-center py-10 text-gray-600 text-sm mt-auto">
    © {new Date().getFullYear()} My App. All rights reserved.
  </footer>
        </div>
      </main>

      {/* 시험 모드 사이드바 */}
      <ExamSidebarWrapper />

      
    </div>
  
  </div>

  
</body>

    </html>
  );
}



