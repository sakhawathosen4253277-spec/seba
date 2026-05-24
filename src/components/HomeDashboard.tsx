import { useState, useEffect } from "react";
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
  ChevronLeft
} from "lucide-react";
import { NavTab } from "../types";

interface HomeDashboardProps {
  onServiceSelect: (tab: NavTab, subView?: string) => void;
  walletBalance: number;
}

export default function HomeDashboard({ onServiceSelect, walletBalance }: HomeDashboardProps) {
  const [bdtRate, setBdtRate] = useState<number>(110.50);
  const [newsIndex, setNewsIndex] = useState<number>(0);

  // Animate the exchange rate slightly for realistic "live stream" feel
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate micro fluctuations around 110.50 - 110.95 BDT per USD
      const fluctuation = parseFloat((110.40 + Math.random() * 0.6).toFixed(2));
      setBdtRate(fluctuation);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const newsCards = [
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
    },
    {
      id: "news-3",
      title: "কম্বোডিয়ায় গার্মেন্টস কারখানায় নিয়োগ",
      date: "২ দিন আগে",
      tag: "চাকরির খবর",
      desc: "ফনম পেন এলাকায় সরকার-অনুমোদিত ৩টি গার্মেন্টস ফ্যাক্টরিতে ওয়ার্ক পারমিটসহ বাংলাদেশি কর্মী নেয়া হচ্ছে। আমাদের যাচাইকৃত চাকরি বোর্ডে বিবরণ দেখুন।"
    }
  ];

  const handleNextNews = () => {
    setNewsIndex((prev) => (prev + 1) % newsCards.length);
  };

  const handlePrevNews = () => {
    setNewsIndex((prev) => (prev - 1 + newsCards.length) % newsCards.length);
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
      action: () => onServiceSelect("services", "money")
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

  return (
    <div className="flex flex-col space-y-5 pb-20 animate-fade-in">
      {/* Greetings section */}
      <div className="flex justify-between items-center px-4 mt-2">
        <div>
          <h2 className="text-xl font-bold font-sans text-white">
            আস-সালামু আলাইকুম ভাই <span className="text-emerald-400">👋</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">প্রবাসী সেবা প্লাটফর্মে আপনাকে স্বাগতম</p>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-sans font-semibold text-emerald-400">অনলাইন</span>
        </div>
      </div>

      {/* Wallet Balance Card & Live Rate Card */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-2xl glass-glow-card p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 border-emerald-500/20">
          {/* Subtle logo watermarks */}
          <div className="absolute right-0 bottom-0 opacity-10">
            <CreditCard className="w-40 h-40 text-emerald-400 -mr-6 -mb-6" />
          </div>

          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-bold font-sans">
                আপনার মেম্বার ওয়ালেট (Wallet Balance)
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight text-white mt-1.5 flex items-baseline font-sans">
                ${walletBalance.toFixed(2)}
                <span className="text-xs text-slate-400 ml-1.5 font-normal font-sans">USD</span>
              </h3>
            </div>
            
            <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 font-sans">
              ফ্রি অ্যাকাউন্ট
            </div>
          </div>

          {/* Money Transfer Shortcut Rate Display */}
          <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center text-xs font-sans">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 text-[11px]">আজকের লাইভ টাকার সঠিক রেট:</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-400 font-extrabold text-sm text-[13px] tracking-tight bg-emerald-950/50 px-2.5 py-0.75 rounded border border-emerald-500/20">
              <span>1 USD =</span>
              <span className="transition-all duration-300 transform font-mono text-emerald-300">
                {bdtRate.toFixed(2)}
              </span>
              <span>BDT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Assist Pulsing Button */}
      <div className="px-4">
        <button
          onClick={() => onServiceSelect("services", "emergency")}
          className="w-full h-14 glow-red-btn animate-pulse-red rounded-xl flex items-center justify-center space-x-3 text-white text-[15px] font-bold tracking-wide border border-red-500/45 focus:outline-none focus:ring-2 focus:ring-red-400 select-none cursor-pointer"
          id="btn-main-emergency-sos"
        >
          <AlertOctagon className="w-5.5 h-5.5 stroke-[2.5] animate-bounce text-white" />
          <span className="font-sans font-bold text-center text-base">জরুরি সাহায্য (SOS Contact)</span>
        </button>
      </div>

      {/* 6 Grid Icons Services */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
            আমাদের সেবাসমূহ (Our Services)
          </h4>
          <span className="text-[10px] text-slate-400 font-sans">২x৩ গ্রিড ক্লিক করুন</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3.5">
          {gridServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={service.action}
                className={`flex flex-col items-center justify-center p-4.5 rounded-xl border border-slate-800 bg-gradient-to-br ${service.color} hover:border-emerald-500/40 active:scale-95 transition-all text-center group relative cursor-pointer outline-none`}
                id={`btn-service-${service.id}`}
              >
                <div className={`p-3 rounded-full bg-slate-900 border border-slate-800 ${service.iconColor} mb-2.5 group-hover:scale-110 transition-transform shadow-inner`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <span className="text-white font-medium text-xs font-sans">
                  {service.label}
                </span>
                
                {/* Micro accent block */}
                <span className="absolute bottom-1 right-2 w-0 h-0.5 bg-emerald-400 group-hover:w-8 transition-all duration-300 rounded" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipeable Recent Community News Cards */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
            সাম্প্রতিক বিজ্ঞপ্তি ও সংবাদ (Updates)
          </h4>
          <div className="flex items-center space-x-1">
            <button 
              onClick={handlePrevNews}
              className="p-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500 font-sans">
              {newsIndex + 1}/{newsCards.length}
            </span>
            <button 
              onClick={handleNextNews}
              className="p-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Swipeable container */}
        <div className="relative overflow-hidden rounded-xl bg-slate-950 p-4 border border-slate-900 min-h-[140px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {newsCards[newsIndex].tag}
              </span>
              <span className="text-[10px] text-slate-500 font-sans">{newsCards[newsIndex].date}</span>
            </div>
            <h5 className="text-sm font-bold text-white mb-1.5 font-sans">
              {newsCards[newsIndex].title}
            </h5>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {newsCards[newsIndex].desc}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-1 mt-3">
            {newsCards.map((_, i) => (
              <span 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === newsIndex ? "bg-emerald-400 w-3" : "bg-slate-700"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
