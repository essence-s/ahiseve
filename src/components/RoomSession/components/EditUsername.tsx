import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';
import { generateName } from '@/utils/functsGene';
import { ChevronLeft, X } from 'lucide-react';
import { useState } from 'react';

type EditUsernameProps = {
  onClose: () => void;
};

export function EditUsername({ onClose }: EditUsernameProps) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [username, setUsername] = useState(user.username);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let resolvedUsername = username;
    if (!resolvedUsername) {
      resolvedUsername = generateName();
      localStorage.removeItem('username');
    } else {
      localStorage.setItem('username', resolvedUsername);
    }
    setUser({ username: resolvedUsername });
    onClose();
  };

  return (
    <Modal className='max-w-100 max-h-[85vh] sm:max-h-[80vh]' onClose={onClose}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 sm:p-5 border-b border-white/6'>
        <div className='flex-1 min-w-0'>
          <h2 className='text-xs sm:text-sm font-medium text-white/90 truncate'>
            Cambiar nombre
          </h2>
          <p className='text-xs text-white/40 mt-1'>
            El nombre que verán los demás.
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='w-8 h-8 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300 shrink-0 ml-2'
        >
          <X className='w-4 h-4' />
        </Button>
      </div>

      {/* Broadcasts Grid */}
      <form
        className='flex-1 overflow-y-auto p-4 sm:p-6 flex gap-2'
        onSubmit={handleSubmit}
      >
        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        <Button type='submit'>Aceptar</Button>
      </form>

      {/* Footer with info */}
      <div className='border-t border-white/6 p-3 sm:p-4 flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300'
        >
          <ChevronLeft className='w-3.5 h-3.5' />
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}
