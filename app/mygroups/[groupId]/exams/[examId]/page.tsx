// mygroups/[groupId]/exams/[examId]/page.tsx
import PageHeader from "@/components/Header/PageHeader";
import ExamDetail from "./problemsDetail";

export default function ExamPage({ params }: { params: { groupId: string; examId: string } }) {
  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
            <PageHeader />

      <ExamDetail params={params} />
    </div>
  );
}
