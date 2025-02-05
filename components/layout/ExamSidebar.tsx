"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import { testExams } from "../../data/testmode"; // 더미 데이터 import

interface ExamSidebarProps {
  groupId: string | null;
  examId: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ExamSidebar({ groupId, examId, isOpen, setIsOpen }: ExamSidebarProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const exam = testExams.find((exam) => exam.examId === examId);

  useEffect(() => {
    if (!exam) return;
    const endTime = new Date(exam.endTime).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const timeDiff = endTime - now;
      if (timeDiff <= 0) {
        setIsOpen(false);
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(timeDiff / 1000));
      }
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [exam, setIsOpen]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      {/* 오른쪽 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full bg-gradient-to-br from-red-400 to-red-500 shadow-lg overflow-hidden rounded-l-2xl flex flex-col items-center p-5 transition-all duration-300 cursor-pointer
          ${isOpen ? "w-[280px]" : "w-[50px] flex items-center justify-center"}`}
        onClick={() => setIsOpen(true)} // 전체 클릭 시 열기
      >
        {/* 닫기 버튼 (열려 있을 때만 보이도록) */}
        {isOpen && (
          <button
            className="absolute top-3 right-3 text-white text-2xl cursor-pointer transition-transform hover:rotate-90"
            onClick={(e) => {
              e.stopPropagation(); // 부모 클릭 방지
              setIsOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        {/* 닫혀있을 때 아이콘만 표시 */}
        {!isOpen && (
          <FontAwesomeIcon icon={faArrowRight} className="text-white text-2xl" />
        )}

        {/* 시험 모드 타이틀 */}
        {isOpen && <div className="text-2xl font-bold text-white mb-4">📘 시험 모드</div>}

        {/* 문제 정보 */}
        {isOpen && (
          <div className="text-center text-white text-lg bg-white/20 px-4 py-2 rounded-lg mb-4 w-full">
            <strong className="text-yellow-300">{groupId || "알 수 없음"}</strong> 그룹의  
            <strong className="text-yellow-300"> {examId || "알 수 없음"}</strong> 시험이 진행 중입니다.
          </div>
        )}

        {/* 타이머 (시험 데이터가 있을 때만 표시) */}
        {isOpen && exam && (
          <div className="bg-white text-red-500 text-3xl font-bold py-4 px-6 rounded-lg shadow-md">
            ⏳ <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
    </>
  );
}
