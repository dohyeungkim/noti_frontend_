"use client"; //클라이언트 컴포넌트지정
//필요한 모듈, 훅 추가
import SearchBar from "@/components/ui/SearchBar";
import SortButton from "@/components/ui/SortButton";
import ViewToggle from "@/components/ui/ViewToggle";

interface ExamControlsProps { //props 타입정의 어떤 입력값을 받을지 정해놓는 것
  searchQuery: string; 
  setSearchQuery: (query: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  viewMode: "gallery" | "table";
  setViewMode: (mode: "gallery" | "table") => void;
  sortOptions: ("최신순" | "제목순")[];
}

export default function ExamControls({ //정의한 examcon...컴포넌트를 다른 파일에서 추가해서 사용할 수 있게 만듬 
  searchQuery,
  setSearchQuery,
  setSortOrder,
  viewMode,
  setViewMode,
  sortOptions,
}: ExamControlsProps) {
  return ( //사용자 UI
    <div className="flex items-center gap-4 mb-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      <SortButton sortOptions={sortOptions} onSortChange={setSortOrder} />
    </div>
  );
}
