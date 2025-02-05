"use client";
import "./global.css"; // CSS 불러오기
import { useState } from "react";
import Drawer from "../components/layout/Drawer";
import ExamSidebar from "../components/layout/ExamSidebar";
import { useExamMode } from "../hooks/useExamMode";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isExamMode, groupId, examId } = useExamMode();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExamSidebarOpen, setIsExamSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body>
      <div className="container 
  w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[75vw] xl:w-[70vw] 
  min-w-[1100px] max-w-[1600px] mx-auto bg-[#f9f9f9]0">
      {/* 왼쪽 Drawer */}
          <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />

          {/* 메인 콘텐츠 */}
          <main className={`main-content ${isDrawerOpen ? "drawer-open" : ""} ${isExamSidebarOpen ? "exam-open" : ""}`}>
            {children}
          </main>

          {/* 시험 모드 사이드바 */}
          {isExamMode && <ExamSidebar groupId={groupId ?? "default-group"} examId={examId ?? "default-exam"} isOpen={isExamSidebarOpen} setIsOpen={setIsExamSidebarOpen} />}
        </div>
      </body>

      {/* 스타일 추가 */}
      <style jsx>{`
        .container {
          display: flex;
          width: 100vw;
          height: 100vh;
          transition: all 0.4s ease-in-out;
        }

        .main-content {
          flex: 1;
          //padding: 20px;
          transition: margin 0.4s ease-in-out, width 0.4s ease-in-out;
        }

        /* 왼쪽 Drawer가 열릴 때 */
        .drawer-open {
         margin-left: 250px;
         //margin-left: 160px;
        }

        /* 오른쪽 ExamSidebar가 열릴 때 */
        .exam-open {
          margin-right: 280px;
        }
      `}</style>
    </html>
  );
}
