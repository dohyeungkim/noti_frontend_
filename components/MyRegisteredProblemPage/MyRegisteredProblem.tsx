"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function MyRegisteredProblem() {
  const router = useRouter();
  const { id } = useParams(); // ✅ URL에서 문제 ID 가져오기

  // 🔹 문제 데이터 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testcase, setTestcase] = useState<{ input: string; output: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  return (
    <motion.div>
      {" "}
      <div className="w-full max-w-5xl px-6">
        {/* 헤더 */}

        {loading ? (
          <p className="text-center text-gray-500">로딩 중...</p>
        ) : (
          <motion.div
            key={isEditing ? "edit" : "view"} // 수정 모드 전환 애니메이션 적용
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}>
            {isEditing ? (
              // ✅ 수정 모드 (입력 폼)
              <form className="space-y-4">
                <div>
                  <label className="text-gray-600 font-medium">문제 제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="문제 제목을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-gray-600 font-medium">문제 설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="문제 설명을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"></textarea>
                </div>

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-blue-600 active:scale-95">
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-gray-500 active:scale-95">
                    취소
                  </button>
                </div>
              </form>
            ) : (
              // ✅ 일반 보기 모드 (텍스트 출력)
              <div className="space-y-4">
                <motion.div>
                  <h2 className="text-xl font-semibold mb-2">{title}</h2>
                </motion.div>
                <div>
                  <p className="text-gray-700">{description}</p>
                </div>

                {/* ✅ 입출력 예제 테이블 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* 입력 예제 */}
                  <section className="border p-4 rounded-md bg-white shadow-md">
                    <h3 className="text-lg font-semibold mb-2">입력 예제</h3>
                    <pre className="border p-4 rounded-md bg-gray-100 font-mono text-sm mt-2 overflow-auto max-h-[200px]">
                      {testcase.length > 0
                        ? testcase.map((tc) => tc.input.replace(/, /g, "\n")).join("\n\n")
                        : "입력 예제가 없습니다."}
                    </pre>
                  </section>

                  {/* 출력 예제 */}
                  <section className="border p-4 rounded-md bg-white shadow-md">
                    <h3 className="text-lg font-semibold mb-2">출력 예제</h3>
                    <pre className="border p-4 rounded-md bg-gray-100 font-mono text-sm mt-2 overflow-auto max-h-[200px]">
                      {testcase.length > 0
                        ? testcase.map((tc) => tc.output).join("\n\n")
                        : "출력 예제가 없습니다."}
                    </pre>
                  </section>
                </motion.div>

                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-orange-600 active:scale-95">
                    수정하기
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
