"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { groups } from "@/data/groups";
import { exams } from "@/data/exams";
import { problems } from "@/data/problems";
import { solvedProblems } from "@/data/solvedProblems";

interface PageHeaderProps {
  className?: string;
}

export default function PageHeader({ className }: PageHeaderProps) {
  const { groupId, examId, problemId, id, recordId } = useParams() as {
    groupId?: string;
    examId?: string;
    problemId?: string;
    id?: string; // ✅ /registered-problems/view/[id]에서 문제 ID
    recordId?: string;
  };

  const pathname = usePathname(); // ✅ 현재 URL 가져오기
  const [questionTitle, setQuestionTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ "내가 등록한 문제"에서 제목 가져오기
  useEffect(() => {
    if (!id) return;

    setLoading(true); // 🔹 로딩 시작
    fetch(`http://210.115.227.15:8000/api/problems/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("서버 응답 오류!");
        return res.json();
      })
      .then((data) => {
        setQuestionTitle(data.name || "제목 없음"); // 🔹 기본값 처리
      })
      .catch((error) => {
        console.error("문제 제목 가져오기 실패:", error);
        setQuestionTitle("제목 불러오기 실패");
      })
      .finally(() => {
        setLoading(false); // 🔹 로딩 완료
      });
  }, [id]);

  // ✅ 기존 그룹/시험/문제 데이터 찾기
  const group = groups.find((g) => g.group_id === groupId);
  const exam = exams.find((e) => e.examId === examId);
  const problem = problems.find((p) => p.problemId === problemId);

  // ✅ 현재 페이지에 따라 동적 제목 설정
  let title = "🏡 나의 페이지"; // 기본값

  if (pathname.startsWith("/registered-problems")) {
    if (pathname === "/registered-problems") title = "📌 내가 등록한 문제들";
    else if (pathname === "/registered-problems/create")
      title = "📝 문제 등록하기";
    else if (pathname.startsWith("/registered-problems/view/"))
      title = loading ? "⏳ 로딩 중..." : `✏️ ${questionTitle || "문제 보기"}`;
    else if (pathname.startsWith("/registered-problems/edit/"))
      title = "🛠 문제 수정";
  } else if (pathname.startsWith("/mypage")) {
    title = "🚀 서연님의 페이지";
  } else if (pathname.startsWith("/solved-problems")) {
    title = "🔥 내가 푼 문제 모음";
  } else if (pathname.startsWith("/feedback")) {
    title = "📖 피드백 보기";
  } else {
    if (pathname.endsWith("/result")) {
      title = "✔️ 채점 결과";
    } else if (pathname.endsWith("/write")) {
      title = "✔️ 문제 풀기";
    } else {
      title = problem
        ? `✏️ ${problem.title}`
        : exam
        ? `📄 ${exam.name}`
        : group
        ? `📚 ${group.group_name}`
        : "🏡 서연님의 그룹";
    }
  }

  return (
    <header
      className={`flex flex-col items-start w-full mb-6 ${className || ""}`}
    >
      {/* 🔹 Breadcrumb (경로 표시) */}
      <nav className="text-gray-500 text-sm mb-2">
        {/* ✅ 내가 푼 문제 모음 */}
        {/* ✅ 그룹 > 시험 > 문제 경로 추가 */}
        {pathname.startsWith("/mygroups") && (
          <>
            <Link href={"/mygroups"} className="hover:underline">
              🏡 나의 그룹
            </Link>
          </>
        )}
        {group && (
          <>
            {" > "}
            <Link href={`/mygroups/${groupId}`} className="hover:underline">
              📚 {group.group_name}
            </Link>
          </>
        )}
        {exam && (
          <>
            {" > "}
            <Link
              href={`/mygroups/${groupId}/exams/${exam.examId}`}
              className="hover:underline"
            >
              📄 {exam.name}
            </Link>
          </>
        )}
        {problem && (
          <>
            {" > "}
            <Link
              href={`/mygroups/${groupId}/exams/${examId}/problems/${problem.problemId}`}
              className="hover:underline"
            >
              ✏️ {problem.title}
            </Link>
          </>
        )}
        {pathname.includes("/write") && problem?.problemId && (
          <>
            {" > "}
            <Link
              href={`/mygroups/${groupId}/exams/${examId}/problems/${problem.problemId}/write`}
              className="hover:underline"
            >
              🖍️ 문제 풀기
            </Link>
          </>
        )}
        {pathname.includes("/result") && problem?.problemId && (
          <>
            {" > "}
            <Link
              href={`/mygroups/${groupId}/exams/${examId}/problems/${problem.problemId}/result`}
              className="hover:underline"
            >
              📊 전체 채점 결과
            </Link>
          </>
        )}
        {pathname.includes("/write") &&
          pathname.includes("/result") &&
          problem?.problemId &&
          recordId && (
            <>
              {" > "}
              <Link
                href={`/mygroups/${groupId}/exams/${examId}/problems/${problem.problemId}/write/${recordId}/result`}
                className="hover:underline"
              >
                ✔️ 개인 채점 결과
              </Link>
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
