"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { group_api } from "@/lib/api"

interface Group {
  group_id: number
  group_name: string
  group_owner: string                 
  group_owner_username?: string       
  group_private_state: boolean
  member_count: number
  createdAt?: string
  is_member: boolean
}

interface GroupListProps {
  groups: Group[]
}

export default function GroupList({ groups }: GroupListProps) {
  const router = useRouter()

  // 내 그룹만
  const filteredGroups = useMemo(() => groups.filter((g) => g.is_member), [groups])

  // 단건 조회로 닉네임 하이드레이션
  const [enriched, setEnriched] = useState<Group[]>(filteredGroups)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // 목록이 없으면 스킵
      if (!filteredGroups?.length) {
        if (mounted) setEnriched([])
        return
      }

      // 각 그룹에 대해 group_get_by_id 호출해서 group_owner_username 채우기
      const withNick = await Promise.all(
        filteredGroups.map(async (g) => {
          try {
            const detail = await group_api.group_get_by_id(g.group_id)
            // detail에 group_owner_username이 있으면 반영
            return {
              ...g,
              group_owner_username: detail.group_owner_username ?? g.group_owner_username,
            } as Group
          } catch {
            // 실패하면 원본 유지(폴백)
            return g
          }
        })
      )

      if (mounted) setEnriched(withNick)
    })()

    return () => {
      mounted = false
    }
  }, [filteredGroups])

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 m-2">
      {enriched.map((group) => (
        <div
          key={group.group_id}
          onClick={() => router.push(`/mygroups/${group.group_id}`)}
          className="flex flex-col relative border border-gray-200 rounded-2xl p-4 sm:p-6 cursor-pointer 
                 shadow-md transition-all duration-300 ease-in-out
                 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 
                 bg-white text-gray-800 h-full"
        >
          {/* ✅ 그룹 상태 배지 (공개 / 비공개) */}
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                    ${group.group_private_state ? "bg-mygray text-white" : "bg-mypublic text-white"}`}
          >
            {group.group_private_state ? "비공개" : "공개"}
          </div>

          {/* ✅ 그룹 정보 */}
          <div className="flex-grow">
            <h2 className="text-xl font-semibold mb-2">
              {group.group_name.length > 15 ? `${group.group_name.slice(0, 20)}...` : group.group_name}
            </h2>
            <div className="flex flex-col">
              <div className="flex justify-between">
                <p className="mb-1">📌 그룹 번호: {group.group_id}</p>
                <p className="mb-1" title={`아이디: ${group.group_owner}`}>
                  👨‍🏫 그룹장: {group.group_owner_username || group.group_owner || "—"}
                </p>
              </div>
              <div className="flex">
                <p className="mb-1">👥 수강생: {group.member_count-1}명</p>
              </div>
            </div>
          </div>

          {/* ✅ 그룹 입장 버튼 (하단 고정) */}
          <button className="mt-auto w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-mygreen text-white hover:bg-opacity-80">
            들어가기
          </button>
        </div>
      ))}
    </section>
  )
}
