"use client"

import { useState } from "react"

interface ConfirmationModalProps {
	message: string
	onConfirm: () => Promise<void> // ✅ 비동기 함수로 변경
	onCancel: () => void
}
type ApiErrorDetail = {
	msg?: string
	ref_cnt?: number
}

type ApiError = {
	detail?: ApiErrorDetail
}

export default function ConfirmationModal({ message, onConfirm, onCancel }: ConfirmationModalProps) {
	const [isConfirming, setIsConfirming] = useState(true) // ✅ 삭제 진행 상태
	const [errorMessage, setErrorMessage] = useState<string | null>(null) // ✅ 에러 메시지 상태 추가
	const [refCount, setRefCount] = useState<number | null>(null) // ✅ 참조 개수 상태 추가

	// 👻❌ - 백엔드 리팩토링 후 문제지 참조 여부에 따른 문제 삭제 차단 에러 기능 사라짐.
	const handleDelete = async () => {
		try {
			setIsConfirming(false)
			await onConfirm()
		} catch (error: unknown) {
			console.error("❌ 삭제 실패:", error)

			// 백엔드가 던져주는 JSON 객체 형태의 에러(detail) 받아옴. 그 객체 안에 detail이라는 키가 있고, 그 안에 msg, ref_cnt 같은 값이 있으면 ->
			// 그걸 고대로 꺼내와서 읽어서 이것저것 할 수 있다~
			if (
				typeof error === "object" &&
				error !== null &&
				"detail" in error &&
				typeof (error as ApiError).detail === "object"
			) {
				const detail = (error as ApiError).detail

				// 👻❌ 백엔드에 참조 여부 확인하는 로직 추가되면 아래 코드는 정상작동 할거임.
				if (detail?.msg && detail.ref_cnt !== undefined) {
					setRefCount(detail.ref_cnt)
					setErrorMessage(`⚠️ 이 문제를 참조하는 문제지가 ${detail.ref_cnt}개 있어 삭제가 불가합니다.`)
				} else {
					setErrorMessage("⚠️ 문제가 삭제되지 않았습니다.")
				}
			} else {
				setErrorMessage("⚠️ 문제가 삭제되지 않았습니다.")
			}
		}
	}

	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
			onClick={onCancel} // ✅ 바깥 클릭 시 닫기
		>
			<div
				className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative"
				onClick={(e) => e.stopPropagation()} // ✅ 내부 클릭 시 닫히지 않음
			>
				{/* 헤더 */}
				<div className="flex justify-between items-center border-b pb-4">
					<h2 className="text-lg font-semibold">문제 삭제하기</h2>
					<button
						onClick={onCancel} // ✅ 닫기 버튼
						className="text-red-500 hover:text-red-700 text-2xl"
					>
						✖
					</button>
				</div>

				{/* ✅ 삭제 확인 UI */}
				{isConfirming && !errorMessage && (
					<div className="text-center my-4">
						<h3 className="text-lg font-semibold mb-4">{message}</h3>
						<div className="flex justify-center gap-4">
							<button
								onClick={handleDelete}
								className="bg-green-600 text-white py-2 px-6 rounded-md transition hover:bg-green-700"
							>
								예
							</button>
							<button
								onClick={onCancel}
								className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition"
							>
								아니요
							</button>
						</div>
					</div>
				)}

				{/* ✅ 삭제 실패 시 커스텀 모달창으로 오류 메시지 표시 */}
				{errorMessage && (
					<div className="text-center my-4">
						<h3 className="text-lg font-semibold text-red-600">{errorMessage}</h3>
						{refCount !== null && <p className="text-sm text-gray-600">(참조된 문제지 개수: {refCount}개)</p>}
						<button
							onClick={onCancel}
							className="mt-4 bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition"
						>
							확인
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
