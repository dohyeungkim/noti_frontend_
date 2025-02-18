interface workbook {
    workbook_id: string;
    group_id: string;
    workbook_name: string;
    description:string;
    creation_date: string
} 
export const workbook = [
    { workbook_id: 'MY00', group_id: 'MY', workbook_name: '무제', description: '.',creation_date: '2023-05-15' },

    // 컴퓨터 구조 문제지
    { workbook_id: 'CA00', group_id: 'CA', workbook_name: '컴퓨터 구조 문제지 1번', description: 'CPU 문제', creation_date: '2022-05-05' },
    { workbook_id: 'CA01', group_id: 'CA', workbook_name: '컴퓨터 구조 문제지 2번', description: '메모리 구조 문제', creation_date: '2023-05-15'},
    { workbook_id: 'CA02', group_id: 'CA', workbook_name: '컴퓨터 구조 문제지 3번', description: '캐시 메모리 문제', creation_date: '2024-05-13'},
    { workbook_id: 'CA03', group_id: 'CA', workbook_name: '컴퓨터 구조 문제지 4번', description: '프로세서 동작 문제', creation_date: '2023-02-15' },
    { workbook_id: 'CA04', group_id: 'CA', workbook_name: '컴퓨터 구조 문제지 5번', description: '컴퓨터 시스템 전반 문제', creation_date: '2023-05-11'},

    // 자료구조 문제지
    { workbook_id: 'DS00', group_id: 'DS', workbook_name: '자료구조 문제지 1번', description: '스택 문제', creation_date: '2022-05-12' },
    { workbook_id: 'DS01', group_id: 'DS', workbook_name: '자료구조 문제지 2번', description: '큐 문제', creation_date: '2023-02-15' },
    { workbook_id: 'DS02', group_id: 'DS', workbook_name: '자료구조 문제지 3번', description: '트리 문제', creation_date: '2021-05-15'},
    { workbook_id: 'DS03', group_id: 'DS', workbook_name: '자료구조 문제지 4번', description: '그래프 문제', creation_date: '2223-05-15'},
    { workbook_id: 'DS04', group_id: 'DS', workbook_name: '자료구조 문제지 5번', description: '해시 테이블 문제',creation_date: '2023-05-13' },
];