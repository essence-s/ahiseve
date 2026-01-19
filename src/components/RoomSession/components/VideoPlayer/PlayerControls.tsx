'use client';

import { PAGE_MESSAGE_TYPES } from '@/components/types.d';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePeer } from '@/hook/usePeer';
import { usePlayerStore } from '@/store/playerStore';
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';

export function PlayerControls({ fullScreen }) {
  // const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(3600);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const { isPlaying, setIsPlaying, controlsVisible, setControlsVisible } =
    usePlayerStore();
  let { sendMessagueAll } = usePeer();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePauseOrPlay = (isPlaying: boolean) => {
    if (isPlaying) {
      handlePlay();
    } else {
      handlePause();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
      action: 'pause',
      status: 'sending',
    });
  };
  const handlePlay = () => {
    setIsPlaying(true);
    sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
      action: 'play',
      status: 'sending',
    });
  };

  const handleFullScreen = () => {
    // setIsPlaying(true)
    fullScreen();
    // sendMessagueAll(PAGE_MESSAGE_TYPES.ELEMENT_ACTION, {
    //   action: 'fullScreen',
    //   status: 'sending',
    // });
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent transition-all duration-500 ${
        controlsVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      <div className='mb-4'>
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={(v) => setCurrentTime(v[0])}
          className='cursor-pointer'
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
              variant='ghost'
              size='icon'
              className='w-9 h-9 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
            >
              {/* <SkipBack className='w-4 h-4' /> */}
              <RotateCcw className='w-4 h-4' />
            </Button>
            <Button
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
  );
}
