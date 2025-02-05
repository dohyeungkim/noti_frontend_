import { useRouter } from "next/navigation";

interface GroupListProps {
  className?: string;

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
          className="relative bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer 
                     shadow-md transition-all duration-300 ease-in-out 
                     hover:-translate-y-1 hover:shadow-lg hover:border-gray-300"
        >
          {/* 우측 상단의 상태 배지 (기존 w-3 h-3 검은 원 대체) */}
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {group.semester}
          </div>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">{group.name}</h2>
          <p className="mb-1 text-gray-600">📌 그룹 번호: {group.groupId}</p>
          <p className="mb-1 text-gray-600">👥 수강생: {group.students}명</p>

          <div className="flex justify-between items-center text-gray-700 text-sm font-semibold mt-3">
            <span>👨‍🏫 교수: {group.professor}</span>
          </div>

          <button
            className="mt-5 w-full bg-gray-800 text-white py-2 rounded-xl text-lg font-semibold 
                       transition-all duration-300 ease-in-out hover:bg-gray-700 active:scale-95"
          >
            그룹 페이지 →
          </button>
        </div>
      ))}
    </section>
  );
}
