"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useMemo } from "react";
import { solve_api } from "@/lib/api";

// ✅ 제출 데이터 타입 정의
interface BaseSubmission {
  problemType: "코딩" | "디버깅" | "객관식" | "단답형" | "주관식";
  id: number;
  solve_id: number;
  problem_id: number;
  problem_name: string;
  user_id: string;
  passed: boolean;
  code_language: string;
  code_len: number;
  timestamp: string;
  group_id: number;
  workbook_id: number;
}

type CodingSubmission = BaseSubmission & {
  problemType: "코딩" | "디버깅";
  code_language: string;
  code_len: number;
};

type NonCodeSubmission = BaseSubmission & {
  problemType: "객관식" | "단답형" | "주관식";
};

type Submission = CodingSubmission | NonCodeSubmission;

// ✅ URL Params 타입 정의
interface SubmissionPageParams {
  groupId: string;
  examId: string;
  problemId: string;
}

// ✅ Props 타입 정의
interface SubmissionPageClientProps {
  params: SubmissionPageParams;
}

export default function SubmissionPageClient({
  params,
}: SubmissionPageClientProps) {
  const router = useRouter();

  // ❗ useParams() 제거하고, 부모에서 받은 params만 사용
  const groupIdNum = useMemo(() => Number(params.groupId), [params.groupId]);
  const examIdNum = useMemo(() => Number(params.examId), [params.examId]);
  const problemIdNum = useMemo(
    () => Number(params.problemId),
    [params.problemId]
  );

  // ✅ 검색 필드 상태
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchUser, setSearchUser] = useState<string>("");
  const [searchProblemId, setSearchProblemId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ 제출 내역 불러오기 (검색 적용)
  const fetchSubmissions = useCallback(async () => {
    // ❗ 숫자 파싱 실패하면 호출 안 함
    if (
      Number.isNaN(problemIdNum) ||
      Number.isNaN(groupIdNum) ||
      Number.isNaN(examIdNum)
    ) {
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      let res: Submission[] = await solve_api.solve_get_by_problem_ref_id(
        groupIdNum,
        examIdNum,
        problemIdNum
      );

      // ✅ 검색 필터 안전 적용 (undefined 대비)
      const titleQ = (searchTitle ?? "").trim();
      const userQ = (searchUser ?? "").trim();
      const pidQ = (searchProblemId ?? "").trim();

      res = res.filter((p) => {
        const okTitle = titleQ ? (p.problem_name ?? "").includes(titleQ) : true;
        const okUser = userQ ? (p.user_id ?? "").includes(userQ) : true;
        const okPid = pidQ ? String(p.problem_id) === pidQ : true;
        const okGroup = p.group_id === groupIdNum;
        const okWb = p.workbook_id === examIdNum;
        return okTitle && okUser && okPid && okGroup && okWb;
      });

      // ✅ 시간, 제출 id 내림차순 정렬
      res.sort((a, b) => {
        const t1 =
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (t1 !== 0) return t1;
        return b.id - a.id;
      });

      setSubmissions(res);
    } catch (error: any) {
      console.error("제출 내역을 불러오는 중 오류 발생:", error);
      setErrorMsg(error?.message || "제출 내역을 불러오는 데 실패했어.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [
    problemIdNum,
    groupIdNum,
    examIdNum,
    searchTitle,
    searchUser,
    searchProblemId,
  ]);

  // ✅ 페이지 로드시 + 검색 조건 변경 시
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // ✅ 검색 버튼 클릭
  const handleSearch = () => {
    fetchSubmissions();
  };

  // ✅ 날짜 변환 함수
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ 테이블 행 클릭 시 이동
  const handleRowClick = (solvedId: number) => {
    router.push(
      `/mygroups/${params.groupId}/exams/${params.examId}/problems/${params.problemId}/result/${solvedId}`
    );
  };

  // ❗ route param 자체가 비정상일 때 안내
  if (
    !params.problemId ||
    Number.isNaN(problemIdNum) ||
    !params.groupId ||
    Number.isNaN(groupIdNum) ||
    !params.examId ||
    Number.isNaN(examIdNum)
  ) {
    return (
      <p className="text-red-500">⚠️ 잘못된 접근입니다. (경로 파라미터 오류)</p>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4 items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* ✅ 검색창 UI */}
      <motion.div
        className="flex flex-wrap gap-2 md:gap-4 justify-center w-full max-w-2xl p-4 mt-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* 문제 제목 입력 */}
        <input
          type="text"
          placeholder="문제 제목"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="flex-1 min-w-[150px] border border-gray-300 text-center p-1 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none transition text-gray-700"
        />

        {/* 사용자 입력 */}
        <input
          type="text"
          placeholder="사용자"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="flex-1 min-w-[150px] border border-gray-300 text-center p-1 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none transition text-gray-700"
        />

        {/* 문제 ID 입력 */}
        <input
          type="text"
          placeholder="문제 ID"
          value={searchProblemId}
          onChange={(e) => setSearchProblemId(e.target.value)}
          className="flex-1 min-w-[150px] border border-gray-300 text-center p-1 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none transition text-gray-700"
        />

        {/* 검색 버튼 */}
        <button
          onClick={handleSearch}
          className="px-8 py-1 bg-mygreen text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
        >
          검색하기
        </button>
      </motion.div>

      <div className="w-full flex justify-center items-center border-t-2 border-gray-200 " />

      {/* 에러/로딩/결과 */}
      {errorMsg ? (
        <p className="text-red-500 text-center w-full">{errorMsg}</p>
      ) : loading ? (
        <p className="text-gray-500 text-center w-full">로딩 중…</p>
      ) : submissions.length === 0 ? (
        <p className="text-xl text-gray-500 text-center w-full">
          제출 내역이 없습니다.
        </p>
      ) : (
        <div className="w-full flex justify-center">
          {/* ✅ 제출 내역 테이블 */}
          <div className="overflow-x-auto w-full max-w-5xl">
            <table className="w-full border-collapse rounded-lg shadow-md overflow-hidden mx-auto">
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
                    className="border-b hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => handleRowClick(submission.solve_id)}
                  >
                    <td className="px-4 py-3 text-center">
                      {submission.solve_id}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {submission.problem_id}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(submission.problem_name ?? "").length > 20
                        ? `${(submission.problem_name ?? "").slice(0, 20)}...`
                        : submission.problem_name ?? ""}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {submission.user_id ?? ""}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-semibold ${
                        submission.passed ? "text-mygreen" : "text-mydelete"
                      }`}
                    >
                      {submission.passed ? "✔ 맞았습니다" : "❌ 틀렸습니다"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {submission.code_language ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof submission.code_len === "number"
                        ? submission.code_len
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {formatShortDate(submission.timestamp)}
                    </td>
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
