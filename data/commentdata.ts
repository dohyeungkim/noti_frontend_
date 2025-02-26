export interface Comment {
    id: number;
    problem_id: number;
    user_id: number;
    user_name : string; // user_id 를 통해 user_name 접근
    user_nickname : string;
    is_anonymous : boolean;
    comment : string;
    created_at : string;
}

export const allComments: Comment[] = [
    {
      id: 1,
      problem_id: 101,
      user_id: 1,
      user_name: "lee123",
      user_nickname: "코딩고수",
      is_anonymous: false,
      comment: "이 문제 정말 어려웠어요! 다른 사람들은 어떻게 풀었나요?",
      created_at: "2025-02-17 10:30",
    },
    {
      id: 2,
      problem_id: 101,
      user_id: 2,
      user_name: "anonymous",
      user_nickname: "익명",
      is_anonymous: true,
      comment: "저는 DP로 접근했어요. 시간 복잡도를 고려해야 합니다.",
      created_at: "2025-02-17 10:35",
    },
    {
      id: 3,
      problem_id: 101,
      user_id: 3,
      user_name: "devKing",
      user_nickname: "알고리즘왕",
      is_anonymous: false,
      comment: "이 문제는 그리디 알고리즘으로 쉽게 해결 가능해요!",
      created_at: "2025-02-17 11:00",
    },
    {
      id: 4,
      problem_id: 101,
      user_id: 4,
      user_name: "anonymous",
      user_nickname: "익명",
      is_anonymous: true,
      comment: "반례 찾다가 멘붕 왔네요... ㅠㅠ",
      created_at: "2025-02-17 11:10",
    },
    {
      id: 5,
      problem_id: 101,
      user_id: 5,
      user_name: "progLover",
      user_nickname: "프로그래밍러버",
      is_anonymous: false,
      comment: "저는 백트래킹으로 풀었는데 다른 방식이 궁금해요!",
      created_at: "2025-02-17 12:00",
    },
    {
      id: 6,
      problem_id: 101,
      user_id: 6,
      user_name: "progLover",
      user_nickname: "프로그래밍러버",
      is_anonymous: false,
      comment: "혹시 제 코드 봐주실 분 계신가요?!",
      created_at: "2025-02-17 12:30",
    },
  ];
  
