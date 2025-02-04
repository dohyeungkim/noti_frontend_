"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faHouse, faScroll, faUsers, faPen, faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// ✅ Props 타입 정의
interface DrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Drawer({ isOpen, setIsOpen }: DrawerProps) {
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const openDrawer = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Drawer */}
      <div className={`drawer ${isOpen ? "open" : "closed"}`} onClick={!isOpen ? openDrawer : undefined}>
        {/* Profile Section */}
        <div className="profile-section">
          <button className="toggle-button" onClick={toggleDrawer}>
            👤
          </button>
          {isOpen && <p>Hello, 서연 한!</p>}
          <button className="sideButton" onClick={() => setIsOpen(false)} style={{ marginLeft: "auto" }}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="content">
          <ul>
            <li>
              <Link href="/search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                &nbsp;{isOpen && " 검색"}
              </Link>
            </li>
            <li>
              <Link href="/">
                <FontAwesomeIcon icon={faHouse} /> &nbsp;
                {isOpen && "나의 페이지"}
              </Link>
            </li>
            <li>
              <Link href="/solved">
                <FontAwesomeIcon icon={faScroll} />
                &nbsp;{isOpen && " 내가 푼 문제 모음"}
              </Link>
            </li>
            <li>
              <Link href="/groups">
                <FontAwesomeIcon icon={faUsers} />
                &nbsp;
                {isOpen && " 나의 그룹"}
              </Link>
            </li>
            <li>
              <Link href="/my-questions">
                <FontAwesomeIcon icon={faPen} />
                &nbsp;&nbsp;
                {isOpen && " 문제 등록하기"}
              </Link>
            </li>
            <li>
              <Link href="/notifications">
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp; &nbsp;{isOpen && "알림함"}
              </Link>
            </li>
          </ul>

          {/* 사이드 바 닫으면 숨김 */}
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

        .profile-section {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: rgb(179, 179, 179);
          color: rgb(64, 64, 64);
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
          color:rgb(90, 90, 90);
          display: flex;
          align-items: center;
        }

        .sideButton {
          color: grey;
          border: 0;
          background-color: transparent;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
