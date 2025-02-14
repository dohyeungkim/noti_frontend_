"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/Header/PageHeader";

// 데이터 임포트 (data 폴더의 groups, problems 사용)
import { groups } from "@/data/groups";
import { problems } from "@/data/problems";
// 시험 모드 관련 데이터 (테스트 모드일 경우 복사/붙여넣기 제한)
import { testExams } from "@/data/testmode";
// 만약 exams 데이터가 있다면 임포트 (사용하지 않으셔도 무방합니다)
//import { exams } from "@/data/exams";
// 피드백 데이터 (Feedback 타입 포함)
import { feedbackData, Feedback } from "@/data/feedbackdata";

import { problemStatus } from "@/data/problemstatus";
//import { span } from "framer-motion/client";

export default function FeedbackWithSubmissionPage() {
  // URL 파라미터 추출 (예: /mygroups/:groupId/exams/:examId/problems/:problemId)
  const params = useParams() as {
    groupId?: string;
    examId?: string;
    problemId?: string;
    id?: string;
  };

  // groupId, examId는 그대로 사용하고, 문제 ID는 problemId 또는 id 둘 중 하나로 사용
  const groupId = params.groupId;
  const examId = params.examId;
  const problemId = params.problemId || params.id;

  const router = useRouter();

  // 제출 영역 관련 상태
  //const [isExpanded, setIsExpanded] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");

  // 문제 데이터 찾기 (문제 배열에서 problemId와 examId가 일치하는 문제)
  const problem = problems.find((p) => p.problemId === problemId);

  // (선택사항) exam 데이터가 있다면 찾기
  //const exam = exams?.find((e) => e.examId === examId);

  // 문제의 그룹 정보 (문제 데이터의 groupId를 사용하여 groups 배열에서 찾음)
  const group = groups.find((g) => g.groupId === problem?.groupId);

  // 테스트 모드 여부 (testExams 데이터에 examId가 존재하면 테스트 모드로 간주)
  const isTestMode = testExams?.some((test) => test.examId === examId);

  // 현재 문제의 상태를 problemStatus에서 가져옵니다.
  const currentStatus = problem ? problemStatus[problem.problemId] : "defaultStatus";

  // 제출 버튼 클릭 시 결과 페이지로 이동 (URL 경로는 실제 라우팅에 맞게 수정)
  const handleSubmit = () => {
    console.log(
      "📌 이동할 경로:",
      `/mygroups/${groupId}/exams/${examId}/problems/${problemId}/result`
    );
    if (!groupId || !examId || !problemId) {
      console.error("❌ 오류: 필요한 값이 없습니다!", {
        groupId,
        examId,
        problemId,
      });
      return;
    }
    router.push(
      `/mygroups/${groupId}/exams/${examId}/problems/${problemId}/result`
    );
  };

  // 피드백 데이터 상태 설정 (Feedback 타입 명시)
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    console.log("📌 현재 문제 ID:", problemId);
    console.log("📌 사용 가능한 피드백 키:", Object.keys(feedbackData));
    if (problemId && feedbackData[problemId as keyof typeof feedbackData]) {
      setFeedback(feedbackData[problemId as keyof typeof feedbackData]);
    }
  }, [problemId]);

  // 문제를 찾지 못한 경우 에러 메시지 렌더링
  if (!problem) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">문제를 찾을 수 없습니다</h1>
        <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 공통 헤더 영역 */}
      <PageHeader />

      {/* 제출 영역 (피드백 영역 바로 위에 위치) */}
      <div className="bg-[#f9f9f9]  flex flex-col pb-10 my-8 rounded-lg">
        {/* 제출 버튼 */}
        <div className="flex justify-end mt-4">
          
        </div>
        <motion.h2
        className="text-2xl font-bold mb-4 m-2 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {problem.examName}
      </motion.h2>
      <motion.hr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />

        {/* 문제 상태 영역: 코드 작성 영역 바로 위 */}
        <div className="mt-5">
          <span
            className={`text-sm font-bold ${
              currentStatus === "맞음"
                ? "text-green-600"
                : currentStatus === "틀림"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {currentStatus === "맞음"
              ? "🟢 맞았습니다"
              : currentStatus === "틀림"
              ? "🔴 틀렸습니다"
              : "🟡 푸는 중"}
          </span>
        </div>
        {/* 메인 컨텐츠 영역: 코드 작성 영역과 문제 정보 */}
        <div className="flex flex-col md:flex-row space-x-0 md:space-x-6 gap-6">
  {/* 코드 보기 영역 */}
  <div className="flex-1 flex flex-col">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold">코드 보기</h2>
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">언어:</span>
        <span className="ml-2 font-semibold">{language}</span> {/* 고정된 언어 표시 */}

      </div>
    </div>
    <div className="border-b-2 border-gray-300 my-2"></div>
    <div className="flex-1 border rounded-lg p-3 font-mono text-sm overflow-auto bg-gray-100">
      <pre className="w-full h-full">{code || "코드가 없습니다."}</pre>
    </div>
  </div>

  {/* 애니메이션 처리된 문제 정보 영역 */}
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex-1 overflow-hidden pl-4"
    >
      <h2 className="text-lg font-semibold pb-2">문제</h2>
      <div className="border-b-2 border-gray-300 my-2"></div>
      <p className="text-gray-600">{problem.description}</p>

      {/* 입력 & 출력 예시 */}
      <div className="flex space-x-4 mt-4">
        <div className="flex-1">
          <h2 className="mt-4 font-semibold">입력</h2>
          <div className="border-b-2 border-gray-300 my-2"></div>
          <pre className="bg-gray-100 p-3 rounded-lg overflow-auto max-h-[200px]">
            {problem.input}
          </pre>
        </div>
        <div className="flex-1">
          <h2 className="mt-4 font-semibold">출력</h2>
          <div className="border-b-2 border-gray-300 my-2"></div>
          <pre className="bg-gray-100 p-3 rounded-lg overflow-auto max-h-[200px]">
            {problem.output}
          </pre>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</div>

      </div>

      {/* 피드백 영역 */}
      {feedback ? (
        <>
          {/* ✅ 정답 */}
          <div className="p-4 border rounded-lg bg-green-100">
            <h2 className="text-xl font-semibold">✅ 정답</h2>
            <p>{feedback.correctAnswer}</p>
          </div>

          {/* 👍 잘한 점 */}
          <div className="p-4 border rounded-lg bg-blue-100 mt-4">
            <h2 className="text-xl font-semibold">👍 잘한 점</h2>
            <p>{feedback.goodPoints}</p>
          </div>

          {/* 🔥 개선할 점 */}
          <div className="p-4 border rounded-lg bg-yellow-100 mt-4">
            <h2 className="text-xl font-semibold">🔥 개선할 점</h2>
            <p>{feedback.improvementPoints}</p>
          </div>

          {/* ❌ 비슷한 오답 */}
          <div className="p-4 border rounded-lg bg-red-100 mt-4">
            <h2 className="text-xl font-semibold">❌ 비슷한 오답</h2>
            <ul>
              {feedback.similarMistakes.map((mistake, index) => (
                <li key={index}>- {mistake}</li>
              ))}
            </ul>
          </div>

          {/* 💬 토론 & 댓글 */}
          <div className="p-4 pb-2 border rounded-lg bg-gray-100 mt-4">
            <h2 className="text-xl font-semibold">💬 토론 & 댓글</h2>
            <ul>
              {feedback.comments.map((comment, index) => (
                <li key={index} className="border-b py-2">
                  <strong>{comment.user}</strong>: {comment.text}
                </li>
              ))}
            </ul>
            <textarea
              placeholder="댓글을 입력해 주세요."
              className="mt-4 w-full h-20 border border-gray-300 p-2 rounded-lg resize-none"
            ></textarea>
            <div className="flex justify-end mt-2">
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center bg-black text-white px-7 py-1 rounded-xl m-2 text-md cursor-pointer
                       hover:bg-gray-500 transition-all duration-200 ease-in-out active:scale-95"
              >
                등록
              </motion.button>
            </div>
          </div>
        </>
      ) : (
        <p>⚠️ 해당 문제의 피드백이 없습니다.</p>
      )}
    </motion.div>
  );
}
