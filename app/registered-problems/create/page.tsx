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
  const handleInputChange = (
    index: number,
    field: "input" | "output",
    value: string
  ) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  // ✅ 새로운 입력/출력 쌍 추가
  const addInputOutputPair = () => {
    setInputs([...inputs, { input: "", output: "" }]);
  };
  // ✅ 문제 등록 API 호출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionData = {
      name: title,
      description,
      testcase: JSON.stringify(inputs),
    };

    try {
      const response = await fetch("http://210.115.227.15:8000/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("문제가 성공적으로 등록되었습니다!");
        console.log("등록된 문제:", data);

        // 입력 필드 초기화
        setTitle("");
        setDescription("");
        setInputs([{ input: "", output: "" }]);
      } else {
        console.error("문제 등록 실패:", response.statusText);
        alert("문제 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("에러 발생:", error);
      alert("서버와의 통신 중 에러가 발생했습니다.");
    }
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
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full">
        <PageHeader className="animate-slide-in mb-6" />

       

        <motion.form
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 🔹 문제 제목 */}
          <div>
            <label className="text-gray-600 font-medium">문제 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문제 제목을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🔹 문제 설명 */}
          <div>
            <label className="text-gray-600 font-medium">문제 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="문제 설명을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            ></textarea>
          </div>

          <hr className="border-gray-300" />

          {/* 🔹 입출력 설명 */}
          <div>
            <label className="text-gray-600 font-medium">입력 설명</label>
            <textarea
              placeholder="입력 조건을 설명하세요."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            ></textarea>
          </div>

          <div>
            <label className="text-gray-600 font-medium">출력 설명</label>
            <textarea
              placeholder="출력 조건을 설명하세요."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            ></textarea>
          </div>

          <hr className="border-gray-300" />

          {/* 🔹 입출력 쌍 등록 */}
          <div>
            <label className="text-gray-600 font-medium text-lg">
              입출력 쌍 등록
            </label>
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
                  >
                    <td className="p-3 text-center">{index + 1}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="입력값"
                        value={pair.input}
                        onChange={(e) =>
                          handleInputChange(index, "input", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="출력값"
                        value={pair.output}
                        onChange={(e) =>
                          handleInputChange(index, "output", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeInputOutputPair(index)}
                        className={`px-3 py-2 rounded-lg shadow-md active:scale-95 ${
                          inputs.length > 1
                            ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={inputs.length === 1}
                      >
                        ✖
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔹 추가 & 등록 버튼 */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={addInputOutputPair}
              className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-green-600 active:scale-95"
            >
              + 다음 쌍 등록하기
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-black text-white px-6 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-gray-800 active:scale-95"
            >
              🚀 등록하기
            </button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}
