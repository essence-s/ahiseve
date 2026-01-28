'use client';

import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { useState } from 'react';

export function Chat({ showChat, setShowChat }) {
  const [chatMessage, setChatMessage] = useState('');
  const [messages] = useState([
    { id: 1, user: 'Pablo', text: 'Listo para empezar!', time: '12:30' },
    { id: 2, user: 'Tú', text: 'Dale, inicio el video', time: '12:31' },
  ]);
  return (
    <div
      className={`absolute z-20 top-0 right-0 bottom-0 w-72 bg-[#09090b]/98 backdrop-blur-xl border-l border-white/[0.06] flex flex-col transition-transform duration-300 ${
        showChat ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className='p-4 border-b border-white/[0.06] flex items-center justify-between'>
        <span className='text-sm font-medium text-white/70'>Chat</span>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setShowChat(false)}
          className='w-7 h-7 rounded-full text-white/30 hover:text-white/50'
        >
          <X className='w-3.5 h-3.5' />
        </Button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.user === 'Tú' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl ${
                msg.user === 'Tú'
                  ? 'bg-white/[0.08] text-white/80'
                  : 'bg-white/[0.04] text-white/70'
              }`}
            >
              <p className='text-xs'>{msg.text}</p>
            </div>
            <span className='text-[10px] text-white/25 mt-1 px-1'>
              {msg.user} · {msg.time}
            </span>
          </div>
        ))}
      </div>

      <div className='p-3 border-t border-white/[0.06]'>
        <div className='flex gap-2'>
          <input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder='Escribe...'
            className='w-full flex-1 h-9 px-3 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/[0.12]'
          />
          <Button
            size='icon'
            className='h-9 w-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12]'
          >
            <Send className='w-3.5 h-3.5 text-white/60' />
          </Button>
        </div>
      </div>
    </div>
  );
}
