import { create } from "zustand";
export const modalStore = create((set, get) => ({
    isOpenModalVideoPlayer: false,
    setIsOpenModalVideoPlayer: (valueOrFunction) => {
        set((state) => ({
            isOpenModalVideoPlayer: typeof valueOrFunction === 'function' ? valueOrFunction(state.isOpenModalVideoPlayer) : valueOrFunction
        }));
    },
}))