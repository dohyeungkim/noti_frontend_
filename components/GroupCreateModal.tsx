//그룹 생성하기의 모달창

interface GroupCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupName: string;
    setGroupName: (value: string) => void;
    groupNumber: string;
    setGroupNumber: (value: string) => void;
    inviteCode: string;
    setInviteCode: (value: string) => void;
    maxStudents: string;
    setMaxStudents: (value: string) => void;
    year: string;
    setYear: (value: string) => void;
    semester: string;
    setSemester: (value: string) => void;
  }
  
  export default function GroupCreateModal({
    isOpen,
    onClose,
    groupName,
    setGroupName,
    groupNumber,
    setGroupNumber,
    inviteCode,
    setInviteCode,
    maxStudents,
    setMaxStudents,
    year,
    setYear,
    semester,
    setSemester,
  }: GroupCreateModalProps) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">그룹 생성하기</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-black text-2xl">❌</button>
          </div>
  
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              그룹 이름
              <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                     className="p-2 border border-gray-300 rounded-md mt-1" />
            </label>
            <label className="flex flex-col">
              그룹 번호
              <input type="text" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)}
                     className="p-2 border border-gray-300 rounded-md mt-1" />
            </label>
            <label className="flex flex-col">
              초대 코드
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
                     className="p-2 border border-gray-300 rounded-md mt-1" />
            </label>
  
            <div className="flex items-center gap-2">
              <label className="flex flex-col flex-1">
                인원 제한
                <div className="flex items-center gap-2">
                  <input type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)}
                         className="p-2 border border-gray-300 rounded-md w-full mt-1" />
                  <span className="mt-1">명</span>
                </div>
              </label>
            </div>
  
            <div className="flex items-center gap-2">
              <label className="flex flex-col flex-1">
                연도
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                       className="p-2 border border-gray-300 rounded-md w-full mt-1" />
              </label>
              <span className="mt-6">년</span>
              <label className="flex flex-col flex-1">
                학기
                <input type="number" value={semester} onChange={(e) => setSemester(e.target.value)}
                       className="p-2 border border-gray-300 rounded-md w-full mt-1" />
              </label>
              <span className="mt-6">학기</span>
            </div>
          </div>
  
          <button onClick={onClose} className="mt-6 w-full bg-black text-white py-3 rounded-md text-lg cursor-pointer">
            그룹 생성하기
          </button>
        </div>
      </div>
    );
  }
  