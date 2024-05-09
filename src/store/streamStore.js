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
    },
    setInfoStream: (valueOrFunction) => {
        set((state) => ({
            infoStream: typeof valueOrFunction === 'function' ? valueOrFunction(state.infoStream) : valueOrFunction
        }));
    },

    getInfoStream: () => get().infoStream,

    streamingUsers: {},
    addStreamingUsers: (id, data) => {
        set(state => ({
            streamingUsers: {
                ...state.streamingUsers,
                [id]: data
            }
        }))

        // console.log(get().streamingUsers)
    },
    deleteStreamingUser: (id) => {

        set(state => {
            let sstu = { ...state.streamingUsers }
            delete sstu[id]
            return {
                streamingUsers: sstu
            }
        })
    },

    activeStreaming: {
        captScreen: null
    },
    getActiveStreamig: () => get().activeStreaming,
    addActiveStreamingUserCaptScreen: (stream, idPeer, idCall) => {
        set(state => ({
            activeStreaming: {
                ...state.activeStreaming,
                captScreen: {
                    idPeer,
                    idCall,
                    stream
                }
            }
        }))
    },
    setNullActiveStreamingUserCaptScreen: () => set(state => ({
        activeStreaming: {
            ...state.activeStreaming,
            captScreen: null
        }
    }))


}))