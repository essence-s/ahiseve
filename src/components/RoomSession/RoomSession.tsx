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

export function RoomSession() {
  const { startStream, stopStreaming } = usePeer();
  const idPeer = usePeerStore((state) => state.idPeer);
  const connect = usePeerStore((state) => state.connect);
  const localStream = useStreamStore((state) => state.localStream);

  const { setContainerFullScreen } = usePlayerStore();

  const [showVideoSelectorModal, setShowVideoSelectorModal] = useState(false);
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
                className='group relative flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 bg-[#ffffff0a] border border-white/6'
              >
                <div
                  className='absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300'
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, rgba(255, 212, 225, 0.06), transparent)',
                  }}
                />
                <div
                  className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300'
                  style={{
                    background:
                      'linear-gradient(135deg, #FFD4E1 0%, #F0D4E8 100%)',
                    boxShadow: '0 2px 10px rgba(255, 212, 225, 0.10)',
                  }}
                >
                  <Puzzle className='w-7 h-7 sm:w-8 sm:h-8 text-[#292529] drop-shadow-lg' />
                </div>
                <div className='relative text-center'>
                  <p
                    className='font-bold text-white text-sm sm:text-base'
                    style={{ color: '#FFD4E1' }}
                  >
                    Extensión
                  </p>
                  <p className='text-xs text-white/60'>Desde tu navegador</p>
                </div>
              </button>

              {/* Opción 2: Subir archivo */}
              <button
                // onClick={handleFileSelected}
                className='group relative flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 bg-[#ffffff0a] border border-white/6'
              >
                <div
                  className='absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300'
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, rgba(255, 244, 212, 0.06), transparent)',
                  }}
                />
                <div
                  className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300'
                  style={{
                    background:
                      'linear-gradient(135deg, #FFF4D4 0%, #FFE8B8 100%)',
                    boxShadow: '0 2px 10px rgba(255, 244, 212, 0.10)',
                  }}
                >
                  <Upload className='w-7 h-7 sm:w-8 sm:h-8 text-[#2b2825] drop-shadow-lg' />
                </div>
                <div className='relative text-center'>
                  <p
                    className='font-bold text-white text-sm sm:text-base'
                    style={{ color: '#FFF4D4' }}
                  >
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

        {!localStream ? (
          <button
            // onClick={() => setShowTransmissionModal(true)}
            onClick={() => handleSelectOption('stream')}
            className='fixed bottom-6 right-6 z-0 group'
            title='Iniciar transmisión'
          >
            <div
              className='absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300'
              style={{
                background: 'radial-gradient(circle, #FFD4E1 0%, #D4F9E0 100%)',
              }}
            />
            <div
              className='relative flex items-center justify-center w-12 h-12 rounded-full overflow-hidden transition-all duration-300 hover:scale-105'
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 212, 225, 0.15) 0%, rgba(212, 249, 224, 0.1) 100%)',
                border: '1px solid rgba(255, 212, 225, 0.2)',
                boxShadow: 'inset 0 0 12px rgba(212, 249, 224, 0.05)',
              }}
            >
              <Radio className='w-5 h-5 text-white/70 drop-shadow-lg' />
            </div>
          </button>
        ) : (
          <div
            className='fixed bottom-6 right-6 z-0 flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-full backdrop-blur-md transition-all duration-300'
            style={{
              background:
                'radial-gradient(circle at 30% 40%, rgba(253, 70, 164, 0.23) 0%, rgba(242, 70, 135, 0.21) 25%, rgba(242, 77, 155, 0.2) 40%, rgba(247, 76, 149, 0.21) 60%, rgba(246, 118, 190, 0.21) 100%)',
              border: '1px solid rgba(255, 150, 150, 0.3)',
            }}
          >
            <div className='flex items-center gap-2'>
              <div className='relative w-3 h-3'>
                <div
                  className='absolute inset-0 rounded-full animate-ping'
                  style={{
                    background:
                      'linear-gradient(135deg, #FF6482 0%, #FFB3BA 100%)',
                  }}
                />
                <div
                  className='absolute inset-0 rounded-full'
                  style={{
                    background:
                      'linear-gradient(135deg, #FF6482 0%, #FF9AA2 50%, #FFB3BA 100%)',
                  }}
                />
              </div>
              <span className='text-xs sm:text-sm font-bold text-[#d1b9c7]'>
                Transmitiendo
              </span>
            </div>
            <button
              onClick={() => stopStreaming()}
              className='ml-2 p-1 rounded-full transition-all hover:scale-110 text-[#FF9AA2] bg-[#ff969626]'
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
