'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { usePeer } from '@/hook/usePeer';
import { usePlayerStore } from '@/store/playerStore';
import { useStreamStore } from '@/store/streamStore';
import { Cast, MonitorPlay, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetectedVideoSelector } from './components/DetectedVideoSelector/DetectedVideoSelector';
import ModalVideoPlayer from './components/ModalVideoPlayer/ModalVideoPlayer';
import { TopBar } from './components/TopBar/TopBar';

export function RoomSession() {
  const { idPeer, connectPeer, startStream, viewStream } = usePeer();
  const { setContainerFullScreen } = usePlayerStore();

  let { streamingUsers, infoStream } = useStreamStore((state) => ({
    streamingUsers: state.streamingUsers,
    infoStream: state.infoStream,
  }));

  const [showVideoSelectorModal, setShowVideoSelectorModal] = useState(false);
  const containerFullScreen = useRef();

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

  const handleSelectOption = async (optionId) => {
    if (optionId == 'stream') {
      const statusStartStream = await startStream();
      if (statusStartStream.message) {
        setShowVideoSelectorModal(true);
      }
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
        className='relative h-dvh w-screen overflow-hidden'
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
        <TopBar />

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
            <div className='flex gap-2 flex-col sm:flex-row'>
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectOption(method.id)}
                  className='group flex flex-col items-center gap-2.5 p-5 w-28 bg-white/[0.02] rounded-2xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300'
                >
                  {/* <method.icon className='w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors' /> */}
                  <method.icon className='w-5 h-5 opacity-40 group-hover:opacity-55 transition-opacity' />
                  <span className='text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors'>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {showVideoSelectorModal && (
          <DetectedVideoSelector
            onClose={() => setShowVideoSelectorModal(false)}
          />
        )}

        {/* <Chat showChat={showChat} setShowChat={setShowChat} /> */}
      </main>
    </TooltipProvider>
  );
}
