interface PaginationProps {
    totalPages: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;  // 업데이트 함수 허용
  }
  

export default function Pagination({ totalPages, currentPage, setCurrentPage }: PaginationProps) {
    return (
      <div className="flex items-center justify-center space-x-4 mt-4">
        <button
          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        <span className="text-lg font-semibold">{currentPage} / {totalPages}</span>
        <button
          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>
    );
  }
  