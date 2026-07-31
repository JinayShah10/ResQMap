import { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = (text) => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    const userMessage = {
      sender: "user",
      text,
      timestamp: currentTime
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Mock Assistant response logic
    setTimeout(() => {
      const assistantTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      const assistantMessage = {
        sender: "assistant",
        text: "This is a placeholder response. Backend integration will be added in the next phase.",
        timestamp: assistantTime
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSelectPrompt = (promptText) => {
    setInputValue(promptText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[99999] flex items-end justify-center md:items-stretch md:justify-start">
      {/* Mobile Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs md:hidden z-0" 
      />

      {/* Main Chat Window */}
      <div className="relative w-full h-[85vh] md:h-[650px] md:w-[420px] bg-slate-900/95 border border-slate-800 md:rounded-2xl shadow-2xl flex flex-col z-10 animate-fade-in-header overflow-hidden">
        <ChatHeader onClose={onClose} />
        
        <ChatMessages 
          messages={messages} 
          isLoading={isLoading} 
          onSelectPrompt={handleSelectPrompt} 
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      </div>
    </div>
  );
};

export default ChatModal;
