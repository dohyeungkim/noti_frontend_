
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

// ✅ Props 타입 설정
interface SortButtonProps {
  onSortChange: (sortOrder: string) => void; // 정렬 변경 핸들러
}

export default function SortButton({ onSortChange }: SortButtonProps) {
  const [sortOrder, setSortOrder] = useState("제목순"); // 초기값: "제목순"

  // ✅ 버튼 클릭 시 정렬 방식 변경
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "제목순" ? "생성일순" : "제목순";
    setSortOrder(newSortOrder);
    onSortChange(newSortOrder); // 부모 컴포넌트에 변경된 정렬 방식 전달
  };

  return (
    <button
      className="flex border border-gray-300 rounded-lg m-2 px-4 py-1.5 min-w-[120px] 
               hover:bg-gray-100 active:scale-95 transition-all duration-500 ease-in-out
               focus:ring-2 focus:ring-gray-300
               "
      onClick={toggleSortOrder}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-gray-500">{sortOrder}</span> {/* 정렬 방식 */}
        <FontAwesomeIcon icon={faSort} className="text-gray-500" />
      </div>
    </button>
  );
}
