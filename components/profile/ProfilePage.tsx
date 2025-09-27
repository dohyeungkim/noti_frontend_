"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faIdBadge,
  faLock,
  faLanguage,
  faGlobe, // 다른 곳에서 쓰면 유지
  faCakeCandles,
  faShieldHalved, // 남는 곳 없으면 나중에 정리 가능
  faCamera,
  faEarthAsia,
  faChartLine,
  faCalendarDay,
  faCheckCircle,
  faListCheck,
  faSchool,
  faVenusMars,
  faPhone,
  faBookOpen,
  faUserGraduate,
  faCode,
  faLocationDot, // ✅ 주소 아이콘
} from "@fortawesome/free-solid-svg-icons";

// 🔗 프로젝트의 API 모듈
import { auth_api, user_api } from "@/lib/api";

/* ====================== 타입 ====================== */
type ProfileCore = {
  user_id: string;
  username: string;
  email: string;
  created_at: string;

  gender?: string | null;
  birthday?: string | null;
  phone?: string | null;
  address?: string | null;
  school?: string | null;
  introduction?: string | null;

  grade?: string | null;
  major?: string | null;

  interests?: string[];
  learning_goals?: string[];
  preferred_fields?: string[];
  programming_experience_level?: string | null;
  preferred_programming_languages?: string[];
};

type ProfileView = {
  user_id: string;
  name: string;
  email: string;
  createdAt: string;
  birth: string;
  country: string;
  language: string;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  school?: string | null;
  introduction?: string | null;
  grade?: string | null;
  major?: string | null;
  interests: string[];
  learning_goals: string[];
  preferred_fields: string[];
  programming_experience_level?: string | null;
  preferred_programming_languages: string[];

  solvedCount: number;
  attemptedCount: number;
  lastVisit: string; // ISO
};

/** ✅ 더미 없는 초기 상태 */
const EMPTY_PROFILE: ProfileView = {
  user_id: "",
  name: "",
  email: "",
  createdAt: "",
  birth: "",
  country: "",
  language: "",
  gender: "",
  phone: "",
  address: "",
  school: "",
  introduction: "",
  grade: "",
  major: "",
  interests: [],
  learning_goals: [],
  preferred_fields: [],
  programming_experience_level: "",
  preferred_programming_languages: [],
  // ⬇ 내 활동 요약은 유지(초깃값 0)
  solvedCount: 0,
  attemptedCount: 0,
  lastVisit: "",
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileView>(EMPTY_PROFILE);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // ===== 모달 상태 =====
  const [openEmail, setOpenEmail] = useState(false);
  const [openName, setOpenName] = useState(false);
  const [openBirth, setOpenBirth] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);

  const [openSchool, setOpenSchool] = useState(false);
  const [openMajor, setOpenMajor] = useState(false);
  const [openGrade, setOpenGrade] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const [openExpLevel, setOpenExpLevel] = useState(false);
  const [openPhone, setOpenPhone] = useState(false); // ✅ 전화번호 모달
  const [openAddress, setOpenAddress] = useState(false); // ✅ 주소 모달

  // ===== 임시 입력값 =====
  const [tmpEmail, setTmpEmail] = useState("");
  const [tmpName, setTmpName] = useState("");
  const [tmpBirth, setTmpBirth] = useState("");
  const [tmpCountry, setTmpCountry] = useState("");
  const [tmpLanguage, setTmpLanguage] = useState("");
  const [openPassword, setOpenPassword] = useState(false);
  const [tmpPw, setTmpPw] = useState({ current: "", next: "", confirm: "" });

  const [tmpSchool, setTmpSchool] = useState("");
  const [tmpMajor, setTmpMajor] = useState("");
  const [tmpGrade, setTmpGrade] = useState("");
  const [tmpGender, setTmpGender] = useState("");
  const [tmpExpLevel, setTmpExpLevel] = useState("");
  const [tmpPhone, setTmpPhone] = useState("");
  const [tmpAddress, setTmpAddress] = useState(""); // ✅ 주소 입력값

  /** ---------- 메모장(= introduction 동기화) ---------- */
  const [memo, setMemo] = useState<string>("");
  const [tmpMemo, setTmpMemo] = useState<string>("");
  const [memoSavedAt, setMemoSavedAt] = useState<string | null>(null);

  // ✅ 최초 로드 시 API에서 프로필 불러오기 (더미 없음)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: ProfileCore = await user_api.user_profile_get();
        if (!mounted || !res) return;

        const mapped: ProfileView = {
          user_id: res.user_id ?? "",
          name: res.username ?? "",
          email: res.email ?? "",
          createdAt: res.created_at ?? "",
          birth: res.birthday ?? "",
          // API에 없다면 비워둠 (이전엔 Korea/한국어 하드코딩)
          country: "",
          language: "",
          gender: res.gender ?? "",
          phone: res.phone ?? "",
          address: res.address ?? "",
          school: res.school ?? "",
          introduction: res.introduction ?? "",
          grade: res.grade ?? "",
          major: res.major ?? "",
          interests: res.interests ?? [],
          learning_goals: res.learning_goals ?? [],
          preferred_fields: res.preferred_fields ?? [],
          programming_experience_level: res.programming_experience_level ?? "",
          preferred_programming_languages:
            res.preferred_programming_languages ?? [],
          // 활동 요약은 페이지 내에서만 관리 (API 붙이면 여기서 세팅)
          solvedCount: user.solvedCount ?? 0,
          attemptedCount: user.attemptedCount ?? 0,
          lastVisit: user.lastVisit ?? "",
        };

        setUser(mapped);

        // 모달 입력값 초기화
        setTmpEmail(mapped.email);
        setTmpName(mapped.name);
        setTmpBirth(mapped.birth);
        setTmpCountry(mapped.country);
        setTmpLanguage(mapped.language);

        setTmpSchool(mapped.school || "");
        setTmpMajor(mapped.major || "");
        setTmpGrade(mapped.grade || "");
        setTmpGender(mapped.gender || "");
        setTmpExpLevel(mapped.programming_experience_level || "");
        setTmpPhone(mapped.phone || "");
        setTmpAddress(mapped.address || ""); // ✅ 초기화

        // 메모장 동기화 (기본 문구 NO)
        const intro = (res.introduction ?? "").trim();
        const initialMemo = intro; // 빈 값 그대로 두기
        setMemo(initialMemo);
        setTmpMemo(initialMemo);
      } catch (e) {
        console.warn("profile_get 실패", e);
        // 실패 시에도 더미 주입 X (그대로 비워두기)
        setMemo("");
        setTmpMemo("");
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 직렬화 =====
  function toPayload(u: ProfileView) {
    return {
      user_id: u.user_id,
      username: u.name,
      email: u.email,
      created_at: u.createdAt,

      gender: u.gender ?? "",
      birthday: u.birth ?? "",
      phone: u.phone ?? "",
      address: u.address ?? "",
      school: u.school ?? "",
      introduction: u.introduction ?? "",

      grade: u.grade ?? "",
      major: u.major ?? "",
      interests: u.interests ?? [],
      learning_goals: u.learning_goals ?? [],
      preferred_fields: u.preferred_fields ?? [],
      programming_experience_level:
        (u.programming_experience_level as string) ?? "",
      preferred_programming_languages: u.preferred_programming_languages ?? [],
    };
  }

  // ===== 적용 핸들러 =====
  const applyPassword = async () => {
    const current = (tmpPw.current || "").trim();
    const next = (tmpPw.next || "").trim();
    const confirm = (tmpPw.confirm || "").trim();

    if (!current || !next) {
      setPwError("현재 비밀번호와 새 비밀번호를 입력해주세요.");
      return;
    }
    if (next !== confirm) {
      setPwError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (current === next) {
      setPwError("현재 비밀번호와 새 비밀번호가 동일합니다.");
      return;
    }
    if (next.length < 4) {
      setPwError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }
    try {
      setPwLoading(true);
      setPwError(null);
      await auth_api.changePassword(user.user_id, current, next);
      alert("비밀번호가 변경되었습니다.");
      setTmpPw({ current: "", next: "", confirm: "" });
      setOpenPassword(false);
    } catch (e: any) {
      setPwError(e?.message || "비밀번호 변경 실패");
    } finally {
      setPwLoading(false);
    }
  };

  const applyEmail = async () => {
    setUser((u) => {
      const next = { ...u, email: tmpEmail };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("이메일 PATCH 실패:", e));
      return next;
    });
    setOpenEmail(false);
  };

  const applyName = async () => {
    setUser((u) => {
      const next = { ...u, name: tmpName };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("이름 PATCH 실패:", e));
      return next;
    });
    setOpenName(false);
  };

  const applyBirth = async () => {
    setUser((u) => {
      const next = { ...u, birth: tmpBirth };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("생년월일 PATCH 실패:", e));
      return next;
    });
    setOpenBirth(false);
  };

  const applyCountry = () => {
    setUser((u) => ({ ...u, country: tmpCountry }));
    setOpenCountry(false);
  };

  const applyLanguage = () => {
    setUser((u) => ({ ...u, language: tmpLanguage }));
    setOpenLanguage(false);
  };

  const applySchool = async () => {
    setUser((u) => {
      const next = { ...u, school: tmpSchool.trim() };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("학교 PATCH 실패:", e));
      return next;
    });
    setOpenSchool(false);
  };

  const applyMajor = async () => {
    setUser((u) => {
      const next = { ...u, major: tmpMajor.trim() };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("전공 PATCH 실패:", e));
      return next;
    });
    setOpenMajor(false);
  };

  const applyGrade = async () => {
    setUser((u) => {
      const next = { ...u, grade: tmpGrade.trim() };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("학년 PATCH 실패:", e));
      return next;
    });
    setOpenGrade(false);
  };

  const applyGender = async () => {
    setUser((u) => {
      const next = { ...u, gender: (tmpGender || "").trim() };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("성별 PATCH 실패:", e));
      return next;
    });
    setOpenGender(false);
  };

  const applyExpLevel = async () => {
    setUser((u) => {
      const next = {
        ...u,
        programming_experience_level: (tmpExpLevel || "").trim(),
      };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("경험수준 PATCH 실패:", e));
      return next;
    });
    setOpenExpLevel(false);
  };

  const applyPhone = async () => {
    setUser((u) => {
      const next = { ...u, phone: tmpPhone.trim() };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("전화번호 PATCH 실패:", e));
      return next;
    });
    setOpenPhone(false);
  };

  const applyAddress = async () => {
    // ✅ 주소 저장
    setUser((u) => {
      const next = { ...u, address: tmpAddress.trim() };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("주소 PATCH 실패:", e));
      return next;
    });
    setOpenAddress(false);
  };

  const saveMemo = () => {
    const v = tmpMemo.trim();
    setMemo(v);
    setMemoSavedAt(new Date().toISOString());
    setUser((u) => {
      const next = { ...u, introduction: v };
      user_api
        .user_profile_update(toPayload(next))
        .catch((e) => console.warn("메모(소개) PATCH 실패:", e));
      return next;
    });
  };

  const formattedLastVisit = useMemo(
    () => (user.lastVisit ? formatDate(user.lastVisit) : ""),
    [user.lastVisit]
  );
  const solvedRate = useMemo(() => {
    const { solvedCount, attemptedCount } = user;
    if (!attemptedCount) return 0;
    return Math.round((solvedCount / attemptedCount) * 100);
  }, [user]);
  const formattedSavedAt = useMemo(
    () => (memoSavedAt ? formatDate(memoSavedAt) : null),
    [memoSavedAt]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* 핵심 레이아웃 */}
      <section className="rounded-2xl bg-white shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_320px] gap-6 p-6">
          {/* 왼쪽: 아바타 + 메모장 */}
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 text-6xl">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <button
              className="mt-4 text-sm text-emerald-700 hover:underline flex items-center justify-center gap-2"
              onClick={() => alert("아직 구현하지 않은 기능입니다.")} // ✅ 유지
            >
              <FontAwesomeIcon icon={faCamera} />
              사진 추가
            </button>

            {/* 메모장 (= introduction) */}
            <div className="mt-6 w-full">
              <h3 className="text-sm font-semibold mb-2">자기소개</h3>
              <textarea
                className="w-full rounded-xl border p-3 text-sm outline-none resize-none"
                rows={8}
                placeholder="자기소개를 작성해보세요"
                value={tmpMemo}
                onChange={(e) => setTmpMemo(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={saveMemo}
                    className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm hover:opacity-90"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 중앙: 이름/기본 정보 */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {user.name || "이름 미설정"}
            </h1>
            <button
              className="mt-1 text-sm text-emerald-700 hover:underline"
              onClick={() => {
                setTmpName(user.name || "");
                setOpenName(true);
              }}
            >
              이름 편집
            </button>

            <div className="mt-6 space-y-4">
              {/* 가입일 */}
              <InfoRow
                icon={faIdBadge}
                label={
                  user.createdAt
                    ? `가입일: ${formatDate(user.createdAt)}`
                    : "가입일 정보 없음"
                }
              />

              {/* 이메일 */}
              <InfoRow
                icon={faEnvelope}
                label={user.email || "이메일 미설정"}
                action={
                  <InlineLink
                    label="이메일 변경"
                    onClick={() => setOpenEmail(true)}
                  />
                }
              />

              {/* 비밀번호 */}
              <InfoRow
                icon={faLock}
                label="비밀번호"
                action={
                  <InlineLink
                    label="비밀번호 변경"
                    onClick={() => setOpenPassword(true)}
                  />
                }
              />

              {/* 생년월일 (년-월-일만) */}
              <InfoRow
                icon={faCakeCandles}
                label={
                  user.birth && user.birth.trim().length > 0
                    ? formatDateYMD(user.birth)
                    : "생년월일을 설정해주세요"
                }
                action={
                  <InlineLink
                    label="생년월일 편집"
                    onClick={() => setOpenBirth(true)}
                  />
                }
              />

              {/* 국가/지역 */}
              <InfoRow
                icon={faEarthAsia}
                label={user.country || "국가/지역 미설정"}
                action={
                  <InlineLink
                    label="국가/지역 변경"
                    onClick={() => {
                      alert("아직 구현하지 않은 기능입니다.");
                      // setOpenCountry(true);
                    }}
                  />
                }
              />

              {/* 표시 언어 */}
              <InfoRow
                icon={faLanguage}
                label={user.language || "표시 언어 미설정"}
                action={
                  <InlineLink
                    label="표시 언어 변경"
                    onClick={() => {
                      alert("아직 구현하지 않은 기능입니다.");
                      // setOpenLanguage(true);
                    }}
                  />
                }
              />

              {/* 학교 */}
              <InfoRow
                icon={faSchool}
                label={
                  user.school && user.school.trim().length > 0
                    ? `학교: ${user.school}`
                    : "학교정보를 입력해주세요"
                }
                action={
                  <InlineLink
                    label="학교 편집"
                    onClick={() => {
                      setTmpSchool(user.school || "");
                      setOpenSchool(true);
                    }}
                  />
                }
              />

              {/* 성별 */}
              <InfoRow
                icon={faVenusMars}
                label={user.gender ? `성별: ${user.gender}` : "성별 미설정"}
                action={
                  <InlineLink
                    label="성별 편집"
                    onClick={() => {
                      setTmpGender(user.gender || "");
                      setOpenGender(true);
                    }}
                  />
                }
              />

              {/* 전화번호 */}
              <InfoRow
                icon={faPhone}
                label={
                  user.phone && user.phone.trim().length > 0
                    ? `전화: ${user.phone}`
                    : "전화번호를 추가해주세요"
                }
                action={
                  <InlineLink
                    label="전화번호 편집"
                    onClick={() => {
                      setTmpPhone(user.phone || "");
                      setOpenPhone(true);
                    }}
                  />
                }
              />

              {/* ✅ 주소 */}
              <InfoRow
                icon={faLocationDot}
                label={
                  user.address && user.address.trim().length > 0
                    ? `주소: ${user.address}`
                    : "주소를 입력해주세요"
                }
                action={
                  <InlineLink
                    label="주소 편집"
                    onClick={() => {
                      setTmpAddress(user.address || "");
                      setOpenAddress(true);
                    }}
                  />
                }
              />

              {/* 전공 */}
              <InfoRow
                icon={faBookOpen}
                label={user.major ? `전공: ${user.major}` : "전공 미설정"}
                action={
                  <InlineLink
                    label="전공 편집"
                    onClick={() => {
                      setTmpMajor(user.major || "");
                      setOpenMajor(true);
                    }}
                  />
                }
              />

              {/* 학년 */}
              <InfoRow
                icon={faUserGraduate}
                label={user.grade ? `학년: ${user.grade}` : "학년 미설정"}
                action={
                  <InlineLink
                    label="학년 편집"
                    onClick={() => {
                      setTmpGrade(user.grade || "");
                      setOpenGrade(true);
                    }}
                  />
                }
              />

              {/* 경험 수준 */}
              <InfoRow
                icon={faCode}
                label={
                  user.programming_experience_level
                    ? `경험 수준: ${user.programming_experience_level}`
                    : "경험 수준 미설정"
                }
                action={
                  <InlineLink
                    label="경험 수준 편집"
                    onClick={() => {
                      setTmpExpLevel(user.programming_experience_level || "");
                      setOpenExpLevel(true);
                    }}
                  />
                }
              />
            </div>
          </div>

          {/* 오른쪽: 활동 요약 (유지) */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-gray-50 p-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} />
                내 활동 요약
              </h3>

              <div className="mt-3 space-y-3">
                <StatRow
                  icon={faCheckCircle}
                  label="총 맞춘 문제 수"
                  value={`${(user.solvedCount ?? 0).toLocaleString()}문제`}
                />
                <StatRow
                  icon={faListCheck}
                  label="시도한 총 문제 수"
                  value={`${(user.attemptedCount ?? 0).toLocaleString()}문제`}
                />
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>정답률</span>
                    <span>{solvedRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white border">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${solvedRate}%` }}
                    />
                  </div>
                </div>
                <StatRow
                  icon={faCalendarDay}
                  label="마지막 접속"
                  value={formattedLastVisit || "기록 없음"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 모달들 ===== */}
      {openEmail && (
        <Modal
          title="이메일 변경"
          onClose={() => setOpenEmail(false)}
          onSave={applyEmail}
        >
          <label className="block text-sm text-gray-700 mb-1">새 이메일</label>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpEmail}
            onChange={(e) => setTmpEmail(e.target.value)}
            placeholder="example@domain.com"
          />
        </Modal>
      )}

      {openPassword && (
        <Modal
          title="비밀번호 변경"
          onClose={() => {
            if (!pwLoading) {
              setOpenPassword(false);
              setPwError(null);
              setTmpPw({ current: "", next: "", confirm: "" });
            }
          }}
          onSave={applyPassword}
        >
          <label className="block text-sm text-gray-700 mb-1">
            현재 비밀번호
          </label>
          <input
            type="password"
            className="w-full rounded-xl border p-2 outline-none mb-3"
            value={tmpPw.current}
            onChange={(e) => setTmpPw({ ...tmpPw, current: e.target.value })}
            placeholder="현재 비밀번호"
            disabled={pwLoading}
          />

          <label className="block text-sm text-gray-700 mb-1">
            새 비밀번호
          </label>
          <input
            type="password"
            className="w-full rounded-xl border p-2 outline-none mb-3"
            value={tmpPw.next}
            onChange={(e) => setTmpPw({ ...tmpPw, next: e.target.value })}
            placeholder="새 비밀번호 (4자 이상)"
            disabled={pwLoading}
          />

          <label className="block text-sm text-gray-700 mb-1">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpPw.confirm}
            onChange={(e) => setTmpPw({ ...tmpPw, confirm: e.target.value })}
            placeholder="새 비밀번호 확인"
            disabled={pwLoading}
          />

          {pwError && <p className="mt-3 text-sm text-red-600">{pwError}</p>}
          {pwLoading && <p className="mt-2 text-xs text-gray-500">변경 중…</p>}
        </Modal>
      )}

      {openName && (
        <Modal
          title="이름 변경"
          onClose={() => setOpenName(false)}
          onSave={applyName}
        >
          <label className="block text-sm text-gray-700 mb-1">새 이름</label>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpName}
            onChange={(e) => setTmpName(e.target.value)}
            placeholder="홍길동"
          />
        </Modal>
      )}

      {openBirth && (
        <Modal
          title="생년월일 편집"
          onClose={() => setOpenBirth(false)}
          onSave={applyBirth}
        >
          <input
            type="date"
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpBirth || ""}
            onChange={(e) => setTmpBirth(e.target.value)}
          />
        </Modal>
      )}

      {/* 국가/지역 · 표시 언어 모달은 보관만 (현재 버튼은 alert으로 처리) */}
      {openCountry && (
        <Modal
          title="국가/지역 변경"
          onClose={() => setOpenCountry(false)}
          onSave={applyCountry}
        >
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpCountry}
            onChange={(e) => setTmpCountry(e.target.value)}
            placeholder="Korea"
          />
        </Modal>
      )}

      {openLanguage && (
        <Modal
          title="표시 언어 변경"
          onClose={() => setOpenLanguage(false)}
          onSave={applyLanguage}
        >
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpLanguage}
            onChange={(e) => setTmpLanguage(e.target.value)}
            placeholder="한국어 (Korean)"
          />
        </Modal>
      )}

      {/* 학교 */}
      {openSchool && (
        <Modal
          title="학교 편집"
          onClose={() => setOpenSchool(false)}
          onSave={applySchool}
        >
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpSchool}
            onChange={(e) => setTmpSchool(e.target.value)}
            placeholder="한림대학교"
          />
        </Modal>
      )}

      {/* 전공 */}
      {openMajor && (
        <Modal
          title="전공 편집"
          onClose={() => setOpenMajor(false)}
          onSave={applyMajor}
        >
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpMajor}
            onChange={(e) => setTmpMajor(e.target.value)}
            placeholder="컴퓨터공학"
          />
        </Modal>
      )}

      {/* 학년 */}
      {openGrade && (
        <Modal
          title="학년 편집"
          onClose={() => setOpenGrade(false)}
          onSave={applyGrade}
        >
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpGrade}
            onChange={(e) => setTmpGrade(e.target.value)}
            placeholder="3학년"
          />
        </Modal>
      )}

      {/* 성별 */}
      {openGender && (
        <Modal
          title="성별 편집"
          onClose={() => setOpenGender(false)}
          onSave={applyGender}
        >
          <select
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpGender || ""}
            onChange={(e) => setTmpGender(e.target.value)}
          >
            <option value="">선택 안 함</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
          </select>
        </Modal>
      )}

      {/* 경험 수준 */}
      {openExpLevel && (
        <Modal
          title="프로그래밍 경험 수준"
          onClose={() => setOpenExpLevel(false)}
          onSave={applyExpLevel}
        >
          <select
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpExpLevel || ""}
            onChange={(e) => setTmpExpLevel(e.target.value)}
          >
            <option value="">선택 안 함</option>
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </Modal>
      )}

      {/* ✅ 전화번호 */}
      {openPhone && (
        <Modal
          title="전화번호 편집"
          onClose={() => setOpenPhone(false)}
          onSave={applyPhone}
        >
          <input
            type="tel"
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpPhone}
            onChange={(e) => setTmpPhone(e.target.value)}
            placeholder="010-1234-5678"
          />
        </Modal>
      )}

      {/* ✅ 주소 */}
      {openAddress && (
        <Modal
          title="주소 편집"
          onClose={() => setOpenAddress(false)}
          onSave={applyAddress}
        >
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpAddress}
            onChange={(e) => setTmpAddress(e.target.value)}
            placeholder="예) 서울특별시 강남구 역삼동 ..."
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Utils ---------------- */
function formatDate(isoLike: string) {
  try {
    const d = new Date(isoLike);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoLike;
  }
}

// ✅ 생년월일 전용(년-월-일만)
function formatDateYMD(isoLike: string) {
  try {
    const d = new Date(isoLike);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return isoLike;
  }
}

/* ---------------- Small Components ---------------- */
function InfoRow({
  icon,
  label,
  action,
}: {
  icon?: any;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b last:border-b-0 py-3">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
            <FontAwesomeIcon icon={icon} />
          </div>
        ) : null}
        <div className="text-sm font-medium">{label}</div>
      </div>
      {action}
    </div>
  );
}

function InlineLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="text-sm text-emerald-700 hover:underline"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <div className="w-7 h-7 rounded-full bg-white border text-gray-600 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} />
        </div>
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

/** 공용 모달 */
function Modal({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[1001] w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <div>{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm hover:opacity-90"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
