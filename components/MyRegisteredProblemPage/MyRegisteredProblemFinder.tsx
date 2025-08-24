"use client"
/**
 * ===== 추가할 기능 =====
 * >> 코딩/디버깅: 코드, 테스트 케이스 수정
 * 객관식: 선지 및 정답 인덱스 수정
 * 주관식: 정답 수정 (배열)
 * 단답형: 정답 수정 (배열)
 * 공통: AI 채점 기준 표시(배열) + 수정
 *
 * >> 문제지 추가 모달창 제작
 *
 * ===== 추가할 API =====
 * 1. 문제 id가 주어졌을 때 그룹, 문제지 정보(name) GET
 * 2. 문제 일부 정보 수정 API 추가 PATCH
 * 3. 내가 그룹장인 그룹과 그안에 존재하는 문제지 리스트 조회 GET (기존 문제지에 문제 추가) -> 문재 추가는 그대로
 * 4.
 */

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { dummyProblems, type ProblemDetail } from "@/data/finderProblems"

const DIFFICULTY_OPTIONS = [
	{ label: "easy", value: "easy" },
	{ label: "medium", value: "medium" },
	{ label: "hard", value: "hard" },
] as const

// 문제 유형 별 rating_mode 선택지
const RATING_OPTIONS_BY_TYPE: Record<
	"코딩" | "디버깅" | "단답형" | "주관식" | "객관식",
	{ label: string; value: any }[]
> = {
	코딩: [
		{ label: "hard", value: "hard" },
		{ label: "space", value: "space" },
		{ label: "regex", value: "regex" },
		{ label: "none", value: "none" },
	],
	디버깅: [
		{ label: "regex", value: "regex" },
		{ label: "hard", value: "hard" },
		{ label: "space", value: "space" },
		{ label: "none", value: "none" },
	],
	단답형: [
		{ label: "exact", value: "exact" },
		{ label: "partial", value: "partial" },
		{ label: "soft", value: "soft" },
		{ label: "none", value: "none" },
	],
	주관식: [
		{ label: "active", value: "active" },
		{ label: "deactive", value: "deactive" },
	],
	객관식: [{ label: "none", value: "none" }],
}

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleString()
	} catch {
		return iso
	}
}

// 텍스트 에디터 (title, description)
function EditableText({
	value,
	onCommit,
	onCancel,
	multiline = false,
	autoFocus = true,
}: {
	value: string
	onCommit: (next: string) => void
	onCancel: () => void
	multiline?: boolean
	autoFocus?: boolean
}) {
	const [v, setV] = useState(value)
	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !multiline) (e.target as HTMLElement).blur()
		if (e.key === "Escape") {
			setV(value)
			onCancel()
		}
	}
	const common = {
		className: "w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm",
		autoFocus,
		onBlur: () => {
			if (v !== value) onCommit(v)
			else onCancel()
		},
		onKeyDown,
	}
	return multiline ? (
		<textarea {...common} rows={3} value={v} onChange={(e) => setV(e.target.value)} />
	) : (
		<input {...common} value={v} onChange={(e) => setV(e.target.value)} />
	)
}

// 태그 에디터
function EditableTags({
	value,
	onCommit,
	onCancel,
}: {
	value: string[]
	onCommit: (next: string[]) => void
	onCancel: () => void
}) {
	const [text, setText] = useState(value.join(", "))
	const commit = () => {
		const next = text
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
		if (JSON.stringify(next) !== JSON.stringify(value)) onCommit(next)
		else onCancel()
	}

	/** 공용: 더블클릭 → textarea, blur/Enter 커밋, Esc 취소 (모노스페이스) */
	function InlineCode({
		value,
		onCommit,
		className = "",
		minRows = 6,
	}: {
		value: string
		onCommit: (next: string) => void
		className?: string
		minRows?: number
	}) {
		const [editing, setEditing] = useState(false)
		const [v, setV] = useState(value)
		useEffect(() => setV(value), [value])

		if (!editing) {
			return (
				<pre
					onDoubleClick={() => setEditing(true)}
					className={`bg-mybluegray p-2 rounded text-xs overflow-auto font-mono whitespace-pre-wrap break-words cursor-text ${className}`}
				>
					{value}
				</pre>
			)
		}

		return (
			<textarea
				autoFocus
				rows={minRows}
				className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono"
				value={v}
				onChange={(e) => setV(e.target.value)}
				onBlur={() => {
					if (v !== value) onCommit(v)
					setEditing(false)
				}}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setV(value)
						setEditing(false)
					}
					if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
						if (v !== value) onCommit(v)
						setEditing(false)
					}
				}}
			/>
		)
	}

	/** 공용: 더블클릭 → input/textarea */
	function InlineText({
		value,
		onCommit,
		multiline = false,
		className = "",
	}: {
		value: string
		onCommit: (next: string) => void
		multiline?: boolean
		className?: string
	}) {
		const [editing, setEditing] = useState(false)
		const [v, setV] = useState(value)
		useEffect(() => setV(value), [value])

		if (!editing) {
			return (
				<div className={`cursor-text ${className}`} onDoubleClick={() => setEditing(true)}>
					{value}
				</div>
			)
		}
		const common = {
			autoFocus: true,
			className: "w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm",
			onBlur: () => {
				if (v !== value) onCommit(v)
				setEditing(false)
			},
			onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (e.key === "Escape") {
					setV(value)
					setEditing(false)
				}
				if (!multiline && e.key === "Enter") {
					if (v !== value) onCommit(v)
					setEditing(false)
				}
			},
		}
		return multiline ? (
			<textarea {...common} rows={4} value={v} onChange={(e) => setV(e.target.value)} />
		) : (
			<input {...common} value={v} onChange={(e) => setV(e.target.value)} />
		)
	}

	/** 코딩/디버깅: 테스트케이스 표 (셀 더블클릭 편집, 행 추가/삭제) */
	function TestCasesEditor({
		cases,
		onChange,
	}: {
		cases: { input: string; expected_output: string }[]
		onChange: (next: { input: string; expected_output: string }[]) => void
	}) {
		const updateCell = (idx: number, key: "input" | "expected_output", val: string) => {
			const next = cases.map((c, i) => (i === idx ? { ...c, [key]: val } : c))
			onChange(next)
		}
		const addRow = () => onChange([...cases, { input: "", expected_output: "" }])
		const removeRow = (idx: number) => onChange(cases.filter((_, i) => i !== idx))

		return (
			<div className="overflow-auto rounded border border-gray-200">
				<table className="min-w-full text-xs">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-2 py-1 text-left w-1/2">입력</th>
							<th className="px-2 py-1 text-left w-1/2">기대 출력</th>
							<th className="px-2 py-1 text-right w-16">행</th>
						</tr>
					</thead>
					<tbody>
						{cases.map((tc, i) => (
							<tr key={i} className="border-t align-top">
								<td className="px-2 py-1">
									<InlineCode value={tc.input} onCommit={(v) => updateCell(i, "input", v)} minRows={3} />
								</td>
								<td className="px-2 py-1">
									<InlineCode
										value={tc.expected_output}
										onCommit={(v) => updateCell(i, "expected_output", v)}
										minRows={3}
									/>
								</td>
								<td className="px-2 py-1 text-right">
									<button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => removeRow(i)}>
										삭제
									</button>
								</td>
							</tr>
						))}
						<tr>
							<td colSpan={3} className="px-2 py-2">
								<button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={addRow}>
									+ 테스트케이스 추가
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}

	/** 단답형: 정답 배열 편집 (아이템 더블클릭, 추가/삭제) */
	function ShortAnswersEditor({ answers, onChange }: { answers: string[]; onChange: (next: string[]) => void }) {
		const update = (i: number, val: string) => onChange(answers.map((a, idx) => (idx === i ? val : a)))
		const add = () => onChange([...answers, ""])
		const remove = (i: number) => onChange(answers.filter((_, idx) => idx !== i))
		return (
			<div className="space-y-1">
				{answers.map((a, i) => (
					<div key={i} className="flex items-start gap-2">
						<div className="flex-1">
							<InlineText value={a} onCommit={(v) => update(i, v)} />
						</div>
						<button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => remove(i)}>
							삭제
						</button>
					</div>
				))}
				<button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={add}>
					+ 정답 추가
				</button>
			</div>
		)
	}

	/** 주관식: 정답 문자열 더블클릭 편집 */
	function SubjectiveEditor({ value, onChange }: { value: string; onChange: (next: string) => void }) {
		return <InlineText value={value} onCommit={onChange} multiline className="bg-gray-100 p-2 rounded text-sm" />
	}

	/** 객관식: 선지 + 정답 인덱스(멀티 가능) 편집 */
	function MultipleChoiceEditor({
		options,
		correctIndexes,
		onChange,
	}: {
		options: string[]
		correctIndexes: number[]
		onChange: (next: { options: string[]; correct_indexes: number[] }) => void
	}) {
		const setOption = (idx: number, val: string) => {
			const nextOpts = options.map((o, i) => (i === idx ? val : o))
			onChange({ options: nextOpts, correct_indexes: correctIndexes })
		}
		const toggleCorrect = (idx: number) => {
			const set = new Set(correctIndexes)
			set.has(idx) ? set.delete(idx) : set.add(idx)
			onChange({ options, correct_indexes: Array.from(set).sort((a, b) => a - b) })
		}
		const addOption = () => onChange({ options: [...options, ""], correct_indexes: correctIndexes })
		const removeOption = (idx: number) => {
			const nextOpts = options.filter((_, i) => i !== idx)
			const nextCorrect = correctIndexes.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))
			onChange({ options: nextOpts, correct_indexes: nextCorrect })
		}
		return (
			<div className="space-y-2">
				{options.map((opt, i) => {
					const checked = correctIndexes.includes(i)
					return (
						<div key={i} className="flex items-start gap-2">
							<input
								type="checkbox"
								className="mt-1 accent-black"
								checked={checked}
								onChange={() => toggleCorrect(i)}
								title="정답 토글"
							/>
							<div className="flex-1">
								<InlineText value={opt} onCommit={(v) => setOption(i, v)} />
							</div>
							<button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => removeOption(i)}>
								삭제
							</button>
						</div>
					)
				})}
				<button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={addOption}>
					+ 보기 추가
				</button>
			</div>
		)
	}

	return (
		<input
			className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
			value={text}
			autoFocus
			onChange={(e) => setText(e.target.value)}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					setText(value.join(", "))
					onCancel()
				}
				if (e.key === "Enter") {
					;(e.target as HTMLInputElement).blur()
				}
			}}
			placeholder="예: 배열, 해시맵"
		/>
	)
}

// 수정 관련 함수
function EditableSelect<T extends string>({
	value,
	options,
	onCommit,
	onCancel,
	autoFocus = true,
}: {
	value: T
	options: { label: string; value: T }[]
	onCommit: (next: T) => void
	onCancel: () => void
	autoFocus?: boolean
}) {
	const [v, setV] = React.useState<T>(value)
	return (
		<select
			className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
			value={v}
			autoFocus={autoFocus}
			onChange={(e) => setV(e.target.value as T)}
			onBlur={() => {
				if (v !== value) onCommit(v)
				else onCancel()
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onCancel()
				if (e.key === "Enter") (e.target as HTMLSelectElement).blur()
			}}
		>
			{options.map((o) => (
				<option key={o.value} value={o.value}>
					{o.label}
				</option>
			))}
		</select>
	)
}

export default function ProblemFinder() {
	const [rows, setRows] = useState<ProblemDetail[]>(useMemo(() => JSON.parse(JSON.stringify(dummyProblems)), []))
	const [selectedIds, setSelectedIds] = useState<number[]>([])
	const [focusedId, setFocusedId] = useState<number | null>(rows[0]?.problem_id ?? null)
	const selectedProblems = rows.filter((p) => selectedIds.includes(p.problem_id))

	const [editing, setEditing] = useState<{
		id: number
		field: "problemType" | "title" | "description" | "tags" | null
	} | null>(null)

	const focused = useMemo(() => rows.find((r) => r.problem_id === focusedId) ?? null, [rows, focusedId])

	// 행 업데이트
	const updateRow = (id: number, updater: (old: ProblemDetail) => ProblemDetail) => {
		setRows((prev) => prev.map((r) => (r.problem_id === id ? updater(r) : r)))
	}

	const toggle = (id: number) => {
		setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
	}

	const toggleAll = () => {
		if (selectedIds.length === dummyProblems.length) setSelectedIds([])
		else setSelectedIds(dummyProblems.map((p) => p.problem_id))
	}

	// 문제 만들기 버튼 관련
	const router = useRouter()
	const handleNavigate = () => {
		router.push("/registered-problems/create")
	}

	// 검색 기능
	const [titleQuery, setTitleQuery] = useState("")
	const [tagQuery, setTagQuery] = useState("") // 콤마/스페이스로 여러 태그 입력
	const [tagModeAll, setTagModeAll] = useState(false) // true=AND, false=OR
	const filteredRows = useMemo(() => {
		const tq = titleQuery.trim().toLowerCase()
		// 태그 토큰: 콤마/스페이스/세미콜론 기준 분리
		const rawTokens = tagQuery
			.split(/[,\s;]+/)
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean)

		return rows.filter((r) => {
			// 제목 필터 (부분 포함, 대소문자 무시)
			const okTitle = tq === "" ? true : r.title.toLowerCase().includes(tq)

			// 태그 필터
			if (rawTokens.length === 0) return okTitle

			const problemTags = r.tags.map((t) => t.toLowerCase())
			const matches = rawTokens.map((tok) => problemTags.some((tag) => tag.includes(tok))) // 각 토큰이 적어도 한 태그에 포함되는지

			const okTags = tagModeAll ? matches.every(Boolean) : matches.some(Boolean)
			return okTitle && okTags
		})
	}, [rows, titleQuery, tagQuery, tagModeAll])

	return (
		<div className="min-h-screen mb-10">
			{/* 결과 개수 표시 */}
			<div className="flex text-xs text-gray-500 justify-end">
				총 {rows.length}개 중 {filteredRows.length}개 표시
			</div>
			{/* 검색 바 */}
			<div className="max-w-[50vh] mt-2 flex flex-col gap-2 ml-auto md:flex-row md:items-center justify-center">
				<div className="flex-1">
					<input
						value={titleQuery}
						onChange={(e) => setTitleQuery(e.target.value)}
						placeholder="🔍  문제 제목으로 검색..."
						className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none bg-transparent"
					/>
				</div>

				<div className="flex-1 flex items-center gap-2">
					<input
						value={tagQuery}
						onChange={(e) => setTagQuery(e.target.value)}
						placeholder="🔍  문제 태그로 검색..."
						className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none bg-transparent"
					/>
				</div>
			</div>

			<div className="flex flex-col-2 mt-3">
				<div>
					<div className="flex text-sm text-gray-400 ml-2">
						*왼쪽: 제목, 설명, 태그, 난이도, 채점모드 더블클릭 후 수정 가능
					</div>
					<div className="flex text-sm text-gray-400 ml-2">
						*오른쪽: 문제 세부 속성들(정답, 테스트 케이스...) 더블클릭 후 수정 가능
					</div>
				</div>
				<div className="flex justify-end ml-auto mr-1 mb-2">
					<button
						onClick={handleNavigate}
						className="flex items-center bg-mycheck text-white px-3 py-2 mt-3 rounded-lg text-xs cursor-pointer
          hover:opacity-80"
					>
						+ 문제 만들기
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
				{/* 뷰 카드 */}
				<div className="order-1 lg:order-2 lg:col-span-5 flex flex-col gap-4">
					<div className="bg-white rounded-2xl shadow p-4">
						{focused ? (
							<div>
								{/* 제목 + 생성일시 */}
								<div className="flex items-start justify-between gap-3 mb-2">
									<h2 className="text-xl font-bold">{focused.title}</h2>
									<span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(focused.created_at)}</span>
								</div>

								{/* 태그 */}
								<div className="flex flex-wrap gap-2 mb-2">
									{focused.tags.map((tag) => (
										<span key={tag} className="py-0.5 rounded text-[11px] text-gray-500">
											#{tag}
										</span>
									))}
								</div>

								{/* 문제 설명 */}
								<p className="text-gray-700 mb-10">{focused.description}</p>

								{focused.problemType === "코딩" && "reference_codes" in focused && (
									<section>
										<h3 className="font-semibold mb-2">레퍼런스 코드</h3>
										<pre className="bg-mybluegray p-2 rounded text-xs overflow-auto">
											{focused.reference_codes[0]?.code}
										</pre>
									</section>
								)}

								{focused.problemType === "디버깅" && "base_code" in focused && (
									<section>
										<h3 className="font-semibold mb-2">베이스 코드</h3>
										<pre className="bg-mybluegray p-2 rounded text-xs overflow-auto">{focused.base_code[0]?.code}</pre>
									</section>
								)}

								{/* === 테스트 케이스 (코딩/디버깅 전용) === */}
								{(focused.problemType === "코딩" || focused.problemType === "디버깅") && "test_cases" in focused && (
									<section className="mt-5">
										<h3 className="font-semibold my-2">테스트 케이스</h3>

										{focused.test_cases.length > 0 ? (
											<div className="overflow-auto rounded border border-gray-200">
												<table className="min-w-full text-xs">
													<thead className="bg-mybluegray">
														<tr>
															<th className="px-2 py-1 w-1/2 text-left">입력</th>
															<th className="px-2 py-1 w-1/2 text-left">출력</th>
														</tr>
													</thead>
													<tbody>
														{focused.test_cases.map((tc, i) => (
															<tr key={i} className="border-t">
																<td className="align-top px-2 py-1 font-mono whitespace-pre-wrap break-words">
																	{tc.input}
																</td>
																<td className="align-top px-2 py-1 font-mono whitespace-pre-wrap break-words">
																	{tc.expected_output}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										) : (
											<p className="text-xs text-gray-500">등록된 테스트 케이스가 없습니다.</p>
										)}
									</section>
								)}

								{focused.problemType === "객관식" && "options" in focused && (
									<section>
										<ul className="list-disc pl-5 mb-2">
											{focused.options.map((option, idx) => (
												<li
													key={idx}
													className={focused.correct_answers.includes(idx) ? "font-bold text-mydarkblue" : ""}
												>
													{option}
												</li>
											))}
										</ul>
									</section>
								)}

								{focused.problemType === "단답형" && "answer_text" in focused && Array.isArray(focused.answer_text) && (
									<section>
										<h3 className="font-semibold mb-2">정답</h3>
										<ul className="list-disc pl-5">
											{focused.answer_text.map((ans, idx) => (
												<li key={idx}>{ans}</li>
											))}
										</ul>
									</section>
								)}

								{focused.problemType === "주관식" && typeof (focused as any).answer_text === "string" && (
									<section>
										<h3 className="font-semibold mb-2">모범답안</h3>
										<p className="bg-gray-100 p-2 rounded text-sm">{(focused as any).answer_text}</p>
									</section>
								)}
							</div>
						) : (
							<p className="text-gray-500">문제를 선택하세요.</p>
						)}
						<hr className="border-b-1 border-gray-300 my-5 mt-5" />

						{/* --- 참조 섹션: 그룹/문제지 --- */}
						<section className="mt-6">
							{/* 그룹 */}
							<div className="mb-3">
								<div className="text-xs text-gray-500 mb-1">소속 그룹</div>
								{focused.group_ids.length ? (
									<div className="flex flex-wrap gap-1">
										{focused.group_ids.map((gid, i) => (
											<span
												key={`${gid}-${i}`}
												className="px-2 py-0.5 bg-mybluegray text-mycheck rounded text-[11px]"
												title={`group_id: ${gid}`}
											>
												{focused.group_names[i] ?? `Group#${gid}`}
											</span>
										))}
									</div>
								) : (
									<div className="text-xs text-gray-400">소속 그룹 없음</div>
								)}
							</div>

							{/* 문제지 */}
							<div>
								<div className="text-xs text-gray-500 mb-1">소속 문제지</div>
								{focused.workbook_ids.length ? (
									<div className="flex flex-wrap gap-1">
										{focused.workbook_ids.map((pid, i) => (
											<span
												key={`${pid}-${i}`}
												className="px-2 py-0.5 bg-mybluegray text-mycheck rounded text-[11px]"
												title={`paper_id: ${pid}`}
											>
												{focused.workbook_names[i] ?? `Paper#${pid}`}
											</span>
										))}
									</div>
								) : (
									<div className="text-xs text-gray-400">소속 문제지 없음</div>
								)}
							</div>
						</section>
					</div>
					<div className="bg-white rounded-2xl shadow p-4 top-4">
						<section className="flex flex-col items-center justify-center">
							<h3 className="font-bold text-gray-700">선택된 문제들</h3>
							<div className="py-3">
								<section className="items-center flex justify-center flex-wrap gap-2 mb-3">
									{selectedProblems.length > 0 ? (
										selectedProblems.map((prob) => (
											<span key={prob.problem_id} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
												{prob.title}
											</span>
										))
									) : (
										<span className="text-xs text-gray-400">선택된 문제가 없습니다</span>
									)}
								</section>
							</div>
						</section>
						{/* 문제지 만드는 버튼 영역 */}
						<section className="order-4 pt-3">
							<div className="flex flex-wrap gap-3 items-center justify-center">
								<button
									type="button"
									disabled={selectedIds.length === 0}
									onClick={() => {
										/* TODO: 기존 문제지에 추가 모달 */
									}}
									className={`px-3 py-2 rounded-md text-sm font-medium border transition
        ${
					selectedIds.length === 0
						? "border-myblue text-gray-400 cursor-not-allowed"
						: "bg-myblue text-gray-700 hover:opacity-80"
				}`}
								>
									기존 문제지에 추가
								</button>
								<button
									type="button"
									disabled={selectedIds.length === 0}
									onClick={() => {
										/* TODO: 새 문제지 생성 모달/라우팅 */
									}}
									className={`px-3 py-2 rounded-md text-sm font-medium transition
        ${
					selectedIds.length === 0
						? "bg-mybluegray text-gray-400 cursor-not-allowed"
						: "bg-mycheck text-white hover:opacity-80"
				}`}
								>
									새 문제지 만들기
								</button>
								<span className="ml-2 text-xs text-gray-500">
									{selectedIds.length > 0 ? `총 ${selectedIds.length} 문제 ` : ""}
								</span>
							</div>
						</section>
					</div>
				</div>

				{/* ----- 테이블: 모바일/좁은 화면에서는 아래(2행 1열), 데스크탑에서는 왼쪽 ----- */}
				<div className="order-2 bg-white rounded-2xl shadow p-4 lg:order-1 lg:col-span-7">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold">문제 목록</h2>
						<div className="text-sm text-gray-500">선택됨: {selectedIds.length}개</div>
					</div>

					<div className="max-h-[80vh] overflow-y-auto rounded-lg border border-gray-200">
						<table className="min-w-full text-sm h-100%">
							<thead className="bg-gray-50 sticky top-0 z-10">
								<tr className="text-left text-gray-600 border-b">
									<th className="w-10 py-2 px-2">
										<input
											type="checkbox"
											className="accent-black"
											checked={selectedIds.length === dummyProblems.length}
											onChange={toggleAll}
											aria-label="select all"
										/>
									</th>
									<th className="w-18 py-2 px-2">유형</th>
									<th className="w-40 py-2 px-2">문제 제목</th>
									<th className="w-40 py-2 px-2">설명</th>
									<th className="w-40 py-2 px-2">태그</th>
									<th className="w-25 py-2 px-2">난이도</th>
									<th className="w-25 py-2 px-2">채점모드</th>
								</tr>
							</thead>

							<tbody>
								{filteredRows.map((p) => {
									const isEditing = (field: NonNullable<typeof editing>["field"]) =>
										editing?.id === p.problem_id && editing.field === field

									return (
										<tr
											key={p.problem_id}
											className={`border-b hover:bg-mybluegray ${focusedId === p.problem_id ? "bg-myblue" : ""}`}
											onClick={() => setFocusedId(p.problem_id)}
										>
											{/* 체크박스 */}
											<td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
												<input
													type="checkbox"
													className="accent-mycheck"
													checked={selectedIds.includes(p.problem_id)}
													onChange={() => toggle(p.problem_id)}
													aria-label={`select ${p.title}`}
												/>
											</td>

											{/* 문제 유형 */}
											<td className="py-2 px-2 font-bold text-mycheck">{p.problemType}</td>

											{/* 문제 이름 */}
											<td
												className="py-2 px-2"
												onDoubleClick={(e) => {
													e.stopPropagation()
													setEditing({ id: p.problem_id, field: "title" })
												}}
											>
												{isEditing("title") ? (
													<EditableText
														value={p.title}
														onCommit={(next) => {
															updateRow(p.problem_id, (old) => ({ ...old, title: next }))
															setEditing(null)
														}}
														onCancel={() => setEditing(null)}
													/>
												) : (
													<span className="cursor-text font-medium">{p.title}</span>
												)}
											</td>

											{/* 설명 */}
											<td
												className="py-3 px-2"
												onDoubleClick={(e) => {
													e.stopPropagation()
													setEditing({ id: p.problem_id, field: "description" })
												}}
											>
												{isEditing("description") ? (
													<EditableText
														value={p.description}
														multiline
														onCommit={(next) => {
															updateRow(p.problem_id, (old) => ({ ...old, description: next }))
															setEditing(null)
														}}
														onCancel={() => setEditing(null)}
													/>
												) : (
													<span className="cursor-text text-gray-700">
														<div className="line-clamp-2">{p.description}</div>
													</span>
												)}
											</td>

											{/* 태그 */}
											<td
												className="py-2 px-2"
												onDoubleClick={(e) => {
													e.stopPropagation()
													setEditing({ id: p.problem_id, field: "tags" })
												}}
											>
												{isEditing("tags") ? (
													<EditableTags
														value={p.tags}
														onCommit={(next) => {
															updateRow(p.problem_id, (old) => ({ ...old, tags: next }))
															setEditing(null)
														}}
														onCancel={() => setEditing(null)}
													/>
												) : (
													<div className="flex flex-wrap gap-1">
														{p.tags.map((tag) => (
															<span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
																#{tag}
															</span>
														))}
													</div>
												)}
											</td>

											{/* 난이도 */}
											<td
												className="py-2 px-2"
												onDoubleClick={(e) => {
													e.stopPropagation()
													setEditing({ id: p.problem_id, field: "difficulty" as any })
												}}
											>
												{editing?.id === p.problem_id && editing.field === ("difficulty" as any) ? (
													<EditableSelect
														value={p.difficulty as any}
														options={DIFFICULTY_OPTIONS as any}
														onCommit={(next) => {
															updateRow(p.problem_id, (old) => ({ ...old, difficulty: next as any }))
															setEditing(null)
														}}
														onCancel={() => setEditing(null)}
													/>
												) : (
													<span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">{p.difficulty}</span>
												)}
											</td>

											{/* 채점 모드 */}
											<td
												className="py-2 px-2"
												onDoubleClick={(e) => {
													e.stopPropagation()
													if (p.problemType === "객관식") return
													setEditing({ id: p.problem_id, field: "rating_mode" as any })
												}}
											>
												{p.problemType === "객관식" ? (
													<span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">none</span>
												) : editing?.id === p.problem_id && editing.field === ("rating_mode" as any) ? (
													<EditableSelect
														value={(p as any).rating_mode}
														options={RATING_OPTIONS_BY_TYPE[p.problemType]}
														onCommit={(next) => {
															updateRow(p.problem_id, (old) => ({ ...old, rating_mode: next as any }))
															setEditing(null)
														}}
														onCancel={() => setEditing(null)}
													/>
												) : (
													<span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">
														{"rating_mode" in p ? (p as any).rating_mode : "—"}
													</span>
												)}
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}
