import { Bell, Info } from "lucide-react";
import { LiveNotification } from "../types";

interface HeaderProps {
  notifications: LiveNotification[];
  unreadCount: number;
  onBellClick: () => void;
  lang: string;
}

export default function Header({ unreadCount, onBellClick }: HeaderProps) {
  // Hardcoded ticker items based on user requirements
  const tickerItems = [
    "ফনম পেন্হে পুলিশ চেকিং চলছে — সতর্ক থাকুন",
    "আজকের রেট: 1 USD = 110.80 BDT",
    "ঢাকাগামী ফ্লাইটে আসন সীমিত — এখনই বুক করুন",
    "নতুন ভিসা দালাল সতর্কতা — রিপোর্ট করুন",
    "ট্যুরিস্ট ভিসা এক্সটেনশন এখন অনলাইনে সম্ভব",
    "সিয়েম রিপে নতুন চাকরির সুযোগ — যাচাইকৃত",
    "বাংলাদেশ দূতাবাস সেবা সময় পরিবর্তন হয়েছে",
    "ভুয়া টিকেট বিক্রেতা ক্যাফে ওয়ান থেকে সাবধান থাকুন",
    "কম্বোডিয়ায় দালালের খপ্পড়ে পাসপোর্ট হারানো ভাইদের দূতাবাসের সহায়তার নির্দেশ"
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-emerald-500/20 shadow-lg">
      {/* Brand & Notifications Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,136,0.5)] animate-pulse-green">
            <span className="font-bold text-slate-950 text-base">সেবা</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center">
              প্রবাসী সেবা <span className="text-xs text-emerald-400 ml-1.5 font-mono">Cambodia</span>
            </h1>
            <p className="text-[10px] text-emerald-400 -mt-1 font-sans">কম্বোডিয়ায় বাংলাদেশিদের বিশ্বস্ত সঙ্গী</p>
          </div>
        </div>

        {/* Bell Button */}
        <button
          onClick={onBellClick}
          className="relative p-2 text-slate-300 hover:text-emerald-400 active:scale-95 transition-all outline-none"
          id="btn-bell-notifications"
        >
          <Bell className="w-5.5 h-5.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Live News Ticker */}
      <div className="flex items-center bg-red-950/40 border-t border-red-500/10 px-2 py-1 overflow-hidden h-7">
        {/* Glow Badge */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-red-600 rounded-sm text-[9px] font-bold text-white tracking-widest z-10 shadow-[0_0_8px_rgba(239,68,68,0.5)] select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          <span>LIVE</span>
        </div>

        {/* Scrolling news */}
        <div className="relative flex-1 overflow-hidden pointer-events-auto select-none">
          <div className="flex space-x-8 whitespace-nowrap text-xs text-red-100 font-sans font-medium hover:paused animate-marquee">
            {tickerItems.map((item, idx) => (
              <span key={idx} className="flex items-center space-x-2">
                <span>{item}</span>
                <span className="text-red-500">●</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
