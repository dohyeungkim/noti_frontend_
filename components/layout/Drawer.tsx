"use client";

import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHouse,
  faMagnifyingGlass,
  faScroll,
  faUsers,
  faPen,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Drawer({ isOpen, setIsOpen }: DrawerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!drawerOpen);
  };

  const openDrawer = () => {
    if (!drawerOpen) {
      setDrawerOpen(true);
    }
  };

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-200 shadow-lg overflow-hidden rounded-r-2xl transition-all duration-300 z-[1000]
          ${isOpen ? "w-64 md:w-64 sm:w-52" : "w-16 sm:w-14 md:w-16"}`}
        onClick={!isOpen ? openDrawer : undefined}
      >
        {/* Profile Section */}
        <div className="flex items-center p-3 bg-gray-200 text-gray-700">
          <button className="text-lg cursor-pointer bg-transparent border-none">👤</button>
          <p className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Hello, 서연 한!</p>
          <button
            className={`ml-auto ${isOpen ? "block" : "hidden"}`}
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4">
          <ul className="list-none p-0">
            {[
              { href: "/search", icon: faMagnifyingGlass, text: " 검색" },
              { href: "/", icon: faHouse, text: " 나의 페이지" },
              { href: "/solved", icon: faScroll, text: " 내가 푼 문제 모음" },
              { href: "/groups", icon: faUsers, text: " 나의 그룹" },
              { href: "/my-questions", icon: faPen, text: " 문제 등록하기" },
              { href: "/notifications", icon: faEnvelope, text: " 알림함" },
            ].map(({ href, icon, text }) => (
              <li key={href} className="my-4 flex items-center gap-2">
                <Link href={href} className="no-underline text-gray-700 flex items-center">
                  <button className="border-none bg-transparent text-lg cursor-pointer">
                    <FontAwesomeIcon icon={icon} />
                  </button>
                  <span className={`ml-2 ${isOpen ? "inline-block" : "hidden"}`}>{text}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* 사이드 바 닫으면 여기서부터 안 보이도록 숨김 */}
          <div className={`${isOpen ? "block" : "hidden"}`}>
            <p className="text-gray-500 text-sm">즐겨찾는 그룹</p>
            <p>
              <s>추후에 추가 예정</s>
            </p>
            <p className="text-gray-500 text-sm">즐겨찾는 문제지</p>
            <p>
              <s>추후에 추가 예정</s>
            </p>
            <p className="text-gray-500 text-sm">나의 문제지</p>
            <p>
              <s>추후에 추가 예정</s>
            </p>
          </div>
        </div>
      </div>

      {/* 사이드바 열기 버튼 */}
      <button
        className={`absolute top-[10px] left-[70px] bg-gray-100 text-black rounded-full w-[25px] h-[25px] text-lg cursor-pointer
          ${isOpen ? "hidden" : "block"}`}
        onClick={toggleDrawer}
      >
        ➡️
      </button>
    </>
  );
}
