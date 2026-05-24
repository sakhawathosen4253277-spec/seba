import React, { useState } from "react";
import { Sparkles, CheckCircle2, ShieldCheck, Zap, Award, Star } from "lucide-react";

interface PremiumProps {
  onUpgrade: (tier: string, cost: number) => void;
  currentTier: string;
}

export default function PremiumMembership({ onUpgrade, currentTier }: PremiumProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  const plans = [
    {
      id: "basic",
      name: "সাধারণ (Basic)",
      cost: 0,
      period: "আজীবন ফ্রি",
      badge: Star,
      badgeColor: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      description: "বেসিক সাধারণ সেবা ও কমিউনিটি সতর্কবার্তা তথ্য",
      features: [
        "ভিসা ওভারস্টে ক্যালকুলেটর এক্সেস",
        "টিকেট PNR সত্যতা ভেরিফাই",
        "স্ক্যাম রিপোর্ট ও এলার্ট বোর্ড রিডিং",
        "কমিউনিটি চাকরি গ্রুপ সাপোর্ট"
      ]
    },
    {
      id: "pro",
      name: "প্রো মেম্বার (Pro)",
      cost: 5,
      period: "প্রতি মাস",
      badge: Award,
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30",
      description: "দ্রুত সাপোর্ট, সেরা পেমেন্ট রেট ও টিকিট সুবিধা",
      features: [
        "সব ধরনের ফ্রি ফিচার সুবিধা",
        "টাকা পাঠাতে অতিরিক্ত ০.৩০ BDT বোনাস রেট!",
        "এয়ার টিকিট বুকিং এ স্পেশাল ৫০০ টাকা ডিসকাউন্ট",
        "চ্যাট গ্রুপে ১০ মিনিটে দ্রুত হিউম্যান এজেন্ট রেসপন্স",
        "প্রো মেম্বার বিশেষ ব্যাজ প্রোফাইলে শো"
      ]
    },
    {
      id: "vip",
      name: "ভিআইপি (VIP)",
      cost: 15,
      period: "প্রতি মাস",
      badge: Zap,
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-400/30",
      description: "ব্যক্তিগত এজেন্ট, ফ্রি আইনি সাপোর্ট ও সর্বাধিক রেট বোনাস",
      features: [
        "প্রো প্লাস সমস্ত কাস্টম স্পেশাল ফিচার",
        "টাকা পাঠাতে আকর্ষণীয় ০.৮০ BDT অতিরিক্ত বোনাস রেট!",
        " দূতাবাসের জরুরি কাগজপত্রের জন্য ফ্রি ল ফার্ম সাপোর্ট",
        "ফনম পেনে ২৪ ঘণ্টা ডেডিকেটেড পার্সোনাল এজেন্ট ভাই",
        "ভিআইপি গোল্ডেন মেম্বার গর্জিয়াস ব্যাজ"
      ]
    }
  ];

  const handleUpgradeClick = (id: string, cost: number, name: string) => {
    if (id === currentTier) {
      alert(`ভাই, আপনি ইতিমধ্যেই ${name} প্যাকেজে সক্রিয় আছেন!`);
      return;
    }
    
    // Simulate upgrade deducts from wallet in app.tsx if wallet has money
    onUpgrade(id, cost);
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 animate-fade-in font-sans">
      {/* Head section */}
      <div className="mt-2 text-center">
        <div className="inline-flex p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 mb-1.5 animate-pulse">
          <Sparkles className="w-5 h-5 text-emerald-300" />
        </div>
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-1">
          <span>প্রবাসী সেবা প্রিমিয়াম মেম্বারশিপ</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">প্যাকেজ নিয়ে বাড়তি সুযোগ, সেরা বৈদেশিক টাকার রেট ও সুরক্ষার ছাতা পান</p>
      </div>

      {/* Member Badge Preview Card */}
      <div className="relative overflow-hidden rounded-2xl glass-glow-card p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border-emerald-500/20 text-center space-y-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase">ডিজিটাল মেম্বারশিপ ভার্চুয়াল কার্ড</p>
        
        <div className="flex justify-center py-2">
          {currentTier === "vip" ? (
            <div className="flex flex-col items-center space-y-1.5 animate-pulse">
              <div className="p-3 bg-amber-500/20 rounded-full border border-amber-400/40">
                <Zap className="w-7 h-7 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-400/20 px-3 py-1 rounded-full">
                VIP GOLDEN MEMBER
              </span>
            </div>
          ) : currentTier === "pro" ? (
            <div className="flex flex-col items-center space-y-1.5">
              <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-400/40">
                <Award className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                PRO ACTIVE MEMBER
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1.5">
              <div className="p-3 bg-slate-800 rounded-full border border-slate-700">
                <Star className="w-7 h-7 text-slate-400" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full">
                BASIC MEMBER (FREE)
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-300 font-sans px-4">
          আপনার ওয়ালেট ব্যালেন্স পরিশোধ করে যেকোনো সময় প্রো বা ভিআইপি লেভেলে আপগ্রেড করে নিন ভাই।
        </p>
      </div>

      {/* Select buttons */}
      <div className="grid grid-cols-3 gap-2">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`py-3 px-1 rounded-xl border flex flex-col items-center justify-center text-center transition-all outline-none ${
              selectedPlan === p.id
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(0,255,136,0.15)]"
                : "bg-slate-950 text-slate-400 border-slate-900"
            }`}
          >
            <span className="text-xs font-bold font-sans">{p.name.split(" ")[0]}</span>
            <span className="text-[10px] font-mono mt-1">${p.cost}</span>
          </button>
        ))}
      </div>

      {/* Detailed comparison plan panel */}
      {plans.map((p) => {
        if (p.id !== selectedPlan) return null;
        const Icon = p.badge;

        return (
          <div key={p.id} className="glass-glow-card p-5 rounded-2xl space-y-4 animate-slide-up">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-900">
              <div className="flex items-center space-x-2">
                <span className={`p-1.5 rounded border ${p.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-extrabold text-white">{p.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {p.cost > 0 ? `$${p.cost}` : ""}
                </span>
                <span className="text-[9px] text-slate-500 block">{p.period}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
              {p.description}
            </p>

            {/* List features included */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">মেম্বার সুবিধা ক্যাটাগরি (Benefits):</h4>
              
              <div className="space-y-1.5">
                {p.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-sans leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade triggers mock form button */}
            {p.cost > 0 && (
              <button
                onClick={() => handleUpgradeClick(p.id, p.cost, p.name)}
                className="w-full py-3.5 glow-green-btn rounded-xl font-bold text-xs shadow-md mt-4 select-none cursor-pointer"
              >
                এখনই আপগ্রেড করুন (${p.cost} / মাস)
              </button>
            )}
          </div>
        );
      })}

      {/* Trust and Safety Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex items-start space-x-2.5 text-[11px] text-slate-400 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="font-sans">আপনার সকল সদস্য পেমেন্ট সুরক্ষিত লাইনে কম্বোডিয়া সরকারি ব্যাংক গেটওয়ে দিয়ে ক্লিয়ার করা হয়। সংগৃহীত তহবিলের ৩০% প্রবাসী ভাইদের বিপদকালীন আইনি সাহায্যে সরাসরি খরচ করা হয় ভাই।</p>
      </div>
    </div>
  );
}
