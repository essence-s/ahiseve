import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
    isPlaying: false,
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    seekValue: '10',
    setSeekValue: (seekValue) => set({ seekValue }),
}))