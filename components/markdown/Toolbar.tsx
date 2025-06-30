import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Minus,
  Image as ImageIcon,
  Grid2x2Plus,
  Rows,
  ArrowUpToLine,
  Columns,
  ArrowLeftToLine,
  Trash2,
  Grid2x2Check,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
  addLocalImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Toolbar({ editor, addLocalImage }: ToolbarProps) {
  if (!editor) return null;

  const toggleHeaderStyle = () => {
    if (!editor) return;
    const isHeader = editor.getAttributes("tableCell")?.isHeader || false;
    editor.chain().focus().setCellAttribute("isHeader", !isHeader).run();
  };

  return (
    <div className="toolbar-container">
      <style>
  {`
    .toolbar-container {
      display: flex;
      align-items: center;
      padding: 2px 4px;
      gap: 1px;
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: #888 #f0f0f0;
    }
    .toolbar-icon {
      cursor: pointer;
      border: none;
      background: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 27px; // 모든 버튼의 너비를 일정하게 설정
      height: 27px; // 모든 버튼의 높이를 일정하게 설정
    }
    .toolbar-icon:hover {
      background-color: #f0f0f0;
    }
    .highlight-btn {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid #ccc;
    }
    .highlight-btn.active {
      border: 2px solid black;
    }
  `}
</style>


      <button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-icon">
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-icon">
        <Italic size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className="toolbar-icon">
        <Strikethrough size={18} />
      </button>
      {([1, 2, 3] as const).map((level) => (
        <button key={level} onClick={() => editor.chain().focus().toggleHeading({ level }).run()} className="toolbar-icon">
          H{level}
        </button>
      ))}
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="toolbar-icon">
        <List size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="toolbar-icon">
        <ListOrdered size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="toolbar-icon">
        <Code size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="toolbar-icon">
        <Minus size={18} />
      </button>
      <div className="toolbar-icon">
        <input type="file" accept="image/*" onChange={addLocalImage} className="hidden" id="imageUpload" />
        <label htmlFor="imageUpload" className="toolbar-icon">
          <ImageIcon size={18} />
        </label>
      </div>
      <button onClick={() => editor.chain().focus().insertTable({ rows: 1, cols: 2, withHeaderRow: false }).run()} className="toolbar-icon">
        <Grid2x2Plus size={18} />
      </button>
      <button onClick={() => editor.chain().focus().addRowAfter().run()} className="toolbar-icon">
        <Rows size={18} />
      </button>
      <button onClick={() => editor.chain().focus().deleteRow().run()} className="toolbar-icon delete">
        <ArrowUpToLine size={18} />
      </button>
      <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="toolbar-icon">
        <Columns size={18} />
      </button>
      <button onClick={() => editor.chain().focus().deleteColumn().run()} className="toolbar-icon delete">
        <ArrowLeftToLine size={18} />
      </button>
      <button onClick={() => editor.chain().focus().deleteTable().run()} className="toolbar-icon delete">
        <Trash2 size={18} />
      </button>
      <button onClick={toggleHeaderStyle} className={`toolbar-icon ${editor.getAttributes("tableCell")?.isHeader ? "active" : ""}`}>
        <Grid2x2Check size={18} />
      </button>
      <div className="w-6"></div>
      <div className="flex gap-1">
        {["#FFD1DC", "#C1E1C1", "#FFF9C4", "#CBE6FF", "#E6D6FF"].map((color) => (
          <button key={color} onClick={() => editor.chain().focus().toggleHighlight({ color }).run()} className="highlight-btn" style={{ backgroundColor: color }}>
          </button>
        ))}
      </div>
    </div>
  );
}
