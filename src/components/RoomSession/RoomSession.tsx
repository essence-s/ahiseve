'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePeer } from '@/hook/usePeer';
import { usePlayerStore } from '@/store/playerStore';
import { useStreamStore } from '@/store/streamStore';
import {
  Cast,
  Check,
  ChevronLeft,
  Copy,
  LogOut,
  MessageCircle,
  MonitorPlay,
  Upload,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Chat } from './components/Chat';
import ModalVideoPlayer from './components/ModalVideoPlayer/ModalVideoPlayer';

export function RoomSession() {
  const [copied, setCopied] = useState(false);
  const [activeMethod, setActiveMethod] = useState<
    'none' | 'file' | 'extension' | 'stream'
  >('none');

  const [showChat, setShowChat] = useState(false);
  const {
    idPeer,
    connectPeer,
    connections,
    startStream,
    streamingUser,
    viewStream,
  } = usePeer();
  const { controlsVisible, setContainerFullScreen } = usePlayerStore();

  let { streamingUsers, infoStream } = useStreamStore((state) => ({
    streamingUsers: state.streamingUsers,
    infoStream: state.infoStream,
  }));

  const containerFullScreen = useRef();
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

  const methods = [
    { id: 'stream' as const, icon: Cast, label: 'Transmitir' },
    { id: 'extension' as const, icon: MonitorPlay, label: 'Extensión' },
    { id: 'file' as const, icon: Upload, label: 'Subir' },
  ];

  const handleInvite = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const inviteId = params.get('invite');

    if (inviteId && idPeer) {
      connectPeer(inviteId, '', 'info')
        .then(() => {
          console.log('conectado');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSelectOption = (optionId) => {
    if (optionId == 'stream') {
      startStream();
    } else {
      console.log('todavia no implementado');
    }
  };

  useEffect(() => {
    handleInvite();
  }, [idPeer]);

  useEffect(() => {
    setContainerFullScreen(containerFullScreen);
  }, []);
  // console.log(connections);

  return (
    <TooltipProvider>
      <main
        className='relative h-screen w-screen overflow-hidden'
        style={{ background: '#09090b' }}
        // style={{ background: '#09090bdb' }}
        // onMouseMove={handleMouseMove}
        ref={containerFullScreen}
      >
        <ModalVideoPlayer />
        <div
          className='absolute inset-0 opacity-[0.015]'
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top bar */}
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
              className='group flex items-center gap-3 px-4 py-2 bg-white/[0.03] rounded-full border border-white/[0.08] hover:border-white/[0.15] transition-all'
            >
              <div className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
              <span className='text-sm font-mono text-white/50'>{peerId}</span>
              <div className='w-px h-3 bg-white/10' />
              {copied ? (
                <Check className='w-3.5 h-3.5 text-white/60' />
              ) : (
                <Copy className='w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition-colors' />
              )}
            </button>

            <div className='flex items-center gap-1.5'>
              {/* Participants */}
              <div className='flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-full border border-white/[0.08]'>
                {connections.length > 0 && (
                  <div className='flex -space-x-1.5'>
                    {connections.map((p, i) => (
                      <Tooltip key={p.idPeer}>
                        <TooltipTrigger asChild>
                          {/* <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/60 border border-[#09090b]"> */}
                          <div className='w-6 h-6 rounded-full bg-[#28282a] flex items-center justify-center text-[10px] font-medium text-white/60 border border-[#09090b]'>
                            {/* {p.name[0]} */}
                            do
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

        {/* Main content */}
        <div className='relative flex items-center justify-center h-full'>
          <div className='flex flex-col items-center gap-6'>
            <div className='box-users-transmitting'>
              {Object.entries(streamingUsers).map(([key, value]: any) => {
                return (
                  value.isStream && (
                    <div className='box-is-streaming' key={key}>
                      {value.userStreaming} is transmitting
                      <div
                        className='box-is-streaming__button-view-streaming'
                        onClick={() => viewStream(key)}
                      >
                        watch stream <span></span>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
            <div className='flex gap-2'>
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectOption(method.id)}
                  className='group flex flex-col items-center gap-2.5 p-5 w-28 bg-white/[0.02] rounded-2xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300'
                >
                  <method.icon className='w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors' />
                  <span className='text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors'>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* <Chat showChat={showChat} setShowChat={setShowChat} /> */}
      </main>
    </TooltipProvider>
  );
}
