// mygroups/[groupId]/exams/[examId]/problems/[problemId]/write/page.tsx
import PageHeader from "@/components/Header/PageHeader";
import WriteEditor from "./WriteEditors"; // ✅ 현재 폴더 안에 있는 경우


// 코드창이 줄어들었땅
export default function WritePage({ params }: { params: { problemId: string; examId: string; groupId: string } }) {
  return (
    <div  className="bg-[#f9f9f9] h-screen overflow-hidden flex flex-col ml-[3.8rem] p-8 pb-20">
    {/* 헤더 영역 */}
    <PageHeader />
      <WriteEditor problemId={params.problemId} examId={params.examId} groupId={params.groupId} />
    </div>
  );
}
