import ResultTable from "@/components/ResultPage/ResultTable";

export default function ResultPage({ params }: { params: { problemId: string } }) {
  return <ResultTable problemId={params.problemId} />;
}
