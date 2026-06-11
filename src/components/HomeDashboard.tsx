import { useState, useEffect, useRef } from "react";
import { 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  DollarSign, 
  Plane, 
  MessageCircle, 
  Briefcase, 
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { NavTab } from "../types";
import { db } from "../lib/firebase";
import { collection, getDocs, getDoc, doc, query, where, orderBy } from "firebase/firestore";

interface HomeDashboardProps {
  onServiceSelect: (tab: NavTab, subView?: string) => void;
  walletBalance: number;
  exchangeRate?: number;
  userName?: string;
}

export default function HomeDashboard({ onServiceSelect, walletBalance, exchangeRate, userName }: HomeDashboardProps) {
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbRates, setDbRates] = useState({
    bkash: 110.50,
    nagad: 110.60,
    bank: 110.80,
    usdRate: 110.80
  });
  
  const [newsIndex, setNewsIndex] = useState<number>(0);
  const [tickerList, setTickerList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);

  const defaultScrollingNews = [
    {tag:'ভিসা', text:'কম্বোডিয়ায় নতুন E-Visa নিয়ম চালু — আবেদন এখন সম্পূর্ণ অনলাইনে'},
    {tag:'সতর্কতা', text:'ফনম পেনহে নতুন স্ক্যাম চক্র সক্রিয় — অপরিচিত এজেন্ট থেকে সাবধান'},
    {tag:'এক্সচেঞ্জ', text:'আজকের রেট: 1 USD = 110.80 BDT — Western Union এ সবচেয়ে ভালো রেট'},
    {tag:'চাকরি', text:'Phnom Penh এ নতুন বাংলাদেশি রেস্টুরেন্টে কর্মী নিয়োগ — যোগাযোগ করুন'},
    {tag:'জরুরি', text:'কম্বোডিয়া ইমিগ্রেশন অফিসের নতুন সময়সূচি: সকাল ৮টা — বিকাল ৫টা'},
  ];

  const defaultNewsCards = [
    {
      id: "news-1",
      title: "কম্বোডিয়ার নতুন ভিসা নীতি",
      date: "আজ",
      tag: "ভিসা আপডেট",
      desc: "ভিসা এক্সটেনশনের ক্ষেত্রে অনলাইন আবেদন গ্রহণের প্রক্রিয়া সহজ করা হয়েছে। যেকোনো দালাল ছাড়া সরাসরি ইমিগ্রেশনে আবেদন করার সুযোগ আছে।"
    },
    {
      id: "news-2",
      title: "বিকাশ ও নগদে টাকা প্রেরণে সতর্কতা",
      date: "গতকাল",
      tag: "স্ক্যাম সতর্কতা",
      desc: "অবৈধ হুন্ডি চক্র থেকে নিরাপদ থাকতে হবে ভাই। হুন্ডিতে পাঠানো টাকা আটকে গেলে দূতাবাস আইনি সাহায্য দিতে পারে না। বিশ্বস্ত ব্যাংক চ্যানেল ব্যবহার করুন।"
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

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

        // 2. Fetch Ticker
        const tickerSnap = await getDocs(collection(db, "ticker"));
        if (!tickerSnap.empty) {
          const fetchedTickers = tickerSnap.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                message: data.message,
                isActive: data.isActive !== undefined ? data.isActive : true,
                order: data.order !== undefined ? Number(data.order) : 999
              };
            })
            .filter(t => t.isActive === true)
            .sort((a, b) => a.order - b.order)
            .map(t => ({
              tag: "তথ্য",
              text: t.message
            }));
          setTickerList(fetchedTickers.length > 0 ? fetchedTickers : defaultScrollingNews);
        } else {
          setTickerList(defaultScrollingNews);
        }

        // 3. Fetch News
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
        console.error("Error loading home dashboard data from firestore:", err);
        // Fallbacks
        setTickerList(defaultScrollingNews);
        setNewsList(defaultNewsCards);
      } finally {
        setDbLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || tickerList.length === 0) return;

    const interval = setInterval(() => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 240, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tickerList]);

  const bdtRate = dbRates.usdRate;
  const currentNewsList = newsList.length > 0 ? newsList : defaultNewsCards;
  const currentTickerList = tickerList.length > 0 ? tickerList : defaultScrollingNews;

  const handleNextNews = () => {
    setNewsIndex((prev) => (prev + 1) % currentNewsList.length);
  };

  const handlePrevNews = () => {
    setNewsIndex((prev) => (prev - 1 + currentNewsList.length) % currentNewsList.length);
  };


  // 6 grid services
  const gridServices = [
    {
      id: "visa",
      label: "ভিসা তথ্য",
      icon: FileText,
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-400",
      action: () => onServiceSelect("services", "visa")
    },
    {
      id: "money",
      label: "টাকা পাঠান",
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400",
      action: () => onServiceSelect("transfer")
    },
    {
      id: "ticket",
      label: "এয়ার টিকেট",
      icon: Plane,
      color: "from-indigo-500/20 to-purple-500/10",
      iconColor: "text-indigo-400",
      action: () => onServiceSelect("services", "ticket")
    },
    {
      id: "ai_chat",
      label: "AI সহায়তা",
      icon: MessageCircle,
      color: "from-amber-500/20 to-yellow-500/10",
      iconColor: "text-amber-400",
      action: () => onServiceSelect("chat")
    },
    {
      id: "scam",
      label: "স্ক্যাম রিপোর্ট",
      icon: ShieldAlert,
      color: "from-red-500/20 to-orange-500/10",
      iconColor: "text-red-400",
      action: () => onServiceSelect("services", "scam")
    },
    {
      id: "job",
      label: "চাকরি বোর্ড",
      icon: Briefcase,
      color: "from-emerald-600/20 to-emerald-800/10",
      iconColor: "text-emerald-300",
      action: () => onServiceSelect("services", "jobs")
    }
  ];

  if (dbLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-[#F7F8FA]">
        <Loader2 className="w-8 h-8 text-[#1B4F72] animate-spin" />
        <p className="text-xs text-[#6B7280]">ডাটাবেজ লোড হচ্ছে ভাই...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 pb-20 bg-[#F7F8FA]">
      {/* Greetings section */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]" style={{borderWidth:'0.5px'}}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-medium text-[#1A1A2E] font-sans">
                আস-সালামু আলাইকুম {userName || "প্রবাসী"} ভাই 👋
              </h2>
              <p className="text-xs text-[#6B7280] mt-1 font-sans">— প্রবাসী সেবা প্লাটফর্মে আপনাকে স্বাগতম</p>
            </div>
            <div className="inline-flex items-center gap-1 bg-[#E8F8F1] text-[#0F6E56] text-[11px] px-2.5 py-1 rounded-full mt-3 border border-[#C6EFE0]" style={{borderWidth:'0.5px'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
              <span className="text-[10px] font-sans font-semibold">অনলাইন</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice Banner (Static, Styled Alert) */}
      <div 
        className="mx-4 p-4 flex items-start space-x-3 shadow-sm select-none"
        style={{
          backgroundColor: '#FEF3CD',
          border: '1.5px solid #F5A623',
          borderRadius: '12px'
        }}
      >
        <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#D68910' }} />
        <div className="font-sans text-left">
          <h4 className="text-[13px] font-medium leading-none mb-1.5 animate-pulse" style={{ color: '#7D5000' }}>
            ⚠️ গুরুত্বপূর্ণ নোটিশ ও সতর্কবার্তা:
          </h4>
          <p className="text-[12px] leading-relaxed" style={{ color: '#92400E' }}>
            আপনার কষ্টের টাকার শতভাগ নিরাপত্তা ও গভীর বিশ্বাসই আমাদের প্রধান অঙ্গীকার! কোনো দ্বিধা ছাড়াই আমাদের সততা ও দ্রুত সেবা যাচাই করতে মাত্র ১ ডলার পাঠিয়ে আজই চেক করে দেখুন ভাই।
          </p>
        </div>
      </div>

      {/* Wallet Balance Card & Live Rate Card */}
      <div className="px-4">
        <div className="bg-[#1B4F72] rounded-2xl p-5" id="wallet-balance-card">
          <div className="relative flex justify-between items-start text-left">
            <div>
              <p className="text-[11px] text-[#7FB3D3] font-sans">
                আপনার মেম্বার ওয়ালেট (Wallet Balance)
              </p>
              <h3 className="text-3xl font-medium text-white mt-1 font-sans">
                ${walletBalance.toFixed(2)}
                <span className="text-xs text-[#7FB3D3] ml-1.5 font-normal font-sans">USD</span>
              </h3>
            </div>
            
            <div className="px-2.5 py-1 rounded-lg bg-white/15 text-[10px] text-white font-sans">
              ফ্রি অ্যাকাউন্ট
            </div>
          </div>

          {/* Money Transfer Shortcut Rate Display */}
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center gap-1.5 text-xs font-sans select-none">
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse shrink-0"></span>
              <span className="text-[#7FB3D3] text-[11px] whitespace-nowrap">আজকের লাইভ টাকার সঠিক রেট:</span>
            </div>
            <div className="flex items-center gap-1 text-white font-medium text-[13px] bg-white/10 px-3 py-1 rounded-lg whitespace-nowrap shrink-0">
              <span className="whitespace-nowrap">1 USD = {bdtRate.toFixed(2)} BDT</span>
            </div>
          </div>

          {/* Money/Wallet Section Enhancement */}
          <div style={{marginTop:'10px', paddingTop:'10px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between'}}>
            <div>
              <p style={{color:'#7FB3D3', fontSize:'10px'}}>bKash রেট</p>
              <p style={{color:'white', fontSize:'12px', fontWeight:'500'}}>{dbRates.bkash.toFixed(2)} BDT</p>
            </div>
            <div>
              <p style={{color:'#7FB3D3', fontSize:'10px'}}>Nagad রেট</p>
              <p style={{color:'white', fontSize:'12px', fontWeight:'500'}}>{dbRates.nagad.toFixed(2)} BDT</p>
            </div>
            <div>
              <p style={{color:'#7FB3D3', fontSize:'10px'}}>Bank রেট</p>
              <p style={{color:'white', fontSize:'12px', fontWeight:'500'}}>{dbRates.bank.toFixed(2)} BDT</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => onServiceSelect("deposit")}
              className="h-11 bg-[#1D9E75] text-white text-xs font-semibold rounded-[10px] flex items-center justify-center gap-1.5 hover:bg-opacity-90 transition-all font-sans select-none border-none cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>ডিপোজিট করুন</span>
            </button>
            <button
              onClick={() => onServiceSelect("transfer")}
              className="h-11 bg-[#1B4F72] text-white text-xs font-semibold rounded-[10px] flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all font-sans select-none border border-white/30 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>বাংলাদেশে পাঠান</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Assist Pulsing Button */}
      <div className="px-4">
        <button
          onClick={() => onServiceSelect("services", "emergency")}
          className="w-full h-14 bg-[#FDEDEC] border border-[#E74C3C] rounded-xl flex items-center justify-center gap-3 text-[#C0392B] text-[15px] font-medium cursor-pointer focus:outline-none"
          id="btn-main-emergency-sos"
        >
          <AlertOctagon className="w-5 h-5 text-[#E74C3C]" />
          <span className="font-sans font-medium text-base text-[#C0392B]">জরুরি সাহায্য (SOS Contact)</span>
        </button>
      </div>

      {/* 6 Grid Icons Services */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-[#1A1A2E] font-sans">
            আমাদের সেবাসমূহ (Our Services)
          </h4>
          <span className="text-[11px] text-[#6B7280] font-sans">২x৩ গ্রিড ক্লিক করুন</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3.5">
          {gridServices.map((service) => {
            const Icon = service.icon;
            let iconBg = '#F0F3F4';
            let iconClr = '#444441';
            if (service.id === 'visa') {
              iconBg = '#EBF5FB';
              iconClr = '#1B6CA8';
            } else if (service.id === 'money') {
              iconBg = '#E9F7EF';
              iconClr = '#1D9E75';
            } else if (service.id === 'ticket') {
              iconBg = '#EEF2FF';
              iconClr = '#534AB7';
            } else if (service.id === 'ai_chat') {
              iconBg = '#FDF2E9';
              iconClr = '#D68910';
            } else if (service.id === 'scam') {
              iconBg = '#FDEDEC';
              iconClr = '#C0392B';
            } else if (service.id === 'job') {
              iconBg = '#F0F3F4';
              iconClr = '#444441';
            } else if (service.id === 'deposit') {
              iconBg = '#E9F7EF';
              iconClr = '#1D9E75';
            }

            return (
              <button
                key={service.id}
                onClick={service.action}
                className="bg-white rounded-2xl p-4 border flex flex-col items-start gap-2.5 cursor-pointer hover:border-[#1B4F72]/30 transition-colors"
                style={{borderColor: '#E5E7EB', borderWidth: '0.5px'}}
                id={`btn-service-${service.id}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: iconBg}}>
                  <Icon className="w-5.5 h-5.5" style={{color: iconClr}} />
                </div>
                <span className="text-[13px] font-medium text-[#1A1A2E] font-sans">
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Latest Updates Section (CHANGE 3) */}
      <div className="flex flex-col">
        <div className="text-[13px] font-medium text-[#1A1A2E] font-sans px-4 pt-3 pb-2 select-none text-left">
          সর্বশেষ আপডেট
        </div>
        <div 
          ref={scrollRef} 
          className="flex gap-2.5 overflow-x-auto px-4 no-scrollbar scroll-smooth pb-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}} />
          {currentTickerList.map((news, idx) => (
            <div 
              key={idx} 
              className="bg-white border p-3 min-w-[260px] max-w-[260px] shrink-0 font-sans text-left"
              style={{
                borderColor: '#E5E7EB',
                borderWidth: '0.5px',
                borderRadius: '12px'
              }}
            >
              <span 
                className="inline-block text-[10px] px-2 py-0.5 font-medium"
                style={{
                  backgroundColor: '#EBF5FB',
                  color: '#1B6CA8',
                  borderRadius: '20px'
                }}
              >
                {news.tag}
              </span>
              <p className="text-xs text-[#1A1A2E] mt-1.5 leading-normal font-normal">
                {news.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Swipeable Recent Community News Cards */}
      <div>
        <h4 className="text-sm font-medium text-[#1A1A2E] font-sans mb-3 px-4 text-left">
          সাম্প্রতিক বিজ্ঞপ্তি ও সংবাদ (Updates)
        </h4>

        {/* Swipeable container */}
        <div className="bg-white rounded-2xl p-4 border mx-4 text-left" style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}>
          <div>
            <div className="flex justify-between items-center">
              <span className="inline-block bg-[#EBF5FB] text-[#1B6CA8] text-[10px] px-2.5 py-0.5 rounded-full mb-2" style={{borderWidth:'0.5px', borderColor:'#BDD8F0'}}>
                {currentNewsList[newsIndex]?.tag}
              </span>
              <span className="text-[11px] text-[#6B7280] font-sans">{currentNewsList[newsIndex]?.date}</span>
            </div>
            <h4 className="text-[14px] font-medium text-[#1A1A2E] leading-snug mb-1 font-sans">
              {currentNewsList[newsIndex]?.title}
            </h4>
            <p className="text-[12px] text-[#4B5563] leading-relaxed mt-2 font-sans">
              {currentNewsList[newsIndex]?.desc}
            </p>
          </div>

          {/* Navigation arrows & dots container */}
          <div className="flex items-center justify-between mt-3">
            {/* Dots Indicator */}
            <div className="flex space-x-1">
              {currentNewsList.map((_, i) => (
                <span 
                  key={i} 
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ backgroundColor: i === newsIndex ? '#1B4F72' : '#E5E7EB', width: i === newsIndex ? '12px' : '6px' }}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-2 justify-end">
              <button 
                onClick={handlePrevNews}
                className="w-7 h-7 rounded-full bg-[#F7F8FA] border flex items-center justify-center cursor-pointer" 
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              >
                <ChevronLeft style={{color:'#6B7280', width:'14px', height:'14px'}} />
              </button>
              <button 
                onClick={handleNextNews}
                className="w-7 h-7 rounded-full bg-[#F7F8FA] border flex items-center justify-center cursor-pointer" 
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              >
                <ChevronRight style={{color:'#6B7280', width:'14px', height:'14px'}} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
