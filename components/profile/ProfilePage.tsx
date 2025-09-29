"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faIdBadge,
  faLock,
  faLanguage,
  faGlobe,
  faCakeCandles,
  faShieldHalved,
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
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import { auth_api, user_api } from "@/lib/api";

/* ====================== 타입 ====================== */
type ProfileCore = {
  user_id: string;
  username: string;
  email: string;
  created_at: string;

  gender?: string | null; // "male" | "female" | null
  birthday?: string | null; // "YYYY-MM-DD" or ISO
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
  username: string;
  email: string;
  createdAt: string;
  birth: string;
  country: string; // UI 전용
  language: string; // UI 전용
  gender?: string | null; // "남성" | "여성" | ""
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
  lastVisit: string;
};

const EMPTY_PROFILE: ProfileView = {
  user_id: "",
  username: "",
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
  solvedCount: 0,
  attemptedCount: 0,
  lastVisit: "",
};

/* ---------------- Utils: 변환/정규화 ---------------- */
const genderToUi = (g?: string | null) =>
  g === "male" ? "남성" : g === "female" ? "여성" : "";

const genderToApi = (g?: string | null) =>
  g === "남성" ? "male" : g === "여성" ? "female" : "";

const toYMD = (isoLike?: string | null) => {
  if (!isoLike) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoLike)) return isoLike;
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// PATCH 바디(업데이트 전용)
type UpdatePayload = Partial<Omit<ProfileCore, "created_at">> & { user_id: string };

// 타입 깐깐하면 any 래핑
const updateProfile = (payload: UpdatePayload) =>
  (user_api.user_profile_update as any)(payload);

/* ---------------- Component ---------------- */
export default function ProfilePage() {
  const [user, setUser] = useState<ProfileView>(EMPTY_PROFILE);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // ===== 모달 상태 =====
  const [openEmail, setOpenEmail] = useState(false);
  const [openBirth, setOpenBirth] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openUsername, setOpenUsername] = useState(false);
  const [tmpUsername, setTmpUsername] = useState("");
  const [openSchool, setOpenSchool] = useState(false);
  const [openMajor, setOpenMajor] = useState(false);
  const [openGrade, setOpenGrade] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const [openExpLevel, setOpenExpLevel] = useState(false);
  const [openPhone, setOpenPhone] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);

  // ===== 임시 입력값 =====
  const [tmpEmail, setTmpEmail] = useState("");
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
  const [tmpAddress, setTmpAddress] = useState("");

  // 메모(= introduction)
  const [memo, setMemo] = useState<string>("");
  const [tmpMemo, setTmpMemo] = useState<string>("");
  const [memoSavedAt, setMemoSavedAt] = useState<string | null>(null);

  // 최초 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: ProfileCore = await user_api.user_profile_get();
        if (!mounted || !res) return;

        const mapped: ProfileView = {
          user_id: res.user_id ?? "",
          username: res.username ?? "",
          email: res.email ?? "",
          createdAt: res.created_at ?? "",
          birth: toYMD(res.birthday) ?? "",
          country: "",
          language: "",
          gender: genderToUi(res.gender) ?? "",
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
          preferred_programming_languages: res.preferred_programming_languages ?? [],
          solvedCount: user.solvedCount ?? 0,
          attemptedCount: user.attemptedCount ?? 0,
          lastVisit: user.lastVisit ?? "",
        };

        setUser(mapped);
        setTmpUsername(mapped.username);

        // 모달 입력값 초기화
        setTmpEmail(mapped.email);
        setTmpBirth(mapped.birth);
        setTmpCountry(mapped.country);
        setTmpLanguage(mapped.language);
        setTmpSchool(mapped.school || "");
        setTmpMajor(mapped.major || "");
        setTmpGrade(mapped.grade || "");
        setTmpGender(mapped.gender || "");
        setTmpExpLevel(mapped.programming_experience_level || "");
        setTmpPhone(mapped.phone || "");
        setTmpAddress(mapped.address || "");

        // 메모장 동기화
        const intro = (res.introduction ?? "").trim();
        setMemo(intro);
        setTmpMemo(intro);
      } catch (e) {
        console.warn("profile_get 실패", e);
        setMemo("");
        setTmpMemo("");
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== delta 빌더 ===== */
  function mapViewToCoreFragment(key: keyof ProfileView, value: any): Partial<UpdatePayload> {
    switch (key) {
      case "username": return { username: value };
      case "email": return { email: value };
      case "gender": return { gender: genderToApi(value) || undefined };
      case "birth": return { birthday: toYMD(value) || undefined };
      case "phone": return { phone: value || undefined };
      case "address": return { address: value || undefined };
      case "school": return { school: value || undefined };
      case "introduction": return { introduction: value || undefined };
      case "grade": return { grade: value || undefined };
      case "major": return { major: value || undefined };
      case "interests": return { interests: value ?? [] };
      case "learning_goals": return { learning_goals: value ?? [] };
      case "preferred_fields": return { preferred_fields: value ?? [] };
      case "programming_experience_level":
        return { programming_experience_level: (value as string) || undefined };
      case "preferred_programming_languages":
        return { preferred_programming_languages: value ?? [] };
      // name, country, language, createdAt, solvedCount, attemptedCount, lastVisit → 서버 전송 X
      default: return {};
    }
  }

  function buildUpdatePayload(prev: ProfileView, next: ProfileView, keys: (keyof ProfileView)[]): UpdatePayload {
    const payload: UpdatePayload = { user_id: next.user_id };
    for (const k of keys) {
      if (prev[k] === next[k]) continue;
      Object.assign(payload, mapViewToCoreFragment(k, next[k]));
    }
    // 빈값 제거
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === "" || v === null || v === undefined) delete (payload as any)[k];
    });
    return payload;
  }

  const optimisticPatch = async (next: ProfileView, changedKeys: (keyof ProfileView)[]) => {
    const prev = user;
    setUser(next);
    try {
      const body = buildUpdatePayload(prev, next, changedKeys);
      // 변경이 없으면 호출 스킵
      if (Object.keys(body).length > 1) {
        await updateProfile(body);
      }
    } catch (e) {
      console.warn("PATCH 실패, 롤백", e);
      setUser(prev);
      alert("저장에 실패했어. 잠시 후 다시 시도해줘.");
      throw e;
    }
  };

  /* ===== 적용 핸들러 ===== */
  const applyPassword = async () => {
    const current = (tmpPw.current || "").trim();
    const next = (tmpPw.next || "").trim();
    const confirm = (tmpPw.confirm || "").trim();

    if (!current || !next) { setPwError("현재 비밀번호와 새 비밀번호를 입력해주세요."); return; }
    if (next !== confirm) { setPwError("새 비밀번호가 일치하지 않습니다."); return; }
    if (current === next) { setPwError("현재 비밀번호와 새 비밀번호가 동일합니다."); return; }
    if (next.length < 4) { setPwError("비밀번호는 4자 이상이어야 합니다."); return; }
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
    const next = { ...user, email: tmpEmail.trim() };
    await optimisticPatch(next, ["email"]);
    setOpenEmail(false);
  };

  const applyUsername = async () => {
    const next = { ...user, username: tmpUsername.trim() };
    await optimisticPatch(next, ["username"]);
    setOpenUsername(false);
  };

  const applyBirth = async () => {
    const next = { ...user, birth: toYMD(tmpBirth) };
    await optimisticPatch(next, ["birth"]);
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
    const next = { ...user, school: (tmpSchool || "").trim() };
    await optimisticPatch(next, ["school"]);
    setOpenSchool(false);
  };

  const applyMajor = async () => {
    const next = { ...user, major: (tmpMajor || "").trim() };
    await optimisticPatch(next, ["major"]);
    setOpenMajor(false);
  };

  const applyGrade = async () => {
    const next = { ...user, grade: (tmpGrade || "").trim() };
    await optimisticPatch(next, ["grade"]);
    setOpenGrade(false);
  };

  const applyGender = async () => {
    const next = { ...user, gender: (tmpGender || "").trim() };
    await optimisticPatch(next, ["gender"]);
    setOpenGender(false);
  };

  const applyExpLevel = async () => {
    const next = { ...user, programming_experience_level: (tmpExpLevel || "").trim() };
    await optimisticPatch(next, ["programming_experience_level"]);
    setOpenExpLevel(false);
  };

  const applyPhone = async () => {
    const next = { ...user, phone: (tmpPhone || "").trim() };
    await optimisticPatch(next, ["phone"]);
    setOpenPhone(false);
  };

  const applyAddress = async () => {
    const next = { ...user, address: (tmpAddress || "").trim() };
    await optimisticPatch(next, ["address"]);
    setOpenAddress(false);
  };

  const saveMemo = async () => {
    const v = tmpMemo.trim();
    setMemo(v);
    setMemoSavedAt(new Date().toISOString());
    const next = { ...user, introduction: v };
    try {
      await optimisticPatch(next, ["introduction"]);
    } catch {}
  };

  /* ===== 파생 값 ===== */
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

  /* ===== View ===== */
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
              onClick={() => alert("아직 구현하지 않은 기능입니다.")}
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
              {formattedSavedAt ? (
                <p className="mt-1 text-[11px] text-gray-500">
                  마지막 저장: {formattedSavedAt}
                </p>
              ) : null}
            </div>
          </div>

          {/* 중앙: 이름/기본 정보 */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-extrabold">
                {user.username || "닉네임 미설정"}
              </h1>
              <button
                className="text-sm text-emerald-700 hover:underline"
                onClick={() => {
                  setTmpUsername(user.username || "");
                  setOpenUsername(true);
                }}
              >
                닉네임 편집
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow
                icon={faIdBadge}
                label={
                  user.createdAt
                    ? `가입일: ${formatDate(user.createdAt)}`
                    : "가입일 정보 없음"
                }
              />

              <InfoRow
                icon={faEnvelope}
                label={user.email || "이메일 미설정"}
                action={<InlineLink label="이메일 변경" onClick={() => setOpenEmail(true)} />}
              />

              <InfoRow
                icon={faLock}
                label="비밀번호"
                action={<InlineLink label="비밀번호 변경" onClick={() => setOpenPassword(true)} />}
              />

              <InfoRow
                icon={faCakeCandles}
                label={
                  user.birth && user.birth.trim().length > 0
                    ? formatDateYMD(user.birth)
                    : "생년월일을 설정해주세요"
                }
                action={<InlineLink label="생년월일 편집" onClick={() => setOpenBirth(true)} />}
              />

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

              <InfoRow
                icon={faPhone}
                label={
                  user.phone && (user.phone as string).trim().length > 0
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

              <InfoRow
                icon={faLocationDot}
                label={
                  user.address && (user.address as string).trim().length > 0
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

          {/* 오른쪽: 활동 요약 */}
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
                      className="h-2 rounded-full"
                      style={{ width: `${solvedRate}%`, backgroundColor: "#10b981" }}
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
        <Modal title="이메일 변경" onClose={() => setOpenEmail(false)} onSave={applyEmail}>
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
          <label className="block text-sm text-gray-700 mb-1">현재 비밀번호</label>
          <input
            type="password"
            className="w-full rounded-xl border p-2 outline-none mb-3"
            value={tmpPw.current}
            onChange={(e) => setTmpPw({ ...tmpPw, current: e.target.value })}
            placeholder="현재 비밀번호"
            disabled={pwLoading}
          />
          <label className="block text-sm text-gray-700 mb-1">새 비밀번호</label>
          <input
            type="password"
            className="w-full rounded-xl border p-2 outline-none mb-3"
            value={tmpPw.next}
            onChange={(e) => setTmpPw({ ...tmpPw, next: e.target.value })}
            placeholder="새 비밀번호 (4자 이상)"
            disabled={pwLoading}
          />
          <label className="block text-sm text-gray-700 mb-1">새 비밀번호 확인</label>
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

      {openUsername && (
        <Modal title="닉네임 변경" onClose={() => setOpenUsername(false)} onSave={applyUsername}>
          <label className="block text-sm text-gray-700 mb-1">새 닉네임</label>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpUsername}
            onChange={(e) => setTmpUsername(e.target.value)}
            placeholder="새 닉네임"
          />
        </Modal>
      )}

      {openBirth && (
        <Modal title="생년월일 편집" onClose={() => setOpenBirth(false)} onSave={applyBirth}>
          <input
            type="date"
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpBirth || ""}
            onChange={(e) => setTmpBirth(e.target.value)}
          />
        </Modal>
      )}

      {openCountry && (
        <Modal title="국가/지역 변경" onClose={() => setOpenCountry(false)} onSave={applyCountry}>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpCountry}
            onChange={(e) => setTmpCountry(e.target.value)}
            placeholder="Korea"
          />
        </Modal>
      )}

      {openLanguage && (
        <Modal title="표시 언어 변경" onClose={() => setOpenLanguage(false)} onSave={applyLanguage}>
        <input
          className="w-full rounded-xl border p-2 outline-none"
          value={tmpLanguage}
          onChange={(e) => setTmpLanguage(e.target.value)}
          placeholder="한국어 (Korean)"
        />
        </Modal>
      )}

      {openSchool && (
        <Modal title="학교 편집" onClose={() => setOpenSchool(false)} onSave={applySchool}>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpSchool}
            onChange={(e) => setTmpSchool(e.target.value)}
            placeholder="한림대학교"
          />
        </Modal>
      )}

      {openMajor && (
        <Modal title="전공 편집" onClose={() => setOpenMajor(false)} onSave={applyMajor}>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpMajor}
            onChange={(e) => setTmpMajor(e.target.value)}
            placeholder="컴퓨터공학"
          />
        </Modal>
      )}

      {openGrade && (
        <Modal title="학년 편집" onClose={() => setOpenGrade(false)} onSave={applyGrade}>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpGrade}
            onChange={(e) => setTmpGrade(e.target.value)}
            placeholder="3학년"
          />
        </Modal>
      )}

      {openGender && (
        <Modal title="성별 편집" onClose={() => setOpenGender(false)} onSave={applyGender}>
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

      {openExpLevel && (
        <Modal title="프로그래밍 경험 수준" onClose={() => setOpenExpLevel(false)} onSave={applyExpLevel}>
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

      {openPhone && (
        <Modal title="전화번호 편집" onClose={() => setOpenPhone(false)} onSave={applyPhone}>
          <input
            type="tel"
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpPhone}
            onChange={(e) => setTmpPhone(e.target.value)}
            placeholder="010-1234-5678"
          />
        </Modal>
      )}

      {openAddress && (
        <Modal title="주소 편집" onClose={() => setOpenAddress(false)} onSave={applyAddress}>
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

function formatDateYMD(isoLike: string) {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoLike)) return isoLike;
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

function InlineLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="text-sm text-emerald-700 hover:underline" onClick={onClick}>
      {label}
    </button>
  );
}

function StatRow({ icon, label, value }: { icon: any; label: string; value: string }) {
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
