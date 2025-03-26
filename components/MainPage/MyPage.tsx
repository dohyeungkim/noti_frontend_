"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { group_api, member_request_api } from "@/lib/api";
import SearchBar from "../ui/SearchBar";
import SortButton from "../ui/SortButton";

interface Group {
  group_id: number;
  group_name: string;
  group_owner: string;
  group_private_state: boolean;
  is_member: boolean;
  member_count: number;
}

type SortType = "title" | "notJoined";

export default function MyPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [sortType, setSortType] = useState<SortType>("title");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data: Group[] = await group_api.group_get();
        setGroups(data);
        setFilteredGroups(data);
      } catch (err) {
        setError("그룹 정보를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const filterGroups = useCallback(() => {
    let sortedGroups = [...groups];

    if (sortType === "title") {
      sortedGroups.sort((a, b) => a.group_name.localeCompare(b.group_name));
    } else if (sortType === "notJoined") {
      sortedGroups.sort((a, b) => Number(a.is_member) - Number(b.is_member));
    }

    return sortedGroups.filter((item) =>
      item.group_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, groups, sortType]);

  useEffect(() => {
    setFilteredGroups(filterGroups());
  }, [filterGroups]);

  const handleClickPublicJoinButton = async (group_id: number) => {
    if (window.confirm("그룹에 참여하시겠습니까?")) {
      alert("요청을 보냈습니다.");
      await member_request_api.member_request_create(group_id);
    }
  };

  return (
    <motion.div>
      <motion.div className="flex items-center gap-4 mb-4 w-full">
        <SearchBar searchQuery={search} setSearchQuery={setSearch} />
  
        <SortButton
          sortOptions={["제목순", "미참여"]}
          onSortChange={() =>
            setSortType((prev) => (prev === "title" ? "notJoined" : "title"))
          }
        ></SortButton>
      </motion.div>
      <motion.h2
        className="text-2xl font-bold mb-4 m-2 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        모든 그룹
      </motion.h2>
      <motion.hr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />
      {loading && (
        <p className="text-center text-gray-500">
          🔄 그룹 정보를 불러오는 중...
        </p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
  
      {!loading && !error && filteredGroups.length === 0 && (
        <p className="text-center text-gray-500">등록된 그룹이 없습니다.</p>
      )}
  
      {!loading && !error && filteredGroups.length > 0 && (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredGroups.map(
            (group) =>
              !group.group_private_state && (
                <motion.div
                  key={group.group_id}
                  className="relative p-6 border rounded-2xl shadow-md bg-white transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                    ${
                      group.group_private_state
                        ? "bg-mygray text-white"
                        : "bg-mypublic text-white"
                    }`}
                  >
                    {group.group_private_state ? "비공개" : "공개"}
                  </div>
  
                  <h2 className="text-xl font-bold mb-2 text-gray-800">
                    {group.group_name.length > 8
                      ? `${group.group_name.slice(0, 8)}...`
                      : group.group_name}
                  </h2>
  
                  <p className="mb-1 text-gray-600">
                    👥 수강생:{" "}
                    <span className="font-medium text-gray-700">
                      {group.member_count}명
                    </span>
                  </p>
                  <div className="flex justify-between items-center text-sm font-semibold mt-4">
                    <span className="text-gray-700">
                      👨‍🏫 그룹장:{" "}
                      <span className="text-gray-900">{group.group_owner}</span>
                    </span>
                  </div>
  
                  {group.is_member ? (
                    <button
                      className="mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all active:scale-95 bg-mygreen text-white hover:bg-opacity-80"
                      onClick={() =>
                        (window.location.href = `/mygroups/${group.group_id}`)
                      }
                    >
                      들어가기
                    </button>
                  ) : (
                    <button
                      className="mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all active:scale-95 bg-mydarkgreen text-white hover:bg-opacity-80"
                      onClick={() =>
                        handleClickPublicJoinButton(group.group_id)
                      }
                    >
                      그룹 참여하기 →
                    </button>
                  )}
                </motion.div>
              )
          )}
        </motion.div>
      )}
    </motion.div>
  );
  
}
