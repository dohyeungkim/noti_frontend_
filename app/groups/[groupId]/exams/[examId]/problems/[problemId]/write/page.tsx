'use client';

import { useParams } from 'next/navigation';
import { problems } from '../../../../../../../../data/problems'; // 문제 데이터 import
import { useState } from 'react';

export default function WriteCodePage() {
    const { problemId } = useParams() as { problemId: string };

    // 문제 데이터를 가져오기
    const problem = problems.find((p) => p.problemId === problemId);

    const [code, setCode] = useState(''); // 작성된 코드
    const [language, setLanguage] = useState('python'); // 선택된 언어

    if (!problem) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>문제를 찾을 수 없습니다</h1>
                <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
            </div>
        );
    }

    const handleSubmit = () => {
        alert(`제출된 코드:\n${code}\n선택된 언어: ${language}`);
        // 여기에서 백엔드 API로 제출 데이터를 전송하는 로직 추가 가능
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex' }}>
            <aside style={{ width: '25%', paddingRight: '1rem', borderRight: '1px solid #ddd' }}>
                <h1>{problem.title}</h1>
                <p>{problem.description}</p>
                <h2>입력</h2>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem' }}>{problem.input}</pre>
                <h2>출력</h2>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem' }}>{problem.output}</pre>
            </aside>
            <main style={{ flex: 1, paddingLeft: '1rem' }}>
                <h2>나의 코드</h2>
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        언어:
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{ marginLeft: '1rem', padding: '0.5rem', fontSize: '1rem' }}
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                        </select>
                    </label>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="여기에 코드를 작성하세요..."
                    style={{
                        width: '100%',
                        height: '300px',
                        marginBottom: '1rem',
                        padding: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        fontFamily: 'monospace',
                        fontSize: '1rem',
                    }}
                />
                <button
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    제출하기
                </button>
            </main>
        </div>
    );
}
