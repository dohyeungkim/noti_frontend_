"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faIdBadge,
  faLock,
  faHeart,
  faGlobe,
  faCakeCandles,
  faShieldHalved,
  faChevronRight,
  faCamera,
  faEarthAsia,
  faChartLine,
  faCalendarDay,
  faCheckCircle,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";

/** 더미 유저 데이터 */
const DUMMY_USER = {
  name: "테스터 님",
  email: "tester@example.com",
  interests: ["AI", "알고리즘", "C언어", "웹개발"],
  country: "Korea",
  language: "한국어 (Korean)",
  birth: "2000-01-01",

  // ▼ 추가된 더미 활동 데이터
  solvedCount: 127,
  attemptedCount: 163,
  lastVisit: "2025-09-25T22:30:00+09:00",
};

export default function ProfilePage() {
  const [user, setUser] = useState(DUMMY_USER);

  // 모달 상태
  const [openEmail, setOpenEmail] = useState(false);
  const [openName, setOpenName] = useState(false);
  const [openInterests, setOpenInterests] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openBirth, setOpenBirth] = useState(false);

  // 임시 입력값
  const [tmpEmail, setTmpEmail] = useState(user.email);
  const [tmpName, setTmpName] = useState(user.name);
  const [tmpInterests, setTmpInterests] = useState(user.interests.join(", "));
  const [tmpPw, setTmpPw] = useState({ current: "", next: "", confirm: "" });
  const [tmpCountry, setTmpCountry] = useState(user.country);
  const [tmpLanguage, setTmpLanguage] = useState(user.language);
  const [tmpBirth, setTmpBirth] = useState(user.birth);

  /** ---------- 메모장 형태의 코멘트 (단일 저장/수정) ---------- */
  const initialMemo =
    "첫 방문 인사: 반가워요! 👋\n목표: 매일 1문제 이상 풀기.";
  const [memo, setMemo] = useState<string>(initialMemo);
  const [tmpMemo, setTmpMemo] = useState<string>(initialMemo);
  const [memoSavedAt, setMemoSavedAt] = useState<string | null>(null);

  const saveMemo = () => {
    const v = tmpMemo.trim();
    setMemo(v);
    setMemoSavedAt(new Date().toISOString());
  };

  const resetMemo = () => {
    setTmpMemo(memo);
  };

  // 적용 핸들러 (더미)
  const applyEmail = () => {
    setUser((u) => ({ ...u, email: tmpEmail }));
    setOpenEmail(false);
  };
  const applyName = () => {
    setUser((u) => ({ ...u, name: tmpName }));
    setOpenName(false);
  };
  const applyInterests = () => {
    const arr = tmpInterests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setUser((u) => ({ ...u, interests: arr }));
    setOpenInterests(false);
  };
  const applyPassword = () => {
    setOpenPassword(false);
    setTmpPw({ current: "", next: "", confirm: "" });
  };
  const applyCountry = () => {
    setUser((u) => ({ ...u, country: tmpCountry }));
    setOpenCountry(false);
  };
  const applyLanguage = () => {
    setUser((u) => ({ ...u, language: tmpLanguage }));
    setOpenLanguage(false);
  };
  const applyBirth = () => {
    setUser((u) => ({ ...u, birth: tmpBirth }));
    setOpenBirth(false);
  };

  const formattedLastVisit = useMemo(
    () => formatDate(user.lastVisit),
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
      {/* 상단 액션 바 (MS 상단 파란 띠 느낌을 가볍게 변형) */}
      <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-3">
        <ActionPill
          title="로그아웃"
          desc="로그인 창으로 가기"
          onClick={() => alert("아직 지원하지 않는 서비스 입니다.")}
        />
        <ActionPill
          title="비밀번호 변경"
          desc="보안을 강화하세요"
          onClick={() => setOpenPassword(true)}
        />
        <ActionPill
          title="한림대학교"
          desc="학교정보 변경하기"
          onClick={() => alert("학교정보 수정하기")}
        />
      </div>

      {/* 핵심 레이아웃: 좌측 아바타 / 중앙 이름 / 우측 퀵 섹션 */}
      <section className="rounded-2xl bg-white shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_320px] gap-6 p-6">
          {/* 왼쪽: 큰 아바타 + 메모장 */}
          <div className="flex flex-col items-center">
            {/* 프로필 이미지 */}
            <div className="w-44 h-44 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 text-6xl">
              <FontAwesomeIcon icon={faUser} />
            </div>

            {/* 사진 추가 버튼 */}
            <button
              className="mt-4 text-sm text-emerald-700 hover:underline flex items-center justify-center gap-2"
              onClick={() => alert("더미: 이미지 업로드")}
            >
              <FontAwesomeIcon icon={faCamera} />
              사진 추가
            </button>

            {/* 메모장(단일 코멘트) */}
            <div className="mt-6 w-full">
              <h3 className="text-sm font-semibold mb-2">코멘트 (메모장)</h3>
              <textarea
                className="w-full rounded-xl border p-3 text-sm outline-none resize-none"
                rows={8}
                placeholder="메모/코멘트를 남겨보세요"
                value={tmpMemo}
                onChange={(e) => setTmpMemo(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between">
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

          {/* 중앙: 이름/이메일 등 큰 헤더 */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">{user.name}</h1>
            <button
              className="mt-1 text-sm text-emerald-700 hover:underline"
              onClick={() => {
                setTmpName(user.name);
                setOpenName(true);
              }}
            >
              이름 편집
            </button>

            <div className="mt-6 space-y-4">
              <InfoRow
                icon={faIdBadge}
                label={user.name}
                action={
                  <InlineLink
                    label="로그인 방법 관리"
                    onClick={() => alert("아직 지원하지 않는 서비스 입니다.")}
                  />
                }
              />
              <InfoRow
                icon={faEnvelope}
                label={user.email}
                action={<InlineLink label="이메일 변경" onClick={() => setOpenEmail(true)} />}
              />
              <InfoRow
                icon={faCakeCandles}
                label={user.birth}
                action={
                  <InlineLink
                    label="생년월일 편집"
                    onClick={() => setOpenBirth(true)}
                  />
                }
              />
              <InfoRow
                icon={faEarthAsia}
                label={user.country}
                action={
                  <InlineLink
                    label="국가/지역 변경"
                    onClick={() => setOpenCountry(true)}
                  />
                }
              />
              <InfoRow
                icon={faGlobe}
                label={user.language}
                action={
                  <InlineLink
                    label="표시 언어 변경"
                    onClick={() => setOpenLanguage(true)}
                  />
                }
              />
            </div>
          </div>

          {/* 오른쪽: 퀵(활동 요약 + 빠른 이동) */}
          <div className="space-y-4">
            {/* 활동 요약 카드 */}
            <div className="rounded-2xl border bg-gray-50 p-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} />
                내 활동 요약
              </h3>

              <div className="mt-3 space-y-3">
                <StatRow
                  icon={faCheckCircle}
                  label="총 맞춘 문제 수"
                  value={`${user.solvedCount.toLocaleString()}문제`}
                />
                <StatRow
                  icon={faListCheck}
                  label="시도한 총 문제 수"
                  value={`${user.attemptedCount.toLocaleString()}문제`}
                />

                {/* 진행률 바 */}
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
                  value={formattedLastVisit}
                />
              </div>
            </div>

            {/* 빠른 이동/링크 카드 (원하면 라우팅 연결) */}
            <div className="rounded-2xl border bg-white p-4">
              <h3 className="font-bold text-sm mb-2">빠른 이동</h3>
              <div className="space-y-2">
                <QuickLink
                  label="문제 기록 보기"
                  onClick={() => alert("더미: 문제 기록 페이지로 이동")}
                />
                <QuickLink
                  label="내 랭킹 확인"
                  onClick={() => alert("더미: 랭킹 페이지로 이동")}
                />
                <QuickLink
                  label="설정"
                  onClick={() => alert("더미: 설정으로 이동")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 관심사 섹션(배지) */}
      <section className="mt-8 rounded-2xl bg-white shadow-sm border p-6">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faHeart} /> 관심사
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {user.interests.length ? (
            user.interests.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
              >
                {t}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-500">관심사가 없습니다.</p>
          )}
        </div>
        <div className="mt-5">
          <button
            onClick={() => {
              setTmpInterests(user.interests.join(", "));
              setOpenInterests(true);
            }}
            className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm hover:opacity-90"
          >
            관심사 변경
          </button>
        </div>
      </section>

      {/* ===== 모달들 (더미) ===== */}
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
      {openInterests && (
        <Modal
          title="관심사 변경"
          onClose={() => setOpenInterests(false)}
          onSave={applyInterests}
        >
          <label className="block text-sm text-gray-700 mb-1">
            관심사 (쉼표로 구분)
          </label>
          <input
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpInterests}
            onChange={(e) => setTmpInterests(e.target.value)}
            placeholder="AI, 알고리즘, 웹개발"
          />
        </Modal>
      )}
      {openPassword && (
        <Modal
          title="비밀번호 변경"
          onClose={() => setOpenPassword(false)}
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
          />
          <label className="block text-sm text-gray-700 mb-1">
            새 비밀번호
          </label>
          <input
            type="password"
            className="w-full rounded-xl border p-2 outline-none mb-3"
            value={tmpPw.next}
            onChange={(e) => setTmpPw({ ...tmpPw, next: e.target.value })}
            placeholder="새 비밀번호"
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
          />
        </Modal>
      )}
      {openCountry && (
        <Modal
          title="국가/지역 변경"
          onClose={() => alert("아직 지원하지 않는 서비스입니다.")}
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
          onClose={() => alert("아직 지원하지 않는 서비스입니다.")}
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
      {openBirth && (
        <Modal
          title="생년월일 편집"
          onClose={() => setOpenBirth(false)}
          onSave={applyBirth}
        >
          <input
            type="date"
            className="w-full rounded-xl border p-2 outline-none"
            value={tmpBirth}
            onChange={(e) => setTmpBirth(e.target.value)}
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

/* ---------------- Components ---------------- */

function ActionPill({
  title,
  desc,
  onClick,
}: {
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-100 px-4 py-3 text-left hover:bg-emerald-100 transition"
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs opacity-80">
        {desc}{" "}
        <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-[10px]" />
      </div>
    </button>
  );
}

function InfoRow({
  icon,
  label,
  action,
}: {
  icon: any;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b last:border-b-0 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} />
        </div>
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

function QuickLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full justify-between rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
    >
      <span>{label}</span>
      <FontAwesomeIcon
        icon={faChevronRight}
        className="text-xs text-gray-400"
      />
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

/** 공용 모달 (더미) */
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
