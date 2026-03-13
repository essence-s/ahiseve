import { usePeerStore } from '@/store/peerStore';
import { useUserStore } from '@/store/userStore';
import { Wifi } from 'lucide-react';

export function YourName() {
  const peerId = usePeerStore((state) => state.idPeer);
  const user = useUserStore((state) => state.user);
  const isConnected = !!peerId;

  return (
    <div className='mt-6 flex items-center gap-2'>
      <div className='relative flex items-center justify-center w-5 h-5'>
        {isConnected ? (
          <>
            <span className='absolute w-2 h-2 bg-emerald-400 rounded-full' />
            <span className='absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-50' />
          </>
        ) : (
          <Wifi className='w-3.5 h-3.5 text-white/30 animate-pulse' />
        )}
      </div>
      <span className='text-xs text-white/30'>
        {isConnected ? user.username : 'Generando Nombre...'}
      </span>
    </div>
  );
}
