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

const Modal = ({ isModalOpen, setIsModalOpen, searchedTreeData, selectedProblems, handleSelectProblem, expandedNodes, searchTerm, setSearchTerm }: ModalProps) => {
  return (
    isModalOpen && (
      <div style={{ position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "10px", width: "600px", maxHeight: "80vh", overflow: "hidden", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
          {/* 제목 */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>문제 추가하기</h2>
            <button onClick={() => setIsModalOpen(false)} style={{ fontSize: "1.2rem", cursor: "pointer" }}>❌</button>
          </div>
          <hr style={{ border: "0.5px solid black" }} />

          {/* 검색창 & 정렬 */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
            <input type="text" placeholder="문제 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: "0.5rem", borderRadius: "5px", border: "1px solid #ddd" }} />
            <select style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ddd" }}>
              <option>이름순</option>
            </select>
          </div>

          {/* 문제 선택 UI */}
          <div style={{ display: "flex", gap: "2rem", height: "55vh", overflowY: "auto" }}>
            {/* 왼쪽: 전체 문제 목록 */}
            <div style={{ width: "50%", overflowY: "auto", border: "1px solid #ddd", padding: "1rem", borderRadius: "5px" }}>
              <div style={{ textAlign: "center", fontSize: "1.25rem", fontWeight: "bold" }}>전체 문제 목록</div>
              <hr style={{ border: "0.5px solid black" }} />
              <ul style={{ paddingLeft: "10px" }}>
                {searchedTreeData.map((node, index) => (
                  <TreeNode key={index} node={node} selectedProblems={selectedProblems} onSelect={handleSelectProblem} expandedNodes={expandedNodes} />
                ))}
              </ul>
            </div>

            {/* 오른쪽: 선택된 문제 목록 */}
            <div style={{ width: "50%", overflowY: "auto", border: "1px solid #ddd", padding: "1rem", borderRadius: "5px" }}>
              <div style={{ textAlign: "center", fontSize: "1.25rem", fontWeight: "bold" }}>선택된 문제 목록</div>
              <hr style={{ border: "0.5px solid black" }} />
              <ul style={{ paddingLeft: "10px" }}>
                {selectedProblems.map((problemId) => (
                  <li key={problemId} style={{ cursor: "pointer", color: "red", listStyleType: "none" }} onClick={() => handleSelectProblem(problemId)}>❌ 📄 {problemId}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
