import React, { useState } from "react";
import { ShieldAlert, BookOpen, Calculator, HelpCircle, PhoneCall, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { VisaGuide } from "../types";

export default function VisaInformation() {
  const [selectedGuideId, setSelectedGuideId] = useState<string>("tourist");
  const [overstayDays, setOverstayDays] = useState<string>("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Overstay calculations
  const daysNumeric = parseInt(overstayDays) || 0;
  const FINE_PER_DAY = 10; // 10 USD per day fine in Cambodia
  const calculatedFine = daysNumeric * FINE_PER_DAY;
  const isOverstayDanger = daysNumeric > 90;

  const visaGuides: VisaGuide[] = [
    {
      id: "tourist",
      title: "ট্যুরিস্ট ভিসা (T Visa)",
      icon: "✈️",
      description: "পর্যটন বা ভ্রমণের জন্য কম্বোডিয়া আসার জন্য ৩০ দিনের এই ভিসা প্রদান করা হয়। এটি একবারের জন্য আরও ৩০ দিন এক্সটেনশন বা নবায়ন করা সম্ভব।",
      requirements: [
        "কমপক্ষে ৬ মাস মেয়াদ সম্পন্ন পাসপোর্ট",
        "সবুজ ব্যাকগ্রাউন্ডের রঙ্গিন ছবি (২ কপি)",
        "রিটার্ন কনফার্মড এয়ার টিকিট",
        "হোটেল বুকিং এর প্রমাণাদি"
      ],
      steps: [
        "অনলাইন কম্বোডিয়ান ই-ভিসা (e-Visa) পোর্টাল এ আবেদন করুন।",
        "পোর্টালের ভিসা ফি ৩০ ডলার + ৫ ডলার প্রসেসিং ফি পে করুন।",
        "৩ কার্যদিবসের মধ্যে পিডিএফ কপির ই-ভিসা প্রিন্ট করুন।"
      ],
      cost: "$৩৫ USD + এক্সটেনশন ফি $৫০",
      duration: "৩০ দিন (আরও ৩০ দিন বাড়ানো যাবে)"
    },
    {
      id: "business",
      title: "বিজনেস ভিসা (E Visa)",
      icon: "💼",
      description: "কম্বোডিয়ায় দীর্ঘমেয়াদী ব্যবসা, চাকরি খোঁজা বা স্থায়ী বসবাসের উদ্দেশ্যে আসার উপযুক্ত ভিসা। এটি পরবর্তীতে ওয়ার্ক পারমিটে রূপান্তরযোগ্য।",
      requirements: [
        "বাংলাদেশি রিক্রুটিং এজেন্ট বা নিয়োগকর্তার আমন্ত্রণ পত্র / স্পন্সর কার্ড",
        "সবুজ বা সাদা ব্যাকগ্রাউন্ড ছবি",
        "পাসপোর্টের প্রথম পাতার স্ক্যান কপি"
      ],
      steps: [
        "কম্বোডিয়ান কনসুলেট বা এয়ারপোর্টের ভিসা অন অ্যারাইভাল কাউন্টার থেকে ফর্ম সংগ্রহ করুন।",
        "অন-অ্যারাইভাল মূল ফি ৩৫ ডলার জমা দিয়ে ইমিগ্রেশন কাউন্টারে চেক করুন।"
      ],
      cost: "$৩৫ USD (রেন্ট ফি ছাড়া)",
      duration: "৩০ দিন (পরবর্তীতে ১ বছর পর্যন্ত রিনিউ করা যায়)"
    },
    {
      id: "work_permit",
      title: "ওয়ার্ক পারমিট (Work Permit)",
      icon: "👷",
      description: "কম্বোডিয়ায় যেকোনো কোম্পানিতে বৈধ কাজ সমাধান করতে হলে ইমিগ্রেশন ও শ্রম মন্ত্রণালয় থেকে এই পারমিট নেওয়া বাধ্যতামূলক।",
      requirements: [
        "বৈধ বিজনেস ভিসা (১৬ বা ১ বছর মেয়াদী)",
        "কোম্পানি লাইসেন্স ও ট্যাক্স রেজিস্টার কপি",
        "মেডিকেল ফিটনেস সার্টিফিকেট (কম্বোডিয়ান অনুমোদিত)"
      ],
      steps: [
        "কম্বোডিয়া শ্রম মন্ত্রণালয়ের অফিসিয়াল পোর্টাল (FWCMS) এ কোম্পানির অ্যাকাউন্ট দিয়ে নিবন্ধন করুন।",
        "লাইসেন্স ও ওয়ার্ক বুক ফি প্রদান করে সরকারি লেবার কার্ড সংগ্রহ করুন।"
      ],
      cost: "প্রতি বছর সাধারণ $১৬০ থেকে $২০০ USD",
      duration: "১ বছর (প্রতি বছর জানুয়ারি-মার্চে রিনিউ বাধ্যতামূলক)"
    },
    {
      id: "extension",
      title: "ভিসা এক্সটেনশন (Extension)",
      icon: "⏳",
      description: "আপনার বর্তমান ভিসা শেষ হওয়ার কমপক্ষে ৭ দিন পূর্বেই ইমিগ্রেশনে আবেদন পেশ করতে হবে। সঠিক মেয়াদে না বাড়ালে প্রতিদিন জরিমানা গুণবেন।",
      requirements: [
        "মূল পাসপোর্ট",
        "ভিসা এক্সটেনশন ফি ক্লিয়ার করার রসিদ",
        "বাসার ঠিকানা ও ভাড়ার নথি/পত্র"
      ],
      steps: [
        "পাসপোর্ট নিয়ে সরাসরি ফনম পেন এয়ারপোর্টের বিপরীতে অবস্থিত ইমিগ্রেশন ডিপার্টমেন্টে যান।",
        "অথবা রেজিস্টার্ড ও সরকার-অনুমোদিত ট্রাভেল এজেন্সিতে পাসপোর্ট জমা দিন।"
      ],
      cost: "$৫০ (১ মাস) থেকে $৩০০ (১ বছর)",
      duration: "১ মাস থেকে ১ বছর মেয়াদী"
    },
    {
      id: "overstay",
      title: "ওভারস্টে গাইড (Overstay)",
      icon: "⚠️",
      description: "ভিসার মেয়াদ পার হয়ে কম্বোডিয়ায় থাকা সম্পূর্ণ বেআইনি অপরাধ। প্রতিদিন ১০ ডলার জরিমানা দিয়ে ইমিগ্রেশন থেকে ক্লিয়ারেন্স নিতে হবে।",
      requirements: [
        "মূল পাসপোর্ট ও এক্সিট ভিসা আবেদন",
        "জরিমানার সম্পূর্ণ সমপরিমাণ ক্যাশ ডলার"
      ],
      steps: [
        "৯৯ দিনের নিচে হলে জরিমানা সরাসরি ইমিগ্রেশনে প্রদান করুন।",
        "৯৯ দিনের বেশি ওভারস্টে হলে পুলিশ বা দূতাবাসের সাহায্য নিয়ে আউটপাস সংগ্রহ করুন।"
      ],
      cost: "প্রতিদিন $১০ USD জরিমানা",
      duration: "তাত্ক্ষণিক প্রস্থান বাধ্যতামূলক"
    },
    {
      id: "protection",
      title: "ডিপোর্টেশন সুরক্ষা",
      icon: "🛡️",
      description: "অবৈধ দালাল বা অসাধু এজেন্ট পাসপোর্ট আটকে রাখলে বা বাতিল ঘোষণা করলে আইনি প্রক্রিয়ায় কীভাবে নিজেকে রক্ষা করবেন তার দিকনির্দেশন।",
      requirements: [
        "জাতীয় পরিচয়পত্র বা জন্মসূত্রে বাংলাদেশি হওয়ার প্রমাণ",
        "দালাল চক্রের ফোন ও তথ্য বিবরণ"
      ],
      steps: [
        "বাংলাদেশ অনারারি কনসুলেট অথবা দূতাবাসে দাপ্তরিকভাবে পাসপোর্ট হারানোর ডায়েরি জমা দিন।",
        "ফ্রি আইনি পরামর্শের জন্য আমাদের হটলাইনে জানান।"
      ],
      cost: "সম্পূর্ণ বিনামূল্যে নির্দেশনা",
      duration: "তাত্ক্ষণিক জরুরি সহায়তা"
    }
  ];

  const faqs = [
    {
      q: "কম্বোডিয়ায় ভিসার মেয়াদ শেষ হয়ে গেলে কী শাস্তি হয়?",
      a: "যদি আপনার ভিসার মেয়াদ পার হয়ে যায়, তাকে ওভারস্টে (Overstay) বলা হয়। কম্বোডিয়ান আইনানুযায়ী প্রতিদিনের জন্য ১০ ডলার (USD) জরিমানা প্রদান করতে হবে। দীর্ঘ সময় ধরে ওভারস্টে করলে পুলিশ আপনাকে আটক করতে পারে এবং পরবর্তীতে ব্ল্যাকলিস্ট বা আজীবনের জন্য দেশ থেকে বহিষ্কার (Deport) করতে পারে।"
    },
    {
      q: "আমার পাসপোর্ট দালাল আটকে রেখেছে, এখন আমি কী করব?",
      a: "দালাল যদি কোনো টাকা বা বেআইনি দাবি করে পাসপোর্ট আটকে রাখে, শান্ত থাকুন। দালালের সাথে সব কথোপকথনের স্ক্রিনশট ও প্রমাণ সুরক্ষিত করুন। সরাসরি ফনম পেনে বাংলাদেশ অনারারি কনসুলেটে যোগাযোগ করুন। আমাদের হেল্পলাইনে কথা বললে আমরা নিখরচায় দূতাবাসের ট্রাভেল পারমিট ফরম সংগ্রহে সাহায্য করব।"
    },
    {
      q: "অনলাইন ই-ভিসা নিয়ে কি কম্বোডিয়া সরাসরি ঢোকা সম্ভব?",
      a: "হ্যাঁ, ট্যুরিস্ট ই-ভিসা (T Visa) অনলাইন থেকে করার পর প্রিন্ট করে কম্বোডিয়া প্রবেশ করা সম্পূর্ণ সম্ভব। তবে সতর্ক থাকুন, বিমানবন্দর ইমিগ্রেশনে রিটার্ন টিকিট, হোটেল বুকিং এর প্রমাণ দেখতে চাইতে পারে এবং নূন্যতম নগদ ১০০০ ডলার সাথে রাখতে হবে।"
    }
  ];

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 animate-fade-in font-sans">
      {/* Tab Header */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-1">
          <span>ভিসা সংক্রান্ত ও আইনি তথ্য</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">ভিসার ক্যাটাগরি, নিয়ম কানুন ও সরকারি ক্লিয়ারেন্স গাইড</p>
      </div>

      {/* Grid Category Selection */}
      <div className="grid grid-cols-2 gap-2">
        {visaGuides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setSelectedGuideId(guide.id)}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all outline-none ${
              selectedGuideId === guide.id
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                : "bg-slate-950 text-slate-300 border-slate-900 hover:border-slate-800"
            }`}
          >
            <span className="text-xl mb-1 select-none">{guide.icon}</span>
            <span className="text-xs font-bold font-sans">{guide.title}</span>
          </button>
        ))}
      </div>

      {/* Detailed Guide Panel */}
      {selectedGuideId && (
        <div className="glass-glow-card p-5 rounded-2xl space-y-4 animate-slide-up">
          {visaGuides.map((guide) => {
            if (guide.id !== selectedGuideId) return null;
            return (
              <div key={guide.id} className="space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-900">
                  <h3 className="text-sm font-extrabold text-emerald-400">{guide.title} নির্দেশিকা</h3>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                    খরচ: {guide.cost}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                  {guide.description}
                </p>

                {/* Requirements */}
                <div>
                  <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>প্রয়োজনীয় কাগজপত্র (Requirements):</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc font-sans leading-relaxed">
                    {guide.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>আবেদন করার ধাপসমূহ (Process Steps):</span>
                  </h4>
                  <ol className="space-y-1.5 text-xs text-slate-300 list-decimal pl-4 font-sans leading-relaxed">
                    {guide.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">ভিসা স্থায়িত্বকাল:</span>
                  <span className="font-bold text-white">{guide.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overstay Fine Calculator Card */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-red-500/10 space-y-4">
        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-900">
          <Calculator className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ওভারস্টে জরিমানা ক্যালকুলেটর</h3>
            <p className="text-[9px] text-slate-400">ভিসার মেয়াদ ছাড়া কত দিন অতিরিক্ত আছেন হিসাব করুন</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1.5">অতিরিক্ত দিনের সংখ্যা লিখুন (Extra Days):</label>
            <input
              type="number"
              value={overstayDays}
              onChange={(e) => setOverstayDays(e.target.value)}
              placeholder="যেমন: ১৫"
              className="w-full bg-slate-900 rounded-xl py-3 px-4 text-sm text-white font-mono border border-slate-800 focus:border-red-500/50 focus:outline-none"
            />
          </div>

          {daysNumeric > 0 && (
            <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-2 ${
              isOverstayDanger 
                ? "bg-red-950/20 border-red-500 text-red-300" 
                : "bg-slate-900 border-slate-800 text-slate-100"
            }`}>
              <div className="flex justify-between items-center font-bold">
                <span>আপনার আনুমানিক জরিমানা (Total Fine):</span>
                <span className="text-base text-red-400 font-mono">${calculatedFine} USD</span>
              </div>
              <p className="text-[10px]">কম্বোডিয়ার আইন অনুযায়ী নিয়ম লঙ্ঘন করার ফি প্রতিদিন ১০ ডলার হিসাবে হিসাব করা হচ্ছে ভাই।</p>
              
              {isOverstayDanger && (
                <div className="pt-2 border-t border-red-550/30 font-bold text-red-400 text-[10px]">
                  ⚠️ সতর্ক বার্তা: আপনার ওভারস্টে ৯০ দিনের অধিক ছাড়িয়ে গেছে! আপনাকে পুলিশ যেকোনো সময় আটক বা সরাসরি বাংলাদেশ বিমান মারফতে ফেরত পাঠাতে (Deportation) পারে। অনুগ্রহ করে এখনই আমাদের দূতাবাসের জরুরি হটলাইনে যোগাযোগ করুন!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Emergency helpline shortcut */}
      <div className="p-4.5 rounded-xl bg-gradient-to-br from-red-950/25 to-slate-950 border border-red-500/20 text-center space-y-3">
        <p className="text-xs text-red-200">আপনি কি পুলিশি হয়রানি বা আইনি সমস্যায় আছেন ভাই?</p>
        <a
          href="tel:+85512345678"
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all outline-none"
        >
          <PhoneCall className="w-4 h-4 animation-pulse" />
          <span>জরুরি কনস্যুলার হেল্পলাইন কল</span>
        </a>
      </div>

      {/* FAQs Section */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
        </h4>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 text-left flex justify-between items-center text-xs font-bold text-white hover:bg-slate-900 focus:outline-none"
                >
                  <span className="font-sans leading-relaxed">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-350 leading-relaxed font-sans border-t border-slate-900 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
