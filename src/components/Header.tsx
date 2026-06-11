import { Bell } from "lucide-react";
import { LiveNotification } from "../types";
import { useState, useEffect } from "react";

interface HeaderProps {
  notifications: LiveNotification[];
  unreadCount: number;
  onBellClick: () => void;
  lang: string;
  exchangeRate?: number;
}

export default function Header({ unreadCount, onBellClick, exchangeRate = 110.80 }: HeaderProps) {
  const tickerMessages = [
    "⚠️ ওভারস্টে জরিমানা $10/দিন — ৯০ দিনের বেশি থাকলে ডিপোর্ট হতে পারেন",
    "📋 ভিসা extension করুন মেয়াদ শেষের ৭ দিন আগে — দেরি করবেন না",
    "🚫 দালালকে পাসপোর্ট দেবেন না — এটা বেআইনি ও বিপজ্জনক",
    "💸 আজকের এক্সচেঞ্জ রেট: 1 USD = 110.80 BDT — সবসময় ব্যাংক থেকে নিন",
    "⚠️ Work Permit ছাড়া কাজ করলে জরিমানা ও ডিপোর্ট হতে পারে",
    "🏥 জরুরি হাসপাতাল: Calmette Hospital, Phnom Penh — সবচেয়ে সাশ্রয়ী",
    "🎫 ভুয়া টিকেট স্ক্যাম চলছে — টাকা দেওয়ার আগে আমাদের agent-কে জানান",
    "📞 Bangladesh Honorary Consulate Phnom Penh — বিপদে সাথে সাথে যোগাযোগ করুন",
    "💼 Verified employer ছাড়া কোনো contract সই করবেন না",
    "🚨 Facebook-এ সস্তা ভিসার অফার = স্ক্যাম — সাবধান থাকুন",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      const timeout = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % tickerMessages.length);
        setFade(true);
      }, 300); // 300ms for fade out
      return () => clearTimeout(timeout);
    }, 5000);

    return () => clearInterval(interval);
  }, [tickerMessages.length]);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#1B4F72] to-[#0D2F45] border-b-2 border-[#1D9E75] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      {/* Brand & Notifications Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side: Logo & Labels */}
        <div className="flex items-center space-x-2.5">
          {/* SVG Badge */}
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#1D9E75] flex items-center justify-center select-none shrink-0 shadow-sm text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10L12 3L21 10V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18C12 18 9.5 16.2 9.5 14.5C9.5 13.6 10.1 13 10.8 13C11.3 13 11.7 13.3 12 13.7C12.3 13.3 12.7 13 13.2 13C13.9 13 14.5 13.6 14.5 14.5C14.5 16.2 12 18 12 18Z" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[17px] font-bold text-white tracking-tight leading-none">
              প্রবাসী সেবা
            </h1>
            <p className="text-[10px] text-[#7FB3D3] mt-1 font-sans font-medium leading-none">
              Cambodia
            </p>
          </div>
        </div>

        {/* Right Side: Exchange Rate Pill & Notification Bell */}
        <div className="flex items-center space-x-2">
          {/* Live exchange rate pill */}
          <div className="flex items-center space-x-1 bg-[#0A2435] border border-[#1D9E75]/40 rounded-full px-2 py-0.5 text-[10px] font-sans text-white shadow-inner whitespace-nowrap shrink-0">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1D9E75]"></span>
            </span>
            <span className="font-medium whitespace-nowrap">১ USD = {exchangeRate.toFixed(2)} BDT</span>
          </div>

          {/* Bell Button */}
          <button
            onClick={onBellClick}
            className="relative p-1.5 text-white hover:opacity-85 active:scale-95 transition-all outline-none"
            id="btn-bell-notifications"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E74C3C] text-[9px] font-bold text-white ring-2 ring-[#0D2F45]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Live News Ticker */}
      <div className="flex items-center bg-[#1B4F72] px-2 py-1 overflow-hidden h-7 border-t border-white/20">
        {/* Live Badge */}
        <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-[#E74C3C] rounded text-[9px] font-medium text-white tracking-widest z-10 select-none shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          <span>লাইভ</span>
        </div>

        {/* Scrolling news replacement with beautiful fade animation */}
        <div className="relative flex-1 overflow-hidden pointer-events-auto select-none pl-3">
          <div 
            className={`transition-opacity duration-300 text-xs text-white font-sans font-medium truncate ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {tickerMessages[currentIndex]}
          </div>
        </div>
      </div>
    </header>
  );
}

