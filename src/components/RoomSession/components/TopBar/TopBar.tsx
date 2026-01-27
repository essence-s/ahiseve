'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePeer } from '@/hook/usePeer';
import { usePlayerStore } from '@/store/playerStore';
import { useStreamStore } from '@/store/streamStore';
import { Check, Copy, LogOut, Puzzle, Radio, Users } from 'lucide-react';
import { useState } from 'react';
import { StreamSelector } from '../StreamSelector/StreamSelector';

export function TopBar({ setShowVideoSelectorModal }) {
  const [copied, setCopied] = useState(false);
  // const [showChat, setShowChat] = useState(false);
  const { idPeer, connections } = usePeer();
  const { controlsVisible } = usePlayerStore();

  const [showStreamSelector, setShowStreamSelector] = useState(false);
  // const [showStreamNotification, setShowStreamNotification] = useState(false);
  let { streamingUsers } = useStreamStore((state) => ({
    streamingUsers: state.streamingUsers,
  }));

  const activeStream = Object.entries(streamingUsers).filter(
    ([_, user]: any) => (user.isStream ? user : false)
  );
  const activeStreamLength = activeStream.length;

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
    <>
      {/* Broadcast Selector Modal */}
      {showStreamSelector && (
        <StreamSelector
          onStreamSelect={(broadcast) => {
            // setSelectedStreamVideo({
            //   id: broadcast.id,
            //   title: broadcast.title,
            //   platform: broadcast.platform,
            //   thumbnail: broadcast.thumbnail,
            // });
            // setIsPlaying(true);
            setShowStreamSelector(false);
          }}
          onClose={() => setShowStreamSelector(false)}
        />
      )}

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

            {/* Video Selector Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='relative'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowVideoSelectorModal(true)}
                    className='w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.03] text-white/40 hover:text-white/60 border border-white/[0.08] transition-colors'
                    title='Seleccionar Video'
                  >
                    <Puzzle className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='text-xs'>
                Seleccionar Video
              </TooltipContent>
            </Tooltip>

            {/* Stream Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='relative'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowStreamSelector(!showStreamSelector)}
                    className={`w-9! h-9! rounded-full border transition-all duration-300 relative overflow-hidden group ${
                      activeStreamLength > 0
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:border-emerald-400/80 hover:bg-emerald-500/30 shadow-lg shadow-emerald-500/20'
                        : 'bg-white/[0.03] text-white/40 hover:text-white/60 border-white/[0.08]'
                    }`}
                  >
                    <Radio className='w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10' />
                    {activeStreamLength > 0 && (
                      <>
                        <div className='absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse' />
                        <div className='absolute -inset-4 rounded-full border border-emerald-400/30 group-hover:border-emerald-400/60 animate-pulse' />
                      </>
                    )}
                  </Button>
                  {activeStreamLength > 0 && (
                    <div className='absolute -top-1 -right-1 min-w-max'>
                      <span className='inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 animate-bounce'>
                        {activeStreamLength}
                      </span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className={`text-xs ${
                  activeStreamLength > 0
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                    : ''
                }`}
              >
                {activeStreamLength > 0
                  ? `${activeStreamLength} transmisiones activas`
                  : 'Sin transmisiones'}
              </TooltipContent>
            </Tooltip>

            {/* Chat */}
            {/* <Button
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
            </Button> */}

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
    </>
  );
}
