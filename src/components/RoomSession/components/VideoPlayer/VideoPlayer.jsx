import { usePlayerStore } from '@/store/playerStore';
import { useStreamStore } from '@/store/streamStore';
import { useEffect, useRef } from 'react';
import { PlayerControls } from './PlayerControls';
import './videoPlayer.css';

export default function VideoPlayer() {
  let { activeStreaming } = useStreamStore((state) => ({
    activeStreaming: state.activeStreaming,
  }));
  //   let videoContainer = useRef();
  let refVideoStreamu = useRef();
  const controlsTimeout = useRef();

  let { isPlaying, setControlsVisible, containerFullScreen } = usePlayerStore();

  const fullScreen = () => {
    if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    } else {
      containerFullScreen.current.webkitRequestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
    }
  };

  useEffect(() => {
    refVideoStreamu.current.srcObject = activeStreaming.captScreen?.stream;
    let playPromise = refVideoStreamu.current.play();
    if (playPromise !== undefined) {
      playPromise.then((_) => {}).catch((error) => {});
    }
  }, [activeStreaming]);

  useEffect(() => {
    const el = containerFullScreen?.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(controlsTimeout.current);
    };
  }, [containerFullScreen, isPlaying]);

  return (
    <div
      className='video-player'
      //   ref={videoContainer}
      //   onMouseMove={handleMouseMove}
    >
      <video ref={refVideoStreamu}></video>
      <PlayerControls fullScreen={fullScreen} />
    </div>
  );
}
