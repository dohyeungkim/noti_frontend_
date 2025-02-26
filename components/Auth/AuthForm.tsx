"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth_api } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface UserRegisterRequest {
  user_id: string;
  password: string;
  username: string;
  email: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div
    className={`max-w-md w-full text-center p-10 bg-white rounded-xl border border-gray-200 shadow-xl ${className}`}>
    {children}
  </div>
);

export default function AuthForm() {
  const router = useRouter();
  const { setIsAuth } = useAuth();
  const [loginData, setLoginData] = useState({ user_id: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState<UserRegisterRequest>({
    user_id: "",
    password: "",
    username: "",
    email: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  // 입력 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 비밀번호 변경 시 비밀번호 확인과 일치 여부 체크
    if (name === "password" && confirmPassword) {
      setError(value !== confirmPassword ? "비밀번호가 다릅니다." : null);
    }
  };

  // 비밀번호 확인 핸들러
  const handleConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    setError(value !== formData.password ? "비밀번호가 다릅니다." : null);
  };

  // 회원가입 요청
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await auth_api.register(
        formData.user_id,
        formData.username,
        formData.password,
        formData.email
      );
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 로그인 입력 변경 핸들러
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // 로그인 요청
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      await auth_api.login(loginData.user_id, loginData.password);
      setIsAuth(true);
      router.push("/"); // 로그인 성공 후 보호된 페이지로 이동
    } catch (err) {
      console.error("로그인 실패:", err);
      setError("아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-[url('/bg.jpg')]">
      {/* 헤더 */}
      <header className="absolute top-0 left-0 p-4">
        <Image src="/APROFI-logo.png" alt="APROFI Logo" width={160} height={40} priority />
      </header>

      {/* 본문 섹션 */}
      <section className="flex items-center justify-center w-full px-6">
        <Card>
          {success ? (
            <p className="text-emerald-700 font-bold whitespace-nowrap">
              회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.
            </p>
          ) : isRegistering ? (
            // 회원가입 폼
            <>
              <h2 className="text-3xl font-bold mb-8">JOIN US</h2>
              <form onSubmit={handleRegister} className="flex flex-col">
                <div className="flex items-center w-full px-4 py-3 mb-4 rounded-full border border-gray-200 bg-gray-100 focus:border-emerald-700 hover:border-emerald-700 focus:bg-gray-50 hover:bg-gray-50">
                  <input
                    className="ww-full bg-transparent outline-none"
                    type="text"
                    name="user_id"
                    placeholder="아이디"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex items-center w-full px-4 py-3 mb-4 rounded-full border border-gray-200 bg-gray-100 focus:border-emerald-700 hover:border-emerald-700 focus:bg-gray-50 hover:bg-gray-50">
                  <input
                    className="ww-full bg-transparent outline-none"
                    type="text"
                    name="username"
                    placeholder="이름"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-center w-full px-4 py-3 mb-4 rounded-full border border-gray-200 bg-gray-100 focus:border-emerald-700 hover:border-emerald-700 focus:bg-gray-50 hover:bg-gray-50">
                  <input
                    className="ww-full bg-transparent outline-none"
                    type="email"
                    name="email"
                    placeholder="이메일"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-center w-full px-4 py-3 mb-4 rounded-full border border-gray-200 bg-gray-100 focus:border-emerald-700 hover:border-emerald-700 focus:bg-gray-50 hover:bg-gray-50">
                  <input
                    className="ww-full bg-transparent outline-none"
                    type="password"
                    name="password"
                    placeholder="비밀번호"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-center w-full px-4 py-3 mb-4 rounded-full border border-gray-200 bg-gray-100 focus:border-emerald-700 hover:border-emerald-700 focus:bg-gray-50 hover:bg-gray-50">
                  <input
                    className="ww-full bg-transparent outline-none"
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-red-500 mb-3">{error}</p>}
                <button
                  type="submit"
                  className="w-full p-3 mb-3 text-white font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700">
                  가입하기
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="w-full p-3 text-emerald-600 font-semibold rounded-md border border-gray-200 hover:border-emerald-700">
                  로그인하기
                </button>
              </form>
            </>
          ) : (
            // 로그인 폼
            <>
              <h2 className="text-3xl font-bold mb-8">LOGIN</h2>
              <form onSubmit={handleLogin} className="flex flex-col">
                <div>
                  <div className="flex items-center w-full p-4 mb-4 rounded-full border border-gray-200 bg-gray-100 focus:border-emerald-700 hover:border-emerald-700 focus:bg-gray-50 hover:bg-gray-50">
                    <input
                      className="w-full bg-transparent outline-none"
                      type="text"
                      name="user_id"
                      placeholder="User ID"
                      value={loginData.user_id}
                      onChange={handleLoginChange}
                      required
                    />
                    <FontAwesomeIcon icon={faUser} className="text-lg w-5 h-5" />
                  </div>
                  <div className="flex items-center w-full p-4 mb-4 rounded-full border border-gray-200 bg-gray-100 focus:border-emerald-700 hover:border-emerald-700 focus:bg-gray-50 hover:bg-gray-50">
                    <input
                      className="w-full bg-transparent outline-none"
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <FontAwesomeIcon icon={faLock} className="text-lg w-5 h-5" />
                  </div>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                  type="submit"
                  className="w-full p-3 mb-4 text-white font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700">
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="w-full p-3 text-emerald-600 font-semibold rounded-md border border-gray-300 hover:border-emerald-700">
                  회원가입
                </button>
              </form>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
