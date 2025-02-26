import { create } from "zustand";
import { auth_api } from "@/lib/api";

interface AuthState {
  userName: string | null;
  setUserName: (value: string) => void;
  isAuth: boolean | null;
  setIsAuth: (value: boolean) => void;
  getUserName: () => Promise<void>;
}

export const useAuth = create<AuthState>()((set) => ({
  userName: null,
  setUserName: (value) => set({ userName: value }),
  isAuth: null,
  setIsAuth: (value) => set({ isAuth: value }),
  getUserName: async () => {
    try {
      const res = await auth_api.getUser();
      set({ isAuth: !!res.user_id });
      set({ userName: res.user_id });
    } catch (error) {
      set({ isAuth: false });
    }
  },
}));
