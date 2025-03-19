"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHouse,
  faScroll,
  faUsers,
  faPen,
  faUserCircle,
  faArrowRight,
  faRightFromBracket,
  faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";
import Logout from "../Auth/Logout";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/stores/auth";
import PasswordChange from "../Auth/PasswordChange";

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Drawer({ isOpen, setIsOpen }: DrawerProps) {
  const { userName } = useAuth();
  const [groups, setGroups] = useState<
    {
      group_id: number;
      group_name: string;
      group_owner: string;
      group_private_state: boolean;
      member_count: number;
      createdAt?: string;
    }[]
  >([]);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/groups/my", { cache: "no-cache" });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setGroups(data);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("내 그룹 정보 가져오기 실패:", error);
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // ✅ 10자 이상 그룹명 `...` 처리
  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <>
      {/* 사이드바 */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#E5E7EB] shadow-lg overflow-hidden rounded-r-2xl transition-all duration-300 z-[1000] ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
          {/* 프로필 영역 */}
          <div className="flex items-center p-3 bg-gray-200 text-gray-700">
            <button className="text-lg cursor-pointer bg-transparent border-none">
              <FontAwesomeIcon icon={faUserCircle} size="2x" className="text-gray-500" />
            </button>
            <p
              className={`ml-2 transition-all duration-300 text-sm ${isOpen ? "block" : "hidden"}`}
            >
              {userName ? `안녕하세요. ${userName}님!` : "Loading..."}
            </p>
            <button
              className={`ml-auto transition-all duration-300 ${isOpen ? "block" : "hidden"}`}
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-500" />
            </button>
          </div>
        

        {/* 네비게이션 메뉴 */}
        <div className="p-4">
          <ul className="list-none p-0">
            {[
              { href: "/mypage", icon: faHouse, text: "홈" },
              { href: "/mygroups", icon: faUsers, text: "나의 그룹" },
              {
                href: "/solved-problems",
                icon: faScroll,
                text: "내가 푼 문제 모음",
              },
              {
                href: "/registered-problems",
                icon: faPen,
                text: "내가 등록한 문제들",
              },
            ].map(({ href, icon, text }) => (
              <li key={href} className="my-4 flex items-center gap-2">
                <Link
                  href={href}
                  className="no-underline text-gray-700 flex items-center hover:text-black"
                >
                  <button className="border-none bg-transparent text-lg cursor-pointer">
                    <FontAwesomeIcon icon={icon} className="text-gray-500" />
                  </button>
                  <span
                    className={`ml-2 transition-all duration-300 text-sm ${
                      isOpen ? "inline" : "hidden"
                    }`}
                  >
                    {text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* "나의 그룹" 목록 추가 */}
          <div className={`${isOpen ? "block" : "hidden"}`}>
            <p className="text-gray-500 text-xs sm:text-sm mt-4">나의 그룹</p>

            {/* ✅ 그룹 개수 15개 이상이면 스크롤 추가 */}
            <div
              className="mt-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
            >
              {groups.length > 0 ? (
                groups.map((group) => (
                  <Link
                    key={group.group_id}
                    href={`/mygroups/${group.group_id}`}
                    className="block text-gray-900 text-xs sm:text-sm hover:text-black transition-all duration-200 pl-3 pt-2"
                  >
                    🏡 <span className="text-gray-700">{truncateText(group.group_name, 10)}</span>
                  </Link>
                ))
              ) : (
                <p className="text-gray-700 text-xs sm:text-sm">등록된 그룹이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 비번 변경, 로그아웃 */}
        <div className="absolute bottom-0 left-0 w-full pl-4">
          <ul className="list-none p-0">
            <li className="my-4 flex items-center gap-2">
              <button className="border-none bg-transparent text-lg cursor-pointer">
                <FontAwesomeIcon icon={faUnlockAlt} className="text-gray-500" />
              </button>
              <span className={`text-gray-700 flex items-center hover:text-black transition-all text-sm ${isOpen ? "inline" : "hidden"}`}>
                <PasswordChange />
              </span>
            </li>
            <li className="my-4 flex items-center gap-2">
              <button className="border-none bg-transparent text-lg cursor-pointer">
                <FontAwesomeIcon icon={faRightFromBracket} className="text-gray-500" />
              </button>
              <span className={`text-gray-700 flex items-center hover:text-black transition-all text-sm ${isOpen ? "inline" : "hidden"}`}>
                <Logout />
              </span>
            </li>
          </ul>
        </div>
      </div>

      <button
        className={`absolute top-[10px] left-[70px] bg-gray-100 text-black rounded-full w-8 h-8 text-lg cursor-pointer ${
          isOpen ? "hidden" : "block"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <FontAwesomeIcon icon={faArrowRight} className="text-gray-500" />
      </button>
    </>
  );
}
