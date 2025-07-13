"use client";
//클라이언트 컴포넌트 사용
import { group_api } from "@/lib/api"; //사용할 모듈 훅 추가
import { useState, useEffect, useCallback } from "react";

interface GroupCreateModalProps { //groupCreatemodalProps 의 props 타입정의
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  setGroupName: (value: string) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  onCreate: () => void;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
}

export default function GroupCreateModal({//컴포넌트르 외부에서 사용가능하게 
  isOpen,
  onClose,
  groupName,
  setGroupName,
  isPublic,
  setIsPublic,
  onCreate,
  refresh,
  setRefresh,
}: GroupCreateModalProps) { // 타입은 groupvreatmodalprops로
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [showPastGroups, setShowPastGroups] = useState(false);
  // const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ✅ 에러 메시지 상태 추가

  // 예제: 과거 그룹 리스트
  // const pastGroups = ["컴퓨터 구조", "알고리즘", "인공지능 기초"];

  const resetState = useCallback(() => { //값들 초기화 및 에러 메세지 초기화
    setGroupName("");
    setIsPublic(true);
    setIsConfirming(false);
    setIsLoading(false);
    // setSelectedGroup(null);
    // setShowPastGroups(false);
    setErrorMessage(null); // ✅ 에러 메시지도 초기화
  }, [setGroupName, setIsPublic]);

  useEffect(() => { // isOpen에 따른 변화
    if (!isOpen) {
      resetState(); //함수실행
    }
  }, [isOpen, resetState]); //배열의 두 값이 변하는 경우

  if (!isOpen) return null; //isopen이 false인경우 null

  const handleCreate = async () => { //비동기함수 선언
    if (!groupName.trim()) {
      // ✅ 공백 확인 (trim()으로 공백만 입력된 경우 방지)
      setErrorMessage("그룹 이름을 입력하세요!");
      return;
    }

    console.log("그룹 이름:", groupName);
    console.log("공개 여부:", isPublic ? "공개" : "비공개");
    setIsLoading(true); //로딩 켜기
    setErrorMessage(null); // ✅ 에러 메시지 초기화

    try {
      await group_api.group_create(groupName.trim(), !isPublic); //서버함수 사용
      setRefresh(!refresh);
      onCreate();
      resetState();
      onClose();
    } catch (error) { //에러의 경우
      console.error("그룹 생성 중 오류:", error);
    } finally { //로딩 끄기
      setIsLoading(false);
    }
  };

  return ( //UI
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative"
        onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">그룹 생성하기</h2>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="text-gray-800 hover:text-opacity-80 text-2xl">
            ✖
          </button>
        </div>

        {/* 그룹 생성 확인 단계 */}
        {isConfirming ? (
          <div className="text-center my-4">
            <h3 className="text-lg font-semibold mb-4">
              &quot;{groupName}&quot; 그룹을 생성하시겠습니까?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className={`bg-green-600 text-white py-2 px-6 rounded-md transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
                }`}>
                {isLoading ? "생성 중..." : "예"}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="bg-myred text-white py-2 px-6 rounded-md hover:bg-opacity-80 transition">
                아니요
              </button>
            </div>
          </div>
        ) : (
          // 입력 폼
          <div className="flex flex-col gap-3 mt-4">
            {/* 그룹 이름 입력 */}
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setErrorMessage(null); // ✅ 입력하면 에러 메시지 제거
              }}
              placeholder="그룹 이름을 입력하세요"
              className={`w-full p-2 border rounded-lg bg-gray-50 transition text-gray-700 ${
                errorMessage ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-gray-500 focus:outline-none`}
            />
            {/* ✅ 에러 메시지 출력 */}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            {/* 공개/비공개 선택 */}

            <div className="flex justify-between items-center border border-gray-300 p-2 rounded-lg">
              <span className="text-sm text-gray-600">그룹 상태</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`px-4 py-1 rounded-lg text-sm transition ${
                  isPublic ? "bg-mygreen text-white" : "bg-mygray text-white"
                }`}>
                {isPublic ? "공개" : "비공개"}
              </button>
            </div>

            {/* 과거 그룹 불러오기 버튼 */}
            {/* <button
              onClick={() => setShowPastGroups(!showPastGroups)}
              className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 rounded-lg p-2 transition hover:bg-gray-100">
              {showPastGroups ? "▲ 과거 그룹 숨기기" : "▼ 과거 그룹 불러오기"}
            </button> */}

            {/* 과거 그룹 목록 (토글) */}
            {/* {showPastGroups && (
              <div className="border border-gray-300 rounded-lg p-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">그룹 목록</p>
                <ul className="space-y-1">
                  {pastGroups.map((group, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setGroupName(group);
                        setSelectedGroup(group);
                      }}
                      className={`p-2 cursor-pointer rounded-md transition ${
                        selectedGroup === group
                          ? "bg-mygreen text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}>
                      {group}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          </div>
        )}

        {/* 그룹 생성 버튼 */}
        {!isConfirming && (
          <div className="mt-6">
            <button
              onClick={() => setIsConfirming(true)}
              disabled={!groupName.trim()} // ✅ 공백이면 버튼 비활성화
              className={`w-full bg-mygreen text-white py-2 rounded-lg text-lg cursor-pointer hover:bg-opacity-80 transition ${
                !groupName.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {isLoading ? "생성 중..." : "그룹 생성하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
