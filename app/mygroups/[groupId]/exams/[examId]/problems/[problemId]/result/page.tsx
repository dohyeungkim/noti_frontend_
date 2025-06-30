import SubmissionPageClient from "@/components/WriteCodePage/SubmissionPageClient";

export default function SubmissionPage({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string };
}) {
  return (
    <div className="w-full max-w-5xl px-6">
      <SubmissionPageClient params={params}/>
    </div>
  );
}
