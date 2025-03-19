"use client";

import { problem_like_api } from "@/lib/api";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  attempt_count: number;
  pass_count: number;
}

interface ProblemGalleryProps {
  problems: Problem[];
  groupId: number;
  workbookId: number;
}

export default function ProblemGallery({ problems, groupId, workbookId }: ProblemGalleryProps) {
  const router = useRouter();
  const [likedProblems, setLikedProblems] = useState<Record<number, boolean>>({});

  // 초기 좋아요 상태 가져오기
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await problem_like_api.get_user_likes();
        const likedIds = response.liked_problem_ids || [];
        const initialLikes = problems.reduce((acc: Record<number, boolean>, p: Problem) => {
          acc[p.problem_id] = likedIds.includes(p.problem_id);
          return acc;
        }, {} as Record<number, boolean>);
        setLikedProblems(initialLikes);
      } catch (error) {
        console.error("좋아요 상태 로드 실패:", error);
      }
    };
    fetchLikes();
  }, [problems]);

  const toggleLike = async (problemId: number) => {
    try {
      const response = await problem_like_api.problem_like(problemId);
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

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 m-2">
      {problems.map((p: Problem) => (
        <div
          key={p.problem_id}
          className="relative bg-white border border-gray-200 p-6 rounded-2xl shadow-md 
                     transition-transform overflow-hidden duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
          <h2 className="text-xl font-semibold text-gray-800 truncate">{p.title}</h2>
          {/* 좋아요 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(p.problem_id);
            }}
            className={`mt-2 flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
              likedProblems[p.problem_id] ? "bg-red-200 text-white" : "bg-gray-200 text-gray-600"
            }`}>
            <motion.div
              animate={{
                scale: likedProblems[p.problem_id] ? 1.2 : 1,
                color: likedProblems[p.problem_id] ? "#ff4757" : "#4B5563",
              }}
              transition={{ type: "spring", stiffness: 300 }}>
              <Heart
                fill={likedProblems[p.problem_id] ? "#ff4757" : "none"}
                strokeWidth={2}
                size={24}
              />
            </motion.div>
          </motion.button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/mygroups/${groupId}/exams/${workbookId}/problems/${p.problem_id}`);
            }}
            className="mt-4 w-full bg-mygreen text-white py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-opacity-80 active:scale-95">
            도전하기
          </button>
        </div>
      ))}
    </section>
  );
}
