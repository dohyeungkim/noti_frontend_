'use client';

import { problems } from '@/data/problems';
import { testExams } from '@/data/testmode'; // 시험 데이터 추가
import { useParams, useRouter } from 'next/navigation';

export default function ProblemDetailPage() {
    const router = useRouter();
    const { groupId, examId, problemId } = useParams() as {
        groupId: string;
        examId: string;
        problemId: string;
    };

    // 현재 문제 가져오기
    const problem = problems.find((p) => p.problemId === problemId);

    // 시험 모드 여부 확인 (현재 문제의 `examId`가 `testExams`에 포함되는지 체크)
    const isTestMode = testExams.some((test) => test.examId === examId);

    // 디버깅 로그 추가
    console.log('groupId:', groupId);
    console.log('examId:', examId);
    console.log('problemId:', problemId);
    console.log('problem:', problem);
    console.log('isTestMode:', isTestMode);

    if (!problem) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>문제를 찾을 수 없습니다</h1>
                <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p>
            </div>
        );
    }

    const handleNavigate = () => {
        const destination = `/groups/${groupId}/exams/${examId}/problems/${problemId}/write`;

        // 디버깅용 로그 추가
        console.log('Navigating to:', destination);

        router.push(destination);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{problem.title}</h1>
                <p>{problem.examName}</p>

                {isTestMode && (
                    <span style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                    }}>
                        시험 모드 🚨
                    </span>
                )}
            </header>

            <section style={{ marginBottom: '2rem' }}>
                <h2>문제 설명</h2>
                <p>{problem.description}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>입력 예시</h3>
                <pre style={{
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '5px'
                }}>{problem.input}</pre>

                <h3>출력 예시</h3>
                <pre style={{
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '5px'
                }}>{problem.output}</pre>
            </section>

            <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleNavigate}
                    style={{
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    문제 풀기
                </button>
            </footer>
        </div>
    );
}
