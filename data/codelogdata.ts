export interface CodeLog {
    id: number;
    user_id : number; // solved id를 통해 userid를 가져올 수 있음.
    solve_id: number;
    code: string;
    created_at: string;
}

export const myCodeLogs: CodeLog[] = [
    {
        id: 1,
        user_id : 5,
        solve_id: 1,
        code: "print('Hello, world!')\n",
        created_at: "2026-02-10T12:00:00"
    },
    {
        id: 2,
        user_id : 5,
        solve_id: 1,
        code: "print('Hello, world!')\nx = 10\n",
        created_at: "2026-02-10T12:00:02"
    },
    {
        id: 3,
        user_id : 5,
        solve_id: 1,
        code: "print('Hello, world!')\nx = 10\ny = 20\n",
        created_at: "2026-02-10T12:00:04"
    },
    {
        id: 4,
        user_id : 5,
        solve_id: 1,
        code: "print('Hello, world!')\nx = 10\ny = 20\nprint(x + y)\n",
        created_at: "2026-02-10T12:00:06"
    },
    {
        id: 5,
        user_id : 5,
        solve_id: 1,
        code: "def add(a, b):\n    return a + b\n",
        created_at: "2026-02-10T12:01:00"
    },
    {
        id: 6,
        user_id : 5,
        solve_id: 1,
        code: "def add(a, b):\n    return a + b\n\nresult = add(5, 7)\n",
        created_at: "2026-02-10T12:01:02"
    },
    {
        id: 7,
        user_id : 5,
        solve_id: 1,
        code: "def add(a, b):\n    return a + b\n\nresult = add(5, 7)\nprint(result)\n",
        created_at: "2026-02-10T12:01:04"
    }
];


export const p1CodeLogs: CodeLog[] = [
    { id: 1, solve_id: 2, user_id: 1, code: "a = 10\n", created_at: "2026-02-10T12:00:00" },
    { id: 2, solve_id: 2, user_id: 1, code: "a = 10\nb = 20\n", created_at: "2026-02-10T12:00:02" },
    { id: 3, solve_id: 2, user_id: 1, code: "a = 10\nb = 20\nprint(a + b)\n", created_at: "2026-02-10T12:00:04" }
  ];
  
  export const p2CodeLogs: CodeLog[] = [
    { id: 4, solve_id: 3, user_id: 2, code: "x = 5\n", created_at: "2026-02-10T12:01:00" },
    { id: 5, solve_id: 3, user_id: 2, code: "x = 5\ny = 15\n", created_at: "2026-02-10T12:01:02" },
    { id: 6, solve_id: 3, user_id: 2, code: "x = 5\ny = 15\nprint(x * y)\n", created_at: "2026-02-10T12:01:04" }
  ];
  
  export const p3CodeLogs: CodeLog[] = [
    { id: 7, solve_id: 4, user_id: 3, code: "def square(n):\n", created_at: "2026-02-10T12:02:00" },
    { id: 8, solve_id: 4, user_id: 3, code: "def square(n):\n    return n * n\n", created_at: "2026-02-10T12:02:02" },
    { id: 9, solve_id: 4, user_id: 3, code: "def square(n):\n    return n * n\nprint(square(4))\n", created_at: "2026-02-10T12:02:04" }
  ];

  export const codeLogsList: CodeLog[][] = [
    myCodeLogs,
    p1CodeLogs,
    p2CodeLogs,
    p3CodeLogs
  ]