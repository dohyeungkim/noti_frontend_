"use client"

import Breadcrumbs from "./Breadcrumbs"
import DynamicTitle from "./DynamicTitle"
import { useDataFetch } from "./useDataFetch"
import usePageInfo from "./usePageInfo"
import { PageInfo, DataFetch } from "./types"

export default function Mysol() {
	const { groupId, examId, problemId, userName, pathname }: PageInfo = usePageInfo()
	const { group, exam, problem }: DataFetch = useDataFetch(groupId, examId, problemId)

	return (
		<header className="flex flex-col items-start w-full mb-4 sm:mb-3 md:mb-4 lg:mb-4 mt-2 sm:mt-2 md:mt-2 lg:mt-4">
			{" "}
			{/* 👻 시험모드 진행중이면, 이 위치에 빨간색으로 시험모드입니다 하고 안내 해주기 */}
			{/* 노션처럼 현재 페이지 경로 표시 */}
			<Breadcrumbs
				pathname={pathname}
				group={group ?? undefined}
				groupId={groupId}
				exam={exam ?? undefined}
				examId={examId}
				problem={problem ?? undefined}
				problemId={problemId}
			/>
			{/* 좌측 상단에 뜨는 페이지 제목 */}
			<DynamicTitle
				pathname={pathname}
				userName={userName ?? undefined}
				problem={problem ?? undefined}
				exam={exam ?? undefined}
				group={group ?? undefined}
			/>
		</header>
	)
}
