import { history } from '@/types/history';

export const dummyProblems: history[] = [
    {
        problem_id: 1,
         maker_id : "admin", 
         title: "two sum1", 
         description: "두 수를 더하는 프로그램을 만드세요.",
         testcase : [""],
         root_problem_id : 1,
         parent_problem_id : -1,
         tags : ["알고리즘", "문제지1"],
         enable: true,
    },
    {
        problem_id: 2,
         maker_id : "admin", 
         title: "two sum2", 
         description: "두 수를 더하는 프로그램을 만드세요.222",
         testcase : [""],
         root_problem_id : 1,
         parent_problem_id : 1,
         tags : ["알고리즘", "문제지1"],
         enable: true,
    },
    {
        problem_id: 3,
         maker_id : "admin", 
         title: "two sum3", 
         description: "두 수를 더하는 프로그램을 만드세요.",
         testcase : [""],
         root_problem_id : 1,
         parent_problem_id : 2,
         tags : ["알고리즘", "문제지1"],
         enable: true,
    },
    {
        problem_id: 4,
         maker_id : "admin", 
         title: "two sum4", 
         description: "두 수를 더하는 프로그램을 만드세요.",
         testcase : [""],
         root_problem_id : 1,
         parent_problem_id : 1,
         tags : ["알고리즘", "문제지1"],
         enable: true
    },
    {
        problem_id: 5,
         maker_id : "admin", 
         title: "two sum5", 
         description: "두 수를 더하는 프로그램을 만드세용!.",
         testcase : [""],
         root_problem_id : 1,
         parent_problem_id : 4,
         tags : ["알고리즘", "문제지1"],
         enable: false, // 이 문제는 히스토리에서 흑백으로 처리
    },
];