"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { testExams } from "../../data/testmode"; // 더미 데이터 import

interface ExamSidebarProps {
  groupId: string | null;
  examId: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ExamSidebar({ groupId, examId, isOpen, setIsOpen }: ExamSidebarProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // 시험 남은 시간 (초 단위)

  // ✅ 해당 시험 데이터 가져오기
  const exam = testExams.find((exam) => exam.examId === examId);

  // ✅ 시험 남은 시간 계산
  useEffect(() => {
    if (!exam) return; // 시험 데이터가 없으면 실행 안 함

    const endTime = new Date(exam.endTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const timeDiff = endTime - now;
      if (timeDiff <= 0) {
        setIsOpen(false); // ⏳ 시험이 끝나면 자동으로 드로어 닫기
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(timeDiff / 1000)); // 초 단위 변환
      }
    };

    updateTimer(); // 초기 실행
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval); // 컴포넌트 언마운트 시 정리
  }, [exam, setIsOpen]);

  // ✅ 남은 시간 hh:mm:ss 포맷 변환
  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      {/* 드로어 토글 버튼 */}
      <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={isOpen ? faArrowLeft : faArrowRight} />
      </button>

      {/* 오른쪽 드로어 */}
      <div className={`drawer ${isOpen ? "open" : "closed"}`}>
        {/* 닫기 버튼 */}
        <button className="close-button" onClick={() => setIsOpen(false)}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* 시험 모드 타이틀 */}
        <div className="header">📘 시험 모드</div>

        {/* 문제 정보 */}
        <div className="exam-info">
          <strong className="highlight">{groupId || "알 수 없음"}</strong> 그룹의  
          <strong className="highlight"> {examId || "알 수 없음"}</strong> 시험이 진행 중입니다.
        </div>

        {/* 타이머 (시험 데이터가 있을 때만 표시) */}
        {exam && (
          <div className="timer">
            ⏳ <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* 스타일 */}
      <style jsx>{`
        /* 토글 버튼 */
        .toggle-button {
          position: fixed;
          top: 50%;
          right: ${isOpen ? "280px" : "5px"};
          transform: translateY(-50%);
          background: #ff5c5c;
          color: white;
          border: none;
          padding: 12px;
          font-size: 18px;
          border-radius: 50%;
          cursor: pointer;
          transition: right 0.3s ease-in-out, background 0.2s;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          z-index: 2000;
        }

        .toggle-button:hover {
          background: #e64545;
        }

        /* 드로어 */
        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: ${isOpen ? "280px" : "50px"};
          background: linear-gradient(135deg, #ff6b6b, #ff4757);
          transition: width 0.3s ease-in-out;
          z-index: 1000;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: ${isOpen ? "20px" : "10px"};
          justify-content: ${isOpen ? "center" : "flex-start"};
        }

        /* 닫기 버튼 */
        .close-button {
          display: ${isOpen ? "block" : "none"};
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }

        .close-button:hover {
          transform: rotate(90deg);
        }

        /* 헤더 */
        .header {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          margin-bottom: 15px;
          text-align: center;
        }

        /* 문제 정보 */
        .exam-info {
          text-align: center;
          font-size: 1rem;
          color: white;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          width: 90%;
        }

        /* 강조 */
        .highlight {
          font-weight: bold;
          color: #ffeaa7;
        }

        /* 타이머 */
        .timer {
          background: white;
          color: #ff4757;
          font-size: 2rem;
          font-weight: bold;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 15px;
          width: 90%;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}
