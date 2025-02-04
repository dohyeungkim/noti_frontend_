"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import ProblemList from "@/components/ProblemPage/ProblemList";
import Modal from "@/components/ProblemPage/Modal_makeProblem";
import { problems } from "@/data/problems";
import { groups } from "@/data/groups";
import { testExams } from "@/data/testmode";


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

export default function ProblemsPage() {
  const { examId, groupId } = useParams() as { examId: string; groupId: string };
  const group = groups.find((g) => g.groupId === groupId);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const isTestMode = (examId: string) => testExams.some((test: { examId: string; }) => test.examId === examId);
  

  // 현재 문제 필터링
  const filteredProblems = problems.filter((problem) => problem.examId === examId);

  // 트리 구조 데이터 생성
  const treeData = buildTree(problems);

  // 검색 시 자동으로 펼쳐질 노드 저장
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
            .filter((exam: { children: any[] }) => exam.children.length > 0);

          return { ...group, children: filteredExams };
        })
        .filter((group) => group.children.length > 0)
    : treeData;

  // 문제 선택 핸들러 (여러 개 선택 가능)
  const handleSelectProblem = (problemId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId]
    );
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9f9f9", minHeight: "100vh", margin: "2rem" }}>
      {/* 헤더 */}
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "1rem" }}>📂 문제지: {examId}</h1>
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

      {/* ✅ 일반 페이지 문제 리스트 */}
      <ProblemList problems={filteredProblems} groupId={groupId} examId={examId} handleSelectProblem={handleSelectProblem} />

      {/* 문제 추가 모달 */}
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        searchedTreeData={searchedTreeData}
        selectedProblems={selectedProblems}
        handleSelectProblem={handleSelectProblem}
        expandedNodes={expandedNodes}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
}
