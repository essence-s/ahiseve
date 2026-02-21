import { useStreamStore } from '@/store/streamStore';
import { useEffect, useRef } from 'react';
import { PlayerControls } from './PlayerControls';
import './videoPlayer.css';

export default function VideoPlayer() {
  const remoteStream = useStreamStore((state) => state.remoteStream);

  let refVideoStreamu = useRef();

  useEffect(() => {
    refVideoStreamu.current.srcObject = remoteStream.stream;
    let playPromise = refVideoStreamu.current.play();
    if (playPromise !== undefined) {
      playPromise.then((_) => {}).catch((error) => {});
    }
  }, [remoteStream]);

  return (
    <div className='video-player'>
      <video ref={refVideoStreamu}></video>
      <PlayerControls />
    </div>
  );
}
