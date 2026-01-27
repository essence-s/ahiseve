'use client';

import { PAGE_MESSAGE_TYPES } from '@/components/types.d';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TabsSelector } from './TabsSelector';
import { VideosSelector } from './VideosSelector';
import type { Tab, Video } from './types/detectedVideoSelector';

type StreamModalProps = {
  onClose: () => void;
};

export function DetectedVideoSelector({ onClose }: StreamModalProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleTabSelect = (tab: Tab) => {
    setSelectedTab(tab);
    setSelectedVideo(null);
    setVideos([]);
    window.postMessage(
      {
        cmd: PAGE_MESSAGE_TYPES.GET_VIDEOS_DATA,
        data: { tabId: tab.id },
      },
      '*'
    );
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleConfirm = () => {
    if (selectedVideo) {
      console.log('video seleccionado :', selectedVideo);
      console.log('tab seleccionado :', selectedTab);
      const selectedData = {
        number: selectedVideo.number,
        img: selectedVideo.img,
        tabId: selectedTab.id,
        favIconUrl: selectedTab.favIconUrl,
        frameId: selectedVideo.frameId,
      };

      window.postMessage(
        {
          cmd: PAGE_MESSAGE_TYPES.ADD_EVENTS_ELEMENT,
          data: selectedData,
        },
        '*'
      );
      onClose();
    }
  };

  const handleBack = () => {
    if (selectedTab) {
      setSelectedTab(null);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.source != window) return;

      let { cmd, data } = event.data;
      if (cmd == PAGE_MESSAGE_TYPES.RESULT_TABS) {
        setTabs([...data]);
      } else if (cmd == PAGE_MESSAGE_TYPES.RESULT_VIDEOS_DATA) {
        if (data.length > 0) {
          setVideos((state) => {
            if (!state) return;
            return [...state, ...data];
          });
        }
      }
    };

    window.addEventListener('message', messageHandler);
    window.postMessage(
      {
        cmd: PAGE_MESSAGE_TYPES.GET_TABS,
        data: '',
      },
      '*'
    );

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn'>
      <div className='w-full max-w-xl sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-[#09090b] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slideUp'>
        <div className='flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.06]'>
          <div className='flex-1 min-w-0'>
            <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
              {selectedTab ? 'Videos disponibles' : 'Selecciona una pestaña'}
            </h2>
            <p className='text-xs text-white/40 mt-1'>
              {selectedTab
                ? 'Elige el video a sincronizar'
                : 'Elige en qué pestaña esta el video'}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='w-8 h-8 rounded-full text-white/40 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-300 flex-shrink-0 ml-2'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 sm:p-5'>
          {!selectedTab ? (
            <TabsSelector
              tabs={tabs}
              onTabSelect={handleTabSelect}
              selectedTab={selectedTab}
            />
          ) : (
            <VideosSelector
              videos={videos}
              selectedVideo={selectedVideo}
              onVideoSelect={handleVideoSelect}
              onConfirm={handleConfirm}
            />
          )}
        </div>

        <div className='border-t border-white/[0.06] p-3 sm:p-4 flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleBack}
            className='flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-300'
          >
            <ChevronLeft className='w-3.5 h-3.5' />
            {selectedTab ? 'Atrás' : 'Cerrar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
