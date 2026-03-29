'use client';

import { useState, useCallback } from 'react';
import { X, ArrowRight, Film } from 'lucide-react';
import { VideoDropzone } from './VideoDropzone';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal/Modal';

interface VideoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoReady: (file: File, videoData: VideoData) => void;
}

export interface VideoData {
  id: string;
  title: string;
  file: File;
  duration: number;
  thumbnail?: string;
}

export function VideoUploadModal({
  open,
  onOpenChange,
  onVideoReady,
}: VideoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');

  // Procesar video para obtener duración y thumbnail
  const processVideo = useCallback(
    (file: File): Promise<{ duration: number; thumbnail: string }> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1, video.duration * 0.1); // Ir al 10% del video para thumbnail
        };

        video.onseeked = () => {
          // Crear thumbnail
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            resolve({
              duration: video.duration,
              thumbnail,
            });
          } else {
            resolve({
              duration: video.duration,
              thumbnail: '',
            });
          }
          URL.revokeObjectURL(video.src);
        };

        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          reject(new Error('Error al procesar el video'));
        };

        video.src = URL.createObjectURL(file);
      });
    },
    []
  );

  // Manejar selección de archivo
  const handleFileSelect = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setIsProcessing(true);

      try {
        const { duration, thumbnail } = await processVideo(file);
        setVideoDuration(duration);
        setVideoThumbnail(thumbnail);
      } catch (error) {
        console.error('Error processing video:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [processVideo]
  );

  // Limpiar archivo seleccionado
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setVideoDuration(0);
    setVideoThumbnail('');
  }, []);

  // Confirmar y pasar video
  const handleConfirm = useCallback(() => {
    if (!selectedFile) return;

    const videoData: VideoData = {
      id: `upload-${Date.now()}`,
      title: selectedFile.name.replace(/\.[^/.]+$/, ''), // Quitar extensión
      file: selectedFile,
      duration: videoDuration,
      thumbnail: videoThumbnail,
    };

    onVideoReady(selectedFile, videoData);
    onOpenChange(false);

    // Limpiar estado
    setSelectedFile(null);
    setVideoDuration(0);
    setVideoThumbnail('');
  }, [selectedFile, videoDuration, videoThumbnail, onVideoReady, onOpenChange]);

  // Formatear duración
  const formatDuration = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  if (!open) return null;

  return (
    <Modal className='max-w-xl' onClose={() => onOpenChange(false)}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-white/10'>
        <div className='flex items-center gap-3'>
          <div
            className='w-10 h-10 rounded-xl flex items-center justify-center bg-transparent border border-white/20'
          >
            <Film className='w-5 h-5 text-white' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-white'>Subir video</h2>
            <p className='text-xs text-white/50'>
              Selecciona un archivo de video
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className='w-8 h-8 rounded-full flex items-center justify-center
              text-white/40 hover:text-white/70 hover:bg-white/10 transition-all'
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      {/* Content */}
      <div className='p-4 space-y-4'>
        {/* Dropzone */}
        <VideoDropzone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClearFile={handleClearFile}
        />

        {/* Preview thumbnail */}
        {selectedFile && videoThumbnail && !isProcessing && (
          <div className='relative rounded-xl overflow-hidden border border-white/10'>
            <img
              src={videoThumbnail}
              alt='Video preview'
              className='w-full h-52 object-cover'
            />
            <div className='absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/80 to-transparent'>
              <p className='text-sm font-medium text-white truncate'>
                {selectedFile.name.replace(/\.[^/.]+$/, '')}
              </p>
              {videoDuration > 0 && (
                <p className='text-xs text-white/60'>
                  {formatDuration(videoDuration)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className='flex items-center justify-center gap-3 py-4'>
            <div className='w-5 h-5 border-2 border-white/20 border-t-[#5FD3BC] rounded-full animate-spin' />
            <p className='text-sm text-white/60'>Procesando video...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-4 border-t border-white/10 flex items-center justify-end gap-3'>
        <Button
          variant='ghost'
          onClick={() => onOpenChange(false)}
          className='text-white/60 hover:text-white hover:bg-white/10'
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedFile || isProcessing}
          className='gap-2 transition-all duration-300 disabled:opacity-50 bg-transparent border border-white/30 text-white hover:bg-white/10'
        >
          Continuar
          <ArrowRight className='w-4 h-4' />
        </Button>
      </div>
    </Modal>
  );
}
