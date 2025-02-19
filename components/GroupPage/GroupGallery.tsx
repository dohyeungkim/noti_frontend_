import { useRouter } from "next/navigation";

interface GroupListProps {
  groups: {
    group_name: string;
    group_owner: string;
    group_state: boolean;
    group_id: string;
    member_count: number;
    createdAt: string;
    is_members: boolean;
    group_private_state: boolean; // ✅ 공개 여부 추가
  }[];
}

export default function GroupList({ groups }: GroupListProps) {
  const router = useRouter();

  // ✅ "MY" 그룹 제외하고, 현재 사용자가 속한 그룹만 필터링
  const filteredGroups = groups.filter((group) => group.group_id !== "MY" && group.is_members);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-2">
      {filteredGroups.map((group) => (
        <div
          key={group.group_id}
          onClick={() => router.push(`/mygroups/${group.group_id}`)} // ✅ 입장 가능
          className="relative border border-gray-200 rounded-2xl p-6 cursor-pointer 
                      shadow-md transition-all duration-300 ease-in-out
                      hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 
                      bg-white text-gray-800"
        >
          {/* ✅ 그룹 상태 배지 (공개 / 비공개) */}
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                        ${group.group_private_state ? "bg-gray-400 text-white" : "bg-blue-500 text-white"}`}
          >
            {group.group_private_state ? "비공개" : "공개"}
          </div>

          <h2 className="text-xl font-semibold mb-2">{group.group_name}</h2>
          <p className="mb-1">📌 그룹 번호: {group.group_id}</p>
          <p className="mb-1">👥 수강생: {group.member_count}명</p>

          <div className="flex justify-between items-center text-sm font-semibold mt-3">
            <span>👨‍🏫 그룹장: {group.group_owner}</span>
          </div>

          <button
            className="mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 bg-gray-800 text-white hover:bg-gray-700"
          >
            그룹 페이지 →
          </button>
        </div>
      ))}
    </section>
  );
}
