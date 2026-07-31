import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import SuggestedPrompts from "./SuggestedPrompts";

const ChatMessages = ({ messages, isLoading, onSelectPrompt }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
        {/* Large Bot Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/5 animate-pulse">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m-6.5 0h13M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm4 6h.01M15 12h.01M9 16h6" />
          </svg>
        </div>
        
        <h3 className="text-lg font-bold text-slate-100 mb-2">How can I help you today?</h3>
        <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed mb-6">
          Ask questions about emergency response, disasters, first aid, or safety procedures.
        </p>

        {/* Suggested Prompts */}
        <div className="w-full">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-left pl-2">
            Suggested Topics
          </div>
          <SuggestedPrompts onSelectPrompt={onSelectPrompt} />
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
