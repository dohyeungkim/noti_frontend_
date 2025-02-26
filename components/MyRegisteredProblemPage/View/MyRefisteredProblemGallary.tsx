"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import ProblemDetailPanel from "@/components/MyRegisteredProblemPage/View/ProblemDetailPanel";
import ConfirmationModal from "@/components/MyRegisteredProblemPage/View/MyRefisteredProblemDeleteModal"; // ✅ 추가

interface Question {
  problem_id: number;
  title: string;
  group: string;
  paper: string;
  solvedCount: number;
  description?: string;
}

interface GalleryViewProps {
  filteredData: Question[];
  selectedProblem: Question | null;
  handleCloseDetail: () => void;
  handleHoverStartProblem: (problem: Question) => void,
  handleHoverEndProblem: () => void,
  handleDeleteButtonClick: (problem_id: number) => Promise<void>;
}

export default function GalleryView({
  filteredData,
  selectedProblem,
  handleCloseDetail,
  handleHoverStartProblem,
  handleHoverEndProblem,
  handleDeleteButtonClick,
}: GalleryViewProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [targetProblemId, setTargetProblemId] = useState<number | null>(null);
  
  const openDeleteModal = (problem_id: number) => {
    setTargetProblemId(problem_id);
    setIsConfirming(true);
  };

  const handleDelete = async () => {
    if (targetProblemId !== null) {
      try {
        await handleDeleteButtonClick(targetProblemId);
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
    setIsConfirming(false);
  };

  return (
    <>
      <motion.div className="flex transition-all duration-300">
        <motion.div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${
            selectedProblem ? "w-2/3" : "w-full"
          }`}>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <motion.div
                key={item.problem_id}
                className="bg-white p-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
                onHoverStart={() => handleHoverStartProblem(item)}
                onHoverEnd={() => handleHoverEndProblem()}
                >
                <div className="p-1 rounded-lg">
                
                <h3 
                  className={`m-3 text-xl font-semibold w-auto truncate`}
                  title={item.title}>
                  {item.title}
                </h3>       

                <p className="text-gray-500 text-sm m-3">{item.group}</p>
                <p className="text-gray-400 text-sm">{item.paper}</p>

                {/* 버튼 그룹 */}
                <div className="flex items-center justify-between mt-3 w-full">
                  <span className="inline-flex text-blue-500">
                    <button
                      onClick={() => router.push(`/registered-problems/edit/${selectedProblem.problem_id}`)}
                      className="flex items-center p-2 hover:text-black transition"
                    >
                      <FontAwesomeIcon icon={faPen} className="mr-1" />
                      수정
                    </button>
                  </span>   
                  <button
                    onClick={() => openDeleteModal(item.problem_id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <FontAwesomeIcon icon={faTrashCan} />           
                    삭제
                  </button>
                </div>
              </div>

                
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">등록된 문제가 없습니다.</p>
          )}
        </motion.div>

        {/* ✅ 문제 상세 패널 */}
        <motion.div
          className={`transition-all duration-300 ${selectedProblem ? "w-1/3" : "w-0 hidden"}`}>
          <ProblemDetailPanel problem={selectedProblem} onClose={handleCloseDetail} />
        </motion.div>
      </motion.div>

      {/* ✅ 삭제 확인 모달 */}
      {isConfirming && (
        <ConfirmationModal
          message={`"${
            filteredData.find((q) => q.problem_id === targetProblemId)?.title || "이"
          }" 문제를 삭제하시겠습니까?`} // ✅ 문제 제목 표시
          onConfirm={handleDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </>
  );
}
