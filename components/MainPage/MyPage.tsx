"use client";

import { useCallback, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { motion } from "framer-motion";
import "react-calendar-heatmap/dist/styles.css";
import { group_api, member_request_api } from "@/lib/api";
import SearchBar from "../ui/SearchBar";
import SortButton from "../ui/SortButton";

Chart.register(...registerables);

export default function MyPage() {
  // ✅ 그룹 데이터 상태
  const [groups, setGroups] = useState<
    {
      group_id: number;
      group_name: string;
      group_owner: string;
      group_private_state: boolean;
      is_member: boolean;
      member_count: number;
    }[]
  >([]);
  const [filteredGroups, setFilteredGroups] = useState<
    {
      group_id: number;
      group_name: string;
      group_owner: string;
      group_private_state: boolean;
      is_member: boolean;
      member_count: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ API에서 그룹 목록 가져오기
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await group_api.group_get();
        setGroups(data);
        setFilteredGroups(data);
        console.log(data);
      } catch (err) {
        console.error("❌ 그룹 데이터 불러오기 실패:", err);
        setError("그룹 정보를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const [search, setSearch] = useState("");
  const filterGroups = useCallback(() => {
    return groups.filter((item) => item.group_name.toLowerCase().includes(search.toLowerCase()));
  }, [search, groups]);

  useEffect(() => {
    setFilteredGroups(filterGroups());
  }, [filterGroups]); // ✅ useCallback을 활용하여 불필요한 실행 방지

  const handleClickPublicJoinButton = async (group_id: number) => {
    const isConfirmed = window.confirm("그룹에 참여하시겠습니까?");
    if (isConfirmed) {
      alert("요청을 보냈습니다. ");
      await member_request_api.member_request_create(group_id);
    }
  };

  return (
    <motion.div>
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SearchBar searchQuery={search} setSearchQuery={setSearch} />
        <SortButton onSortChange={() => {}} />
      </motion.div>

      {/* 📌 모든 그룹 */}
      <motion.h2
        className="text-2xl font-bold mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        📌 모든 그룹
      </motion.h2>
      <motion.hr
        className="border-gray-300 my-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      {/* 로딩 중 메시지 */}
      {loading && <p className="text-center text-gray-500">🔄 그룹 정보를 불러오는 중...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* 🔥 그룹 카드 리스트 */}
      {!loading && !error && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredGroups.map(
            (group) =>
              !group.group_private_state && (
                <motion.div
                  key={group.group_id}
                  className="relative p-6 border rounded-2xl shadow-md bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1 min-h-[180px]"
                  whileHover={{ scale: 1.02 }}
                >
                  {/* 🔵 그룹 상태 배지 */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                  ${
                    group.group_private_state
                      ? "bg-[rgb(134,140,136)] text-white"
                      : "bg-[rgb(120,148,129)] text-white"
                  }`}
                  >
                    {group.group_private_state ? "비공개" : "공개"}
                  </div>

                  {/* 그룹 정보 */}
                  <h2 className="text-xl font-bold mb-2 text-gray-800">
                    {group.group_name.length > 8
                      ? `${group.group_name.slice(0, 8)}...`
                      : group.group_name}
                  </h2>

                  <p className="mb-1 text-gray-600">
                    👥 수강생:{" "}
                    <span className="font-medium text-gray-700">{group.member_count}명</span>
                  </p>

                  <div className="flex justify-between items-center text-sm font-semibold mt-4">
                    <span className="text-gray-700">
                      👨‍🏫 그룹장: <span className="text-gray-900">{group.group_owner}</span>
                    </span>
                  </div>
                  {/* ✅ 그룹 참여 버튼 */}
                  {group.is_member ? (
                    <button
                      className="mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-[rgb(73,118,88)] text-white hover:bg-[rgb(169,100,100)]"
                      onClick={() => {
                        window.location.href = `/mygroups/${group.group_id}`;
                      }}
                    >
                      들어가기
                    </button>
                  ) : (
                    <button
                      className="mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-[rgb(23,58,35)] text-white hover:bg-[rgb(165,74,74)]"
                      onClick={() => {
                        handleClickPublicJoinButton(group.group_id);
                      }}
                    >
                      그룹 참여하기 →
                    </button>
                  )}
                </motion.div>
              )
          )}
        </motion.div>
      )}
      {/* 📊 학습 진행 상황 */}
      {/* <motion.h2
        className="text-2xl font-bold mt-10 mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        📊 학습 진행 상황
      </motion.h2>
      <motion.hr
        className="border-gray-300 my-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />
      <motion.div
        className="w-full lg:w-2/3 mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Bar data={data} />
      </motion.div> */}
    </motion.div>
  );
}
