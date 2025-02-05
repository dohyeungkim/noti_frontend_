import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
}: SearchBarProps) {
  return (
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
