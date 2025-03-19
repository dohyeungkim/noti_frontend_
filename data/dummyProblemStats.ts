import { ProblemStats } from "../types/ProblemStats";

export const dummyProblemStats : ProblemStats[] = [
    {
        problem_id: 1,
        likes: 65,
        total_submissions: 920,
        total_solutions: 408,
        total_comments: 510,
        success_rate: 55, // (408 / 920) * 100
        referenced_groups: ["파이썬 과학 기초", "C 프로그래밍", "파이썬 과학 고급"],
        referenced_papers: ["파과기 문제지 1번", "중간고사", "기말고사"]
    },
    {
        problem_id: 2,
        likes: 32,
        total_submissions: 510,
        total_solutions: 220,
        total_comments: 300,
        success_rate: 43, // (220 / 510) * 100
        referenced_groups: ["알고리즘 기초", "자료구조"],
        referenced_papers: ["알고리즘 문제지 2번", "기출문제집"]
    },
    {
        problem_id: 3,
        likes: 78,
        total_submissions: 1300,
        total_solutions: 720,
        total_comments: 640,
        success_rate: 55, // (720 / 1300) * 100
        referenced_groups: ["컴퓨터 개론", "C++ 프로그래밍"],
        referenced_papers: ["모의고사", "최종평가"]
    },
    {
        problem_id: 4,
        likes: 21,
        total_submissions: 410,
        total_solutions: 180,
        total_comments: 250,
        success_rate: 44, // (180 / 410) * 100
        referenced_groups: ["인공지능 기초", "머신러닝 개론"],
        referenced_papers: ["머신러닝 평가 문제", "연습문제"]
    },
    {
        problem_id: 5,
        likes: 10,
        total_submissions: 220,
        total_solutions: 90,
        total_comments: 150,
        success_rate: 41, // (90 / 220) * 100
        referenced_groups: ["딥러닝 개론", "데이터 사이언스"],
        referenced_papers: ["딥러닝 문제지", "연습문제"]
    }
];
