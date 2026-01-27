'use client';

import { Button } from '@/components/ui/button';
import { usePeer } from '@/hook/usePeer';
import { useStreamStore } from '@/store/streamStore';
import { Radio, X } from 'lucide-react';
import { useState } from 'react';

interface Stream {
  id: string;
  userName: string;
  title: string;
  thumbnail: string;
  startTime: string;
  isActive: boolean;
}

interface StreamSelectorProps {
  onStreamSelect: (broadcast: Stream) => void;
  onClose: () => void;
}

export function StreamSelector({
  onStreamSelect,
  onClose,
}: StreamSelectorProps) {
  const [broadcasts, setBroadcasts] = useState<Stream[]>();
  const [selectedId, setSelectedId] = useState<string | null>();
  let { streamingUsers, infoStream } = useStreamStore((state) => ({
    streamingUsers: state.streamingUsers,
    infoStream: state.infoStream,
  }));
  const { viewStream } = usePeer();

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl max-h-[90vh] bg-[#09090b] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col animate-in fade-in-0 duration-300'>
        {/* Header */}
        <div className='p-4 sm:p-6 border-b border-white/[0.08] flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {/* <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' /> */}

            <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
              Transmisiones activas
            </h2>
            <span className='text-xs sm:text-sm text-white/50'>
              {
                Object.entries(streamingUsers).map(
                  ([_, user]: any) => user.isStream
                ).length
              }
            </span>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
          >
            <X className='w-4 h-4 sm:w-5 sm:h-5' />
          </Button>
        </div>

        {/* Broadcasts Grid */}
        <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
          {Object.entries(streamingUsers).length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              {Object.entries(streamingUsers).map(
                ([key, value]: any) =>
                  value.isStream && (
                    <button
                      key={key}
                      // onClick={() => handleSelectBroadcast(broadcast)}
                      onClick={() => viewStream(key)}
                      className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                        selectedId === key
                          ? 'ring-2 ring-white/30 scale-105'
                          : 'hover:ring-1 hover:ring-white/20'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className='aspect-video bg-white/[0.02] relative overflow-hidden'>
                        <img
                          // src={broadcast.thumbnail || '/placeholder.png'}
                          src={'/placeholder.png'}
                          alt={value.userStreaming}
                          className='w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

                        {/* Live badge */}
                        <div className='absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full'>
                          <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                          <span className='text-[10px] sm:text-xs font-medium text-emerald-400'>
                            EN VIVO
                          </span>
                        </div>

                        {/* Selection indicator */}
                        {/* {selectedId === broadcast.id && (
                          <div className='absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 border border-white/30 flex items-center justify-center'>
                            <div className='w-3 h-3 rounded-full bg-white' />
                          </div>
                        )} */}

                        {/* Info overlay */}
                        <div className='absolute bottom-0 left-0 right-0 p-2 sm:p-3'>
                          <div className='flex items-center justify-between mt-1'>
                            <div className='flex items-center gap-1.5 min-w-0'>
                              <div className='w-4 h-4 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-[10px] font-medium text-white/80'>
                                {value.userStreaming[0]}
                              </div>
                              <span className='text-[10px] sm:text-xs text-white/70 truncate'>
                                {value.userStreaming}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
              )}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Radio className='w-8 h-8 text-white/20 mb-2' />
              <p className='text-white/50 text-sm'>
                No hay transmisiones activas
              </p>
            </div>
          )}
        </div>

        {/* Footer with info */}
        <div className='border-t border-white/[0.08] p-3 sm:p-4 bg-white/[0.01]'>
          <p className='text-[10px] sm:text-xs text-white/40'>
            {selectedId
              ? `Seleccionaste: ${
                  broadcasts.find((b) => b.id === selectedId)?.userName
                }`
              : 'Selecciona una transmisión para ver'}
          </p>
        </div>
      </div>
    </div>
  );
}
