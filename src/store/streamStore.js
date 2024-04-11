import { create } from "zustand";

export const useStreamStore = create((set, get) => ({
    streamL: '',
    setStreamL: (stream) => set({ stream }),
    getStreamL: () => get().stream,
    //ref
    refVideoStream: '',
    getRefVideoStream: () => get().refVideoStream,
    setRefVideoStream: (refVideoStream) => {
        // console.log(refVideoStream)
        set({ refVideoStream })
    },


    infoStream: {
        isStream: false,
        userStreaming: '',
        masterId: '',
        onlineStreamUsers: []
    },
    setInfoStream: (valueOrFunction) => {
        set((state) => ({
            infoStream: typeof valueOrFunction === 'function' ? valueOrFunction(state.infoStream) : valueOrFunction
        }));
    },
    getInfoStream: () => get().infoStream,
}))