'use client';

import { Modal } from '@/components/Modal/Modal';
import { PAGE_MESSAGE_TYPES } from '@/components/types.d';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type StreamModalProps = {
  onClose: () => void;
};

export function DetectedVideoSelector({ onClose }: StreamModalProps) {
  const [isDetectorVideoEnabled, setIsDetectorVideoEnabled] = useState(false);
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

  return (
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

        <div
          className={`mt-6 flex items-center gap-3 p-4 transition-all border border-white/6 rounded-lg ${isDetectorVideoEnabled && 'bg-[#49ffb30e]'}`}
        >
          <div className='flex items-center gap-2 flex-1'>
            {isDetectorVideoEnabled ? (
              <div className='relative w-2 h-2'>
                <span className='absolute w-2 h-2 bg-emerald-400 rounded-full' />
                <span className='absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-50' />
              </div>
            ) : (
              <div className='w-2 h-2 rounded-full transition-all bg-gray-600' />
            )}

            <span
              className={`text-sm font-medium ${isDetectorVideoEnabled ? 'text-white' : 'text-gray-400'}`}
            >
              {isDetectorVideoEnabled ? 'Detector Activo' : 'Detector Inactivo'}
            </span>
          </div>
          <Button
            onClick={toggleVideoDetector}
            className='font-semibold px-4 py-2 rounded-lg transition-all text-sm bg-white hover:bg-gray-100 text-black hover:shadow-lg'
          >
            {isDetectorVideoEnabled ? 'Desactivar' : 'Activar'}
          </Button>
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
  );
}
