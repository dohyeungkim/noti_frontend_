import { useState } from "react"
import { TestCase } from "@/hooks/useProblemForm"

interface TestCaseSectionProps {
  testCases: TestCase[]
  addTestCase: () => void
  removeTestCase: (index: number) => void
  updateTestCase: (index: number, field: keyof TestCase, value: string | boolean) => void
  testResults?: (boolean | null)[]
  /** 부모에서 run_code_example_api 호출하도록 전달 */
  runAll?: () => Promise<void>
}

export default function TestCaseSection({
  testCases,
  addTestCase,
  removeTestCase,
  updateTestCase,
  testResults = [],
  runAll,
}: TestCaseSectionProps) {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRunAll = async () => {
    if (!runAll) return
    setError(null)
    setRunning(true)
    try {
      await runAll()
    } catch (e: any) {
      setError(e?.message || "코드 실행 중 오류가 발생했어")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold mb-2">테스트 케이스</h2>

        {/* 전체 실행 버튼 */}
        {runAll && (
          <button
            onClick={handleRunAll}
            disabled={running || testCases.length === 0}
            className={`px-3 py-1 rounded text-sm font-medium border transition-colors
              ${running
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
              }`}
          >
            {running ? "실행 중..." : "모든 테스트 실행"}
          </button>
        )}
      </div>

      <div className="border-t border-gray-300 my-3"></div>

      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl p-3">
        <div className="space-y-3">
          {testCases.map((testCase, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">테스트 케이스 {index + 1}</span>
                  {typeof testResults[index] === "boolean" && (
                    <span
                      className={`text-xs font-bold ${testResults[index] ? "text-green-600" : "text-red-600"}`}
                    >
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
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={(testCase as any).no_input || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        updateTestCase(index, "input", checked ? "X" : "")
                        updateTestCase(index, "no_input" as keyof TestCase, checked)
                      }}
                      className="rounded"
                    />
                    입력 없음
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
                    disabled={(testCase as any).no_input}
                    className={`w-full px-2 py-1 border rounded text-xs resize-none ${
                      (testCase as any).no_input ? "bg-gray-200 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
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
