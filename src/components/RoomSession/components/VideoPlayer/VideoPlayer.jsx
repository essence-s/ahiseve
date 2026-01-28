import { useStreamStore } from '@/store/streamStore';
import { useEffect, useRef } from 'react';
import { PlayerControls } from './PlayerControls';
import './videoPlayer.css';

export default function VideoPlayer() {
  let { activeStreaming } = useStreamStore((state) => ({
    activeStreaming: state.activeStreaming,
  }));

  let refVideoStreamu = useRef();

  useEffect(() => {
    refVideoStreamu.current.srcObject = activeStreaming.captScreen?.stream;
    let playPromise = refVideoStreamu.current.play();
    if (playPromise !== undefined) {
      playPromise.then((_) => {}).catch((error) => {});
    }
  }, [activeStreaming]);

  return (
    <div className='video-player'>
      <video ref={refVideoStreamu}></video>
      <PlayerControls />
    </div>
  );
}
