// ✅ 데이터 타입 정의
interface Submission {
  id: number;
  problemId: string; // 🔹 문제 ID는 problems 배열과 일치하도록 string으로 변경
  userId: number;
  result: string;
  memory: string;
  time: string;
  language: string;
  codeLength: string;
  submissionTime: string;
}

// ✅ 제출 데이터
export const submissions: Submission[] = [
  { id: 1, problemId: "DS01-0001", userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:00:06" },
  { id: 2, problemId: "DS01-0001", userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:04:18" },
  { id: 3, problemId: "DS01-0001", userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:15:58" },
  { id: 4, problemId: "DS01-0001", userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:46:31" },
  { id: 5, problemId: "DS01-0001", userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:48:28" },
  { id: 6, problemId: "DS01-0001", userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 5:52:13" },
  { id: 7, problemId: "DS01-0001", userId: 1, result: "Accepted", memory: "KB", time: "ms", language: "Python", codeLength: "123 bytes", submissionTime: "2025. 2. 10. 오후 8:09:19" },
];