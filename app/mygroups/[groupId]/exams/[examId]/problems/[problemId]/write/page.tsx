import WriteEditor from "@/components/ProblemPage/WriteEditors";

// 코드창이 줄어들었땅
export default function WritePage({
  params,
}: {
  params: { problemId: string; examId: string; groupId: string };
}) {
  return (
    <div>
      {/* 헤더 영역 */}

      <WriteEditor problemId={params.problemId} examId={params.examId} groupId={params.groupId} />
    </div>
  );
}
