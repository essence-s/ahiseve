import { useState } from 'react';
import { Modal } from './Modal/Modal';

export default function HowUse() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='fixed right-2 top-26 bg-[#ffffff13] border border-white/5 rounded-lg w-10 h-10 flex justify-center items-center text-white/60 cursor-pointer'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-6 h-6'
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
          <div className='flex flex-col max-w-2xl w-full max-h-[80dvh]  overflow-auto text-white'>
            {/* Header */}
            <div className='flex flex-col p-4 sm:p-5 border-b border-white/6'>
              <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
                Como utilizar
              </h2>
              <p className='text-xs text-white/40 mt-1'>
                Sigue unas de las 3 formas
              </p>
            </div>

            <div className='p-4 sm:p-6 flex flex-col gap-5'>
              <p>Cree una sala y invite a sus amigos, hay 3 formas de uso:</p>

              <div className='flex flex-col gap-4 sm:flex-row'>
                <div className='flex-1 flex flex-col gap-2'>
                  <p>1.</p>

                  <div className='w-full h-36 bg-gray-600/20 rounded-lg'></div>
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                  <p>2.</p>
                  <div className='w-full h-36 bg-gray-600/20 rounded-lg'></div>
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                  <p>3.</p>
                  <div className='w-full h-36 bg-gray-600/20 rounded-lg'></div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
