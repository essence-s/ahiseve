import { create } from 'zustand';

export type UserInfo = {
  username: string;
  // userId: string;
  // color: string;
};

type UserStore = {
  user: UserInfo | null;
  setUser: (info: UserInfo) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (info) => set({ user: info }),
  clearUser: () => set({ user: null }),
}));
