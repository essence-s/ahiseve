import { useEffect, useState } from 'react';
import { Modal } from './Modal/Modal';
import { PAGE_MESSAGE_TYPES } from './types.d';
import { Button } from './ui/button';

export default function TabLock() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.source != window) return;

      let { cmd, data } = event.data;
      if (cmd == PAGE_MESSAGE_TYPES.APP_INSTANCE_NOW_PRIMARY) {
      } else if (cmd == PAGE_MESSAGE_TYPES.APP_INSTANCE_LOST_PRIMARY) {
        console.log('lost primary');
        setOpen(true);
      }
    };

    localStorage.setItem('app_tab_open', Date.now().toString());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'app_tab_open') {
        setOpen(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    // window.addEventListener('message', messageHandler);

    return () => {
      // window.removeEventListener('message', messageHandler);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <>
      {open && (
        <Modal
          className='flex flex-col max-w-100 w-full max-h-[80dvh] overflow-auto text-white'
          onClose={() => {}}
        >
          {/* Header */}
          <div className='flex flex-col p-4 sm:p-5 border-b border-white/6'>
            <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
              Ahiseve esta abierto en otra pestaña
            </h2>
            <p className='text-xs text-white/40 mt-1'>
              Para evitar conflictos, esta pestaña no puede usarse ahora
            </p>
          </div>

          <div className='p-4 sm:p-6 flex flex-col gap-5'>
            <p>
              Haz clic en "Usar esta pestaña" para mantener Ahiseve en esta
              ventana
            </p>

            <Button>Usar esta pestaña</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
