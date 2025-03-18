"use client";
import { useState, useEffect, useCallback } from "react";

interface Group {
  group_id: number;
  group_name: string;
  group_owner: string;
  group_private_state: boolean;
  member_count: number;
}
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
  const [pastGroups, setPastGroups] = useState<Group[]>([]); // ✅ API에서 가져온 그룹 목록
  const [isLoadingGroups, setIsLoadingGroups] = useState(false); // ✅ 그룹 불러오는 상태 추가

  // 예제: 과거 그룹 리스트
  //const pastGroups = ["컴퓨터 구조", "알고리즘", "인공지능 기초"];

  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert("그룹 이름을 입력하세요!"); // ✅ 빈 입력 방지
      return;
    }

    console.log("🔵 그룹 생성 요청:", {
      group_name: groupName,
      is_public: isPublic,
    });

    setIsLoading(true);

    try {
      const response = await fetch(`/api/proxy/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          group_name: groupName,
          group_private_state: !isPublic, // ✅ 공개 여부 반전
        }),
      });

      if (!response.ok) {
        throw new Error(`그룹 생성 실패 (HTTP ${response.status})`);
      }

      const data = await response.json();
      console.log("✅ 그룹 생성 성공:", data);

      alert(`그룹 "${groupName}"이(가) 생성되었습니다!`);

      setRefresh(!refresh); // ✅ UI 업데이트 강제 실행
      onCreate(); // ✅ 화면 갱신을 위한 추가 트리거
      resetState();
      onClose();
    } catch (error) {
      console.error("❌ 그룹 생성 중 오류 발생:", error);
      alert("그룹 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 과거 그룹 불러오는 함수 (API 호출)
  const fetchPastGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const response = await fetch(`/api/proxy/groups`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("과거 그룹 불러오기 실패");

      const data: Group[] = await response.json();
      setPastGroups(data);
    } catch (error) {
      console.error("과거 그룹 불러오는 중 오류 발생:", error);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (showPastGroups && pastGroups.length === 0) {
      fetchPastGroups(); // ✅ 그룹 목록을 토글할 때만 API 호출
    }
  }, [showPastGroups, fetchPastGroups, pastGroups.length]);

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
            className="text-red-500 hover:text-red-700 text-2xl"
          >
            ✖
          </button>
        </div>

        {/* 입력 폼 */}
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
                isPublic
                  ? "bg-gray-800 text-white"
                  : "bg-gray-400 text-gray-800"
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
              <p className="text-sm font-semibold text-gray-700 mb-2">
                그룹 목록
              </p>

              {isLoadingGroups ? (
                <p className="text-gray-500 text-center">
                  ⏳ 그룹을 불러오는 중...
                </p>
              ) : (
                <ul className="space-y-1">
                  {pastGroups.length > 0 ? (
                    pastGroups.map((group) => (
                      <li
                        key={group.group_id}
                        onClick={() => {
                          setGroupName(group.group_name);
                          setSelectedGroup(group.group_name);
                        }}
                        className={`p-2 cursor-pointer rounded-md transition ${
                          selectedGroup === group.group_name
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {group.group_name}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      📭 등록된 그룹이 없습니다.
                    </p>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* 그룹 생성 버튼 */}
        <div className="mt-6">
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className={`w-full bg-gray-800 text-white py-2 rounded-lg text-lg cursor-pointer hover:bg-gray-900 transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "생성 중..." : "그룹 생성하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
