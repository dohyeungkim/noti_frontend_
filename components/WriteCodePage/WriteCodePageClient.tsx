"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
// import { testExams } from "@/data/testmode";
import { AnimatePresence, motion } from "framer-motion";
import { auth_api, problem_api, code_log_api, solve_api } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function WriteCodePageClient({
  params,
}: {
  params: { problemId: string; examId: string; groupId: string };
}) {
  const router = useRouter();
  const { groupId } = useParams();
  const [isExpanded, setIsExpanded] = useState(true);

  const [problem, setProblem] = useState(undefined);

  // const isTestMode = testExams.some((test) => test.examId === params.examId);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [isPrevEnter, setPrevIsEnter] = useState(false);
  const [codeLogs, setCodeLogs] = useState<string[]>([]);
  const [timeStamps, setTimeStamps] = useState<string[]>([]);

  const [userId, setUserId] = useState("");

  const editorRef = useRef(null);

   // 유저 정보 가져오기
   const fetchUser = useCallback(async () => {
    if (userId === "") {  // userId가 비어 있을 때만 실행
      try {
        const res = await auth_api.getUser();
        setUserId(res.user_id);
      } catch (error) {
        console.error("유저 정보를 불러오는 중 오류 발생:", error);
      }
    }
  }, [userId]); // userId 변경 시만 실행

  // 문제 정보 가져오기
  const fetchProblem = useCallback(async () => {
    try {
      const res = await problem_api.problem_get_by_id(Number(params.problemId));
      setProblem(res);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [params.problemId]); // problemId 변경 시 실행

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // userId가 변경되면 다시 실행

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]); // problemId 변경 시 다시 실행


  const handleKeyDown = () => {
    if (editorRef.current) {
      const newCode = editorRef.current.getValue()
      setCode(newCode);
      setCodeLogs((prevLogs) => [...prevLogs, newCode]);
      setTimeStamps((prev) => [...prev, new Date().toISOString()]);
    }
    // 무한 엔터에 관하여. 예외 처리 해줘야함.
  };

  const handleSubmit = async () => {
    if (!params.groupId || !params.examId || !params.problemId) {
      alert("❌ 오류: 필요한 값이 없습니다!");
      return;
    }

    // setCodeLogs((prevLogs) => [...prevLogs, code]);
    // setTimeStamps((prev) => [...prev, new Date().toISOString()]);

    await submitLogs();
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const submitLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const newCode = editorRef.current?.getValue();
      const newCodeLogs = [...codeLogs, newCode];
      const newTimeStamps = [...timeStamps, new Date().toISOString()];

      const data = await solve_api.sovle_create(
        Number(params.groupId),
        Number(params.examId),
        Number(params.problemId),
        userId,
        newCode,
        language
      );
      await code_log_api.code_log_create(
        Number(data.solve_id),
        userId,
        newCodeLogs,
        newTimeStamps
      );

      console.log("제출 성공:", newCodeLogs, newTimeStamps);
      setCodeLogs([]);
      setTimeStamps([]);

      router.push(
        `/mygroups/${groupId}/exams/${params.examId}/problems/${params.problemId}/result`
      );
    } catch (err) {
      alert(
        `❌ 제출 오류: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return !problem ? (
    <div className="flex items-center gap-2 justify-end">
      {/* <h1 className="text-2xl font-bold">문제를 가져오는 중입니다. </h1> */}
      {/* <p>잘못된 경로로 접근했거나 문제가 삭제되었습니다.</p> */}
    </div>
  ) : (
    <>
      <motion.div
        className="flex items-center gap-2 justify-end"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-500"
          } text-white px-16 py-1.5 rounded-xl m-2 text-md`}
        >
          {loading ? "제출 중..." : "제출하기"}
        </motion.button>
      </motion.div>

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}

      <main className=" flex flex-1 gap-x-6 mt-3 w-full 
                h-[65vh] sm:h-[60vh] md:h-[60vh] lg:h-[60vh]">
        {/* 문제 설명 영역 (왼쪽) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              layout
              initial={{ flex: 0, opacity: 0 }}
              animate={{ flex: 1, opacity: 1 }}
              exit={{ flex: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="overflow-hidden border-r-2 pr-4"
            >
              <div className="sticky top-0z-10 pb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
    {problem.title.length > 20 ? `${problem.title.slice(0, 20)}...` : problem.title}
  </h1>
                <hr className="border-t-2 border-gray-400" />
              </div>
              <div className="overflow-y-auto max-h-[calc(100%-120px)] p-2 pr-2">
                <div
                  className="editor-content"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-start">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 border rounded-lg transition hover:bg-gray-200"
          >
            {isExpanded ? "<" : ">"}
          </button>
        </div>
        {/* 코드 에디터 영역 (오른쪽) */}
        <div
          className="flex-1 flex-col min-w-0 transition-all duration-300"
          style={{ flex: isExpanded ? 1 : 5 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">나의 코드</h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="python">Python</option>
              <option value="C"> C</option>
              <option value="C++">C++</option>
            </select>
          </div>
          <div className="border-b-2 border-black my-2"></div>

          <div className="bg-white p-4 rounded shadow">
            <MonacoEditor
                   height="45vh"

              language={language}
              value={code}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 20,
                lineNumbers: "off",
                roundedSelection: false,
                contextmenu: false,
                automaticLayout: true,
                copyWithSyntaxHighlighting: false,
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                },
                padding: { top: 10, bottom: 10 },
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;

                editor.onKeyDown((event) => {
                  if(event.keyCode === monaco.KeyCode.Enter){
                    handleKeyDown(event);
                  }
                })
              }}
            />
          </div>
        </div>
      </main>

      {/* ✅ 테이블 테두리 강제 적용 */}
      <style>
        {`
          .editor-content h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
          .editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
          .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }

         /* ✅ 전체 테이블 스타일 */
.editor-content table {
  width: 100%;
  border-collapse: collapse !important; /* ✅ 테두리 겹침 방지 */
  border-spacing: 0 !important; /* ✅ 셀 간격 제거 */
  margin-top: 10px !important;
  border: 2px solid #d4d4d4 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  background-color: #f9f9f9 !important;
}

/* ✅ 헤더 스타일 */
.editor-content th {
  background-color: #f1f1f1 !important;
  font-weight: 600 !important;
  text-align: center !important;
  color: #333 !important;
  padding: 14px !important;
  border-bottom: 1.5px solid #d4d4d4 !important;
  border-right: 1px solid #d4d4d4 !important; /* ✅ 오른쪽 테두리 조정 */
}

/* ✅ 내부 셀 스타일 */
.editor-content td {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  padding: 12px !important;
  text-align: left !important;
  font-size: 1rem !important;
  color: #444 !important;
  transition: background 0.2s ease-in-out !important;
  border-radius: 0 !important;
}

/* ✅ 강조된 셀 (제목 스타일) */
.editor-content td[data-header="true"] {
  background-color: #e7e7e7 !important;
  font-weight: bold !important;
  text-align: center !important;
  color: #222 !important;
}

/* ✅ 마우스 오버 효과 */
.editor-content td:hover {
  background-color: #f5f5f5 !important;
}

/* ✅ 테이블 전체 둥글게 조정 */
.editor-content tr:first-child th:first-child {
  border-top-left-radius: 12px !important;
}
.editor-content tr:first-child th:last-child {
  border-top-right-radius: 12px !important;
}
.editor-content tr:last-child td:first-child {
  border-bottom-left-radius: 12px !important;
}
.editor-content tr:last-child td:last-child {
  border-bottom-right-radius: 12px !important;
}

        
        `}
      </style>
    </>
  );
}
