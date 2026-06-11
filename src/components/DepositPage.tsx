import React, { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

interface PaymentMethod {
  id: string;
  name: string;
  country: string;
  accountName: string;
  qrImageUrl?: string;
  isActive: boolean;
  order?: number;
}

interface DepositPageProps {
  onBack: () => void;
  userEmail: string;
}

export default function DepositPage({ onBack, userEmail }: DepositPageProps) {
  const { userDoc } = useAuth();
  const userId = userDoc?.userId || "PS-000000";
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exchangeRate, setExchangeRate] = useState<number>(110.80);
  
  // UI states
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Form states and Refs
  const formRef = useRef<HTMLDivElement>(null);
  const [senderName, setSenderName] = useState<string>("");
  const [senderPhone, setSenderPhone] = useState<string>("");
  const [amountSent, setAmountSent] = useState<string>("");
  const [paymentMethodName, setPaymentMethodName] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Load Cambodia payment methods and live rate
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch rate first
        const rateSnap = await getDoc(doc(db, "exchangeRates", "current"));
        if (rateSnap.exists()) {
          const rateData = rateSnap.data();
          if (rateData.usdRate) {
            setExchangeRate(Number(rateData.usdRate));
          } else if (rateData.rate) {
            setExchangeRate(Number(rateData.rate));
          }
        }

        // Fetch payment methods
        const snap = await getDocs(collection(db, "paymentMethods"));
        const fetched: PaymentMethod[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            name: data.name || "",
            country: data.country || "",
            accountName: data.accountName || "",
            qrImageUrl: data.qrImageUrl || "",
            isActive: data.isActive !== undefined ? data.isActive : true,
            order: data.order || 0
          });
        });
        
        // Sort
        fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMethods(fetched);
      } catch (err) {
        console.error("Error fetching DepositPage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter KH active methods
  const khMethods = methods.filter((m) => m.isActive && (m.country === "KH" || m.country === "kh"));

  // Styling helper for the color circles
  const getMethodStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("aba")) {
      return { bg: "bg-[#E31837]", letter: "A" };
    }
    if (lower.includes("wing")) {
      return { bg: "bg-[#0066CC]", letter: "W" };
    }
    if (lower.includes("true")) {
      return { bg: "bg-[#FF6600]", letter: "T" };
    }
    if (lower.includes("acleda")) {
      return { bg: "bg-[#004B87]", letter: "A" };
    }
    return { bg: "bg-[#1B4F72]", letter: name ? name.charAt(0).toUpperCase() : "K" };
  };

  // Logo helper for Cambodian & Bangladeshi banks (high-fidelity custom inline vector graphics)
  const renderMethodLogo = (name: string): React.ReactNode => {
    const lower = name.toLowerCase();
    
    if (lower.includes("aba")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#005A80] border border-[#004f70] flex flex-col items-center justify-center p-1 select-none overflow-hidden text-white font-sans">
          <span className="text-[15px] font-black tracking-tighter leading-none">ABA</span>
          <span className="text-[7.5px] font-bold tracking-widest leading-none mt-0.5 opacity-90">PAY</span>
        </div>
      );
    }
    
    if (lower.includes("wing")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#8CC63F] border border-[#7cb434] flex flex-col items-center justify-center p-0.5 select-none overflow-hidden text-white font-sans">
          <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="44" fill="white" />
            <path d="M24 35 L40 68 L50 48 L60 68 L76 35" stroke="#8CC63F" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[7.5px] font-black tracking-wide leading-none mt-0.5 text-[#0066CC]">WING BANK</span>
        </div>
      );
    }
    
    if (lower.includes("true")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#FF6600] border border-[#e05900] flex flex-col items-center justify-center p-1 select-none overflow-hidden text-white font-sans">
          <svg viewBox="0 0 100 100" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="44" fill="white" />
            <path d="M35 34 H55" stroke="#FF6600" strokeWidth="12" strokeLinecap="round" />
            <path d="M45 34 V66" stroke="#FF6600" strokeWidth="12" strokeLinecap="round" />
            <path d="M54 44 H68" stroke="#FF6600" strokeWidth="10" strokeLinecap="round" />
            <path d="M60 44V66" stroke="#FF6600" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <span className="text-[7.5px] font-black tracking-wide leading-none mt-0.5">true money</span>
        </div>
      );
    }
    
    if (lower.includes("acleda")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#004B87] border border-[#003c6c] flex flex-col items-center justify-center p-1 select-none overflow-hidden text-white font-sans">
          <svg viewBox="0 0 100 100" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 15 C38 30 28 35 24 54 C30 58 40 62 50 68 C60 62 70 58 76 54 C72 35 62 30 50 15 Z" fill="#F1C40F" />
            <circle cx="50" cy="38" r="6" fill="#004B87" />
            <path d="M35 48 C42 52 58 52 65 48" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-[7.5px] font-extrabold tracking-wide leading-none mt-0.5 text-white">ACLEDA</span>
        </div>
      );
    }

    if (lower.includes("bkash")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#E2136E] border border-[#c40e5d] flex flex-col items-center justify-center p-1 select-none overflow-hidden text-white font-sans">
          <span className="text-[15px] font-black italic tracking-tighter leading-none">bKash</span>
          <span className="text-[7px] font-medium tracking-normal leading-none mt-1 opacity-90">বিকাশ</span>
        </div>
      );
    }

    if (lower.includes("nagad")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#F6921E] border border-[#db7e16] flex flex-col items-center justify-center p-1 select-none overflow-hidden text-white font-sans">
          <span className="text-[14px] font-black italic tracking-tighter leading-none">Nagad</span>
          <span className="text-[7px] font-medium tracking-normal leading-none mt-1 opacity-90">নগদ</span>
        </div>
      );
    }

    if (lower.includes("rocket")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#8B1FA8] border border-[#761890] flex flex-col items-center justify-center p-1 select-none overflow-hidden text-white font-sans">
          <span className="text-[14px] font-black italic tracking-tighter leading-none">Rocket</span>
          <span className="text-[7px] font-medium tracking-normal leading-none mt-1 opacity-90">রকেট</span>
        </div>
      );
    }

    return null;
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleModalConfirm = () => {
    if (selectedMethod) {
      setPaymentMethodName(selectedMethod.name);
    }
    setSelectedMethod(null);
    // Scroll smoothly to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("ফাইল সাইজ ৩ মেগাবাইটের কম হতে হবে ভাই!");
        return;
      }
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName.trim()) {
      alert("আপনার নাম লিখুন ভাই!");
      return;
    }
    if (!senderPhone.trim()) {
      alert("আপনার ফোন নম্বর দিন ভাই!");
      return;
    }
    const valAmt = Number(amountSent);
    if (!amountSent || isNaN(valAmt) || valAmt <= 0) {
      alert("সঠিক ডলারের পরিমাণ লিখুন ভাই!");
      return;
    }
    if (!paymentMethodName) {
      alert("পেমেন্ট মাধ্যম সিলেক্ট করুন ভাই!");
      return;
    }
    if (!transactionId.trim()) {
      alert("Transaction ID লিখুন ভাই!");
      return;
    }
    if (!screenshotBase64) {
      alert("Screenshot আপলোড করুন ভাই!");
      return;
    }

    setSubmitLoading(true);
    const requestId = `DEP-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await setDoc(doc(db, "depositRequests", requestId), {
        id: requestId,
        userId: userId,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        amount: valAmt,
        calculatedBdt: Number((valAmt * exchangeRate).toFixed(2)),
        methodName: paymentMethodName,
        transactionId: transactionId.trim(),
        proofImageUrl: screenshotBase64,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
    } catch (err) {
      console.error("Error saving deposit request to firestore:", err);
      alert("অনুরোধ পাঠানো সম্ভব হয়নি। পুনরায় চেষ্টা করুন!");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Download QR handler
  const handleDownloadQR = (url: string, name: string) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/\s+/g, "_")}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 max-w-sm w-full flex flex-col items-center space-y-4">
          <span className="text-[48px] text-[#1D9E75] leading-none">✅</span>
          <h2 className="text-base font-semibold text-[#0F6E56]">অনুরোধ পাওয়া গেছে!</h2>
          <p className="text-[12px] leading-relaxed text-[#6B7280]">
            যাচাইয়ের পর আপনার অ্যাকাউন্টে ব্যালেন্স যোগ হবে
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              onBack();
            }}
            className="w-full mt-4 py-3 bg-white border border-[#1B4F72] text-[#1B4F72] font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            হোমে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 px-4 pb-24 bg-[#F7F8FA] min-h-screen text-[#1A1A2E] font-sans">
      
      {/* PAGE HEADER */}
      <div className="flex items-center space-x-3 pt-4">
        <button 
          onClick={onBack}
          className="p-1.5 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-100 transition-all text-[#1B4F72] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs">সিরিজ ফিরুন</span>
        </button>
        <div className="text-left">
          <h2 className="text-lg font-medium text-[#1A1A2E]">ডিপোজিট করুন</h2>
          <p className="text-xs text-[#6B7280]">আপনার অ্যাকাউন্টে ডলার যোগ করুন</p>
        </div>
      </div>

      {/* TRUST BAR */}
      <div 
        className="rounded-xl p-3 text-center border"
        style={{ backgroundColor: "#E8F8F1", borderColor: "#1D9E75", borderWidth: "0.5px" }}
      >
        <p className="text-xs font-semibold text-[#0F6E56]">
          🛡️ আপনার টাকা ১০০% নিরাপদ • যাচাইয়ের পর ব্যালেন্স যোগ হবে
        </p>
      </div>

      {/* PAYMENT METHODS */}
      <div className="space-y-3">
        <div className="text-left">
          <h3 className="text-[13px] font-medium text-[#1A1A2E]">পেমেন্ট মাধ্যম বেছে নিন</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-8 space-y-2">
            <Loader2 className="w-6 h-6 text-[#1B4F72] animate-spin" />
            <p className="text-xs text-[#6B7280]">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[10px]">
            {khMethods.length === 0 ? (
              // Inline fallback if DB is unseeded or completely offline
              [
                { id: "fallback-aba", name: "ABA Bank", accountName: "PROBASHI ACC" },
                { id: "fallback-wing", name: "Wing Money", accountName: "PROBASHI ACC" },
                { id: "fallback-true", name: "True Money", accountName: "PROBASHI ACC" },
                { id: "fallback-acleda", name: "Acleda Bank", accountName: "PROBASHI ACC" }
              ].map((m) => {
                const style = getMethodStyle(m.name);
                const customLogo = renderMethodLogo(m.name);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleMethodSelect({
                      id: m.id,
                      name: m.name,
                      country: "KH",
                      accountName: m.accountName,
                      isActive: true
                    })}
                    className="bg-white border rounded-[14px] p-4 flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 transition-all select-none"
                    style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                  >
                    {customLogo ? (
                      customLogo
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium font-sans text-sm ${style.bg}`}>
                        {style.letter}
                      </div>
                    )}
                    <span className="text-[13px] font-medium text-[#1A1A2E] mt-2">
                      {m.name}
                    </span>
                    <span className="text-[11px] text-[#1B4F72] mt-1 font-medium">
                      ট্যাপ করুন
                    </span>
                  </div>
                );
              })
            ) : (
              khMethods.map((m) => {
                const style = getMethodStyle(m.name);
                const customLogo = renderMethodLogo(m.name);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleMethodSelect(m)}
                    className="bg-white border rounded-[14px] p-4 flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 transition-all select-none"
                    style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                  >
                    {customLogo ? (
                      customLogo
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium font-sans text-sm ${style.bg}`}>
                        {style.letter}
                      </div>
                    )}
                    <span className="text-[13px] font-medium text-[#1A1A2E] mt-2">
                      {m.name}
                    </span>
                    <span className="text-[11px] text-[#1B4F72] mt-1 font-medium">
                      ট্যাপ করুন
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* DEPOSIT FORM */}
      <div 
        ref={formRef}
        className="bg-white rounded-2xl p-5 border text-left"
        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
      >
        <h3 className="text-[15px] font-semibold text-[#1A1A2E] mb-4">পেমেন্ট নিশ্চিত করুন</h3>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {/* Read-Only User ID Field */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">আইডি:</label>
            <input
              type="text"
              readOnly
              value={userId}
              className="bg-[#EAECEF] border border-[#D5D7DB] rounded-xl px-3.5 py-2.5 text-xs outline-none text-[#556070] font-mono font-medium"
            />
          </div>

          {/* Sender Name */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">আপনার নাম:</label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="যেমন: হাসান আলী"
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72]"
            />
          </div>

          {/* Sender Phone */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">আপনার ফোন নম্বর:</label>
            <input
              type="tel"
              required
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="যেমন: +855 012 XXX XXX"
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72] font-mono"
            />
          </div>

          {/* Amount Sent USD */}
          <div className="flex flex-col space-y-1.55">
            <label className="text-[11px] text-[#6B7280] font-medium">কত ডলার পাঠিয়েছেন (USD):</label>
            <input
              type="number"
              required
              value={amountSent}
              onChange={(e) => setAmountSent(e.target.value)}
              placeholder="যেমন: 50"
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72] font-mono"
              min="1"
            />
            {amountSent && !isNaN(Number(amountSent)) && (
              <div className="bg-[#F0FDF4] rounded-lg p-2 text-[#0F6E56] text-xs font-semibold">
                আনুমানিক {(Number(amountSent) * exchangeRate).toFixed(1)} BDT
              </div>
            )}
          </div>

          {/* Payment Method Dropdown */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">পেমেন্ট মাধ্যম:</label>
            <select
              required
              value={paymentMethodName}
              onChange={(e) => setPaymentMethodName(e.target.value)}
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72]"
            >
              <option value="">নির্ধারণ করুন</option>
              <option value="ABA Bank">ABA Bank</option>
              <option value="Wing Money">Wing Money</option>
              <option value="True Money">True Money</option>
              <option value="Acleda Bank">Acleda Bank</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">Transaction ID:</label>
            <input
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Reference নম্বর"
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72] font-mono"
            />
          </div>

          {/* Screenshot upload */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">Screenshot আপলোড করুন:</label>
            <label 
              className="border border-[#E5E7EB] border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[#F7F8FA] hover:bg-gray-50 text-center relative"
            >
              <input 
                type="file"
                accept="image/*"
                required
                onChange={handleImageUpload}
                className="hidden"
              />
              {screenshotBase64 ? (
                <div className="flex items-center space-x-2">
                  <img src={screenshotBase64} alt="Preview" className="w-10 h-10 object-cover rounded border border-gray-100" />
                  <span className="text-[11px] text-emerald-600 font-semibold truncate max-w-[170px]">{screenshotName || "যুক্ত হয়েছে"}</span>
                </div>
              ) : (
                <>
                  <span className="text-xl">📎</span>
                  <span className="text-[11px] text-[#6B7280]">ছবি আপলোড করুন</span>
                </>
              )}
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full py-3.5 bg-[#1B4F72] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {submitLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>জমা হচ্ছে ভাই...</span>
              </>
            ) : (
              <span>জমা দিন</span>
            )}
          </button>
        </form>
      </div>

      {/* QR MODAL */}
      {selectedMethod && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] p-6 w-[300px] relative text-center flex flex-col items-center space-y-4"
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedMethod(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex flex-col items-center space-y-1">
              {renderMethodLogo(selectedMethod.name) ? (
                renderMethodLogo(selectedMethod.name)
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium font-sans text-sm ${getMethodStyle(selectedMethod.name).bg}`}>
                  {getMethodStyle(selectedMethod.name).letter}
                </div>
              )}
              <h3 className="text-base font-medium text-[#1A1A2E] mt-1">{selectedMethod.name}</h3>
              <p className="text-[12px] text-[#6B7280]">স্ক্যান করুন এবং টাকা পাঠান</p>
            </div>

            {/* QR Image wrapper */}
            {selectedMethod.qrImageUrl ? (
              <div className="flex flex-col items-center space-y-2">
                <img 
                  src={selectedMethod.qrImageUrl} 
                  alt={`${selectedMethod.name} QR Code`}
                  className="w-[200px] h-[200px] object-fit rounded-xl border border-gray-100"
                  referrerPolicy="no-referrer"
                />
                
                <button
                  type="button"
                  onClick={() => handleDownloadQR(selectedMethod.qrImageUrl!, selectedMethod.name)}
                  className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-sm text-[#1B4F72] text-[12px] px-3 py-1.5 hover:bg-gray-100 font-medium transition-all"
                >
                  📥 QR ডাউনলোড করুন
                </button>
              </div>
            ) : (
              <div className="w-[180px] h-[180px] bg-gray-100 rounded-[12px] flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300">
                শীঘ্রই আসছে
              </div>
            )}

            {/* Account Info display */}
            <div className="w-full bg-[#F7F8FA] rounded-[10px] p-3 text-left">
              <p className="text-[10px] text-[#6B7280]">প্রাপক:</p>
              <p className="text-[12px] font-medium text-[#1A1A2E] mt-0.5">{selectedMethod.accountName || "PROBASHI ACC"}</p>
            </div>

            {/* Instruction */}
            <p className="text-[11px] text-[#6B7280]">
              পেমেন্ট করুন এবং নিচের বাটনে ক্লিক করুন
            </p>

            {/* Confirm */}
            <button
              onClick={handleModalConfirm}
              className="w-full py-3.5 bg-[#1B4F72] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl cursor-pointer"
            >
              পেমেন্ট করেছি ✓
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
