import { create } from 'zustand';

export type PeerId = string;

export type AvailableStreamPeerInfo = {
  username: string;
  // avatarUrl?: string;
};

export type RemoteStreamInfo = {
  peerId: string;
  callId: string;
  stream: MediaStream;
};

export type StreamStoreState = {
  localStream: MediaStream | null;
  remoteStream: RemoteStreamInfo;
  availableStreamPeers: Record<PeerId, AvailableStreamPeerInfo>;
};

type StreamStoreActions = {
  // Stream Local
  getLocalStream: () => MediaStream;
  setLocalStream: (stream: MediaStream) => void;
  clearLocalStream: () => void;

  // Peers con streams disponibles
  addAvailableStreamPeer: (
    peerId: PeerId,
    info: AvailableStreamPeerInfo
  ) => void;
  removeAvailableStreamPeer: (peerId: PeerId) => void;
  clearAvailableStreamPeers: () => void;

  // Remote streams
  getRemoteStream: () => RemoteStreamInfo;
  setRemoteStream: (info: RemoteStreamInfo) => void;
  clearRemoteStream: () => void;
};

export const useStreamStore = create<StreamStoreState & StreamStoreActions>(
  (set, get) => ({
    localStream: null,
    remoteStream: null,
    availableStreamPeers: {},

    // Local Stream
    getLocalStream: () => get().localStream,
    setLocalStream: (stream) => set({ localStream: stream }),

    clearLocalStream: () => set({ localStream: null }),

    // Peers con streams disponibles
    addAvailableStreamPeer: (peerId, info) =>
      set((state) => ({
        availableStreamPeers: {
          ...state.availableStreamPeers,
          [peerId]: info,
        },
      })),

    removeAvailableStreamPeer: (peerId) =>
      set((state) => {
        const next = { ...state.availableStreamPeers };
        delete next[peerId];
        return { availableStreamPeers: next };
      }),

    clearAvailableStreamPeers: () => set({ availableStreamPeers: {} }),

    // Remote Streams
    getRemoteStream: () => get().remoteStream,
    setRemoteStream: (info) => set({ remoteStream: info }),

    clearRemoteStream: () => set({ remoteStream: null }),
  })
);
