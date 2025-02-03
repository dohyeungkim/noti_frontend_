// types.ts - 데이터 타입 정의
export interface Exam {
    examId: string;
    startTime: string;
    endTime: string;
  }
  
  // dummyData.ts - 더미 데이터
  export const testExams: Exam[] = [
    {
      examId: "CA00",
      startTime: "2024-02-03T10:00:00",
      endTime: "2026-02-10T12:00:00",
    },
    {
      examId: "DS00",
      startTime: "2024-02-03T10:00:00",
      endTime: "2026-02-10T12:00:00",
    },
  ];
  