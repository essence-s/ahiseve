import { create } from 'zustand';

export type PlayerInfo = {
  number: string;
  currentTime: number;
  duration: number;
  paused: boolean;
  playbackRate: number;
  volume: number;
  muted: boolean;
  ended: boolean;
};

type PlayerStore = {
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;

  seekValue: string;
  setSeekValue: (value: string) => void;

  controlsVisible: boolean;
  setControlsVisible: (value: boolean | ((prev: boolean) => boolean)) => void;

  containerFullScreen: React.RefObject<HTMLElement> | null;
  setContainerFullScreen: (el: React.RefObject<HTMLElement> | null) => void;

  playerInfo: PlayerInfo;
  getPlayerInfo: () => PlayerInfo;
  setPlayerInfo: (info: PlayerInfo) => void;
};

const initialPlayerInfo: PlayerInfo = {
  number: '',
  currentTime: 0,
  duration: 300,
  paused: true,
  playbackRate: 1,
  volume: 1,
  muted: false,
  ended: false,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  seekValue: '10',
  setSeekValue: (seekValue) => set({ seekValue }),
  controlsVisible: true,
  setControlsVisible: (valueOrFn) =>
    set((state) => ({
      controlsVisible:
        typeof valueOrFn === 'function'
          ? valueOrFn(state.controlsVisible)
          : valueOrFn,
    })),
  containerFullScreen: null,
  setContainerFullScreen: (elementRef) =>
    set({ containerFullScreen: elementRef }),

  playerInfo: initialPlayerInfo,
  getPlayerInfo: () => get().playerInfo,
  setPlayerInfo: (playerInfo) => {
    set({ playerInfo });
  },
}));
