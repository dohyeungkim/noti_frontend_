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
    <li className={`ml-${node.type === "folder" ? "2" : "6"} list-none`}>
      {node.type === "folder" ? (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`cursor-pointer px-3 py-2 rounded-md transition duration-200 ${
            isOpen ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          {isOpen ? "📂" : "📁"} {node.name}
        </div>
      ) : (
        <div
          className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition duration-200 ${
            isSelected ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(node.problemId)}
            className="mr-2 cursor-pointer"
          />
          📄 {node.name}
        </div>
      )}
      {isOpen && node.children && (
        <ul className="pl-4">
          {node.children.map((child: any, index: number) => (
            <TreeNode
              key={index}
              node={child}
              selectedProblems={selectedProblems}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;
