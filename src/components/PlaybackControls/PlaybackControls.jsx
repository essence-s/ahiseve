import './playbackControls.css'
import { usePlayerStore } from "@/store/playerStore"
import { usePeer } from "@/hook/usePeer"
import { PAGE_MESSAGE_TYPES } from '../types.d'


export default function PlaybackControls({ fullScreen }) {

    let { isPlaying, setIsPlaying, seekValue } = usePlayerStore(state => ({
        isPlaying: state.isPlaying, setIsPlaying: state.setIsPlaying, seekValue: state.seekValue
    }))

    let { sendMessagueAll } = usePeer()

    const handlePause = () => {
        setIsPlaying(false)
        sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
            action: 'pause',
            status: 'sending',
        })
    }
    const handlePlay = () => {
        setIsPlaying(true)
        sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
            action: 'play',
            status: 'sending',
        })
    }

    const handleSeek = (modeSeek) => {
        // console.log(modeSeek)
        sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
            action: 'seeked',
            status: 'sending',
            dataSeek: modeSeek == "back"
                ? parseInt(seekValue) * -1
                : parseInt(seekValue),
        })
    }

    return (
        <div className="playback-controls">

            <button className="button-seek" onClick={() => handleSeek('back')}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-player-track-prev-filled"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path
                        d="M20.341 4.247l-8 7a1 1 0 0 0 0 1.506l8 7c.647 .565 1.659 .106 1.659 -.753v-14c0 -.86 -1.012 -1.318 -1.659 -.753z"
                        strokeWidth="0"
                        fill="currentColor"></path>
                    <path
                        d="M9.341 4.247l-8 7a1 1 0 0 0 0 1.506l8 7c.647 .565 1.659 .106 1.659 -.753v-14c0 -.86 -1.012 -1.318 -1.659 -.753z"
                        strokeWidth="0"
                        fill="currentColor"></path>
                </svg>
            </button>

            {
                isPlaying ?
                    <button id="videopause" onClick={handlePause} >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-player-pause-filled"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path
                                d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
                                strokeWidth="0"
                                fill="currentColor"></path>
                            <path
                                d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
                                strokeWidth="0"
                                fill="currentColor"></path>
                        </svg>
                    </button> :
                    <button id="videoplay" onClick={handlePlay} >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-player-play-filled"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path
                                d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"
                                strokeWidth="0"
                                fill="currentColor"></path>
                        </svg>
                    </button>
            }

            <button className="button-seek" onClick={() => handleSeek('next')}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-player-track-next-filled"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path
                        d="M2 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
                        strokeWidth="0"
                        fill="currentColor"></path>
                    <path
                        d="M13 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
                        strokeWidth="0"
                        fill="currentColor"></path>
                </svg>
            </button>
            <button className="button-seek" onClick={() => fullScreen()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-maximize" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /></svg>
            </button>
        </div>
    )
}