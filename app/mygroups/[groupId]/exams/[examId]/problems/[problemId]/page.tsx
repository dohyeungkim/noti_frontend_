// mygroups/[groupId]/exams/[examId]/problems/[problemId]/page.tsx
import PageHeader from "@/components/Header/PageHeader";
import ProblemDetail from "./ProblemDetail";

export default function ProblemPage({ params }: { params: { groupId: string; examId: string; problemId: string } }) {
  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8 flex justify-center">
      <div className="w-full max-w-5xl px-6">
      <PageHeader />

        <ProblemDetail params={params} />
      </div>
    </div>
  );
}
