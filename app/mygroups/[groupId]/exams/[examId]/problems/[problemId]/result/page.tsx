import SubmissionPageClient from "@/components/WriteCodePage/SubmissionPageClient";
//크기 살짝조정함 250929진형준
export default function SubmissionPage({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string };
}) {
  return (
    <div className="w-full max-w-6xl px-6"> 
      <SubmissionPageClient params={params}/>
    </div>
  );
}
