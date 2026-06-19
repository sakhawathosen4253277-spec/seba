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

export default function Header({ unreadCount, onBellClick }: HeaderProps) {
  const [tickerItems, setTickerItems] = useState<string[]>([
    "💸 প্রবাসী সেবায় টাকা পাঠান — ৫ মিনিট থেকে ২ ঘণ্টায় দেশে পৌঁছায়",
    "✅ আজ পর্যন্ত ১০০% সফল ট্রান্সফার — আমাদের বিশ্বাস করুন ভাই",
    "🆘 বিপদে পড়লে: Bangladesh Consulate +855-23-210-822",
    "📋 ভিসার মেয়াদ শেষ হওয়ার আগেই extension করুন — app এ ভিসা তথ্য দেখুন",
    "🚫 দালালকে passport দেবেন না — এটা বেআইনি",
    "💰 আজকের রেট: 1 USD = 110.80 BDT — সবচেয়ে ভালো রেট আমাদের কাছে",
    "🎫 এয়ার টিকেট দরকার? আমাদের WhatsApp করুন: +855762012121",
    "⚠️ Facebook এ সস্তা ভিসার অফার = স্ক্যাম — সাবধান থাকুন",
  ]);

  useEffect(() => {
    function shuffleArray(array: string[]) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    async function loadGeneratedNews() {
      try {
        const response = await fetch("/api/generate-news");
        const staticItems = [
          "💸 প্রবাসী সেবায় টাকা পাঠান — ৫ মিনিট থেকে ২ ঘণ্টায় দেশে পৌঁছায়",
          "✅ আজ পর্যন্ত ১০০% সফল ট্রান্সফার — আমাদের বিশ্বাস করুন ভাই",
          "🆘 বিপদে পড়লে: Bangladesh Consulate +855-23-210-822",
          "📋 ভিসার মেয়াদ শেষ হওয়ার আগেই extension করুন — app এ ভিসা তথ্য দেখুন",
          "🚫 দালালকে passport দেবেন না — এটা বেআইনি",
          "💰 আজকের রেট: 1 USD = 110.80 BDT — সবচেয়ে ভালো রেট আমাদের কাছে",
          "🎫 এয়ার টিকেট দরকার? আমাদের WhatsApp করুন: +855762012121",
          "⚠️ Facebook এ সস্তা ভিসার অফার = স্ক্যাম — সাবধান থাকুন",
        ];

        if (response.ok) {
          const aiNews = await response.json();
          if (Array.isArray(aiNews) && aiNews.length > 0) {
            const combined = [...staticItems, ...aiNews];
            setTickerItems(shuffleArray(combined));
            return;
          }
        }
        setTickerItems(shuffleArray(staticItems));
      } catch (err) {
        console.warn("Failed to fetch generated news, using defaults:", err);
      }
    }

    loadGeneratedNews();
    // Poll news updates every 30 minutes
    const interval = setInterval(loadGeneratedNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E7EB]" style={{ borderBottomWidth: "0.5px" }}>
      {/* Brand & Notifications Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left Side: Logo & Labels */}
        <div className="flex items-center space-x-2.5">
          {/* Logo box */}
          <div className="w-9 h-9 rounded-[10px] bg-[#1B4F72] flex items-center justify-center select-none shrink-0 text-white text-[11px] font-sans font-medium">
            সেবা
          </div>
          <div className="flex flex-col justify-center text-left">
            <h1 className="text-[15px] font-medium text-[#1A1A2E] leading-tight">
              • প্রবাসী সেবা •
            </h1>
            <p className="text-[10px] text-[#6B7280] font-sans font-normal leading-none mt-0.5">
              কম্বোডিয়া • বাংলাদেশ
            </p>
          </div>
        </div>

        {/* Right Side: Notification Bell */}
        <div className="flex items-center">
          {/* Bell Button */}
          <button
            onClick={onBellClick}
            className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center relative active:scale-95 transition-all outline-none"
            style={{ borderWidth: "0.5px" }}
            id="btn-bell-notifications"
          >
            <Bell className="w-4.5 h-4.5 text-[#1A1A2E]" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E74C3C]" />
            )}
          </button>
        </div>
      </div>

      {/* Live News Ticker */}
      <div className="flex items-center bg-[#1B4F72] px-3 h-8 overflow-hidden select-none">
        {/* Live Badge */}
        <div className="bg-[#E74C3C] text-white text-[10px] px-1.5 py-0.5 rounded-[4px] font-sans shrink-0 font-medium leading-none">
          লাইভ
        </div>

        {/* Beautiful scrolling marquee animation */}
        <div className="relative flex-1 overflow-hidden pl-2.5 text-left flex items-center">
          <div 
            className="whitespace-nowrap animate-marquee text-[11px] text-white/90 font-sans inline-block"
            style={{ animationDuration: "240s" }}
          >
            {tickerItems.join("   •   ")}
          </div>
        </div>
      </div>
    </header>
  );
}
