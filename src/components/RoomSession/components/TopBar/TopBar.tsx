'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePeer } from '@/hook/usePeer';
import { usePlayerStore } from '@/store/playerStore';
import { Check, Copy, LogOut, MessageCircle, Users } from 'lucide-react';
import { useState } from 'react';

export function TopBar() {
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { idPeer, connections } = usePeer();
  const { controlsVisible } = usePlayerStore();

  const peerId = idPeer;
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
    <div
      className={`absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-transparent via-[#09090b]/80 to-[#09090b] transition-all duration-500 ${
        controlsVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className='flex items-center justify-between'>
        <button
          onClick={handleCopy}
          className='group flex items-center gap-3 px-4 py-2 bg-white/[0.03] rounded-full border border-white/[0.08] hover:border-white/[0.15] transition-all text-left min-w-0 mr-5'
        >
          <div className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
          <span className='text-sm font-mono text-white/50 truncate flex-1'>
            {peerId}
          </span>
          <div className='w-px h-3 bg-white/10' />
          {copied ? (
            <Check className='w-3.5 h-3.5 text-white/60' />
          ) : (
            <Copy className='w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition-colors' />
          )}
        </button>

        <div className='flex items-center gap-1.5'>
          {/* Participants */}
          <div className='flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-full border border-white/[0.08] h-9'>
            {connections.length > 0 && (
              <div className='flex -space-x-1.5'>
                {connections.map((p, i) => (
                  <Tooltip key={p.idPeer}>
                    <TooltipTrigger asChild>
                      <div className='w-6 h-6 rounded-full bg-[#28282a] flex items-center justify-center text-[10px] font-medium text-white/60 border border-[#09090b]'>
                        {/* {p.name[0]} */}
                        {p.idPeer.slice(0, 2)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='text-xs'>
                      {/* {p.name} */}
                      {p.idPeer}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
            <Users className='w-3.5 h-3.5 text-white/30' />
          </div>

          {/* Chat */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setShowChat(!showChat)}
            className={`w-9 h-9 rounded-full ${
              showChat
                ? 'bg-white/10 text-white/70'
                : 'bg-white/[0.03] text-white/40 hover:text-white/60'
            } border border-white/[0.08]`}
          >
            <MessageCircle className='w-4 h-4' />
          </Button>

          {/* Leave */}
          <Button
            variant='ghost'
            size='icon'
            asChild
            className='w-9 h-9 rounded-full bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60 border border-white/[0.08] transition-colors'
          >
            <a href='/'>
              <LogOut className='w-4 h-4' />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
