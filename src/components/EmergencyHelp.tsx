import React, { useState } from "react";
import { AlertOctagon, PhoneCall, MapPin, MessageSquare, ShieldAlert, HeartPulse, FileX, Landmark } from "lucide-react";

interface EmergencyProps {
  onSwitchTab: (tab: "home" | "services" | "chat" | "notifications" | "profile") => void;
  onSendMessageToChat: (text: string) => void;
}

export default function EmergencyHelp({ onSwitchTab, onSendMessageToChat }: EmergencyProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("police");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Embassy Details
  const embassyContact = {
    name: "বাংলাদেশ দূতাবাস ও অনারারি প্রবাসী মিশন, কম্বোডিয়া",
    address: "House 26, Street 352, Boeung Keng Kang I, Phnom Penh",
    phone: "+855 23 210 500",
    emergencyHelpline: "+855 12 882 122",
    workHours: "সোম-শুক্র (সকাল ৯:০০ - বিকাল ৫:০০)"
  };

  const emergencyCategories = [
    {
      id: "police",
      title: "পুলিশে আটক",
      icon: ShieldAlert,
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      steps: [
        "একদম মাথা ঠাণ্ডা রাখুন ভাই, উত্তেজিত হবেন না বা কম্বোডিয়ান পুলিশের সাথে তর্ক করবেন না।",
        "অবিলম্বে আপনার পাসপোর্টের কপি এবং কাজের অনুমতিপত্র (ওয়ার্ক পারমিট) দেখান।",
        "যদি ভাষা বা যোগাযোগের সমস্যা হয়, তবে আমাদের জরুরি হটলাইনে বা দূতাবাসে কল করতে বলুন।",
        "আইনি সহায়তা টিমকে আপনার বর্তমান লোকেশন এবং থানার নাম প্রদান করুন।"
      ]
    },
    {
      id: "hospital",
      title: "হাসপাতালে ভর্তি",
      icon: HeartPulse,
      color: "bg-teal-500/10 text-teal-400 border-teal-500/10",
      steps: [
        "কম্বোডিয়ান সরকারি ‘ক্যালমেটে হাসপাতাল’ (Calmette Hospital) এ যোগাযোগ করা সবচেয়ে সাশ্রয়ী।",
        "আপনার রক্তের গ্রুপ ও পূর্বের রোগ থাকলে তা কাউকে বাংলায় লিখে রাখুন যাতে আমরা ডাক্তারকে বোঝাতে পারি।",
        "অর্থনৈতিক সাহায্য বা দূতাবাসের ইন্স্যুরেন্স সুবিধার জন্য মিশনের সমাজকল্যাণ ডেস্কে জানান।"
      ]
    },
    {
      id: "passport",
      title: "পাসপোর্ট হারিয়েছে",
      icon: FileX,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/10",
      steps: [
        "১. পুলিশ স্টেশনে গিয়ে একটি হারানোর সাধারণ ডায়েরি (Police Report) করুন। পাসপোর্ট নাম্বার সাথে থাকলে সাহায্য হবে।",
        "২. দূতাবাসের ডেস্কে গিয়ে ট্রাভেল পারমিট (আউটপাস) এবং নতুন পাসপোর্ট রি-ইস্যু ফর্ম পূরণ করুন।",
        "৩. পুলিশ রিপোর্টের কপি আমাদের ডেস্কে পাঠালে আমরা সমস্ত ফাইল রেডি করতে সাহায্য করব ভাই।"
      ]
    },
    {
      id: "money_stolen",
      title: "টাকা চুরি হয়েছে",
      icon: AlertOctagon,
      color: "bg-orange-500/10 text-orange-400 border-orange-500/10",
      steps: [
        "দালালের খপ্পড়ে পড়ে বা ছিনতাইয়ের সম্মুখীন হলে অবিলম্বে নিকটস্থ পুলিশ রেলের সাহায্য নিন।",
        "জরুরি খাওয়ার ব্যবস্থা বা ফনম পেনে থাকার জায়গার জন্য আমাদের ‘প্রবাসী আশ্রয়’ সেন্টারে কল দিন।",
        "আমরা সরাসরি বাংলাদেশে আপনার আত্মীয়ের সাথে যোগাযোগ করিয়ে দেওয়ার দায়িত্ব নেবো ভাই।"
      ]
    },
    {
      id: "gohome",
      title: "দেশে ফিরতে চাই",
      icon: Landmark,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/10",
      steps: [
        "যারা অনিয়মিতভাবে আছেন বা ইমিগ্রেশনের জরিমানা শোধ করতে পারছেন না, তারা ফনম পেন বিমানবন্দরে ইমিগ্রেশন ডিরেক্টরেট এ সমর্পণ করতে পারেন।",
        "দূতাবাস থেকে বিনামূল্যে ট্রাভেল আউটপাস পারমিট সংগ্রহ করতে ৩ কার্যদিবস সময় লাগবে।",
        "পরবর্তী ফ্লাইটের টিকিট বন্দোবস্ত এবং ট্রাভেল স্পন্সরশীপের জন্য মিশন অফিসে দরখাস্ত দিন।"
      ]
    }
  ];

  // Geolocation API Tracker
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert("দুঃখিত ভাই, আপনার ফোনের জিপিএস সিস্টেমটি কাজ করছে না।");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
        alert("আপনার জিপিএস কোঅর্ডিনেটস পেয়েছি ভাই! এটি নিচের বক্সে দেখা যাচ্ছে। নিচে দেওয়া buttons গুলো ব্যবহার করে পুলিশ বা সাপোর্ট এজেন্টকে আপনার সঠিক গুগল ম্যাপসের অবস্থান শেয়ার করতে পারেন।");
      },
      (error) => {
        console.error("GPS tracking error:", error);
        setIsLocating(false);
        // Serve mock GPS for safety simulation in the sandbox
        setCoords({ lat: 11.5564, lng: 104.9282 }); // Phnom Penh coordination
        alert("জিপিএস অ্যাক্সেস করতে সমস্যা হচ্ছে ভাই। নিরাপত্তার স্বার্থে আমরা ফনম পেনের মূল জরুরি বাউন্ডারি কোঅর্ডিনেট সংকেত দিচ্ছি।");
      }
    );
  };

  const handleSupportConnect = (title: string) => {
    let locStr = coords ? `\n\nজিপিএস লোকেশন: https://maps.google.com/?q=${coords.lat},${coords.lng}` : "";
    let urgentMessage = `জরুরি সাহায্য!!! আমার ${title} সংক্রান্ত সাহায্য প্রয়োজন ভাই। দ্রুত আমার সাথে যোগাযোগ করুন।${locStr}`;
    onSendMessageToChat(urgentMessage);
    onSwitchTab("chat");
  };

  return (
    <div className="flex flex-col space-y-5 px-4 animate-fade-in font-sans" style={{ paddingBottom: "80px" }}>
      {/* Tab Title in bright emergency red theme */}
      <div className="mt-2 text-center">
        <div className="w-12 h-12 rounded-full bg-red-650 flex items-center justify-center border-2 border-red-500 text-white animate-bounce mx-auto mb-1.5 shadow-[0_0_12px_rgba(239,68,68,0.7)]">
          <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-extrabold text-red-500">জরুরি সাহায্য কেন্দ্র (SOS)</h2>
        <p className="text-xs text-slate-400 mt-1">কম্বোডিয়ায় যেকোনো গভীর বিপদে ২৪ ঘণ্টা সেবা এবং সহায়তা গাইড</p>
      </div>

      {/* BIG CALL PULSING BUTTON */}
      <div className="text-center py-4.5 bg-red-950/20 rounded-2xl border border-red-500/25 space-y-3.5">
        <p className="text-xs text-red-200 font-bold px-4 leading-relaxed">
          নিচের বড় লাল বাটনে ক্লিক করে ইমিগ্রেশন পার্টনার মিশন বা বাংলাদেশ দূতাবাসের জরুরি নম্বরে সরাসরি কল করুন
        </p>

        <div className="flex justify-center">
          <a
            href="tel:+85512882122"
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-red-500 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border-4 border-slate-950 shadow-[0_0_30px_rgba(239,68,68,0.95)] animate-pulse"
          >
            <PhoneCall className="w-10 h-10 text-white animate-bounce" />
          </a>
        </div>
        
        <p className="text-sm font-extrabold text-white font-mono tracking-wide">+855 12 882 122</p>
      </div>

      {/* Embassy Information Card */}
      <div className="bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden">
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center space-x-2">
          <Landmark className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">বাংলাদেশ সরকারের দূতাবাস কার্যালয়</h3>
        </div>

        <div className="p-4 space-y-2.5 text-xs text-slate-300 font-sans">
          <h4 className="font-bold text-white text-xs leading-relaxed">{embassyContact.name}</h4>
          <p className="text-slate-450 text-[11px] font-sans">ঠিকানা: {embassyContact.address}</p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900/60 text-[11px]">
            <div>
              <p className="text-slate-500">জরুরি হেল্পলাইন:</p>
              <a href={`tel:${embassyContact.emergencyHelpline}`} className="font-mono text-emerald-400 font-bold block">
                {embassyContact.emergencyHelpline}
              </a>
            </div>
            <div>
              <p className="text-slate-500">অফিস ফোন:</p>
              <a href={`tel:${embassyContact.phone}`} className="font-mono text-white block">
                {embassyContact.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Geolocation Coordinate Share system */}
      <div className="glass-glow-card p-5 rounded-2xl space-y-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <MapPin className="w-4.5 h-4.5 text-emerald-400" />
            <span>পুলিশকে আপনার অবস্থান পাঠান (Share Live Location)</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">বিপদে পড়লে নিচের বাটনে চাপ দিয়ে আপনার সঠিক জিপিএস সংগ্রহ করুন ভাই</p>
        </div>

        <button
          onClick={handleShareLocation}
          disabled={isLocating}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_10px_rgba(0,255,136,0.2)]"
        >
          {isLocating ? "জিপিএস সিগন্যাল ট্র্যাক করা হচ্ছে..." : "আমার জিপিএস কোঅর্ডিনেট বের করুন"}
        </button>

        {coords && (
          <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/20 text-xs space-y-2 font-mono animate-slide-up">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Latitude: {coords.lat.toFixed(5)}</span>
              <span>Longitude: {coords.lng.toFixed(5)}</span>
            </div>
            <a
              href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 text-[10px] font-sans font-bold flex items-center justify-center space-x-1 underline hover:text-emerald-300"
            >
              <span>গুগল ম্যাপে লোকেশন চেক করুন →</span>
            </a>
          </div>
        )}
      </div>

      {/* Emergency Categories Steps with interactive tabs */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          বিপদ অনুযায়ী করণীয় ও তাৎক্ষনিক পদক্ষেপসমূহ
        </h4>

        {/* Horizontal tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {emergencyCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all outline-none border ${
                  isSelected
                    ? "bg-red-500 text-white border-red-400"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed action steps board with SOS support connector */}
        {emergencyCategories.map((cat) => {
          if (cat.id !== selectedCategory) return null;
          return (
            <div key={cat.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4 animate-slide-up">
              <h4 className="text-xs font-extrabold text-red-400">{cat.title} - তাত্ক্ষণিক পদক্ষেপসমূহ:</h4>
              <ul className="space-y-2 text-xs text-slate-200 list-inside list-decimal leading-relaxed pl-1 font-sans">
                {cat.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>

              <button
                onClick={() => handleSupportConnect(cat.title)}
                className="w-full py-2.5 bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all outline-none"
              >
                <MessageSquare className="w-4 h-4 text-red-400" />
                <span>আমাদের সাপোর্ট এজেন্টকে তাত্ক্ষণিক এটি পাঠান</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
