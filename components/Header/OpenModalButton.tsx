import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface OpenModalButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export default function OpenModalButton({
  onClick,
  label,
}: OpenModalButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center bg-black text-white px-4 py-1.5 rounded-xl m-2 text-md cursor-pointer
      hover:bg-gray-500 transition-all duration-200 ease-in-out
      active:scale-95"
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" />
      {label}
    </button>
  );
}
