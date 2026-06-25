import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, 
  Phone, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  ShieldAlert, 
  Stethoscope, 
  HelpCircle,
  FileText,
  Briefcase,
  Compass,
  AlertTriangle,
  Users,
  ChevronRight
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category?: string;
  description?: string;
  order?: number;
}

interface EmergencyCenterProps {
  onNavigateToChat: () => void;
}

export default function EmergencyCenter({ onNavigateToChat }: EmergencyCenterProps) {
  const [expandedSituation, setExpandedSituation] = useState<number | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Static fallback contacts
  const fallbackContacts: EmergencyContact[] = [
    { id: "fallback-1", name: "Bangladesh Honorary Consulate", phone: "+855-23-210-822", category: "দূতাবাস" },
    { id: "fallback-2", name: "Cambodia Police", phone: "117", category: "পুলিশ" },
    { id: "fallback-3", name: "Calmette Hospital", phone: "+855-23-426-948", category: "হাসপাতাল" },
    { id: "fallback-4", name: "Ambulance", phone: "119", category: "জরুরি" }
  ];

  // Fetch from Firestore on mount
  useEffect(() => {
    async function fetchContacts() {
      try {
        const querySnapshot = await getDocs(collection(db, "emergencyContacts"));
        if (!querySnapshot.empty) {
          const fetched: EmergencyContact[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "",
              phone: data.phone || "",
              category: data.category || "",
              description: data.description || "",
              order: data.order || 99
            };
          });
          // Sort by order
          fetched.sort((a, b) => (a.order || 99) - (b.order || 99));
          setContacts(fetched);
        } else {
          setContacts(fallbackContacts);
        }
      } catch (err) {
        console.error("Error fetching emergency contacts:", err);
        setContacts(fallbackContacts);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  // 6 specific situations for the Situation Guide Section
  const situations = [
    {
      id: 1,
      title: "পাসপোর্ট হারিয়ে গেছে বা চুরি হয়েছে",
      icon: "🛂",
      content: [
        "১. সাথে সাথে নিকটস্থ Police Station এ GD করুন",
        "২. Bangladesh Honorary Consulate এ যোগাযোগ করুন: +855-23-210-822",
        "৩. Emergency Travel Document এর জন্য আবেদন করুন",
        "৪. আপনার employer কে জানান",
        "৫. প্রবাসী সেবায় আমাদের জানান"
      ]
    },
    {
      id: 2,
      title: "দালাল পাসপোর্ট আটকে রেখেছে",
      icon: "🚨",
      content: [
        "১. এটা বেআইনি — দালালের কোনো অধিকার নেই পাসপোর্ট রাখার",
        "২. সাথে সাথে Police এ call করুন: 117",
        "৩. Bangladesh Consulate কে জানান: +855-23-210-822",
        "৪. একা মোকাবেলা করতে যাবেন না",
        "৫. প্রমাণ হিসেবে সব কথোপকথন screenshot রাখুন"
      ]
    },
    {
      id: 3,
      title: "ভিসার মেয়াদ শেষ হয়ে গেছে",
      icon: "📋",
      content: [
        "১. ঘাবড়াবেন না — সমাধান আছে",
        "২. সাথে সাথে Immigration Department এ যান",
        "৩. Overstay fine দিন (\$10/দিন)",
        "৪. Extension বা Departure apply করুন",
        "৫. দালালের সাহায্য নেবেন না — নিজে যান"
      ]
    },
    {
      id: 4,
      title: "অসুস্থ বা দুর্ঘটনায় পড়েছেন",
      icon: "🏥",
      content: [
        "১. Ambulance call করুন: 119",
        "২. Calmette Hospital সবচেয়ে সাশ্রয়ী: +855-23-426-948",
        "৩. Insurance থাকলে card সাথে রাখুন",
        "৪. Consulate কে জানান যদি serious হয়",
        "৫. বাড়িতে পরিবারকে জানান"
      ]
    },
    {
      id: 5,
      title: "স্ক্যামের শিকার হয়েছেন",
      icon: "💸",
      content: [
        "১. সব evidence সংরক্ষণ করুন (screenshot, chat, receipt)",
        "২. Police এ report করুন: 117",
        "৩. Bank/bKash/Nagad এ transaction dispute করুন",
        "৪. প্রবাসী সেবায় Scam Report করুন",
        "৫. Facebook এ সতর্ক করুন অন্যদের"
      ]
    },
    {
      id: 6,
      title: "পুলিশ আটক করেছে",
      icon: "🚔",
      content: [
        "১. শান্ত থাকুন — ঘাবড়াবেন না",
        "২. সাথে সাথে Bangladesh Consulate কে জানান: +855-23-210-822",
        "৩. Consular access চাওয়ার অধিকার আপনার আছে",
        "৪. কোনো কিছুতে sign করবেন না lawyer ছাড়া",
        "৫. পরিবারকে জানান"
      ]
    }
  ];

  const handleToggle = (id: number) => {
    setExpandedSituation(prev => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] font-sans pb-28 animate-fade-in" id="emergency-center-container">
      
      {/* Red Header Section */}
      <div 
        className="text-left flex flex-col justify-center items-start text-white"
        style={{ backgroundColor: "#E74C3C", padding: "24px 20px" }}
        id="emergency-header"
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <AlertOctagon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-[20px] font-medium leading-tight text-white mb-1">
          জরুরি সাহায্য
        </h1>
        <p className="text-[13px] font-normal text-white/90">
          বিপদে একা নন — আমরা আছি
        </p>
      </div>

      <div className="px-4 py-5 space-y-6">

        {/* 'আমাদের AI কে মেসেজ করুন' Card */}
        <div 
          onClick={onNavigateToChat}
          className="bg-white border text-left flex flex-col cursor-pointer hover:border-[#1B4F72]/30 active:scale-[0.99] transition-all"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px',
            padding: '16px'
          }}
          id="ai-helper-emergency-card"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EBF5FB", color: "#1B4F72" }}
              >
                <MessageSquare className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-[15px] font-medium text-[#1A1A2E] leading-tight font-sans">
                  আমাদের AI কে মেসেজ করুন
                </h3>
                <p className="text-[12px] text-[#6B7280] mt-1 font-sans leading-relaxed">
                  কম্বোডিয়ার ভিসা, চাকরি, ওভারস্টে জরিমানা ও প্রবাসী সেবার যেকোনো তথ্য জানতে আমাদের স্বয়ংক্রিয় এআই-কে জিজ্ঞেস করুন ভাই।
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#6B7280] self-center ml-2 shrink-0" />
          </div>
        </div>

        {/* 1. Emergency Call Cards */}
        <div className="space-y-4" id="emergency-call-cards-section">
          
          {/* Card 1 — Bangladesh Consulate */}
          <div 
            className="bg-white text-left p-4 flex flex-col"
            style={{
              borderLeft: "4px solid #1B4F72",
              borderRadius: "14px",
              borderTop: "0.5px solid #E5E7EB",
              borderRight: "0.5px solid #E5E7EB",
              borderBottom: "0.5px solid #E5E7EB",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3.5">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#EBF5FB", color: "#1B4F72" }}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#1A1A2E]">
                    বাংলাদেশ দূতাবাস
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    Phnom Penh, Cambodia
                  </p>
                  <p className="text-[12px] text-[#1B4F72] font-mono mt-0.5">
                    +855-23-210-822
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="tel:+85523210822"
              className="flex items-center justify-center text-center font-sans font-medium text-white transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: "#1B4F72",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "14px",
                width: "100%"
              }}
            >
              📞 এখনই Call করুন
            </a>
          </div>

          {/* Card 2 — Cambodia Police */}
          <div 
            className="bg-white text-left p-4 flex flex-col"
            style={{
              borderLeft: "4px solid #E74C3C",
              borderRadius: "14px",
              borderTop: "0.5px solid #E5E7EB",
              borderRight: "0.5px solid #E5E7EB",
              borderBottom: "0.5px solid #E5E7EB",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3.5">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#FDEDEC", color: "#E74C3C" }}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#1A1A2E]">
                    কম্বোডিয়া পুলিশ
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    জরুরি পুলিশ কল সেন্টার
                  </p>
                  <p className="text-[12px] text-[#E74C3C] font-mono mt-0.5">
                    117
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="tel:117"
              className="flex items-center justify-center text-center font-sans font-medium text-white transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: "#E74C3C",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "14px",
                width: "100%"
              }}
            >
              📞 এখনই Call করুন
            </a>
          </div>

          {/* Card 3 — Ambulance */}
          <div 
            className="bg-white text-left p-4 flex flex-col"
            style={{
              borderLeft: "4px solid #1D9E75",
              borderRadius: "14px",
              borderTop: "0.5px solid #E5E7EB",
              borderRight: "0.5px solid #E5E7EB",
              borderBottom: "0.5px solid #E5E7EB",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3.5">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#E9F7EF", color: "#1D9E75" }}
                >
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#1A1A2E]">
                    অ্যাম্বুলেন্স
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    জরুরি মেডিকেল রেসকিউ
                  </p>
                  <p className="text-[12px] text-[#1D9E75] font-mono mt-0.5">
                    119
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="tel:119"
              className="flex items-center justify-center text-center font-sans font-medium text-white transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: "#1D9E75",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "14px",
                width: "100%"
              }}
            >
              📞 এখনই Call করুন
            </a>
          </div>

          {/* Card 4 — Calmette Hospital */}
          <div 
            className="bg-white text-left p-4 flex flex-col"
            style={{
              borderLeft: "4px solid #534AB7",
              borderRadius: "14px",
              borderTop: "0.5px solid #E5E7EB",
              borderRight: "0.5px solid #E5E7EB",
              borderBottom: "0.5px solid #E5E7EB",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3.5">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#EEF2FF", color: "#534AB7" }}
                >
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#1A1A2E]">
                    Calmette Hospital
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    সবচেয়ে সাশ্রয়ী হাসপাতাল
                  </p>
                  <p className="text-[12px] text-[#534AB7] font-mono mt-0.5">
                    +855-23-426-948
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="tel:+85523426948"
              className="flex items-center justify-center text-center font-sans font-medium text-white transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: "#534AB7",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "14px",
                width: "100%"
              }}
            >
              📞 এখনই Call করুন
            </a>
          </div>

          {/* Card 5 — Probashi Sheba WhatsApp */}
          <div 
            className="bg-white text-left p-4 flex flex-col"
            style={{
              borderLeft: "4px solid #25D366",
              borderRadius: "14px",
              borderTop: "0.5px solid #E5E7EB",
              borderRight: "0.5px solid #E5E7EB",
              borderBottom: "0.5px solid #E5E7EB",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3.5">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#E8F8F1", color: "#25D366" }}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#1A1A2E]">
                    প্রবাসী সেবা সাপোর্ট
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    ২৪/৭ WhatsApp সাহায্য
                  </p>
                  <p className="text-[12px] text-[#25D366] font-mono mt-0.5">
                    +855762012121
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="https://wa.me/855762012121"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center text-center font-sans font-medium text-white transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: "#25D366",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "14px",
                width: "100%"
              }}
            >
              💬 WhatsApp করুন
            </a>
          </div>

        </div>

        {/* 2. Situation Guide Section */}
        <div className="space-y-4" id="situation-guide-section">
          <h2 className="text-[14px] font-medium text-[#1A1A2E] text-left">
            কোন পরিস্থিতিতে কী করবেন
          </h2>

          <div className="space-y-3">
            {situations.map(situation => {
              const isExpanded = expandedSituation === situation.id;
              return (
                <div 
                  key={situation.id}
                  className="bg-white border border-[#E5E7EB] transition-all"
                  style={{ borderRadius: "14px", overflow: "hidden" }}
                >
                  {/* Selector Header */}
                  <button
                    onClick={() => handleToggle(situation.id)}
                    className="w-full flex items-center justify-between p-4 bg-white text-left focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl shrink-0">{situation.icon}</span>
                      <span className="text-[13px] font-medium text-[#1A1A2E]">
                        {situation.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                    )}
                  </button>

                  {/* Expanded list body */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-[#F5F5F7] bg-gray-50/50">
                      <ul className="space-y-2 mt-3 pl-1">
                        {situation.content.map((line, index) => (
                          <li 
                            key={index} 
                            className="text-[12px] text-[#1A1A2E] leading-relaxed text-left font-sans"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Important Numbers Quick Access */}
        <div className="space-y-3" id="important-numbers-section">
          <h2 className="text-[14px] font-medium text-[#1A1A2E] text-left">
            গুরুত্বপূর্ণ নম্বর
          </h2>

          <div 
            className="bg-white p-4 space-y-4"
            style={{
              borderRadius: "14px",
              border: "0.5px solid #E5E7EB"
            }}
          >
            {loading ? (
              <p className="text-xs text-[#6B7280] py-2 text-center">লোডিং হচ্ছে ভাই...</p>
            ) : contacts.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                {contacts.map((contact, idx) => (
                  <div 
                    key={contact.id} 
                    className={`flex items-center justify-between py-3 ${idx === 0 ? "pt-0" : ""} ${idx === contacts.length - 1 ? "pb-0" : ""}`}
                  >
                    <div className="text-left font-sans">
                      <p className="text-[13px] font-medium text-[#1A1A2E]">{contact.name}</p>
                      {contact.category && (
                        <span className="inline-block text-[10px] bg-gray-100 text-[#6B7280] px-1.5 py-0.5 rounded mt-1 font-sans">
                          {contact.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-[#6B7280]">{contact.phone}</span>
                      <a 
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                        className="w-8 h-8 rounded-full bg-[#1B4F72]/10 flex items-center justify-center text-[#1B4F72] hover:bg-[#1B4F72]/20 transition-all active:scale-95"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center text-[#6B7280]">কোনো নম্বর পাওয়া যায়নি</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
