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
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#070b16] font-sans">
      {/* Agent Info Header */}
      <div className="flex items-center space-x-3 p-3 bg-slate-900/90 border-b border-emerald-500/20 shadow-md">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center text-white font-extrabold text-sm select-none shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            {agentName.substring(0, 2)}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
        </div>
        
        <div>
          <div className="flex items-center space-x-1.5">
            <h4 className="text-sm font-bold text-white tracking-tight">{agentName}</h4>
            <span className="text-[9px] bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-bold px-1 rounded">সহযোগী</span>
          </div>
          <p className="text-[10px] text-emerald-400/80 font-sans mt-0.5">পাশে আছি সবসময় ভাই • ফনম পেন, কম্বোডিয়া</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div className="flex items-end space-x-1">
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-emerald-500/10 flex items-center justify-center text-[9px] font-bold text-emerald-400 select-none mr-1">
                    {agentName.substring(0, 1)}
                  </div>
                )}
                
                <div
                  className={`px-4.5 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-md font-sans ${
                    isUser
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none"
                  }`}
                >
                  {/* Text content */}
                  {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                  {/* Attachment markup */}
                  {msg.attachmentUrl && (
                    <div className="mt-2 p-2 bg-black/30 rounded border border-white/10 flex items-center space-x-2 text-xs">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span className="truncate max-w-[150px] text-zinc-300 font-mono text-[10px]">
                        {msg.attachmentName || "সংযুক্ত ফাইল"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Msg Metadata */}
              <div className="flex items-center space-x-1 mt-1 text-[9px] text-slate-500 font-sans px-1">
                <span>{msg.timestamp}</span>
                {isUser && (
                  <span className="text-emerald-400 flex items-center space-x-0.5 ml-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold">দেখেছেনু</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end space-x-1 max-w-[80%] mr-auto">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-emerald-500/10 flex items-center justify-center text-[9px] font-bold text-emerald-400 select-none mr-1">
              {agentName.substring(0, 1)}
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl rounded-bl-none border border-slate-900 shadow flex items-center space-x-1.5 h-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies list if previous support list makes sense */}
      <div className="p-2 border-t border-slate-900 bg-slate-950/50 flex space-x-2 overflow-x-auto scrollbar-none py-2.5">
        {quickReplies.map((qr, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickReply(qr.text)}
            className="shrink-0 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 font-sans text-xs px-3 py-1.5 rounded-full transition-all outline-none"
          >
            {qr.label}
          </button>
        ))}
      </div>

      {/* Input Form with attachment indicator */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
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
          className={`p-2.5 rounded-full hover:bg-slate-850 active:scale-95 transition-all outline-none ${
            selectedFile ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-200"
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
            className="w-full bg-slate-950 text-white rounded-xl py-3 pl-4 pr-12 border border-slate-800 focus:border-emerald-500/50 focus:outline-none text-sm placeholder:text-slate-500 font-sans"
          />
          {selectedFile && (
            <div className="absolute right-3 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[9px] font-bold truncate max-w-[80px]">
              {selectedFile.name}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="p-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 shadow-md flex items-center justify-center transition-all outline-none cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
