"use client";

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { dummyProblems } from "@/data/dummy";
import HistoryGraph from "@/components/history/myhistory";
import ProblemStatistics from "../ui/ProblemStatistics";

interface Problem {
  title: string;
  description: string;
  input: string;
  output: string;
}

export default function ProblemView() {
  const router = useRouter();
  const { id } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedHistory, setIsExpandedHistory] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/proxy/problems/${id}`);
        const data = await response.json();
        setProblem(data);
        console.log("📌 API에서 받은 문제 설명:", data.description);
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    }
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!problem) {
    return <p>문제 정보를 불러올 수 없습니다.</p>;
  }

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        <motion.button
          onClick={() => router.push(`/registered-problems/edit/${id}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center bg-black text-white px-8 py-1.5 rounded-xl m-2 text-md cursor-pointer hover:bg-gray-500 transition-all duration-200 ease-in-out active:scale-95"
        >
          문제 수정하기
        </motion.button>
      </div>

      <div className="p-6  mx-auto bg-white shadow-md rounded-lg">
        {/* 문제 제목 */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
        ✏️ {problem.title}
        </h1>

        {/* 구분선 (굵게 설정) */}
        <div className="flex justify-between items-center border-t-2 border-gray-600 mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-gray-700 hover:text-black flex items-center"
        >
          {isExpanded ? (
            <>
              <FaChevronUp className="mr-2" /> 접기
            </>
          ) : (
            <>
              <FaChevronDown className="mr-2" /> 펼치기
            </>
          )}
        </button>
      </div>

      {/* ✅ Tiptap HTML 렌더링 (토글 가능) */}
      <div
        className={`transition-all duration-300 ${
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="editor-content" dangerouslySetInnerHTML={{ __html: problem.description }} />
      </div>
        {/* ✅ 테이블 테두리 강제 적용 */}
        <style>
          {`
          .editor-content h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
          .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }

          /* ✅ 테이블 스타일 적용 */
          .editor-content table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            border: 2px solid #333;
          }

          .editor-content th, .editor-content td {
            border: 2px solid #333 !important;
            padding: 12px;
            text-align: left;
            word-wrap: break-word;
          }

          .editor-content th {
            background-color: #f0f0f0;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
          }

          /* ✅ 전체 테이블 스타일 */
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

          /* ✅ 내부 셀 스타일 */
          .editor-content td {
            background-color: #ffffff !important;
            border: 1px solid #e0e0e0 !important;
            padding: 12px !important;
            text-align: left !important;
            font-size: 1rem !important;
            color: #444 !important;
            transition: background 0.2s ease-in-out !important;
            border-radius: 0 !important;
          }

          /* ✅ 강조된 셀 (제목 스타일) */
          .editor-content td[data-header="true"] {
            background-color: #e7e7e7 !important;
            font-weight: bold !important;
            text-align: center !important;
            color: #222 !important;
          }

          /* ✅ 마우스 오버 효과 */
          .editor-content td:hover {
            background-color: #f5f5f5 !important;
          }

          /* ✅ 테이블 전체 둥글게 조정 */
          .editor-content tr:first-child th:first-child {
            border-top-left-radius: 12px !important;
          }
          .editor-content tr:first-child th:last-child {
            border-top-right-radius: 12px !important;
          }
          .editor-content tr:last-child td:first-child {
            border-bottom-left-radius: 12px !important;
          }
          .editor-content tr:last-child td:last-child {
            border-bottom-right-radius: 12px !important;
          }
        
        `}
        </style>
      </div>

      <div className="p-6 bg-white shadow-md rounded-lg mt-10">
      {/* 문제 제목 */}
      <h4 className="text-2xl font-bold text-gray-900 mb-2">📈 History</h4>

      {/* 구분선 & 토글 버튼 */}
      <div className="flex justify-between items-center border-t-2 border-gray-600 mb-4">
        <button
          onClick={() => setIsExpandedHistory(!isExpandedHistory)}
          className="mt-3 text-gray-700 hover:text-black flex items-center"
        >
          {isExpandedHistory ? (
            <>
              <FaChevronUp className="mr-2" /> 접기
            </>
          ) : (
            <>
              <FaChevronDown className="mr-2" /> 펼치기
            </>
          )}
        </button>
      </div>

      {/* 토글 대상 영역 (애니메이션 적용) */}
      <div
        className={`transition-all duration-300 ${
          isExpandedHistory ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <HistoryGraph historys={dummyProblems} />
      </div>
    </div>

      <div className="p-6  bg-white shadow-md rounded-lg mt-10">
      <h4 className="text-2xl font-bold text-gray-900 mb-2">📊 이 문제의 통계</h4>
      <hr className="border-t-2 border-gray-600 " />
        {/* //데이터 나중에 수정 */}
        <ProblemStatistics problem_id={1}/> 
      </div>
    </>
  );
}
