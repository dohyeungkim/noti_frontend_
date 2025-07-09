// data/gradingDummy.ts

export interface GradingStudent {
	studentId: string
	studentName: string
	problemScores: number[] // 각 문제별 점수
	problemStatus: boolean[] // 각 문제별 검토 상태 (true: 검토 완료, false: 미검토)
	submittedAt: string // 제출 시간
	totalScore?: number // 총점 (옵션)
}

export interface GradingData {
	examId: string
	workbookId: number
	groupId: number
	problemCount: number // 문제 수
	maxScorePerProblem: number // 문제당 최대 점수
	students: GradingStudent[]
}

// 채점 더미 데이터
export const gradingDummy: GradingStudent[] = [
	{
		studentId: "student-001",
		studentName: "이승현",
		problemScores: [5, 5, 5, 5, 5], // 5개 문제, 각 5점
		problemStatus: [true, false, false, false, false], // 첫 번째 문제만 검토 완료
		submittedAt: "2025-07-09T10:30:00+09:00",
	},
	{
		studentId: "student-002",
		studentName: "김민준",
		problemScores: [4, 3, 5, 2, 5],
		problemStatus: [true, true, false, false, false],
		submittedAt: "2025-07-09T10:45:00+09:00",
	},
	{
		studentId: "student-003",
		studentName: "박서연",
		problemScores: [5, 4, 5, 5, 4],
		problemStatus: [true, true, true, false, false],
		submittedAt: "2025-07-09T11:00:00+09:00",
	},
	{
		studentId: "student-004",
		studentName: "최지우",
		problemScores: [3, 4, 2, 3, 4],
		problemStatus: [true, true, true, true, false],
		submittedAt: "2025-07-09T11:15:00+09:00",
	},
	{
		studentId: "student-005",
		studentName: "정도윤",
		problemScores: [5, 5, 4, 5, 5],
		problemStatus: [true, true, true, true, true], // 모든 문제 검토 완료
		submittedAt: "2025-07-09T11:20:00+09:00",
		totalScore: 24, // 총점 예시
	},
	{
		studentId: "student-006",
		studentName: "강하은",
		problemScores: [4, 3, 3, 4, 5],
		problemStatus: [true, false, false, true, false],
		submittedAt: "2025-07-09T11:30:00+09:00",
	},
	{
		studentId: "student-007",
		studentName: "윤서준",
		problemScores: [5, 4, 5, 3, 4],
		problemStatus: [true, true, true, false, false],
		submittedAt: "2025-07-09T11:40:00+09:00",
	},
]

// 채점 상세 정보 더미 데이터 (문제별 상세 정보)
export const gradingDetailDummy = {
	examId: "exam-001",
	workbookId: 1,
	groupId: 101,
	problemCount: 5,
	maxScorePerProblem: 5,
	problems: [
		{
			problemId: 1,
			title: "React 컴포넌트 생명주기",
			type: "코딩",
			score: 5,
		},
		{
			problemId: 2,
			title: "React Hooks 활용",
			type: "코딩",
			score: 5,
		},
		{
			problemId: 3,
			title: "상태 관리 방법",
			type: "객관식",
			score: 5,
		},
		{
			problemId: 4,
			title: "Context API 구현",
			type: "코딩",
			score: 5,
		},
		{
			problemId: 5,
			title: "최적화 방법",
			type: "주관식",
			score: 5,
		},
	],
}

// 학생별 제출물 더미 데이터 (단일 학생)
export const studentSubmission = {
	studentId: "student-001",
	studentName: "이승현",
	examId: "exam-001",
	workbookId: 1,
	groupId: 101,
	submittedAt: "2025-07-09T10:30:00+09:00",
	submissions: [
		{
			problemId: 1,
			answerType: "code",
			answer: `import React, { Component } from 'react';

class LifecycleExample extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    console.log('Constructor called');
  }

  componentDidMount() {
    console.log('Component mounted');
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('Component updated');
  }

  componentWillUnmount() {
    console.log('Component will unmount');
  }

  render() {
    console.log('Render called');
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

export default LifecycleExample;`,
			score: 5,
		},
		{
			problemId: 2,
			answerType: "code",
			answer: `import React, { useState, useEffect } from 'react';

function HooksExample() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Guest');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
    
    return () => {
      document.title = 'React App';
    };
  }, [count]);

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
      />
    </div>
  );
}

export default HooksExample;`,
			score: 4,
		},
		{
			problemId: 3,
			answerType: "multipleChoice",
			answer: "2", // 객관식 문제 답안 (선택지 인덱스)
			score: 5,
		},
		{
			problemId: 4,
			answerType: "code",
			answer: `import React, { createContext, useContext, useState } from 'react';

// Create context
const ThemeContext = createContext();

// Provider component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Example component using the theme
export function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff',
        padding: '10px 15px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}
    >
      Toggle Theme
    </button>
  );
}`,
			score: 5,
		},
		{
			problemId: 5,
			answerType: "text",
			answer:
				"React 애플리케이션의 성능을 최적화하기 위해 주로 memo, useMemo, useCallback 훅을 사용합니다. memo는 컴포넌트를 메모이제이션하여 props가 변경되지 않으면 리렌더링을 방지합니다. useMemo는 계산 비용이 높은 값의 계산 결과를 메모이제이션하고, useCallback은 함수를 메모이제이션하여 불필요한 재생성을 방지합니다. 또한 코드 스플리팅과 지연 로딩을 통해 초기 로딩 시간을 단축할 수 있습니다.",
			score: 4,
		},
	],
}

// 다른 학생들의 제출물 더미 데이터
export const studentSubmissionsCollection = {
	"student-002": {
		studentId: "student-002",
		studentName: "김민준",
		examId: "exam-001",
		workbookId: 1,
		groupId: 101,
		submittedAt: "2025-07-09T10:45:00+09:00",
		submissions: [
			{
				problemId: 1,
				answerType: "code",
				answer: `import React, { Component } from 'react';

class LifecycleComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { message: 'Hello' };
  }

  componentDidMount() {
    console.log('Mounted');
    setTimeout(() => {
      this.setState({ message: 'Hello World' });
    }, 1000);
  }

  componentDidUpdate() {
    console.log('Updated');
  }

  componentWillUnmount() {
    console.log('Unmounting');
  }

  render() {
    return (
      <div>
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}`,
				score: 4,
			},
			{
				problemId: 2,
				answerType: "code",
				answer: `import React, { useState, useEffect } from 'react';

function HooksDemo() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Effect ran');
    
    return () => {
      console.log('Cleanup');
    };
  }, [count]);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Click me
      </button>
    </div>
  );
}`,
				score: 3,
			},
			{
				problemId: 3,
				answerType: "multipleChoice",
				answer: "1",
				score: 0,
			},
			{
				problemId: 4,
				answerType: "code",
				answer: `import React, { createContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}`,
				score: 2,
			},
			{
				problemId: 5,
				answerType: "text",
				answer: "React 최적화는 memo, React.PureComponent, shouldComponentUpdate 등을 사용합니다.",
				score: 5,
			},
		],
	},
	"student-003": {
		studentId: "student-003",
		studentName: "박서연",
		examId: "exam-001",
		workbookId: 1,
		groupId: 101,
		submittedAt: "2025-07-09T11:00:00+09:00",
		submissions: [
			{
				problemId: 1,
				answerType: "code",
				answer: `import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    // 데이터 로딩
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  render() {
    return (
      <div>
        <h1>Data List</h1>
        <ul>
          {this.state.data.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}`,
				score: 5,
			},
			{
				problemId: 2,
				answerType: "code",
				answer: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
				score: 4,
			},
			{
				problemId: 3,
				answerType: "multipleChoice",
				answer: "2",
				score: 5,
			},
			{
				problemId: 4,
				answerType: "code",
				answer: `import React, { createContext } from 'react';

// 컨텍스트 생성
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <ThemedButton />;
}

function ThemedButton() {
  return (
    <ThemeContext.Consumer>
      {theme => <Button theme={theme} />}
    </ThemeContext.Consumer>
  );
}`,
				score: 5,
			},
			{
				problemId: 5,
				answerType: "text",
				answer:
					"React 성능 최적화를 위해 Virtual DOM 비교 알고리즘을 이해하고, 불필요한 렌더링을 방지하는 memo, shouldComponentUpdate, useMemo, useCallback 등을 활용해야 합니다. 또한 큰 애플리케이션에서는 코드 분할과 지연 로딩을 구현하는 것이 좋습니다.",
				score: 4,
			},
		],
	},
}
