import React, { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Building, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Upload, 
  X, 
  Clock,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  country: string;
  accountName: string;
  qrImageUrl?: string;
  isActive: boolean;
  order?: number;
  network?: string;
  walletAddress?: string;
}

interface EmployerRegisterProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function EmployerRegister({ onBack, onSuccess }: EmployerRegisterProps) {
  const { currentUser, userDoc } = useAuth();
  const userId = currentUser?.uid || "unknown";

  const [step, setStep] = useState<number>(1);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Form states - Step 1
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Form states - Step 2
  const [selfieUrl, setSelfieUrl] = useState<string>("");
  const [selfieName, setSelfieName] = useState<string>("");
  const [passportUrl, setPassportUrl] = useState<string>("");
  const [passportName, setPassportName] = useState<string>("");

  // Form states - Step 3
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethodName, setPaymentMethodName] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState<string>("");

  // Submit and general loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load KH Payment methods
  useEffect(() => {
    async function fetchKHMethods() {
      try {
        const snap = await getDocs(collection(db, "paymentMethods"));
        const fetched: PaymentMethod[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (data.country === "KH" || data.country === "kh") {
            fetched.push({
              id: d.id,
              name: data.name || "",
              country: data.country || "",
              accountName: data.accountName || "",
              qrImageUrl: data.qrImageUrl || "",
              isActive: data.isActive !== undefined ? data.isActive : true,
              order: data.order || 0,
              network: data.network || "",
              walletAddress: data.walletAddress || ""
            });
          }
        });
        
        // Fallback if no payment methods in Firestore
        if (fetched.length === 0) {
          fetched.push({
            id: "aba-fallback",
            name: "ABA Bank",
            country: "KH",
            accountName: "PROBASHI SHEBA LTD",
            qrImageUrl: "https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=400&h=400&q=80",
            isActive: true,
            order: 1
          }, {
            id: "wing-fallback",
            name: "Wing Bank",
            country: "KH",
            accountName: "Sakhawat Hosen",
            qrImageUrl: "https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=400&h=400&q=80",
            isActive: true,
            order: 2
          });
        }

        fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMethods(fetched);
      } catch (err) {
        console.error("Error loading payment methods:", err);
        // Robust fallback
        setMethods([
          {
            id: "aba-fallback",
            name: "ABA Bank",
            country: "KH",
            accountName: "PROBASHI SHEBA LTD",
            qrImageUrl: "",
            isActive: true,
            order: 1
          },
          {
            id: "wing-fallback",
            name: "Wing Bank",
            country: "KH",
            accountName: "Sakhawat Hosen",
            isActive: true,
            order: 2
          }
        ]);
      } finally {
        setLoadingMethods(false);
      }
    }
    fetchKHMethods();
  }, []);

  // FileReader helper for image uploads
  const handleImageRead = (file: File, type: "selfie" | "passport" | "screenshot") => {
    if (file.size > 4 * 1024 * 1024) {
      alert("ফাইল সাইজ ৪ মেগাবাইটের কম হতে হবে ভাই!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === "selfie") {
        setSelfieUrl(base64);
        setSelfieName(file.name);
      } else if (type === "passport") {
        setPassportUrl(base64);
        setPassportName(file.name);
      } else if (type === "screenshot") {
        setScreenshotUrl(base64);
        setScreenshotName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName.trim() || !phone.trim() || !companyName.trim() || !companyAddress.trim() || !whatsapp.trim()) {
        alert("দয়া করে ১ম ধাপের সব তথ্য সঠিকভাবে পূরণ করুন ভাই।");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selfieUrl) {
        alert("দয়া করে আপনার সেলফি বা ছবি আপলোড করুন ভাই।");
        return;
      }
      if (!passportUrl) {
        alert("দয়া করে আপনার পাসপোর্ট বা NID এর ছবি আপলোড করুন ভাই।");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethodName) {
      alert("জামানত পাঠানোর পেমেন্ট মাধ্যম সিলেক্ট করুন ভাই!");
      return;
    }
    if (!transactionId.trim()) {
      alert("Transaction ID বা ট্রানজেকশন নম্বরটি টাইপ করুন ভাই!");
      return;
    }
    if (!screenshotUrl) {
      alert("পেমেন্ট সম্পন্ন হওয়ার স্ক্রিনশটটি আপলোড করুন ভাই!");
      return;
    }

    setIsSubmitting(true);
    const employerId = `employer-${userId}`;
    const depositId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Save to employers collection
      const employerPayload = {
        userId: userId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        phoneVerified: false,
        companyName: companyName.trim(),
        companyAddress: companyAddress.trim(),
        selfieUrl: selfieUrl,
        passportUrl: passportUrl,
        depositAmount: 20,
        depositStatus: "pending",
        verificationStatus: "pending",
        totalJobsPosted: 0,
        totalBonusGiven: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "employers", employerId), employerPayload);

      // 2. Save to employerDeposits collection
      const depositPayload = {
        employerId: employerId,
        amount: 20,
        paymentMethod: paymentMethodName,
        transactionId: transactionId.trim(),
        screenshotUrl: screenshotUrl,
        status: "pending",
        refundReason: "",
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "employerDeposits", depositId), depositPayload);

      // 3. Send Telegram Notification
      try {
        const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
        const CHAT_ID = "8885859813";
        const msg = `🏢 <b>নতুন নিয়োগকর্তা নিবন্ধন</b>\n\n👤 নাম: ${fullName.trim()}\n📞 ফোন: ${phone.trim()}\n🏢 কোম্পানি: ${companyName.trim()}\n💰 জামানত: $20\n👉 Admin Panel এ যাচাই করুন`;
        
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: "HTML"
          })
        });
      } catch (tgErr) {
        console.warn("Telegram notification failed:", tgErr);
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error creating employer registration:", err);
      alert("নিবন্ধন সংরক্ষণ করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logo rendering helper (ABA, Wing, etc.)
  const renderLogo = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("aba")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#005A80] flex flex-col items-center justify-center text-white font-sans shrink-0">
          <span className="text-[13px] font-black tracking-tighter leading-none">ABA</span>
          <span className="text-[6.5px] font-bold tracking-widest leading-none mt-0.5 opacity-90">PAY</span>
        </div>
      );
    }
    if (lower.includes("wing")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#8CC63F] flex flex-col items-center justify-center text-white font-sans shrink-0">
          <span className="text-[12px] font-black tracking-tight leading-none text-[#0066CC]">WING</span>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1B4F72] flex items-center justify-center text-white text-xs font-bold shrink-0">
        KH
      </div>
    );
  };

  if (success) {
    return (
      <div className="px-4 py-8 text-center animate-fade-in font-sans space-y-6 max-w-sm mx-auto">
        <div className="w-16 h-16 bg-emerald-50 text-[#1D9E75] rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-[#1A1A2E]">নিবন্ধন সফল হয়েছে!</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            আলহামদুলিল্লাহ ভাই! আপনার তথ্য এবং জামানতের পেমেন্ট বিবরণী আমাদের প্রশাসন উইং-এ পাঠানো হয়েছে। আমরা আগামী ২৪ ঘণ্টার মধ্যে আপনার তথ্য এবং পাসপোর্ট ম্যানুয়ালি যাচাই করব। যাচাই সম্পন্ন হলে আপনি সরাসরি চাকরির পোস্ট লাইভ করতে পারবেন।
          </p>
        </div>

        <div className="bg-[#EBF5FB] border border-[#1B4F72]/15 p-4 rounded-xl text-left text-[11px] text-[#1B4F72] space-y-1.5 leading-relaxed">
          <p className="font-semibold text-xs">📌 কিছু গুরুত্বপূর্ণ তথ্য:</p>
          <p>• আপনার ভেরিফিকেশন স্ট্যাটাস প্রোফাইল পাতায় আপডেট দেখা যাবে ভাই।</p>
          <p>• সচল যোগাযোগের জন্য আপনার দেওয়া হোয়াটস অ্যাপে চোখ রাখুন ভাই।</p>
        </div>

        <button
          onClick={onSuccess}
          className="w-full py-3 bg-[#1B4F72] text-white font-medium text-xs rounded-xl shadow-xs hover:bg-[#143d59] transition-all cursor-pointer"
        >
          চাকরি বোর্ডে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={onBack}
          className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-md font-medium text-[#1A1A2E]">নিয়োগকর্তা নিবন্ধন</h2>
          <p className="text-[11px] text-[#6B7280]">চাকরি পোস্ট করতে নিচের তথ্য দিন</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { num: 1, label: "ব্যক্তিগত তথ্য" },
          { num: 2, label: "পরিচয় যাচাই" },
          { num: 3, label: "জামানত জমা" }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === s.num 
                ? "bg-[#1B4F72] text-white" 
                : step > s.num 
                  ? "bg-emerald-500 text-white" 
                  : "bg-gray-200 text-gray-500"
            }`}>
              {s.num}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${
              step === s.num ? "text-[#1B4F72] font-semibold" : "text-[#6B7280]"
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="bg-white border rounded-2xl p-5 space-y-4" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">নিয়োগকর্তার পুরো নাম (Full Name):</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার সঠিক নাম লিখুন"
                  className="w-full bg-[#F9FAFB] pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4F72] focus:bg-white text-[#1A1A2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">মোবাইল নম্বর (Phone Number):</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="কম্বোডিয়ান বা বাংলাদেশী নম্বর"
                  className="w-full bg-[#F9FAFB] pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4F72] focus:bg-white text-[#1A1A2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কোম্পানির নাম (Company Name):</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="যেমন: Phnom Penh Café Co."
                  className="w-full bg-[#F9FAFB] pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4F72] focus:bg-white text-[#1A1A2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কোম্পানির ঠিকানা (Company Address):</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="যেমন: St 21, Boeung Keng Kang, Phnom Penh"
                  className="w-full bg-[#F9FAFB] pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4F72] focus:bg-white text-[#1A1A2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">হোয়াটসঅ্যাপ নম্বর (WhatsApp Number):</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#1D9E75]" />
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="পেমেন্ট বা যাচাইয়ের জন্য যোগাযোগ নম্বর"
                  className="w-full bg-[#F9FAFB] pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4F72] focus:bg-white text-[#1A1A2E]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-2.5 bg-[#1B4F72] text-white font-medium text-xs rounded-xl shadow-xs hover:bg-[#143d59] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>পরবর্তী ধাপে যান</span>
          </button>
        </div>
      )}

      {/* Step 2: Document Upload */}
      {step === 2 && (
        <div className="bg-white border rounded-2xl p-5 space-y-5" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
          <div>
            <h3 className="text-sm font-medium text-[#1A1A2E] mb-1">পরিচয় যাচাই (ID Verification)</h3>
            <p className="text-[10px] text-[#6B7280]">দালাল বা স্ক্যাম রুখতে পরিচয় যাচাই বাধ্যতামূলক ভাই</p>
          </div>

          <div className="bg-[#FEF3CD] border border-[#FFEBAA] p-3 rounded-xl text-[11px] text-[#856404] leading-relaxed flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#856404] mt-0.5" />
            <p><strong>⚠️ স্পষ্ট ছবি দিন:</strong> আপনার পাসপোর্ট এবং আপনার ছবি (Selfie) অবশ্যই স্পষ্ট হতে হবে। ঝাপসা বা আলোহীন ছবি গ্রহণযোগ্য নয় ভাই।</p>
          </div>

          {/* Selfie Upload */}
          <div className="space-y-2 text-left">
            <span className="block text-[11px] text-[#6B7280] font-semibold">আপনার ছবি (Selfie Image):</span>
            
            {selfieUrl ? (
              <div className="relative border rounded-xl p-2 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selfieUrl} className="w-10 h-10 rounded-lg object-cover" alt="Selfie" />
                  <span className="text-[11px] text-gray-700 truncate max-w-[160px] font-mono">{selfieName}</span>
                </div>
                <button 
                  onClick={() => { setSelfieUrl(""); setSelfieName(""); }}
                  className="p-1 rounded-full bg-red-50 text-[#E74C3C] hover:bg-red-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 bg-[#F9FAFB] rounded-xl py-5 cursor-pointer hover:bg-slate-50 transition-all">
                <Upload className="w-5 h-5 text-[#1B4F72] mb-1.5" />
                <span className="text-[11px] font-medium text-[#1B4F72]">সেলফি আপলোড করুন</span>
                <span className="text-[9px] text-[#6B7280] mt-0.5">JPG / PNG অনধিক ৪ মেগাবাইট</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageRead(e.target.files[0], "selfie")}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Passport Upload */}
          <div className="space-y-2 text-left">
            <span className="block text-[11px] text-[#6B7280] font-semibold">পাসপোর্ট বা NID এর ছবি (পাসপোর্ট পেজ বা NID উভয় পার্ট):</span>
            
            {passportUrl ? (
              <div className="relative border rounded-xl p-2 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={passportUrl} className="w-10 h-10 rounded-lg object-cover" alt="Passport/NID" />
                  <span className="text-[11px] text-gray-700 truncate max-w-[160px] font-mono">{passportName}</span>
                </div>
                <button 
                  onClick={() => { setPassportUrl(""); setPassportName(""); }}
                  className="p-1 rounded-full bg-red-50 text-[#E74C3C] hover:bg-red-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 bg-[#F9FAFB] rounded-xl py-5 cursor-pointer hover:bg-slate-50 transition-all">
                <Upload className="w-5 h-5 text-[#1B4F72] mb-1.5" />
                <span className="text-[11px] font-medium text-[#1B4F72]">পাসপোর্ট/NID পেজ আপলোড করুন</span>
                <span className="text-[9px] text-[#6B7280] mt-0.5">সবার উপরের পাতা যেখানে ছবি আছে</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageRead(e.target.files[0], "passport")}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-2.5 border border-[#1B4F72] text-[#1B4F72] font-medium text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              পূর্ববর্তী
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-2.5 bg-[#1B4F72] text-white font-medium text-xs rounded-xl hover:bg-[#143d59] transition-all cursor-pointer"
            >
              পরবর্তী
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Deposit */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Info card */}
          <div className="bg-[#EBF5FB] border border-[#1B4F72] p-4 rounded-2xl text-[11px] text-[#1B4F72] space-y-2 leading-relaxed">
            <div className="flex items-center gap-1.5 border-b border-[#1B4F72]/20 pb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1B4F72]" />
              <span className="font-semibold text-xs text-[#1B4F72]">🔐 জামানত সম্পর্কে জানুন:</span>
            </div>
            <p className="font-medium">• জামানত এর পরিমাণ: <strong>$20 USD (ফিক্সড)</strong></p>
            <p>• আপনার পোস্টকৃত চাকরির মাধ্যমে কর্মী নিয়োগ নিশ্চিত হলে: <strong>$20 ফেরত + $10 বোনাস পাবেন</strong></p>
            <p>• কোনো প্রকার প্রতারণা, ফেক তথ্য বা কাজের প্রলোভন দিলে: <strong>$20 জামানত বাজেয়াপ্ত করা হবে</strong></p>
            <p className="italic text-gray-500 font-sans mt-1">এটি মূলত আপনার সততার প্রমাণ ও প্রবাসী ভাইদের নিরাপত্তার জন্য রাখা হচ্ছে।</p>
          </div>

          <div className="bg-white border rounded-2xl p-5 space-y-4" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
            <h3 className="text-xs font-semibold text-[#6B7280] text-left">পেমেন্টের মাধ্যম নির্বাচন করুন:</h3>
            
            {loadingMethods ? (
              <div className="py-4 text-center">
                <Loader2 className="w-5 h-5 text-[#1B4F72] animate-spin mx-auto" />
                <p className="text-[10px] text-gray-400 mt-1">পেমেন্ট মেথড লোড হচ্ছে...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(method);
                      setPaymentMethodName(method.name);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition-all outline-none ${
                      paymentMethodName === method.name 
                        ? "border-[#1B4F72] bg-[#F4F8FA]" 
                        : "border-gray-200 bg-white hover:bg-slate-50"
                    }`}
                    style={{ borderWidth: "0.5px" }}
                  >
                    {renderLogo(method.name)}
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold text-gray-800 truncate">{method.name}</p>
                      <p className="text-[9px] text-[#6B7280] truncate font-sans">{method.accountName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Main Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কত ডলার জমা দিয়েছেন (USD Amount):</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value="$20 USD (ফিক্সড জামানত)"
                  className="w-full bg-slate-100 text-[#1A1A2E] px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">Transaction ID (ট্রানজেকশন নম্বর):</label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যেমন: 8X7F29KL"
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4F72] focus:bg-white font-mono"
                />
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2 text-left">
                <span className="block text-[11px] text-[#6B7280] font-semibold">পেমেন্ট স্ক্রিনশট (Screenshot of Payment):</span>
                
                {screenshotUrl ? (
                  <div className="relative border rounded-xl p-2 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={screenshotUrl} className="w-10 h-10 rounded-lg object-cover" alt="Payment Proof" />
                      <span className="text-[11px] text-gray-700 truncate max-w-[160px] font-mono">{screenshotName}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setScreenshotUrl(""); setScreenshotName(""); }}
                      className="p-1 rounded-full bg-red-50 text-[#E74C3C] hover:bg-red-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 bg-[#F9FAFB] rounded-xl py-4 cursor-pointer hover:bg-slate-50 transition-all">
                    <Upload className="w-5 h-5 text-[#1B4F72] mb-1" />
                    <span className="text-[11px] font-medium text-[#1B4F72]">স্ক্রিনশট আপলোড করুন</span>
                    <span className="text-[9px] text-[#6B7280]">লেনদেন সম্পন্ন হওয়ার রশিদ</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageRead(e.target.files[0], "screenshot")}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-2.5 border border-[#1B4F72] text-[#1B4F72] font-medium text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  পূর্ববর্তী
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#1B4F72] text-white font-medium text-xs rounded-xl hover:bg-[#143d59] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>জমা হচ্ছে...</span>
                    </>
                  ) : (
                    <span>নিবন্ধন সম্পন্ন করুন</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code / Payment Detail Modal */}
      {selectedMethod && (
        <div className="fixed inset-0 z-[100000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-2xl border border-gray-200 p-5 space-y-4 text-center">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-semibold text-[#1B4F72]">পেমেন্ট QR ও বিবরণী</span>
              <button 
                onClick={() => setSelectedMethod(null)}
                className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-[#F8F9FA] p-3 rounded-xl text-left text-[11px] text-gray-700 space-y-1 font-sans">
                <p>মেথড: <strong className="text-gray-950">{selectedMethod.name}</strong></p>
                <p>অ্যাকাউন্ট নাম: <strong className="text-gray-950">{selectedMethod.accountName}</strong></p>
                {selectedMethod.walletAddress && (
                  <p>ঠিকানা: <strong className="text-gray-950 font-mono break-all">{selectedMethod.walletAddress}</strong></p>
                )}
                <p>ডলারের পরিমাণ: <strong className="text-emerald-600">$20 USD (ফিক্সড)</strong></p>
              </div>

              {selectedMethod.qrImageUrl ? (
                <div className="border border-gray-100 rounded-xl p-1.5 bg-white shadow-xs max-w-[160px] mx-auto">
                  <img src={selectedMethod.qrImageUrl} alt="QR Code" className="w-full h-auto aspect-square rounded-lg" />
                </div>
              ) : (
                <div className="py-6 border border-dashed rounded-xl bg-slate-50 text-[10px] text-gray-400 font-sans">
                  কোনো কিউআর কোড পাওয়া যায়নি ভাই। ম্যানুয়ালি ট্রান্সফার করুন।
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMethod(null)}
              className="w-full py-2 bg-[#1B4F72] text-white font-medium text-xs rounded-xl hover:bg-[#143d59] transition-all cursor-pointer"
            >
              ঠিক আছে, সম্পন্ন করেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
