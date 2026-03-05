'use client';

import { Podcast as Broadcast, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StreamNotificationProps {
  username: string;
  // platform: string;
  // videoTitle: string;
  onClose?: () => void;
}

export function StreamNotification({
  username: userName,
  // platform,
  // videoTitle,
  onClose,
}: StreamNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 600);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6 md:px-0 transition-all duration-500 ${
        isClosing ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
      }`}
      style={
        isClosing
          ? {
              transform:
                'translate(calc(100vw - 120px), calc(-100vh + 90vh)) scale(0.3)',
            }
          : {}
      }
    >
      <div className='w-full max-w-md'>
        <div
          className={`relative px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-xl rounded-xl border border-white/[0.12] shadow-xl overflow-hidden ${isClosing ? '' : 'animate-slideUp'}`}
        >
          {/* Animated background pulse */}
          <div className='absolute inset-0 bg-gradient-to-r from-white/[0.05] via-transparent to-white/[0.05] opacity-0 animate-pulse' />

          <div className='relative flex items-start gap-3 sm:gap-4'>
            {/* Icon with pulse animation */}
            <div className='flex-shrink-0 mt-0.5 sm:mt-1'>
              <div className='relative'>
                <div className='absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75' />
                <div className='relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/[0.2]'>
                  <Broadcast className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 animate-pulse' />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <p className='text-xs sm:text-sm font-medium text-white/90 truncate'>
                <span className='text-white/70'>{userName}</span>
                <span className='text-white/40'> está transmitiendo</span>
              </p>
              {/* <p className='text-[11px] sm:text-xs text-white/50 mt-0.5 truncate'>
                {videoTitle}
              </p> */}
              {/* <p className='text-[10px] sm:text-[11px] text-white/30 mt-1'>
                {platform}
              </p> */}
            </div>

            <button
              onClick={() => {
                setIsClosing(true);
                setTimeout(() => {
                  setIsVisible(false);
                  onClose?.();
                }, 600);
              }}
              className='flex-shrink-0 mt-0.5 sm:mt-1 p-1 rounded-full text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200'
            >
              <X className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
            </button>
          </div>

          {/* Progress bar */}
          <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/[0.1] via-white/[0.3] to-white/[0.1]'>
            <div className='h-full bg-white/20 animate-pulse animate-progress' />
          </div>
        </div>
      </div>
    </div>
  );
}
