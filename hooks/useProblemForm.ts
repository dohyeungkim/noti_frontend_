import { useState, useCallback } from "react"

export interface ReferenceCode {
	language: "python" | "java" | "cpp" | "c" | "javascript"
	code: string
	is_main: boolean
}

export interface TestCase {
	input: string
	expected_output: string
	is_sample: boolean
}

export const defaultTemplates: { [lang: string]: string } = {
	python: "# Python 코드를 작성하세요\n",
	c: "#include<stdio.h>\n\nint main() {\n    return 0;\n}",
	cpp: "#include<iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}",
	java: "public class Main {\n    public static void main(String[] args) {\n    }\n}",
	javascript: "// JavaScript 코드를 작성하세요\n",
}

export const languageDisplayNames = {
	python: "Python",
	java: "Java",
	cpp: "C++",
	c: "C",
	javascript: "JavaScript",
}

export function useProblemForm() {
	const [title, setTitle] = useState("")
	const [difficulty, setDifficulty] = useState("easy")
	const [ratingMode, setRatingMode] = useState<
		"Hard" | "Space" | "Regex" | "None" | "exact" | "partial" | "soft" | "active" | "deactive"
	>("Hard")
	const [tags, setTags] = useState<string[]>([])
	const [conditions, setConditions] = useState([""])
	const [referenceCodes, setReferenceCodes] = useState<ReferenceCode[]>([
		{ language: "python", code: "", is_main: true },
	])
	const [testCases, setTestCases] = useState<TestCase[]>([{ input: "", expected_output: "", is_sample: true }])
	const [activeCodeTab, setActiveCodeTab] = useState(0)

	// 초기 데이터 설정 함수
	const setInitialData = useCallback(
		(data: {
			title?: string
			difficulty?: string
			ratingMode?: "Hard" | "Space" | "Regex" | "None" | "exact" | "partial" | "soft" | "active" | "deactive"
			tags?: string[]
			conditions?: string[]
			referenceCodes?: ReferenceCode[]
			testCases?: TestCase[]
		}) => {
			if (data.title !== undefined) setTitle(data.title)
			if (data.difficulty !== undefined) setDifficulty(data.difficulty)
			if (data.ratingMode !== undefined) setRatingMode(data.ratingMode)
			if (data.tags !== undefined) setTags(data.tags)
			if (data.conditions !== undefined) setConditions(data.conditions)
			if (data.referenceCodes !== undefined) setReferenceCodes(data.referenceCodes)
			if (data.testCases !== undefined) setTestCases(data.testCases)
		},
		[]
	)

	// 드래프트 로드 함수를 useCallback으로 메모이제이션
	const loadDraft = useCallback(() => {
		const draft = localStorage.getItem("problemDraft")
		if (draft) {
			try {
				const data = JSON.parse(draft)
				setTitle(data.title || "")
				setDifficulty(data.difficulty || "easy")
				setRatingMode(data.ratingMode || "Hard")
				setTags(data.tags || [])
				setConditions(data.conditions || [""])
				setReferenceCodes(data.referenceCodes || [{ language: "python", code: "", is_main: true }])
				setTestCases(data.testCases || [{ input: "", expected_output: "", is_sample: true }])
			} catch (error) {
				console.error("드래프트 로드 실패:", error)
			}
		}
	}, []) // 의존성 배열이 비어있으므로 함수가 한 번만 생성됨

	// 드래프트 저장 함수를 useCallback으로 메모이제이션
	const saveDraft = useCallback(() => {
		const draft = {
			title,
			difficulty,
			ratingMode,
			tags,
			conditions,
			referenceCodes,
			testCases,
		}
		localStorage.setItem("problemDraft", JSON.stringify(draft))
	}, [title, difficulty, ratingMode, tags, conditions, referenceCodes, testCases])

	// 참조 코드 관리
	const addReferenceCode = () => {
		const newCode: ReferenceCode = {
			language: "python",
			code: defaultTemplates.python,
			is_main: referenceCodes.length === 0,
		}
		setReferenceCodes([...referenceCodes, newCode])
		setActiveCodeTab(referenceCodes.length)
	}

	const removeReferenceCode = (index: number) => {
		if (referenceCodes.length <= 1) {
			alert("최소 하나의 참조 코드는 필요합니다.")
			return
		}

		const newCodes = referenceCodes.filter((_, i) => i !== index)
		if (referenceCodes[index].is_main && newCodes.length > 0) {
			newCodes[0].is_main = true
		}

		setReferenceCodes(newCodes)
		setActiveCodeTab(Math.min(activeCodeTab, newCodes.length - 1))
	}

	const updateReferenceCodeLanguage = (index: number, language: ReferenceCode["language"]) => {
		const newCodes = [...referenceCodes]
		newCodes[index].language = language
		newCodes[index].code = defaultTemplates[language] || ""
		setReferenceCodes(newCodes)
	}

	const updateReferenceCode = (index: number, code: string) => {
		const newCodes = [...referenceCodes]
		newCodes[index].code = code
		setReferenceCodes(newCodes)
	}

	const setMainReferenceCode = (index: number) => {
		const newCodes = referenceCodes.map((code, i) => ({
			...code,
			is_main: i === index,
		}))
		setReferenceCodes(newCodes)
	}

	// 테스트 케이스 관리
	const addTestCase = () => {
		setTestCases([...testCases, { input: "", expected_output: "", is_sample: false }])
	}

	const removeTestCase = (index: number) => {
		if (testCases.length <= 1) {
			alert("최소 하나의 테스트 케이스는 필요합니다.")
			return
		}
		setTestCases(testCases.filter((_, i) => i !== index))
	}

	const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
		const newTestCases = [...testCases]
		newTestCases[index] = { ...newTestCases[index], [field]: value }
		setTestCases(newTestCases)
	}

	// 조건 관리
	const addCondition = () => {
		setConditions([...conditions, ""])
	}

	const removeCondition = (index: number) => {
		const newConditions = conditions.filter((_, i) => i !== index)
		setConditions(newConditions.length > 0 ? newConditions : [""])
	}

	const updateCondition = (index: number, value: string) => {
		const newConditions = [...conditions]
		newConditions[index] = value
		setConditions(newConditions)
	}

	// 태그 관리
	const updateTags = (tagString: string) => {
		// 쉼표와 엔터로 구분하여 태그 추출
		const newTags = tagString
			.split(/[,,\n]/) // 쉼표 또는 엔터로 분할
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0)
			.filter((tag, index, arr) => arr.indexOf(tag) === index) // 중복 제거
		setTags(newTags)
	}

	const removeTag = (index: number) => {
		setTags(tags.filter((_, i) => i !== index))
	}

	return {
		// 상태
		title,
		setTitle,
		difficulty,
		setDifficulty,
		ratingMode,
		setRatingMode,
		tags,
		setTags,
		conditions,
		referenceCodes,
		testCases,
		activeCodeTab,
		setActiveCodeTab,

		// 참조 코드 핸들러
		addReferenceCode,
		removeReferenceCode,
		updateReferenceCodeLanguage,
		updateReferenceCode,
		setMainReferenceCode,

		// 테스트 케이스 핸들러
		addTestCase,
		removeTestCase,
		updateTestCase,

		// 조건 핸들러
		addCondition,
		removeCondition,
		updateCondition,

		// 태그 핸들러
		updateTags,
		removeTag,

		// 드래프트 핸들러
		loadDraft,
		saveDraft,

		// 초기 데이터 설정
		setInitialData,
	}
}
