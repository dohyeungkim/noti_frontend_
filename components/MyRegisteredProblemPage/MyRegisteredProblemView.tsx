"use client";

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { dummyProblems } from "@/data/dummy";
import HistoryGraph from "@/components/history/myhistory";
import ProblemStatistics from "../ui/ProblemStatistics";
import ConfirmationModal from "./View/MyRefisteredProblemDeleteModal";

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [isExpandedHistory, setIsExpandedHistory] = useState(true);
  const [isExpandedstatis, setisExpandedstatis] = useState(true);

  const [isConfirming, setIsConfirming] = useState(false);
  const [targetProblemId, setTargetProblemId] = useState<number | null>(null);
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
// ✅ 실제 삭제 API 호출 함수 추가
const handleDeleteButtonClick = async (problem_id: number) => {
  try {
    const response = await fetch(`/api/proxy/problems/${problem_id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("삭제 요청 실패");
    }

    alert("문제가 삭제되었습니다.");
    router.push("/registered-problems"); // ✅ 삭제 후 목록 페이지로 이동
  } catch (error) {
    console.error("삭제 실패:", error);
    alert(`⚠️ 이 문제를 참조하는 문제지가 있어 삭제가 불가합니다.`);
  }
};

// ✅ 삭제 확인 모달 열기
const openDeleteModal = (problem_id: number) => {
  setTargetProblemId(problem_id);
  setIsConfirming(true);
};

// ✅ 삭제 처리 함수
const handleDelete = async () => {
  if (targetProblemId !== null) {
    await handleDeleteButtonClick(targetProblemId);
  }
  setIsConfirming(false);
};


  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        <motion.button
          onClick={() => router.push(`/registered-problems/edit/${id}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center bg-black text-white px-8 py-1.5 rounded-xl mb-4 text-md cursor-pointer hover:bg-gray-500 transition-all duration-200 ease-in-out active:scale-95"
        >
          문제 수정하기
        </motion.button>
      </div>

      <div className="p-6 mx-auto bg-white shadow-md rounded-lg">
  {/* 문제 제목 + 작성 날짜 + 버전 배지 */}
  <div className="flex justify-between items-center">
  <h1
  className="text-3xl font-bold text-gray-900 flex items-center"
  title={problem.title} // ✅ 마우스 오버 시 전체 제목 표시
>
  ✏️ {problem.title.length > 30 ? problem.title.slice(0, 30) + "..." : problem.title}
</h1>

    
    {/* 작성 날짜 + 버전 배지 */}
    <div className="flex items-center space-x-3">
      <span className="text-gray-500 text-sm">
        {problem.created_at}에 작성되었습니다.
      </span>
      <span className="bg-mygreen text-white text-sm font-semibold px-8 py-1 rounded-md">
        V1-2
      </span>
    </div>
  </div>

  {/* 구분선 (굵게 설정) */}
  <div className="flex justify-between items-center border-t-2 border-gray-600 my-4">
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
  {/* ✅ Tiptap HTML 렌더링 (길면 스크롤) */}
<div
  className={`transition-all duration-300 overflow-hidden ${
    isExpanded ? "max-h-96 overflow-y-auto" : "max-h-0 opacity-0"
  } `}
  style={{ wordBreak: "break-word" }} // ✅ 너무 긴 단어도 줄바꿈
>
  <div
    className="editor-content"
    dangerouslySetInnerHTML={{ __html: problem.description }}
  />
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
            isExpandedHistory
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <HistoryGraph historys={dummyProblems} />
        </div>
      </div>

      <div className="p-6  bg-white shadow-md rounded-lg mt-10">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">
          📊 이 문제의 통계
        </h4>

        <div className="flex justify-between items-center border-t-2 border-gray-600 mb-4">
          <button
            onClick={() => setisExpandedstatis(!isExpandedstatis)}
            className="mt-3 text-gray-700 hover:text-black flex items-center"
          >
            {isExpandedstatis ? (
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
        <div
          className={`transition-all duration-300 ${
            isExpandedstatis
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <ProblemStatistics problem_id={3} />
        </div>
        
      </div>
      {/* <button
  onClick={(e) => {
    e.stopPropagation(); // ✅ 삭제 버튼 클릭 시 행 클릭 이벤트 방지

    const isConfirmed = window.confirm("정말 삭제하시겠습니까?"); // ✅ 확인창 추가
    if (isConfirmed) {
      handleDeleteButtonClick(item.problem_id); // ✅ 삭제 함수 호출
    }
  }}
  className="flex items-center gap-2 bg-red-500 text-white font-semibold px-8 py-1.5 rounded-lg shadow-md hover:bg-red-600 transition-all mt-4"
>
  삭제 하기
</button> */}
<button
  onClick={(e) => {
    e.stopPropagation(); // 부모 div의 클릭 이벤트와 충돌 방지
    openDeleteModal(problem.problem_id); // ✅ 문제 ID 전달
  }}
  className="flex items-center gap-2 bg-mydelete text-white font-semibold px-8 py-1.5 rounded-lg shadow-md hover:bg-red-600 transition-all mt-4"
>
  삭제 하기
</button>

{/* 삭제 확인 모달 */}
{isConfirming && targetProblemId && (
  <ConfirmationModal
    message={`"${problem.title}" 문제를 삭제하시겠습니까?`} // ✅ 문제 제목 표시
    onConfirm={handleDelete}
    onCancel={() => setIsConfirming(false)}
  />
)}

    </>
  );
}
