"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Minus,
  Image as ImageIcon,
} from "lucide-react";
import { ResizableImage } from "./ResizableImage";

// ✅ 문제 등록 폼 (툴바 포함)
export default function NewRegisteredProblem() {
  const [title, setTitle] = useState("");
  const [inputs, setInputs] = useState([{ input: "", output: "" }]);

  // ✅ Tiptap 에디터 설정 (제목 + 리스트 + 형광펜 + 이미지 추가)
  const editor = useEditor({
    extensions: [
      ResizableImage,
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }), // H1, H2, H3 지원
      BulletList, // 점 리스트 지원
      OrderedList, // 번호 리스트 지원
      Highlight.configure({ multicolor: true }), // 형광펜 여러 색상 지원
      Image, // 이미지 업로드 지원
    ],
    content: "<p>문제 설명을 입력하세요...</p>",
  });

  if (!editor) return null; // 에디터가 로드될 때까지 기다림

  // ✅ 이미지 업로드 핸들러 (추후 구현)
  const addImage = () => {
    const url = prompt("이미지 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

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

  return (
    <div>
      <div>
        <div>
          <h2 className="text-xl font-bold mb-2 mt-20">문제 작성</h2>
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
          <div className="border rounded-md mt-2 bg-white ">
            {/* 🔹 툴바 (아이콘 상태 변화 추가) */}
            <div className="flex flex-wrap items-center gap-2 border-b p-2">
              {/* 기본 스타일 버튼 (활성화 상태 변경) */}
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`toolbar-icon ${
                  editor.isActive("bold") ? "text-black " : "text-gray-500"
                }`}
              >
                <Bold size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`toolbar-icon ${
                  editor.isActive("italic") ? "text-black" : "text-gray-500"
                }`}
              >
                <Italic size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`toolbar-icon ${
                  editor.isActive("strike") ? "text-black " : "text-gray-500"
                }`}
              >
                <Strikethrough size={18} />
              </button>

              {/* 제목 크기 */}
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`toolbar-icon ${
                  editor.isActive("heading", { level: 1 })
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                H1
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`toolbar-icon ${
                  editor.isActive("heading", { level: 2 })
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                H2
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`toolbar-icon ${
                  editor.isActive("heading", { level: 3 })
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                H3
              </button>

              {/* 리스트 */}
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`toolbar-icon ${
                  editor.isActive("bulletList") ? "text-black" : "text-gray-500"
                }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`toolbar-icon ${
                  editor.isActive("orderedList")
                    ? "text-black "
                    : "text-gray-500"
                }`}
              >
                <ListOrdered size={18} />
              </button>

              {/* 코드 블록 & 가로선 */}
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`toolbar-icon ${
                  editor.isActive("codeBlock") ? "text-black" : "text-gray-500"
                }`}
              >
                <Code size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="toolbar-icon"
              >
                <Minus size={18} />
              </button>

              {/* 🔹 툴바에 이미지 업로드 버튼 추가 */}
              <div className=" p-2 flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={addLocalImage}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <ImageIcon size={18} className="text-gray-500" />
                </label>
              </div>
              {/* ✅ 스타일 추가 (드래그 핸들) */}

              {/* 🔹 형광펜 5가지 색상 (선택된 색상 강조) */}
              <div className="flex gap-1 ml-3">
                {["#FFD1DC", "#C1E1C1", "#FFF9C4", "#CBE6FF", "#E6D6FF"].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() =>
                        editor.chain().focus().toggleHighlight({ color }).run()
                      }
                      className={`highlight-btn`}
                      style={{
                        backgroundColor: color,
                        border: editor.isActive("highlight", { color })
                          ? "2px solid black"
                          : "1px solid #ccc",
                      }}
                    />
                  )
                )}
              </div>
            </div>

            {/* 🔹 스타일 직접 적용 (글자 크기 & 리스트) */}
            <EditorContent
              editor={editor}
              className="p-4 min-h-[400px] max-h-[calc(100vh-30px)] w-full resize-none text-black selection:bg-gray-200 editor-content overflow-y-auto pb-8"
            />
          </div>
        </div>
      </div>




      <style>
        {`
 .resizable-image-wrapper {
            display: inline-block;
            position: relative;
            max-width: 100%; /* 부모 요소보다 커지지 않도록 */
          }

          .resizable-image-wrapper img {
            display: block;
            width: 100%;
            height: auto;
          }

          .resize-handle {
            width: 12px;
            height: 12px;
            background: #999;
            border-radius: 50%;
            position: absolute;
            bottom: -6px;
            right: -6px;
            cursor: nwse-resize;
            border: 2px solid white;
          }

          .ProseMirror {
            outline: none; /* 포커스 시 파란 테두리 제거 */
            min-height: 150px;
          }
       
            /* 본문에만 스타일 적용 */
            .editor-content h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
            .editor-content h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
            .editor-content h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
            .editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
            .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }

            /* 사이드바 스타일 유지 */
            .sidebar h1, .sidebar h2, .sidebar h3,
            .sidebar ul, .sidebar ol {
              all: unset; /* 사이드바에서는 기본 스타일 유지 */
            }
         
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
