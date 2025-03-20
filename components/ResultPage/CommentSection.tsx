import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { auth_api, comment_api } from "@/lib/api";
import { UserIcon } from "lucide-react";
import { formatTimestamp } from "../util/dageUtils";

// 댓글 타입 정의
interface Comment {
  user_id: string;
  problem_id: number;
  solve_id: number;
  comment: string;
  is_anonymous: boolean;
  nickname: string;
  is_problem_message: boolean;
  timestamp?: string;
}

interface CommentSectionProps {
  params: {
    groupId: string;
    examId: string;
    problemId: string;
    resultId: string;
  };
}


const CommentSection = ({ params }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentComment, setCurrentComment] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [commentViewType, setCommentViewType] = useState<"problem" | "submission">("submission");
  const [userId, setUserId] = useState<string>("");

  // ✅ 댓글 가져오기
  const fetchComments = useCallback(async () => {
    try {
      const data =
        commentViewType === "problem"
          ? await comment_api.comments_get_by_problem_id(Number(params.problemId))
          : await comment_api.comments_get_by_solve_id(Number(params.resultId));

      setComments(data);
    } catch (error) {
      console.error(`코멘트 불러오기 오류: ${error}`);
    }
  }, [commentViewType, params.problemId, params.resultId]);

  // ✅ 사용자 정보 가져오기
  const fetchUserId = useCallback(async () => {
    try {
      const user = await auth_api.getUser();
      if (user.user_id !== userId) setUserId(user.user_id);
    } catch (error) {
      console.error("사용자 아이디 불러오기 실패:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  // ✅ 댓글 전송 핸들러
  const handleSubmit = async () => {
    if (!currentComment.trim()) return alert("댓글을 입력하세요.");

    try {
      const newComment: Comment = {
        user_id: userId,
        problem_id: Number(params.problemId),
        solve_id: Number(params.resultId),
        comment: currentComment,
        is_anonymous: isAnonymous,
        nickname: "익명",
        is_problem_message: commentViewType === "problem",
      };

      await comment_api.comment_create(
        userId,
        Number(params.problemId),
        Number(params.resultId),
        currentComment,
        isAnonymous,
        "익명",
        commentViewType === "problem"
      );

      setComments((prev) => [...prev, newComment]);
      setCurrentComment("");
    } catch (error) {
      console.error("코멘트 생성 오류:", error);
    }
  };

  // 🔹 긴 문자열을 10자 단위로 줄 바꿈하는 함수
  const formatCommentWithLineBreaks = (comment: string, maxLength: number = 10) => {
    return comment.split("").reduce((acc, char, idx) => {
      if (idx > 0 && idx % maxLength === 0) acc += "\n"; // 10자마다 줄 바꿈 추가
      return acc + char;
    }, "");
  };

  return (
    <div className="mr-10 mb-10">
      {/* 🔹 댓글 보기 전환 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex overflow-hidden shadow-sm">
          <button
            onClick={() => setCommentViewType("submission")}
            className={`px-6 py-2 rounded-tl-lg transition ${
              commentViewType === "submission"
                ? "bg-white text-gray-900"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            제출별 보기
          </button>
          <button
            onClick={() => setCommentViewType("problem")}
            className={`px-6 py-2 rounded-tr-lg transition ${
              commentViewType === "problem" ? "bg-white text-gray-900" : "bg-gray-300 text-gray-500"
            }`}
          >
            문제별 보기
          </button>
        </div>
      </div>

      {/* 🔹 댓글 박스 */}
      <div className="shadow rounded-lg p-4 bg-white h-[66vh] flex flex-col">
        {/* 🔹 제목 + 구분선 (상단 고정) */}
        <div className="flex-shrink-0">
          <h3 className="font-semibold text-gray-900 mb-2">
            {commentViewType === "problem"
              ? `📝 ${params.problemId} 문제의 댓글`
              : `💬 ${userId}님의 코드 댓글`}
          </h3>
          <div className="h-[2px] bg-gray-300 w-full mb-3 mt-3"></div>
        </div>

        {/* 🔹 댓글 리스트 (여기만 스크롤) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500">아직 댓글이 없습니다.</p>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg"
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                {/* 🔹 프로필 아이콘 */}
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>

                {/* 🔹 댓글 내용 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <strong className="text-gray-900">
                      {comment.is_anonymous ? comment.nickname : comment.user_id}
                    </strong>
                    <span className="text-xs text-gray-600">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>

                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                    {formatCommentWithLineBreaks(comment.comment, 10)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* 🔹 댓글 입력창 (하단 고정) */}
        <div className="flex-shrink-0 flex items-center gap-2 p-3 bg-gray-100 rounded-xl mt-3 shadow-sm">
          {/* 🔸 익명 체크박스 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 appearance-none border border-gray-400 rounded-md checked:bg-mygreen checked:border-mygreen checked:text-white focus:ring-2 focus:ring-mygreen transition flex items-center justify-center"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
            />
            <span className="text-sm text-gray-700">익명</span>
          </label>

          {/* 🔸 댓글 입력 필드 */}
          <div className="flex-1 flex items-center bg-white rounded-lg border border-gray-300">
            <textarea
              placeholder="댓글을 입력해 주세요.."
              className="w-full h-12 resize-none border-none focus:outline-none p-2 rounded-lg"
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
            />

            {/* 🔸 전송 버튼 */}
            <button
              onClick={handleSubmit}
              className="p-3 text-gray-700 hover:text-gray-900 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22 11 13 2 9z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
