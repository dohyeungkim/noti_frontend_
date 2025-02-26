"use client";

import SearchBar from "@/components/ui/SearchBar";
import SortButton from "@/components/ui/SortButton";
import ViewToggle from "@/components/ui/ViewToggle";

interface ExamControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  viewMode: "gallery" | "table";
  setViewMode: (mode: "gallery" | "table") => void;
}

export default function ExamControls({
  searchQuery,
  setSearchQuery,
  setSortOrder,
  viewMode,
  setViewMode,
}: ExamControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      <SortButton onSortChange={setSortOrder} />
    </div>
  );
}
