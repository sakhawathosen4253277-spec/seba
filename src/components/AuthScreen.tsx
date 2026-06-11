import React, { useState } from "react";
import { User, Mail, Lock, LogIn, Globe, ArrowRight } from "lucide-react";
import { Language } from "../types";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface AuthProps {
  onLoginSuccess?: (email: string) => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
}

export default function AuthScreen({ onLoginSuccess, lang, onSetLang }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("দয়া করে সব ঘর পূরণ করুন ভাই।");
      return;
    }
    if (isRegister && !fullName) {
      alert("দয়া করে আপনার নাম লিখুন ভাই।");
      return;
    }
    if (isRegister && !agreeTerms) {
      alert("দয়া করে প্রবাসী সেবার নীতিমালার সাথে একমত হন ভাই।");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        // Handle Registration
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        
        // Generate random 6 digit number
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
        const generatedUserId = "PS-" + randomDigits;

        // Save doc in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          userId: generatedUserId,
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          balance: 0,
          isPremium: false,
          isBlocked: false,
          createdAt: new Date().toISOString()
        });
        
        alert("আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে ভাই!");
        onLoginSuccess?.(user.email || email);
      } else {
        // Handle Login
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        onLoginSuccess?.(userCredential.user.email || email);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errMsg = "দুঃখিত ভাই, কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।";
      if (error.code === "auth/email-already-in-use") {
        errMsg = "এই ইমেইলটি ইতিমধ্যে আরেকটি অ্যাকাউন্টে নিবন্ধিত আছে ভাই।";
      } else if (error.code === "auth/invalid-email") {
        errMsg = "দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন ভাই।";
      } else if (error.code === "auth/weak-password") {
        errMsg = "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে ভাই।";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errMsg = "ভুল ইমেল বা পাসওয়ার্ড দেওয়া হয়েছে ভাই। অনুগ্রহ করে চেক করুন।";
      } else if (error.code === "auth/configuration-not-found" || (error.message && error.message.includes("configuration-not-found"))) {
        errMsg = "দুঃখিত ভাই, আপনার ফায়ারবেস (Firebase) প্রোজেক্টে 'Email/Password' সাইন-ইন মেথড চালু করা নেই। অনুগ্রহ করে Firebase Console এ গিয়ে Authentication -> Sign-in method-এ 'Email/Password' এনাবেল করে দিন ভাই।";
      }
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-5 pt-6 font-sans bg-[#F7F8FA] min-h-screen">
      
      {/* Brand Profile Center banner */}
      <div className="text-center space-y-2 mt-4 select-none">
        <div className="w-16 h-16 rounded-[16px] bg-[#1B4F72] flex items-center justify-center mx-auto">
          <span className="font-medium text-white text-[20px] font-sans">সেবা</span>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-[22px] font-medium tracking-tight text-[#1A1A2E] font-sans">প্রবাসী সেবা</h2>
          <p className="text-[12px] text-[#6B7280] font-sans">কম্বোডিয়ায় বাংলাদেশিদের বিশ্বস্ত সঙ্গী</p>
        </div>
      </div>

      {/* Language Selector options */}
      <div className="bg-white p-[14px] rounded-[14px] border-[0.5px] border-[#E5E7EB] space-y-2.5">
        <p className="text-[11px] text-[#6B7280] font-sans font-normal text-center">
          ভাষা নির্বাচন করুন (Select Language)
        </p>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { id: "BN", label: "বাংলা" },
            { id: "EN", label: "English" },
            { id: "KH", label: "ភាសាខ្មែរ" }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => onSetLang(l.id as Language)}
              className={`py-2 rounded-[10px] font-medium transition-all cursor-pointer ${
                lang === l.id
                  ? "bg-[#1B4F72] text-white border-none"
                  : "bg-[#F7F8FA] text-[#6B7280] border-[0.5px] border-[#E5E7EB] hover:bg-[#F3F4F6]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Login Card structure */}
      <div className="bg-white p-[24px] rounded-[16px] border-[0.5px] border-[#E5E7EB] space-y-4">
        <h3 className="text-[15px] font-medium text-[#1A1A2E] text-center">
          {isRegister ? "নতুন প্রবাসী অ্যাকাউন্ট খুলুন" : "আপনার অ্যাকাউন্টে লগইন করুন"}
        </h3>

        <form onSubmit={handleAuth} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-[11px] text-[#6B7280] font-normal mb-1">আপনার পূর্ণ নাম (Full Name):</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: মোঃ সাকিব হাসান"
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] text-xs pl-9 pr-4 py-3 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-[#6B7280] font-normal mb-1">ইমেইল ঠিকানা (Email Address):</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="যেমন: miah.probashi@gmail.com"
                className="w-full bg-[#F9FAFB] text-[#1A1A2E] text-xs pl-9 pr-4 py-3 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#6B7280] font-normal mb-1">পাসওয়ার্ড (Password):</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F9FAFB] text-[#1A1A2E] text-xs pl-9 pr-4 py-3 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div className="flex items-center space-x-2 py-1 text-[#6B7280] text-[12px] font-sans">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="focus:outline-none shrink-0 cursor-pointer"
              >
                {agreeTerms ? (
                  <span className="w-4 h-4 bg-[#1B4F72] text-white rounded flex items-center justify-center font-bold text-[10px]">✓</span>
                ) : (
                  <span className="w-4 h-4 rounded bg-[#F9FAFB] border-[0.5px] border-[#E5E7EB] block" />
                )}
              </button>
              <span>প্রবাসী সেবার নীতিমালা ও নিয়ম মেনে নিচ্ছি</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1B4F72] text-white font-medium text-xs rounded-[12px] flex items-center justify-center space-x-2 transition-colors cursor-pointer hover:bg-opacity-95 disabled:bg-opacity-50"
          >
            {loading ? (
              <span>প্রক্রিয়াধীন রয়েছে...</span>
            ) : (
              <>
                <span>{isRegister ? "নিবন্ধন ও প্রবেশ করুন" : "লগইন করুন"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
            }}
            className="text-[13px] font-medium text-[#1B4F72] focus:outline-none cursor-pointer"
          >
            {isRegister ? "ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন অ্যাকাউন্ট খুলতে চান? সাইন আপ করুন"}
          </button>
        </div>
      </div>

      {/* Safety Policy */}
      <div className="text-center text-[10px] text-[#9CA3AF] font-sans max-w-[300px] mx-auto leading-relaxed select-none">
        প্রবাসী সেবা কোনো ব্যাংক বা ইমিগ্রেশন ডিরেক্টরেট নয়। এটি কম্বোডিয়ায় অনিবন্ধিত অসহায় বাংলাদেশিদের সহযোগিতার স্বার্থে ফ্রিল্যান্স সমাজকর্মী দ্বারা গঠিত প্ল্যাটফর্ম ভাই।
      </div>
    </div>
  );
}
