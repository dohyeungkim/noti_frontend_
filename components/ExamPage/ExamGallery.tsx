"use client"; //클라이언트 컴포넌트
import ExamCard from "@/components/ExamPage/ExamCard"; //필요한 컴포넌트 추가

interface ExamGalleryProps { //examgalleryprops의 사용할 props 타입정의
  workbooks: {
    workbook_id: number;
    group_id: number;
    workbook_name: string;
    problem_cnt: number;
    description: string;
    creation_date: string;
  }[];

  handleEnterExam: (examId: string) => void;
}

export default function ExamGallery({ workbooks, handleEnterExam }: ExamGalleryProps) {//examgallery 컴포넌트 입력값 props를 workbooks와 handle...로 받음 
  if (!workbooks || workbooks.length === 0) {//workbooks가 없다면 
    return <p className="text-center text-gray-500 text-lg">등록된 문제지가 없습니다.</p>;
  }

  return ( //UI
    <section  className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-2">
      {workbooks.map((workbook) => (
        <ExamCard
          key={workbook.workbook_id}
          workbook={workbook}
          onClick={() => handleEnterExam(String(workbook.workbook_id))}
        />
      ))}
    </section>
  );
}
