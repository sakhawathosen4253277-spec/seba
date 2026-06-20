import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Wallet, 
  Award, 
  LogOut, 
  Copy, 
  Check, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  Info,
  CreditCard,
  ArrowUpRight,
  Download,
  Clock,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Transaction } from "../types";
import { downloadReceiptImage } from "../lib/receipt";

interface ProfilePageProps {
  onBackToHome: () => void;
  onSelectTab: (tab: any, subView?: string) => void;
  transactions?: Transaction[];
}

export default function ProfilePage({ onBackToHome, onSelectTab, transactions = [] }: ProfilePageProps) {
  const { userDoc } = useAuth();
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
    <div className="flex flex-col font-sans bg-[#F0F4F8] min-h-screen text-[#1A1A2E]" style={{ paddingBottom: "80px" }}>
      
      {/* 0. BACK BUTTON BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: 'white',
        borderBottom: '0.5px solid #E5E7EB',
        cursor: 'pointer'
      }} onClick={onBackToHome}>
        <i className="ti ti-arrow-left" style={{color:'#1B4F72', fontSize:'18px'}}></i>
        <span style={{color:'#1B4F72', fontSize:'14px', fontWeight:'500'}}>ফিরে যান</span>
      </div>
      
      {/* 1. HEADER SECTION (Navy Blue, specific padding) */}
      <div 
        className="bg-[#1B4F72] text-white text-center select-none"
        style={{ padding: '28px 20px 48px' }}
      >
        <div className="relative inline-block">
          {/* Avatar 72px */}
          <div 
            className="w-[72px] h-[72px] bg-white/10 rounded-full border border-white/20 flex items-center justify-center text-white mx-auto"
            style={{ borderWidth: '0.5px' }}
          >
            <User className="w-9 h-9" />
          </div>
          {isPremium && (
            <span className="absolute bottom-0 right-0 bg-[#E74C3C] text-white p-1 rounded-full border border-[#1B4F72]" style={{ borderWidth: '0.5px' }}>
              <Award className="w-3.5 h-3.5 text-white fill-current" />
            </span>
          )}
        </div>

        <div className="mt-3">
          <h3 className="text-[18px] font-medium text-white font-sans">{name}</h3>
          <p className="text-[12px] text-white/70 flex items-center justify-center space-x-1 mt-1 font-sans">
            <Mail className="w-3.5 h-3.5" />
            <span>{email}</span>
          </p>
          
          {/* ID Pill inside Header */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 mt-3 rounded-full border border-white/25 select-none" style={{ borderWidth: '0.5px' }}>
            <span className="text-[11px] font-mono text-white/90">ID: {userId}</span>
            <button 
              onClick={handleCopy}
              className="text-white/80 hover:text-white transition-opacity shrink-0 cursor-pointer outline-none"
            >
              {copied ? <Check className="w-3 h-3 text-[#1D9E75]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLOATING BALANCE CARD (white card, border, negative margin) */}
      <div className="px-4 -mt-6">
        <div 
          className="bg-white border text-center p-5 space-y-4"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4.5 h-4.5 text-[#1B4F72]" />
              <span className="text-[13px] text-[#6B7280] font-sans">মেম্বার ওয়ালেট ব্যালেন্স:</span>
            </div>
            <h3 className="text-[20px] font-semibold text-[#1B4F72] font-mono leading-none">
              ${balance.toFixed(2)} <span className="text-[12px] font-normal text-[#6B7280]">USD</span>
            </h3>
          </div>

          {/* Action buttons (minimum 48px height) */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => onSelectTab("deposit")}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#1B4F72] text-white hover:bg-[#153e5a] cursor-pointer outline-none font-sans"
              style={{
                borderRadius: '12px',
                fontSize: '13px'
              }}
            >
              <CreditCard className="w-4.5 h-4.5" />
              <span>ডিপোজিট</span>
            </button>
            <button
              onClick={() => onSelectTab("transfer")}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-white text-[#1B4F72] border hover:bg-gray-50 cursor-pointer outline-none font-sans"
              style={{
                borderColor: '#1B4F72',
                borderWidth: '0.5px',
                borderRadius: '12px',
                fontSize: '13px'
              }}
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
              <span>পাঠান</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. STATS ROW (3 columns: মোট ডিপোজিট | মোট ট্রান্সফার | সদস্যপদ) */}
      <div className="px-4 mt-4">
        <div 
          className="bg-white border grid grid-cols-3 text-center py-4"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <div className="border-r border-[#E5E7EB]" style={{ borderRightWidth: '0.5px' }}>
            <p className="text-[11px] text-[#6B7280] font-sans">মোট ডিপোজিট</p>
            <p className="text-[14px] font-medium text-[#1A1A2E] font-mono mt-1">${balance.toFixed(2)}</p>
          </div>
          <div className="border-r border-[#E5E7EB]" style={{ borderRightWidth: '0.5px' }}>
            <p className="text-[11px] text-[#6B7280] font-sans">মোট ট্রান্সফার</p>
            <p className="text-[14px] font-medium text-[#1A1A2E] font-mono mt-1">$0.00</p>
          </div>
          <div>
            <p className="text-[11px] text-[#6B7280] font-sans">সদস্যপদ</p>
            <p className="text-[14px] font-medium text-[#1B4F72] uppercase font-sans mt-1">
              {tier === "vip" ? "VIP" : tier === "premium" ? "Gold" : "기본 / Basic"}
            </p>
          </div>
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS */}
      <div className="px-4 mt-4 text-left font-sans">
        <h4 className="text-[13px] font-medium text-[#1A1A2E] font-sans mb-2 pl-1 select-none text-left">
          সাম্প্রতিক লেনদেনসমূহ (Recent Transactions)
        </h4>
        <div 
          className="bg-white border p-4 space-y-3"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          {transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-start justify-between pb-3 border-b border-[#F0F4F8] last:border-0 last:pb-0 font-sans" style={{ borderBottomWidth: '0.5px' }}>
                  <div className="text-left flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-[13px] font-semibold text-[#1A1A2E]">{tx.recipientName}</span>
                      <span className="text-[9px] bg-[#1B4F72]/10 text-[#1B4F72] px-1.5 py-0.5 rounded font-medium">
                        {tx.recipientMethod === "bKash" && "বিকাশ"}
                        {tx.recipientMethod === "Nagad" && "নগদ"}
                        {tx.recipientMethod === "Rocket" && "রকেট"}
                        {tx.recipientMethod === "Bank" && "ব্যাংক"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">{tx.date} • {tx.recipientNumber}</p>
                    <button
                      onClick={() => downloadReceiptImage(tx)}
                      className="mt-2 text-[10px] text-[#1B4F72] font-semibold flex items-center space-x-1 bg-[#1B4F72]/5 hover:bg-[#1B4F72]/10 border border-[#1B4F72]/10 px-2 py-1.5 rounded transition-all cursor-pointer select-none inline-flex"
                      style={{ borderRadius: '6px', borderWidth: '0.5px' }}
                    >
                      <Download className="w-3 h-3 text-[#1B4F72] shrink-0 mr-1" />
                      <span>রশিদ ডাউনলোড করুন</span>
                    </button>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-[13px] font-bold text-[#1D9E75] font-mono">৳ {tx.amountBdt.toLocaleString("bn-BD")} BDT</p>
                    <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">${tx.amountUsd} USD</p>
                    <div className="mt-1 flex justify-end">
                      {tx.status === "completed" && (
                        <span className="flex items-center space-x-0.5 text-[9px] font-bold text-[#1D9E75] bg-[#1D9E75]/10 px-1.5 py-0.25 rounded-md border border-[#1D9E75]/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>সম্পন্ন</span>
                        </span>
                      )}
                      {tx.status === "pending" && (
                        <span className="flex items-center space-x-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.25 rounded-md border border-amber-500/20 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>অপেক্ষারত</span>
                        </span>
                      )}
                      {tx.status === "cancelled" && (
                        <span className="flex items-center space-x-0.5 text-[9px] font-bold text-[#E74C3C] bg-[#E74C3C]/10 px-1.5 py-0.25 rounded-md border border-[#E74C3C]/20">
                          <XCircle className="w-3 h-3" />
                          <span>বাতিল</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Default mock/previous transaction showing actual balance deposit */}
              <div className="flex items-start justify-between pb-3 border-b border-[#F0F4F8]" style={{ borderBottomWidth: '0.5px' }}>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8F8F1] flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-[#1D9E75]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-medium text-[#1A1A2E] font-sans">মেম্বার ওয়ালেট ডিপোজিট</p>
                      <p className="text-[11px] text-[#6B7280] font-sans">১৪ জুন ২০২৬</p>
                    </div>
                  </div>
                  {balance > 0 && (
                    <button
                      onClick={() => downloadReceiptImage({
                        id: "TX-784910",
                        senderName: name,
                        recipientName: name,
                        recipientMethod: "Bank",
                        recipientNumber: "মেম্বার ওয়ালেট ডিপোজিট",
                        amountUsd: balance,
                        amountBdt: Math.round(balance * 110.8),
                        feeUsd: 0,
                        date: "১৪ জুন ২০২৬",
                        status: "completed"
                      })}
                      className="mt-3.5 text-[10px] text-[#1B4F72] font-semibold flex items-center bg-[#1B4F72]/5 hover:bg-[#1B4F72]/10 border border-[#1B4F72]/10 px-2 py-1.5 rounded transition-all cursor-pointer select-none inline-flex"
                      style={{ borderRadius: '6px', borderWidth: '0.5px' }}
                    >
                      <Download className="w-3 h-3 text-[#1B4F72] shrink-0 mr-1" />
                      <span>রশিদ ডাউনলোড করুন</span>
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#1D9E75] font-mono">+${balance.toFixed(2)} USD</p>
                  <span className="text-[10px] bg-[#E8F8F1] text-[#1D9E75] px-2 py-0.5 rounded-full font-sans inline-block mt-1">সফল</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-[#6B7280] font-sans text-center w-full">কোনো পুরনো ট্রানজেকশন রেকর্ড নেই ভাই</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. MENU LIST (নোটিফিকেশন | ভাষা | নিরাপত্তা | সাপোর্ট | অ্যাপ সম্পর্কে) */}
      <div className="px-4 mt-4 space-y-2">
        <h4 className="text-[13px] font-medium text-[#1A1A2E] font-sans mb-1 pl-1 select-none text-left">
          মেনু ও তথ্যাদি (Menu & Settings)
        </h4>

        {/* Notification settings */}
        <button
          onClick={() => alert("নোটিফিকেশন সিস্টেমটি সচল আছে ভাই!")}
          className="w-full bg-white border flex items-center justify-between p-4 cursor-pointer outline-none text-left transition-colors active:bg-gray-50"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <span className="flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
              <Bell className="w-4.5 h-4.5 text-[#1B4F72]" />
            </div>
            <span className="text-[13px] font-medium text-[#1A1A2E] font-sans">নোটিফিকেশন সেটিংস্</span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
        </button>

        {/* Global language */}
        <button
          onClick={() => alert("ভাষা পরিবর্তন করতে সাইনইন পেজে ল্যাঙ্গুয়েজ সিলেক্টর ব্যবহার করুন ভাই।")}
          className="w-full bg-white border flex items-center justify-between p-4 cursor-pointer outline-none text-left transition-colors active:bg-gray-50"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <span className="flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
              <Globe className="w-4.5 h-4.5 text-[#1B4F72]" />
            </div>
            <span className="text-[13px] font-medium text-[#1A1A2E] font-sans">ভাষা পরিবর্তন (Language)</span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
        </button>

        {/* Security */}
        <button
          onClick={() => alert("আপনার অ্যাকাউন্ট ডেটা সম্পূর্ণ সুরক্ষিত এবং পাসওয়ার্ড এনক্রিপ্টেড ভাই।")}
          className="w-full bg-white border flex items-center justify-between p-4 cursor-pointer outline-none text-left transition-colors active:bg-gray-50"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <span className="flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
              <Shield className="w-4.5 h-4.5 text-[#1B4F72]" />
            </div>
            <span className="text-[13px] font-medium text-[#1A1A2E] font-sans">নিরাপত্তা ও প্রাইভেসি</span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
        </button>

        {/* Support */}
        <button
          onClick={() => {
            alert("অনারারি সমাজকর্মী সোহেল মিয়া: +৮৫৫ ১২ ২২২ ১২৪\nকনস্যুলার প্রজেক্ট সহকারী: +৮৫৫ ৯৭ ৩৩২ ৯৯১");
          }}
          className="w-full bg-white border flex items-center justify-between p-4 cursor-pointer outline-none text-left transition-colors active:bg-gray-50"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <span className="flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4.5 h-4.5 text-[#1B4F72]" />
            </div>
            <span className="text-[13px] font-medium text-[#1A1A2E] font-sans">হেল্পলাইন ভলান্টিয়ার সাপোর্ট</span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
        </button>

        {/* App Info */}
        <button
          onClick={() => alert("Probashi Sheba v2.4.0 — Cambodian-BD migrant support app.")}
          className="w-full bg-white border flex items-center justify-between p-4 cursor-pointer outline-none text-left transition-colors active:bg-gray-50"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <span className="flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
              <Info className="w-4.5 h-4.5 text-[#1B4F72]" />
            </div>
            <span className="text-[13px] font-medium text-[#1A1A2E] font-sans">অ্যাপ সম্পর্কে</span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
        </button>

        {/* Premium Membership guide */}
        <button
          onClick={() => onSelectTab("services", "premium")}
          className="w-full bg-white border flex items-center justify-between p-4 cursor-pointer outline-none text-left transition-colors active:bg-gray-50"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          <span className="flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 rounded-full bg-[#E8F8F1] flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-[#1D9E75]" />
            </div>
            <span className="text-[13px] font-medium text-[#1A1A2E] font-sans">প্রিমিয়াম ভিআইপি মেম্বার গাইড</span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
        </button>
      </div>

      {/* 6. LOGOUT BUTTON (White card, borders) */}
      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full h-12 flex items-center justify-center space-x-2 bg-white cursor-pointer select-none transition-all outline-none font-sans"
          style={{
            borderColor: '#E74C3C',
            borderWidth: '1.5px',
            borderRadius: '16px',
            color: '#E74C3C',
            fontWeight: 500,
            fontSize: '13px'
          }}
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>লগআউট করুন (Log Out)</span>
        </button>
      </div>

      {/* Footnote details */}
      <div className="text-center space-y-1 select-none text-[10px] text-[#6B7280] mt-8 font-mono pb-8">
        <p>Probashi Sheba v2.4.0 (Alpha)</p>
        <p>© 2026 Probashi Sheba • All Rights Reserved</p>
      </div>

    </div>
  );
}
