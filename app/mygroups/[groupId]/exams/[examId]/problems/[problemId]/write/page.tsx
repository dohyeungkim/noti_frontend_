import WriteCodePageClient from "@/components/WriteCodePage/WriteCodePageClient";

export default function WriteCodePage({
  params,
}: {
  params: { groupId: string; examId: string; problemId: string };
}) {
  return (
    <div className="w-full max-w-5xl px-6">
      <WriteCodePageClient params={params}/>
    </div>
  );
}
