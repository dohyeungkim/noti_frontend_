import internal from "stream";

// ✅ 데이터 타입 정의
interface Submission {
  id: number;
  problemId: number;
  userId: number;
  result: string;
  memory: string;
  time: string;
  language: string;
  codeLength: string;
  submissionTime: string;
}
// ✅ 더미 제출 데이터
export const submissions = [
    { id: 1, problemId: 10, userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:00:06" },
    { id: 2, problemId: 10, userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:04:18" },
    { id: 3, problemId: 10, userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:15:58" },
    { id: 4, problemId: 10, userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:46:31" },
    { id: 5, problemId: 10, userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:48:28" },
    { id: 6, problemId: 10, userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:52:13" },
    { id: 7, problemId: 10, userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 8:09:19" },
  ];