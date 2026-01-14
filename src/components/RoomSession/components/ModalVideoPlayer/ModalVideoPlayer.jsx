import VideoPlayer from '@/components/RoomSession/components/VideoPlayer/VideoPlayer';
import { usePeer } from '@/hook/usePeer';
import { modalStore } from '../../../../store/modalStore';
import './modalVideoPlayer.css';

export default function ModalVideoPlayer() {
  let { isOpenModalVideoPlayer, setIsOpenModalVideoPlayer } = modalStore(
    (state) => state
  );
  let { closeActiveStreamig } = usePeer();

  const handleModalVP = () => {
    setIsOpenModalVideoPlayer((state) => {
      if (state) {
        //to improve
        closeActiveStreamig();
      }
      return !state;
    });
  };

  return (
    <div
      className={`modal-video-player ${
        isOpenModalVideoPlayer ? 'open-modal-vp' : ''
      }`}
    >
      <VideoPlayer />
    </div>
  );
}
