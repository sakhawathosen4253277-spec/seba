import { Bell } from "lucide-react";
import { LiveNotification } from "../types";
import { useState, useEffect } from "react";
import { onSnapshot, collection, query, orderBy, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import probashiLogo from "../assets/images/probashi_logo_1782647533324.jpg";

interface HeaderProps {
  notifications: LiveNotification[];
  unreadCount: number;
  onBellClick: () => void;
  lang: string;
  exchangeRate?: number;
  exchangeRateUnderTen?: number;
}

export default function Header({ unreadCount, onBellClick, exchangeRate = 110.80, exchangeRateUnderTen = 120.00 }: HeaderProps) {
  const [dbExchangeRate, setDbExchangeRate] = useState<number>(exchangeRate);
  const [dbExchangeRateUnderTen, setDbExchangeRateUnderTen] = useState<number>(exchangeRateUnderTen);
  const [rates, setRates] = useState({
    bkash: 110.80,
    nagad: 110.50,
    rocket: 110.70,
    bank: 110.20,
  });
  const [dbTickerItems, setDbTickerItems] = useState<string[]>([]);
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [aiNewsItems, setAiNewsItems] = useState<string[]>([]);

  const [shouldWiggle, setShouldWiggle] = useState(false);
  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);

  // Trigger animation when unreadCount increases
  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      setShouldWiggle(true);
      const timer = setTimeout(() => setShouldWiggle(false), 800);
      return () => clearTimeout(timer);
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount]);

  // Function to dynamically replace static rates in messages with correct live rates in real-time
  const formatTickerMessage = (message: string, currentRates: typeof rates): string => {
    let formatted = message;
    // Replace placeholders with correct rates
    formatted = formatted.replace(/{bkash}/gi, `${currentRates.bkash.toFixed(2)}`);
    formatted = formatted.replace(/{nagad}/gi, `${currentRates.nagad.toFixed(2)}`);
    formatted = formatted.replace(/{rocket}/gi, `${currentRates.rocket.toFixed(2)}`);
    formatted = formatted.replace(/{bank}/gi, `${currentRates.bank.toFixed(2)}`);

    const regex = /1\s*USD\s*=\s*\d+(?:\.\d+)?/gi;
    if (regex.test(formatted)) {
      const maxRate = Math.max(currentRates.bkash, currentRates.nagad, currentRates.rocket, currentRates.bank);
      formatted = formatted.replace(regex, `1 USD = ${maxRate.toFixed(2)}`);
    }
    return formatted;
  };

  // Sync with prop when prop updates
  useEffect(() => {
    if (exchangeRate !== undefined) {
      setDbExchangeRate(exchangeRate);
    }
  }, [exchangeRate]);

  useEffect(() => {
    if (exchangeRateUnderTen !== undefined) {
      setDbExchangeRateUnderTen(exchangeRateUnderTen);
    }
  }, [exchangeRateUnderTen]);

  // Subscribe directly to real-time current exchange rates
  useEffect(() => {
    const unsubRate = onSnapshot(doc(db, "exchangeRates", "current"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentRates = {
          bkash: data.bkash !== undefined ? Number(data.bkash) : 110.80,
          nagad: data.nagad !== undefined ? Number(data.nagad) : 110.50,
          rocket: data.rocket !== undefined ? Number(data.rocket) : 110.70,
          bank: data.bank !== undefined ? Number(data.bank) : 110.20,
        };
        setRates(currentRates);

        if (data.usdRate !== undefined) {
          setDbExchangeRate(Number(data.usdRate));
        } else if (data.bkash !== undefined) {
          setDbExchangeRate(Number(data.bkash));
        }
        if (data.exchangeRateUnderTen !== undefined) {
          setDbExchangeRateUnderTen(Number(data.exchangeRateUnderTen));
        }
      }
    }, (err) => {
      console.warn("Header exchange rate subscription failed:", err);
    });

    return () => unsubRate();
  }, []);

  // Subscribe directly to active admin-defined ticker messages
  useEffect(() => {
    const q = query(collection(db, "ticker"), orderBy("order", "asc"));
    const unsubTicker = onSnapshot(q, (snapshot) => {
      const messages: string[] = [];
      snapshot.forEach((dt) => {
        const val = dt.data();
        if (val.isActive !== false && val.message) {
          messages.push(val.message);
        }
      });
      setDbTickerItems(messages);
    }, (err) => {
      console.warn("Header ticker subscription failed:", err);
    });

    return () => unsubTicker();
  }, []);

  useEffect(() => {
    async function loadGeneratedNews() {
      try {
        const response = await fetch("/api/generate-news");
        if (response.ok) {
          const aiNews = await response.json();
          if (Array.isArray(aiNews) && aiNews.length > 0) {
            setAiNewsItems(aiNews);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch generated news, using defaults:", err);
      }
    }

    loadGeneratedNews();
    // Poll news updates every 30 minutes
    const interval = setInterval(loadGeneratedNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function shuffleArray(array: string[]) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Determine the baseline list of scrolling news
    let baseItems = [...dbTickerItems];

    const defaultRateString = `💰 আজকের রেট: ১ USD = বিকাশ: ${rates.bkash.toFixed(2)} ৳ | নগদ: ${rates.nagad.toFixed(2)} ৳ | রকেট: ${rates.rocket.toFixed(2)} ৳ | ব্যাংক: ${rates.bank.toFixed(2)} ৳`;

    if (baseItems.length === 0) {
      // Fallback default set if there are no ticker items in the database yet
      baseItems = [
        "💸 প্রবাসী সেবায় টাকা পাঠান — ৫ মিনিট থেকে ২ ঘণ্টায় দেশে পৌঁছায়",
        "✅ আজ পর্যন্ত ১০০% সফল ট্রান্সফার — আমাদের বিশ্বাস করুন ভাই",
        "🆘 বিপদে পড়লে: Bangladesh Consulate +855-23-210-822",
        "📋 ভিসার মেয়াদ শেষ হওয়ার আগেই extension করুন — app এ ভিসা তথ্য দেখুন",
        "🚫 দালালকে passport দেবেন না — এটা বেআইনি",
        defaultRateString,
        "🎫 এয়ার টিকেট দরকার? আমাদের WhatsApp করুন: +855762012121",
        "⚠️ Facebook এ সস্তা ভিসার অফার = স্ক্যাম — সাবধান থাকুন",
      ];
    } else {
      // Format existing items from database with the live rate replacement helper
      baseItems = baseItems.map(item => formatTickerMessage(item, rates));

      // Ensure that if no database ticker mentions any rate keywords, we automatically append the high contrast live rate banner
      const hasRateMsg = baseItems.some(msg => /বিকাশ|নগদ|রকেট|ব্যাংক|USD|রেট/i.test(msg));
      if (!hasRateMsg) {
        baseItems.unshift(defaultRateString);
      }
    }

    const combined = [...baseItems, ...aiNewsItems.map(item => formatTickerMessage(item, rates))];
    setTickerItems(shuffleArray(combined));
  }, [rates, dbTickerItems, aiNewsItems]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E7EB]" style={{ borderBottomWidth: "0.5px" }}>
      {/* Brand & Notifications Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left Side: Logo & Labels */}
        <div className="flex items-center space-x-2.5">
          {/* Logo box */}
          <img 
            src={probashiLogo} 
            alt="প্রবাসী সেবা" 
            className="w-9 h-9 rounded-[10px] object-cover select-none shrink-0 border border-gray-100"
            referrerPolicy="no-referrer"
            style={{ borderWidth: "0.5px" }}
          />
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
            className={`w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center relative active:scale-95 transition-all outline-none ${shouldWiggle ? "border-[#E74C3C]" : ""}`}
            style={{ borderWidth: "0.5px" }}
            id="btn-bell-notifications"
          >
            <Bell className={`w-4.5 h-4.5 text-[#1A1A2E] transition-all ${shouldWiggle ? "animate-wiggle text-[#E74C3C]" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-4.5 flex items-center justify-center rounded-full bg-[#E74C3C] text-white text-[9px] font-sans font-medium px-1 leading-none shadow-sm animate-pulse">
                {unreadCount}
              </span>
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
