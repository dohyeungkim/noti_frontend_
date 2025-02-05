import ExamCard from "@/components/ExamPage/ExamCard"; 
interface ExamGalleryProps {
  exams: {
    examId: string;
    name: string;
    description: string;
    startDate: string;
  }[];
  handleEnterExam: (examId: string) => void;
  isTestMode: (examId: string) => boolean;
}

export default function ExamGallery({ exams, handleEnterExam, isTestMode }: ExamGalleryProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {exams.length > 0 ? (
        exams.map((exam) => (
          <ExamCard
            key={exam.examId}
            exam={exam}
            isTestMode={isTestMode(exam.examId)}
            onClick={() => handleEnterExam(exam.examId)}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg">등록된 문제지가 없습니다.</p>
      )}
    </section>
  );
}
