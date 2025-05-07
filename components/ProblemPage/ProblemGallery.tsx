import { problem_like_api, problem_api } from "@/lib/api";
import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  attempt_count: number;
  pass_count: number;
  is_like: boolean;
}

interface ProblemGalleryProps {
  problems: Problem[];
  groupId: number;
  workbookId: number;
  isGroupOwner: boolean;
  refresh: boolean; // Added refresh prop
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>; // Added setRefresh prop
}

export default function ProblemGallery({
  problems,
  groupId,
  workbookId,
  isGroupOwner,
  refresh,
  setRefresh,
}: ProblemGalleryProps) {
  const router = useRouter();
  const [likedProblems, setLikedProblems] = useState<Record<number, boolean>>({});
  const [currentProblems, setCurrentProblems] = useState<Problem[]>(problems);

  const toggleLike = async (problemId: number) => {
    try {
      const response = await problem_like_api.problem_like(problemId, groupId, workbookId);
      const isLiked = response.liked;
      setLikedProblems((prev) => ({
        ...prev,
        [problemId]: isLiked,
      }));
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const deleteProblem = async (problemId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await problem_api.problem_ref_delete(problemId, groupId, workbookId);
      setCurrentProblems((prev) => prev.filter((p) => p.problem_id !== problemId));
      setRefresh(!refresh); // Trigger refresh by toggling the state
    } catch (error) {
      console.error("문제 삭제 실패:", error);
      alert("문제 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 m-2">
      {currentProblems.map((p) => {
        const isLiked = likedProblems[p.problem_id] ?? p.is_like;
        return (
          <div
            key={p.problem_id}
            className="relative bg-white border border-gray-200 p-6 rounded-2xl shadow-md 
                      transition-transform overflow-hidden duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
            {/* X 삭제 버튼: 그룹장만 표시 */}
            {isGroupOwner && (
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProblem(p.problem_id);
                }}
              >
                <X size={20} />
              </button>
            )}

            <h2 className="text-xl font-semibold text-gray-800 truncate">{p.title}</h2>

            {/* 좋아요 버튼 */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(p.problem_id);
              }}
              className={`mt-2 flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
                isLiked ? "bg-red-200 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              <motion.div
                animate={{
                  scale: isLiked ? 1.2 : 1,
                  color: isLiked ? "#ff4757" : "#4B5563",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart fill={isLiked ? "#ff4757" : "none"} strokeWidth={2} size={24} />
              </motion.div>
            </motion.button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/mygroups/${groupId}/exams/${workbookId}/problems/${p.problem_id}`);
              }}
              className="mt-4 w-full bg-mygreen text-white py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-opacity-80 active:scale-95"
            >
              도전하기
            </button>
          </div>
        );
      })}
    </section>
  );
}
