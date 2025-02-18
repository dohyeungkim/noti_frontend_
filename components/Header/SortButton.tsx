import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

// ✅ Props 타입 설정
interface SortButtonProps {
  className?: string;
  onSortChange: (sortOrder: string) => void; // 정렬 변경 핸들러
}

export default function SortButton({ onSortChange }: SortButtonProps) {
  const sortOptions = ["제목순", "생성일순", "공개순"]; // ✅ 정렬 옵션 추가
  const [sortIndex, setSortIndex] = useState(0); // ✅ 인덱스로 관리

  // ✅ 버튼 클릭 시 정렬 방식 변경 (순환 방식)
  const toggleSortOrder = () => {
    const newIndex = (sortIndex + 1) % sortOptions.length; // 0 → 1 → 2 → 0 순환
    setSortIndex(newIndex);
    onSortChange(sortOptions[newIndex]); // 부모 컴포넌트에 변경된 정렬 방식 전달
  };

  return (
    <button
      className="flex border border-gray-300 rounded-lg m-2 px-4 py-1.5 min-w-[120px] 
                 hover:bg-gray-100 active:scale-95 transition-all duration-500 ease-in-out
                 focus:ring-2 focus:ring-gray-300"
      onClick={toggleSortOrder}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-gray-500">{sortOptions[sortIndex]}</span> {/* 정렬 방식 표시 */}
        <FontAwesomeIcon icon={faSort} className="text-gray-500" />
      </div>
    </button>
  );
}
