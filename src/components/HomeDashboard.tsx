import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  DollarSign, 
  Plane, 
  MessageCircle, 
  Briefcase, 
  AlertOctagon,
  ChevronRight,
  Loader2
} from "lucide-react";
import { NavTab } from "../types";
import { db } from "../lib/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

interface HomeDashboardProps {
  onServiceSelect: (tab: NavTab, subView?: string) => void;
  walletBalance: number;
  exchangeRate?: number;
  userName?: string;
}

export default function HomeDashboard({ onServiceSelect, walletBalance, userName }: HomeDashboardProps) {
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbRates, setDbRates] = useState({
    bkash: 110.50,
    nagad: 110.60,
    bank: 110.80,
    usdRate: 110.80
  });
  
  const [newsList, setNewsList] = useState<any[]>([]);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);

  const defaultNewsCards = [
    {
      id: "news-1",
      title: "কম্বোডিয়ার নতুন visa নীতি",
      date: "আজ",
      tag: "ভিসা আপডেট",
      desc: "ভিসা এক্সটেনশনের ক্ষেত্রে অনলাইন আবেদন গ্রহণের প্রক্রিয়া সহজ করা হয়েছে। যেকোনো দালাল ছাড়া সরাসরি ইমিগ্রেশনে আবেদন করার সুযোগ আছে।"
    },
    {
      id: "news-2",
      title: "বিকাশ ও নগদে টাকা প্রেরণে সতর্কতা",
      date: "yesterday",
      tag: "স্ক্যাম সতর্কতা",
      desc: "অবৈধ হুন্ডি চক্র থেকে নিরাপদ থাকতে হবে ভাই। হুন্ডিতে পাঠানো টাকা আটকে গেলে দূতাবাস আইনি সাহায্য দিতে পারে না। বিশ্বস্ত ব্যাংক চ্যানেল ব্যবহার করুন।"
    }
  ];

  // Fetch Firestore Data
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch Exchange rates
        const rateSnap = await getDoc(doc(db, "exchangeRates", "current"));
        if (rateSnap.exists()) {
          const r = rateSnap.data();
          setDbRates({
            bkash: r.bkash || 110.50,
            nagad: r.nagad || 110.60,
            bank: r.bank || 110.80,
            usdRate: r.usdRate || 110.80
          });
        }

        // 2. Fetch News
        const newsSnap = await getDocs(collection(db, "news"));
        if (!newsSnap.empty) {
          const fetchedNews = newsSnap.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title,
                date: data.date || "আজ",
                tag: data.tag || "বিজ্ঞপ্তি",
                desc: data.description,
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdAt: data.createdAt || ""
              };
            })
            .filter(n => n.isActive === true)
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setNewsList(fetchedNews.length > 0 ? fetchedNews : defaultNewsCards);
        } else {
          setNewsList(defaultNewsCards);
        }
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : String(err);
        const isOffline = errMessage.toLowerCase().includes("offline") || 
                          errMessage.toLowerCase().includes("failed to get document") ||
                          errMessage.toLowerCase().includes("network");
        if (isOffline) {
          console.warn("Home dashboard database load skipped (offline):", errMessage);
        } else {
          console.error("Error loading home dashboard data from firestore:", err);
        }
        // Fallbacks
        setNewsList(defaultNewsCards);
      } finally {
        setDbLoading(false);
      }
    }
    loadData();
  }, []);

  const currentNewsList = newsList.length > 0 ? newsList : defaultNewsCards;

  // Trigger important popup alert if found
  useEffect(() => {
    if (!dbLoading && currentNewsList.length > 0) {
      const importantItem = currentNewsList.find(item => 
        item.tag?.includes("সতর্কতা") || 
        item.tag?.includes("জরুরি") || 
        item.tag?.includes("গুরুত্বপূর্ণ") ||
        item.tag?.includes("অ্যালার্ট")
      );
      if (importantItem) {
        setActiveAlert(importantItem);
        setAlertOpen(true);

        const timer = setTimeout(() => {
          setAlertOpen(false);
        }, 10000); // 10-second automatic timer to close smoothly

        return () => clearTimeout(timer);
      }
    }
  }, [dbLoading, currentNewsList]);

  // 6 grid services
  const gridServices = [
    {
      id: "visa",
      label: "ভিসা তথ্য",
      icon: FileText,
      action: () => onServiceSelect("services", "visa")
    },
    {
      id: "money",
      label: "টাকা পাঠান",
      icon: DollarSign,
      action: () => onServiceSelect("transfer")
    },
    {
      id: "ticket",
      label: "এয়ার টিকেট",
      icon: Plane,
      action: () => onServiceSelect("services", "ticket")
    },
    {
      id: "ai_chat",
      label: "AI সহায়তা",
      icon: MessageCircle,
      action: () => onServiceSelect("chat")
    },
    {
      id: "scam",
      label: "স্ক্যাম রিপোর্ট",
      icon: ShieldAlert,
      action: () => onServiceSelect("services", "scam")
    },
    {
      id: "job",
      label: "চাকরির বোর্ড",
      icon: Briefcase,
      action: () => onServiceSelect("services", "jobs")
    }
  ];

  if (dbLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-[#F7F8FA]">
        <Loader2 className="w-8 h-8 text-[#1B4F72] animate-spin" />
        <p className="text-[12px] text-[#6B7280] font-sans font-normal">ডাটাবেজ লোড হচ্ছে ভাই...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 bg-[#F7F8FA]" style={{ paddingBottom: "80px" }}>
      
      {/* 1. Wallet Card - #1B4F72 background, balance */}
      <div className="px-4 text-left">
        <div 
          className="bg-[#1B4F72] text-white" 
          style={{ padding: '20px', borderRadius: '16px' }}
          id="wallet-balance-card"
        >
          {/* Greeting & Balance Block */}
          <div className="mb-4 text-left font-sans">
            <h2 className="text-[16px] font-medium text-white/90 mb-1">
              আস-সালামু আলাইকুম ভাই 👋
            </h2>
            <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.7)' }}>
              আপনার মেম্বার ওয়ালেট (Wallet Balance)
            </p>
            <h3 className="text-[34px] font-semibold leading-none font-sans mt-2 text-white">
              ${walletBalance.toFixed(2)}
              <span className="text-[12px] ml-1.5 font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>USD</span>
            </h3>
          </div>

          {/* Quick Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onServiceSelect("deposit")}
              className="flex items-center justify-center gap-2 cursor-pointer font-sans font-medium select-none text-white hover:bg-white/20 active:scale-95 transition-all outline-none"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '0.5px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                height: '50px',
                flex: 1
              }}
            >
              <CreditCard className="w-5 h-5" />
              <span>ডিপোজিট করুন</span>
            </button>
            <button
              onClick={() => onServiceSelect("transfer")}
              className="flex items-center justify-center gap-2 cursor-pointer font-sans font-medium select-none text-white hover:bg-white/20 active:scale-95 transition-all outline-none"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '0.5px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                height: '50px',
                flex: 1
              }}
            >
              <DollarSign className="w-5 h-5" />
              <span>টাকা পাঠান</span>
            </button>
          </div>

          {/* Custom rates block */}
          <div 
            className="grid grid-cols-3 text-center"
            style={{
              borderTop: '0.5px solid rgba(255,255,255,0.15)',
              paddingTop: '12px',
              marginTop: '16px'
            }}
          >
            <div className="border-r border-white/10">
              <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>bKash রেট</p>
              <p className="text-[12px] font-medium font-sans mt-0.5" style={{ color: '#FFFFFF' }}>{dbRates.bkash.toFixed(2)} BDT</p>
            </div>
            <div className="border-r border-white/10">
              <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>Nagad রেট</p>
              <p className="text-[12px] font-medium font-sans mt-0.5" style={{ color: '#FFFFFF' }}>{dbRates.nagad.toFixed(2)} BDT</p>
            </div>
            <div>
              <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>Bank রেট</p>
              <p className="text-[12px] font-medium font-sans mt-0.5" style={{ color: '#FFFFFF' }}>{dbRates.bank.toFixed(2)} BDT</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SOS Button - Red bordered card, full width, always visible */}
      <div className="px-4">
        <button
          onClick={() => onServiceSelect("services", "emergency")}
          className="w-full flex items-center justify-between bg-white cursor-pointer focus:outline-none"
          style={{
            borderLeft: '4px solid #E74C3C',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: 'none',
            borderTop: '0.5px solid #E5E7EB',
            borderRight: '0.5px solid #E5E7EB',
            borderBottom: '0.5px solid #E5E7EB'
          }}
          id="btn-main-emergency-sos"
        >
          <div className="flex items-center text-left">
            <div 
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: '#FDEDEC',
                color: '#E74C3C',
                borderRadius: '12px'
              }}
            >
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div className="ml-3">
              <h4 className="text-[14px] font-medium text-[#1A1A2E] leading-tight font-sans">
                জরুরি সাহায্য
              </h4>
              <p className="text-[11px] font-normal text-[#E74C3C] mt-0.5 font-sans">
                SOS • ২৪/৭ উপলব্ধ
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#6B7280]" />
        </button>
      </div>

      {/* 5. Services Grid - 2 column grid of white cards, same style */}
      <div className="px-4 text-left">
        <div className="flex items-center justify-between mb-2 text-left">
          <h4 className="text-[14px] font-medium text-[#1A1A2E] font-sans">
            আমাদের সেবাসমূহ (Our Services)
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pb-1">
          {gridServices.map((service) => {
            const Icon = service.icon;
            
            // Map individual service container bg and icon text color
            let cardBg = "#F0F3F4";
            let iconClr = "#444441";
            
            if (service.id === "visa") {
              cardBg = "#EBF5FB";
              iconClr = "#1B6CA8";
            } else if (service.id === "money") {
              cardBg = "#E8F8F1";
              iconClr = "#0F6E56";
            } else if (service.id === "ticket") {
              cardBg = "#EEF2FF";
              iconClr = "#534AB7";
            } else if (service.id === "ai_chat") {
              cardBg = "#FDF2E9";
              iconClr = "#D68910";
            } else if (service.id === "scam") {
              cardBg = "#FDEDEC";
              iconClr = "#C0392B";
            } else if (service.id === "job") {
              cardBg = "#F0F3F4";
              iconClr = "#444441";
            }

            return (
              <button
                key={service.id}
                onClick={service.action}
                className="bg-white hover:bg-gray-50 flex items-center text-left cursor-pointer select-none border border-[#E5E7EB] active:scale-98 transition-all outline-none"
                style={{
                  borderRadius: '14px',
                  borderWidth: '0.5px',
                  padding: '12px 14px'
                }}
                id={`btn-service-${service.id}`}
              >
                {/* Icon container: 40x40px, border-radius 12px */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-3" 
                  style={{ backgroundColor: cardBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: iconClr }} />
                </div>
                
                {/* Name */}
                <span className="text-[13px] font-medium text-[#1A1A2E] font-sans leading-tight">
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. News/Updates: List of clean white cards with category tags */}
      <div className="px-4 text-left">
        <h4 className="text-[14px] font-medium text-[#1A1A2E] font-sans mb-3 text-left">
          সর্বশেষ আপডেট ও বিজ্ঞপ্তি
        </h4>
        
        <div className="space-y-4">
          {currentNewsList.slice(0, 3).map((item) => {
            // Map category colors
            let categoryBg = "#EBF5FB";
            let categoryText = "#1B6CA8";

            if (item.tag?.includes("স্ক্যাম") || item.tag?.includes("সতর্কতা")) {
              categoryBg = "#FDEDEC";
              categoryText = "#C0392B";
            } else if (item.tag?.includes("টিকেট") || item.tag?.includes("ভ্রমণ")) {
              categoryBg = "#EEF2FF";
              categoryText = "#534AB7";
            } else if (item.tag?.includes("চাকরি") || item.tag?.includes("কাজ")) {
              categoryBg = "#F0F3F4";
              categoryText = "#444441";
            } else if (item.tag?.includes("ভিসা")) {
              categoryBg = "#EBF5FB";
              categoryText = "#1B6CA8";
            } else {
              categoryBg = "#E8F8F1";
              categoryText = "#0F6E56";
            }

            return (
              <div 
                key={item.id}
                className="bg-white border text-left p-4" 
                style={{
                  borderRadius: '14px',
                  borderColor: '#E5E7EB',
                  borderWidth: '0.5px'
                }}
              >
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <span 
                    className="inline-block font-sans font-medium text-[10px] px-2.5 py-0.5 rounded-[20px]"
                    style={{ backgroundColor: categoryBg, color: categoryText }}
                  >
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-[#6B7280] font-sans font-normal">
                    {item.date}
                  </span>
                </div>
                <h4 className="text-[13px] font-medium text-[#1A1A2E] leading-snug font-sans mb-1">
                  {item.title}
                </h4>
                <p className="text-[12px] text-[#6B7280] leading-relaxed font-sans font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgent Pop-up Alert Modal overlay for Migrant Workers */}
      {alertOpen && activeAlert && (
        <div id="urgent-popup-alert-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
          <div 
            className="bg-white rounded-[16px] max-w-sm w-full border border-[#E5E7EB] p-5 text-left flex flex-col font-sans relative shadow-md transform transition-all scale-100"
            style={{ borderWidth: '0.5px' }}
          >
            {/* Alert Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FDEDEC] flex items-center justify-center text-[#E74C3C] shrink-0">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
              </div>
              <span 
                className="inline-block text-[11px] px-2.5 py-0.5 rounded-[20px] font-medium"
                style={{ backgroundColor: '#FDEDEC', color: '#C0392B' }}
              >
                {activeAlert.tag}
              </span>
            </div>

            {/* Alert Title */}
            <h4 className="text-[15px] font-medium text-[#1A1A2E] leading-snug mb-2 font-sans">
              {activeAlert.title}
            </h4>

            {/* Alert Body */}
            <p className="text-[13px] text-[#6B7280] leading-relaxed font-sans font-normal mb-5 flex-1" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              {activeAlert.desc}
            </p>

            {/* Prominent Close Button */}
            <button
              onClick={() => setAlertOpen(false)}
              className="w-full h-[46px] flex items-center justify-center text-white cursor-pointer select-none outline-none font-sans font-medium hover:bg-[#153e5a] active:scale-95 transition-all"
              style={{
                backgroundColor: '#1B4F72',
                borderRadius: '12px',
                fontSize: '14px'
              }}
              id="btn-close-urgent-popup-alert"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
