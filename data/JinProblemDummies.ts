// 문제 유형별 더미데이터
export const dummyCodingProblem = {
  title: "예제: 코딩 문제",
  description: "입력을 받아 출력하는 코드를 작성하세요.",
  tags: ["코딩", "입출력"],
  referenceCodes: [
    {
      code: "print(input())",
      language: "python",
      is_main: true,
    },
  ],
  testCases: [
    { input: "1", expected_output: "1" },
    { input: "Hello", expected_output: "Hello" },
  ],
  conditions: ["표준 입력 사용"],
  ratingMode: "Hard",
  difficulty: "easy",
  problemType: "코딩",
  problemScore: 10,

};

export const dummyDebugProblem = {
  title: "예제: 디버깅 문제",
  description: "다음 코드의 버그를 찾아 수정하세요.",
  tags: ["디버깅"],
  testCases: [
    { input: "", expected_output: "Hello" },
  ],
  conditions: ["출력이 정확해야 함"],
  ratingMode: "Hard",
  difficulty: "medium",
  problemType: "디버깅",
  problemScore: 10,
  base_code: "qweqweqweqwe"
};

export const dummyMultipleChoiceProblem = {
  title: "예제: 객관식 문제",
  description: "다음 중 올바른 것은 무엇인가요?",
  tags: ["객관식", "개념"],
  options: ["A. 틀림", "B. 틀림", "C. 정답", "D. 틀림"],
  answerIndexes: [2],
  ratingMode: "None",
  difficulty: "easy",
  problemType: "객관식",

};

export const dummySubjectiveProblem = {
  title: "예제: 주관식 문제",
  description: "의견을 자유롭게 서술하세요.",
  tags: ["주관식"],
  subjectiveRubrics: ["논리성", "정확한 표현"],
  ratingMode: "active",
  difficulty: "medium",
  problemType: "주관식",
};

export const dummyShortAnswerProblem = {
  title: "예제: 단답형 문제",
  description: "HTTP는 무엇의 약자인가요?",
  tags: ["단답형", "용어"],
  shortAnswers: ["HyperText Transfer Protocol"],
  subjectiveRubrics: ["정확한 표기"],
  ratingMode: "exact",
  difficulty: "easy",
  problemType: "단답형",
};