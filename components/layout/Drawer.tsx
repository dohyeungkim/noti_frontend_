"use client";
import Link from "next/link";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faScroll } from "@fortawesome/free-solid-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Drawer() {
  const [isOpen, setIsOpen] = useState(false); //기본 사이드 바는 닫힌 상태

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const openDrawer = () => {
    //사이드 바 열면 오픈 상태를 true로 설정
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Drawer */}
      <div
        className={`drawer ${isOpen ? "open" : "closed"}`}
        onClick={!isOpen ? openDrawer : undefined}
      >
        {/* Profile Section */}
        <div className="profile-section">
          <button className="toggle-button" onClick={toggleDrawer}>
            👤
          </button>
          {isOpen && <p>Hello, 서연 한!</p>}
          <button
            className="sideButton"
            onClick={() => setIsOpen(false)}
            style={{ marginLeft: "auto" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="content">
          <ul>
            <li>
              <Link
                href="/search"
                style={{
                  textDecoration: "none",
                  color: "rgb(88, 88, 88)",
                }}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                &nbsp;{isOpen && " 검색"}
              </Link>
            </li>
            <li>
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  color: "rgb(88, 88, 88)",
                }}
              >
                <FontAwesomeIcon icon={faHouse} /> &nbsp;
                {isOpen && "나의 페이지"}
              </Link>
            </li>
            <li>
              <Link
                className="icon"
                href="/solved"
                style={{
                  textDecoration: "none",
                  color: "rgb(88, 88, 88)",
                }}
              >
                <FontAwesomeIcon icon={faScroll} />
                &nbsp;{isOpen && " 내가 푼 문제 모음"}
              </Link>
            </li>
            <li>
              <Link
                className="icon"
                href="/groups"
                style={{
                  textDecoration: "none",
                  color: "rgb(88, 88, 88)",
                }}
              >
                <FontAwesomeIcon icon={faUsers} />
                &nbsp;
                {isOpen && " 나의 그룹"}
              </Link>
            </li>
            <li>
              <Link
                className="icon"
                href="/my-questions"
                style={{
                  textDecoration: "none",
                  color: "rgb(88, 88, 88)",
                }}
              >
                <FontAwesomeIcon icon={faPen} />
                &nbsp;&nbsp;
                {isOpen && " 문제 등록하기"}
              </Link>
            </li>
            <li>
              <Link
                className="icon"
                href="/notifications"
                style={{
                  textDecoration: "none",
                  color: "rgb(88, 88, 88)",
                }}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp; &nbsp;{isOpen && "알림함"}
              </Link>
            </li>
          </ul>

          {/* 사이드 바 닫으면 여기서부턴 이제 사이드바에 안 보이도록 숨겨야됨 */}
          <p className="p">즐겨찾는 그룹</p>
          <p>
            <s>추후에 추가 예정</s>
          </p>
          <p className="p">즐겨찾는 문제지</p>
          <p>
            <s>추후에 추가 예정</s>
          </p>
          <p className="p">나의 문제지</p>
          <p>
            <s>추후에 추가 예정</s>
          </p>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: ${isOpen ? "250px" : "60px"};
          background: rgb(179, 179, 179);
          transition: width 0.3s ease-in-out;
          z-index: 1000;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          cursor: ${isOpen ? "default" : "pointer"};
          border-top-right-radius: 20px;
          border-bottom-right-radius: 20px;
        }

        .drawer.closed {
          cursor: pointer;
        }

        .profile-section {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: rgb(179, 179, 179);
          color: rgb(64, 64, 64);
        }

        .profile-section p {
          margin-left: 0.5rem;
        }

        .toggle-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.8rem;
          cursor: pointer;
        }

        .content {
          padding: 1rem;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        ul li {
          margin: 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        ul li a {
          text-decoration: none;
          color: #0070f3;
          display: flex;
          align-items: center;
        }

        ul li span {
          font-size: 1.2rem;
        }

        .noto-sans-kr-<uniquifier > {
          font-family: "Noto Sans KR", serif;
          font-optical-sizing: auto;
          font-weight: <weight>;
          font-style: normal;
        }

        .p {
          color: grey;
          font-size: 12px;
        }

        .sideButton {
          color: grey;
          border: 0;
          float: right;
          background-color: transparent;
          cursor: pointer;
          visibility: ${isOpen ? "default" : "hidden"};
        }
      `}</style>
    </>
  );
}
