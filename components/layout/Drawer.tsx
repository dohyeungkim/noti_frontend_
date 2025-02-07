"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { groups as dummyGroups } from "@/data/groups"; // ✅ 더미 데이터 가져오기

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Drawer({ isOpen, setIsOpen }: DrawerProps) {
  // ✅ "MY" 그룹 제외한 나의 그룹 목록 설정
  const filteredGroups = dummyGroups.filter((group) => group.groupId !== "MY");

  return (
    <>
      {/* 사이드바 */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-200 shadow-lg overflow-hidden rounded-r-2xl transition-all duration-300 z-[1000] ${
          isOpen ? "w-64 md:w-64 sm:w-52" : "w-16 sm:w-14 md:w-16"
        }`}
      >
        {/* 프로필 영역 */}
        <div className="flex items-center p-3 bg-gray-200 text-gray-700">
          <button className="text-lg cursor-pointer bg-transparent border-none">👤</button>
          <p className={`ml-2 transition-all duration-300 ${isOpen ? "block" : "hidden"}`}>
            Hello, 서연 한!
          </p>
          <button
            className={`ml-auto transition-all duration-300 ${isOpen ? "block" : "hidden"}`}
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <div className="p-4">
          <ul className="list-none p-0">
            {[
             // { href: "/search", icon: faMagnifyingGlass, text: " 검색" },
              { href: "/", icon: faHouse, text: " 나의 페이지" },
              { href: "/solved", icon: faScroll, text: " 내가 푼 문제 모음" },
              { href: "/groups", icon: faUsers, text: " 나의 그룹" },
              { href: "/my-questions", icon: faPen, text: " 내가 등록한 문제들" },
            //  { href: "/notifications", icon: faEnvelope, text: " 알림함" },
            ].map(({ href, icon, text }) => (
              <li key={href} className="my-4 flex items-center gap-2 ">
                <Link href={href} className="no-underline text-gray-700 flex items-center hover:text-white">
                  <button className="border-none bg-transparent text-lg cursor-pointer">
                    <FontAwesomeIcon icon={icon} />
                  </button>
                  <span className={`ml-2 transition-all duration-300 ${isOpen ? "inline-block" : "hidden"}`}>
                    {text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* 🔹 "나의 그룹" 목록 추가 */}
          <div className={`${isOpen ? "block" : "hidden"}`}>
            <p className="text-gray-500 text-sm  mt-8">나의 그룹</p>
            <div className="mt-2 space-y-2">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <Link
                    key={group.groupId}
                    href={`/groups/${group.groupId}/exams`}
                    className="block text-gray-700 text-sm hover:text-white transition-all duration-200 pl-2 pt-1"
                  >
                  🏡  {group.name}
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">등록된 그룹이 없습니다.</p>
              )}
            </div>
            <p className="text-gray-500 text-sm  mt-8">즐겨찾기</p>
            <p>
              <s>추후에 추가 예정</s>
            </p>
            
          </div>
        </div>
      </div>

      {/* 사이드바 열기 버튼 */}
      <button
        className={`absolute top-[10px] left-[70px] bg-gray-100 text-black rounded-full w-[25px] h-[25px] text-lg cursor-pointer ${
          isOpen ? "hidden" : "block"
        }`}
        onClick={() => setIsOpen(true)}
      >
        ➡️
      </button>
    </>
  );
}
