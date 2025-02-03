"use client";
import { useRouter } from "next/navigation";

interface ProblemListProps {
  problems: any[];
  groupId: string;
  examId: string;
  handleSelectProblem: (problemId: string) => void;
}

const ProblemList = ({ problems, groupId, examId, handleSelectProblem }: ProblemListProps) => {
  const router = useRouter();

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
      {problems.map((problem) => (
        <div key={problem.problemId} className="problem-card" style={{ backgroundColor: "white", border: "1px solid #ddd", borderRadius: "10px", padding: "1.5rem", cursor: "pointer", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", transition: "transform 0.2s" }}
          onClick={() => handleSelectProblem(problem.problemId)}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{problem.title}</h2>
          <p style={{ margin: "0.5rem 0", color: "#555" }}>{problem.description}</p>
          <button onClick={() => router.push(`/groups/${groupId}/exams/${examId}/problems/${problem.problemId}`)}
            style={{ marginTop: "1rem", padding: "0.5rem", backgroundColor: "black", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%", textAlign: "center", fontSize: "1rem" }}>
            풀기
          </button>
        </div>
      ))}
    </section>
  );
};

export default ProblemList;
