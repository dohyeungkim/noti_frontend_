"use client";

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import ProblemStatistics from "../ui/ProblemStatistics";
import ConfirmationModal from "./View/MyRefisteredProblemDeleteModal";
import { problem_api } from "@/lib/api";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
});

interface Problem {
	problem_id: number
	title: string
	description: string
	difficulty: string
	rating_mode: "Hard" | "Space" | "Regex"
	tags: string[]
	problem_condition: string[]
	reference_codes: Array<{
		id: number
		language: string
		code: string
		is_main: boolean
		created_at: string
	}>
	test_cases: Array<{
		input: string
		expected_output: string
		is_sample: boolean
	}>
	make_at: string
}

const languageDisplayNames = {
	python: "Python",
	java: "Java",
	cpp: "C++",
	c: "C",
	javascript: "JavaScript",
}

export default function ProblemView() {
	const router = useRouter();
	const { id } = useParams<{ id: string }>();
	const [problem, setProblem] = useState<Problem | null>(null);
	const [loading, setLoading] = useState(true);
	const [isExpanded, setIsExpanded] = useState(true);
	const [isExpandedstatis, setisExpandedstatis] = useState(true);
	const [isConfirming, setIsConfirming] = useState(false);
	const [targetProblemId, setTargetProblemId] = useState<number | null>(null);
	const [activeCodeTab, setActiveCodeTab] = useState(0);

	useEffect(() => {
		const fetchProblem = async () => {
			setLoading(true);
			try {
				const data = await problem_api.problem_get_by_id(Number(id));
				setProblem(data);
			} catch (error) {
				console.error("Failed to fetch problem:", error);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchProblem();
		}
	}, [id]);

	if (loading) return <p>Loading...</p>;
	if (!problem) return <p>문제 정보를 불러올 수 없습니다.</p>;

	const handleDeleteButtonClick = async (problem_id: number) => {
		try {
			await problem_api.problem_delete(problem_id);
			alert("문제가 삭제되었습니다.");
			router.push("/registered-problems");
		} catch (error) {
			console.error("삭제 실패:", error);
			alert(`⚠️ 이 문제를 참조하는 문제지가 있어 삭제가 불가합니다.`);
		}
	};

	const openDeleteModal = (problem_id: number) => {
		setTargetProblemId(problem_id);
		setIsConfirming(true);
	};

	const handleDelete = async () => {
		if (targetProblemId !== null) {
			await handleDeleteButtonClick(targetProblemId);
		}
		setIsConfirming(false);
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case "easy":
				return "bg-green-500";
			case "medium":
				return "bg-yellow-500";
			case "hard":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	const getRatingModeColor = (mode: string) => {
		switch (mode) {
			case "Hard":
				return "bg-red-500";
			case "Space":
				return "bg-blue-500";
			case "Regex":
				return "bg-purple-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<>
			<div className="flex items-center gap-2 justify-end mb-6">
				<motion.button
					onClick={() => router.push(`/registered-problems/edit/${id}`)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="flex items-center bg-black text-white px-6 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-gray-500 transition-all duration-200 ease-in-out active:scale-95"
				>
					✏️ 문제 수정하기
				</motion.button>
			</div>

			{/* 문제 기본 정보 */}
			<div className="bg-white shadow-md rounded-lg p-6 mb-6">
				<div className="flex justify-between items-start mb-4">
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							{problem.title}
						</h1>
						<div className="flex items-center gap-2 mb-2">
							<span className={`text-white text-xs px-2 py-1 rounded ${getDifficultyColor(problem.difficulty)}`}>
								{problem.difficulty.toUpperCase()}
							</span>
							<span className={`text-white text-xs px-2 py-1 rounded ${getRatingModeColor(problem.rating_mode)}`}>
								{problem.rating_mode}
							</span>
							{problem.tags.map((tag, index) => (
								<span key={index} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
									{tag}
								</span>
							))}
						</div>
					</div>
					<div className="text-right text-sm text-gray-500">
						<div>작성일: {problem.make_at.split("T")[0]}</div>
						<div>문제 ID: {problem.problem_id}</div>
					</div>
				</div>

				{/* 문제 설명 */}
				<div className="border-t border-gray-200 pt-4">
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-lg font-semibold">문제 설명</h3>
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
						>
							{isExpanded ? (
								<>
									<FaChevronUp className="mr-1" /> 접기
								</>
							) : (
								<>
									<FaChevronDown className="mr-1" /> 펼치기
								</>
							)}
						</button>
					</div>

					<div
						className={`transition-all duration-300 overflow-hidden ${
							isExpanded ? "max-h-96 overflow-y-auto" : "max-h-0 opacity-0"
						}`}
						style={{ wordBreak: "break-word" }}
					>
						<div
							className="editor-content prose max-w-none"
							dangerouslySetInnerHTML={{ __html: problem.description }}
						/>
					</div>
				</div>
			</div>

			{/* 문제 조건 */}
			{problem.problem_condition && problem.problem_condition.length > 0 && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">문제 조건</h3>
					<div className="space-y-2">
						{problem.problem_condition.map((condition, index) => (
							<div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
								<span className="text-sm font-semibold text-gray-700 min-w-[20px] mt-0.5">
									{index + 1}.
								</span>
								<span className="text-sm text-gray-700 flex-1">{condition}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 참조 코드 */}
			{problem.reference_codes && problem.reference_codes.length > 0 && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">참조 코드</h3>
					
					{/* 코드 탭 */}
					<div className="flex gap-1 mb-4 overflow-x-auto">
						{problem.reference_codes.map((refCode, index) => (
							<div key={index} className="flex items-center shrink-0">
								<div
									className={`px-3 py-2 rounded-t-md text-sm flex items-center gap-2 cursor-pointer ${
										activeCodeTab === index ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
									}`}
									onClick={() => setActiveCodeTab(index)}
								>
									{languageDisplayNames[refCode.language as keyof typeof languageDisplayNames] || refCode.language}
									{refCode.is_main && (
										<span className="text-xs bg-yellow-500 text-white px-1 rounded">메인</span>
									)}
								</div>
							</div>
						))}
					</div>

					{/* 코드 에디터 */}
					<div className="bg-gray-900 rounded-lg overflow-hidden">
						{problem.reference_codes[activeCodeTab] && (
							<MonacoEditor
								height="400px"
								width="100%"
								language={
									problem.reference_codes[activeCodeTab].language === "cpp" 
										? "cpp" 
										: problem.reference_codes[activeCodeTab].language
								}
								value={problem.reference_codes[activeCodeTab].code}
								options={{
									readOnly: true,
									minimap: { enabled: false },
									scrollBeyondLastLine: false,
									fontSize: 14,
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
			)}

			{/* 테스트 케이스 */}
			{problem.test_cases && problem.test_cases.length > 0 && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4">테스트 케이스</h3>
					<div className="space-y-4">
						{problem.test_cases.map((testCase, index) => (
							<div key={index} className="border border-gray-200 rounded-lg p-4">
								<div className="flex items-center justify-between mb-3">
									<span className="text-sm font-semibold text-gray-700">
										테스트 케이스 {index + 1}
									</span>
									{testCase.is_sample && (
										<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
											샘플
										</span>
									)}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">입력</label>
										<pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
											{testCase.input}
										</pre>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">예상 출력</label>
										<pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
											{testCase.expected_output}
										</pre>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 문제 통계 */}
			<div className="bg-white shadow-md rounded-lg p-6 mb-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">📊 이 문제의 통계</h3>
					<button
						onClick={() => setisExpandedstatis(!isExpandedstatis)}
						className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
					>
						{isExpandedstatis ? (
							<>
								<FaChevronUp className="mr-1" /> 접기
							</>
						) : (
							<>
								<FaChevronDown className="mr-1" /> 펼치기
							</>
						)}
					</button>
				</div>

				<div
					className={`transition-all duration-300 ${
						isExpandedstatis ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
					}`}
				>
					<ProblemStatistics problem_id={problem.problem_id} />
				</div>
			</div>

			{/* 삭제 버튼 */}
			<div className="flex justify-end">
				<motion.button
					onClick={() => openDeleteModal(problem.problem_id)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm cursor-pointer hover:bg-red-600 transition-all duration-200 ease-in-out"
				>
					🗑️ 문제 삭제
				</motion.button>
			</div>

			{/* 삭제 확인 모달 */}
			{isConfirming && (
				<ConfirmationModal
					message="정말로 이 문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
					onConfirm={handleDelete}
					onCancel={() => setIsConfirming(false)}
				/>
			)}

			{/* 스타일 */}
			<style jsx>{`
				.editor-content {
					line-height: 1.6;
				}
				.editor-content h1,
				.editor-content h2,
				.editor-content h3 {
					margin-top: 1rem;
					margin-bottom: 0.5rem;
					font-weight: bold;
				}
				.editor-content h1 {
					font-size: 1.5rem;
				}
				.editor-content h2 {
					font-size: 1.25rem;
				}
				.editor-content h3 {
					font-size: 1.125rem;
				}
				.editor-content ul,
				.editor-content ol {
					margin-left: 1.5rem;
					margin-bottom: 1rem;
				}
				.editor-content li {
					margin-bottom: 0.25rem;
				}
				.editor-content table {
					width: 100%;
					border-collapse: collapse;
					margin: 1rem 0;
				}
				.editor-content th,
				.editor-content td {
					border: 1px solid #ddd;
					padding: 0.5rem;
					text-align: left;
				}
				.editor-content th {
					background-color: #f4f4f4;
					font-weight: bold;
				}
				.editor-content img {
					max-width: 100%;
					height: auto;
				}
			`}</style>
		</>
	);
}
