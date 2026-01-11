'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, ArrowRight, Users, Wifi } from 'lucide-react';
import { usePeer } from '@/hook/usePeer';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface HomeScreenProps {
  // peerId: string;
  // isConnected: boolean;
  onJoin: (code: string) => void;
  onStart: () => void;
}

export function HomeScreen({
  // peerId,
  // isConnected,
  onJoin,
  onStart,
}: HomeScreenProps) {
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'invite' | 'join'>('invite');

  let { idPeer: peerId, createServer } = usePeer();
  const isConnected = !!peerId;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}?room=${peerId}`
      : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (joinCode.trim().length >= 3) {
      onJoin(joinCode.trim());
    }
  };

  useEffect(() => {
    createServer();
  }, []);

  return (
    <main className='relative h-screen w-screen overflow-hidden '>
      {/* bg-[#09090b] */}
      {/* Subtle gradient background */}
      <Tooltip>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
      <div className='absolute inset-0'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] rounded-full blur-[120px]' />
      </div>

      {/* Dot pattern */}
      <div
        className='absolute inset-0 opacity-[0.4]'
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className='relative z-0 flex flex-col items-center justify-center h-full px-6'>
        {/* Logo */}
        <div className='flex items-center gap-2.5 mb-12'>
          <div className='w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center'>
            <svg
              className='w-4.5 h-4.5 text-white/80'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
            </svg>
          </div>
          <span className='text-lg font-medium text-white/90 tracking-tight'>
            ahiseve
          </span>
        </div>

        {/* Main card */}
        <div className='w-full max-w-xs'>
          <div className='bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5'>
            {/* Mode toggle */}
            <div className='flex bg-white/[0.04] rounded-lg p-1 mb-5'>
              <button
                onClick={() => setMode('invite')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'invite'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Users className='w-3.5 h-3.5' />
                Invitar
              </button>
              <button
                onClick={() => setMode('join')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'join'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <ArrowRight className='w-3.5 h-3.5' />
                Unirse
              </button>
            </div>

            {/* Invite mode */}
            {mode === 'invite' && (
              <div className='space-y-3'>
                <div
                  onClick={handleCopy}
                  className='group flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.1] transition-all'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] uppercase tracking-wider text-white/30 mb-1'>
                      Tu enlace
                    </p>
                    <p className='text-sm text-white/70 font-mono truncate'>
                      {isConnected ? shareUrl : 'Conectando...'}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg transition-all ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/[0.06] text-white/50 group-hover:text-white/80'
                    }`}
                  >
                    {copied ? (
                      <Check className='w-4 h-4' />
                    ) : (
                      <Copy className='w-4 h-4' />
                    )}
                  </div>
                </div>

                <button
                  onClick={onStart}
                  disabled={!isConnected}
                  className='w-full py-3 bg-white text-black font-medium text-sm rounded-xl hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
                  Iniciar sala
                </button>
              </div>
            )}

            {/* Join mode */}
            {mode === 'join' && (
              <div className='space-y-3'>
                <input
                  type='text'
                  placeholder='Pegar código o enlace'
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className='w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/[0.15] transition-all'
                />

                <button
                  onClick={handleJoin}
                  disabled={joinCode.length < 3}
                  className='w-full py-3 bg-white text-black font-medium text-sm rounded-xl hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
                  Entrar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className='mt-6 flex items-center gap-2'>
          <div className='relative flex items-center justify-center w-5 h-5'>
            {isConnected ? (
              <>
                <span className='absolute w-2 h-2 bg-emerald-400 rounded-full' />
                <span className='absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-50' />
              </>
            ) : (
              <Wifi className='w-3.5 h-3.5 text-white/30 animate-pulse' />
            )}
          </div>
          <span className='text-xs text-white/30'>
            {isConnected ? peerId : 'Conectando...'}
          </span>
        </div>
      </div>
    </main>
  );
}
