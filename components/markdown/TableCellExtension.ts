// 📌 TableCellExtension.ts (테이블 셀 확장)
import { TableCell as TiptapTableCell } from "@tiptap/extension-table-cell"; //훅, 모듈 추가

const TableCellExtension = TiptapTableCell.extend({ //tiptaptabvlecell의 확장
  addAttributes() {
    return {
      ...this.parent?.(),//기존속성유지
      isHeader: {
        default: false,//일반적인 셀로 인식
        parseHTML: (element) => element.getAttribute("data-header") === "true",
        renderHTML: (attributes) => {
          if (!attributes.isHeader) return {};
          return { "data-header": "true" };
        },
      },
    };
  },
});

export default TableCellExtension; //외부에서도 사용가능하게
