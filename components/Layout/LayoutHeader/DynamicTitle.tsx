"use client" //클라이언트 컴포넌트 사용

interface DynamicTitleProps { //필요한 것들 추가
	pathname: string
	userName?: string
	problem?: { title: string }
	exam?: { workbook_name: string }
	group?: { group_name: string }
}

function truncateText(text?: string, maxLength = 15): string { //문자열을 자르는 기능 
 	if (!text) return "" //!text인경우 ""반환
	return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text//길이가 초과하는경우 짤라내고 ...
}

function getTitle(//페이지경로에 따라 페이지 상단의 제목을 넣어주는 함수
	pathname: string,
	userName?: string,
	problem?: { title: string },
	exam?: { workbook_name: string },
	group?: { group_name: string }
): string {
	//홈
	if (pathname.startsWith("/mypage")) { //마이 페이지인경우
		return `🚀 ${truncateText(userName || "사용자")}님의 페이지`
	}

	//내가 푼 문제 모음
	if (pathname.startsWith("/solved-problems")) {
		return "🔥 내가 푼 문제 모음"
	}

	//내가 등록한 문제들
	if (pathname.startsWith("/registered-problems")) {
		switch (true) {
			case pathname === "/registered-problems":
				return "📌 내가 등록한 문제들"
			case pathname === "/registered-problems/create":
				return "📝 문제 등록하기"
			case pathname.startsWith("/registered-problems/edit"):
				return "🛠 문제 수정하기"
			case pathname.startsWith("/registered-problems/view/"):
				// 경로를 '/'로 분리하여 배열을 생성
				const segments = pathname.split("/")
				// 세그먼트의 길이가 4이고, 3번째 세그먼트가 'view'일 때
				if (segments.length === 4 && segments[2] === "view") {
					return `🔍 문제 보기` // '아이디' 부분을 동적으로 표시
				}
				break
			default:
				break
		}
	}

	if (pathname.startsWith("/feedback")) {
		return "📖 피드백 보기"
	}

	if (pathname.endsWith("/result")) {
		return "🏆 제출 기록 보기"
	}

	if (pathname.endsWith("/write")) {
		return "🔥 도전하기"
	}

	console.log("Debug:", { pathname, userName, problem, exam, group })
	const segments = pathname.split("/").filter(Boolean)

	// 각 세그먼트를 기반으로 적절한 제목 결정
	if (segments[0] === "mygroups") {
		switch (segments.length) {
			case 2: // 그룹 레벨
				return `📚 ${truncateText(group?.group_name || "나의 그룹")}`
			case 4: // 시험 레벨 (예: /mygroups/7/exams/5)
				return `📄 ${truncateText(exam?.workbook_name || "나의 문제지")}`
			case 6: // 문제 레벨 (예: /mygroups/7/exams/5/problems/4)
				return `✏️ ${truncateText(problem?.title || "나의 문제")}`
			case 8: // 결과 레벨 (예: /mygroups/7/exams/5/problems/4/result)
				return segments[6] === "result"
					? `📖 ${truncateText(problem?.title || "문제 결과")} 문제의 피드백`
					: "🏡 나의 페이지"
			default:
				return "🏡 나의 그룹들"
		}
	}

	// 기본 제목
	return "🏡 나의 페이지"
}

export default function DynamicTitle({ pathname, userName, problem, exam, group }: DynamicTitleProps) {
	const title = getTitle(pathname, userName, problem, exam, group)

	return ( //UI
		<h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold flex justify-start items-start gap-1.5 sm:pt-3 md:pt-4 lg:pt-6 xl:pt-8">
			{title}
		</h1>
	)
}
