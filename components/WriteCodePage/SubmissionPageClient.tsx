"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import SearchBar from "@/components/ui/SearchBar";
import { useEffect, useState, useCallback } from "react";
import { solve_api } from "@/lib/api";

export default function SubmissionPageClient({ params }) {
  const { problemId } = useParams();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = useCallback(async () => {
    try {
      //문제에 대한 제출결과 다 가져온 다음에 그룹/문제지 로 필터링
      const res = await solve_api.solve_get_by_problem_id(Number(params.problemId));
      setSubmissions(res.filter((p)=> p.group_id === Number(params.groupId) && p.workbook_id === Number(params.examId)));
      console.log(res);
    } catch (error) {
      console.error("제출 내역을 불러오는 중 오류 발생:", error);
    }
  }, [params.problemId]); 

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]); 

  // ✅ 'YY.MM.DD' 형식으로 날짜 변환
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleRowClick = (solvedId: number) => {
    router.push(
      `/mygroups/${params.groupId}/exams/${params.examId}/problems/${params.problemId}/result/${solvedId}`
    );
  };

  if (!problemId) {
    return <p className="text-red-500">⚠️ 잘못된 접근입니다.</p>;
  }
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      {submissions.length === 0 ? (
        <p className="text-xl text-gray-500 text-center">제출 내역이 없습니다.</p>
      ) : (
        <div>
          <motion.div
            className="flex items-center gap-4 mb-4 w-full mt-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* 검색 바 */}
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* 정렬 버튼 */}
            {/* <SortButton onSortChange={setSortOrder} /> */}
          </motion.div>

          {/* 제출 내역 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3">제출번호</th>
                  <th className="px-4 py-3">문제id</th>
                  <th className="px-4 py-3">문제제목</th>
                  <th className="px-4 py-3">사용자</th>
                  <th className="px-4 py-3">결과</th>
                  <th className="px-4 py-3">언어</th>
                  <th className="px-4 py-3">코드길이</th>
                  <th className="px-4 py-3">제출일</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleRowClick(submission.solve_id)}
                  >
                    <td className="px-4 py-3 text-center">{submission.solve_id}</td>
                    <td className="px-4 py-3 text-center">{submission.problem_id}</td>
                    <td className="px-4 py-3 text-center">{submission.problem_name.length > 10 ? `${submission.problem_name.slice(0,10)}...` : submission.problem_name}</td>
                    <td className="px-4 py-3 text-center">{submission.user_id}</td>
                    <td
                      className={`px-4 py-3 text-center font-semibold ${
                        submission.passed === true
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {submission.passed === true? "✔ 맞았습니다": "❌ 틀렸습니다"}
                    </td>
                    <td className="px-4 py-3 text-center">{submission.code_language}</td>
                    <td className="px-4 py-3 text-center">{submission.code_len}</td>
                    <td className="px-4 py-3 text-center">{formatShortDate(submission.timestamp)}</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
