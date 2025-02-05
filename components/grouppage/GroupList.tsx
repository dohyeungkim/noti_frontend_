// 그룹 목록을 별도 컴포넌트로 분리하여 재사용 가능하게 만듦


import { useRouter } from "next/navigation";

interface GroupListProps {
  groups: {
    name: string;
    groupId: string;
    students: number;
    professor: string;
    semester: string;
  }[];
}

export default function GroupList({ groups }: GroupListProps) {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-2">
      {groups.map((group) => (
        <div
          key={group.groupId}
          onClick={() => router.push(`/groups/${group.groupId}/exams`)}
          className="relative bg-white border border-gray-300 rounded-lg p-6 cursor-pointer shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
          <p className="mb-1 text-gray-600">그룹 번호: {group.groupId}</p>
          <p className="mb-1 text-gray-600">수강생: {group.students}명</p>
          <div className="absolute top-4 right-4 w-3 h-3 bg-black rounded-full"></div>
          <div className="flex justify-between items-center text-gray-700 text-sm font-semibold mt-2">
            <span>교수: {group.professor}</span>
            <span>{group.semester}</span>
          </div>
          <button className="mt-4 w-full bg-black text-white py-2 rounded-md text-lg cursor-pointer">
            들어가기
          </button>
        </div>
      ))}
    </section>
  );
}
