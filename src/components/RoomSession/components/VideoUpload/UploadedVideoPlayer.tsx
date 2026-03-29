'use client';

import { Slider } from '@/components/ui/slider';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UploadedVideoPlayerProps {
  videoFile: File;
  onBack?: () => void;
}

export function UploadedVideoPlayer({
  videoFile,
  onBack,
}: UploadedVideoPlayerProps) {
  // Estados del reproductor
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<any>();

  // Estado para la URL del video (usar useState para trigger re-render)
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Crear URL del video al montar
  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying || !showControls) return;

    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
      setShowSettings(false);
    }, 3000);

    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying, showControls]);

  // Escuchar cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(10);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-10);
          break;
        case 'm':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Formatear tiempo
  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // Controles de reproducción
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + seconds
      )
    );
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    setVolume((prev) => Math.max(0, Math.min(100, prev + delta)));
    setIsMuted(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  }, []);

  // Eventos del video
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Actualizar buffer
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(
        videoRef.current.buffered.length - 1
      );
      setBuffered((bufferedEnd / videoRef.current.duration) * 100);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Actualizar volumen del video
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume / 100;
    videoRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // Actualizar velocidad de reproducción
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full bg-black overflow-hidden select-none'
      onMouseMove={handleMouseMove}
      onClick={() => setShowControls(true)}
    >
      {/* Video element - solo renderizar cuando tenemos URL válida */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className='w-full h-full object-contain'
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          playsInline
        />
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
          <div className='w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin' />
        </div>
      )}

      {/* Overlay oscuro con controles */}
      <div
        className={`absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Botón central play/pause */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-sm
              flex items-center justify-center transition-all duration-200
              hover:bg-black/60 hover:scale-105 active:scale-95'
          >
            {isPlaying ? (
              <Pause
                className='w-7 h-7 sm:w-8 sm:h-8 text-white'
                fill='currentColor'
              />
            ) : (
              <Play
                className='w-7 h-7 sm:w-8 sm:h-8 text-white ml-1'
                fill='currentColor'
              />
            )}
          </button>
        </div>

        {/* Bottom controls */}
        <div className='absolute bottom-0 left-0 right-0 p-4 space-y-3'>
          {/* Progress bar */}
          <div className='relative w-full h-1 group'>
            {/* Buffer bar */}
            <div
              className='absolute inset-y-0 left-0 bg-white/20 rounded-full'
              style={{ width: `${buffered}%` }}
            />
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className='cursor-pointer'
            />
          </div>

          {/* Controls row */}
          <div className='flex items-center justify-between gap-2'>
            {/* Left controls */}
            <div className='flex items-center gap-1 sm:gap-2'>
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className='w-9 h-9 rounded-full flex items-center justify-center
                  text-white/80 hover:bg-white/10 transition-colors'
              >
                {isPlaying ? (
                  <Pause className='w-5 h-5' fill='currentColor' />
                ) : (
                  <Play className='w-5 h-5 ml-0.5' fill='currentColor' />
                )}
              </button>

              {/* Skip back */}
              <button
                onClick={() => skip(-10)}
                className='w-9 h-9 rounded-full flex items-center justify-center
                  text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors'
              >
                <SkipBack className='w-4 h-4' />
              </button>

              {/* Skip forward */}
              <button
                onClick={() => skip(10)}
                className='w-9 h-9 rounded-full flex items-center justify-center
                  text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors'
              >
                <SkipForward className='w-4 h-4' />
              </button>

              {/* Volume */}
              <div className='hidden sm:flex items-center gap-1 group/volume'>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className='w-9 h-9 rounded-full flex items-center justify-center
                    text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors'
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className='w-4 h-4' />
                  ) : (
                    <Volume2 className='w-4 h-4' />
                  )}
                </button>
                <div className='w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-200'>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className='cursor-pointer'
                  />
                </div>
              </div>

              {/* Time */}
              <span className='text-xs sm:text-sm text-white/60 font-mono ml-2'>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className='flex items-center gap-1'>
              {/* Settings */}
              <div className='relative'>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className='w-9 h-9 rounded-full flex items-center justify-center
                    text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors'
                >
                  <Settings className='w-4 h-4' />
                </button>

                {/* Settings menu */}
                {showSettings && (
                  <div
                    className='absolute bottom-full right-0 mb-2 p-2 rounded-lg
                      bg-black/90 border border-white/10 backdrop-blur-sm min-w-35'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className='text-xs text-white/50 px-2 pb-1 mb-1 border-b border-white/10'>
                      Velocidad
                    </p>
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          setShowSettings(false);
                        }}
                        className={`w-full px-2 py-1.5 text-left text-sm rounded transition-colors ${
                          playbackRate === rate
                            ? 'text-[#5FD3BC] bg-[#5FD3BC]/10'
                            : 'text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className='w-9 h-9 rounded-full flex items-center justify-center
                  text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors'
              >
                {isFullscreen ? (
                  <Minimize className='w-4 h-4' />
                ) : (
                  <Maximize className='w-4 h-4' />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
