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

    //to improve
    startStreamStore: () => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {


                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            displaySurface: "browser",
                        },
                        audio: {
                            suppressLocalAudioPlayback: false,
                        },
                        preferCurrentTab: false,
                        selfBrowserSurface: "exclude",
                        systemAudio: "include",
                        surfaceSwitching: "include",
                        monitorTypeSurfaces: "include",
                    });

                    if (stream) {
                        get().setStreamL(stream)
                        resolve(stream)
                    }
                } else {
                    window.toast({
                        title: 'La transmision solo esta disponible en PC',
                        message: '',
                        location: 'top-right',
                        dismissable: false,
                        theme: 'butterupcustom',
                        type: 'error',
                        icon: true
                    })
                    reject('La transmision solo esta disponible en PC')
                }
            } catch (error) {
                reject(error)
            }
        })


    },
    stopStreamingStore: () => {
        return new Promise((resolve, reject) => {
            try {
                get().getStreamL().getTracks().forEach(track => {
                    track.stop()
                    resolve('stop')
                })
            } catch (err) {
                reject(err)
            }
        })
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
    })),


    // isVideoElementSelected: false,
    // setIsVideoElementSelected: (data) => {
    //     set({ isVideoElementSelected: data })

    // }

}))