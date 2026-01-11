import { usePeer } from '@/hook/usePeer';
import { useEffect } from 'react';

export function PeerConnection() {
  let { createServer } = usePeer();
  useEffect(() => {
    createServer();
  }, []);
  return null;
}
