'use client';

import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Link as LinkIcon, Play, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { VideoDropzone } from './VideoDropzone';

interface VideoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoReady: (file: File, videoData: VideoData) => void;
}

export type VideoData = {
  id: string;
  title: string;
  file?: File;
  url?: string;
  duration: number;
  thumbnail?: string;
  source: 'file' | 'url';
};

export function VideoUploadModal({
  open,
  onOpenChange,
  onVideoReady,
}: VideoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
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
          video.currentTime = Math.min(1, video.duration * 0.1);
        };

        video.onseeked = () => {
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

  // Procesar URL de video para obtener solo la duración (sin thumbnail por CORS)
  const processVideoUrl = useCallback(
    async (url: string): Promise<{ duration: number; thumbnail: string }> => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;

        video.onloadedmetadata = () => {
          resolve({ duration: video.duration, thumbnail: '' });
        };

        video.onerror = () => {
          resolve({ duration: 0, thumbnail: '' });
        };
      });
    },
    []
  );

  // Manejar selección de archivo
  const handleFileSelect = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setVideoUrl('');
      setUrlError(null);
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

  // Limpiar selección
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setVideoUrl('');
    setUrlError(null);
    setVideoDuration(0);
    setVideoThumbnail('');
  }, []);

  // Validar URL - extensiones válidas + dominios bloqueados
  const isValidVideoUrl = useCallback(
    (url: string): { valid: boolean; error?: string } => {
      // Validar que sea una URL válida
      try {
        new URL(url);
      } catch {
        return { valid: false, error: 'URL inválida' };
      }

      // Dominios bloqueados (plataformas de streaming)
      const blockedDomains = [
        'youtube.com',
        'youtu.be',
        'youtube.es',
        'vimeo.com',
        'dailymotion.com',
        'twitch.tv',
        'facebook.com',
        'instagram.com',
      ];

      const urlLower = url.toLowerCase();
      for (const domain of blockedDomains) {
        if (urlLower.includes(domain)) {
          return {
            valid: false,
            error: 'No se permiten enlaces de plataformas de streaming',
          };
        }
      }

      // Extensiones de video válidas
      const validExtensions = [
        '.mp4',
        '.webm',
        '.ogg',
        '.mov',
        '.avi',
        '.mkv',
        '.m4v',
      ];
      const hasValidExtension = validExtensions.some((ext) =>
        urlLower.endsWith(ext)
      );

      if (!hasValidExtension) {
        return {
          valid: false,
          error:
            'La URL debe ser un archivo de video (.mp4, .webm, .ogg, etc.)',
        };
      }

      return { valid: true };
    },
    []
  );

  // Manejar URL ingresada
  const handleUrlSubmit = useCallback(
    async (url: string) => {
      setUrlError(null);

      // Validar URL antes de procesar
      const validation = isValidVideoUrl(url);
      if (!validation.valid) {
        setUrlError(validation.error || 'URL inválida');
        return;
      }

      setIsProcessing(true);
      setVideoUrl(url);

      try {
        const { duration, thumbnail } = await processVideoUrl(url);
        setVideoDuration(duration);
        setVideoThumbnail(thumbnail);
      } catch (error) {
        setUrlError('No se pudo acceder al video. Verifica la URL.');
        setVideoUrl('');
        setVideoDuration(0);
        setVideoThumbnail('');
      } finally {
        setIsProcessing(false);
      }
    },
    [processVideoUrl, isValidVideoUrl]
  );

  // Confirmar y pasar video
  const handleConfirm = useCallback(() => {
    const hasFile = selectedFile !== null;
    const hasUrl = videoUrl !== '';

    if (!hasFile && !hasUrl) return;

    const title = hasFile
      ? selectedFile.name.replace(/\.[^/.]+$/, '')
      : videoUrl.split('/').pop()?.split('?')[0] || 'Video URL';

    const videoData: VideoData = {
      id: `upload-${Date.now()}`,
      title,
      file: hasFile ? selectedFile : undefined,
      url: hasUrl ? videoUrl : undefined,
      duration: videoDuration,
      thumbnail: videoThumbnail,
      source: hasFile ? 'file' : 'url',
    };

    if (hasFile) {
      onVideoReady(selectedFile, videoData);
    } else if (hasUrl) {
      onVideoReady(new File([], 'video.mp4'), videoData);
    }

    onOpenChange(false);
    setSelectedFile(null);
    setVideoUrl('');
    setVideoDuration(0);
    setVideoThumbnail('');
  }, [
    selectedFile,
    videoUrl,
    videoDuration,
    videoThumbnail,
    onVideoReady,
    onOpenChange,
  ]);

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
          <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-transparent border border-white/20'>
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
      <div className='p-4 space-y-4 overflow-auto'>
        {/* Preview thumbnail de ARCHIVO - ARRIBA de todo */}
        {selectedFile && !isProcessing && (
          <div className='relative rounded-xl overflow-hidden border border-white/10'>
            {videoThumbnail ? (
              <>
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
              </>
            ) : (
              <div className='w-full h-52 bg-white/5 flex items-center justify-center'>
                <div className='text-center'>
                  <p className='text-sm font-medium text-white truncate px-4'>
                    {selectedFile.name.replace(/\.[^/.]+$/, '')}
                  </p>
                  {videoDuration > 0 && (
                    <p className='text-xs text-white/60 mt-1'>
                      {formatDuration(videoDuration)}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* Botón para limpiar */}
            <button
              onClick={handleClearFile}
              className='absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className='flex items-center justify-center gap-3 py-4'>
            <div className='w-5 h-5 border-2 border-white/20 border-t-[#5FD3BC] rounded-full animate-spin' />
            <p className='text-sm text-white/60'>Procesando video...</p>
          </div>
        )}

        {/* Dropzone - siempre visible */}
        <VideoDropzone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClearFile={handleClearFile}
        />

        {/* Divider - siempre visible */}
        <div className='flex items-center gap-3'>
          <div className='flex-1 h-px bg-white/10' />
          <span className='text-xs text-white/40'>o</span>
          <div className='flex-1 h-px bg-white/10' />
        </div>

        {/* Sección URL - siempre visible */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-sm text-white/60'>
            <LinkIcon className='w-4 h-4' />
            <span>Desde URL</span>
          </div>
          <p className='text-xs text-white/40'>
            Ingresa una URL de video (.mp4, .webm, .ogg)
          </p>
          <div className='space-y-2'>
            <input
              type='url'
              placeholder='https://ejemplo.com/video.mp4'
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 text-sm'
            />
            <Button
              onClick={() => handleUrlSubmit(videoUrl)}
              disabled={!videoUrl || isProcessing}
              className='w-full bg-white/10 hover:bg-white/20 text-white border-white/20'
            >
              {isProcessing ? 'Validando...' : 'Validar URL'}
            </Button>
            {urlError && <p className='text-xs text-red-400'>{urlError}</p>}
          </div>

          {/* Preview de URL - pequeño y abajo */}
          {videoUrl && !selectedFile && videoDuration > 0 && !isProcessing && (
            <div className='flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10'>
              <div className='w-8 h-8 rounded bg-white/10 flex items-center justify-center'>
                <Play className='w-4 h-4 text-white/60' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-white truncate'>
                  {videoUrl.split('/').pop()?.split('?')[0] || 'Video URL'}
                </p>
                <p className='text-xs text-white/50'>
                  {formatDuration(videoDuration)}
                </p>
              </div>
              <button
                onClick={() => {
                  setVideoUrl('');
                  setVideoDuration(0);
                }}
                className='w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
          )}
        </div>
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
          disabled={
            (!selectedFile && (!videoUrl || videoDuration === 0)) ||
            isProcessing
          }
          className='gap-2 transition-all duration-300 disabled:opacity-50 bg-transparent border border-white/30 text-white hover:bg-white/10'
        >
          Continuar
          <ArrowRight className='w-4 h-4' />
        </Button>
      </div>
    </Modal>
  );
}
