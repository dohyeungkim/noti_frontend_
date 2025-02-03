'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyQuestionsPage() {
    const router = useRouter();

    const [search, setSearch] = useState('');

    const handleNavigate = () => {
        router.push('my-questions/create'); // 이동할 경로 지정
    };

    const mockData = [
        { id: 1, title: '두 수의 합', group: '프로그래밍 기초', paper: '파이썬 기초 문제지 1번', solvedCount: 23 },
        { id: 2, title: '두 수의 차', group: '프로그래밍 기초', paper: '파이썬 기초 문제지 1번', solvedCount: 23 },
    ];

    const filteredData = mockData.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>내가 등록한 문제들</h1>
                <p>문제를 등록하고 수정하고 피드백하고</p>
            </header>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="문제 제목 검색"
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        marginRight: '1rem',
                    }}
                />
                <button
                    onClick={handleNavigate} // 버튼 클릭 시 handleNavigate 실행
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'black',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    문제 만들기
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '0.5rem' }}>문제 제목</th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '0.5rem' }}>그룹명</th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '0.5rem' }}>문제지</th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '0.5rem' }}>푼 사람 수</th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '0.5rem' }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item) => (
                        <tr key={item.id}>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{item.title}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{item.group}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{item.paper}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{item.solvedCount}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                                <button
                                    style={{
                                        backgroundColor: 'gray',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        marginRight: '0.5rem',
                                    }}
                                >
                                    수정
                                </button>
                                <button
                                    style={{
                                        backgroundColor: 'red',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
