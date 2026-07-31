const ChatButton = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-24 z-[9999] group select-none">
      {/* Tooltip */}
      <div className="absolute right-0 bottom-20 bg-slate-900 border border-slate-800 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 shadow-xl transition-all duration-200 translate-y-2 group-hover:translate-y-0 whitespace-nowrap">
        ResQMap AI
      </div>

      {/* Button */}
      <button
        onClick={onClick}
        className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 border border-emerald-400/20"
        aria-label="Open emergency AI assistant"
      >
        <svg className="w-8 h-8 text-slate-950 font-bold" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m-6.5 0h13M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm4 6h.01M15 12h.01M9 16h6" />
        </svg>
      </button>
    </div>
  );
};

export default ChatButton;
