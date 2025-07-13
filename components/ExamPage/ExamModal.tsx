"use client"; //클라이언트 컴포넌트
//사용할 모듈, 컴포넌트, 훅 추가 
import { workbook_api } from "@/lib/api";
import { useState } from "react";

interface WorkBookCreateModalProps { //workbook...의 props타입 정의
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  WorkBookName: string;
  setWorkBookName: (name: string) => void;
  WorkBookDescription: string;
  setWorkBookDescription: (description: string) => void;
  group_id: number;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
  // isPublic: boolean;
  // setIsPublic: (value: boolean) => void;
}

export default function WorkBookCreateModal({//다른곳에서도 import해서 사용할 수 있게
  isModalOpen,
  setIsModalOpen,
  WorkBookName,
  setWorkBookName,
  WorkBookDescription,
  setWorkBookDescription,
  refresh,
  setRefresh,
  group_id,

}: WorkBookCreateModalProps) { //타입을 WorkBookCrateModalProps인터페이스로 지정 
  // const [isPublic, setIsPublic] = useState(true); // 또는 초기 상태에 따라 false일 수 있습니다.

  const [isLoading, setIsLoading] = useState(false); //set함수를 통해 값 변경
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ✅ 에러 메시지 추가

  const handleCreateWorkbook = async () => { //비동기함수 선언
    if (!WorkBookName.trim()) { //trim으로 앞 뒤 공백을 제거 하고 workbookname이 비어있으면 실행
      setErrorMessage("📌 문제지 이름을 입력해주세요!");
      return;
    }

    if (!WorkBookDescription.trim()) { //workbookdescription이 비어있으면 실행
      setErrorMessage("📌 문제지 소개를 입력해주세요!");
      return;
    }

    setIsLoading(true); //로딩시작
    setErrorMessage(null); // ✅ 에러 메시지 초기화

    try {
      await workbook_api.workbook_create(group_id, WorkBookName.trim(), WorkBookDescription.trim());
      //await을 이용하여 workbook에 관한 응답을 받을때까지 기다림
      setWorkBookName(""); //초기화
      setWorkBookDescription("");
      setIsModalOpen(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error("문제지 생성 실패:", error); //에러의 경우처리
    } finally { // 로딩 종료
      setIsLoading(false);
    }
  };

  if (!isModalOpen) return null; //모달이 닫혀있다면 null: 이 컴포넌트를 표시안함

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">문제지 추가하기</h2>
          <button
            onClick={() => {
              setErrorMessage(null); // ✅ 모달 닫을 때 에러 메시지 초기화
              setIsModalOpen(false);
            }}
            className="text-gray-800 hover:text-opacity-80 text-2xl"
          >
            ✖
          </button>
        </div>

        {/* 입력 폼 */}
        {!isConfirming ? (
          <div className="flex flex-col gap-4 mt-4">
            {/* ✅ 문제지 이름 입력 */}
            <input
              type="text"
              value={WorkBookName}
              onChange={(e) => {
                setWorkBookName(e.target.value);
                setErrorMessage(null); // ✅ 입력하면 에러 메시지 제거
              }}
              placeholder="문제지 이름"
              className={`p-2 border rounded-md transition ${
                errorMessage && WorkBookName.trim() === "" ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-gray-500 focus:outline-none`}
            />

            {/* ✅ 문제지 소개 입력 */}
            <textarea
              value={WorkBookDescription}
              onChange={(e) => {
                setWorkBookDescription(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="문제지 소개"
              className={`p-2 border rounded-md h-20 transition ${
                errorMessage && WorkBookDescription.trim() === "" ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-gray-500 focus:outline-none`}
            />

            

            {/* ✅ 에러 메시지 출력 */}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          
            {/* <div className="flex justify-between items-center border border-gray-300 p-2 rounded-lg">
              <span className="text-sm text-gray-600">그룹 상태</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`px-4 py-1 rounded-lg text-sm transition ${
                  isPublic ? "bg-mygreen text-white" : "bg-mygray text-white"
                }`}
              >
                {isPublic ? "공개" : "비공개"}
              </button>
            </div>
 */}


          </div>

          
        ) : (
          // ✅ 문제지 생성 확인 단계
          <div className="text-center my-4">
            <h3 className="text-lg font-semibold mb-4">
              &quot;{WorkBookName}&quot; 문제지를 생성하시겠습니까?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCreateWorkbook}
                disabled={isLoading}
                className={`bg-mygreen text-white py-2 px-6 rounded-md transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                {isLoading ? "생성 중..." : "예"}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="bg-myred text-white py-2 px-6 rounded-md hover:bg-red-700 transition"
              >
                아니요
              </button>
            </div>
          </div>
        )}

        {/* 문제지 생성 버튼 */}
        {!isConfirming && (
          <button
            onClick={() => {
              if (!WorkBookName.trim() || !WorkBookDescription.trim()) {
                setErrorMessage("📌 문제지 이름과 소개를 입력해주세요!");
                return;
              }
              setIsConfirming(true);
            }}
            disabled={isLoading}
            className={`mt-4 w-full bg-mygreen text-white py-3 rounded-md text-lg cursor-pointer hover:bg-opacity-80 transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "생성 중..." : "문제지 생성하기"}
          </button>
        )}
      </div>
    </div>
  );
}
