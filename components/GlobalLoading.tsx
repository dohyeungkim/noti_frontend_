"use client";
//로딩창 관련내용입니다. 분류는 하지 않았습니다.
import { useLoadingStore } from "@/lib/loadingStore";

function Spinner({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function GlobalLoading() {
  const show = useLoadingStore((s) => s.show);  // ✅ named import 사용
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-3 text-gray-700">
        <Spinner />
        <span className="font-medium">로딩 중…</span>
      </div>
    </div>
  );
}
