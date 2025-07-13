"use client";//클라이언트 사용

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";//훅, 모듈 추가
import { faTableCells, faList } from "@fortawesome/free-solid-svg-icons";

interface ViewToggleProps {
  className?: string;

  viewMode: "gallery" | "table";
  setViewMode: (mode: "gallery" | "table") => void;
}

export default function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (//사용자 UI
    <div className="flex items-center gap-3 ml-16">
      {/* 갤러리 뷰 버튼 (아이콘만 표시) */}
      <button
        className="transition-all duration-300"
        onClick={() => setViewMode("gallery")}
      >
        <FontAwesomeIcon
          icon={faTableCells}
          className={`w-6 h-6 ${
            viewMode === "gallery" ? "text-gray-700" : "text-gray-400"
          } hover:text-gray-600`}
        />
      </button>

      {/* 테이블 뷰 버튼 (아이콘만 표시) */}
      <button
        className="transition-all duration-300"
        onClick={() => setViewMode("table")}
      >
        <FontAwesomeIcon
          icon={faList}
          className={`w-6 h-6 ${
            viewMode === "table" ? "text-gray-700" : "text-gray-400"
          } hover:text-gray-600`}
        />
      </button>
    </div>
  );
}
