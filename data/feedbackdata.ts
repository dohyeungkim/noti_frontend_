// ✅ 피드백 데이터 타입 정의
export interface Feedback {
    title: string;
    correctAnswer: string;
    goodPoints: string;
    improvementPoints: string;
    similarMistakes: string[]; // 🔹 배열 형태 명확히 지정
    comments: { user: string; text: string }[]; // 🔹 객체 배열 타입 지정
  }
  
  // ✅ 실제 피드백 데이터 적용
  export const feedbackData: Record<string, Feedback> = {
    "CA00-01": {
      title: "CPU 동작 원리",
      correctAnswer: "CPU는 명령어를 가져와 실행하는 Fetch-Decode-Execute 사이클을 거친다.",
      goodPoints: "핵심 개념을 잘 이해하고 예제를 적용했어요!",
      improvementPoints: "명령어 단계별 세부적인 동작을 더 깊이 이해하면 좋아요.",
      similarMistakes: ["명령어 디코딩 부분이 빠짐", "레지스터 역할 설명 부족"], // ✅ 문자열 배열
      comments: [
        { user: "학생1", text: "저도 명령어 디코딩이 헷갈렸어요!" },
        { user: "학생2", text: "개념 정리할 때 그림으로 정리하면 좋아요!" },
      ], // ✅ 객체 배열
    },
    "DS00-02": {
      title: "스택과 큐 비교",
      correctAnswer: "스택은 LIFO(Last In First Out), 큐는 FIFO(First In First Out) 원칙을 따른다.",
      goodPoints: "스택과 큐의 기본 개념을 잘 설명했어요!",
      improvementPoints: "시간 복잡도 차이를 명확하게 정리하면 좋아요.",
      similarMistakes: ["스택과 큐의 메모리 구조 차이 설명 부족"],
      comments: [
        { user: "학생3", text: "시간 복잡도 정리하는 자료 추천해 주세요!" },
        { user: "학생4", text: "개념적으로 이해했는데 응용이 어렵네요 ㅠㅠ" },
      ],
    },
  };
  