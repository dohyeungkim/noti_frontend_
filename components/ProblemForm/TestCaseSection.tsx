import { TestCase } from "@/hooks/useProblemForm";//모듈 훅 추가

interface TestCaseSectionProps {
	testCases: TestCase[]
	addTestCase: () => void
	removeTestCase: (index: number) => void
	updateTestCase: (index: number, field: keyof TestCase, value: string | boolean) => void
	testResults?: (boolean | null)[]
}

export default function TestCaseSection({
	testCases,
	addTestCase,
	removeTestCase,
	updateTestCase,
	testResults = [],
}: TestCaseSectionProps) {
	return (//사용자 UI
		<div className="mb-6">
			<h2 className="text-lg font-bold mb-2">테스트 케이스</h2>
			<div className="border-t border-gray-300 my-3"></div>
			
			<div className="bg-white shadow-md rounded-xl p-3">
				
				<div className="space-y-3">
					{testCases.map((testCase, index) => (
						<div key={index} className="border border-gray-200 rounded-lg p-3">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<span className="text-sm font-semibold text-gray-700">테스트 케이스 {index + 1}</span>
									{typeof testResults[index] === "boolean" && (
										<span className={`text-xs font-bold ${testResults[index] ? "text-green-600" : "text-red-600"}`}>
											● {testResults[index] ? "통과" : "비통과"}
										</span>
									)}
								</div>
								<div className="flex items-center gap-2">
									<label className="flex items-center gap-1 text-xs">
										<input
											type="checkbox"
											checked={testCase.is_sample}
											onChange={(e) => updateTestCase(index, "is_sample", e.target.checked)}
											className="rounded"
										/>
										샘플
									</label>
									<button
										onClick={() => removeTestCase(index)}
										className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
									>
										삭제
									</button>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">입력</label>
									<textarea
										value={testCase.input}
										onChange={(e) => updateTestCase(index, "input", e.target.value)}
										placeholder="입력값"
										className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
										rows={3}
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">예상 출력</label>
									<textarea
										value={testCase.expected_output}
										onChange={(e) => updateTestCase(index, "expected_output", e.target.value)}
										placeholder="예상 출력값"
										className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
										rows={3}
									/>
								</div>
							</div>
						</div>
					))}
					<button
						onClick={addTestCase}
						className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors"
					>
						+ 테스트 케이스 추가
					</button>
				</div>
			</div>
		</div>
	)
} 