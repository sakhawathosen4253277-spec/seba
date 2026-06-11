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
      badgeColor: "text-[#6B7280] bg-gray-100 border-[#E5E7EB]",
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
      cost: 15,
      period: "প্রতি মাস",
      badge: Award,
      badgeColor: "text-[#1D9E75] bg-[#E9F7EF] border-[#BDF0D9]",
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
      cost: 45,
      period: "প্রতি মাস",
      badge: Zap,
      badgeColor: "text-[#D68910] bg-[#FDF2E9] border-[#FADBD8]",
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
        <div className="inline-flex p-2 bg-[#E9F7EF] border border-[#BDF0D9] rounded-full text-[#1D9E75] mb-1.5 animate-pulse">
          <Sparkles className="w-5 h-5 text-[#1D9E75]" />
        </div>
        <h2 className="text-xl font-medium text-[#1A1A2E] flex items-center justify-center space-x-1">
          <span>প্রবাসী সেবা প্রিমিয়াম মেম্বারশিপ</span>
        </h2>
        <p className="text-xs text-[#6B7280] mt-1 font-sans">প্যাকেজ নিয়ে বাড়তি সুযোগ, সেরা বৈদেশিক টাকার রেট ও সুরক্ষার ছাতা পান</p>
      </div>

      {/* Member Badge Preview Card */}
      <div className="relative overflow-hidden rounded-[16px] bg-white border border-[#E5E7EB] p-5 text-center space-y-2.5 shadow-sm">
        <p className="text-[10px] text-[#6B7280] font-medium uppercase font-sans tracking-wider">ডিজিটাল মেম্বারশিপ ভার্চুয়াল কার্ড</p>
        
        <div className="flex justify-center py-2 select-none">
          {currentTier === "vip" ? (
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="p-3 bg-[#FDF2E9] rounded-full border border-[#FADBD8] text-[#D68910]">
                <Zap className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-[#D68910] uppercase tracking-widest bg-[#FDF2E9] border border-[#F5CBA7] px-3.5 py-1.5 rounded-xl">
                VIP GOLDEN MEMBER
              </span>
            </div>
          ) : currentTier === "pro" ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-[#E9F7EF] rounded-full border border-[#BDF0D9] text-[#1D9E75]">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-[#1D9E75] uppercase tracking-widest bg-[#E9F7EF] border border-[#BDF0D9] px-3.5 py-1.5 rounded-xl">
                PRO ACTIVE MEMBER
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-gray-50 rounded-full border border-[#E5E7EB] text-[#6B7280]">
                <Star className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest bg-gray-100 px-3.5 py-1.5 rounded-xl border border-[#E5E7EB]">
                BASIC MEMBER (FREE)
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-[#4B5563] font-sans px-4">
          আপনার ওয়ালেট ব্যালেন্স পরিশোধ করে যেকোনো সময় প্রো বা ভিআইপি লেভেলে আপগ্রেড করে নিন ভাই।
        </p>
      </div>

      {/* Select buttons */}
      <div className="grid grid-cols-3 gap-2">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`py-3 px-1 rounded-xl border flex flex-col items-center justify-center text-center transition-all outline-none cursor-pointer ${
              selectedPlan === p.id
                ? "bg-[#EBF5FB] border-[#1B4F72] text-[#1B4F72] shadow-sm font-semibold"
                : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50"
            }`}
          >
            <span className="text-xs font-medium font-sans">{p.name.split(" ")[0]}</span>
            <span className="text-[10px] font-mono mt-1">${p.cost}</span>
          </button>
        ))}
      </div>

      {/* Detailed comparison plan panel */}
      {plans.map((p) => {
        if (p.id !== selectedPlan) return null;
        const Icon = p.badge;

        return (
          <div key={p.id} className="bg-white p-5 rounded-[16px] border border-[#E5E7EB] space-y-4 animate-fade-in shadow-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#E5E7EB]">
              <div className="flex items-center space-x-2">
                <span className={`p-1.5 rounded-lg border ${p.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-medium text-[#1A1A2E] font-sans">{p.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-[#1D9E75] font-mono">
                  {p.cost > 0 ? `$${p.cost}` : "ফ্রি"}
                </span>
                <span className="text-[9px] text-[#6B7280] block font-sans">{p.period}</span>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed font-sans mt-1">
              {p.description}
            </p>

            {/* List features included */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider font-sans">মেম্বার সুবিধা ক্যাটাগরি (Benefits):</h4>
              
              <div className="space-y-1.5">
                {p.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#4B5563]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#1D9E75] shrink-0 mt-0.5" />
                    <span className="font-sans leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade triggers mock form button */}
            {p.cost > 0 && (
              <button
                onClick={() => handleUpgradeClick(p.id, p.cost, p.name)}
                className="w-full py-3 bg-[#1B4F72] hover:bg-opacity-95 text-white rounded-xl font-medium text-xs shadow-sm transition-colors cursor-pointer mt-4 select-none"
              >
                এখনই আপগ্রেড করুন (${p.cost} / মাস)
              </button>
            )}
          </div>
        );
      })}

      {/* Trust and Safety Banner */}
      <div className="p-3.5 rounded-[16px] bg-[#EBF5FB] border border-[#BDD8F0] flex items-start space-x-2.5 text-[11px] text-[#2C3E50] leading-relaxed shadow-sm">
        <ShieldCheck className="w-5 h-5 text-[#1B4F72] shrink-0 mt-0.5" />
        <p className="font-sans">আপনার সকল সদস্য পেমেন্ট সুরক্ষিত লাইনে কম্বোডিয়া সরকারি ব্যাংক গেটওয়ে দিয়ে ক্লিয়ার করা হয়। সংগৃহীত তহবিলের ৩০% প্রবাসী ভাইদের বিপদকালীন আইনি সাহায্যে সরাসরি খরচ করা হয় ভাই।</p>
      </div>
    </div>
  );
}
