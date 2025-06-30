import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { ResizableTable } from "@/components/markdown/ResizableTable";
import TableCellExtension from "@/components/markdown/TableCellExtension";

export function useProblemEditor(initialContent: string = "") {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Heading.configure({ levels: [1, 2, 3] }),
			BulletList,
			OrderedList,
			Highlight.configure({ multicolor: true }),
			Image,
			ResizableTable,
			TableRow,
			TableHeader,
			TableCellExtension,
		],
		content: initialContent,
	});

	// 로컬 이미지를 Base64 URL로 변환하여 삽입
	const addLocalImage = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				const base64Image = reader.result as string;
				editor?.chain().focus().setImage({ src: base64Image }).run();
			};
			reader.readAsDataURL(file);
		}
	};

	return {
		editor,
		addLocalImage,
	};
} 