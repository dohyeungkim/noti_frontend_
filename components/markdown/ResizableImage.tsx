"use client"; //훅과 브라우저기능을 사용할 것이기에 클라이언트에서 렌더링하도록 요청

import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react"; //사용할 모듈 훅 추가
import Image from "next/image";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import React from "react";

// ✅ React.FC 적용
const ResizableImageComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  // ✅ 이미지 크기 조정 핸들러
  const handleResize = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = parseInt(node.attrs.width || "300", 10);

    const onMouseMove = (event: MouseEvent) => {
      const newWidth = Math.max(50, Math.min(800, startWidth + (event.clientX - startX))); // 최소 50px, 최대 800px
      updateAttributes({ width: `${newWidth}px` });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return ( //사용자 UI
    <NodeViewWrapper className="relative inline-block resizable-image-wrapper">
      {/* ✅ next/image 최적화 및 width, height 자동 조절 */}
      <div style={{ width: node.attrs.width, position: "relative" }}>
        <Image
          src={node.attrs.src}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }} // ✅ 반응형 크기 조절
          alt="Resizable"
        />
      </div>

      {/* ✅ 리사이즈 핸들러 */}
      <div
        className="resize-handle"
        onMouseDown={(e) => handleResize(e)}
        style={{
          position: "absolute",
          right: "0",
          bottom: "0",
          width: "10px",
          height: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          cursor: "nwse-resize",
        }}
      />
    </NodeViewWrapper>
  );
};

// ✅ Named Export 적용
export { ResizableImageComponent };

// ✅ Tiptap의 ResizableImage 노드 정의
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
    return ReactNodeViewRenderer(ResizableImageComponent); // ✅ Named Export 적용
  },
});
