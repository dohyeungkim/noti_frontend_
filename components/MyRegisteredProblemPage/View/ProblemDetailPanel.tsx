"use client";

import { motion } from "framer-motion";
// import { useParams } from "next/navigation";

interface Problem {
  problem_id: number;
  title: string;
  group: string;
  paper: string;
  description?: string;
}

interface ProblemDetailPanelProps {
  problem: Problem | null;
  onClose: () => void;
}

export default function ProblemDetailPanel({
  problem,
  onClose,
}: ProblemDetailPanelProps) {
  // const { id } = useParams();

  if (!problem) return null;

  return (
    <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ duration: 0.3 }}
    className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-2/5 bg-white shadow-lg z-50 rounded-xl flex flex-col"
  >
    {/* 닫기 버튼 (고정) */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-lg font-bold"
    >
      ✖
    </button>
  
    {/* ✅ 스크롤 가능한 내용 영역 */}
    <motion.div
      key={problem.title} // ✅ 문제가 변경될 때마다 애니메이션 트리거
      initial={{ opacity: 0, y: 20 }} // ✅ 아래에서 올라오는 효과
      animate={{ opacity: 1, y: 0 }} // ✅ 부드럽게 나타남
      exit={{ opacity: 0, y: -20 }} // ✅ 위로 사라지는 효과
      transition={{ duration: 0.3, ease: "easeInOut" }} // ✅ 자연스럽게 변경
      className="flex-grow overflow-y-auto p-6"
    >      {/* 문제 제목 */}
      <h1 className="text-5xl font-bold text-gray-900 mb-6">{problem.title}</h1>
      
      {/* 구분선 */}
      <hr className="border-t-2 border-gray-600 mb-6" />
      
      {/* ✅ 문제 설명 */}
      <div
        className="editor-content"
        dangerouslySetInnerHTML={{ __html: problem.description || "설명이 없습니다." }}
      />
    </motion.div>
    
      {/* ✅ 테이블 스타일 적용 */}
      <style>
        {`
          .editor-content h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
          .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }
          
          /* ✅ 테이블 스타일 */
          .editor-content table {
            width: 100%;
            border-collapse: collapse !important;
            margin-top: 10px !important;
            border: 2px solid #d4d4d4 !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            background-color: #f9f9f9 !important;
          }

          /* ✅ 헤더 스타일 */
          .editor-content th {
            background-color: #f1f1f1 !important;
            font-weight: 600 !important;
            text-align: center !important;
            color: #333 !important;
            padding: 14px !important;
            border-bottom: 1.5px solid #d4d4d4 !important;
          }

          /* ✅ 셀 스타일 */
          .editor-content td {
            background-color: #ffffff !important;
            border: 1px solid #e0e0e0 !important;
            padding: 12px !important;
            text-align: left !important;
            font-size: 1rem !important;
            color: #444 !important;
          }

          /* ✅ 둥근 모서리 적용 */
          .editor-content tr:first-child th:first-child { border-top-left-radius: 12px !important; }
          .editor-content tr:first-child th:last-child { border-top-right-radius: 12px !important; }
          .editor-content tr:last-child td:first-child { border-bottom-left-radius: 12px !important; }
          .editor-content tr:last-child td:last-child { border-bottom-right-radius: 12px !important; }
        `}
      </style>
    </motion.div>
  );
}
