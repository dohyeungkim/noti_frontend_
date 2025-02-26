// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Heading from "@tiptap/extension-heading";
// import BulletList from "@tiptap/extension-bullet-list";
// import OrderedList from "@tiptap/extension-ordered-list";
// import Highlight from "@tiptap/extension-highlight";
// import Image from "@tiptap/extension-image";
// import {
//   Bold,
//   Italic,
//   Strikethrough,
//   List,
//   ListOrdered,
//   Code,
//   Minus,
//   Image as ImageIcon,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { problem_api } from "@/lib/api";
// import { ResizableImage } from "./ResizableImage";

// export default function ProblemEdit() {
//   const router = useRouter();
//   const { id } = useParams();

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [inputs, setInputs] = useState([{ input: "", output: "" }]);
//   const [loading, setLoading] = useState(true);

//   const editor = useEditor({
//     extensions: [
//       ResizableImage,
//       StarterKit,
//       Heading.configure({ levels: [1, 2, 3] }), // H1, H2, H3 지원
//       BulletList, // 점 리스트 지원
//       OrderedList, // 번호 리스트 지원
//       Highlight.configure({ multicolor: true }), // 형광펜 여러 색상 지원
//       Image, // 이미지 업로드 지원
//     ],
//     content: "문제 설명을 입력하세요...",
//   });
//   if (!editor) return null; // 에디터가 로드될 때까지 기다림

//   useEffect(() => {
//     const fetchProblem = async () => {
//       try {
//         const response = await fetch(`/api/proxy/problems/${id}`);
//         const data = await response.json();
//         setTitle(data.title);
//         setDescription(data.description);
//         if (editor) {
//           editor.commands.setContent(data.description);
//         }
//         setInputs(data.inputs || [{ input: "", output: "" }]);
//       } catch (error) {
//         console.error("Failed to fetch problem:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProblem();
//   }, [id, editor]);

//   const handleSave = async () => {
//     if (!editor) {
//       alert("Editor is not loaded yet.");
//       return;
//     }

//     const updatedDescription = editor.getHTML();
//     try {
//       const response = await problem_api.problem_update(
//         id,
//         title,
//         updatedDescription,
//         inputs
//       );
//       alert("Problem updated successfully!");
//       router.push(`/registered-problems/view/${id}`);
//     } catch (error) {
//       console.error("Error updating problem:", error);
//       alert("Failed to update the problem.");
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   // ✅ 로컬 이미지를 Base64 URL로 변환하여 삽입
//   const addLocalImage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const base64Image = reader.result as string;
//         editor.chain().focus().setImage({ src: base64Image }).run();
//       };
//       reader.readAsDataURL(file);
//     }
//   };