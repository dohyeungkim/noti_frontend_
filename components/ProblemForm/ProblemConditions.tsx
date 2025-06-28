interface ProblemConditionsProps {
	conditions: string[]
	addCondition: () => void
	removeCondition: (index: number) => void
	updateCondition: (index: number, value: string) => void
}

export default function ProblemConditions({
	conditions,
	addCondition,
	removeCondition,
	updateCondition,
}: ProblemConditionsProps) {
	return (
		<div className="flex-1">
			<h2 className="text-lg font-bold mb-2">문제 조건</h2>
			<div className="border-t border-gray-300 my-3"></div>
			<div className="bg-white shadow-md rounded-xl p-3">
				{conditions.map((condition, index) => (
					<div key={index} className="flex items-center gap-2 mb-2">
						<span className="text-sm font-semibold text-gray-700 min-w-[20px]">{index + 1}.</span>
						<textarea
							rows={1}
							value={condition}
							onChange={(e) => updateCondition(index, e.target.value)}
							onInput={(e) => {
								const ta = e.currentTarget
								ta.style.height = "auto"
								ta.style.height = `${ta.scrollHeight}px`
							}}
							placeholder="조건을 입력하세요"
							className="flex-1 px-2 py-1 border border-gray-300 rounded-lg resize-none overflow-hidden text-sm"
						/>
						<button
							onClick={() => removeCondition(index)}
							className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
						>
							삭제
						</button>
					</div>
				))}
				<button
					onClick={addCondition}
					className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
				>
					+ 조건 추가
				</button>
			</div>
		</div>
	)
} 