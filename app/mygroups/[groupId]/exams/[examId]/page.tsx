import ExamDetail from "@/components/ProblemPage/ProblemStructure";

export default function ExamPage({ params }: { params: { groupId: string; examId: string } }) {
  return <ExamDetail params={params} />;
}
