"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { group_api } from "@/lib/api";

interface Group {
  group_id: number;
  group_name: string;
  group_owner: string;
  group_owner_username?: string;
  group_private_state: boolean;
  member_count: number;
  createdAt?: string;
  is_member: boolean;
}

interface GroupTableProps {
  groups: Group[];
}

export default function GroupTable({ groups }: GroupTableProps) {
  const router = useRouter();

  // ✅ 1) 메모이즈: 같은 props면 같은 참조를 유지
  const filteredGroups = useMemo(
    () => groups.filter((g) => g.is_member),
    [groups]
  );

  const [enriched, setEnriched] = useState<Group[]>(filteredGroups);

  // ✅ 2) id 시그니처로 의존성 최소화 (배열 참조 변동 무시)
  const idSignature = useMemo(
    () => filteredGroups.map((g) => g.group_id).join("|"),
    [filteredGroups]
  );

  // ✅ 3) 간단 캐시: 이미 가져온 그룹장 이름은 재호출 안 함
  const ownerNameCache = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!filteredGroups.length) {
        if (mounted) setEnriched([]);
        return;
      }

      // 아직 이름이 없는 그룹만 골라서 호출
      const targets = filteredGroups.filter(
        (g) =>
          !g.group_owner_username &&
          !ownerNameCache.current.has(g.group_id)
      );

      if (targets.length) {
        const results = await Promise.all(
          targets.map(async (g) => {
            try {
              const detail = await group_api.group_get_by_id(g.group_id);
              const name = detail.group_owner_username as string | undefined;
              if (name) ownerNameCache.current.set(g.group_id, name);
            } catch {
              /* ignore */
            }
          })
        );
      }

      // 최신 filteredGroups에 캐시를 반영
      const merged = filteredGroups.map((g) => {
        const cached = ownerNameCache.current.get(g.group_id);
        return cached && !g.group_owner_username
          ? { ...g, group_owner_username: cached }
          : g;
      });

      if (mounted) setEnriched(merged);
    })();

    return () => {
      mounted = false;
    };
    // ✅ 의존성은 id 시그니처만
  }, [idSignature]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
        <thead className="bg-gray-200">
          <tr className="border-b-4 border-gray-200 text-gray-800">
            <th className="px-5 py-4 text-center text-lg font-semibold">그룹 이름</th>
            <th className="px-5 py-4 text-center text-lg font-semibold">그룹 번호</th>
            <th className="px-5 py-4 text-center text-lg font-semibold">수강생 수</th>
            <th className="px-5 py-4 text-center text-lg font-semibold">그룹장</th>
            <th className="px-5 py-4 text-center text-lg font-semibold">공개 여부</th>
          </tr>
        </thead>
        <tbody>
          {enriched.length > 0 ? (
            enriched.map((group) => (
              <tr
                key={group.group_id}
                className="transition-colors duration-200 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/mygroups/${group.group_id}`)}
              >
                <td className="px-5 py-4 text-center">
                  {group.group_name.length > 10
                    ? `${group.group_name.slice(0, 10)}...`
                    : group.group_name}
                </td>
                <td className="px-5 py-4 text-center">{group.group_id}</td>
                <td className="px-5 py-4 text-center">{group.member_count}명</td>

                {/* 이름 있으면 이름, 없으면 학번 */}
                <td className="px-5 py-4 text-center">
                  {group.group_owner_username || group.group_owner}
                </td>

                <td
                  className={`px-5 py-4 text-center font-semibold ${
                    group.group_private_state ? "text-gray-500" : "text-mygreen"
                  }`}
                >
                  {group.group_private_state ? "비공개" : "공개"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 text-lg p-6">
                등록된 그룹이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
