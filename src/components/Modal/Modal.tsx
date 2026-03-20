import { X } from 'lucide-react';
import { useEffect, type MouseEvent } from 'react';

type ModalProps = {
  children: React.ReactNode;
  className?: string;
  showIconClose?: boolean;
  onClose: () => void;
  onClick?: (e: MouseEvent) => void;
};

export function Modal({
  children,
  className,
  showIconClose = false,
  onClose,
  onClick,
  ...args
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center p-4 animate-fadeIn'
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl max-h-[80vh] bg-[#0f0e12e3] rounded-2xl border border-white/8 overflow-hidden flex flex-col animate-slideUp relative ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        {...args}
      >
        {showIconClose && (
          <button
            className='absolute z-1 right-7 top-6 w-8 h-8 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300 shrink-0 ml-2'
            onClick={onClose}
          >
            <X className='w-4 h-4 m-auto' />
          </button>
        )}

        <div className='absolute -z-1 inset-0 bg-[radial-gradient(ellipse_600px_600px_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]'></div>

        {children}
      </div>
    </div>
  );
}
