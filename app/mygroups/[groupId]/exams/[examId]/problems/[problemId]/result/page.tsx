"use client";

import { useParams } from "next/navigation";
import { submissions } from "@/data/submissions"; // ✅ 제출 데이터
import PageHeader from "@/components/Header/PageHeader";
import { motion } from "framer-motion";
import SearchBar from "@/components/Header/SearchBar";
import { useState } from "react";
import SortButton from "@/components/Header/SortButton";

export default function SubmissionPage() {
  const { problemId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("제목순");
  if (!problemId) {
    return <p>⚠️ 잘못된 접근입니다.</p>;
  }

  // ✅ 문제 ID에 해당하는 제출 내역 필터링
  const filteredSubmissions = submissions.filter(
    (submission) => submission.problemId.toString() === problemId
  );

  return (
    <motion.div
      className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader className="animate-slide-in" />

      {filteredSubmissions.length === 0 ? (
        <p className="text-xl text-gray-500">제출 내역이 없습니다.</p>
      ) : (
        <div>
          {/* <div className="text-4xl font-bold mb-6 flex items-center">
            <span className="mr-3">📂</span> 결과 보기
          </div> */}
          <motion.div
            className="flex items-center gap-4 mb-4 w-full mt-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div
              className="flex-grow min-w-0 "
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            >
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            >
              <SortButton onSortChange={setSortOrder} />
            </motion.div>
          </motion.div>

          <table className="border-collapse border border-gray-300 w-full text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">번호</th>
                <th className="border p-2">문제ID</th>
                <th className="border p-2">문제이름</th>
                <th className="border p-2">사용자</th>
                <th className="border p-2">결과</th>
                <th className="border p-2">언어</th>
                <th className="border p-2">코드길이</th>
                <th className="border p-2">제출시간 (24h)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => (
                <tr key={submission.id} className="border">
                  <td className="border p-2">
                    {filteredSubmissions.length - index}
                  </td>
                  <td className="border p-2">{submission.problemId}</td>
                  <td className="border p-2">OX 문제</td>
                  <td className="border p-2">{submission.userId}</td>
                  <td
                    className={`border p-2 font-semibold ${
                      submission.result === "Accepted"
                        ? "text-green-500"
                        : submission.result === "Wrong Answer"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {submission.result === "Accepted"
                      ? "맞았습니다"
                      : submission.result === "Wrong Answer"
                      ? "틀렸습니다"
                      : "컴파일오류"}
                  </td>
                  <td className="border p-2">{submission.language}</td>
                  <td className="border p-2">{submission.codeLength}byte</td>
                  <td className="border p-2">{submission.submissionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
