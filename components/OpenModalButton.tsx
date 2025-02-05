import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface OpenModalButtonProps {
  onClick: () => void;
  label: string; // 버튼 텍스트 (예: "그룹 생성하기", "문제 생성하기")
}

export default function OpenModalButton({ onClick, label }: OpenModalButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center bg-black text-white px-4 py-2 rounded-md text-lg cursor-pointer"
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" />
      {label}
    </button>
  );
}
