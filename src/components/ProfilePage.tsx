import React, { useState } from "react";
import { User, Mail, Wallet, Award, LogOut, Copy, Check, ChevronRight, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface ProfilePageProps {
  onBackToHome: () => void;
  onSelectTab: (tab: any, subView?: string) => void;
}

export default function ProfilePage({ onBackToHome, onSelectTab }: ProfilePageProps) {
  const { userDoc, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const userId = userDoc?.userId || "PS-000000";
  const name = userDoc?.name || "প্রবাসী ভাই";
  const email = userDoc?.email || "";
  const balance = userDoc?.balance || 0;
  const isPremium = userDoc?.isPremium || false;
  const tier = userDoc?.tier || "basic";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex flex-col space-y-5 px-4 pb-24 font-sans text-xs bg-[#F7F8FA] min-h-screen text-[#1A1A2E]">
      
      {/* NAVY BLUE HEADER */}
      <div className="bg-[#1B4F72] text-white p-5 rounded-2xl relative mt-4 text-center shadow-sm select-none">
        <div className="relative inline-block">
          <div className="w-16 h-16 bg-white/10 rounded-full border-2 border-white/20 flex items-center justify-center text-white mx-auto shadow-sm">
            <User className="w-8 h-8" />
          </div>
          {isPremium && (
            <span className="absolute bottom-0 right-0 bg-[#E74C3C] text-white p-1 rounded-full border-2 border-[#1B4F72]">
              <Award className="w-3 h-3 text-white fill-current" />
            </span>
          )}
        </div>

        <div className="mt-2.5">
          <h3 className="text-base font-semibold text-white">{name}</h3>
          <p className="text-[11px] text-[#A9CCE3] flex items-center justify-center space-x-1 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{email}</span>
          </p>
        </div>
      </div>

      {/* USER ID BIG BOX */}
      <div className="bg-white border border-[#E5E7EB] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex-1 bg-[#EBF5FB] border border-[#1B4F72] rounded-xl px-4 py-3 text-left">
          <p className="text-[10px] text-[#5499C7] font-semibold uppercase tracking-wider">আপনার আইডি (User ID)</p>
          <p className="text-base font-bold text-[#1B4F72] font-mono mt-0.5">{userId}</p>
        </div>

        <button
          onClick={handleCopy}
          className="ml-3 p-3.5 rounded-xl border border-[#BDD8F0] bg-[#EBF5FB] hover:bg-[#D4E6F1] text-[#1B4F72] cursor-pointer transition-all flex items-center justify-center"
          title="কপি করুন"
        >
          {copied ? (
            <Check className="w-5 h-5 text-[#1D9E75]" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* WALLET BALANCE CARD */}
      <div className="bg-white border border-[#E5E7EB] p-4.5 rounded-2xl shadow-sm text-center space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-[#1B4F72]" />
            <span className="text-[#6B7280]">মেম্বার ওয়ালেট (Wallet Balance):</span>
          </div>
          <span className="font-bold text-[#1A1A2E] text-base font-mono">${balance.toFixed(2)} USD</span>
        </div>

        <div className="pt-2.5 border-t border-[#E5E7EB] flex justify-between items-center text-[10px] text-[#6B7280]">
          <span>প্যাকেজ মেম্বারশিপ:</span>
          <span className="font-semibold text-[#1B4F72] bg-[#EBF5FB] px-2.5 py-0.75 rounded-lg border border-[#BDD8F0] uppercase tracking-wider font-mono">
            {tier} Plan
          </span>
        </div>
      </div>

      {/* SUB FEATURES & HELPERS LIST */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        
        <button
          onClick={() => onSelectTab("admin")}
          className="w-full px-4 py-4 border-b border-[#E5E7EB] hover:bg-[#F3F4F6] text-left text-[#1B4F72] font-bold flex justify-between items-center bg-[#1B4F72]/5 cursor-pointer"
        >
          <span className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>অ্যাডমিন ড্যাশবোর্ড (Admin Control Panel)</span>
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab("services", "money")}
          className="w-full px-4 py-4 border-b border-[#E5E7EB] hover:bg-gray-50 text-left text-[#1A1A2E] flex justify-between items-center cursor-pointer"
        >
          <span>ভাউচার ও ওয়ালেট টপআপ বিবরণ</span>
          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
        </button>

        <button
          onClick={() => onSelectTab("services", "premium")}
          className="w-full px-4 py-4 border-b border-[#E5E7EB] hover:bg-gray-50 text-left text-[#1A1A2E] flex justify-between items-center cursor-pointer"
        >
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1D9E75]" strokeWidth={2.5} />
            <span>প্রিমিয়াম ভিআইপি বেনিফিট গাইড</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
        </button>

        <button
          onClick={() => {
            alert("অনারারি সমাজকর্মী সোহেল মিয়া: +৮৫৫ ১২ ২২২ ১২৪\nকনস্যুলার প্রজেক্ট সহকারী: +৮৫৫ ৯৭ ৩৩২ ৯৯১");
          }}
          className="w-full px-4 py-4 border-b border-[#E5E7EB] hover:bg-gray-50 text-left text-[#1A1A2E] flex justify-between items-center cursor-pointer"
        >
          <span>ফনম পেনের হেল্পライン ভলান্টিয়ার নম্বর</span>
          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
        </button>

        {/* LOGOUT BUTTON WITH CUSTOM STYLING */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-4 hover:bg-red-50 text-left text-[#E74C3C] font-bold flex justify-between items-center bg-white border-0 transition-colors cursor-pointer"
          style={{ border: "1px solid #E74C3C", color: "#E74C3C" }}
        >
          <span className="flex items-center space-x-1.5">
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* Platform legal details */}
      <div className="text-center space-y-1.5 select-none text-[10px] text-[#6B7280] mt-2 font-mono">
        <p>Probashi Sheba v2.4.0 (Alpha)</p>
        <p>© 2026 Probashi Sheba • All Rights Reserved</p>
      </div>

    </div>
  );
}
