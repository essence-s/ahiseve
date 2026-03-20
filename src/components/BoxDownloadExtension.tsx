import { useState } from 'react';
import { Modal } from './Modal/Modal';

export default function BoxDownloadExtension() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='fixed right-2 top-37 bg-[#ffffff13] border border-white/5 rounded-lg w-10 h-10 flex justify-center items-center text-white/60 cursor-pointer'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-6 h-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path stroke='none' d='M0 0h24v24H0z' />
          <path d='M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1' />
        </svg>
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className='flex flex-col max-w-2xl w-full max-h-[80dvh]  overflow-auto text-white'>
            {/* Header */}
            <div className='flex flex-col p-4 sm:p-5 border-b border-white/6'>
              <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
                Descarga e instala la extensión (Beta)
              </h2>
              <p className='text-xs text-white/40 mt-1'>
                Puede utilizarlo en navegadores basados en Chromiun y Firefox
              </p>
            </div>

            <div className='p-4 sm:p-6'>
              <div className=' space-y-3 text-sm'>
                <p>Instalación manual.</p>
                <p>
                  1.{' '}
                  <a
                    href='https://github.com/essence-s/ahiseve-extension/archive/refs/heads/dist.zip'
                    className='text-blue-400 underline'
                  >
                    Descarga aquí
                  </a>
                </p>
                <p>2. Ve a chrome://extensions/</p>
                <p>3. Activa el modo desarrollador arriba a la derecha.</p>
                <p>
                  4. Usa “Cargar descomprimida” para seleccionar la carpeta que
                  se descomprime del zip.
                </p>
              </div>

              <img
                src='/img-install-extension.png'
                alt='Instalación extensión'
                className='w-full rounded-lg border-4 border-white/20 mt-4 aspect-[2.13/1]'
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
