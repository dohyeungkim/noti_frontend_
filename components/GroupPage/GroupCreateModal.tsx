"use client";
import { useState, useEffect, useCallback } from "react";

interface GroupCreateModalProps {
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

export default function GroupCreateModal({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  isPublic,
  setIsPublic,
  onCreate,
  refresh,
  setRefresh,
}: GroupCreateModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPastGroups, setShowPastGroups] = useState(false); // 과거 그룹 토글 상태
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // 예제: 과거 그룹 리스트
  const pastGroups = ["컴퓨터 구조", "알고리즘", "인공지능 기초"];

  const resetState = useCallback(() => {
    setGroupName("");
    setIsPublic(true);
    setIsConfirming(false);
    setIsLoading(false);
    setSelectedGroup(null);
    setShowPastGroups(false);
  }, [setGroupName, setIsPublic, setIsConfirming, setIsLoading]);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    console.log("그룹 이름:", groupName);
    console.log("공개 여부:", isPublic ? "공개" : "비공개");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/proxy/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          group_name: groupName,
          group_private_state: !isPublic,
        }),
      });

      if (!response.ok) throw new Error("그룹 생성 실패");

      const data = await response.json();
      console.log("그룹 생성 성공:", data);
      setRefresh(!refresh);
      onCreate();
      resetState();
      onClose();
    } catch (error) {
      console.error("그룹 생성 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">그룹 생성하기</h2>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="text-gray-800 hover:text-opacity-80 text-2xl"
          >
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
                }`}
              >
                {isLoading ? "생성 중..." : "예"}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="bg-myred text-white py-2 px-6 rounded-md hover:bg-opacity-80 transition"
              >
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
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹 이름을 입력하세요"
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none transition text-gray-700"
            />

            {/* 공개/비공개 선택 */}
            <div className="flex justify-between items-center border border-gray-300 p-2 rounded-lg">
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

            {/* 과거 그룹 불러오기 버튼 */}
            <button
              onClick={() => setShowPastGroups(!showPastGroups)}
              className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 rounded-lg p-2 transition hover:bg-gray-100"
            >
              {showPastGroups ? "▲ 과거 그룹 숨기기" : "▼ 과거 그룹 불러오기"}
            </button>

            {/* 과거 그룹 목록 (토글) */}
            {showPastGroups && (
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
                      }`}
                    >
                      {group}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 그룹 생성 버튼 */}
        {!isConfirming && (
          <div className="mt-6">
            <button
              onClick={() => setIsConfirming(true)}
              disabled={isLoading}
              className={`w-full bg-mygreen text-white py-2 rounded-lg text-lg cursor-pointer hover:bg-opacity-80 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "생성 중..." : "그룹 생성하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
