import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

// ✅ 올바른 Props 타입 설정
interface SortButtonProps {
  onClick: () => void;
  label: string;
}

export default function SortButton({ onClick, label }: SortButtonProps) {
  return (
    <button className="flex items-center border border-gray-300 rounded-md px-4 py-2" onClick={onClick}>
      <FontAwesomeIcon icon={faSort} className="mr-2" />
      {label}
    </button>
  );
}
