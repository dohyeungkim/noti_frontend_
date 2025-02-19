import { useRouter } from "next/navigation";

interface GroupTableProps {
  className?: string;
  groups: {
    group_name: string;
    group_owner: string;
    group_state: boolean;
    group_id: string;
    member_count: number;
    createdAt: string;
  }[];
}

export default function GroupTable({ groups }: GroupTableProps) {
  const router = useRouter();

  // ✅ "MY" 그룹 제외한 그룹만 필터링
  const filteredGroups = groups.filter((group) => group.group_id !== "MY");

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-md rounded-2xl overflow-hidden">
        <thead className="bg-gray-200">
          <tr className="border-b-4 border-gray-200 text-gray-800">
            <th className="p-4 text-left text-lg font-semibold">그룹 이름</th>
            <th className="p-4 text-left text-lg font-semibold">그룹 번호</th>
            <th className="p-4 text-left text-lg font-semibold">수강생 수</th>
            <th className="p-4 text-left text-lg font-semibold">그룹장</th>
            <th className="p-4 text-left text-lg font-semibold">공개 여부</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <tr
                key={group.group_id}
                className="transition-colors duration-200 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/mygroups/${group.group_id}`)} // ✅ 공개 & 비공개 그룹 모두 이동 가능
              >
                <td className="p-4 text-left">{group.group_name}</td>
                <td className="p-4 text-left">{group.group_id}</td>
                <td className="p-4 text-left">{group.member_count}명</td>
                <td className="p-4 text-left">{group.group_owner}</td>
                <td className={`p-4 text-left font-semibold 
                                ${group.group_state ? "text-green-500" : "text-gray-500"}`}
                >
                  {group.group_state ? "공개" : "비공개"}
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
