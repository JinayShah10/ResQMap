const ChatHeader = ({ onClose }) => {
  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none shrink-0 rounded-t-2xl">
      {/* Bot branding info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
          <svg className="w-5.5 h-5.5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m-6.5 0h13M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm4 6h.01M15 12h.01M9 16h6" />
          </svg>
        </div>
        <div className="text-left">
          <h2 className="text-sm font-bold text-slate-100 tracking-wide m-0 p-0 leading-tight">
            ResQ<span className="text-emerald-400">Map</span> AI
          </h2>
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold block leading-none mt-0.5">
            Emergency Assistant
          </span>
        </div>
      </div>
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg active:scale-95 transition-all cursor-pointer"
        aria-label="Close chat"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;
