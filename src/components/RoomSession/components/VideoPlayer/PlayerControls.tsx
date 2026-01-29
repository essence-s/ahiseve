'use client';

import { PAGE_MESSAGE_TYPES } from '@/components/types.d';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePeer } from '@/hook/usePeer';
import { formatTime } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export function PlayerControls() {
  // const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  // const [controlsVisible, setControlsVisible] = useState(true);

  const {
    isPlaying,
    setIsPlaying,
    controlsVisible,
    setControlsVisible,
    seekValue,
    containerFullScreen,
  } = usePlayerStore();

  const [skipFeedback, setSkipFeedback] = useState<'rewind' | 'forward' | null>(
    null
  );
  const [skipSeconds, setSkipSeconds] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const controlsTimeout = useRef<any>();
  const feedbackTimeout = useRef<any>();
  const lastTapTime = useRef(0);
  const tapPosition = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  let { sendMessagueAll, elementAction } = usePeer();
  const { playerInfo } = usePlayerStore();

  const handlePauseOrPlay = (isPlaying: boolean) => {
    if (isPlaying) {
      handlePlay();
    } else {
      handlePause();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    // clear();
    sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
      action: 'pause',
      status: 'sending',
    });
  };
  const handlePlay = () => {
    setIsPlaying(true);
    // addSetInterval();
    sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
      action: 'play',
      status: 'sending',
    });
  };

  const handleSeek = (modeSeek: any) => {
    let dataSeek =
      modeSeek == 'back' ? parseInt(seekValue) * -1 : parseInt(seekValue);

    setCurrentTime((prev) => {
      return Math.max(0, prev + dataSeek);
    });
    // console.log(modeSeek)
    sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
      action: 'seeked',
      status: 'sending',
      dataSeek,
    });
  };

  const handleSeekCurrentTime = (v) => {
    sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
      action: 'seeked',
      status: 'sending',
      mediaCurrentTime: v[0],
    });
    setCurrentTime(v[0]);
    //  setIsDraggingSlider(true);
  };

  const handleFullScreen = () => {
    const doc: any = document;
    const elem: any = containerFullScreen.current;
    const orientation = (screen as any).orientation;

    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen).call(doc);

      if (orientation && orientation.unlock) {
        orientation.unlock();
      }
    } else {
      (elem.requestFullscreen ?? elem.webkitRequestFullscreen).call(elem);

      if (orientation && orientation.lock) {
        orientation.lock('landscape').catch(() => {});
      }
    }
  };

  const intervalRef = useRef(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const addSetInterval = () => {
    clear();
    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        // console.log('prev, duration', prev, duration);
        if (prev >= duration) {
          clear();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!playerInfo) return;
    setDuration(playerInfo.duration);
    setCurrentTime(playerInfo.currentTime);
    setIsPlaying(!playerInfo.paused);
  }, [playerInfo]);

  useEffect(() => {
    if (elementAction) {
      if (elementAction.action == 'play') {
        setIsPlaying(true);
      } else if (elementAction.action == 'pause') {
        setIsPlaying(false);
      } else if (
        elementAction.action == 'seeked' &&
        elementAction.mediaCurrentTime
      ) {
        if (elementAction.mediaCurrentTime !== undefined) {
          setCurrentTime(elementAction.mediaCurrentTime);
        }
      }
    }
  }, [elementAction]);

  useEffect(() => {
    if (!isPlaying) {
      clear();
      return;
    }

    if (duration <= 0) return;
    addSetInterval();
    return () => clear();
  }, [isPlaying, duration]);

  // Auto-hide controls cuando está reproduciendo
  useEffect(() => {
    if (!isPlaying || !controlsVisible) return;

    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);

    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying, controlsVisible]);

  // Limpiar feedback de skip después de animación
  useEffect(() => {
    if (!skipFeedback) return;

    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => {
      setSkipFeedback(null);
    }, 500);

    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, [skipFeedback]);

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      setControlsVisible(true);
    };
  }, []);

  // Detectar doble Click para saltos
  const handlePlayerClick = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      e.preventDefault();
      e.stopPropagation();
      if (!playerRef.current) return;

      const rect = playerRef.current.getBoundingClientRect();
      let tapX: number;

      if ('touches' in e) {
        tapX = e.touches[0].clientX - rect.left;
      } else {
        tapX = e.clientX - rect.left;
      }

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;
      const isDoubleTap =
        timeSinceLastTap < 300 && Math.abs(tapPosition.current.x - tapX) < 100;

      if (isDoubleTap) {
        lastTapTime.current = 0;

        if (tapX < rect.width / 3) {
          handleSeek('back');
          // const newTime = Math.max(0, currentTime - 10);

          // setCurrentTime(newTime);
          setSkipFeedback('rewind');
          setSkipSeconds(10);
        } else if (tapX > (rect.width * 2) / 3) {
          handleSeek('next');
          // const newTime = Math.min(duration, currentTime + 10);
          // setCurrentTime(newTime);
          setSkipFeedback('forward');
          setSkipSeconds(10);
        }

        setControlsVisible(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        if (isPlaying) {
          controlsTimeout.current = setTimeout(
            () => setControlsVisible(false),
            3000
          );
        }
      } else {
        lastTapTime.current = now;
        tapPosition.current = { x: tapX, y: 0 };

        setControlsVisible((prev) => !prev);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);

        if (isPlaying && !controlsVisible) {
          controlsTimeout.current = setTimeout(
            () => setControlsVisible(false),
            3000
          );
        }
      }
    },
    [isPlaying, currentTime, duration, controlsVisible]
  );

  const handlePlayerTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = playerRef.current.getBoundingClientRect();
    const now = Date.now();
    const touchX = e.changedTouches[0].clientX;

    const timeSinceLastTap = now - lastTapTime.current;
    const isDoubleTap =
      timeSinceLastTap < 300 && Math.abs(tapPosition.current.x - touchX) < 100;

    if (isDoubleTap) {
      lastTapTime.current = 0;

      if (touchX < rect.width / 3) {
        handleSeek('back');
        setSkipFeedback('rewind');
        setSkipSeconds(10);
      } else if (touchX > (rect.width * 2) / 3) {
        handleSeek('next');
        setSkipFeedback('forward');
        setSkipSeconds(10);
      }

      setControlsVisible(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (isPlaying) {
        controlsTimeout.current = setTimeout(
          () => setControlsVisible(false),
          3000
        );
      }
    } else {
      lastTapTime.current = now;
      tapPosition.current = { x: touchX, y: 0 };

      setControlsVisible((prev) => !prev);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);

      if (isPlaying && controlsVisible) {
        controlsTimeout.current = setTimeout(
          () => setControlsVisible(false),
          3000
        );
      }
    }
  };

  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (isPlaying) {
      controlsTimeout.current = setTimeout(
        () => setControlsVisible(false),
        3000
      );
    }
  }, [isPlaying]);

  return (
    <div className=''>
      <div
        ref={playerRef}
        className='w-full h-full flex flex-col items-center justify-center absolute top-0 left-0 touch-none select-none'
        onClick={handlePlayerClick}
        onTouchEnd={handlePlayerTouch}
        onMouseMove={handleMouseMove}
        role='application'
        aria-label='Video player'
      >
        {/* Overlay oscuro cuando hay controles */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none z-5 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Central Play/Pause Button - Minimalista y clickeable solo en el círculo */}
        {controlsVisible && (
          <div
            className='absolute flex items-center justify-center pointer-events-auto z-10'
            style={{ pointerEvents: 'auto' }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePauseOrPlay(!isPlaying);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePauseOrPlay(!isPlaying);
              }}
              className='relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 flex items-center justify-center transition-all duration-150 hover:bg-black/60 active:scale-95 backdrop-blur-sm cursor-pointer'
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause
                  className='w-7 h-7 sm:w-8 sm:h-8 text-white/80'
                  fill='currentColor'
                />
              ) : (
                <Play
                  className='w-7 h-7 sm:w-8 sm:h-8 text-white/80 ml-0.5'
                  fill='currentColor'
                />
              )}
            </button>
          </div>
        )}

        {/* Skip feedback - simplificado y minimalista */}
        {skipFeedback === 'rewind' && (
          <div className='absolute inset-0 flex items-center justify-start pl-4 sm:pl-6 pointer-events-none z-20'>
            <div className='animate-pulse-out flex flex-col items-center gap-2'>
              <div className='w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm'>
                <SkipBack className='w-5 h-5 sm:w-6 sm:h-6 text-white/80' />
              </div>
              <span className='text-xs sm:text-sm font-medium text-white/80'>
                -{skipSeconds}s
              </span>
            </div>
          </div>
        )}

        {skipFeedback === 'forward' && (
          <div className='absolute inset-0 flex items-center justify-end pr-4 sm:pr-6 pointer-events-none z-20'>
            <div className='animate-pulse-out flex flex-col items-center gap-2'>
              <div className='w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm'>
                <SkipForward className='w-5 h-5 sm:w-6 sm:h-6 text-white/80' />
              </div>
              <span className='text-xs sm:text-sm font-medium text-white/80'>
                +{skipSeconds}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-transparent transition-all duration-300 ${
          controlsVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className='mb-3 sm:mb-4 flex items-center'>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeekCurrentTime}
            onMouseUp={() => setIsDraggingSlider(false)}
            onTouchEnd={() => setIsDraggingSlider(false)}
            className='cursor-pointer flex-1'
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handlePauseOrPlay(!isPlaying)}
              className='w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-white/70 cursor-pointer'
            >
              {isPlaying ? (
                <Pause className='w-4 h-4' fill='currentColor' />
              ) : (
                <Play className='w-4 h-4 ml-0.5' fill='currentColor' />
              )}
            </Button>
            <div className='flex'>
              <Button
                onClick={() => handleSeek('back')}
                variant='ghost'
                size='icon'
                className='w-9 h-9 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
              >
                {/* <SkipBack className='w-4 h-4' /> */}
                <RotateCcw className='w-4 h-4' />
              </Button>
              <Button
                onClick={() => handleSeek('next')}
                variant='ghost'
                size='icon'
                className='w-9 h-9 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
              >
                {/* <SkipForward className='w-4 h-4' /> */}
                <RotateCw className='w-4 h-4' />
              </Button>
            </div>

            <span className='text-xs text-white/40 font-mono ml-3'>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className='flex items-center gap-1'>
            <div className='flex items-center gap-1 group'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsMuted(!isMuted)}
                className='w-9 h-9 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className='w-4 h-4' />
                ) : (
                  <Volume2 className='w-4 h-4' />
                )}
              </Button>
              <div className='w-0 group-hover:w-20 overflow-hidden transition-all duration-300'>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(v) => {
                    setVolume(v[0]);
                    setIsMuted(false);
                  }}
                  className='cursor-pointer slider-no-thumb'
                />
              </div>
            </div>

            {/* <Button
            variant='ghost'
            size='icon'
            className='w-9 h-9 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
          >
            <Settings className='w-4 h-4' />
          </Button> */}

            <Button
              onClick={handleFullScreen}
              variant='ghost'
              size='icon'
              className='w-9 h-9 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
            >
              <Maximize className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
