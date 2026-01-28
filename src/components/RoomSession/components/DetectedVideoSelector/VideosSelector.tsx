'use client';
import { Button } from '@/components/ui/button';
import { cn, formatTime } from '@/lib/utils';
import { Check, Play } from 'lucide-react';
import { useEffect } from 'react';
import type { Video } from './types/detectedVideoSelector';

type VideosSelectorProps = {
  videos: Video[];
  selectedVideo: Video | null;
  onVideoSelect: (video: Video) => void;
  onConfirm: () => void;
};

export function VideosSelector({
  videos,
  selectedVideo,
  onVideoSelect,
  onConfirm,
}: VideosSelectorProps) {
  useEffect(() => {
    // console.log(videos);
    if (videos.length >= 0 && !selectedVideo) {
      onVideoSelect(videos[0]);
    }
  }, [videos]);

  return (
    <div className='w-full space-y-4 animate-fadeIn'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-xs font-medium text-white/50'>Videos detectados</p>
          <span className='text-xs text-white/30 flex-shrink-0'>
            {videos.length} encontrados
          </span>
        </div>
        <div
          className={`${
            videos.length === 1
              ? 'grid grid-cols-1 max-w-sm mx-auto'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
          } gap-3 max-h-[280px] sm:max-h-[300px] overflow-y-auto p-0.5`}
        >
          {videos.length > 0 &&
            videos.map((video, index) => (
              <button
                key={video.number}
                onClick={() => onVideoSelect(video)}
                className={`group relative rounded-xl overflow-hidden border transition-all duration-300 opacity-0 animate-slideUp cursor-pointer ${
                  selectedVideo?.number === video.number
                    ? 'border-white/[0.2] ring-2 ring-white/[0.2] '
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className='relative w-full aspect-video bg-gradient-to-br from-white/[0.08] to-white/[0.02]'>
                  <img
                    src={video.img || '/placeholder.svg'}
                    alt={video.number}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      selectedVideo?.number === video.number
                        ? 'opacity-80 scale-105'
                        : 'opacity-60 group-hover:opacity-80'
                    }`}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col justify-between p-2 opacity-0 transition-opacity duration-300',
                      selectedVideo?.number === video.number
                        ? 'opacity-100'
                        : 'group-hover:opacity-100 '
                    )}
                  >
                    <div className='flex justify-end'>
                      <span className='px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/70 text-white/90'>
                        {video.number}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <p className='text-[11px] font-medium text-white/90 text-left line-clamp-2'>
                          {formatTime(video.duration)}
                        </p>
                      </div>
                      <Play
                        className='w-3.5 h-3.5 text-white/80 ml-1 flex-shrink-0'
                        fill='currentColor'
                      />
                    </div>
                  </div>

                  {selectedVideo?.number === video.number && (
                    <div className='absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-white/20 backdrop-blur flex items-center justify-center animate-scaleIn'>
                      <Check className='w-3 h-3 text-white/90' />
                    </div>
                  )}
                </div>
              </button>
            ))}
        </div>
      </div>

      {selectedVideo && (
        <div className='pt-2 animate-slideUp'>
          <Button
            onClick={onConfirm}
            className='cursor-pointer w-full h-10 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white/80 text-sm font-medium border border-white/[0.12] transition-all duration-300 hover:shadow-md hover:shadow-white/[0.05]'
          >
            Aceptar "{selectedVideo.number}"
          </Button>
        </div>
      )}
    </div>
  );
}
