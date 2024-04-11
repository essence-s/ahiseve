import './modalVideoPlayer.css'
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import { modalStore } from '../../store/modalStore';
import { usePeer } from '@/hook/usePeer';

export default function ModalVideoPlayer() {

    let { isOpenModalVideoPlayer, setIsOpenModalVideoPlayer } = modalStore(state => state)
    let { getCalls } = usePeer()
    const handleModalVP = () => {
        setIsOpenModalVideoPlayer(state => {
            if (state) {
                //to improve
                getCalls() && getCalls().close()
            }
            // console.log(state)
            return !state
        })

    }

    return (
        <div className={`modal-video-player ${isOpenModalVideoPlayer ? 'open-modal-vp' : ''}`}>
            <div className="modal-video-player__button" onClick={handleModalVP}>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-caret-down" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M6 10l6 6l6 -6h-12" />
                </svg>
            </div>

            <div className="modal-video-player__container-vp">
                <VideoPlayer />
            </div>
        </div>
    )

}