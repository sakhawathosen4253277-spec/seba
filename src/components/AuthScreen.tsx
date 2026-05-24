import React, { useState } from "react";
import { User, Mail, Lock, Sparkles, LogIn, Key, Globe, ArrowRight } from "lucide-react";
import { Language } from "../types";

interface AuthProps {
  onLoginSuccess: (email: string) => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
}

export default function AuthScreen({ onLoginSuccess, lang, onSetLang }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("দয়া করে আপনার ইমেল বা ফোন নম্বর দিন ভাই।");
      return;
    }
    setOtpSent(true);
    alert("আপনার দেওয়া ইমেলে একটি ওয়ান-টাইম ওটিপি (OTP: 5542) পাঠানো হয়েছে ভাই (সম্পূর্ণ ফ্রি)");
  };

  const handleConfirmAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent && otpCode !== "5542") {
      alert("দুঃখিত ভাই, সঠিক ওটিপি কোডটি লিখুন। ডেমো ওটিপি হলোম: 5542");
      return;
    }
    onLoginSuccess(email || "probashi@sheba.com");
  };

  return (
    <div className="flex flex-col space-y-6 pb-20 px-5 pt-6 animate-fade-in font-sans">
      
      {/* Brand Profile Center banner */}
      <div className="text-center space-y-2 mt-4 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,136,0.5)] animate-pulse-green">
          <span className="font-extrabold text-slate-950 text-2xl font-sans">সেবা</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">প্রবাসী সেবা</h2>
          <p className="text-xs text-emerald-400 font-sans tracking-wide">কম্বোডিয়ায় বাংলাদেশিদের বিশ্বস্ত সঙ্গী</p>
        </div>
      </div>

      {/* Language Selector options */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 space-y-2.5">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>ভাষা নির্বাচন করুন (Select Language)</span>
        </p>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { id: "BN", label: "বাংলা (Bengali)" },
            { id: "EN", label: "English" },
            { id: "KH", label: "ភាសាខ្មែរ (Khmer)" }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => onSetLang(l.id as Language)}
              className={`py-2 rounded-lg font-bold border transition-all ${
                lang === l.id
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-slate-950 text-slate-400 border-slate-900"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Login Card structure */}
      <div className="glass-glow-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-extrabold text-white text-center">
          {isRegister ? "নতুন প্রবাসী অ্যাকাউন্ট খুলুন" : "আপনার অ্যাকাউন্টে লগইন করুন"}
        </h3>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">আপনার পূর্ণ নাম (Full Name):</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="যেমন: মোঃ সাকিব হাসান"
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">ইমেইল ঠিকানা বা ফোন (Email or Phone):</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="যেমন: miah.probashi@gmail.com"
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-900 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">পাসওয়ার্ড (Password):</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div className="flex items-center space-x-2 py-1 text-slate-400 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className="focus:outline-none shrink-0"
                >
                  {agreeTerms ? (
                    <span className="w-3.5 h-3.5 bg-emerald-500 border border-emerald-400 rounded flex items-center justify-center text-slate-950 font-bold text-[9px]">✓</span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-900 block" />
                  )}
                </button>
                <span>প্রবাসী সেবার নীতিমালা ও নিয়ম মেনে নিচ্ছি</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-[0_0_10px_rgba(0,255,136,0.2)]"
            >
              <span>{isRegister ? "নিবন্ধন করুন" : "পরবর্তী ধাপ (OTP পাঠান)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmAuth} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-[10px] text-slate-400">ওটিপি কোডটি টাইপ করুন</p>
              <p className="text-[11px] font-bold text-emerald-400 font-mono">Demo OTP is: 5542</p>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">ওটিপি ভেরিফিকেশন কোড (OTP Code):</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="যেমন: 5542"
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-900 focus:outline-none text-center font-mono letter-spacing-wide font-extrabold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4.5 h-4.5" />
              <span>নিরাপদ কোড ভেরিফাই ও প্রবেশ করুন</span>
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="text-xs text-slate-500 hover:text-white block mx-auto text-center font-medium underline mt-2"
            >
              ভুল ইমেল? পরিবর্তন করতে ক্লিক করুন
            </button>
          </form>
        )}

        <div className="text-center pt-3 border-t border-slate-900/60">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setOtpSent(false);
            }}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 font-sans focus:outline-none"
          >
            {isRegister ? "ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন অ্যাকাউন্ট খুলতে চান? সাইন আপ করুন"}
          </button>
        </div>
      </div>

      {/* Safety Policy */}
      <div className="text-center text-[10px] text-slate-500 font-sans max-w-[280px] mx-auto leading-relaxed select-none">
        প্রবাসী সেবা কোনো ব্যাংক বা ইমিগ্রেশন ডিরেক্টরেট নয়। এটি কম্বোডিয়ায় অনিবন্ধিত অসহায় বাংলাদেশিদের সহযোগিতার স্বার্থে ফ্রিল্যান্স সমাজকর্মী দ্বারা গঠিত প্ল্যাটফর্ম ভাই।
      </div>
    </div>
  );
}
