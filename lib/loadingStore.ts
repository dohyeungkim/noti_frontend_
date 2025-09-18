"use client";
import { create } from "zustand";

type LoadingState = {
  active: number;                 // 진행 중 요청 수
  show: boolean;                  // 오버레이 표시 여부(디바운스 반영)
  _timer?: ReturnType<typeof setTimeout>;
  start: () => void;
  stop: () => void;
};

export const useLoadingStore = create<LoadingState>((set, get) => ({
  active: 0,
  show: false,
  _timer: undefined,

  start: () => {
    const { active, _timer } = get();
    // 첫 요청에서 살짝 딜레이 후 표시(깜빡임 방지)
    if (active === 0 && !_timer) {
      const t = setTimeout(() => set({ show: true, _timer: undefined }), 120);
      set({ _timer: t });
    }
    set({ active: active + 1 });
  },

  stop: () => {
    const next = Math.max(0, get().active - 1);
    set({ active: next });
    if (next === 0) {
      // 마지막 요청 끝난 뒤 살짝 늦게 끄기
      const t = setTimeout(() => set({ show: false }), 120);
      // 기존 타이머가 남아있다면 정리
      const prev = get()._timer;
      if (prev) clearTimeout(prev);
      set({ _timer: t });
    }
  },
}));
