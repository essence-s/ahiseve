'use client';

import { ImageOff, LoaderCircle } from 'lucide-react';
import type { Tab } from './types/detectedVideoSelector';

type TabsSelectorProps = {
  tabs: Tab[];
  onTabSelect: (tab: Tab) => void;
  selectedTab: Tab | null;
};

export function TabsSelector({
  tabs,
  onTabSelect,
  selectedTab,
}: TabsSelectorProps) {
  const cleanUrl = (url: string) => {
    try {
      const u = new URL(url);
      const host = u.host.replace(/^www\./, '');
      const path = u.pathname.replace(/\/+$/, '');
      return `${host}${path}`;
    } catch {
      return url;
    }
  };

  return (
    <div className='w-full space-y-4 animate-fadeIn'>
      <div className='space-y-2'>
        <p className='text-xs font-medium text-white/50'>
          Pestañas disponibles
        </p>
        {tabs.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => onTabSelect(tab)}
                className={`group flex items-center gap-3 p-3 pr-5 rounded-lg border transition-all duration-300 opacity-0 animate-slideUp cursor-pointer ${
                  selectedTab?.id === tab.id
                    ? 'bg-white/[0.08] border-white/[0.15] shadow-sm shadow-white/[0.05]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0 p-2 ${
                    selectedTab?.id === tab.id
                      ? 'bg-white/[0.1] scale-110'
                      : 'bg-white/[0.05] group-hover:scale-105'
                  }`}
                >
                  {tab.favIconUrl ? (
                    <img
                      src={tab.favIconUrl}
                      className='w-full h-full rounded'
                      crossOrigin='anonymous'
                      alt={tab.title}
                    />
                  ) : (
                    <ImageOff className='w-full h-full text-white opacity-95 rounded-sm' />
                  )}
                </div>
                <div className='flex-1 text-left min-w-0'>
                  <p className='text-sm font-medium text-white/80 truncate'>
                    {tab.title}
                  </p>
                  <p className='text-xs text-white/30 truncate'>
                    {cleanUrl(tab.url)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className='flex justify-center items-center h-48'>
            <LoaderCircle className='animate-spin' />
          </div>
        )}
      </div>
    </div>
  );
}
