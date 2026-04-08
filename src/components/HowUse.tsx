import { useState } from 'react';
import { Modal } from './Modal/Modal';
import YoutubeVideo from './YoutubeVideo';

export default function HowUse() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='fixed z-1 right-2 top-26 bg-[#ffffff13] border border-white/5 rounded-lg w-10 h-10 flex justify-center items-center text-white/60 cursor-pointer'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-5.5 h-5.5'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          viewBox='0 0 24 24'
        >
          <path stroke='none' d='M0 0h24v24H0z' />
          <path d='M15 21H6C5.46957 21 4.96086 20.7893 4.58579 20.4142C4.21071 20.0391 4 19.5304 4 19V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H18C18.5304 3 19.5 3 20 3C20 3.58579 20 4.46957 20 5V11' />
          <path d='M14 17C14 17 6.5 17 6 17C5.5 17 5 17.18 4.59 17.59C4.18 18 4 18.5 4 19' />
          <path d='M19 22v.01' />
          <path d='M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483' />
        </svg>
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className='flex flex-col max-w-3xl w-full max-h-[80dvh] overflow-auto text-white'>
            <div className='flex flex-col p-4 sm:p-5 border-b border-white/6'>
              <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
                Modos de Uso
              </h2>
              <p className='text-xs text-white/40 mt-1'>
                Ahiseve ofrece varias formas de ver videos con amigos
              </p>
            </div>

            <div className='p-4 sm:p-6 flex flex-col gap-6'>
              <div className='flex flex-col gap-3'>
                <h3 className='text-sm font-medium text-white/80'>
                  🌐 Video desde otra web (YouTube, etc.)
                </h3>
                <p className='text-xs text-white/50'>
                  Sincroniza videos de plataformas externas usando la extensión.
                  Requiere tener la extensión instalada.
                </p>
                <YoutubeVideo
                  videoId='0dwZc8lXNII'
                  title='Video desde otra web'
                />
              </div>

              <div className='flex flex-col gap-3'>
                <h3 className='text-sm font-medium text-white/80'>
                  🎞️ Subir video directamente o link mp4
                </h3>
                <p className='text-xs text-white/50'>
                  Carga un video para reproducirlo de forma sincronizada con tus
                  amigos. Deben tener el video descargado para usar este modo.
                </p>
                <YoutubeVideo
                  videoId='ICNsReHQXYs'
                  title='Subir video directamente'
                />
              </div>

              <div className='flex flex-col gap-3'>
                <h3 className='text-sm font-medium text-white/80'>
                  🖥️ Transmitir su pantalla
                </h3>
                <p className='text-xs text-white/50'>
                  Si el otro usuario no sube un video o no usa la extensión,
                  puede recibir una transmisión y controlar también el video,
                  aunque no es muy estable pero funciona.
                </p>
                <YoutubeVideo
                  videoId='djPcwMMnsYw'
                  title='Transmitir pantalla'
                />
              </div>

              <div className='mt-2 pt-4 border-t border-white/6 flex flex-col gap-3'>
                <h3 className='text-sm font-medium text-white/80'>
                  🧩 Instalar la extensión (opcional)
                </h3>
                <p className='text-xs text-white/50'>
                  Funciona aunque las actualizaciones más recientes se
                  demorarán.
                </p>
                <div className='flex flex-wrap gap-3'>
                  <a
                    href='https://chromewebstore.google.com/detail/agfmkpaigocffapfpngeppmlcfndpbjk?utm_source=item-share-cb'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-blue-400 hover:underline'
                  >
                    Chrome Web Store
                  </a>
                  <a
                    href='https://github.com/essence-s/ahiseve-extension/tree/dist'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-blue-400 hover:underline'
                  >
                    Repositorio de la extensión
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
