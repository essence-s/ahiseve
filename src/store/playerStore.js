import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  seekValue: '10',
  setSeekValue: (seekValue) => set({ seekValue }),
  controlsVisible: true,
  setControlsVisible: (v) => set({ controlsVisible: v }),
  containerFullScreen: null,
  setContainerFullScreen: (elementRef) =>
    set({ containerFullScreen: elementRef }),
}));
