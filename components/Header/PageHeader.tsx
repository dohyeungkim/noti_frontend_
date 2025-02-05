import { useParams } from "next/navigation";
import Link from "next/link";
import { groups } from "@/data/groups";
import { exams } from "@/data/exams";
import { problems } from "@/data/problems";

interface PageHeaderProps {
  className?: string;
}

export default function PageHeader({ className }: PageHeaderProps) {
  const { groupId, examId, problemId } = useParams() as {
    groupId?: string;
    examId?: string;
    problemId?: string;
  };

  // ✅ ID를 이용해 실제 이름 찾기
  const group = groups.find((g) => g.groupId === groupId);
  const exam = exams.find((e) => e.examId === examId);
  const problem = problems.find((p) => p.problemId === problemId);

  // ✅ Breadcrumb 구성 (이모티콘 추가)
  const breadcrumb = [
    { label: "🏡 서연님의 그룹들", href: "/groups" },
    group ? { label: `📚 ${group.name}`, href: `/groups/${groupId}` } : null,
    exam ? { label: `📄 ${exam.name}`, href: `/groups/${groupId}/exams/${examId}` } : null,
    problem ? { label: `✏️ ${problem.title}`, href: `/groups/${groupId}/exams/${examId}/problems/${problemId}` } : null,
  ].filter((item): item is { label: string; href: string } => item !== null);

  // ✅ title을 동적으로 설정 (이모티콘 추가)
  const title =
    problem ? `✏️ ${problem.title}` :
    exam ? `📄 ${exam.name}` :
    group ? `📚 ${group.name}` :
    "🏡 서연님의 그룹들";

  return (
    <header className={`flex flex-col items-start w-full mb-6 ${className || ""}`}>
      {/* 🔹 Breadcrumb (경로 표시) */}
      <nav className="text-gray-500 text-sm mb-2">
        {breadcrumb.map((item, index) => (
          <span key={index}>
            {index > 0 && " > "}
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          </span>
        ))}
      </nav>

      {/* 🔹 페이지 제목 (자동 설정 + 이모티콘 추가) */}
      <h1
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 
        font-bold flex justify-start items-start gap-2  
        sm:pt-4 md:pt-6 lg:pt-8 xl:pt-10"
      >
        {title}
      </h1>
    </header>
  );
}
