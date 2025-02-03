'use client';

import { problems } from '@/data/problems';
import { useParams, useRouter } from 'next/navigation';

export default function ProblemDetailPage() {
    const router = useRouter();
    const { groupId, examId, problemId } = useParams() as {
        groupId: string;
        examId: string;
        problemId: string;
    };

    // 디버깅용 로그 추가
    console.log('groupId:', groupId);
    console.log('examId:', examId);
    console.log('problemId:', problemId);

    const problem = problems.find((p) => p.problemId === problemId);

    // 문제 데이터 확인
    console.log('problem:', problem);

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
            </header>

            <section style={{ marginBottom: '2rem' }}>
                <h2>문제</h2>
                <p>{problem.description}</p>
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
