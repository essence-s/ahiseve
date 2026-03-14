export function Modal({ children }) {
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center p-4'>
      <div className='w-full max-w-100 max-h-[90vh] bg-[#0f0e12e3] rounded-2xl border border-white/8 overflow-hidden flex flex-col animate-in fade-in-0 duration-300 relative'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_600px_600px_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]'></div>
        <div className='relative'>{children}</div>
      </div>
    </div>
  );
}
