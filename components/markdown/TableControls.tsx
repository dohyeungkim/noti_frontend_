import { Editor } from "@tiptap/react";
import {
  Grid2x2Plus, Rows, ArrowUpToLine, Columns, ArrowLeftToLine, Trash2, Grid2x2Check
} from "lucide-react";

interface TableControlsProps {
  editor: Editor | null;
}

export default function TableControls({ editor }: TableControlsProps) {
  if (!editor) return null;

  const toggleHeaderStyle = () => {
    if (!editor) return;
    const isHeader = editor.getAttributes("tableCell")?.isHeader || false;
    editor.chain().focus().setCellAttribute("isHeader", !isHeader).run();
  };

  return (
    <div className="flex items-center space-x-2 p-4">
      <style>
        {`
          .toolbar-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 4px;
            color: gray;
            transition: background-color 0.3s, color 0.3s;
          }
          .toolbar-icon:hover {
            color: black;
            background-color: #f0f0f0;
          }
          .toolbar-icon.delete {
            color: red;
          }
          .toolbar-icon.delete:hover {
            color: darkred;
            background-color: #f0f0f0;
          }
          .toolbar-icon.active {
            color: blue;
          }
        `}
      </style>
      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 1, cols: 2, withHeaderRow: false }).run()}
        className="toolbar-icon"
      >
        <Grid2x2Plus size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="toolbar-icon"
      >
        <Rows size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        className="toolbar-icon delete"
      >
        <ArrowUpToLine size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="toolbar-icon"
      >
        <Columns size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className="toolbar-icon delete"
      >
        <ArrowLeftToLine size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="toolbar-icon delete"
      >
        <Trash2 size={18} />
      </button>
      <button
        onClick={toggleHeaderStyle}
        className={`toolbar-icon ${editor.getAttributes("tableCell")?.isHeader ? "active" : ""}`}
      >
        <Grid2x2Check size={18} />
      </button>
    </div>
  );
}
