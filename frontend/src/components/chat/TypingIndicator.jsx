const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 p-3 bg-slate-800 text-slate-100 rounded-2xl max-w-[75%] shadow-md border border-slate-700/30">
      {/* Bot Icon */}
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m-6.5 0h13M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm4 6h.01M15 12h.01M9 16h6" />
        </svg>
      </div>
      
      {/* Three bouncing dots */}
      <div className="flex space-x-1 items-center py-1 px-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400/80 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-emerald-400/80 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-emerald-400/80 animate-bounce"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
