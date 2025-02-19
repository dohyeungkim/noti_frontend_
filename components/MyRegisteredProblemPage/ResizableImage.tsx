import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";

export const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "300px" }, // 기본 크기
    };
  },

  parseHTML() {
    return [{ tag: "img" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

// ✅ React에서 크기 조절 가능한 이미지 컴포넌트 구현
import { NodeViewWrapper } from "@tiptap/react";

const ResizableImageComponent = (props: any) => {
  const { node, updateAttributes } = props;

  const handleResize = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation(); // 부모 요소 클릭 방지

    let startX = event.clientX;
    let startWidth = parseInt(node.attrs.width || "300", 10);

    const onMouseMove = (event: MouseEvent) => {
      const newWidth = startWidth + (event.clientX - startX);
      updateAttributes({ width: `${newWidth}px` });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <NodeViewWrapper className="relative inline-block resizable-image-wrapper">
      {/* ✅ 이미지 렌더링 (width 속성 반영) */}
      <img src={node.attrs.src} style={{ width: node.attrs.width }} />

      {/* ✅ 드래그 핸들 추가 (여기에 넣어야 함!) */}
      <div className="resize-handle" onMouseDown={handleResize} />
    </NodeViewWrapper>
  );
};
