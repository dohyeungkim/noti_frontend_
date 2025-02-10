"use client";

import PageHeader from "@/components/Header/PageHeader";
import { useState } from "react";
import { motion } from "framer-motion";

export default function NewQuestionPage() {
  // ✅ 문제 제목, 설명, 테스트 케이스 상태 추가
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputs, setInputs] = useState([{ input: "", output: "" }]);

  // ✅ 테스트 케이스 입력 변경 핸들러
  const handleInputChange = (index: number, field: "input" | "output", value: string) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  // ✅ 새로운 입력/출력 쌍 추가
  const addInputOutputPair = () => {
    setInputs([...inputs, { input: "", output: "" }]);
  };

  // ✅ 입력/출력 쌍 삭제 (최소 1개 유지)
  const removeInputOutputPair = (index: number) => {
    if (inputs.length > 1) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  return (
    <motion.div
      className="bg-[#f9f9f9] min-h-screen p-8 flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader className="animate-slide-in mb-6" />
        <motion.hr className="border-gray-300 pb-10" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.5 }} />

        <motion.form
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* 🔹 문제 제목 */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <label className="text-gray-600 font-medium">문제 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문제 제목을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>

          {/* 🔹 문제 설명 */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <label className="text-gray-600 font-medium">문제 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="문제 설명을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            ></textarea>
          </motion.div>

          <motion.hr className="border-gray-300" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.5 }} />

          {/* 🔹 입출력 쌍 등록 */}
          <motion.div>
            <label className="text-gray-600 font-medium text-lg">입출력 쌍 등록</label>
            <table className="w-full border-collapse bg-white shadow-md rounded-xl overflow-hidden mt-2">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left w-12">#</th>
                  <th className="p-3 text-left">입력값</th>
                  <th className="p-3 text-left">출력값</th>
                  <th className="p-3 text-center w-16">삭제</th>
                </tr>
              </thead>
              <tbody>
                {inputs.map((pair, index) => (
                  <motion.tr
                    key={index}
                    className="border-t"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <td className="p-3 text-center">{index + 1}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="입력값"
                        value={pair.input}
                        onChange={(e) => handleInputChange(index, "input", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="출력값"
                        value={pair.output}
                        onChange={(e) => handleInputChange(index, "output", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <motion.button
                        type="button"
                        onClick={() => removeInputOutputPair(index)}
                        className={`px-3 py-2 rounded-lg shadow-md ${
                          inputs.length > 1 ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-300 text-gray-500"
                        }`}
                        disabled={inputs.length === 1}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✖
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* 🔹 추가 & 등록 버튼 */}
          <motion.div className="flex justify-between mt-6">
            <motion.button
              type="button"
              onClick={addInputOutputPair}
              className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-600 active:scale-95"
              whileTap={{ scale: 0.95 }}
            >
              + 다음 쌍 등록하기
            </motion.button>
            <motion.button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-full shadow-md hover:bg-gray-800 active:scale-95"
              whileTap={{ scale: 0.95 }}
            >
              🚀 등록하기
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
