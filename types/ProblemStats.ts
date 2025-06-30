export interface ProblemStats {
    problem_id: number;       // 문제 ID
    likes: number;            // 좋아요 개수
    total_submissions: number; // 전체 제출 횟수
    total_solutions: number;   // 풀이 성공 횟수
    total_comments: number;    // 해당 문제의 코멘트 개수
    success_rate: number;      // 성공률 (total_solutions / total_submissions * 100)
    referenced_groups: string[]; // 이 문제를 포함하는 그룹 (예: 강의, 스터디 그룹 등)
    referenced_papers: string[]; // 이 문제를 참조하는 문제지/시험
}
