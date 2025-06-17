import WriteCodePageClient from "@/components/WriteCodePage/WriteCodePageClient";

export default function WriteCodePage({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string };
}) {
  return (
    <div className="w-full max-w-full">
      <WriteCodePageClient params={params}/>
    </div>
  );
}
