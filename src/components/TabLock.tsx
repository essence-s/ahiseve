'use client';

import { useEffect, useState, useRef } from 'react';
import { Modal } from './Modal/Modal';
import { Button } from './ui/button';
import { usePeerStore } from '@/store/peerStore';

const STORAGE_KEYS_TO_CLEAN = [
  'app_peer_disconnected',
  'app_peer_destroyed',
  'app_takeover',
  'app_tab_open',
];

interface TabMessage {
  idTab: string;
  initiatorId: string;
}

interface DisconnectMessage {
  initiatorId: string;
}

export default function TabLock() {
  const [open, setOpen] = useState(false);
  const { destroyPeer, initPeerNetwork } = usePeerStore();
  const myIdTabRef = useRef<string | null>(null);
  const initiatorTabIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    myIdTabRef.current =
      Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);

    STORAGE_KEYS_TO_CLEAN.forEach((key) => localStorage.removeItem(key));

    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;

      const payload = event.newValue ? JSON.parse(event.newValue) : null;
      console.log('event.key', event.key);
      console.log('payload', payload);

      if (event.key === 'app_takeover') {
        // console.log('payload', payload);
        if (!payload) return;
        const { initiatorId } = payload as TabMessage;

        if (initiatorId == myIdTabRef.current) return;

        setOpen(true);
        destroyPeer();
        const disconnectMsg: DisconnectMessage = { initiatorId };
        localStorage.setItem(
          'app_peer_destroyed',
          JSON.stringify(disconnectMsg)
        );
      }

      if (event.key === 'app_tab_open') {
        if (!payload) return;
        const { initiatorId } = payload as TabMessage;

        if (initiatorId === myIdTabRef.current) return;

        destroyPeer();
        const disconnectMsg: DisconnectMessage = { initiatorId };
        localStorage.setItem(
          'app_peer_disconnected',
          JSON.stringify(disconnectMsg)
        );
        setOpen(true);
      }

      if (event.key === 'app_peer_disconnected') {
        if (!payload) return;
        const { initiatorId } = payload as DisconnectMessage;

        if (initiatorId !== myIdTabRef.current) return;
        console.log('panso');
        initPeerNetwork();
      }

      if (event.key === 'app_peer_destroyed') {
        if (!payload) return;
        const { initiatorId } = payload as DisconnectMessage;
        if (initiatorId !== myIdTabRef.current) return;

        initPeerNetwork();
        setOpen(false);
      }
    };

    window.addEventListener('storage', handleStorage);

    initPeerNetwork();

    const openMsg: TabMessage = {
      idTab: myIdTabRef.current,
      initiatorId: myIdTabRef.current,
    };
    localStorage.setItem('app_tab_open', JSON.stringify(openMsg));
    localStorage.removeItem('app_tab_open');

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [destroyPeer, initPeerNetwork]);

  const handleUseThisTab = () => {
    const takeoverMsg: TabMessage = {
      idTab: myIdTabRef.current!,
      initiatorId: myIdTabRef.current!,
    };
    localStorage.setItem('app_takeover', JSON.stringify(takeoverMsg));
  };

  return (
    <>
      {open && (
        <Modal
          className='flex flex-col max-w-100 w-full max-h-[80dvh] overflow-auto text-white'
          onClose={() => {}}
        >
          <div className='flex flex-col p-4 sm:p-5 border-b border-white/6'>
            <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
              Ahiseve está abierto en otra pestaña
            </h2>
            <p className='text-xs text-white/40 mt-1'>
              Se ha detectado otra instancia de la aplicación. Esta pestaña ha
              sido desconectada del peer para evitar conflictos.
            </p>
          </div>

          <div className='p-4 sm:p-6 flex flex-col gap-5'>
            <p className='text-sm text-white/70'>¿Qué deseas hacer?</p>

            <Button
              onClick={handleUseThisTab}
              className='w-full bg-white hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded-lg'
            >
              Usar esta pestaña (reconectar)
            </Button>

            <p className='text-xs text-white/40'>
              Al hacer clic, esta pestaña se reconnectará con el mismo ID de
              peer. La otra pestaña deberá actualizar o será reemplazada.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
