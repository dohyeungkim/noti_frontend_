//✅ 테이블 형태의 그룹 목록을 별도 컴포넌트로 분리하여 재사용 가능하게 만듦

import { useRouter } from "next/navigation";

interface GroupTableProps {
  groups: {
    name: string;
    groupId: string;
    students: number;
    professor: string;
    semester: string;
  }[];
}

export default function GroupTable({ groups }: GroupTableProps) {
  const router = useRouter();

  return (
    <table className="w-full bg-white border border-gray-300 rounded-lg">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 border-b">그룹 이름</th>
          <th className="p-3 border-b">그룹 번호</th>
          <th className="p-3 border-b">수강생 수</th>
          <th className="p-3 border-b">교수</th>
          <th className="p-3 border-b">학기</th>
        </tr>
      </thead>
      <tbody>
        {groups.map((group) => (
          <tr
            key={group.groupId}
            className="text-center hover:bg-gray-50 cursor-pointer"
            onClick={() => router.push(`/groups/${group.groupId}/exams`)}
          >
            <td className="p-3 border-b">{group.name}</td>
            <td className="p-3 border-b">{group.groupId}</td>
            <td className="p-3 border-b">{group.students}명</td>
            <td className="p-3 border-b">{group.professor}</td>
            <td className="p-3 border-b">{group.semester}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
