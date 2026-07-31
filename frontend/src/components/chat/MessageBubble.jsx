const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";
  
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}>
      <div className="flex items-start gap-2 max-w-[75%]">
        {!isUser && (
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 mt-0.5 shadow-sm">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m-6.5 0h13M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm4 6h.01M15 12h.01M9 16h6" />
            </svg>
          </div>
        )}
        
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          {/* Main Bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed whitespace-pre-wrap break-words text-left ${
              isUser
                ? "bg-emerald-600 text-white rounded-tr-none border border-emerald-500/20"
                : "bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-none"
            }`}
          >
            {message.text}
          </div>
          
          {/* Timestamp */}
          <span className="text-[10px] text-slate-500 font-mono mt-1 px-1 select-none">
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
