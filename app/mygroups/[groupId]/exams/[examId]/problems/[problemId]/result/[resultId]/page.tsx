import FeedbackWithSubmissionPageClient from "@/components/ResultPage/ResultPageClient";

export default function FeedbackWithSubmissionPage({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string; resultId: string};
}) {
  return (
    <div >
      <FeedbackWithSubmissionPageClient params={params}/>
    </div>
  );
}
