import FeedbackWithSubmissionPageClient from "@/components/ResultPage/ResultPageClient";

export default function FeedbackWithSubmissionPage({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string; resultId: string};
}) {
  return (
    <div className="w-full max-w-5xl px-6">
      <FeedbackWithSubmissionPageClient params={params}/>
    </div>
  );
}
