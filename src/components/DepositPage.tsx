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
  network?: string;
  walletAddress?: string;
}

interface DepositPageProps {
  onBack: () => void;
  userEmail: string;
}

export default function DepositPage({ onBack, userEmail }: DepositPageProps) {
  const { userDoc, currentUser } = useAuth();
  const userId = userDoc?.userId || "PS-000000";
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exchangeRate, setExchangeRate] = useState<number>(110.80);
  
  // UI states
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Form states and Refs
  const formRef = useRef<HTMLDivElement>(null);
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
            order: data.order || 0,
            network: data.network || "",
            walletAddress: data.walletAddress || ""
          });
        });
        
        // Sort
        fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMethods(fetched);
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : String(err);
        const isOffline = errMessage.toLowerCase().includes("offline") || 
                          errMessage.toLowerCase().includes("failed to get document") ||
                          errMessage.toLowerCase().includes("network");
        if (isOffline) {
          console.warn("Deposit page database load skipped (offline):", errMessage);
        } else {
          console.error("Error fetching DepositPage data:", err);
        }
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
    if (lower.includes("binance")) {
      return { bg: "bg-[#F3BA2F]", letter: "B" };
    }
    return { bg: "bg-[#1B4F72]", letter: name ? name.charAt(0).toUpperCase() : "K" };
  };

  // Logo helper for Cambodian & Bangladeshi banks (high-fidelity custom inline vector graphics)
  const renderMethodLogo = (name: string): React.ReactNode => {
    const lower = name.toLowerCase();
    
    if (lower.includes("binance")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#F3BA2F] border border-[#e1ad2b] flex flex-col items-center justify-center p-1 select-none overflow-hidden text-white font-sans shrink-0">
          <span className="text-[15px] font-black tracking-tighter leading-none text-[#1A1A2E]">B</span>
          <span className="text-[7px] font-black tracking-tight leading-none mt-1 text-[#1A1A2E]">BINANCE</span>
        </div>
      );
    }
    
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
    setPaymentMethodName(method.name);
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
    const userName = userDoc?.name || currentUser?.displayName || userEmail || "প্রবাসী ইউজার";

    try {
      const calculatedBdt = Number((valAmt * exchangeRate).toFixed(2));
      const payload = {
        id: requestId,
        userId: userId,
        senderName: userName.trim(),
        senderPhone: "",
        amount: valAmt,
        calculatedBdt: calculatedBdt,
        methodName: paymentMethodName,
        transactionId: transactionId.trim(),
        proofImageUrl: screenshotBase64,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "depositRequests", requestId), payload);

      // Send Telegram notification directly from frontend
      try {
        const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
        const CHAT_ID = "8885859813";
        const message = `🔔 <b>নতুন ডিপোজিট অনুরোধ</b>

👤 ইউজার আইডি: ${userId}
💵 পরিমাণ: $${valAmt} USD
🏦 মাধ্যম: ${paymentMethodName}
🔑 Transaction ID: ${transactionId.trim()}
⏰ সময়: ${new Date().toLocaleString('bn-BD')}

👉 Admin Panel এ যাচাই করুন`;

        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "HTML"
          })
        });
      } catch (telegramErr) {
        console.warn("Telegram notification failed on frontend:", telegramErr);
      }

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
      <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border rounded-[16px] p-8 max-w-sm w-full flex flex-col items-center space-y-4" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
          <span className="text-[48px] text-[#1D9E75] leading-none mb-2">✅</span>
          <h2 className="text-[15px] font-medium text-[#1A1A2E] font-sans">অনুরোধ পাওয়া গেছে ভাই!</h2>
          <p className="text-[13px] leading-relaxed text-[#6B7280] font-sans">
            আপনার পাঠানো পেমেন্টটি আমাদের টিম যাচাই করে দেখছে। খুব শীঘ্রই আপনার ওয়ালেটে ব্যালেন্স যোগ হবে ভাই।
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              onBack();
            }}
            className="w-full h-12 mt-4 bg-[#1B4F72] text-white font-medium text-[13px] rounded-xl cursor-pointer hover:bg-opacity-95 transition-colors"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 px-4 bg-[#F0F4F8] min-h-screen text-[#1A1A2E] font-sans text-left" style={{ paddingBottom: "80px" }}>
      
      {/* PAGE HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: 'white',
        borderBottom: '0.5px solid #E5E7EB',
        cursor: 'pointer',
        marginLeft: '-16px',
        marginRight: '-16px',
        marginBottom: '10px'
      }} onClick={onBack}>
        <i className="ti ti-arrow-left" style={{color:'#1B4F72', fontSize:'18px'}}></i>
        <span style={{color:'#1B4F72', fontSize:'14px', fontWeight:'500'}}>ফিরে যান</span>
      </div>

      <div className="text-left font-sans">
        <h2 className="text-lg font-medium text-[#1A1A2E]">ডিপোজিট করুন</h2>
        <p className="text-xs text-[#6B7280]">আপনার অ্যাকাউন্টে ডলার যোগ করুন</p>
      </div>
 
      {/* TRUST BAR */}
      <div 
        className="rounded-[16px] p-4 text-left border flex items-center gap-2.5 font-sans"
        style={{ backgroundColor: "#E8F8F1", borderColor: "#1D9E75", borderWidth: "0.5px" }}
      >
        <span className="text-[15px]">🛡️</span>
        <p className="text-[13px] font-medium text-[#0F6E56]">
          আপনার টাকা ১০০% নিরাপদ ভাই • যাচাইয়ের পর ব্যালেন্স যোগ হবে
        </p>
      </div>

      {/* PAYMENT METHODS */}
      <div className="space-y-4 font-sans">
        <div className="text-left">
          <h3 className="text-[13px] font-medium text-[#1A1A2E]">পেমেন্ট মাধ্যম বেছে নিন ভাই:</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-8 space-y-2 bg-white rounded-[16px] border" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
            <Loader2 className="w-6 h-6 text-[#1B4F72] animate-spin" />
            <p className="text-[13px] text-[#6B7280]">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* GLOBAL SECTION */}
            <div className="space-y-2">
              <div className="text-left">
                <h4 className="text-[12px] font-medium text-[#6B7280] font-sans flex items-center gap-1">
                  <span>🌍</span> যেকোনো দেশ থেকে (GLOBAL)
                </h4>
              </div>
              
              <div 
                onClick={() => {
                  const binanceMethod = methods.find(m => m.id === "binance") || {
                    id: 'binance',
                    name: 'Binance (USDT)',
                    country: 'GLOBAL',
                    color: '#F3BA2F',
                    isActive: true,
                    order: 9,
                    accountName: 'Probashi Sheba',
                    qrImageUrl: '',
                    network: 'TRC20 / BEP20',
                    walletAddress: ''
                  };
                  handleMethodSelect(binanceMethod);
                }}
                className="w-full bg-white rounded-[14px] p-4 flex flex-col justify-between cursor-pointer hover:bg-gray-50 transition-all select-none"
                style={{ border: "0.5px solid #F3BA2F", borderRadius: "14px", padding: "16px" }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3.5">
                    {/* Left: Binance Logo Circle */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-sans font-bold select-none shrink-0"
                      style={{ backgroundColor: "#F3BA2F", fontSize: "18px" }}
                    >
                      B
                    </div>
                    {/* Right Info */}
                    <div className="flex flex-col text-left">
                      <span className="text-[14px] font-medium text-[#1A1A2E] leading-tight">
                        Binance USDT
                      </span>
                      <span className="text-[11px] text-[#6B7280] font-sans mt-0.5 font-sans">
                        Network: TRC20 / BEP20
                      </span>
                    </div>
                  </div>
                  {/* Right Action Trigger */}
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-[#F3BA2F] font-sans">
                      ট্যাপ করুন
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* LOCAL SECTION */}
            <div className="space-y-2">
              <div className="text-left">
                <h4 className="text-[12px] font-medium text-[#6B7280] font-sans flex items-center gap-1">
                  <span>🇰🇭</span> কম্বোডিয়া থেকে (LOCAL)
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                        className="bg-white border rounded-[16px] p-4.5 flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 transition-all select-none font-sans"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        {customLogo ? (
                          customLogo
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium font-sans text-sm ${style.bg}`}>
                            {style.letter}
                          </div>
                        )}
                        <span className="text-[13px] font-medium text-[#1A1A2E] mt-2.5 font-sans">
                          {m.name}
                        </span>
                        <span className="text-[13px] text-[#1B4F72] mt-1 font-medium font-sans">
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
                        className="bg-white border rounded-[16px] p-4.5 flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 transition-all select-none font-sans"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        {customLogo ? (
                          customLogo
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium font-sans text-sm ${style.bg}`}>
                            {style.letter}
                          </div>
                        )}
                        <span className="text-[13px] font-medium text-[#1A1A2E] mt-2.5 font-sans">
                          {m.name}
                        </span>
                        <span className="text-[13px] text-[#1B4F72] mt-1 font-medium font-sans">
                          ট্যাপ করুন
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DEPOSIT FORM */}
      <div 
        ref={formRef}
        className="bg-white rounded-[16px] p-5 border text-left font-sans animate-fade-in"
        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
      >
        <h3 className="text-[14px] font-medium text-[#1B4F72] mb-4 pb-2 border-b font-sans text-left" style={{ borderColor: "#E5E7EB", borderBottomWidth: "0.5px" }}>
          পেমেন্ট করার পর জানান
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-[13px] text-left">
          {/* Read-Only User ID & Auto-filled Payment Method */}
          <div 
            className="flex items-center justify-between text-left font-sans"
            style={{ backgroundColor: "#F7F8FA", borderRadius: "10px", padding: "10px 14px" }}
          >
            <span className="text-[12px] text-[#6B7280]">আইডি: <span className="font-mono">{userId}</span></span>
            {paymentMethodName ? (
              <div className="flex items-center gap-1.5 select-none">
                <span className={`w-2.5 h-2.5 rounded-full ${getMethodStyle(paymentMethodName).bg}`}></span>
                <span className="text-[12px] text-[#6B7280] font-medium font-sans">{paymentMethodName}</span>
              </div>
            ) : (
              <span className="text-[12px] text-gray-400 italic">পেমেন্ট মাধ্যম সিলেক্ট করুন</span>
            )}
          </div>

          {/* 1. কত ডলার পাঠিয়েছেন */}
          <div className="flex flex-col space-y-1 text-left">
            <label className="text-[12px] text-[#6B7280] font-medium font-sans">কত ডলার পাঠিয়েছেন</label>
            <input
              type="number"
              required
              value={amountSent}
              onChange={(e) => setAmountSent(e.target.value)}
              placeholder="যেমন: 50"
              className="bg-white border border-[#E5E7EB] rounded-xl px-3.5 h-12 text-[13px] outline-none focus:border-[#1B4F72] text-[#1A1A2E] font-mono"
              style={{ borderWidth: "0.5px" }}
              min="1"
            />
            {amountSent && !isNaN(Number(amountSent)) && (
              <div 
                className="text-[13px] font-semibold font-sans" 
                style={{ backgroundColor: "#F0FDF4", color: "#0F6E56", borderRadius: "8px", padding: "8px 12px" }}
              >
                আপনি পাবেন ≈ {(Number(amountSent) * exchangeRate).toFixed(2)} BDT
              </div>
            )}
          </div>

          {/* 2. ট্রানজেকশন আইডি */}
          <div className="flex flex-col space-y-1 text-left">
            <label className="text-[12px] text-[#6B7280] font-medium font-sans">ট্রানজেকশন আইডি</label>
            <input
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Reference নম্বর লিখুন"
              className="bg-white border border-[#E5E7EB] rounded-xl px-3.5 h-12 text-[13px] outline-none focus:border-[#1B4F72] text-[#1A1A2E] font-mono"
              style={{ borderWidth: "0.5px" }}
            />
          </div>

          {/* 3. Screenshot আপলোড করুন */}
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[12px] text-[#6B7280] font-medium font-sans">Screenshot আপলোড করুন</label>
            <label 
              className="border border-[#E5E7EB] border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F7F8FA] hover:bg-gray-50 text-center relative transition-colors"
              style={{ borderWidth: "0.5px" }}
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
                  <img src={screenshotBase64} alt="Preview" className="w-10 h-10 object-cover rounded border border-[#E5E7EB]" style={{ borderWidth: "0.5px" }} />
                  <span className="text-[13px] text-[#1D9E75] font-semibold truncate max-w-[170px]">{screenshotName || "স্লিপ যুক্ত হয়েছে"}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 justify-center">
                  <span className="text-[13px] text-[#1B4F72] font-medium font-sans">📎 ছবি আপলোড করুন</span>
                </div>
              )}
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full text-white font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: "#1B4F72", 
              height: "52px", 
              borderRadius: "14px", 
              fontSize: "15px"
            }}
          >
            {submitLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>অপেক্ষা করুন...</span>
              </>
            ) : (
              <span>জমা দিন ✓</span>
            )}
          </button>
        </form>
      </div>

      {/* QR MODAL */}
      {selectedMethod && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] p-6 w-[310px] relative text-center flex flex-col items-center space-y-4"
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedMethod(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex flex-col items-center space-y-1">
              {renderMethodLogo(selectedMethod.name) ? (
                renderMethodLogo(selectedMethod.name)
              ) : (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium font-sans text-sm ${getMethodStyle(selectedMethod.name).bg}`}>
                  {getMethodStyle(selectedMethod.name).letter}
                </div>
              )}
              <h3 className="text-[14px] font-medium text-[#1A1A2E] mt-1.5 font-sans">
                {selectedMethod.id === 'binance' ? "Binance USDT" : selectedMethod.name}
              </h3>
              
              {selectedMethod.id === 'binance' ? (
                <span className="text-[11px] font-medium font-sans mt-0.5" style={{ backgroundColor: "#FEF3CD", color: "#7D5000", borderRadius: "20px", padding: "4px 12px" }}>
                  {selectedMethod.network || "TRC20 / BEP20"}
                </span>
              ) : (
                <p className="text-[12px] text-[#6B7280] font-sans">স্ক্যান করুন এবং সরাসরি পেমেন্ট করুন</p>
              )}
            </div>

            {/* QR Image wrapper */}
            {selectedMethod.qrImageUrl ? (
              <div className="flex flex-col items-center space-y-2">
                <img 
                  src={selectedMethod.qrImageUrl} 
                  alt={`${selectedMethod.name} QR Code`}
                  className="w-[200px] h-[200px] object-contain rounded-xl border border-gray-100"
                  referrerPolicy="no-referrer"
                />
                
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMethod.qrImageUrl) {
                      const link = document.createElement("a");
                      link.href = selectedMethod.qrImageUrl;
                      link.download = `${selectedMethod.name.replace(/\s+/g, "_")}_qr.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="bg-[#F0F4F8] border border-[#E5E7EB] rounded-lg text-[#1B4F72] text-[12px] px-3 py-1.5 hover:bg-gray-100 font-medium transition-all cursor-pointer"
                >
                  📥 QR কোড গ্যালারিতে সেভ করুন
                </button>
              </div>
            ) : selectedMethod.id === 'binance' ? (
              /* If no QR and is binance: show wallet address in a copyable box */
              <div className="w-full text-left space-y-2">
                <div 
                  className="rounded-[10px] p-3.5 border text-left font-mono relative flex flex-col space-y-1"
                  style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB", borderRadius: "10px", padding: "12px" }}
                >
                  <span className="text-[10px] text-[#6B7280] font-sans font-medium uppercase">USDT Wallet Address:</span>
                  <span className="text-[12px] text-[#1A1A2E] break-all select-all font-semibold leading-relaxed">
                    {selectedMethod.walletAddress || "TNoUSDTAddressConfiguredYet"}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const addr = selectedMethod.walletAddress || "TNoUSDTAddressConfiguredYet";
                      navigator.clipboard.writeText(addr);
                      alert("Wallet Address কপি করা হয়েছে ভাই! ✓");
                    }}
                    className="mt-2.5 w-full h-8 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#1B4F72] text-[11px] font-medium rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    style={{ borderWidth: "0.5px" }}
                  >
                    📋 কপি করুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-[180px] h-[180px] bg-gray-100 rounded-[12px] flex items-center justify-center text-[12px] text-gray-400 border border-dashed border-gray-300 font-sans">
                শীঘ্রই আসছে ভাই
              </div>
            )}

            {/* Warning Box for Binance */}
            {selectedMethod.id === 'binance' && (
              <div 
                className="w-full text-left text-[11px] leading-relaxed p-3.5 rounded-xl font-sans"
                style={{ backgroundColor: "#FEF3CD", borderColor: "#F5A623", borderWidth: "0.5px", color: "#7D5000" }}
              >
                <span>⚠️ <strong>সতর্কতা:</strong> শুধুমাত্র <strong>TRC20 অথবা BEP20</strong> নেটওয়ার্কের মাধ্যমে USDT পাঠাবেন ভাই। ভুল নেটওয়ার্কে পাঠালে আপনার ডলার চিরতরে হারিয়ে যাবে।</span>
              </div>
            )}

            {/* Account Info display */}
            <div className="w-full bg-[#F0F4F8] rounded-[10px] p-3 text-left font-sans">
              <p className="text-[11px] text-[#6B7280]">
                {selectedMethod.id === 'binance' ? "বাইনান্স অ্যাকাউন্ট নাম:" : "অ্যাকাউন্টের নাম (Receiver Name):"}
              </p>
              <p className="text-[13px] font-medium text-[#1A1A2E] mt-0.5">{selectedMethod.accountName || "PROBASHI ACC"}</p>
            </div>

            {/* Instruction */}
            <p className="text-[11px] text-[#6B7280] font-sans">
              পেমেন্ট পাঠানো শেষ করে নিচের সবুজ বাটনে ক্লিক করুন
            </p>

            {/* Confirm */}
            <button
              onClick={handleModalConfirm}
              className="w-full h-11 bg-[#1D9E75] text-white font-medium text-[13px] rounded-xl cursor-pointer hover:bg-opacity-95 transition-all animate-none"
            >
              আমি পেমেন্ট করেছি ভাই ✓
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
