// mygroups/[groupId]/exams/[examId]/problems/[problemId]/result/page.tsx
import ResultTable from "./ResultTable";

export default function ResultPage({ params }: { params: { problemId: string } }) {
  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <h1 className="text-2xl font-bold">제출 결과</h1>
      <ResultTable problemId={params.problemId} />
    </div>
  );
}
