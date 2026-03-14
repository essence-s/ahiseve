type ModalProps = {
  children: React.ReactNode;
  className?: string;
};

export function Modal({ children, className }: ModalProps) {
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center p-4 animate-fadeIn'>
      <div
        className={`w-full max-w-2xl max-h-[80vh] bg-[#0f0e12e3] rounded-2xl border border-white/8 overflow-hidden flex flex-col animate-slideUp relative ${className}`}
      >
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_600px_600px_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]'></div>
        <div className='relative'>{children}</div>
      </div>
    </div>
  );
}
