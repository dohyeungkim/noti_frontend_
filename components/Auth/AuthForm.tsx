"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { auth_api } from "@/lib/api"
import { useAuth } from "@/stores/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	faUser,
	faLock,
	faChevronLeft,
	faChevronRight,
	faCheck,
	faStepForward,
} from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"

interface ProfileInfo {
	age: "under_18" | "18_24" | "25_29" | "30_34" | "35_39" | "over_40"
	grade: "high_school" | "freshman" | "sophomore" | "junior" | "senior" | "graduate" | "working_professional" | "other"
	major: string
	interests: ("web_development" | "mobile_app" | "data_science" | "ai_ml" | "game_development" | "embedded" | "other")[]
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
	programming_experience_level: "beginner" | "intermediate" | "advanced"
	preferred_programming_languages: ("python" | "java" | "cpp" | "javascript" | "c" | "other")[]
}

interface BasicUserInfo {
	password: string
	user_id: string
	username: string
	gender: string
	email: string
}

interface ExtendedUserRegisterRequest {
	user_id: string
	username: string
	email: string
	password: string
	gender: string
	profile_info: ProfileInfo
}

interface CardProps {
	children: React.ReactNode
	className?: string
}

interface OptionType {
	value: string
	label: string
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
	<div className={`max-w-xl w-full text-center p-8 bg-white rounded-xl border border-gray-200 shadow-xl ${className}`}>
		{children}
	</div>
)

// 옵션 데이터
const ageRangeOptions: OptionType[] = [
	{ value: "under_18", label: "18세 미만" },
	{ value: "18_24", label: "18-24세" },
	{ value: "25_29", label: "25-29세" },
	{ value: "30_34", label: "30-34세" },
	{ value: "35_39", label: "35-39세" },
	{ value: "over_40", label: "40세 이상" },
]

const academicYearOptions: OptionType[] = [
	{ value: "high_school", label: "고등학생" },
	{ value: "freshman", label: "대학교 1학년" },
	{ value: "sophomore", label: "대학교 2학년" },
	{ value: "junior", label: "대학교 3학년" },
	{ value: "senior", label: "대학교 4학년" },
	{ value: "graduate", label: "대학원생" },
	{ value: "working_professional", label: "직장인" },
	{ value: "other", label: "기타" },
]

const interestOptions: OptionType[] = [
	{ value: "web_development", label: "웹 개발" },
	{ value: "mobile_app", label: "앱 개발" },
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

export default function AuthForm() {
	const router = useRouter()
	const { setIsAuth } = useAuth()
	const [loginData, setLoginData] = useState({ user_id: "", password: "" })
	const [error, setError] = useState<string | null>(null)
	const [isRegistering, setIsRegistering] = useState(false)
	const [currentStep, setCurrentStep] = useState(1)
	const [success, setSuccess] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// 기본 회원가입 정보
	const [basicInfo, setBasicInfo] = useState<BasicUserInfo>({
		password: "",
		user_id: "",
		username: "",
		gender: "",
		email: "",
	})

	// 개인 정보
	const [personalInfo, setPersonalInfo] = useState({
		age: "18_24" as ProfileInfo["age"],
		grade: "freshman" as ProfileInfo["grade"],
		major: "",
	})

	// 학습 정보
	const [learningInfo, setLearningInfo] = useState({
		interests: [] as ProfileInfo["interests"],
		learning_goals: [] as ProfileInfo["learning_goals"],
		preferred_fields: [] as ProfileInfo["preferred_fields"],
		programming_experience_level: "beginner" as ProfileInfo["programming_experience_level"],
		preferred_programming_languages: [] as ProfileInfo["preferred_programming_languages"],
	})

	const [confirmPassword, setConfirmPassword] = useState("")

	// 진행률 계산
	const getProgress = () => {
		return (currentStep / 4) * 100
	}

	// 기본 정보 입력 핸들러
	const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }) => {
		const { name, value } = "target" in e ? e.target : e
		setBasicInfo((prev) => ({ ...prev, [name]: value }))

		if (name === "password" && confirmPassword) {
			setError(value !== confirmPassword ? "비밀번호가 다릅니다." : null)
		}
	}

	// 개인정보 입력 핸들러
	const handlePersonalChange = (field: keyof typeof personalInfo, value: string) => {
		setPersonalInfo((prev) => ({ ...prev, [field]: value }))
	}

	// 학습정보 배열 토글 핸들러
	const toggleLearningArrayField = (field: keyof typeof learningInfo, value: string) => {
		if (field === "programming_experience_level") {
			setLearningInfo((prev) => ({
				...prev,
				[field]: value as ProfileInfo["programming_experience_level"],
			}))
		} else {
			setLearningInfo((prev) => {
				const currentArray = prev[field] as string[]
				const newArray = currentArray.includes(value)
					? currentArray.filter((item) => item !== value)
					: [...currentArray, value]

				return { ...prev, [field]: newArray }
			})
		}
	}

	// 비밀번호 확인 핸들러
	const handleConfirmPassword = (value: string) => {
		setConfirmPassword(value)
		setError(value !== basicInfo.password ? "비밀번호가 다릅니다." : null)
	}

	// 다음 단계
	const handleNextStep = () => {
		setError(null)

		if (currentStep === 1) {
			if (!basicInfo.user_id || !basicInfo.username || !basicInfo.email || !basicInfo.password || !confirmPassword) {
				setError("모든 필드를 입력해주세요.")
				return
			}
			if (basicInfo.password !== confirmPassword) {
				setError("비밀번호가 일치하지 않습니다.")
				return
			}
		}

		setCurrentStep((prev) => prev + 1)
	}

	// 이전 단계
	const handlePrevStep = () => {
		setCurrentStep((prev) => prev - 1)
	}

	// 건너뛰기
	const handleSkip = () => {
		setCurrentStep((prev) => prev + 1)
		if (currentStep === 3) {
			handleRegister()
		}
	}

	// 회원가입 완료 - 새로운 확장된 API 사용
	const handleRegister = async () => {
		setError(null)
		setIsLoading(true)

		try {
			// 전체 프로필 정보 구성
			const completeProfileInfo: ProfileInfo = {
				...personalInfo,
				...learningInfo,
			}

			// 확장된 회원가입 요청 데이터
			const registerData: ExtendedUserRegisterRequest = {
				...basicInfo,
				profile_info: completeProfileInfo,
			}

			// 새로운 확장된 회원가입 API 호출
			const response = await auth_api.registerExtended(registerData)

			setSuccess(true)
			setCurrentStep(4)
		} catch (err: unknown) {
			console.error("회원가입 실패:", err)
			const errorMessage = err instanceof Error ? err.message : "회원가입에 실패했습니다. 다시 시도해주세요."
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	// 로그인 관련 핸들러들
	const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLoginData({ ...loginData, [e.target.name]: e.target.value })
	}

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsLoading(true)

		try {
			const response = await auth_api.login(loginData.user_id, loginData.password)
			setIsAuth(true)
			router.push("/")
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : "아이디 또는 비밀번호를 확인해주세요."
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	// 회원가입 완료 후 로그인 페이지로
	const handleCompleteRegistration = () => {
		setIsRegistering(false)
		setCurrentStep(1)
		setBasicInfo({
			email: "",
			password: "",
			user_id: "",
			username: "",
			gender: "",
		})
		setPersonalInfo({
			age: "18_24",
			grade: "freshman",
			major: "",
		})
		setLearningInfo({
			interests: [],
			learning_goals: [],
			preferred_fields: [],
			programming_experience_level: "beginner",
			preferred_programming_languages: [],
		})
		setConfirmPassword("")
		setSuccess(false)
	}

	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-mygreen">
			{/* 헤더 */}
			<header className="text-white absolute top-0 left-0 p-4">
				<Image src="/APROFI-logo.png" alt="APROFI Logo" width={120} height={30} priority />
			</header>

			{/* 본문 섹션 */}
			<section className="flex items-center justify-center w-full px-10 pt-10">
				<Card>
					{!isRegistering ? (
						// 로그인 폼
						<>
							<h2 className="text-3xl font-bold mb-8">LOGIN</h2>
							<form onSubmit={handleLogin} className="flex flex-col">
								<div>
									<div className="flex items-center w-full p-4 mb-4 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
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
									<div className="flex items-center w-full p-4 mb-4 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
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
									className="w-full p-3 mb-4 text-white font-semibold rounded-md bg-mygreen hover:bg-mygreen disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
								>
									{isLoading ? "로그인 중..." : "로그인"}
								</button>
								<button
									type="button"
									onClick={() => setIsRegistering(true)}
									disabled={isLoading}
									className="w-full p-3 text-mygreen font-semibold rounded-md border border-gray-300 hover:border-mygreen disabled:text-gray-400 disabled:border-gray-200 transition-colors"
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
									<FontAwesomeIcon icon={faCheck} className="w-10 h-10 text-mygreen" />
								</div>
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-4">🎉 회원가입 완료!</h3>
							<p className="text-gray-600 mb-2">APROFI에 오신 것을 환영합니다!</p>
							<p className="text-gray-500 text-sm mb-8">프로필이 성공적으로 저장되었습니다.</p>

							<div className="bg-emerald-50 rounded-lg p-4 mb-6">
								<h4 className="font-semibold text-emerald-800 mb-2">🚀 시작할 준비 완료</h4>
								<ul className="text-sm text-mygreen text-left space-y-1">
									<li>• 맞춤형 문제 추천 시스템 활성화</li>
									<li>• 개인화된 학습 경로 생성</li>
									<li>• 실시간 학습 분석 및 피드백</li>
									<li>• 그룹 학습 참여 가능</li>
								</ul>
							</div>

							<button
								onClick={handleCompleteRegistration}
								className="w-full p-3 text-white font-semibold rounded-md bg-mygreen hover:bg-mygreen transition-colors"
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
										className="bg-gradient-to-r from-mygreen to-mygreen h-2 rounded-full transition-all duration-300"
										style={{ width: `${getProgress()}%` }}
									></div>
								</div>
							</div>

							{currentStep === 1 && (
								// 1단계: 기본 정보
								<>
									<h2 className="text-3xl font-bold mb-2">기본 정보</h2>
									<p className="text-gray-600 mb-8">계정 생성을 위한 기본 정보를 입력해주세요</p>

									{/* user_id */}
									<div className="flex flex-col space-y-4">
										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
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

										{/* username */}
										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
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

										{/* gender */}
										<div className="flex items-center w-full gap-2 px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
											<button
												type="button"
												onClick={() => handleBasicChange({ name: "gender", value: "male" })}
												disabled={isLoading}
												className={`flex-1 px-4 py-1 rounded-full text-center transition-all ${
													basicInfo.gender === "male"
														? "bg-mygreen text-white font-semibold"
														: "bg-white text-gray-600 hover:bg-gray-50"
												}`}
											>
												남성
											</button>
											<button
												type="button"
												onClick={() => handleBasicChange({ name: "gender", value: "female" })}
												disabled={isLoading}
												className={`flex-1 px-4 py-2 rounded-full text-center transition-all ${
													basicInfo.gender === "female"
														? "bg-mygreen text-white font-semibold"
														: "bg-white text-gray-600 hover:bg-gray-50"
												}`}
											>
												여성
											</button>
										</div>

										{/* email */}
										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
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

										{/* password */}
										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
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

										<div className="flex items-center w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-100 focus-within:border-mygreen hover:border-mygreen focus-within:bg-gray-50 hover:bg-gray-50">
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
												className="flex-1 p-3 text-mygreen font-semibold rounded-md border border-gray-300 hover:border-mygreen disabled:text-gray-400 disabled:border-gray-200 transition-colors"
											>
												로그인하기
											</button>
											<button
												type="button"
												onClick={handleNextStep}
												disabled={isLoading}
												className="flex-1 p-3 text-white font-semibold rounded-md bg-mygreen hover:bg-mygreen disabled:bg-gray-400 transition-colors flex items-center justify-center"
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
														onClick={() => handlePersonalChange("age", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															personalInfo.age === option.value
																? "bg-mygreen text-white border-mygreen"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-mygreen"
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
														onClick={() => handlePersonalChange("grade", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															personalInfo.grade === option.value
																? "bg-mygreen text-white border-mygreen"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-mygreen"
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
												className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-mygreen focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
												className="flex-1 p-3 text-white font-semibold rounded-md bg-mygreen hover:bg-mygreen disabled:bg-gray-400 transition-colors flex items-center justify-center"
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
																? "bg-mygreen text-white border-mygreen"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-mygreen"
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
															learningInfo.learning_goals.includes(
																option.value as ProfileInfo["learning_goals"][number]
															)
																? "bg-mygreen text-white border-mygreen"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-mygreen"
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
															learningInfo.preferred_fields.includes(
																option.value as ProfileInfo["preferred_fields"][number]
															)
																? "bg-mygreen text-white border-mygreen"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-mygreen"
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
														onClick={() => toggleLearningArrayField("programming_experience_level", option.value)}
														disabled={isLoading}
														className={`p-2 text-sm rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															learningInfo.programming_experience_level === option.value
																? "bg-mygreen text-white border-mygreen"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-mygreen"
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
														onClick={() => toggleLearningArrayField("preferred_programming_languages", option.value)}
														disabled={isLoading}
														className={`p-2 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
															learningInfo.preferred_programming_languages.includes(
																option.value as ProfileInfo["preferred_programming_languages"][number]
															)
																? "bg-mygreen text-white border-mygreen"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:border-mygreen"
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
											className="flex-1 p-3 text-white font-semibold rounded-md bg-mygreen hover:bg-mygreen disabled:bg-gray-400 transition-colors"
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
