"use client";//클라이언트 사용

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";//훅, 모듈 추가
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SearchBarProps {
  className?: string;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
}: SearchBarProps) {
  return (//사용자UI
    <div
      className="flex items-center border border-gray-300 rounded-lg m-2 px-4 py-1.5 w-full 
          flex-grow min-w-0 max-w-none
          transition-all duration-300 ease-in-out"
    >
      <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
      <input
        type="text"
        placeholder="그룹 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="ml-2 w-full outline-none bg-transparent"
      />
    </div>
  );
}
