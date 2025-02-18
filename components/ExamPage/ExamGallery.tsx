import ExamCard from "@/components/ExamPage/ExamCard";

interface ExamGalleryProps {
  workbooks: {
    workbook_id: string;
    group_id: string;
    workbook_name: string;
    description: string;
    creation_date: string;
  }[];
  exams: {
    examId: string;
    startTime: string;
    endTime: string;
  }[];
  handleEnterExam: (examId: string) => void;
}

export default function ExamGallery({ workbooks, exams, handleEnterExam }: ExamGalleryProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {workbooks.length > 0 ? (
        workbooks.map((workbook) => {
          const matchedExam = exams.find((e) => e.examId === workbook.workbook_id) || null;

          return (
            <ExamCard
              key={workbook.workbook_id}
              workbook={workbook}  // ✅ workbook 데이터 전달
              exam={matchedExam}   // ✅ 시험이 있는 경우만 전달
              onClick={() => handleEnterExam(workbook.workbook_id)}
            />
          );
        })
      ) : (
        <p className="text-center text-gray-500 text-lg">등록된 문제지가 없습니다.</p>
      )}
    </section>
  );
}
