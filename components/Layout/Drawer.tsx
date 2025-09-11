"use client";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons"; //추가
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
} from "@fortawesome/free-solid-svg-icons";
import Logout, { LogoutHandles } from "../Auth/Logout";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/stores/auth";
import PasswordChange, { PasswordChangeHandles } from "../Auth/PasswordChange";
import { group_api } from "@/lib/api";

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Drawer({ isOpen, setIsOpen }: DrawerProps) {
  const { userName, checkAuthStatus } = useAuth();
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

  // PasswordChange와 Logout 컴포넌트의 ref 생성
  const passwordChangeRef = useRef<PasswordChangeHandles>(null);
  const logoutRef = useRef<LogoutHandles>(null);

  const fetchGroup = async () => {
    try {
      const data = await group_api.my_group_get();
      if (Array.isArray(data) && data.length > 0) {
        setGroups(data);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("내 그룹 정보 가져오기 실패:", error);
      setGroups([]);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 인증 상태 확인
    checkAuthStatus();
    fetchGroup();
  }, [checkAuthStatus]);

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <>
      {/* 사이드바 */}
      <div className={`fixed top-0 left-0 h-full bg-[#E5E7EB] shadow-lg overflow-visible rounded-r-2xl transition-all duration-300 z-[1000] ${isOpen ? "w-48" : "w-11"}`}>
        {/* 프로필 영역 */}
        <div className="flex items-center p-3 bg-gray-200 text-gray-700">
          <button className="text-sm cursor-pointer bg-transparent border-none" onClick={() => setIsOpen(true)}>
            <FontAwesomeIcon
              icon={faUserCircle}
              size="lg"
              className="text-gray-500"
            />
          </button>
          <p
            className={`ml-1.5 transition-all duration-300 text-xs ${
              isOpen ? "block" : "hidden"
            }`}
          >
            {userName ? `안녕하세요. ${userName}님!` : "Loading..."}
          </p>
          <button
            className={`ml-auto transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-gray-500 text-sm"
            />
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <div className="p-3">
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
              {//파일로 문제 생성
                href: "/problemmake",
                icon: faLightbulb,
                text: "파일로 문제 넣기",
              },
            ].map(({ href, icon, text }) => (
              <li
                key={href}
                className="my-3 flex items-center gap-1.5 relative group"
              >
                <Link
                  href={href}
                  className="no-underline text-gray-700 flex items-center hover:text-black"
                  aria-label={text}
                >
                  <button className="border-none bg-transparent text-sm cursor-pointer">
                    <FontAwesomeIcon icon={icon} className="text-gray-500" />
                  </button>

                  {/* 사이드바 펼쳐졌을 때는 기존 텍스트 노출 */}
                  <span
                    className={`ml-1.5 transition-all duration-300 text-xs ${
                      isOpen ? "inline" : "hidden"
                    }`}
                  >
                    {text}
                  </span>
                </Link>

                {/* 사이드바 접혀 있을 때만 커스텀 툴팁 노출 */}
                {!isOpen && (
                  <span
                    className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2
                       whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white
                       opacity-0 shadow-md transition-opacity duration-150
                       group-hover:opacity-100 z-[2000]"
                  >
                    {text}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* "나의 그룹" 목록 */}
          <div className={`${isOpen ? "block" : "hidden"}`}>
            <p className="text-gray-500 text-xs mt-3">나의 그룹</p>
            <div className="mt-1.5 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <Link
                    key={group.group_id}
                    href={`/mygroups/${group.group_id}`}
                    className="block text-gray-900 text-xs hover:text-black transition-all duration-200 pl-2 pt-1.5"
                  >
                    🏡{" "}
                    <span className="text-gray-700">
                      {truncateText(group.group_name, 12)}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-gray-700 text-xs">등록된 그룹이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 비밀번호 변경, 로그아웃 */}
        <div className="absolute bottom-0 left-0 w-full pl-3 pb-2">
          <ul className="list-none p-0">
            <li
              className="my-3 flex items-center gap-1.5 cursor-pointer"
              onClick={() => passwordChangeRef.current?.openModal()}
            >
              <PasswordChange ref={passwordChangeRef} />
              <span
                className={`text-gray-700 ml-1.5 transition-all duration-300 text-xs ${
                  isOpen ? "inline" : "hidden"
                }`}
              >
                비밀번호 변경하기
              </span>
            </li>
            <li
              className="my-3 flex items-center gap-1.5 cursor-pointer"
              onClick={() => logoutRef.current?.logout()}
            >
              <Logout ref={logoutRef} />
              <span
                className={`text-gray-700 ml-1.5 transition-all duration-300 text-xs ${
                  isOpen ? "inline" : "hidden"
                }`}
              >
                로그아웃
              </span>
            </li>
          </ul>
        </div>
      </div>

      <button
        className={`fixed z-[9999] top-[8px] left-[52px] bg-gray-100 text-black rounded-full w-6 h-6 text-sm cursor-pointer ${
          isOpen ? "hidden" : "block"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <FontAwesomeIcon
          icon={faArrowRight}
          className="text-gray-500 text-xs"
        />
      </button>
    </>
  );
}
