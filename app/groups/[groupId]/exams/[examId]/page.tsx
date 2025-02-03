"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { problems } from "../../../../../data/problems"; // 문제 데이터 import
import { groups } from "@/data/groups";

// 문제 데이터를 트리 구조로 변환하는 함수
const buildTree = (problems: any[]) => {
  const tree: any = {};

  problems.forEach((problem) => {
    if (!tree[problem.groupId]) {
      tree[problem.groupId] = {
        name: problem.groupId,
        type: "folder",
        children: {},
      };
    }
    if (!tree[problem.groupId].children[problem.examId]) {
      tree[problem.groupId].children[problem.examId] = {
        name: problem.examName,
        type: "folder",
        children: [],
      };
    }
    tree[problem.groupId].children[problem.examId].children.push({
      name: problem.title,
      type: "file",
      problemId: problem.problemId,
    });
  });

  return Object.values(tree).map((group: any) => ({
    ...group,
    children: Object.values(group.children),
  }));
};

// 트리 노드 컴포넌트 (재귀적 렌더링)
const TreeNode = ({
  node,
  selectedProblems,
  onSelect,
  expandedNodes,
}: {
  node: any;
  selectedProblems: string[];
  onSelect: (problemId: string) => void;
  expandedNodes: Set<string>;
}) => {
  const [isOpen, setIsOpen] = useState(expandedNodes.has(node.name));
  const isSelected = selectedProblems.includes(node.problemId);

  return (
    <li
      style={{
        listStyleType: "none",
        marginLeft: node.type === "folder" ? "10px" : "25px",
      }}
    >
      {node.type === "folder" ? (
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: "pointer",
            padding: "5px",
            borderRadius: "5px",
            backgroundColor: isOpen ? "#e6e6e6" : "transparent",
          }}
        >
          {isOpen ? "📂" : "📁"} {node.name}
        </div>
      ) : (
        <div
          style={{
            padding: "5px",
            cursor: "pointer",
            backgroundColor: isSelected ? "#d1e7fd" : "transparent",
            borderRadius: "5px",
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(node.problemId)}
            style={{ marginRight: "0.5rem" }}
          />
          📄 {node.name}
        </div>
      )}

      {isOpen && node.children && (
        <ul style={{ paddingLeft: "15px" }}>
          {node.children.map((child: any, index: number) => (
            <TreeNode
              key={index}
              node={child}
              selectedProblems={selectedProblems}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// 문제 리스트 페이지
export default function ProblemsPage() {
  const { examId, groupId } = useParams() as {
    examId: string;
    groupId: string;
  };
  const group = groups.find((g) => g.groupId === groupId);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 트리 구조 데이터 생성
  const treeData = buildTree(problems);

  // 검색어가 있을 때만 해당 문제 포함하는 폴더만 유지하도록 설정
  const expandedNodes = new Set<string>();

  const searchedTreeData = searchTerm
    ? treeData
        .map((group) => {
          const filteredExams = group.children
            .map((exam: { children: any[]; name: string }) => {
              const filteredProblems = exam.children.filter((problem) =>
                problem.name.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (filteredProblems.length > 0) {
                expandedNodes.add(group.name);
                expandedNodes.add(exam.name);
              }

              return { ...exam, children: filteredProblems };
            })
            .filter(
              (exam: { children: string | any[] }) => exam.children.length > 0
            );

          return { ...group, children: filteredExams };
        })
        .filter((group) => group.children.length > 0)
    : treeData;

  // 문제 선택 핸들러
  const handleSelectProblem = (problemId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  };

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        margin: "2rem",
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          📂 문제지: {examId}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          + 문제 추가하기
        </button>
      </header>

      {/* 문제 추가 모달 */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "600px",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* 제목 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                문제 추가하기
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ fontSize: "1.2rem", cursor: "pointer" }}
              >
                ❌
              </button>
            </div>
            <hr style={{ border: "0.5px solid black" }} />

            {/* 검색창 & 정렬 */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="문제 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                }}
              />
              <select
                style={{
                  padding: "0.5rem",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                }}
              >
                <option>이름순</option>
              </select>
            </div>

            {/* 문제 선택 UI */}
            <div
              style={{
                display: "flex",
                gap: "2rem",
                height: "55vh",
                overflowY: "auto",
              }}
            >
              {/* 왼쪽: 전체 문제 목록 */}
              <div
                style={{
                  width: "50%",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "5px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                  }}
                >
                  전체 문제 목록
                </div>
                <hr style={{ border: "0.5px solid black" }} />
                <ul style={{ paddingLeft: "10px" }}>
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
              <div
                style={{
                  width: "50%",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "5px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                  }}
                >
                  선택된 문제 목록
                </div>
                <hr style={{ border: "0.5px solid black" }} />
                <ul style={{ paddingLeft: "10px" }}>
                  {selectedProblems.map((problemId) => (
                    <li
                      key={problemId}
                      style={{
                        cursor: "pointer",
                        color: "red",
                        listStyleType: "none",
                      }}
                      onClick={() => handleSelectProblem(problemId)}
                    >
                      ❌ 📄{" "}
                      {problems.find((p) => p.problemId === problemId)?.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "black",
                color: "white",
                borderRadius: "5px",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "1rem",
              }}
              onClick={() => setIsModalOpen(false)}
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
