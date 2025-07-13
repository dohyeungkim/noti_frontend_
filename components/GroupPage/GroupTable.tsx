"use client"; //클라이언트 컴포넌트 사용

import { useRouter } from "next/navigation"; //모듈 훅 추가
interface Group { //group 타입정의
  group_id: number;
  group_name: string;
  group_owner: string;
  group_private_state: boolean;
  member_count: number;
  createdAt?: string;
  is_member: boolean;
}

interface GroupTableProps { //grouptableprops group객체배열을 props로 받는 컴포넌트
  groups: Group[];
}
export default function GroupTable({ groups }: GroupTableProps) { //외부에서 접근 가능하게 
  const router = useRouter();
  const filteredGroups = groups.filter((group) => group.is_member);

  return ( //UI
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
          {groups.length > 0 ? (
            filteredGroups.map((group) => (
              <tr
                key={group.group_id}
                className="transition-colors duration-200 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/mygroups/${group.group_id}`)}>
                <td className="px-5 py-4 text-center">
                  {group.group_name.length > 10
                    ? `${group.group_name.slice(0, 10)}...`
                    : group.group_name}
                </td>
                <td className="px-5 py-4 text-center">{group.group_id}</td>
                <td className="px-5 py-4 text-center">{group.member_count}명</td>
                <td className="px-5 py-4 text-center">{group.group_owner}</td>
                <td
                  className={`px-5 py-4 text-center font-semibold 
                                ${group.group_private_state ? "text-gray-500" : "text-mygreen"}`}>
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
