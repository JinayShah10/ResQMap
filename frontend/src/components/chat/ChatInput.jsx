import { useRef, useEffect } from "react";

const ChatInput = ({ onSendMessage, isLoading, inputValue, setInputValue }) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  // Auto-resize textarea height as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [inputValue]);

  return (
    <div className="p-3 border-t border-slate-800 bg-slate-900/95 shrink-0 flex items-end gap-2">
      <div className="relative flex-grow flex items-center bg-slate-950/60 border border-slate-800 focus-within:border-emerald-500/50 rounded-2xl px-4 py-1 transition-all">
        <textarea
          ref={textareaRef}
          rows="1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask an emergency question..."
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none max-h-[120px] py-1.5 leading-normal"
          disabled={isLoading}
        />
      </div>
      
      <button
        onClick={handleSend}
        disabled={!inputValue.trim() || isLoading}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:scale-95 shadow-md ${
          inputValue.trim() && !isLoading
            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10"
            : "bg-slate-800 text-slate-600 cursor-not-allowed shadow-none"
        }`}
        aria-label="Send message"
      >
        <svg className="w-4 h-4 shrink-0 translate-x-[1px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
