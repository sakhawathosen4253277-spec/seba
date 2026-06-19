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
        "মূল পাসপোর্ট (কমপক্ষে ৬ মাস মেয়াদ সম্পন্ন)",
        "সাদা ব্যাকগ্রাউন্ডের ছবি (২ কপি)",
        "FPCS (Foreigners Present in Cambodia System) অ্যাপ রেজিস্ট্রেশন প্রমাণপত্র",
        "বর্তমান ভিসার কপি এবং কোম্পানি লেটার (যদি থাকে)"
      ],
      steps: [
        "আপনার পাসপোর্ট ও প্রয়োজনীয় কাগজপত্র নিয়ে স্থানীয় ট্রাভেল এজেন্সি বা সরাসরি ইমিগ্রেশন বিভাগে যোগাযোগ করুন।",
        "এক্সটেনশন ফি প্রদান করুন এবং পাসপোর্টটি জমা দিন।",
        "সাধারণত ৭ থেকে ১০ কার্যদিবসের মধ্যে আপনার নবায়িত পাসপোর্ট বুঝে নিন।"
      ],
      cost: "ভিসা টাইপ অনুযায়ী $৫০ থেকে $৩০০ USD",
      duration: "১ মাস থেকে ১ বছর"
    }
  ];

  const faqs = [
    {
      q: "ভিজিট ভিসায় এসে কি কম্বোডিয়ায় কাজ করা সম্ভব?",
      a: "না ভাই, ভিজিট বা ট্যুরিস্ট ভিসায় এসে কম্বোডিয়ায় স্থায়ীভাবে বৈধ কাজ করা আইনত নিষিদ্ধ। কাজের জন্য অবশ্যই আপনাকে ই-ভিসা (বিজনেস) নিয়ে আসতে হবে এবং পরবর্তীতে লেবার কার্ড বা ওয়ার্ক পারমিট সংগ্রহ করতে হবে।"
    },
    {
      q: "ওভারস্টে (ভিসার মেয়াদ শেষ) হলে জরিমানা এড়ানোর উপায় কী?",
      a: "ভিসার মেয়াদ শেষ হওয়ার অন্তত এক সপ্তাহ আগেই এক্সটেনশনের আবেদন করুন ভাই। ওভারস্টে হয়ে গেলে প্রতিদিন ১০ ডলার জরিমানা দিতে হবে, যা কোনোভাবেই মওকুফ করা সম্ভব নয়।"
    },
    {
      q: "FPCS রেজিস্ট্রেশন কী এবং এটি কি বাধ্যতামূলক?",
      a: "হ্যাঁ ভাই, কম্বোডিয়ায় বসবাসকারী সকল বিদেশিদের জন্য FPCS (Foreigners Present in Cambodia System) অ্যাপে নাম নিবন্ধন করা সম্পূর্ণ বাধ্যতামূলক। এটি ছাড়া আপনার ভিসা রিনিউ বা এক্সটেনশন করা যাবে না।"
    },
    {
      q: "কম্বোডিয়ার ইমিগ্রেশন বা পুলিশি সমস্যার সম্মুখীন হলে কী করব?",
      a: "অবিলম্বে আপনার সকল আসল ডকুমেন্টস প্রদর্শন করুন এবং যেকোনো আইনি বা জটিল সমস্যায় সরাসরি বাংলাদেশ অনারারি কনসুলেট অথবা আমাদের প্রবাসী সেবা জরুরি হেল্পলাইনে (+৮৫৫১২৩৪৫৬৭৮) কল দিন।"
    }
  ];

  return (
    <div className="flex flex-col space-y-5 px-4 animate-fade-in font-sans bg-[#F0F4F8] min-h-screen text-[#1A1A2E]" style={{ paddingBottom: "80px" }}>
      {/* Tab Header */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-medium text-[#1A1A2E] flex items-center justify-center space-x-1 font-sans">
          <span>ভিসা সংক্রান্ত ও আইনি তথ্য</span>
        </h2>
        <p className="text-xs text-[#6B7280] mt-1 font-sans">ভিসার ক্যাটাগরি, নিয়ম কানুন ও সরকারি ক্লিয়ারেন্স গাইড</p>
      </div>

      {/* Grid Category Selection */}
      <div className="grid grid-cols-2 gap-2">
        {visaGuides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setSelectedGuideId(guide.id)}
            style={{
              borderColor: selectedGuideId === guide.id ? "#1B4F72" : "#E5E7EB",
              borderWidth: "0.5px",
              borderRadius: "16px"
            }}
            className={`p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer outline-none ${
              selectedGuideId === guide.id
                ? "bg-[#1B4F72] text-white"
                : "bg-white text-[#1A1A2E] hover:bg-[#F9FAFB]"
            }`}
          >
            <span className="text-xl mb-1 select-none">{guide.icon}</span>
            <span className="text-[13px] font-medium font-sans">{guide.title}</span>
          </button>
        ))}
      </div>

      {/* Detailed Guide Panel */}
      {selectedGuideId && (
        <div 
          style={{ borderColor: "#E5E7EB", borderWidth: "0.5px", borderRadius: "16px" }}
          className="bg-white p-5 space-y-4 animate-slide-up text-left"
        >
          {visaGuides.map((guide) => {
            if (guide.id !== selectedGuideId) return null;
            return (
              <div key={guide.id} className="space-y-4 text-left">
                <div style={{ borderColor: "#E5E7EB", borderBottomWidth: "0.5px" }} className="flex justify-between items-center pb-2.5 border-b">
                  <h3 className="text-[13px] font-medium text-[#1B4F72] font-sans">{guide.title} নির্দেশিকা</h3>
                  <span className="text-[10px] bg-[#F0F4F8] text-[#1B4F72] px-2.5 py-0.5 rounded-lg border border-[#E5E7EB] font-serif font-medium" style={{ borderWidth: "0.5px" }}>
                    খরচ: {guide.cost}
                  </span>
                </div>

                <p className="text-[13px] text-[#6B7280] leading-relaxed font-sans">
                  {guide.description}
                </p>

                {/* Requirements */}
                <div>
                  <h4 className="text-[12px] font-medium text-[#1A1A2E] mb-1.5 flex items-center space-x-1 font-sans">
                    <BookOpen className="w-3.5 h-3.5 text-[#1B4F72]" />
                    <span>প্রয়োজনীয় কাগজপত্র (Requirements):</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-[#6B7280] pl-4 list-disc font-sans leading-relaxed">
                    {guide.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="text-[12px] font-medium text-[#1A1A2E] mb-1.5 flex items-center space-x-1 font-sans">
                    <CheckCircle className="w-3.5 h-3.5 text-[#1B4F72]" />
                    <span>আবেদন করার ধাপসমূহ (Process Steps):</span>
                  </h4>
                  <ol className="space-y-1.5 text-xs text-[#6B7280] list-decimal pl-4 font-sans leading-relaxed">
                    {guide.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div 
                  style={{ borderColor: "#E5E7EB", borderWidth: "0.5px", borderRadius: "12px" }}
                  className="p-3 bg-[#F0F4F8] flex justify-between items-center text-[12px]"
                >
                  <span className="text-[#6B7280] font-sans">ভিসা স্থায়িত্বকাল:</span>
                  <span className="font-medium text-[#1A1A2E] font-sans">{guide.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overstay Fine Calculator Card */}
      <div 
        style={{ borderColor: "#FCA5A5", borderWidth: "0.5px", borderRadius: "16px" }}
        className="bg-white p-5 space-y-4 text-left"
      >
        <div style={{ borderColor: "#E5E7EB", borderBottomWidth: "0.5px" }} className="flex items-center space-x-2 pb-2.5 border-b text-left">
          <Calculator className="w-5 h-5 text-[#E74C3C]" />
          <div className="text-left">
            <h3 className="text-sm font-medium text-[#1A1A2E] font-sans">ওভারস্টে জরিমানা ক্যালকুলেটর</h3>
            <p className="text-[11px] text-[#6B7280] font-sans">ভিসার মেয়াদ ছাড়া কত দিন অতিরিক্ত আছেন হিসাব করুন</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-left">
            <label className="block text-[12px] text-[#6B7280] font-medium mb-1.5 font-sans">অতিরিক্ত দিনের সংখ্যা লিখুন (Extra Days):</label>
            <input
              type="number"
              value={overstayDays}
              onChange={(e) => setOverstayDays(e.target.value)}
              placeholder="যেমন: ১৫"
              style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
              className="w-full h-12 bg-white rounded-xl px-4 text-[13px] text-[#1A1A2E] font-mono focus:border-[#1B4F72] focus:outline-none"
            />
          </div>

          {daysNumeric > 0 && (
            <div 
              style={
                isOverstayDanger 
                  ? { border: "0.5px solid #E74C3C", backgroundColor: "#FDEDEC" } 
                  : { border: "0.5px solid #E5E7EB", backgroundColor: "#F0F4F8" }
              }
              className={`p-4 rounded-[12px] leading-relaxed text-xs space-y-2 text-[#1A1A2E]`}
            >
              <div className="flex justify-between items-center font-medium font-sans">
                <span>আপনার আনুমানিক জরিমানা (Total Fine):</span>
                <span className="text-base text-[#E74C3C] font-mono">${calculatedFine} USD</span>
              </div>
              <p className="text-[11px] text-[#6B7280] font-sans">কম্বোডিয়ার আইন অনুযায়ী নিয়ম লঙ্ঘন করার ফি প্রতিদিন ১০ ডলার হিসাবে হিসাব করা হচ্ছে ভাই।</p>
              
              {isOverstayDanger && (
                <div className="pt-2 border-t border-[#FCA5A5] font-medium text-[#E74C3C] text-[11px] font-sans">
                  ⚠️ সতর্ক বার্তা: আপনার ওভারস্টে ৯০ দিনের অধিক ছাড়িয়ে গেছে! আপনাকে police যেকোনো সময় আটক বা সরাসরি বাংলাদেশ বিমান মারফতে ফেরত পাঠাতে (Deportation) পারে। অনুগ্রহ করে এখনই আমাদের দূতাবাসের জরুরি হেল্পলাইনে যোগাযোগ করুন!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Emergency helpline shortcut */}
      <div 
        style={{ borderColor: "#FCA5A5", borderWidth: "0.5px", borderRadius: "16px" }}
        className="p-5 bg-[#FDEDEC] text-center space-y-3"
      >
        <p className="text-xs text-[#E74C3C] font-medium font-sans">আপনি কি পুলিশি হয়রানি বা আইনি সমস্যায় আছেন ভাই?</p>
        <a
          href="tel:+85512345678"
          className="inline-flex items-center justify-center space-x-2 bg-[#E74C3C] hover:bg-opacity-90 text-white font-medium text-[13px] py-3 px-5 rounded-[12px] transition-all outline-none"
          style={{ height: '48px', minWidth: '200px' }}
        >
          <PhoneCall className="w-4 h-4" />
          <span>জরুরি কনস্যুলার হেল্পলাইন কল</span>
        </a>
      </div>

      {/* FAQs Section */}
      <div className="space-y-2.5 text-left">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] font-sans select-none text-left">
          সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
        </h4>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                style={{ borderColor: "#E5E7EB", borderWidth: "0.5px", borderRadius: "16px" }}
                className="bg-white overflow-hidden text-left"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 text-left flex justify-between items-center text-xs font-medium text-[#1A1A2E] hover:bg-[#F9FAFB] focus:outline-none cursor-pointer"
                >
                  <span className="font-sans leading-relaxed text-[13px]" style={{ fontWeight: 500 }}>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#1B4F72] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div 
                    style={{ borderColor: "#E5E7EB", borderTopWidth: "0.5px" }}
                    className="px-4 pb-4 text-xs text-[#6B7280] leading-relaxed font-sans border-t pt-3 text-left"
                  >
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
