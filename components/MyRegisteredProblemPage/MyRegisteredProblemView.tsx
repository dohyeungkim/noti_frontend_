"use client";

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
// import HistoryGraph from "@/components/history/HistoryGraph";
import ProblemStatistics from "../ui/ProblemStatistics";
import ConfirmationModal from "./View/MyRefisteredProblemDeleteModal";
import { problem_api } from "@/lib/api";

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  input: string;
  output: string;
  make_at: string;
}

export default function ProblemView() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);

  // const [historyData, setHistoryData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  // const [isExpandedHistory, setIsExpandedHistory] = useState(true);
  const [isExpandedstatis, setisExpandedstatis] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [targetProblemId, setTargetProblemId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const data = await problem_api.problem_get_by_id(Number(id));
        setProblem(data);
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      } finally {
        setLoading(false);
      }
    };

    // const fetchHistory = async () => {
    //   try {
    //     console.log("📡 문제 히스토리 요청 시작:", id);
    //     const res = await fetch(`/api/problems/problem_history/${id}`);

    //     // 응답 코드 확인
    //     if (!res.ok) {
    //       console.error("❌ 서버 응답 오류:", res.status, res.statusText);
    //       return;
    //     }

    //     const data = await res.json();
    //     console.log("📥 받아온 히스토리 데이터 원본:", data);

    //     // 배열인지 확인 (API에서 data를 감싼 구조일 수도 있음)
    //     if (Array.isArray(data)) {
    //       setHistoryData(data);
    //     } else if (Array.isArray(data?.data)) {
    //       console.warn("📦 'data.data' 안에 배열이 있어 여기에 맞춰 설정합니다.");
    //       setHistoryData(data.data);
    //     } else {
    //       console.error("❗ 예상치 못한 히스토리 응답 구조:", data);
    //     }
    //   } catch (err) {
    //     console.error("💥 히스토리 가져오기 실패:", err);
    //   }
    // };

    if (id) {
      fetchProblem();
      // fetchHistory();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!problem) return <p>문제 정보를 불러올 수 없습니다.</p>;

  const handleDeleteButtonClick = async (problem_id: number) => {
    try {
      await problem_api.problem_delete(problem_id);
      alert("문제가 삭제되었습니다.");
      router.push("/registered-problems");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(`⚠️ 이 문제를 참조하는 문제지가 있어 삭제가 불가합니다.`);
    }
  };

  const openDeleteModal = (problem_id: number) => {
    setTargetProblemId(problem_id);
    setIsConfirming(true);
  };

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
          className="flex items-center bg-black text-white px-8 py-1.5 rounded-xl mb-4 text-md cursor-pointer hover:bg-gray-500 transition-all duration-200 ease-in-out active:scale-95">
          문제 수정하기
        </motion.button>
      </div>

      <div className="p-6 mx-auto bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            ✏️ {problem.title.length > 30 ? problem.title.slice(0, 30) + "..." : problem.title}
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-gray-500 text-sm">
              {problem.make_at.split("T")[0]}에 작성되었습니다.
            </span>
            <span className="bg-mygreen text-white text-sm font-semibold px-8 py-1 rounded-md">
              V1-2
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center border-t-2 border-gray-600 my-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-gray-700 hover:text-black flex items-center">
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

        <div
          className={`transition-all duration-300 overflow-hidden ${
            isExpanded ? "max-h-96 overflow-y-auto" : "max-h-0 opacity-0"
          } `}
          style={{ wordBreak: "break-word" }}>
          <div
            className="editor-content"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        </div>
      </div>

      {/* <div className="p-6 bg-white shadow-md rounded-lg mt-10">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">📈 History</h4>
        <div className="flex justify-between items-center border-t-2 border-gray-600 mb-4">
          <button
            onClick={() => setIsExpandedHistory(!isExpandedHistory)}
            className="mt-3 text-gray-700 hover:text-black flex items-center">
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

        <div
          className={`transition-all duration-300 ${
            isExpandedHistory ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}>
          <HistoryGraph historys={historyData} />
        </div>
      </div> */}

      <div className="p-6 bg-white shadow-md rounded-lg mt-10">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">📊 이 문제의 통계</h4>
        <div className="flex justify-between items-center border-t-2 border-gray-600 mb-4">
          <button
            onClick={() => setisExpandedstatis(!isExpandedstatis)}
            className="mt-3 text-gray-700 hover:text-black flex items-center">
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
            isExpandedstatis ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}>
          <ProblemStatistics problem_id={problem.problem_id} />
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          openDeleteModal(problem.problem_id);
        }}
        className="flex items-center gap-2 bg-mydelete text-white font-semibold px-8 py-1.5 rounded-lg shadow-md hover:bg-red-600 transition-all mt-4">
        삭제 하기
      </button>

      {isConfirming && targetProblemId && (
        <ConfirmationModal
          message={`"${problem.title}" 문제를 삭제하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </>
  );
}
