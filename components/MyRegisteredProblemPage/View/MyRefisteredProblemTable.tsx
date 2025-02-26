"use client";

import ProblemDetailPanel from "./ProblemDetailPanel";
import { motion } from "framer-motion";

interface Question {
  problem_id: number;
  title: string;
  group: string;
  paper: string;
  solvedCount: number;
  description?: string;
}

interface TableViewProps {
  filteredData: Question[];
  selectedProblem: Question | null;
  handleProblemClick: (problem: Question) => void;
  handleCloseDetail: () => void;
  handleDeleteButtonClick: (problem_id: number) => void;
}

export default function TableView({
  filteredData,
  selectedProblem,
  handleProblemClick,
  handleCloseDetail,
  handleDeleteButtonClick,
}: TableViewProps) {
  return (
    <motion.div className="flex transition-all duration-300 w-full">
      {/* ✅ 표 크기가 문제 패널 유무에 따라 자동 조정됨 */}
      <motion.div className={`transition-all duration-300 ${selectedProblem ? "w-2/3" : "w-full"}`}>
        <table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">문제 제목</th>
              <th className="p-3 text-left">그룹명</th>
              <th className="p-3 text-left">문제지</th>
              <th className="p-3 text-left">푼 사람 수</th>
              <th className="p-3 text-left">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.problem_id}
                  onClick={() => handleProblemClick(item)} // ✅ 행 클릭 시 문제 패널 열기
                  className={`border-t cursor-pointer transition-all duration-200 ${
                    selectedProblem?.problem_id === item.problem_id
                      ? "bg-gray-100" // ✅ 선택된 행 강조
                      : "hover:bg-gray-50"
                  }`}>
                  <td className="p-3">{item.title}</td>
                  <td className="p-3">{item.group}</td>
                  <td className="p-3">{item.paper}</td>
                  <td className="p-3">{item.solvedCount}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // ✅ 삭제 버튼 클릭 시 행 클릭 이벤트 방지

                        const isConfirmed = window.confirm("정말 삭제하시겠습니까?"); // ✅ 확인창 추가
                        if (isConfirmed) {
                          handleDeleteButtonClick(item.problem_id); // ✅ 삭제 함수 호출
                        }
                      }}
                      className="text-red-500 hover:underline">
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 p-5">
                  등록된 문제가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* ✅ 문제 패널 (표 크기가 줄어들도록 설정) */}
      {selectedProblem && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "33%", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="transition-all duration-300">
          <ProblemDetailPanel problem={selectedProblem} onClose={handleCloseDetail} />
        </motion.div>
      )}
    </motion.div>
  );
}
