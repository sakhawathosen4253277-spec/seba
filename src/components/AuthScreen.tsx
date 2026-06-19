import React, { useState } from "react";
import { User, Mail, Lock, LogIn, Globe, ArrowRight } from "lucide-react";
import { Language } from "../types";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const translations = {
  BN: {
    brandTitle: "প্রবাসী সেবা",
    brandSubtitle: "কম্বোডিয়ায় বাংলাদেশিদের বিশ্বস্ত সঙ্গী",
    langSelect: "ভাষা নির্বাচন করুন (Select Language)",
    registerTitle: "নতুন প্রবাসী অ্যাকাউন্ট খুলুন",
    loginTitle: "আপনার অ্যাকাউন্টে লগইন করুন",
    fullNameLabel: "আপনার পূর্ণ নাম (Full Name):",
    fullNamePlaceholder: "যেমন: মোঃ সাকিব হাসান",
    emailLabel: "ইমেইল ঠিকানা (Email Address):",
    emailPlaceholder: "যেমন: miah.probashi@gmail.com",
    passwordLabel: "পাসওয়ার্ড (Password):",
    termsAgree: "প্রবাসী সেবার নীতিমালা ও নিয়ম মেনে নিচ্ছি",
    registerBtn: "নিবন্ধন ও প্রবেশ করুন",
    loginBtn: "লগইন করুন",
    loadingText: "প্রক্রিয়াধীন রয়েছে...",
    hasAccount: "ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন",
    needAccount: "নতুন অ্যাকাউন্ট খুলতে চান? সাইন আপ করুন",
    disclaimer: "প্রবাসী সেবা কোনো ব্যাংক বা ইমিগ্রেশন ডিরেক্টরেট নয়। এটি কম্বোডিয়ায় অনিবন্ধিত অসহায় বাংলাদেশিদের সহযোগিতার স্বার্থে ফ্রিল্যান্স সমাজকর্মী দ্বারা গঠিত প্ল্যাটফর্ম ভাই।",
    fillAll: "দয়া করে সব ঘর পূরণ করুন ভাই।",
    fillName: "দয়া করে আপনার নাম লিখুন ভাই।",
    agreeRequired: "দয়া করে প্রবাসী সেবার নীতিমালার সাথে একমত হন ভাই।",
    successReg: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে ভাই!",
    emailInUse: "এই ইমেইলটি ইতিমধ্যে আরেকটি অ্যাকাউন্টে নিবন্ধিত আছে ভাই।",
    invalidEmail: "দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন ভাই।",
    weakPassword: "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে ভাই।",
    wrongCredential: "ভুল ইমেল বা পাসওয়ার্ড দেওয়া হয়েছে ভাই। অনুগ্রহ করে চেক করুন।",
    configNotFound: "দুঃখিত ভাই, আপনার ফায়ারবেস (Firebase) প্রোজেক্টে 'Email/Password' সাইন-ইন মেথড চালু করা নেই। অনুগ্রহ করে Firebase Console এ গিয়ে Authentication -> Sign-in method-এ 'Email/Password' এনাবেল করে দিন ভাই।",
    errorGeneric: "দুঃখিত ভাই, কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
  },
  EN: {
    brandTitle: "Probashi Sheba",
    brandSubtitle: "Trusted companion for Bangladeshis in Cambodia",
    langSelect: "Select / ভাষা পরিবর্তন",
    registerTitle: "Open a New Account",
    loginTitle: "Login to Your Account",
    fullNameLabel: "Your Full Name:",
    fullNamePlaceholder: "e.g., Md. Sakib Hasan",
    emailLabel: "Email Address:",
    emailPlaceholder: "e.g., miah.probashi@gmail.com",
    passwordLabel: "Password:",
    termsAgree: "I agree to the terms & rules of Probashi Sheba",
    registerBtn: "Register & Login",
    loginBtn: "Login",
    loadingText: "Processing...",
    hasAccount: "Already have an account? Login",
    needAccount: "Want to open a new account? Sign Up",
    disclaimer: "Probashi Sheba is not a bank or immigration directorate. It is a volunteer support platform formed by freelance social workers for Bangladeshis in Cambodia.",
    fillAll: "Please fill in all fields.",
    fillName: "Please enter your name.",
    agreeRequired: "Please agree to the terms & conditions.",
    successReg: "Your account was successfully created!",
    emailInUse: "This email is already registered to another account.",
    invalidEmail: "Please enter a valid email address.",
    weakPassword: "Password must be at least 6 characters long.",
    wrongCredential: "Incorrect email or password. Please verify.",
    configNotFound: "Sorry, 'Email/Password' sign-in method is not enabled in your Firebase setup.",
    errorGeneric: "Sorry, something went wrong. Please try again."
  },
  KH: {
    brandTitle: "សេវាប្រវេសជន",
    brandSubtitle: "ដៃគូដែលអាចទុកចិត្តបាន សម្រាប់ជនជាតិបង់ក្លាដែសនៅកម្ពុជា",
    langSelect: "ជ្រើសរើសភាសា / Select Language",
    registerTitle: "ចុះឈ្មោះគណនីថ្មី",
    loginTitle: "ចូលទៅក្នុងគណនីរបស់អ្នក",
    fullNameLabel: "ឈ្មោះពេញរបស់អ្នក:",
    fullNamePlaceholder: "ឧទាហរណ៍៖ Md. Sakib Hasan",
    emailLabel: "អាសយដ្ឋានអ៊ីមែល:",
    emailPlaceholder: "ឧទាហរណ៍៖ miah.probashi@gmail.com",
    passwordLabel: "ពាក្យសម្ងាត់:",
    termsAgree: "ខ្ញុំយល់ព្រមតាមលក្ខខណ្ឌនៃសេវាប្រវេសជន",
    registerBtn: "ចុះឈ្មោះ និងចូល",
    loginBtn: "ចូល",
    loadingText: "កំពុងដំណើរការ...",
    hasAccount: "មានគណនីរួចហើយ? ចូល",
    needAccount: "ចង់បង្កើតគណនីថ្មី? ចុះឈ្មោះ",
    disclaimer: "សេវាប្រវេសជន មិនមែនជាធនាគារ ឬអគ្គនាយកដ្ឋានអន្តោប្រវេសន៍ឡើយ។ វាជាវេទិកាស្ម័គ្រចិត្តបង្កើតឡើងដោយសកម្មជនសង្គម ដើម្បីជួយសម្រួលដល់ប្រជាជនបង់ក្លาដែសនៅកម្ពុជា។",
    fillAll: "សូមបំពេញគ្រប់ចន្លោះ។",
    fillName: "សូមបញ្ចូលឈ្មោះរបស់អ្នក។",
    agreeRequired: "សូមយល់ព្រមតាមលក្ខខណ្ឌ។",
    successReg: "គណនីរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ!",
    emailInUse: "អ៊ីមែលនេះត្រូវបានចុះឈ្មោះរួចហើយ។",
    invalidEmail: "សូមសរសេរអាសយដ្ឋានអ៊ីមែលឱ្យបានត្រឹមត្រូវ។",
    weakPassword: "ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។",
    wrongCredential: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ សូមពិនិត្យម្តងទៀត។",
    configNotFound: "សុំទោស វិធីសាស្ត្រចុះឈ្មោះ 'Email/Password' មិនទាន់បើកក្នុងគម្រោង Firebase របស់អ្នកទេ។",
    errorGeneric: "សុំទោស មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។"
  }
};

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

  // Fallback to "BN" if selected lang layout is somehow not defined
  const currentLang = lang in translations ? lang : "BN";
  const t = translations[currentLang];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert(t.fillAll);
      return;
    }
    if (isRegister && !fullName) {
      alert(t.fillName);
      return;
    }
    if (isRegister && !agreeTerms) {
      alert(t.agreeRequired);
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        // Handle Registration
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        
        await sendEmailVerification(user);
        
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
        
        await auth.signOut();
        alert("রেজিস্ট্রেশন সম্পন্ন! আপনার ইমেইলে একটি যাচাইকরণ লিংক পাঠানো হয়েছে ভাই। ইনবক্স/স্প্যাম চেক করুন, লিংকে ক্লিক করে যাচাই করুন, তারপর লগইন করুন।");
        setIsRegister(false);
      } else {
        // Handle Login
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        if (user.emailVerified === false) {
          await auth.signOut();
          alert("আপনার ইমেইল এখনো যাচাই হয়নি ভাই। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন এবং যাচাইকরণ লিংকে ক্লিক করুন।");
        } else {
          onLoginSuccess?.(user.email || email);
        }
      }
    } catch (error: any) {
      const userErrorCodes = [
        "auth/user-not-found",
        "auth/wrong-password",
        "auth/invalid-credential",
        "auth/email-already-in-use",
        "auth/weak-password",
        "auth/invalid-email"
      ];
      if (error && userErrorCodes.includes(error.code)) {
        console.warn("User auth notice (expected):", error.message || error);
      } else {
        console.error("Auth error:", error);
      }
      let errMsg = t.errorGeneric;
      if (error.code === "auth/email-already-in-use") {
        errMsg = t.emailInUse;
      } else if (error.code === "auth/invalid-email") {
        errMsg = t.invalidEmail;
      } else if (error.code === "auth/weak-password") {
        errMsg = t.weakPassword;
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errMsg = t.wrongCredential;
      } else if (error.code === "auth/configuration-not-found" || (error.message && error.message.includes("configuration-not-found"))) {
        errMsg = t.configNotFound;
      }
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-5 pt-6 font-sans bg-[#F0F4F8] min-h-screen text-[#1A1A2E]">
      
      {/* Brand Profile Center banner */}
      <div className="text-center space-y-2 mt-4 select-none">
        <div className="w-16 h-16 rounded-[16px] bg-[#1B4F72] flex items-center justify-center mx-auto">
          <span className="font-medium text-white text-[20px] font-sans">সেবা</span>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-[22px] font-medium tracking-tight text-[#1A1A2E] font-sans">{t.brandTitle}</h2>
          <p className="text-[12px] text-[#6B7280] font-sans">{t.brandSubtitle}</p>
        </div>
      </div>

      {/* Language Selector options */}
      <div className="bg-white p-[14px] rounded-[16px] border-[0.5px] border-[#E5E7EB] space-y-2.5" style={{ borderWidth: '0.5px' }}>
        <p className="text-xs text-[#6B7280] font-sans font-normal text-center">
          {t.langSelect}
        </p>

        <div className="grid grid-cols-3 gap-2 text-center text-[13px]">
          {[
            { id: "BN", label: "বাংলা" },
            { id: "EN", label: "English" },
            { id: "KH", label: "ភាសាខ្មែរ" }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => onSetLang(l.id as Language)}
              className={`h-11 rounded-[10px] font-medium transition-all cursor-pointer ${
                lang === l.id
                  ? "bg-[#1B4F72] text-white border-none"
                  : "bg-[#F0F4F8] text-[#6B7280] border-[0.5px] border-[#E5E7EB] hover:bg-[#F3F4F6]"
              }`}
              style={{ borderWidth: lang === l.id ? '0' : '0.5px' }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Login Card structure */}
      <div className="bg-white p-[24px] rounded-[16px] border-[0.5px] border-[#E5E7EB] space-y-4" style={{ borderWidth: '0.5px' }}>
        <h3 className="text-[15px] font-medium text-[#1A1A2E] text-center">
          {isRegister ? t.registerTitle : t.loginTitle}
        </h3>

        <form onSubmit={handleAuth} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.fullNameLabel}</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                  style={{ borderWidth: '0.5px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                style={{ borderWidth: '0.5px' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.passwordLabel}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                style={{ borderWidth: '0.5px' }}
              />
            </div>
          </div>

          {isRegister && (
            <div className="flex items-center space-x-2 py-1 text-[#6B7280] text-[13px] font-sans">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="focus:outline-none shrink-0 cursor-pointer"
              >
                {agreeTerms ? (
                  <span className="w-4.5 h-4.5 bg-[#1B4F72] text-white rounded flex items-center justify-center font-bold text-[11px]">✓</span>
                ) : (
                  <span className="w-4.5 h-4.5 rounded bg-[#F9FAFB] border-[0.5px] border-[#E5E7EB] block" style={{ borderWidth: '0.5px' }} />
                )}
              </button>
              <span className="select-none">{t.termsAgree}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#1B4F72] text-white font-medium text-[13px] rounded-[12px] flex items-center justify-center space-x-2 transition-colors cursor-pointer hover:bg-opacity-95 disabled:bg-opacity-50"
          >
            {loading ? (
              <span>{t.loadingText}</span>
            ) : (
              <>
                <span>{isRegister ? t.registerBtn : t.loginBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-[#E5E7EB]" style={{ borderTopWidth: '0.5px' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
            }}
            className="text-[13px] font-medium text-[#1B4F72] focus:outline-none cursor-pointer"
          >
            {isRegister ? t.hasAccount : t.needAccount}
          </button>
        </div>
      </div>

      {/* Safety Policy */}
      <div className="text-center text-[11px] text-[#6B7280] font-sans max-w-[325px] mx-auto leading-relaxed select-none pt-2">
        {t.disclaimer}
      </div>
    </div>
  );
}
