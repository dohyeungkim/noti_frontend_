import { ReferenceCode, languageDisplayNames } from "@/hooks/useProblemForm";//모듈, 훅 추가
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,//서버사이드? 렌더링 시 클라이언트에서 로드
});

interface ReferenceCodeEditorProps {//여러개의 참조코드를 탭 형식으로..
	referenceCodes: ReferenceCode[]
	activeCodeTab: number
	setActiveCodeTab: (index: number) => void
	addReferenceCode: () => void
	removeReferenceCode: (index: number) => void
	updateReferenceCodeLanguage: (index: number, language: ReferenceCode["language"]) => void
	updateReferenceCode: (index: number, code: string) => void
	setMainReferenceCode: (index: number) => void
}

export default function ReferenceCodeEditor({//외부에서 접근가능하게
	referenceCodes,
	activeCodeTab,
	setActiveCodeTab,
	addReferenceCode,
	removeReferenceCode,
	updateReferenceCodeLanguage,
	updateReferenceCode,	
	setMainReferenceCode,
}: ReferenceCodeEditorProps) {
	return (//사용자 UI
		<div className="w-1/2 flex flex-col">
			<div className="flex justify-between items-center mb-2">
				<h3 className="text-lg font-semibold">참조 코드</h3>
				<button
					onClick={addReferenceCode}
					className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 text-xs"
				>
					+ 코드 추가
				</button>
			</div>
			<div className="border-b-2 border-black my-2"></div>

			{/* 코드 탭 */}
			<div className="flex gap-1 mb-2 overflow-x-auto">
				{referenceCodes.map((refCode, index) => (
					<div key={index} className="flex items-center shrink-0">
						<div
							className={`px-2 py-1 rounded-t-md text-xs flex items-center gap-2 ${
								activeCodeTab === index ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
							}`}
						>
							<button onClick={() => setActiveCodeTab(index)} className="flex items-center gap-2">
								{languageDisplayNames[refCode.language]}
							</button>
							{referenceCodes.length > 1 && (
								<button
									onClick={() => removeReferenceCode(index)}
									className={`text-xs hover:bg-opacity-20 hover:bg-white rounded px-1 ${
										activeCodeTab === index ? "text-white" : "text-gray-600"
									}`}
								>
									×
								</button>
							)}
						</div>
					</div>
				))}
			</div>

			{/* 현재 활성 코드의 설정 */}
			{referenceCodes[activeCodeTab] && (
				<div className="flex items-center gap-2 mb-2">
					<select
						value={referenceCodes[activeCodeTab].language}
						onChange={(e) =>
							updateReferenceCodeLanguage(activeCodeTab, e.target.value as ReferenceCode["language"])
						}
						className="border rounded-md p-1 text-xs"
					>
						<option value="python">Python</option>
						<option value="java">Java</option>
						<option value="cpp">C++</option>
						<option value="c">C</option>
						<option value="javascript">JavaScript</option>
					</select>

					{!referenceCodes[activeCodeTab].is_main && (
						<button
							onClick={() => setMainReferenceCode(activeCodeTab)}
							className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600"
						>
							메인으로 설정
						</button>
					)}
				</div>
			)}

			{/* 코드 에디터 */}
			<div className="bg-white p-0 rounded shadow flex-1">
				{referenceCodes[activeCodeTab] && (
					<MonacoEditor
						height="100%"
						width="100%"
						language={
							referenceCodes[activeCodeTab].language === "cpp" ? "cpp" : referenceCodes[activeCodeTab].language
						}
						value={referenceCodes[activeCodeTab].code}
						onChange={(value) => updateReferenceCode(activeCodeTab, value ?? "")}
						options={{
							minimap: { enabled: false },
							scrollBeyondLastLine: false,
							fontSize: 12,
							lineNumbers: "on",
							roundedSelection: false,
							contextmenu: false,
							automaticLayout: true,
							copyWithSyntaxHighlighting: false,
							scrollbar: {
								vertical: "visible",
								horizontal: "visible",
							},
							padding: { top: 8, bottom: 8 },
						}}
					/>
				)}
			</div>
		</div>
	)
} 