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
  if (!isOpenModalVideoPlayer) return null;
  return (
    <div className='modal-video-player animate-in fade-in-0 duration-300'>
      <VideoPlayer />
    </div>
  );
}
