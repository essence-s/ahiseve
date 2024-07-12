import { useStreamStore } from "@/store/streamStore";
import PlaybackControls from "@/components/PlaybackControls/PlaybackControls";
import './videoPlayer.css'
import { useEffect } from 'react'
import { useRef } from 'react'


export default function VideoPlayer() {

    let { activeStreaming } = useStreamStore(state => ({
        activeStreaming: state.activeStreaming
    }))
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
        refVideoStreamu.current.srcObject = activeStreaming.captScreen?.stream
        let playPromise = refVideoStreamu.current.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
            }).catch(error => { });
        }
    }, [activeStreaming])

    return (
        <div className="video-player" ref={videoContainer}>
            <video ref={refVideoStreamu} ></video>
            <PlaybackControls 
            fullScreen={fullScreen}
            videoContainer={videoContainer}
            ></PlaybackControls>
        </div>
    )
}