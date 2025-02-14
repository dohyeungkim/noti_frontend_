// ✅ 피드백 데이터 타입 정의
export interface Feedback {
  title: string;
  correctAnswer: string;
  goodPoints: string;
  improvementPoints: string;
  similarMistakes: string[]; // 🔹 배열 형태 명확히 지정
  comments: {
    date: ReactNode; user: string; text: string 
}[]; // 🔹 객체 배열 타입 지정
}

// ✅ 실제 피드백 데이터 적용
export const feedbackData: Record<string, Feedback> = {
  // ✅ 컴퓨터 구조
  "CA00-01": {
    title: "CPU 동작 원리",
    correctAnswer: "CPU는 명령어를 가져와 실행하는 Fetch-Decode-Execute 사이클을 거친다.",
    goodPoints: "핵심 개념을 잘 이해하고 예제를 적용했어요!",
    improvementPoints: "명령어 단계별 세부적인 동작을 더 깊이 이해하면 좋아요.",
    similarMistakes: ["명령어 디코딩 부분이 빠짐", "레지스터 역할 설명 부족"],
    comments: [
      { user: "학생1", text: "저도 명령어 디코딩이 헷갈렸어요!" },
      { user: "학생2", text: "개념 정리할 때 그림으로 정리하면 좋아요!" },
    ],
  },
  "CA00-02": {
    title: "캐시 메모리의 역할",
    correctAnswer: "캐시 메모리는 CPU와 메인 메모리 사이에서 데이터 접근 속도를 향상시킨다.",
    goodPoints: "캐시의 장점을 명확히 설명했어요.",
    improvementPoints: "캐시의 구조와 동작 방식을 조금 더 설명하면 좋겠어요.",
    similarMistakes: ["캐시와 레지스터 혼동", "캐시 히트와 미스 개념 설명 부족"],
    comments: [
      { user: "학생3", text: "캐시 미스가 정확히 뭔지 더 알고 싶어요!" },
      { user: "학생4", text: "CPU 성능과 관계가 더 궁금해요!" },
    ],
  },

  // ✅ 자료구조
  "DS00-01": {
    title: "연결 리스트 vs 배열",
    correctAnswer: "배열은 메모리에 연속적으로 저장되며, 연결 리스트는 포인터로 요소를 연결한다.",
    goodPoints: "차이점을 명확히 이해하고 예제 코드도 작성했어요.",
    improvementPoints: "삽입, 삭제 연산의 시간 복잡도를 더 정확히 분석하면 좋아요.",
    similarMistakes: ["삽입, 삭제 연산 복잡도 설명 부족", "메모리 할당 차이 설명 부족"],
    comments: [
      { user: "학생5", text: "배열이랑 연결 리스트 구현 방식이 헷갈려요!" },
      { user: "학생6", text: "시간 복잡도를 예제 코드로 보고 싶어요!" },
    ],
  },
  "DS00-02": {
    title: "스택과 큐 비교",
    correctAnswer: "스택은 LIFO(Last In First Out), 큐는 FIFO(First In First Out) 원칙을 따른다.",
    goodPoints: "스택과 큐의 기본 개념을 잘 설명했어요!",
    improvementPoints: "시간 복잡도 차이를 명확하게 정리하면 좋아요.",
    similarMistakes: ["스택과 큐의 메모리 구조 차이 설명 부족"],
    comments: [
      { user: "학생7", text: "시간 복잡도 정리하는 자료 추천해 주세요!" },
      { user: "학생8", text: "개념적으로 이해했는데 응용이 어렵네요 ㅠㅠ" },
    ],
  },

  // ✅ 알고리즘
  "AL00-01": {
    title: "이진 탐색의 원리",
    correctAnswer: "이진 탐색은 정렬된 배열에서 중앙값과 비교하여 탐색 범위를 줄여나간다.",
    goodPoints: "이진 탐색 과정과 시간 복잡도를 잘 설명했어요.",
    improvementPoints: "재귀와 반복을 이용한 구현을 비교하면 더 좋아요.",
    similarMistakes: ["정렬되지 않은 배열에서도 사용 가능하다고 착각", "반복문과 재귀 구현 차이 설명 부족"],
    comments: [
      { user: "학생9", text: "재귀로 구현하는 게 헷갈려요!" },
      { user: "학생10", text: "정렬이 왜 필수인지 더 자세히 설명 부탁드려요!" },
    ],
  },

  // ✅ 데이터베이스
  "DB00-01": {
    title: "정규화의 필요성",
    correctAnswer: "정규화는 중복을 최소화하고, 데이터 무결성을 유지하기 위한 과정이다.",
    goodPoints: "정규화의 개념을 명확히 이해했어요!",
    improvementPoints: "1NF, 2NF, 3NF의 차이를 구체적으로 정리하면 좋아요.",
    similarMistakes: ["정규화와 비정규화 개념 혼동", "3NF 이후의 정규형 개념 부족"],
    comments: [
      { user: "학생11", text: "3NF 이후에는 어떻게 정규화가 진행되나요?" },
      { user: "학생12", text: "정규화하면 성능이 낮아진다고 들었는데, 맞나요?" },
    ],
  },

  // ✅ 머신러닝
  "ML00-01": {
    title: "과적합 방지 방법",
    correctAnswer: "과적합을 방지하기 위해 정규화, 데이터 증강, 드롭아웃을 적용할 수 있다.",
    goodPoints: "과적합을 방지하는 다양한 방법을 정리했어요!",
    improvementPoints: "각 기법이 어떻게 과적합을 줄이는지 더 설명하면 좋아요.",
    similarMistakes: ["드롭아웃이 정확히 무엇인지 설명 부족", "정규화 기법 혼동"],
    comments: [
      { user: "학생13", text: "드롭아웃이 모델에서 어떻게 적용되는지 궁금해요!" },
      { user: "학생14", text: "데이터 증강을 언제 사용해야 하나요?" },
    ],
  },
  "ML00-02": {
    title: "손실 함수의 역할",
    correctAnswer: "손실 함수는 모델의 예측값과 실제값 차이를 측정하여 학습을 도와준다.",
    goodPoints: "손실 함수의 기본 개념을 잘 설명했어요!",
    improvementPoints: "다양한 손실 함수 종류를 비교하면 더 좋아요.",
    similarMistakes: ["MSE와 MAE 차이 설명 부족", "분류 문제에서 사용하는 손실 함수 혼동"],
    comments: [
      { user: "학생15", text: "MSE랑 MAE 중 언제 어떤 걸 써야 하나요?" },
      { user: "학생16", text: "크로스 엔트로피 손실 함수도 설명해 주세요!" },
    ],
  },
};
