import { useStreamStore } from "@/store/streamStore";
import PlaybackControls from "@/components/PlaybackControls/PlaybackControls";
import './videoPlayer.css'
import { useEffect } from 'react'
import { useRef } from 'react'


export default function VideoPlayer() {

    let { setRefVideoStream } = useStreamStore(state => ({ setRefVideoStream: state.setRefVideoStream }))
    let videoContainer = useRef()
    let refVideoStreamu = useRef()

    const fullScreen = () => {

        if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen()
        } else {
            videoContainer.current.webkitRequestFullscreen()
        }

    }

    useEffect(() => {
        setRefVideoStream(refVideoStreamu.current)
    }, [])

    return (
        <div className="video-player" ref={videoContainer}>
            <video ref={refVideoStreamu}></video>
            <PlaybackControls fullScreen={fullScreen}></PlaybackControls>
        </div>
    )
}