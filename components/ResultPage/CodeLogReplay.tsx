import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export interface CodeLog {
  id: number;
  code: string;
  timestamp: string;
}

interface CodeLogReplayProps {
  codeLogs: CodeLog[];
  idx: number;
  language?: string;
}

const CodeLogReplay = ({ codeLogs, language = "python" }: CodeLogReplayProps) => {
  const [currentLogIndex, setCurrentLogIndex] = useState<number>(codeLogs.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextIndex = currentLogIndex + 1;
        if (nextIndex < codeLogs.length) setCurrentLogIndex(nextIndex);
        else setIsPlaying(false);
      }, 500 / playbackSpeed);
    }
    return () => interval && clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentLogIndex, codeLogs.length]);

  const handlePlayPauseClick = () => {
    if (!isPlaying && currentLogIndex === codeLogs.length - 1) setCurrentLogIndex(0);
    setIsPlaying(!isPlaying);
  };

  return (
    // ⬇️ 고정 vh 제거, 부모 높이를 100%로 채우게
    <div className="w-full h-full">
      {/* 카드: 패딩을 여기로 모으고, 내부를 grid로 auto/1fr 분할 */}
      <div className="h-full p-4 shadow rounded-lg grid grid-rows-[auto_1fr] min-h-0">
        {/* 컨트롤 바 (auto) */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handlePlayPauseClick}
            className="w-32 h-8 px-4 py-2 flex items-center justify-center bg-mygreen text-white rounded hover:bg-gray-800 transition-all duration-200 ease-in-out active:scale-95"
          >
            {isPlaying ? "일시정지" : "재생"}
          </button>

          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="px-4 py-1 border rounded w-[clamp(60px,8vw,120px)] focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value={1}>0.5x</option>
            <option value={2}>1x</option>
            <option value={4}>2x</option>
            <option value={8}>4x</option>
          </select>

          <input
            type="range"
            min={0}
            max={codeLogs.length - 1}
            value={currentLogIndex}
            onChange={(e) => setCurrentLogIndex(Number(e.target.value))}
            onMouseDown={() => setIsPlaying(false)}
            style={{
              background: `linear-gradient(to right, #589960 ${
                (currentLogIndex / Math.max(1, codeLogs.length - 1)) * 100
              }%, #D3D3D3 ${(currentLogIndex / Math.max(1, codeLogs.length - 1)) * 100}%)`,
            }}
            className="flex-1 h-[clamp(4px,1vw,8px)] appearance-none rounded-lg overflow-hidden
                       [&::-webkit-slider-runnable-track]:bg-transparent
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full"
          />
        </div>

        {/* 코드 영역 (1fr): 바닥까지, 스크롤 */}
        <div className="min-h-0 overflow-hidden border border-gray-200 rounded">
          <Editor
            height="100%"               // 부모(1fr)의 전체 높이 사용
            defaultLanguage={language}
            value={codeLogs[currentLogIndex]?.code}
            theme="vs-light"
            options={{
              readOnly: true,
              cursorStyle: "line",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 16,
              lineNumbers: "on",
              roundedSelection: false,
              contextmenu: false,
              automaticLayout: true,
              scrollbar: { vertical: "visible", horizontal: "visible" },
              padding: { top: 10, bottom: 10 },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeLogReplay;
