"use client"//브라우저 이벤트(useStarte)를 사용하기 위해 기본적으로 서버에서 실행되는 컴포넌트를 브라우저에서 실행함

import { useState } from "react"//리액트 라이브러리에서 useState함수를 가져옴 - 입력값 변경에 반응하는 UI구성에 사용
import { useRouter } from "next/navigation"//라우터의 push, back을 통해 페이지 이동을 할 수 있게 함
import { auth_api } from "@/lib/api"//백엔드의 api 모듈 요청을 처리함 
import { useAuth } from "@/stores/auth"//로그인 상태나 정보를 확인, 처리
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"//아이콘을 화면에 보여주기 위한 컴포넌트
import {//각종 아이콘 을  추가 
	faUser,
	faLock,
	faChevronLeft,
	faChevronRight,
	faCheck,
	faStepForward,
} from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"//next.js에서 제공하는 이미지 보여주는 모듈

interface ProfileInfo {	//회원가입 프로필 정의한 구조 인터페이스로 객체를 먼저 선언
	age_range: "under_18" | "18_24" | "25_29" | "30_34" | "35_39" | "over_40" 
	academic_year:	
		| "high_school"
		| "freshman"
		| "sophomore"
		| "junior"
		| "senior"
		| "graduate"
		| "working_professional"
		| "other"
	major: string	
	interests: ("web_development" | "mobile_app" | "data_science" | "ai_ml" | "game_development" | "embedded" | "other")[]//다중선택 가능
	learning_goals: (
		| "career_preparation"
		| "academic_improvement"
		| "skill_enhancement"
		| "hobby"
		| "certification"
		| "competition"
		| "other"
	)[]
	preferred_fields: (
		| "algorithms"
		| "data_structures"
		| "web_backend"
		| "web_frontend"
		| "mobile"
		| "database"
		| "ai_ml"
		| "system_programming"
		| "other"
	)[]
	programming_experience: "beginner" | "intermediate" | "advanced"
	preferred_languages: ("python" | "java" | "cpp" | "javascript" | "c" | "other")[]
}

interface BasicUserInfo { //기본 사용자 정보
	email: string
	password: string
	user_id: string
	username: string
	full_name: string
}

interface ExtendedUserRegisterRequest { //사용자회원가입요청을 서버로 보낼 때 사용하는 틀
	email: string
	password: string
	user_id: string
	username: string
	full_name: string
	profile_info: ProfileInfo	//객체안에 또 다른 객체를 포함시킬 수 있음
}

interface CardProps {//Card 컴포넌트: 공통된 스타일이 적용된 박스를 만들어 그 안에 어떤 내용이든 넣을 수 있도록 함, 
	children: React.ReactNode //card틀에 들어갈 내용 React.ReactNode로 대부분의 요소를 렌더링가능
	className?: string // className : 스타일 지정 , ?: props를 반드시 전달하지 않아도됨 전달이 안될 시 기본값을 사용하게 됨, string: 문자열로 지정 
}

interface OptionType { //여러 컴포넌트에서 사용할 수 있는 선택옵션, value: 서버에 전송할 값, label 사용자에게 보여질 값
	value: string
	label: string
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => ( //card 구현 Card는 함수형컴포넌트 받는 <props>의 요소중 children, className을 추출 
	<div
		className={`max-w-2xl w-full text-center p-10 bg-white rounded-xl border border-gray-200 shadow-xl ${className}`}  //스타일 지정, className에 max-w....를 전달(문자열 포매팅)
	>
		{children} 
	</div>//children 내용
)

// 옵션 데이터
const ageRangeOptions: OptionType[] = [ //배열로 담음 
	{ value: "under_18", label: "18세 미만" },
	{ value: "18_24", label: "18-24세" },
	{ value: "25_29", label: "25-29세" },
	{ value: "30_34", label: "30-34세" },
	{ value: "35_39", label: "35-39세" },
	{ value: "over_40", label: "40세 이상" },
]

const academicYearOptions: OptionType[] = [
	{ value: "high_school", label: "고등학생" },
	{ value: "freshman", label: "대학교 1년" },
	{ value: "sophomore", label: "대학교 2년" },
	{ value: "junior", label: "대학교 3년" },
	{ value: "senior", label: "대학교 4년" },
	{ value: "graduate", label: "대학원생" },
	{ value: "working_professional", label: "직장인" },
	{ value: "other", label: "기타" },
]

const interestOptions: OptionType[] = [
	{ value: "web_development", label: "웹 개발" },
	{ value: "mobile_app", label: "모바일 앱" },
	{ value: "data_science", label: "데이터 사이언스" },
	{ value: "ai_ml", label: "AI/ML" },
	{ value: "game_development", label: "게임 개발" },
	{ value: "embedded", label: "임베디드" },
	{ value: "other", label: "기타" },
]

const learningGoalOptions: OptionType[] = [
	{ value: "career_preparation", label: "취업 준비" },
	{ value: "academic_improvement", label: "학업 향상" },
	{ value: "skill_enhancement", label: "기술 향상" },
	{ value: "hobby", label: "취미" },
	{ value: "certification", label: "자격증" },
	{ value: "competition", label: "대회 준비" },
	{ value: "other", label: "기타" },
]

const preferredFieldOptions: OptionType[] = [
	{ value: "algorithms", label: "알고리즘" },
	{ value: "data_structures", label: "자료구조" },
	{ value: "web_backend", label: "웹 백엔드" },
	{ value: "web_frontend", label: "웹 프론트엔드" },
	{ value: "mobile", label: "모바일" },
	{ value: "database", label: "데이터베이스" },
	{ value: "ai_ml", label: "AI/ML" },
	{ value: "system_programming", label: "시스템 프로그래밍" },
	{ value: "other", label: "기타" },
]

const programmingExperienceOptions: OptionType[] = [
	{ value: "beginner", label: "초급자" },
	{ value: "intermediate", label: "중급자" },
	{ value: "advanced", label: "고급자" },
]

const preferredLanguageOptions: OptionType[] = [
	{ value: "python", label: "Python" },
	{ value: "java", label: "Java" },
	{ value: "cpp", label: "C++" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "c", label: "C" },
	{ value: "other", label: "기타" },
]
//------------------------여기까지 사용할 틀제작

export default function AuthForm() { //외부?에서 이 컴포넌트를 사용할 수 있도록함 == public 같은거?
	const router = useRouter() //페이지이동용 router가져오기
	const { setIsAuth } = useAuth()//{}의 stisauth란 만약 useauth에 setisauth를 만족하는 키가있으면 그 키 를 꺼내어 변수로 사용함
	const [loginData, setLoginData] = useState({ user_id: "", password: "" }) //로그인값 입력저장
	const [error, setError] = useState<string | null>(null)//상환에 맞는에러메세지 표시
	const [isRegistering, setIsRegistering] = useState(false)//로그인화면인지 회원가입 화면인지 구분
	const [currentStep, setCurrentStep] = useState(1)//회원가입단계 확인
	const [success, setSuccess] = useState(false)//회원가입 성공여부 확인
	const [isLoading, setIsLoading] = useState(false)// 서버에 로그인 회원가입 요청중인지 여부 나타냄????

	// 기본 회원가입 정보
	//const [저장할 값 (변경할 값), set함수로 값 변경] = (구조에 맞는 틀에 저장) 아래와 같이  
	//const [상태 값 ,상태 변경할 함수 ] = useState<인터페이스 초기값>
	//사용자가 입력한 값을 set함수로 가져와 값을 저장,변경하겠다.
	const [basicInfo, setBasicInfo] = useState<BasicUserInfo>({  
		email: "",
		password: "",
		user_id: "",
		username: "",
		full_name: "",
	})

	// 개인 정보
	const [personalInfo, setPersonalInfo] = useState({
		age_range: "18_24" as ProfileInfo["age_range"],
		academic_year: "freshman" as ProfileInfo["academic_year"],
		major: "",
	})

	// 학습 정보
	const [learningInfo, setLearningInfo] = useState({
		interests: [] as ProfileInfo["interests"],
		learning_goals: [] as ProfileInfo["learning_goals"],
		preferred_fields: [] as ProfileInfo["preferred_fields"],
		programming_experience: "beginner" as ProfileInfo["programming_experience"],
		preferred_languages: [] as ProfileInfo["preferred_languages"],
	})

	const [confirmPassword, setConfirmPassword] = useState("")

	// 진행률 계산(현재 회원가입 스텝을 통해 진행도 확인)
	const getProgress = () => {
		return (currentStep / 4) * 100
	}

	// 기본 정보 입력 핸들러 회원가입
	const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => { // e : 이벤트객체 input이 바뀔 때마다 발생함
		const { name, value } = e.target // e.target은 이벤트가 발생한 요소를 가리킴 name은 input의 name속성값 value는 실제로 입력한 값
		setBasicInfo((prev) => ({ ...prev, [name]: value })) //이전 값에서 name에 해당하는 값만 set하여 바꿈

		if (name === "password" && confirmPassword) { //만약 속성이 password인 경우에는 비밀번호 확인 값과 비교하여 일치하지않으면 
			setError(value !== confirmPassword ? "비밀번호가 다릅니다." : null) //삼항 연산자를 통해 에러처리
		}
	}

	// 개인정보 입력 핸들러
	const handlePersonalChange = (field: keyof typeof personalInfo, value: string) => { //객체의 속성 이름들만 받을 수 있도록 제한함
		setPersonalInfo((prev) => ({ ...prev, [field]: value }))
	}

	// 학습정보 배열 토글 핸들러
	const toggleLearningArrayField = (field: keyof typeof learningInfo, value: string) => {
		if (field === "programming_experience") { //field 가 문자열 처리를해야하는 항목일 때 
			setLearningInfo((prev) => ({ 
				...prev, 
				[field]: value as ProfileInfo["programming_experience"] //문자열로 삽입 
			}))
		} else {
			setLearningInfo((prev) => {
				const currentArray = prev[field] as string[] //현재 필드에 값이 있는지
				const newArray = currentArray.includes(value) // value가 배열안에 있느지 
					? currentArray.filter((item) => item !== value) //있다면 제거
					: [...currentArray, value] //없다면 추가

				return { ...prev, [field]: newArray }//새로만든 new array로 값을 업데이트
			})
		}
	}

	// 비밀번호 확인 핸들러
	const handleConfirmPassword = (value: string) => { //문자열 값을 받고 
		setConfirmPassword(value)	//비번을 저장
		setError(value !== basicInfo.password ? "비밀번호가 다릅니다." : null) //확인 비밀번호와 사용자가 입력한 비밀번호 비교
	}

	// 다음 단계
	const handleNextStep = () => {
		setError(null)	//에러 메세지 초기화

		if (currentStep === 1) { // 1단계인지 확인 if문을 이용하여 true가 아닌 값들이 있는경우에러 문구와함께 되돌아감
			if (!basicInfo.user_id || !basicInfo.username || !basicInfo.full_name || !basicInfo.email || !basicInfo.password || !confirmPassword) {
				setError("모든 필드를 입력해주세요.")
				return
			}
			if (basicInfo.password !== confirmPassword) { //입력한 비밀번호와 이전에 입력한 확인용 비밀번호가 다른경우 에러문구와함께 되돌아감
				setError("비밀번호가 일치하지 않습니다.")
				return
			}
		}

		setCurrentStep((prev) => prev + 1) //if문에 해당하지않고 진행된 경우 단계+1
	}

	// 이전 단계
	const handlePrevStep = () => { //현재단계 -1 (이전으로)
		setCurrentStep((prev) => prev - 1)
	}

	// 건너뛰기
	const handleSkip = () => { //넘어가기
		setCurrentStep((prev) => prev + 1)
		// console.log(currentStep)//디버깅용?
		if (currentStep === 3) { //만약 현재 단계가 2->3단계인경우 넘어가기 눌렀을때가 2단계였던 경우 
			handleRegister() //handleRegister함수 실행
		}
	}

	// 회원가입 완료 - 새로운 확장된 API 사용
	const handleRegister = async () => { //비동기함수선언 서버에 데이터를 보내고 응답을 기다리는 작업을 처리하기위한 함수=> 순서대로 코드를 진행하기 위해
		setError(null)//에러문구 초기화
		setIsLoading(true)//로딩중인 것을 ture

		try { //try catch 구문 오류시 catch로
			// 전체 프로필 정보 구성
			const completeProfileInfo: ProfileInfo = { // 한 명의 프로파일 즉 사용자가 입력한 개인정보, 공부정보를 합쳐서 정보를 만듬
				...personalInfo, //개인정보
				...learningInfo, //학습정보
			}

			// 확장된 회원가입 요청 데이터
			const registerData: ExtendedUserRegisterRequest = { //아이디 비번 이름을 합쳐서 만듬
				...basicInfo, //기본정보
				profile_info: completeProfileInfo,
			}

			console.log("Complete registration data:", registerData) //디버깅

			// 새로운 확장된 회원가입 API 호출
			const response = await auth_api.registerExtended(registerData)//서버응답을 기다림

			console.log("Registration successful:", response)

			setSuccess(true)
			setCurrentStep(4)//단계 바꾸기

			// 회원가입 성공 후 자동으로 개인화 추천 생성
			try {
				await auth_api.refreshRecommendations() //추천하는 코드
				console.log("Personalized recommendations generated successfully")
			} catch (recommendationError) { 
				console.warn("Failed to generate initial recommendations:", recommendationError)
				// 추천 생성 실패는 회원가입 성공에 영향을 주지 않음
			}
		} catch (err: unknown) { //오류발견시 
			console.error("회원가입 실패:", err)
			const errorMessage = err instanceof Error ? err.message : "회원가입에 실패했습니다. 다시 시도해주세요."
			setError(errorMessage) //에러메세지 초기화 후 표시
		} finally {
			setIsLoading(false) //로딩끝
		}
	}

	// 로그인 관련 핸들러들
	const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => { //입력 값에 따른 이벤트 갱신
		setLoginData({ ...loginData, [e.target.name]: e.target.value }) //필드에 들어온 값을 바꿈
	}

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => { //입력 값에 따른 이벤트 갱신
		e.preventDefault()
		setError(null) //에러문자초기화
		setIsLoading(true)//로딩시작

		try {
			const response = await auth_api.login(loginData.user_id, loginData.password)//아디 비번으로 로그인
			console.log("Login successful:", response)

			setIsAuth(true)//로그인 성공?
			router.push("/")//라우터 이동
		} catch (err: unknown) { //오류발생시
			console.error("로그인 실패:", err) //콘솔 에러 표시
			const errorMessage = err instanceof Error ? err.message : "아이디 또는 비밀번호를 확인해주세요."
			setError(errorMessage) //에러문구 설정 및 출력
		} finally {
			setIsLoading(false) //로딩끝
		}
	}

	// 회원가입 완료 후 로그인 페이지로
	const handleCompleteRegistration = () => { //함수선언
		setIsRegistering(false) //회원가입끝?
		setCurrentStep(1)	//단계 1로
		setBasicInfo({ //기본정보 초기화
			email: "",
			password: "",
			user_id: "",
			username: "",
			full_name: "",
		})
		setPersonalInfo({ //기본값 초기화
			age_range: "18_24",
			academic_year: "freshman",
			major: "",
		})
		setLearningInfo({ //기본값 초기화
			interests: [],
			learning_goals: [],
			preferred_fields: [],
			programming_experience: "beginner",
			preferred_languages: [],
		})
		setConfirmPassword("")
		setSuccess(false)
	}

	return ( //로그인 회원가입 사용자에게ㅐ 보여질 UI
		<div className="w-full min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-[url('/bg.jpg')]">
			{/* 헤더 */}
			<header className="absolute top-0 left-0 p-4">
				<Image src="/APROFI-logo.png" alt="APROFI Logo" width={160} height={40} priority />
			</header>

			{/* 본문 섹션 */}
			<section className="flex items-center justify-center w-full px-6">
				<Card>
					{!isRegistering ? (
						// 로그인 폼
						<>
							<h2 className="text-3xl font-bold mb-8">LOGIN</h2>
							<form onSubmit={handleLogin} className="flex flex-col">
								<div>
									<div className="flex items-center w-full p-4 mb-4 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
										<input
											className="w-full bg-transparent outline-none"
											type="text"
											name="user_id"
											placeholder="사용자명"
											value={loginData.user_id}
											onChange={handleLoginChange}
											disabled={isLoading}
											required
										/>
										<FontAwesomeIcon icon={faUser} className="text-lg w-5 h-5" />
									</div>
									<div className="flex items-center w-full p-4 mb-4 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
										<input
											className="w-full bg-transparent outline-none"
											type="password"
											name="password"
											placeholder="비밀번호"
											value={loginData.password}
											onChange={handleLoginChange}
											disabled={isLoading}
											required
										/>
										<FontAwesomeIcon icon={faLock} className="text-lg w-5 h-5" />
									</div>
								</div>
								{error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
								<button
									type="submit"
									disabled={isLoading}
									className="w-full p-3 mb-4 text-white font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
								>
									{isLoading ? "로그인 중..." : "로그인"}
								</button>
								<button
									type="button"
									onClick={() => setIsRegistering(true)}
									disabled={isLoading}
									className="w-full p-3 text-emerald-600 font-semibold rounded-md border border-gray-300 hover:border-emerald-700 disabled:text-gray-400 disabled:border-gray-200 transition-colors"
								>
									회원가입
								</button>
							</form>
						</>
					) : currentStep === 4 && success ? (
						// 가입 완료 화면
						<div className="text-center py-8">
							<div className="mb-6">
								<div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<FontAwesomeIcon icon={faCheck} className="w-10 h-10 text-emerald-600" />
								</div>
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-4">🎉 회원가입 완료!</h3>
							<p className="text-gray-600 mb-2">APROFI에 오신 것을 환영합니다!</p>
							<p className="text-gray-500 text-sm mb-8">프로필이 성공적으로 저장되었습니다.</p>

							<div className="bg-emerald-50 rounded-lg p-4 mb-6">
								<h4 className="font-semibold text-emerald-800 mb-2">🚀 시작할 준비 완료</h4>
								<ul className="text-sm text-emerald-700 text-left space-y-1">
									<li>• 맞춤형 문제 추천 시스템 활성화</li>
									<li>• 개인화된 학습 경로 생성</li>
									<li>• 실시간 학습 분석 및 피드백</li>
									<li>• 그룹 학습 참여 가능</li>
								</ul>
							</div>

							<button
								onClick={handleCompleteRegistration}
								className="w-full p-3 text-white font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 transition-colors"
							>
								로그인 하러 가기
							</button>
						</div>
					) : (
						// 회원가입 단계별 폼
						<>
							{/* 진행률 표시 */}
							<div className="mb-6">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-medium text-gray-700">단계 {currentStep} / 4</span>
									<span className="text-sm text-gray-500">{Math.round(getProgress())}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${getProgress()}%` }}
									></div>
								</div>
							</div>

							{currentStep === 1 && (
								// 1단계: 기본 정보
								<>
									<h2 className="text-3xl font-bold mb-2">기본 정보</h2>
									<p className="text-gray-600 mb-8">계정 생성을 위한 기본 정보를 입력해주세요</p>

									<div className="flex flex-col space-y-4">
										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
											<input
												className="w-full bg-transparent outline-none"
												type="text"
												name="user_id"
												placeholder="사용자 ID *"
												value={basicInfo.user_id}
												onChange={handleBasicChange}
												disabled={isLoading}
												required
											/>
										</div>

										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
											<input
												className="w-full bg-transparent outline-none"
												type="text"
												name="username"
												placeholder="사용자명 (닉네임) *"
												value={basicInfo.username}
												onChange={handleBasicChange}
												disabled={isLoading}
												required
											/>
										</div>

										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
											<input
												className="w-full bg-transparent outline-none"
												type="text"
												name="full_name"
												placeholder="실명 *"
												value={basicInfo.full_name}
												onChange={handleBasicChange}
												disabled={isLoading}
												required
											/>
										</div>

										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
											<input
												className="w-full bg-transparent outline-none"
												type="email"
												name="email"
												placeholder="이메일 *"
												value={basicInfo.email}
												onChange={handleBasicChange}
												disabled={isLoading}
												required
											/>
										</div>

										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
											<input
												className="w-full bg-transparent outline-none"
												type="password"
												name="password"
												placeholder="비밀번호 *"
												value={basicInfo.password}
												onChange={handleBasicChange}
												disabled={isLoading}
												required
											/>
										</div>

										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-emerald-600 hover:border-emerald-600 focus-within:bg-gray-50 hover:bg-gray-50">
											<input
												className="w-full bg-transparent outline-none"
												type="password"
												placeholder="비밀번호 확인 *"
												value={confirmPassword}
												onChange={(e) => handleConfirmPassword(e.target.value)}
												disabled={isLoading}
												required
											/>
										</div>

										{error && <p className="text-red-500 text-sm">{error}</p>}

										<div className="flex space-x-3 pt-4">
											<button
												type="button"
												onClick={() => setIsRegistering(false)}
												disabled={isLoading}
												className="flex-1 p-3 text-emerald-600 font-semibold rounded-md border border-gray-300 hover:border-emerald-600 disabled:text-gray-400 disabled:border-gray-200 transition-colors"
											>
												로그인하기
											</button>
											<button
												type="button"
												onClick={handleNextStep}
												disabled={isLoading}
												className="flex-1 p-3 text-white font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
											>
												다음 <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-4 h-4" />
											</button>
										</div>
									</div>
								</>
							)}

							{currentStep === 2 && (
								// 2단계: 개인 정보
								<>
									<h2 className="text-3xl font-bold mb-2">개인 정보</h2>
									<p className="text-gray-600 mb-8">맞춤형 콘텐츠 제공을 위한 정보를 입력해주세요</p>

									<div className="flex flex-col space-y-6">
										{/* 연령대 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												연령대 <span className="text-red-500">*</span>
											</label>
											<div className="grid grid-cols-3 gap-2">
												{ageRangeOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => handlePersonalChange("age_range", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															personalInfo.age_range === option.value
																? "bg-emerald-600 text-white border-emerald-600"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-600"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										{/* 학년 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												학년/상태 <span className="text-red-500">*</span>
											</label>
											<div className="grid grid-cols-2 gap-2">
												{academicYearOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => handlePersonalChange("academic_year", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															personalInfo.academic_year === option.value
																? "bg-emerald-600 text-white border-emerald-600"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-600"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										{/* 전공 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">전공 (선택)</label>
											<input
												type="text"
												value={personalInfo.major}
												onChange={(e) => handlePersonalChange("major", e.target.value)}
												placeholder="예: 컴퓨터공학과"
												disabled={isLoading}
												className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-emerald-600 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
											/>
										</div>

										<div className="flex space-x-3 pt-4">
											<button
												type="button"
												onClick={handlePrevStep}
												disabled={isLoading}
												className="flex-1 p-3 text-gray-600 font-semibold rounded-md border border-gray-300 hover:border-gray-400 disabled:text-gray-400 disabled:border-gray-200 transition-colors flex items-center justify-center"
											>
												<FontAwesomeIcon icon={faChevronLeft} className="mr-2 w-4 h-4" /> 이전
											</button>
											<button
												type="button"
												onClick={handleSkip}
												disabled={isLoading}
												className="px-4 py-3 text-gray-500 font-medium rounded-md border border-gray-200 hover:border-gray-300 disabled:text-gray-400 disabled:border-gray-200 transition-colors flex items-center justify-center"
											>
												<FontAwesomeIcon icon={faStepForward} className="mr-2 w-4 h-4" /> 건너뛰기
											</button>
											<button
												type="button"
												onClick={handleNextStep}
												disabled={isLoading}
												className="flex-1 p-3 text-white font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
											>
												다음 <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-4 h-4" />
											</button>
										</div>
									</div>
								</>
							)}

							{currentStep === 3 && (
								// 3단계: 학습 정보
								<>
									<h2 className="text-3xl font-bold mb-2">학습 정보</h2>
									<p className="text-gray-600 mb-8">개인화된 학습 경험을 위한 정보를 입력해주세요</p>

									<div className="flex flex-col space-y-6 max-h-96 overflow-y-auto">
										{/* 관심사 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">관심사 (선택)</label>
											<div className="grid grid-cols-3 gap-2">
												{interestOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => toggleLearningArrayField("interests", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															learningInfo.interests.includes(option.value as ProfileInfo["interests"][number])
																? "bg-emerald-600 text-white border-emerald-600"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-600"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										{/* 학습 목표 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">학습 목표 (선택)</label>
											<div className="grid grid-cols-3 gap-2">
												{learningGoalOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => toggleLearningArrayField("learning_goals", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															learningInfo.learning_goals.includes(option.value as ProfileInfo["learning_goals"][number])
																? "bg-emerald-600 text-white border-emerald-600"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-600"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										{/* 선호 분야 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">선호 분야 (선택)</label>
											<div className="grid grid-cols-3 gap-2">
												{preferredFieldOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => toggleLearningArrayField("preferred_fields", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															learningInfo.preferred_fields.includes(option.value as ProfileInfo["preferred_fields"][number])
																? "bg-emerald-600 text-white border-emerald-600"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-600"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										{/* 프로그래밍 경험 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												프로그래밍 경험 수준 (선택)
											</label>
											<div className="grid grid-cols-3 gap-2">
												{programmingExperienceOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => toggleLearningArrayField("programming_experience", option.value)}
														disabled={isLoading}
														className={`p-2 text-sm rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															learningInfo.programming_experience === option.value
																? "bg-emerald-600 text-white border-emerald-600"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-600"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										{/* 선호 언어 */}
										<div className="text-left">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												선호 프로그래밍 언어 (선택)
											</label>
											<div className="grid grid-cols-3 gap-2">
												{preferredLanguageOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => toggleLearningArrayField("preferred_languages", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															learningInfo.preferred_languages.includes(option.value as ProfileInfo["preferred_languages"][number])
																? "bg-emerald-600 text-white border-emerald-600"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-600"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>
									</div>

									{error && <p className="text-red-500 text-sm mt-4">{error}</p>}

									<div className="flex space-x-3 pt-6">
										<button
											type="button"
											onClick={handlePrevStep}
											disabled={isLoading}
											className="flex-1 p-3 text-gray-600 font-semibold rounded-md border border-gray-300 hover:border-gray-400 disabled:text-gray-400 disabled:border-gray-200 transition-colors flex items-center justify-center"
										>
											<FontAwesomeIcon icon={faChevronLeft} className="mr-2 w-4 h-4" /> 이전
										</button>
										<button
											type="button"
											onClick={handleSkip}
											disabled={isLoading}
											className="px-4 py-3 text-gray-500 font-medium rounded-md border border-gray-200 hover:border-gray-300 disabled:text-gray-400 disabled:border-gray-200 transition-colors flex items-center justify-center"
										>
											<FontAwesomeIcon icon={faStepForward} className="mr-2 w-4 h-4" /> 건너뛰기
										</button>
										<button
											type="button"
											onClick={handleRegister}
											disabled={isLoading}
											className="flex-1 p-3 text-white font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
										>
											{isLoading ? "가입 중..." : "가입 완료"}
										</button>
									</div>
								</>
							)}
						</>
					)}
				</Card>
			</section>
		</div>
	)
}