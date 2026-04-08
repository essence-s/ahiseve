'use client';

import { Modal } from '@/components/Modal/Modal';
import { PAGE_MESSAGE_TYPES } from '@/components/types.d';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, Film, VideoIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type StreamModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DetectedVideoSelector({ isOpen, onClose }: StreamModalProps) {
  const [isDetectorVideoEnabled, setIsDetectorVideoEnabled] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(false);

  const toggleVideoDetector = () => {
    if (isDetectorVideoEnabled) {
      window.postMessage(
        {
          cmd: PAGE_MESSAGE_TYPES.DISABLE_VIDEO_DETECTOR,
        },
        '*'
      );
    } else {
      window.postMessage(
        {
          cmd: PAGE_MESSAGE_TYPES.ENABLE_VIDEO_DETECTOR,
        },
        '*'
      );
    }
    setIsDetectorVideoEnabled((prev) => !prev);
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.source != window) return;

      let { cmd, data } = event.data;
      if (cmd == PAGE_MESSAGE_TYPES.VIDEO_DETECTOR_STATUS) {
        setIsDetectorVideoEnabled(data);
        setSelectedVideo(true);
        // aprovechamos que video detector status solo llega cuando se elijio el video y pedimos informacion del video
        // el resultado llega en el PeerConnection.tsx
        if (data == false) {
          window.postMessage(
            {
              cmd: PAGE_MESSAGE_TYPES.GET_VIDEO_INFO,
              data: '',
            },
            '*'
          );
        }
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return isOpen ? (
    <Modal className='max-w-xl max-h-[85vh] sm:max-h-[80vh]' onClose={onClose}>
      <div className='flex items-center justify-between p-4 sm:p-5 border-b border-white/6'>
        <div className='flex-1 min-w-0'>
          <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
            Detectar video en la página
          </h2>
          <p className='text-xs text-white/40 mt-1'>
            Activa el detector y luego ve a la página donde está el video.
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='w-8 h-8 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300 shrink-0 ml-2'
        >
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='flex-1 p-4 sm:p-5'>
        <div className='space-y-2 text-sm text-gray-400'>
          <p>• Activa el detector y abre la página donde esté el video.</p>
          <p>
            • Aparecerá una interfaz flotante con los videos detectados para que
            elijas uno.
          </p>
          <p>• Al seleccionarlo, la interfaz desaparecerá automáticamente.</p>
        </div>

        {/* Status panel */}
        <div className='mt-6 flex flex-wrap gap-4 bg-[#ffffff05] border border-neutral-800/50 rounded-xl p-5'>
          {/* Left column: Extension + Video */}
          <div className='flex-1 space-y-4'>
            {/* Extension */}
            <div>
              <span className='text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5'>
                Extensión
              </span>
              <div className='flex items-center gap-2'>
                <div className='mt-px w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50' />
                <span className='text-sm font-medium text-emerald-400'>
                  Conectada
                </span>
              </div>
            </div>

            {/* Video */}
            <div>
              <span className='text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5'>
                Vídeo
              </span>
              <div className='flex items-center gap-2'>
                {selectedVideo ? (
                  <>
                    <Check className='mt-px w-3.5 h-3.5 text-white' />
                    <span className='text-sm font-medium text-white'>
                      Seleccionado
                    </span>
                  </>
                ) : (
                  <>
                    <Film className='mt-px w-3.5 h-3.5 text-neutral-500' />
                    <span className='text-sm text-neutral-500'>
                      Sin seleccionar
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className='hidden sm:block w-px bg-neutral-800/70' />

          {/* Right column: Detector + Button */}
          <div className='flex-1 flex flex-col'>
            <div className='mb-3'>
              <span className='text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5'>
                Detector
              </span>
              <div className='flex items-center gap-2'>
                <div
                  className={`mt-px w-2 h-2 rounded-full transition-all ${isDetectorVideoEnabled ? 'bg-white shadow-sm shadow-white/50 animate-pulse' : 'bg-neutral-600'}`}
                />
                <span
                  className={`text-sm font-medium ${isDetectorVideoEnabled ? 'text-white' : 'text-neutral-500'}`}
                >
                  {isDetectorVideoEnabled ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <Button
              onClick={toggleVideoDetector}
              className={`text-xs font-semibold px-4 py-2 h-auto rounded-lg transition-all w-full mt-auto ${
                isDetectorVideoEnabled
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  : 'bg-white hover:bg-neutral-100 text-neutral-900'
              }`}
            >
              {isDetectorVideoEnabled ? 'Desactivar' : 'Activar detector'}
            </Button>
          </div>
        </div>
      </div>

      <div className='border-t border-white/6 p-3 sm:p-4 flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300'
        >
          <ChevronLeft className='w-3.5 h-3.5' />
          Cerrar
        </Button>
      </div>
    </Modal>
  ) : null;
}
