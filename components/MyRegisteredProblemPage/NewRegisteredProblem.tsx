//문제등록페이지입니당
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { motion } from "framer-motion";
import { problem_api } from "@/lib/api";
import Toolbar from "../markdown/Toolbar";
import { ResizableTable } from "../markdown/ResizableTable";
import TableCellExtension from "../markdown/TableCellExtension";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { dummyProblems } from "@/data/dummy";
import HistoryGraph from "@/components/history/HistoryGraph";

export default function NewRegisteredProblem() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [inputs, setInputs] = useState([{ input: "", output: "" }]);
  const [isExpandedHistory, setIsExpandedHistory] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      Highlight.configure({ multicolor: true }),
      Image,
      ResizableTable, // ✅ 기존 Table 대신 ResizableTable 사용
      TableRow,
      TableHeader,
      TableCellExtension, // ✅ 커스텀 TableCell 적용
    ],
    content: " ",
  });

  if (!editor) return null; // 에디터가 로드될 때까지 기다림

  // ✅ 로컬 이미지를 Base64 URL로 변환하여 삽입
  const addLocalImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        editor.chain().focus().setImage({ src: base64Image }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitButtonClick = async () => {
    if (title.trim() === "") {
      alert("제목을 입력해주세요");
      return;
    }

    if (!editor) {
      alert("에디터가 로드되지 않았습니다.");
      return;
    }

    const content = editor.getHTML();
    console.log("📝 저장할 문제 설명:", content);

    try {
      await problem_api.problem_create(title, content, "", "", inputs);
      router.back();
    } catch (error) {
      console.error("❌ 문제 등록 실패:", error);
      alert("문제 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <motion.div
        className="flex items-center gap-2 justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}>
        <button
          onClick={handleSubmitButtonClick}
          className="flex items-center bg-gray-800 text-white px-8 py-1.5 rounded-xl m-2 text-md cursor-pointer
          hover:bg-gray-500 transition-all duration-200 ease-in-out
          active:scale-95">
          🚀 등록하기
        </button>
      </motion.div>
      <div className="grid  gap-6 w-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 ">문제 등록</h2>
          <div className="border-t border-gray-300 my-4"></div>
          {/* 🔹 문제 제목 입력 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문제 제목"
            className="w-full px-4 py-2 border rounded-md"
          />

          {/* 🔹 Notion 스타일 문제 설명 */}
          <div className="col-span-2">
            <div className="border rounded-md mt-2 bg-white">
              <Toolbar editor={editor} addLocalImage={addLocalImage} />
              <EditorContent
                editor={editor}
                className="p-4 h-[500px] min-h-[500px] max-h-[500px] w-full text-black overflow-y-auto rounded-md"
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 "> 입출력 예제</h2>
          <div className="border-t border-gray-300 my-4"></div>
          <table className="w-full border-collapse bg-white shadow-md rounded-xl mt-2">
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
                <tr key={index} className="border-t">
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="입력값"
                      value={pair.input}
                      onChange={(e) => {
                        const newInputs = [...inputs];
                        newInputs[index].input = e.target.value;
                        setInputs(newInputs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="출력값"
                      value={pair.output}
                      onChange={(e) => {
                        const newInputs = [...inputs];
                        newInputs[index].output = e.target.value;
                        setInputs(newInputs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setInputs(inputs.filter((_, i) => i !== index))}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg">
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>{" "}
          {/* 🔹 추가 & 등록 버튼 */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setInputs([...inputs, { input: "", output: "" }])}
              className="bg-green-500 text-white px-4 py-2 rounded-full">
              + 추가
            </button>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white shadow-md rounded-lg mt-10">
        {/* 문제 제목 */}
        <h4 className="text-2xl font-bold text-gray-900 mb-2">📈 History</h4>

        {/* 구분선 & 토글 버튼 */}
        <div className="flex justify-between items-center border-t-2 border-gray-600 mb-4">
          <button
            onClick={() => setIsExpandedHistory(!isExpandedHistory)}
            className="mt-3 text-gray-700 hover:text-black flex items-center">
            {isExpandedHistory ? (
              <>
                <FaChevronUp className="mr-2" /> 접기
              </>
            ) : (
              <>
                <FaChevronDown className="mr-2" /> 펼치기
              </>
            )}
          </button>
        </div>

        {/* 토글 대상 영역 (애니메이션 적용) */}
        <div
          className={`transition-all duration-300 ${
            isExpandedHistory ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}>
          <HistoryGraph historys={dummyProblems} />
        </div>
      </div>
      {/* ✅ 스타일 추가 (드래그 핸들) */}
      <style>
        {`
  .ProseMirror {
    outline: none;
    min-height: 150px;
    padding: 12px;
  }

  /* ✅ H1, H2, H3 적용 */
  .ProseMirror h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
  .ProseMirror h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
  .ProseMirror h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }

  /* ✅ 리스트 스타일 */
  .ProseMirror ul { list-style-type: disc; margin-left: 1.5rem; }
  .ProseMirror ol { list-style-type: decimal; margin-left: 1.5rem; }
  .ProseMirror li { margin-bottom: 0.5rem; }

  /* ✅ 테이블 스타일 (테두리 추가) */
  .ProseMirror table {
    width: 100%;
    border-collapse: collapse; /* ✅ 테이블 셀 사이의 공간 제거 */
    margin-top: 10px;
    border: 1px solid #ccc; /* ✅ 전체 테이블 테두리 */
  }

  .ProseMirror th, .ProseMirror td {
    border: 1px solid #ddd; /* ✅ 각 셀 테두리 추가 */
    padding: 8px;
    text-align: left;
  }

  .ProseMirror th {
    background-color: #f4f4f4; /* ✅ 헤더 배경색 추가 */
    font-weight: bold;
  }

  /* ✅ 툴바 버튼 */
  .toolbar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.1s ease-in-out;
  }
  .toolbar-icon:hover {
    transform: scale(1.1);
  }

  /* ✅ 형광펜 버튼 */
  .highlight-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.1s ease-in-out;
  }
  .highlight-btn:hover {
    transform: scale(1.1);
  }
`}
      </style>
    </div>
  );
}
