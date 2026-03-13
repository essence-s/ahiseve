import { usePeerStore } from '@/store/peerStore';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../ui/button';

export function YourLink() {
  const [copied, setCopied] = useState(false);
  const peerId = usePeerStore((state) => state.idPeer);
  const isConnected = !!peerId;
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room?invite=${peerId}`
      : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
            {isConnected ? shareUrl : 'Generando...'}
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

      <Button asChild>
        <a
          href={isConnected ? '/room' : undefined}
          className={twMerge(
            'w-full py-3 bg-white text-black font-medium text-sm rounded-xl transition-all h-auto',
            isConnected
              ? 'hover:bg-white/90'
              : 'opacity-30 cursor-not-allowed pointer-events-none'
          )}
        >
          Iniciar sala
        </a>
      </Button>
    </div>
  );
}
