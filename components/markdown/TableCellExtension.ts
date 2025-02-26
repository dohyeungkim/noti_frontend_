// 📌 TableCellExtension.ts (테이블 셀 확장)
import { TableCell as TiptapTableCell } from "@tiptap/extension-table-cell";

const TableCellExtension = TiptapTableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      isHeader: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-header") === "true",
        renderHTML: (attributes) => {
          if (!attributes.isHeader) return {};
          return { "data-header": "true" };
        },
      },
    };
  },
});

export default TableCellExtension;
