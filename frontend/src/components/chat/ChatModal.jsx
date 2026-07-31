import { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { sendMessage } from "../../services/chatService";

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

  const handleSendMessage = async (text) => {
    if (isLoading) return; // Prevent duplicate requests

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

    try {
      const data = await sendMessage(text);
      const assistantTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      if (data && data.success) {
        const assistantMessage = {
          sender: "assistant",
          text: data.answer,
          timestamp: assistantTime
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      const assistantTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      let errorText = "Unable to contact the AI assistant. Please try again.";

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout") || (err.response && err.response.status === 504)) {
        errorText = "The AI assistant took too long to respond.";
      } else if (!navigator.onLine || err.message?.includes("Network Error")) {
        errorText = "Network error. Please check your connection.";
      } else if (err.response && err.response.status === 500) {
        errorText = "Unable to contact the AI assistant. Please try again.";
      }

      const assistantMessage = {
        sender: "assistant",
        text: errorText,
        timestamp: assistantTime
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
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
