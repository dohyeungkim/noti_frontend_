import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { groups } from "@/data/groups";
import { exams } from "@/data/exams";
import { problems } from "@/data/problems";

interface PageHeaderProps {
  className?: string;
}

export default function PageHeader({ className }: PageHeaderProps) {
    const { groupId, examId, problemId, id } = useParams() as {
        groupId?: string;
        examId?: string;
        problemId?: string;
        id?: string; // ✅ /my-questions/view/[id]에서 문제 ID
    };

    const pathname = usePathname(); // ✅ 현재 URL 가져오기
    const [questionTitle, setQuestionTitle] = useState<string | null>(null);

    // ✅ "내가 등록한 문제"에서 제목 가져오기
    useEffect(() => {
        if (id) {
            fetch(`http://210.115.227.15:8000/api/problems/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setQuestionTitle(data.name); // 🔹 서버에서 받은 문제 제목
                })
                .catch((error) => {
                    console.error("문제 제목 가져오기 실패:", error);
                });
        }
    }, [id]);

    // ✅ 기존 그룹/시험/문제 데이터 찾기
    const group = groups.find((g) => g.groupId === groupId);
    const exam = exams.find((e) => e.examId === examId);
    const problem = problems.find((p) => p.problemId === problemId);

    // ✅ 현재 페이지에 따라 동적 제목 설정
    let title = "🏡 서연님의 그룹들"; // 기본값

    if (pathname.startsWith("/my-questions")) {
        if (pathname === "/my-questions") title = "📌 내가 등록한 문제들";
        else if (pathname === "/my-questions/create") title = "📝 문제 등록";
        else if (pathname.startsWith("/my-questions/view/")) title = `✏️ ${questionTitle || "문제 보기"}`;
        else if (pathname.startsWith("/my-questions/edit/")) title = "🛠 문제 수정";
    } else {
        title =
            problem ? `✏️ ${problem.title}` :
            exam ? `📄 ${exam.name}` :
            group ? `📚 ${group.name}` :
            "🏡 서연님의 그룹들";
    }

    return (
        <header className={`flex flex-col items-start w-full mb-6 ${className || ""}`}>
            {/* 🔹 Breadcrumb (경로 표시) */}
            <nav className="text-gray-500 text-sm mb-2">
                <Link href="/" className="hover:underline">🏠 홈</Link>
                {pathname.startsWith("/my-questions") && (
                    <>
                        {" > "}
                        <Link href="/my-questions" className="hover:underline">📌 내가 등록한 문제들</Link>
                        {pathname.startsWith("/my-questions/view/") && ` > ✏️ ${questionTitle || "문제 보기"}`}
                        {pathname.startsWith("/my-questions/edit/") && " > 🛠 문제 수정"}
                        {pathname === "/my-questions/create" && " > 📝 문제 등록"}
                    </>
                )}
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
