import { Table } from "@tiptap/extension-table"; 

export const ResizableTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(), //기존 속성유지
      resizable: {
        default: true, // ✅ 테이블 크기 조절 활성화
      },
    };
  },
});
