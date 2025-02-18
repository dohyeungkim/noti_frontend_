// mygroups/[groupId]/exams/[examId]/page.tsx
import PageHeader from "@/components/layout/PageHeader";
import ExamDetail from "./problemsDetail";

export default function ExamPage({ params }: { params: { groupId: string; examId: string } }) {
  return (
   

      <ExamDetail params={params} />
  );
}
