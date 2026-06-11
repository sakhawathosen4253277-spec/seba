import React, { useState, useRef, useEffect } from "react";
import { Send, Upload, Paperclip, CheckCheck, Smile, HelpCircle } from "lucide-react";
import { Message } from "../types";

const SUPPORT_NAMES = ["হাসান", "রহিম", "ইমরান", "সোহেল"];

interface AIChatProps {
  messages: Message[];
  onSendMessage: (text: string, file?: File | null) => void;
  isTyping: boolean;
  agentName: string;
}

export default function AIChat({ messages, onSendMessage, isTyping, agentName }: AIChatProps) {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    onSendMessage(inputText, selectedFile);
    setInputText("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleQuickReply = (text: string) => {
    onSendMessage(text, null);
  };

  const quickReplies = [
    { label: "ভিসা সমস্যা", text: "আমার ভিসার মেয়াদ শেষ, কী করব ভাই?" },
    { label: "টাকা পাঠাব", text: "দেশে টাকা পাঠাতে কি কি কাগজ লাগবে ভাই?" },
    { label: "টিকেট দরকার", text: "ঢাকা যাওয়ার প্লেনের টিকেটের দাম কত ভাই?" },
    { label: "অন্য সমস্যা", text: "আমি অন্যান্য জরুরি সাহায্য চাই ভাই।" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#F0F4F8] font-sans">
      {/* Agent Info Header */}
      <div className="flex items-center space-x-3 p-3 bg-[#1B4F72] border-b border-white/10">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-[#2E86C1] flex items-center justify-center text-white font-medium text-sm select-none">
            {agentName.substring(0, 2)}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1D9E75] border-2 border-[#1B4F72] rounded-full"></span>
        </div>
        
        <div>
          <div className="flex items-center space-x-1.5">
            <h4 className="text-sm font-medium text-white tracking-tight">{agentName}</h4>
            <span className="text-[9px] bg-[rgba(255,255,255,0.15)] text-white px-1.5 py-0.5 rounded">সহযোগী</span>
          </div>
          <p className="text-[10px] text-[rgba(255,255,255,0.7)] font-sans mt-0.5">পাশে আছি সবসময় ভাই • ফনম পেন, কম্বোডিয়া</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F0F4F8]">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div className="flex items-end space-x-1">
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-[#EBF5FB] flex items-center justify-center text-[9px] font-medium text-[#1B4F72] select-none mr-1">
                    {agentName.substring(0, 1)}
                  </div>
                )}
                
                <div
                  style={{ 
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    border: isUser ? "none" : "0.5px solid #E5E7EB"
                  }}
                  className={`px-4.5 py-3 text-[13.5px] leading-relaxed font-sans ${
                    isUser
                      ? "bg-[#1B4F72] text-white"
                      : "bg-[#FFFFFF] text-[#1A1A2E]"
                  }`}
                >
                  {/* Text content */}
                  {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                  {/* Attachment markup */}
                  {msg.attachmentUrl && (
                    <div className={`mt-2 p-2 rounded flex items-center space-x-2 text-xs border ${
                      isUser 
                        ? "bg-white/10 border-white/20" 
                        : "bg-slate-50 border-slate-200"
                    }`}>
                      <Paperclip className={`w-3.5 h-3.5 shrink-0 ${isUser ? "text-white" : "text-[#1B4F72]"}`} />
                      <span className={`truncate max-w-[150px] font-mono text-[10px] ${isUser ? "text-white" : "text-[#1A1A2E]"}`}>
                        {msg.attachmentName || "সংযুক্ত ফাইল"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Msg Metadata */}
              <div className="flex items-center space-x-1 mt-1 text-[9px] text-[#9CA3AF] font-sans px-1">
                <span>{msg.timestamp}</span>
                {isUser && (
                  <span className="text-[#1B4F72] flex items-center space-x-0.5 ml-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-medium">দেখেছে</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end space-x-1 max-w-[80%] mr-auto">
            <div className="w-6 h-6 rounded-full bg-[#EBF5FB] flex items-center justify-center text-[9px] font-medium text-[#1B4F72] select-none mr-1">
              {agentName.substring(0, 1)}
            </div>
            <div 
              style={{ border: "0.5px solid #E5E7EB" }}
              className="bg-[#FFFFFF] p-3 rounded-2xl rounded-bl-none shadow flex items-center space-x-1.5 h-10"
            >
              <span className="w-2 h-2 rounded-full bg-[#1B4F72] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#1B4F72] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#1B4F72] animate-bounce"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies list if previous support list makes sense */}
      <div 
        style={{ borderTop: "0.5px solid #E5E7EB" }}
        className="p-2 bg-[#FFFFFF] flex space-x-2 overflow-x-auto scrollbar-none py-2.5"
      >
        {quickReplies.map((qr, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickReply(qr.text)}
            style={{ border: "0.5px solid #E5E7EB" }}
            className="shrink-0 bg-[#F7F8FA] hover:bg-slate-50 text-[#1B4F72] font-sans text-xs px-3.5 py-1.5 rounded-[20px] transition-all outline-none"
          >
            {qr.label}
          </button>
        ))}
      </div>

      {/* Input Form with attachment indicator */}
      <form 
        onSubmit={handleSend} 
        style={{ borderTop: "0.5px solid #E5E7EB" }}
        className="p-3 bg-[#FFFFFF] flex items-center space-x-2"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />

        {/* Attachment Click */}
        <button
          type="button"
          onClick={triggerFileSelect}
          className={`p-2.5 rounded-full hover:bg-[#F7F8FA] active:scale-95 transition-all outline-none ${
            selectedFile ? "text-[#1B4F72]" : "text-[#6B7280] hover:text-[#1B4F72]"
          }`}
          title="নথি বা ছবি শেয়ার করুন"
        >
          <Upload className="w-5 h-5" />
        </button>

        {/* Text Area */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="আপনার সমস্যাটি বাংলায় লিখুন ভাই..."
            style={{ border: "0.5px solid #E5E7EB" }}
            className="w-full bg-[#F7F8FA] text-[#1A1A2E] rounded-[24px] py-3 pl-4 pr-12 focus:border-[#1B4F72] focus:outline-none text-sm placeholder:text-[#9CA3AF] font-sans"
          />
          {selectedFile && (
            <div className="absolute right-3 bg-[#EBF5FB] text-[#1B4F72] px-2 py-0.5 rounded text-[9px] font-medium truncate max-w-[80px]">
              {selectedFile.name}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="p-3 rounded-[12px] bg-[#1B4F72] text-white hover:bg-opacity-90 active:scale-95 flex items-center justify-center transition-all outline-none cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
