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
    <div className="w-full overflow-x-auto">
      <table className="w-full table-auto bg-transparent border-collapse m-2">
        <thead>
          <tr className="border-b-4 border-gray-200 text-gray-800">
            <th className="p-4 text-left text-lg font-semibold">그룹 이름</th>
            <th className="p-4 text-left text-lg font-semibold">그룹 번호</th>
            <th className="p-4 text-left text-lg font-semibold">수강생 수</th>
            <th className="p-4 text-left text-lg font-semibold">교수</th>
            <th className="p-4 text-left text-lg font-semibold">학기</th>
          </tr>
        </thead>
        <tbody>
          {groups.length > 0 ? (
            groups.map((group) => (
              <tr
                key={group.groupId}
                className="hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300 cursor-pointer"
                onClick={() => router.push(`/groups/${group.groupId}/exams`)}
              >
                <td className="p-4 text-left text-gray-800">{group.name}</td>
                <td className="p-4 text-left text-gray-600">{group.groupId}</td>
                <td className="p-4 text-left text-gray-600">{group.students}명</td>
                <td className="p-4 text-left text-gray-600">{group.professor}</td>
                <td className="p-4 text-left text-gray-500">{group.semester}</td>
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
