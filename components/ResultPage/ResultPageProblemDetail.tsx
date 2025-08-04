import { motion } from "framer-motion"
import { useState } from "react"
import { Problem } from "../ProblemPage/ProblemModal/ProblemSelectorModal"
// import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

function ResultPageProblemDetail({ problem }: { problem: Problem | null }) {
	const [isExpanded, setIsExpanded] = useState(false)

	const toggleDescription = () => setIsExpanded(!isExpanded)

	if (!problem) {
		return null // 또는 로딩 메시지: <div>문제 데이터를 불러오는 중...</div>
	}
	return (
		<div>
			<button
				onClick={toggleDescription}
				className="text-gray-700 hover:text-gray-900 font-medium  flex items-center justify-center gap-2"
			>
				{isExpanded ? (
					<>
						{/* <IoIosArrowUp size={20} /> */}
						닫기
					</>
				) : (
					<>
						{/* <IoIosArrowDown size={20} /> */}
						문제 보기
					</>
				)}
			</button>

			{isExpanded && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
				>
					<div className="sticky top-0 z-10 pb-4 pt-6">
						<h1 className="text-4xl font-bold text-gray-800 mb-2">{problem.title}</h1>
						<hr className="border-t-2 border-gray-400" />
					</div>
					<div className="overflow-y-auto max-h-[calc(100%-120px)] p-2 pr-2">
						<div className="editor-content" dangerouslySetInnerHTML={{ __html: problem.description }} />
					</div>

					<style>{`

                           // 스타일 코드 생략
                      
      .editor-content h1 { font-size: 2rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
      .editor-content h2 { font-size: 1.5rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
      .editor-content h3 { font-size: 1.25rem !important; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; }
      .editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
      .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }

     /* ✅ 전체 테이블 스타일 */
.editor-content table {
width: 100%;
border-collapse: collapse !important; /* ✅ 테두리 겹침 방지 */
border-spacing: 0 !important; /* ✅ 셀 간격 제거 */
margin-top: 10px !important;
border: 2px solid #d4d4d4 !important;
border-radius: 12px !important;
overflow: hidden !important;
background-color: #f9f9f9 !important;
}

/* ✅ 헤더 스타일 */
.editor-content th {
background-color: #f1f1f1 !important;
font-weight: 600 !important;
text-align: center !important;
color: #333 !important;
padding: 14px !important;
border-bottom: 1.5px solid #d4d4d4 !important;
border-right: 1px solid #d4d4d4 !important; /* ✅ 오른쪽 테두리 조정 */
}

/* ✅ 내부 셀 스타일 */
.editor-content td {
background-color: #ffffff !important;
border: 1px solid #e0e0e0 !important;
padding: 12px !important;
text-align: left !important;
font-size: 1rem !important;
color: #444 !important;
transition: background 0.2s ease-in-out !important;
border-radius: 0 !important;
}

/* ✅ 강조된 셀 (제목 스타일) */
.editor-content td[data-header="true"] {
background-color: #e7e7e7 !important;
font-weight: bold !important;
text-align: center !important;
color: #222 !important;
}

/* ✅ 마우스 오버 효과 */
.editor-content td:hover {
background-color: #f5f5f5 !important;
}

/* ✅ 테이블 전체 둥글게 조정 */
.editor-content tr:first-child th:first-child {
border-top-left-radius: 12px !important;
}
.editor-content tr:first-child th:last-child {
border-top-right-radius: 12px !important;
}
.editor-content tr:last-child td:first-child {
border-bottom-left-radius: 12px !important;
}
.editor-content tr:last-child td:last-child {
border-bottom-right-radius: 12px !important;
}

    
    `}</style>
				</motion.div>
			)}
		</div>
	)
}

export default ResultPageProblemDetail
