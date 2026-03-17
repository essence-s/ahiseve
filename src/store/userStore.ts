import { create } from 'zustand';

export type UserInfo = {
  username: string;
  // userId: string;
  // color: string;
};

type UserStore = {
  user: UserInfo | null;
  getUser: () => UserInfo;
  setUser: (info: UserInfo) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,

  getUser: () => get().user,
  setUser: (info) => set({ user: info }),
  clearUser: () => set({ user: null }),
}));
