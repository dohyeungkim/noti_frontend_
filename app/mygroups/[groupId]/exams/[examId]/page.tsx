import ProblemStructure from "@/components/ProblemPage/ProblemStructure";

export default function ExamPage({ params }: { params: { groupId: string; examId: string } }) {
  return <ProblemStructure params={params} />;
}
