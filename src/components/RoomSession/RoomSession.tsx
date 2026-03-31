'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { usePeer } from '@/hook/usePeer';
import { usePeerStore } from '@/store/peerStore';
import { usePlayerStore } from '@/store/playerStore';
import { useStreamStore } from '@/store/streamStore';
import { Puzzle, Radio, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetectedVideoSelector } from './components/DetectedVideoSelector/DetectedVideoSelector';
import ModalVideoPlayer from './components/ModalVideoPlayer/ModalVideoPlayer';
import { TopBar } from './components/TopBar/TopBar';
import { VideoUploadModal } from './components/VideoUpload/VideoUpload';
import { UploadedVideoPlayer } from './components/VideoUpload/UploadedVideoPlayer';

export function RoomSession() {
  const { startStream, stopStreaming } = usePeer();
  const idPeer = usePeerStore((state) => state.idPeer);
  const connect = usePeerStore((state) => state.connect);
  const localStream = useStreamStore((state) => state.localStream);

  const { setContainerFullScreen } = usePlayerStore();

  const [showVideoSelectorModal, setShowVideoSelectorModal] = useState(false);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);

  const containerFullScreen = useRef();

  const handleInvite = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const inviteId = params.get('invite');

    if (inviteId && idPeer) {
      connect(inviteId, '', 'info')
        .then(() => {
          console.log('conectado');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSelectOption = async (optionId) => {
    if (optionId == 'stream') {
      try {
        const statusStartStream = await startStream();
        if (statusStartStream.message) {
          setShowVideoSelectorModal(true);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('todavia no implementado');
    }
  };

  const handleVideoReady = (file) => {
    setUploadedVideoFile(file);
  };

  useEffect(() => {
    handleInvite();
  }, [idPeer]);

  useEffect(() => {
    setContainerFullScreen(containerFullScreen);
  }, []);

  return (
    <TooltipProvider>
      <main
        className='relative h-dvh w-screen overflow-hidden'
        ref={containerFullScreen}
      >
        <ModalVideoPlayer />

        {uploadedVideoFile && (
          <UploadedVideoPlayer
            videoFile={uploadedVideoFile}
            // onBack={handleBackToSelection}
          />
        )}

        <VideoUploadModal
          open={showVideoUploadModal}
          onOpenChange={setShowVideoUploadModal}
          onVideoReady={handleVideoReady}
        />

        {/* Top bar */}
        <TopBar setShowVideoSelectorModal={setShowVideoSelectorModal} />

        {/* Main content */}
        <div className='relative flex items-center justify-center h-full p-4 sm:p-6'>
          <div className='flex flex-col items-center gap-6 sm:gap-8 max-w-2xl'>
            <div className='text-center space-y-3'>
              <h2 className='text-3xl sm:text-4xl sm:leading-[1.14] font-bold text-white'>
                Elige un video
              </h2>
              <p className='text-sm sm:text-base text-white/60 max-w-lg mx-auto leading-relaxed'>
                Selecciona desde la extensión de tu navegador o sube un video
                desde tu dispositivo
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3 sm:gap-4 w-full'>
              {/* Opción 1: Extensión */}
              <button
                onClick={() => setShowVideoSelectorModal(true)}
                className='group relative flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-102 bg-[#ffffff0a] border border-white/10 hover:border-white/20'
                style={{
                  boxShadow: `
                    inset -3px -3px 10px rgba(0,0,0,0.25),
                    inset 3px 3px 12px rgba(255,255,255,0.06)
                  `,
                }}
              >
                <div
                  className='absolute -inset-[50%] w-[200%] h-[200%] pointer-events-none'
                  style={{
                    background:
                      'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
                    animation: 'moonFast 10s infinite linear',
                    animationDelay: '0s',
                  }}
                />
                <div className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 bg-black/10 border border-white/2'>
                  <Puzzle className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                </div>
                <div className='relative text-center'>
                  <p className='font-bold text-white text-sm sm:text-base'>
                    Extensión
                  </p>
                  <p className='text-xs text-white/60'>Desde tu navegador</p>
                </div>
              </button>

              {/* Opción 2: Subir archivo */}
              <button
                onClick={() => setShowVideoUploadModal(true)}
                className='group relative flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-102 bg-[#ffffff0a] border border-white/10 hover:border-white/20'
                style={{
                  boxShadow: `
                    inset -3px -3px 10px rgba(0,0,0,0.25),
                    inset 3px 3px 12px rgba(255,255,255,0.06)
                  `,
                }}
              >
                <div
                  className='absolute -inset-[50%] w-[200%] h-[200%] pointer-events-none'
                  style={{
                    background:
                      'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
                    animation: 'moonFast 10s infinite linear',
                    animationDelay: '-9.7s',
                  }}
                />
                <div className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 bg-black/10 border border-white/2'>
                  <Upload className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                </div>
                <div className='relative text-center'>
                  <p className='font-bold text-white text-sm sm:text-base'>
                    Subir video
                  </p>
                  <p className='text-xs text-white/60'>Desde tu dispositivo</p>
                </div>
              </button>
            </div>

            <div className='flex items-center gap-3 text-xs text-white/40 mt-4'>
              <div className='flex-1 h-px bg-white/10' />
              <span>El otro usuario deberá elegir el mismo video</span>
              <div className='flex-1 h-px bg-white/10' />
            </div>
          </div>
        </div>

        {localStream && (
          <div
            className='fixed bottom-6 right-6 z-0 flex items-center gap-3 px-4 py-3 rounded-full backdrop-blur-md transition-all duration-300'
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div className='flex items-center gap-2'>
              <div className='relative w-3 h-3'>
                <div className='absolute inset-0 rounded-full animate-ping bg-white/30' />
                <div className='absolute inset-0 rounded-full bg-white/60' />
              </div>
              <span className='text-xs sm:text-sm font-medium text-white/80'>
                Transmitiendo
              </span>
            </div>
            <button
              onClick={() => stopStreaming()}
              className='ml-2 p-1 rounded-full transition-all hover:scale-110 text-white/40 hover:text-white/70 hover:bg-white/10'
              title='Detener transmisión'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        )}

        {showVideoSelectorModal && (
          <DetectedVideoSelector
            onClose={() => setShowVideoSelectorModal(false)}
          />
        )}

        {/* <Chat showChat={showChat} setShowChat={setShowChat} /> */}
      </main>
    </TooltipProvider>
  );
}
