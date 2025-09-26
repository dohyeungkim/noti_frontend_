// lib/loadingStore.ts
"use client";
import { create } from "zustand";

type LoadingState = {
  active: number;
  show: boolean;
  _timer?: ReturnType<typeof setTimeout>;
  start: (opts?: { immediate?: boolean }) => void;
  stop: () => void;
  forceHide: () => void;
};

export const useLoadingStore = create<LoadingState>((set, get) => ({
  active: 0,
  show: false,
  _timer: undefined,

  start: (opts) => {
    const { active, _timer } = get();
    // 첫 요청일 때만 표시 제어
    if (active === 0) {
      // 직전 타이머 있으면 정리
      if (_timer) clearTimeout(_timer);

      if (opts?.immediate) {
        // 지연 없이 바로 표시
        set({ show: true, _timer: undefined });
      } else {
        // 깜빡임 방지용 지연
        const t = setTimeout(() => set({ show: true, _timer: undefined }), 120);
        set({ _timer: t });
      }
    }
    set({ active: active + 1 });
  },

  stop: () => {
    const next = Math.max(0, get().active - 1);
    const { _timer } = get();
    if (_timer && next === 0) clearTimeout(_timer);
    set({ active: next });
    if (next === 0) set({ show: false });
  },

  forceHide: () => {
    const { _timer } = get();
    if (_timer) clearTimeout(_timer);
    set({ active: 0, show: false, _timer: undefined });
  },
}));
