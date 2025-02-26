import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
// import * as monaco from "monaco-editor";

interface CodeLog {
  id: number;
  code: string;
  timestamp: string;
}

interface CodeLogReplayProps {
  codeLogs: CodeLog[];
  idx: number;
}

const CodeLogReplay = ({ codeLogs, idx }: CodeLogReplayProps) => {
  const [currentLogIndex, setCurrentLogIndex] = useState<number>(idx);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);

  // 자동 재생 로직
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying && codeLogs.length > 0) {
      interval = setInterval(() => {
        setCurrentLogIndex((prev) => (prev < codeLogs.length - 1 ? prev + 1 : prev));
      }, 500 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, codeLogs.length]);

  // // Monaco Editor 옵션
  // const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  //   readOnly: true,
  //   minimap: { enabled: false },
  //   scrollBeyondLastLine: false,
  //   fontSize: 18,
  //   lineNumbers: "on",
  //   roundedSelection: false,
  //   contextmenu: false,
  //   automaticLayout: true, // 🔹 부모 컨테이너 크기에 맞춰 자동 조정됨
  //   scrollbar: {
  //     vertical: "visible",
  //     horizontal: "visible",
  //   },
  //   padding: { top: 10, bottom: 10 },
  // };
  

  return  (
    <div className="w-full h-[clamp(45vh, 55vh, 70vh)] p-4">
    <div className="p-4 shadow rounded-lg h-full">
      {/* 🔹 컨트롤 패널 (재생, 속도 설정, 재생 바) */}
      <div className="flex items-center gap-2
                      p-[clamp(4px, 1vw, 16px)] mb-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-8 py-1
                     bg-black text-white rounded hover:bg-gray-800 
                     transition-all duration-200 ease-in-out active:scale-95"
        >
          {isPlaying ? "일시정지" : "재생"}
        </button>
  
        {/* 🔹 재생 속도 설정 */}
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="px-4 py-1 border rounded w-[clamp(60px, 8vw, 120px)] 
                     focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value={1}>0.5x</option>
          <option value={2}>1x</option>
          <option value={4}>2x</option>
          <option value={8}>4x</option>
        </select>
  
        {/* 🔹 재생 바 (반응형 크기 조정) */}
        <input
          type="range"
          min={0}
          max={codeLogs.length - 1}
          value={currentLogIndex}
          onChange={(e) => {
            setCurrentLogIndex(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="flex-1 h-[clamp(4px, 1vw, 8px)]"
          disabled={codeLogs.length === 0}
        />
      </div>
  
      {/* 🔹 코드 에디터 (적응형 높이 조정) */}
      <div className="h-[40vh] border border-gray-200 rounded overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={codeLogs[currentLogIndex]?.code}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 16,
            lineNumbers: "on",
            roundedSelection: false,
            contextmenu: false,
            automaticLayout: true,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
            },
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  </div>
  

  );
};

export default CodeLogReplay;
