"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { group_api, member_request_api } from "@/lib/api"
import SearchBar from "../ui/SearchBar"
import SortButton from "../ui/SortButton"

// group_get에서 받아와야되는 정보들
interface Group {
  group_id: number
  group_name: string
  group_owner: string                 // 아이디(폴백용)
  owner_name?: string                 // ✅ 실제 이름(응답에 있음)
  group_private_state: boolean
  is_member: boolean
  is_pending_member: boolean
  member_count: number
}

type SortType = "title" | "notJoined"

export default function MyPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [sortType, setSortType] = useState<SortType>("title")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [joiningId, setJoiningId] = useState<number | null>(null) // 요청 중인 그룹 버튼 비활성화

  // ✅ 공통 조회 함수: 최초 로딩 + 새로고침 버튼에서 재사용
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      // owner_name을 포함해 그대로 받아옴
      const data: Group[] = await group_api.group_get()
      setGroups(data)
      setFilteredGroups(data)
    } catch {
      setError("그룹 정보를 가져오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const filterGroups = useCallback(() => {
    const sortedGroups = [...groups]

    if (sortType === "title") {
      sortedGroups.sort((a, b) => a.group_name.localeCompare(b.group_name))
    } else if (sortType === "notJoined") {
      // 미참여 우선
      sortedGroups.sort((a, b) => {
        const av = a.is_member ? 1 : 0
        const bv = b.is_member ? 1 : 0
        if (av !== bv) return av - bv
        return a.group_name.localeCompare(b.group_name)
      })
    }

    return sortedGroups.filter((item) =>
      item.group_name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, groups, sortType])

  useEffect(() => {
    setFilteredGroups(filterGroups())
  }, [filterGroups])

  // 그룹에 참가 요청 보내는 버튼 - 전송 후 바로 '요청 수락 대기'로 변경(낙관적 업데이트)
  const handleClickPublicJoinButton = async (group_id: number) => {
    if (!window.confirm("그룹에 참여하시겠습니까?")) return
    setJoiningId(group_id)

    // 낙관적 업데이트: 화면 즉시 변경
    setGroups((prev) =>
      prev.map((g) =>
        g.group_id === group_id ? { ...g, is_pending_member: true } : g
      )
    )

    try {
      const res = await member_request_api.member_request_create(group_id)
      if (res?.message) alert(res.message)
      // 필요시 강제 동기화
      // await fetchGroups()
    } catch (e: any) {
      // 실패 시 롤백
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id === group_id ? { ...g, is_pending_member: false } : g
        )
      )
      alert(e?.message || "참여 요청 중 오류가 발생했습니다.")
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <motion.div className="scale-90 origin-top-left w-[111%]">
      <motion.div className="flex items-center gap-4 mb-4 w-full">
        <SearchBar searchQuery={search} setSearchQuery={setSearch} />

        <SortButton
          sortOptions={["제목순", "미참여"]}
          onSortChange={() =>
            setSortType((prev) => (prev === "title" ? "notJoined" : "title"))
          }
        />
      </motion.div>

      {/* ✅ 제목 + 오른쪽 새로고침 버튼 */}
      <div className="flex items-center justify-between m-2 pt-3.5">
        <motion.h2
          className="text-2xl font-bold"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          모든 그룹
        </motion.h2>

        <button
          onClick={fetchGroups}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-gray-300 hover:bg-gray-400 text-sm font-medium disabled:opacity-60"
          title="서버에서 최신 상태로 다시 불러오기"
        >
          {loading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      <motion.hr
        className="border-b-1 border-gray-300 my-4 m-2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />

      {loading && <p className="text-center text-gray-500">🔄 그룹 정보를 불러오는 중...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && filteredGroups.length === 0 && (
        <p className="text-center text-gray-500">등록된 그룹이 없습니다.</p>
      )}

      {!loading && !error && filteredGroups.length > 0 && (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredGroups.map(
            (group) =>
              !group.group_private_state && (
                <motion.div
                  key={group.group_id}
                  className="relative p-5 border rounded-xl shadow-md bg-white transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div
                    className={`absolute top-4 right-4 px-3 py-0.75 rounded-full text-xs font-semibold 
                    ${group.group_private_state ? "bg-mygray text-white" : "bg-mypublic text-white"}`}
                  >
                    {group.group_private_state ? "비공개" : "공개"}
                  </div>

                  <h2 className="text-xl font-bold mb-2 text-gray-800">
                    {group.group_name.length > 8 ? `${group.group_name.slice(0, 8)}...` : group.group_name}
                  </h2>

                  <p className="mb-1 text-gray-600">
                    👥 수강생: <span className="font-medium text-gray-700">{group.member_count - 1}명</span>
                  </p>
                  <div className="flex justify-between items-center text-sm font-semibold mb-3">
                    <span className="text-gray-700">
                      👨‍🏫 그룹장:{" "}
                      <span className="text-gray-900">
                        {group.owner_name || group.group_owner /* ✅ owner_name 우선 표시 */}
                      </span>
                    </span>
                  </div>

                  {group.is_member ? (
                    <button
                      className="mt-4.5 w-full py-2 rounded-xl text-lg font-semibold transition-all active:scale-95 bg-mygreen text-white hover:bg-opacity-80"
                      onClick={() => (window.location.href = `/mygroups/${group.group_id}`)}
                    >
                      들어가기
                    </button>
                  ) : group.is_pending_member ? (
                    <div className="mt-4.5 w-full py-2 rounded-xl text-lg font-semibold text-center bg-gray-400 text-white">
                      요청 수락 대기
                    </div>
                  ) : (
                    <button
                      className="mt-4.5 w-full py-2 rounded-xl text-lg font-semibold transition-all active:scale-95 bg-mydarkgreen text-white hover:bg-opacity-80 disabled:opacity-60"
                      onClick={() => handleClickPublicJoinButton(group.group_id)}
                      disabled={joiningId === group.group_id}
                    >
                      {joiningId === group.group_id ? "요청 전송 중..." : "그룹 참여하기 →"}
                    </button>
                  )}
                </motion.div>
              )
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
