import { ReferenceCode, languageDisplayNames, ProblemType } from "@/hooks/useProblemForm"
import dynamic from "next/dynamic"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface ReferenceCodeEditorProps {
	referenceCodes: ReferenceCode[]
	activeCodeTab: number
	setActiveCodeTab: (index: number) => void
	addReferenceCode: () => void
	removeReferenceCode: (index: number) => void
	updateReferenceCodeLanguage: (index: number, language: ReferenceCode["language"]) => void
	updateReferenceCode: (index: number, code: string) => void
	setMainReferenceCode: (index: number) => void
	// 디버깅용 베이스 코드 기능
	problemType: ProblemType
	baseCode: string
	onSetBaseCode: (code: string) => void
}

export default function ReferenceCodeEditor({
	referenceCodes,
	activeCodeTab,
	setActiveCodeTab,
	addReferenceCode,
	removeReferenceCode,
	updateReferenceCodeLanguage,
	updateReferenceCode,
	setMainReferenceCode,
	problemType,
	baseCode,
	onSetBaseCode,
}: ReferenceCodeEditorProps) {
	return (
		<div className="w-1/2 flex flex-col">
			<div className="flex justify-between items-center mb-2">
				{problemType === "코딩" ? (
					<h3 className="text-lg font-semibold">참조 코드</h3>
				) : (
					<h3 className="text-lg font-semibold">베이스 코드</h3>
				)}

				<button
					onClick={addReferenceCode}
					className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 text-xs"
				>
					+ 코드 추가
				</button>
			</div>
			<div className="border-b-2 border-black my-2" />

			{/* 코드 탭 */}
			<div className="flex gap-1 mb-2 overflow-x-auto">
				{referenceCodes.map((refCode, index) => {
					const isBase = problemType === "디버깅" && refCode.code === baseCode
					const isActive = activeCodeTab === index
					return (
						<div key={index} className="flex items-center shrink-0">
							<div
								className={`px-2 py-1 rounded-t-md text-xs flex items-center gap-2 cursor-pointer
                  ${
										isBase
											? "bg-yellow-300 text-black"
											: isActive
											? "bg-blue-500 text-white"
											: "bg-gray-200 hover:bg-gray-300"
									}`}
								onClick={() => setActiveCodeTab(index)}
							>
								{languageDisplayNames[refCode.language]}
								{referenceCodes.length > 1 && problemType !== "디버깅" && (
									<button
										onClick={() => removeReferenceCode(index)}
										className={`ml-1 text-xs rounded px-1 ${isActive ? "text-white" : "text-gray-600"}`}
									>
										×
									</button>
								)}
							</div>
						</div>
					)
				})}
			</div>

			{/* 코드 설정 영역 */}

			{referenceCodes[activeCodeTab] && (
				<div className="flex items-center gap-2 mb-2">
					<select
						value={referenceCodes[activeCodeTab].language}
						onChange={(e) => updateReferenceCodeLanguage(activeCodeTab, e.target.value as ReferenceCode["language"])}
						className="border rounded-md p-1 text-xs"
					>
						<option value="python">Python</option>
						<option value="java">Java</option>
						<option value="cpp">C++</option>
						<option value="c">C</option>
						<option value="javascript">JavaScript</option>
					</select>

					{problemType === "디버깅" ? (
						<button
							onClick={() => onSetBaseCode(referenceCodes[activeCodeTab].code)}
							className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 text-xs"
						>
							베이스 코드로 지정
						</button>
					) : (
						!referenceCodes[activeCodeTab].is_main && (
							<button
								onClick={() => setMainReferenceCode(activeCodeTab)}
								className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 text-xs"
							>
								메인으로 설정
							</button>
						)
					)}
				</div>
			)}

			{/* 코드 에디터 */}
			<div className="bg-white p-0 rounded shadow flex-1">
				{referenceCodes[activeCodeTab] && (
					<MonacoEditor
						height="100%"
						width="100%"
						language={referenceCodes[activeCodeTab].language === "cpp" ? "cpp" : referenceCodes[activeCodeTab].language}
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
