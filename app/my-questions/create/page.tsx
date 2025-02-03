'use client';

import { useState } from 'react';

export default function NewQuestionPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [inputs, setInputs] = useState([{ input: '', output: '' }]);

    const handleInputChange = (index: number, field: 'input' | 'output', value: string) => {
        const newInputs = [...inputs];
        newInputs[index][field] = value;
        setInputs(newInputs);
    };

    const addInputOutputPair = () => {
        setInputs([...inputs, { input: '', output: '' }]);
    };

    const removeInputOutputPair = (index: number) => {
        const newInputs = inputs.filter((_, i) => i !== index);
        setInputs(newInputs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 제출할 데이터
        const questionData = {
            title,
            description,
            testCases: inputs, // [{ input: '1+1', output: '2' }, ...]
        };

        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionData),
            });

            if (response.ok) {
                const data = await response.json();
                alert('문제가 성공적으로 등록되었습니다!');
                console.log(data); // 서버에서 반환된 데이터
            } else {
                console.error('문제 등록 실패:', response.statusText);
                alert('문제 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('에러 발생:', error);
            alert('서버와의 통신 중 에러가 발생했습니다.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>문제 등록</h1>
            </header>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>문제 제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="문제 제목을 입력하세요"
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            marginTop: '0.5rem',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>문제 작성</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="문제 설명을 입력하세요"
                        style={{
                            width: '100%',
                            height: '150px',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            marginTop: '0.5rem',
                        }}
                    ></textarea>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>입출력 쌍 등록</label>
                    {inputs.map((pair, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="입력"
                                value={pair.input}
                                onChange={(e) => handleInputChange(index, 'input', e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    marginRight: '0.5rem',
                                }}
                            />
                            <input
                                type="text"
                                placeholder="출력"
                                value={pair.output}
                                onChange={(e) => handleInputChange(index, 'output', e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    marginRight: '0.5rem',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeInputOutputPair(index)}
                                style={{
                                    backgroundColor: 'red',
                                    color: 'white',
                                    padding: '0.5rem',
                                    borderRadius: '5px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addInputOutputPair}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'green',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        다른 쌍 등록하기
                    </button>
                </div>

                <button
                    type="submit"
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'black',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    등록하기
                </button>
            </form>
        </div>
    );
}
