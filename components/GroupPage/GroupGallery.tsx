import { useRouter } from "next/navigation";

interface GroupListProps {
  groups: {
    group_name: string;
    group_owner: string;
    group_state: boolean;
    group_id: string;
    member_count: number;
    createdAt: string;
  }[];
}

export default function GroupList({ groups }: GroupListProps) {
  const router = useRouter();

  // ✅ "MY" 그룹 제외한 그룹만 필터링
  const filteredGroups = groups.filter((group) => group.group_id !== "MY");

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-2">
      {filteredGroups.map((group) => (
        <div
          key={group.group_id}
          onClick={() => group.group_state && router.push(`/mygroups/${group.group_id}`)}
          className={`relative border border-gray-200 rounded-2xl p-6 cursor-pointer 
                      shadow-md transition-all duration-300 ease-in-out
                      hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 
                      ${
                        group.group_state
                          ? "bg-white text-gray-800" // ✅ 활성 상태
                          : "bg-gray-100 text-gray-500 cursor-not-allowed" // ✅ 비활성 상태 (연한 회색)
                      }`}
        >
          {/* 우측 상단의 상태 배지 */}
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                        ${
                          group.group_state ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                        }`}
          >
            {group.group_state ? "공개" : "비공개"}
          </div>

          <h2 className="text-xl font-semibold mb-2">{group.group_name}</h2>
          <p className="mb-1">📌 그룹 번호: {group.group_id}</p>
          <p className="mb-1">👥 수강생: {group.member_count}명</p>

          <div className="flex justify-between items-center text-sm font-semibold mt-3">
            <span>👨‍🏫 그룹장: {group.group_owner}</span>
          </div>

          <button
            className={`mt-5 w-full py-2 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out active:scale-95
                        ${
                          group.group_state
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-gray-400 text-gray-700 cursor-not-allowed"
                        }`}
            disabled={!group.group_state} // ✅ 비활성 그룹일 때 버튼 클릭 불가능
          >
            그룹 페이지 →
          </button>
        </div>
      ))}
    </section>
  );
}
