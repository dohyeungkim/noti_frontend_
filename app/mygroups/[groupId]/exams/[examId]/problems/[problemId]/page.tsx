// mygroups/[groupId]/exams/[examId]/problems/[problemId]/page.tsx
import ProblemDetail from "@/components/ProblemPage/ProblemDetail";

export default function ProblemPage({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string };
}) {
  return (
    <div className="w-full max-w-5xl px-6">
      <ProblemDetail params={params} />
    </div>
  );
}
