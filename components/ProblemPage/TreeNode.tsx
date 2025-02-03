"use client";
import { useState } from "react";

interface TreeNodeProps {
  node: any;
  selectedProblems: string[];
  onSelect: (problemId: string) => void;
  expandedNodes: Set<string>;
}

const TreeNode = ({ node, selectedProblems, onSelect, expandedNodes }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(expandedNodes.has(node.name));
  const isSelected = selectedProblems.includes(node.problemId);

  return (
    <li style={{ listStyleType: "none", marginLeft: node.type === "folder" ? "10px" : "25px" }}>
      {node.type === "folder" ? (
        <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer", padding: "5px", borderRadius: "5px", backgroundColor: isOpen ? "#e6e6e6" : "transparent" }}>
          {isOpen ? "📂" : "📁"} {node.name}
        </div>
      ) : (
        <div style={{ padding: "5px", cursor: "pointer", backgroundColor: isSelected ? "#d1e7fd" : "transparent", borderRadius: "5px" }}>
          <input type="checkbox" checked={isSelected} onChange={() => onSelect(node.problemId)} style={{ marginRight: "0.5rem" }} />
          📄 {node.name}
        </div>
      )}
      {isOpen && node.children && (
        <ul style={{ paddingLeft: "15px" }}>
          {node.children.map((child: any, index: number) => (
            <TreeNode key={index} node={child} selectedProblems={selectedProblems} onSelect={onSelect} expandedNodes={expandedNodes} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;
