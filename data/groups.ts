interface Group {
    group_name: string;
    group_owner: string;
    group_state: boolean;
    group_id: string;   // ✅ groupId → group_id로 변경
    member_count: number; 
    createdAt: string;
} 

export const groups: Group[] = [
    { group_name: '나의 그룹', group_owner: '한서연', group_state: true, group_id: 'MY', member_count: 0, createdAt: '2023-08-20' },
    { group_name: '컴퓨터 구조', group_owner: '한서연', group_state: true, group_id: 'CA', member_count: 21, createdAt: '2023-05-15' },
    { group_name: '자료구조', group_owner: '한서연', group_state: true, group_id: 'DS', member_count: 21, createdAt: '2024-12-01' },
    { group_name: '머신러닝', group_owner: '한서연', group_state: false, group_id: 'ML', member_count: 21, createdAt: '2024-06-10' },
    { group_name: '알고리즘', group_owner: '한서연', group_state: false, group_id: 'AL', member_count: 21, createdAt: '2013-02-25' },
];
