"use client"; //클라이언트 사용

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";//훅, 모듈 추가
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
  return (//사용자UI
    <button
      onClick={onClick}
      className="flex items-center bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-xl m-2 text-sm sm:text-md cursor-pointer
  hover:bg-gray-500 transition-all duration-200 ease-in-out
  active:scale-95"
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" />
      {label}
    </button>
  );
}
