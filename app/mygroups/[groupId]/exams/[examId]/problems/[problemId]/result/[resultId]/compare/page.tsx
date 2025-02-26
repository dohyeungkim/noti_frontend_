import CodeComparisonClient from "@/components/CompareCode/ComparePageClient";

export default function CodeComparison({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string; resultId: string};
}) {
  return (
    <div className="w-full max-w-5xl px-6">
      <CodeComparisonClient params={params}/>
    </div>
  );
}
