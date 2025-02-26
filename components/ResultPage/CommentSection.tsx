import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { auth_api, comment_api } from "@/lib/api";
import { UserIcon } from "lucide-react";
// import { IoIosSend } from "react-icons/io";

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
  const [commentViewType, setCommentViewType] = useState<
    "problem" | "submission"
  >("submission");
  const [userId, setUserId] = useState<string>("");

  // ✅ 댓글 가져오기 (useCallback 적용)
  const fetchComments = useCallback(async () => {
    try {
      let data;
      if (commentViewType === "problem") {
        data = await comment_api.comments_get_by_problem_id(
          Number(params.problemId)
        );
      } else {
        data = await comment_api.comments_get_by_solve_id(
          Number(params.resultId)
        );
      }
      setComments(data);
    } catch (error) {
      console.error(`코멘트 불러오기 오류: ${error}`);
    }
  }, [commentViewType, params.problemId, params.resultId]); // ✅ params 값도 의존성 배열에 추가

  // ✅ 사용자 정보 가져오기 (최적화 적용)
  const fetchUserId = useCallback(async () => {
    try {
      const user = await auth_api.getUser();
      if (user.user_id !== userId) {
        // ✅ 동일한 userId라면 setState 호출 방지
        setUserId(user.user_id);
      }
    } catch (error) {
      console.error("사용자 아이디가 유효하지 않습니다.", error);
    }
  }, [userId]);

  // ✅ 댓글 데이터 가져오기
  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // ✅ useCallback을 활용하여 최신 함수 참조 유지

  // ✅ 사용자 정보 가져오기 (마운트 시 한 번만 실행)
  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  // ✅ 댓글 전송 핸들러
  const handleSubmit = async () => {
    if (!currentComment.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }
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

      setComments((prevComments) => [...prevComments, newComment]);
      setCurrentComment("");
    } catch (error) {
      console.error("코멘트 생성 오류:", error);
    }
  };

  // ✅ 버튼 스타일 적용
  const getButtonClass = (type: "problem" | "submission") => {
    return commentViewType === type
      ? "bg-white text-gray-900" // 선택된 버튼
      : "bg-gray-300 text-gray-500"; // 선택되지 않은 버튼
  };

  return (
    <div className=" mr-10 mb-10">
      <div className="flex justify-between items-center">
        <div />
        <div className="flex overflow-hidden shadow-sm">
          <button
            onClick={() => setCommentViewType("submission")}
            className={`px-8 py-2 rounded-tl-lg transition ${getButtonClass(
              "submission"
            )}`}
          >
            제출별 보기
          </button>
          <button
            onClick={() => setCommentViewType("problem")}
            className={`px-8 py-2 rounded-tr-lg transition ${getButtonClass(
              "problem"
            )}`}
          >
            문제별 보기
          </button>
        </div>
      </div>
      <div className="h-[66vh]"> 
      <div className="relative shadow rounded-lg p-4 h-[66vh] bg-white ">
        <h3 className="font-semibold text-gray-900 mb-2">
          {commentViewType === "problem"
            ? `${params.problemId} 문제의 댓글`
            : `${userId}님의 코드 댓글`}
        </h3>
        <div className="h-[2px] bg-gray-300 w-full mb-3 mt-3"></div>

        <div className="flex-1 overflow-y-scroll bg-white   h-[53vh] ">
          {comments.map((comment, index) => (
            <motion.li
              key={index}
              className="flex items-start space-x-3 p-2"
              transition={{ duration: 0.5, delay: index * 0.001 }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <strong className="text-gray-900">
                    {comment.is_anonymous ? comment.nickname : comment.user_id}
                  </strong>
                  <div className="pr-4"></div>
                  <span className="text-xs text-gray-600">
                    {comment.timestamp || "방금 전"}
                  </span>
                </div>
                <p className="text-gray-800 mt-1">{comment.comment}</p>
              </div>
            </motion.li>
          ))}
        </div>

        <div className="flex justify-between sticky bottom-[10vh] w-full">
          <label className="flex items-center space-x-2 mr-4 whitespace-nowrap">
            <input
              type="checkbox"
              className="h-4 w-4 appearance-none border border-gray-400 rounded-md checked:bg-gray-400 checked:border-gray-400 checked:text-white focus:ring-2 focus:ring-gray-500"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
            />
            <span className="text-sm text-gray-700">익명</span>
          </label>

          <div className="flex flex-1 items-center space-x-4 ">
            <div className="relative w-full h-12 bg-gray-200 rounded-xl flex items-center  ">
              <textarea
                placeholder="댓글을 입력해 주세요."
                className="flex-1 bg-transparent w-full h-full resize-none border-none focus:outline-none p-2"
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
              />
              <button
                onClick={handleSubmit}
                className="ml-3 flex items-center p-2 text-gray-700 rounded-lg hover:text-gray-900 transition-colors"
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
    </div></div>
  );
};

export default CommentSection;
