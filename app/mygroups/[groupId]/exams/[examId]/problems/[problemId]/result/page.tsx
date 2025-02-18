// mygroups/[groupId]/exams/[examId]/problems/[problemId]/result/page.tsx
import ResultTable from "./ResultTable";

export default function ResultPage({ params }: { params: { problemId: string } }) {
  return (
      <ResultTable problemId={params.problemId} />
  );
}
