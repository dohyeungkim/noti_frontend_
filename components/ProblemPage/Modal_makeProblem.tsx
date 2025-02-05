"use client";
import TreeNode from "./TreeNode";

interface ModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  searchedTreeData: any[];
  selectedProblems: string[];
  handleSelectProblem: (problemId: string) => void;
  expandedNodes: Set<string>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Modal = ({
  isModalOpen,
  setIsModalOpen,
  searchedTreeData,
  selectedProblems,
  handleSelectProblem,
  expandedNodes,
  searchTerm,
  setSearchTerm,
}: ModalProps) => {
  return (
    isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
          {/* 제목 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">문제 추가하기</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-600 hover:text-black text-2xl"
            >
              ❌
            </button>
          </div>
          <hr className="border-gray-400" />

          {/* 검색창 & 정렬 */}
          <div className="flex gap-4 items-center my-4">
            <input
              type="text"
              placeholder="문제 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none"
            />
            <select className="p-2 border border-gray-300 rounded-md">
              <option>이름순</option>
            </select>
          </div>

          {/* 문제 선택 UI */}
          <div className="flex gap-4 h-[55vh] overflow-y-auto">
            {/* 왼쪽: 전체 문제 목록 */}
            <div className="w-1/2 border border-gray-300 p-4 rounded-md overflow-y-auto">
              <div className="text-center text-lg font-semibold">전체 문제 목록</div>
              <hr className="border-gray-400 my-2" />
              <ul className="pl-2">
                {searchedTreeData.map((node, index) => (
                  <TreeNode
                    key={index}
                    node={node}
                    selectedProblems={selectedProblems}
                    onSelect={handleSelectProblem}
                    expandedNodes={expandedNodes}
                  />
                ))}
              </ul>
            </div>

            {/* 오른쪽: 선택된 문제 목록 */}
            <div className="w-1/2 border border-gray-300 p-4 rounded-md overflow-y-auto">
              <div className="text-center text-lg font-semibold">선택된 문제 목록</div>
              <hr className="border-gray-400 my-2" />
              <ul className="pl-2">
                {selectedProblems.map((problemId) => (
                  <li
                    key={problemId}
                    className="cursor-pointer text-red-500 flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md"
                    onClick={() => handleSelectProblem(problemId)}
                  >
                    ❌ 📄 {problemId}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button  className="mt-6 w-full bg-black text-white py-3 rounded-md text-lg cursor-pointer">
            그룹 생성하기
          </button>
        </div>
      </div>
    )
  );
};

export default Modal;
