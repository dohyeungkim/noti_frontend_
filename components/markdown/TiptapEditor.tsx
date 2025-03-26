"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import Toolbar from "./Toolbar";
import { ResizableImage } from "./ResizableImage";

export default function TiptapEditor() {
  const editor = useEditor({
    extensions: [
      ResizableImage,
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      Highlight.configure({ multicolor: true }),
      Image,

      // ✅ 테이블 관련 확장 추가 (resizable 제거)
      Table.configure({}), // 기본 설정 적용
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: " ",
  });

  // ✅ 로컬 이미지를 업로드하는 핸들러
  const addLocalImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
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

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} addLocalImage={addLocalImage} />
      <EditorContent
        editor={editor}
        className="p-4 h-[500px] min-h-[500px] max-h-[500px] w-full text-black overflow-y-auto rounded-md"
      />
    </div>
  );
}
