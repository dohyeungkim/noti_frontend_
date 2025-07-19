"use client";

interface PaginationProps {
  className?: string;

  totalItems: number; // 전체 항목 수
  itemsPerPage?: number; // 한 페이지당 표시할 항목 수 (기본값: 9)
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>; // 페이지 업데이트 함수
}

export default function Pagination({
  totalItems,
  itemsPerPage = 9, // 기본값을 9로 설정
  currentPage,
  setCurrentPage,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage); // 전체 페이지 수 계산

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      {/* 이전 페이지 버튼 */}
      <button
        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg 
                   bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        {"<"}
      </button>

      {/* 페이지 번호 버튼 (1, 2, 3, ...) */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg font-medium transition 
                      ${
                        currentPage === page
                          ? "bg-gray-800 text-white"
                          : "border border-gray-300 bg-gray-100 hover:bg-gray-200"
                      }`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      ))}

      {/* 다음 페이지 버튼 */}
      <button
        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg 
                   bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        {">"}
      </button>
    </div>
  );
}
