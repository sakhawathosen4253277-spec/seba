import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  X,
  Camera,
  Calculator,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Transaction } from "../types";
import { downloadReceiptImage } from "../lib/receipt";

interface ProfilePageProps {
  onBackToHome: () => void;
  onSelectTab: (tab: any, subView?: string) => void;
  transactions?: Transaction[];
}

export default function ProfilePage({ onBackToHome, onSelectTab }: ProfilePageProps) {
  const { userDoc, currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Calculator States & Logic
  const [dbRates, setDbRates] = useState({
    bkash: 110.50,
    nagad: 110.60,
    rocket: 110.70,
    bank: 110.80
  });
  const [calcUsd, setCalcUsd] = useState<string>("");
  const [calcBdt, setCalcBdt] = useState<string>("");
  const [selectedRateType, setSelectedRateType] = useState<string>("bkash");

  useEffect(() => {
    // Listen to exchange rates live in ProfilePage too!
    const unsubscribeRates = onSnapshot(doc(db, "exchangeRates", "current"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbRates({
          bkash: Number(data.bkash) || 110.50,
          nagad: Number(data.nagad) || 110.60,
          rocket: Number(data.rocket) || 110.70,
          bank: Number(data.bank) || 110.80
        });
      }
    });
    return () => unsubscribeRates();
  }, []);

  const getActiveRate = () => {
    if (selectedRateType === "bkash") return dbRates.bkash;
    if (selectedRateType === "nagad") return dbRates.nagad;
    if (selectedRateType === "rocket") return dbRates.rocket;
    return dbRates.bank;
  };

  const handleUsdChange = (val: string, rate: number) => {
    setCalcUsd(val);
    if (!val || isNaN(Number(val))) {
      setCalcBdt("");
    } else {
      setCalcBdt((parseFloat(val) * rate).toFixed(0));
    }
  };

  const handleBdtChange = (val: string, rate: number) => {
    setCalcBdt(val);
    if (!val || isNaN(Number(val))) {
      setCalcUsd("");
    } else {
      setCalcUsd((parseFloat(val) / rate).toFixed(2));
    }
  };

  const handleRateSelect = (type: string) => {
    setSelectedRateType(type);
    let rate = dbRates.bkash;
    if (type === "nagad") rate = dbRates.nagad;
    else if (type === "rocket") rate = dbRates.rocket;
    else if (type === "bank") rate = dbRates.bank;

    if (calcUsd) {
      setCalcBdt((parseFloat(calcUsd) * rate).toFixed(0));
    } else if (calcBdt) {
      setCalcUsd((parseFloat(calcBdt) / rate).toFixed(2));
    }
  };
  
  // Settings & Modal system states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [txAlerts, setTxAlerts] = useState(() => localStorage.getItem("txAlerts") !== "false");
  const [offerAlerts, setOfferAlerts] = useState(() => localStorage.getItem("offerAlerts") !== "false");
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem("selectedLanguage") || "বাংলা");
  const [pwResetLoading, setPwResetLoading] = useState(false);
  const [pwResetMsg, setPwResetMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("দয়া করে ২ এমবি (2MB) এর চেয়ে ছোট ছবি সিলেক্ট করুন ভাই!");
        return;
      }
      setPhotoUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          if (currentUser) {
            await updateDoc(doc(db, "users", currentUser.uid), {
              profilePhoto: base64String
            });
          }
        } catch (err) {
          console.error("Error saving profile photo:", err);
          alert("ছবি পরিবর্তন করতে সমস্যা হয়েছে ভাই!");
        } finally {
          setPhotoUploading(false);
        }
      };
      reader.onerror = () => {
        alert("ফাইল পড়তে সমস্যা হয়েছে ভাই!");
        setPhotoUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTxAlerts = () => {
    const newVal = !txAlerts;
    setTxAlerts(newVal);
    localStorage.setItem("txAlerts", String(newVal));
  };

  const toggleOfferAlerts = () => {
    const newVal = !offerAlerts;
    setOfferAlerts(newVal);
    localStorage.setItem("offerAlerts", String(newVal));
  };

  const selectLang = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem("selectedLanguage", lang);
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      setPwResetMsg({ text: "আপনার ইমেইল পাওয়া যায়নি ভাই।", isError: true });
      return;
    }
    setPwResetLoading(true);
    setPwResetMsg(null);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setPwResetMsg({ text: "আপনার ইমেইলে পাসওয়ার্ড রিসেট করার লিঙ্ক পাঠানো হয়েছে ভাই। অনুগ্রহ করে ইমেইল ইনবক্স চেক করুন ভাই।", isError: false });
    } catch (err: any) {
      console.error(err);
      setPwResetMsg({ text: "পাসওয়ার্ড রিসেট ইমেইল পাঠাতে সমস্যা সৃষ্টি হয়েছে ভাই। দয়া করে পরে চেষ্টা করুন।", isError: true });
    } finally {
      setPwResetLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    // We fetch from 'transferRequests' which is where client transactions are stored
    const q = query(
      collection(db, 'transferRequests'),
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side to prevent Firestore composite index query errors
      txList.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setTransactions(txList);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

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
        <div className="relative inline-block group">
          {/* Avatar 72px */}
          <label 
            htmlFor="profile-photo-input"
            className="block w-[72px] h-[72px] bg-white/10 rounded-full border border-white/20 flex items-center justify-center text-white mx-auto overflow-hidden relative cursor-pointer"
            style={{ borderWidth: '0.5px' }}
          >
            {userDoc?.profilePhoto ? (
              <img 
                src={userDoc.profilePhoto} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-9 h-9" />
            )}
            {photoUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-[10px] text-white">...</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </label>
          <input 
            type="file" 
            accept="image/*" 
            id="profile-photo-input" 
            onChange={handlePhotoUpload} 
            className="hidden" 
          />
          {isPremium && (
            <span className="absolute bottom-0 right-0 bg-[#E74C3C] text-white p-1 rounded-full border border-[#1B4F72]" style={{ borderWidth: '0.5px' }}>
              <Award className="w-3.5 h-3.5 text-white fill-current" />
            </span>
          )}
        </div>
        <p className="text-[10px] text-white/50 mt-1 font-sans">ছবি পরিবর্তন করতে উপরে ক্লিক করুন</p>

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

      {/* 3.5. Live Calculator Card */}
      <div className="px-4 mt-4">
        <div 
          className="bg-white border text-left p-4 space-y-4"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px'
          }}
        >
          {/* Header Area */}
          <div className="flex items-center justify-between">
            <div className="text-left font-sans">
              <h3 className="text-[13px] font-medium text-[#1A1A2E] leading-tight flex items-center gap-1.5">
                <span>💱</span> লাইভ ক্যালকুলেটর
              </h3>
              <p className="text-[11px] font-normal text-[#6B7280] mt-0.5">
                আজকের রেট অনুযায়ী হিসাব করুন ভাই
              </p>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="space-y-3">
            {/* USD to BDT Row */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#6B7280] font-sans">USD থেকে BDT:</label>
              <div className="flex items-center space-x-2.5">
                <div className="flex-1 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#6B7280] font-sans">$</span>
                  <input
                    type="number"
                    value={calcUsd}
                    onChange={(e) => handleUsdChange(e.target.value, getActiveRate())}
                    placeholder="0"
                    className="w-full pl-7 pr-3.5 py-2.5 bg-[#F9FAFB] border rounded-[10px] text-[16px] font-semibold text-[#1A1A2E] font-sans outline-none focus:border-[#1B4F72] transition-colors"
                    style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                  />
                </div>
                
                <div className="text-gray-400 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 bg-[#F9FAFB] border rounded-[10px] px-3.5 py-2.5 flex items-center justify-between min-h-[46px]" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                  <span className="text-[16px] font-semibold text-[#0F6E56] font-sans truncate">
                    {calcBdt ? Number(calcBdt).toLocaleString("bn-BD") : "০"}
                  </span>
                  <span className="text-[15px] font-medium text-[#6B7280]">৳</span>
                </div>
              </div>
            </div>

            {/* BDT to USD Row */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#6B7280] font-sans">BDT থেকে USD:</label>
              <div className="flex items-center space-x-2.5">
                <div className="flex-1 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#6B7280] font-sans">৳</span>
                  <input
                    type="number"
                    value={calcBdt}
                    onChange={(e) => handleBdtChange(e.target.value, getActiveRate())}
                    placeholder="0"
                    className="w-full pl-7 pr-3.5 py-2.5 bg-[#F9FAFB] border rounded-[10px] text-[16px] font-semibold text-[#1A1A2E] font-sans outline-none focus:border-[#1B4F72] transition-colors"
                    style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                  />
                </div>
                
                <div className="text-gray-400 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 bg-[#F9FAFB] border rounded-[10px] px-3.5 py-2.5 flex items-center justify-start space-x-1 min-h-[46px]" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                  <span className="text-[15px] font-medium text-[#6B7280] font-sans">$</span>
                  <span className="text-[16px] font-semibold text-[#1B4F72] font-sans truncate">
                    {calcUsd || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Selector Pills */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-medium text-[#6B7280]">টাকা পাঠানোর মাধ্যম নির্বাচন করুন:</p>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "bkash", label: `bKash ${dbRates.bkash.toFixed(2)}` },
                { id: "nagad", label: `Nagad ${dbRates.nagad.toFixed(2)}` },
                { id: "rocket", label: `Rocket ${dbRates.rocket.toFixed(2)}` },
                { id: "bank", label: `Bank ${dbRates.bank.toFixed(2)}` }
              ].map((pill) => {
                const isActive = selectedRateType === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handleRateSelect(pill.id)}
                    className={`px-3 py-1.5 text-[11px] font-medium font-sans rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                      isActive 
                        ? "bg-[#1B4F72] text-white" 
                        : "bg-[#F7F8FA] text-[#6B7280] hover:bg-gray-100"
                    }`}
                    style={{
                      border: isActive ? 'none' : '0.5px solid #E5E7EB',
                      borderWidth: isActive ? '0px' : '0.5px'
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Charge Note */}
          <div className="text-[10px] text-[#9CA3AF] font-sans pt-1">
            * ট্রান্সফারে ২% সার্ভিস চার্জ প্রযোজ্য
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
              {transactions.map((tx) => {
                const displayDate = tx.date || (tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("bn-BD", {day: "numeric", month: "long", year: "numeric"}) : "আজ");
                const displayNum = tx.recipientNumber || tx.recipientPhone || tx.recipientBankAccount || "";
                const displayBdt = tx.amountBdt || tx.calculatedBdt || tx.bdtAmount || 0;
                const displayUsd = tx.amountUsd || tx.amount || tx.totalDeducted || 0;
                const normalizedTxForReceipt = {
                  id: tx.id,
                  senderName: tx.senderName || name || "ওয়ালেট ইউজার",
                  recipientName: tx.recipientName,
                  recipientMethod: tx.recipientMethod || "Bank",
                  recipientNumber: displayNum,
                  amountUsd: Number(displayUsd),
                  amountBdt: Number(displayBdt),
                  feeUsd: Number(tx.serviceCharge || 0),
                  date: displayDate,
                  status: tx.status || "pending",
                  confirmationDigits: tx.confirmationDigits || ""
                };

                return (
                  <div key={tx.id} className="flex items-start justify-between pb-3 border-b border-[#F0F4F8] last:border-0 last:pb-0 font-sans" style={{ borderBottomWidth: '0.5px' }}>
                    <div className="text-left flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-[13px] font-semibold text-[#1A1A2E]">{tx.recipientName}</span>
                        <span className="text-[9px] bg-[#1B4F72]/10 text-[#1B4F72] px-1.5 py-0.5 rounded font-medium">
                          {tx.recipientMethodName || tx.recipientMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">{displayDate} • {displayNum}</p>
                      {tx.status === "completed" && tx.confirmationDigits && (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-[#1D9E75] bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse"></span>
                            <span>পিন কোড: <span className="font-mono font-bold">*{tx.confirmationDigits}</span></span>
                          </span>
                        </div>
                      )}
                      {tx.status === "completed" && (
                        <button
                          onClick={() => downloadReceiptImage(normalizedTxForReceipt)}
                          className="mt-2 text-[10px] text-[#1B4F72] font-semibold flex items-center space-x-1 bg-[#1B4F72]/5 hover:bg-[#1B4F72]/10 border border-[#1B4F72]/10 px-2 py-1.5 rounded transition-all cursor-pointer select-none inline-flex"
                          style={{ borderRadius: '6px', borderWidth: '0.5px' }}
                        >
                          <Download className="w-3 h-3 text-[#1B4F72] shrink-0 mr-1" />
                          <span>রশিদ ডাউনলোড করুন</span>
                        </button>
                      )}
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      <p className="text-[13px] font-bold text-[#1D9E75] font-mono">৳ {displayBdt.toLocaleString("bn-BD")} BDT</p>
                      <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">${displayUsd} USD</p>
                      <div className="mt-1 flex justify-end">
                        {tx.status === "completed" && (
                          <div className="flex flex-col space-y-1 items-end">
                            <button
                              onClick={() => downloadReceiptImage(normalizedTxForReceipt)}
                              className="flex items-center space-x-0.5 text-[9px] font-bold text-[#1D9E75] bg-[#1D9E75]/10 hover:bg-[#1D9E75]/20 px-1.5 py-0.5 rounded-md border border-[#1D9E75]/20 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>✅ সম্পন্ন — রশিদ দেখুন</span>
                            </button>
                            <button
                              onClick={() => onSelectTab("transferStatus", tx.id)}
                              className="flex items-center space-x-1 text-[9px] font-bold text-[#1B4F72] bg-[#1B4F72]/10 hover:bg-[#1B4F72]/20 px-1.5 py-1 rounded-md border border-[#1B4F72]/20 transition-all cursor-pointer"
                            >
                              <span>⭐ রিভিউ ও রেটিং দিন</span>
                            </button>
                          </div>
                        )}
                        {tx.status === "pending" && (
                          <span className="flex items-center space-x-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>⏳ অপেক্ষায়</span>
                          </span>
                        )}
                        {(tx.status === "processing" || tx.status === "sent") && (
                          <span className="flex items-center space-x-0.5 text-[9px] font-bold text-[#1B4F72] bg-[#1B4F72]/10 px-1.5 py-0.5 rounded-md border border-[#1B4F72]/20">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>🔄 প্রক্রিয়াধীন</span>
                          </span>
                        )}
                        {(tx.status === "cancelled" || tx.status === "failed") && (
                          <span className="flex items-center space-x-0.5 text-[9px] font-bold text-[#E74C3C] bg-[#E74C3C]/10 px-1.5 py-0.5 rounded-md border border-[#E74C3C]/20">
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span>❌ ব্যর্থ</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#6B7280', textAlign: 'center', padding: '20px' }}>
              এখনো কোনো লেনদেন নেই
            </div>
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
          onClick={() => setActiveModal("notifications")}
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
          onClick={() => setActiveModal("language")}
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
          onClick={() => setActiveModal("security")}
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
          onClick={() => setActiveModal("helpline")}
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
          onClick={() => setActiveModal("about")}
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
          onClick={() => setActiveModal("premium_guide")}
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
        <p>Probashi Sheba v1.0.0 (Gold Release)</p>
        <p>© 2026 Probashi Sheba • All Rights Reserved</p>
      </div>

      {/* MODAL SYSTEM */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity animate-fade-in">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => { setActiveModal(null); setPwResetMsg(null); }} />

          {/* Modal layout container */}
          <div 
            className="relative bg-white w-full sm:max-w-md rounded-2xl border flex flex-col max-h-[85vh] sm:max-h-[90vh] shadow-xl text-left transition-all animate-scale-up"
            style={{
              borderWidth: '0.5px',
              borderColor: '#E5E7EB',
              borderRadius: '16px'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 select-none" style={{ borderBottomWidth: '0.5px' }}>
              <h3 className="text-sm font-semibold text-[#1A1A2E] font-sans">
                {activeModal === "notifications" && "নোটিফিকেশন সেটিংস্"}
                {activeModal === "language" && "ভাষা পরিবর্তন (Language)"}
                {activeModal === "security" && "নিরাপত্তা ও প্রাইভেসি"}
                {activeModal === "helpline" && "হেল্পলাইন ভলান্টিয়ার সাপোর্ট"}
                {activeModal === "about" && "অ্যাপ সম্পর্কে"}
                {activeModal === "premium_guide" && "প্রিমিয়াম ভিআইপি মেম্বার গাইড"}
              </h3>
              <button 
                onClick={() => { setActiveModal(null); setPwResetMsg(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer outline-none shrink-0"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-5 overflow-y-auto space-y-4 font-sans text-left" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              
              {/* 1. NOTIFICATIONS */}
              {activeModal === "notifications" && (
                <div className="space-y-4 font-sans">
                  {/* Option 1 */}
                  <div className="flex items-center justify-between text-left">
                    <div className="pr-2">
                      <p className="text-xs font-semibold text-[#1A1A2E]">লেনদেন সফল হলে (Transaction alerts)</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">টাকা পাঠানো বা ডিপোজিট সফল হলে তাৎক্ষণিক নোটিফিকেশন পাবেন</p>
                    </div>
                    <button 
                      onClick={toggleTxAlerts}
                      className="w-10 h-6 p-0.5 rounded-full transition-colors relative cursor-pointer outline-none shrink-0"
                      style={{ backgroundColor: txAlerts ? '#1D9E75' : '#D1D5DB' }}
                    >
                      <span 
                        className="block bg-white w-5 h-5 rounded-full shadow transition-transform"
                        style={{ transform: txAlerts ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Option 2 */}
                  <div className="flex items-center justify-between text-left">
                    <div className="pr-2">
                      <p className="text-xs font-semibold text-[#1A1A2E]">নতুন অফার (New offers)</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">নতুন এয়ার টিকিট প্রমোশন বা বিশেষ রেট সংক্রান্ত সতর্কতা</p>
                    </div>
                    <button 
                      onClick={toggleOfferAlerts}
                      className="w-10 h-6 p-0.5 rounded-full transition-colors relative cursor-pointer outline-none shrink-0"
                      style={{ backgroundColor: offerAlerts ? '#1D9E75' : '#D1D5DB' }}
                    >
                      <span 
                        className="block bg-white w-5 h-5 rounded-full shadow transition-transform"
                        style={{ transform: offerAlerts ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Option 3 */}
                  <div className="flex items-center justify-between opacity-85 text-left">
                    <div className="pr-2">
                      <p className="text-xs font-semibold text-[#1A1A2E]">জরুরি বিজ্ঞপ্তি (Emergency alerts)</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">কম্বোডিয়া প্রবাসী ও কনস্যুলার জরুরি নোটিশ (বন্ধ করা যাবে না)</p>
                    </div>
                    <button 
                      disabled
                      className="w-10 h-6 p-0.5 rounded-full transition-colors relative cursor-not-allowed shrink-0 bg-[#1D9E75]/40"
                    >
                      <span 
                        className="block bg-white w-5 h-5 rounded-full shadow transition-transform"
                        style={{ transform: 'translateX(16px)' }}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* 2. LANGUAGE */}
              {activeModal === "language" && (
                <div className="space-y-2.5 font-sans">
                  {[
                    { key: "বাংলা", label: "বাংলা" },
                    { key: "English", label: "English" },
                    { key: "Khmer", label: "ភាសាខ្មែរ (Khmer)" }
                  ].map((item) => {
                    const isSelected = selectedLanguage === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => selectLang(item.key)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 border transition-all cursor-pointer outline-none text-left"
                        style={{
                          borderColor: isSelected ? '#1B4F72' : '#E5E7EB',
                          borderWidth: isSelected ? '1px' : '0.5px',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? '#F4F8FA' : '#FFFFFF'
                        }}
                      >
                        <span className={`text-[13px] ${isSelected ? 'font-medium text-[#1B4F72]' : 'font-normal text-[#1A1A2E]'}`}>
                          {item.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#1B4F72] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. SECURITY */}
              {activeModal === "security" && (
                <div className="space-y-4 font-sans text-left">
                  <div className="bg-[#EBF5FB] p-4 border border-[#D5E6F2] flex items-start space-x-3 text-[#1B4F72]" style={{ borderWidth: '0.5px', borderRadius: '12px' }}>
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-[13px] font-semibold">নিরাপত্তা ও এনক্রিপশন</p>
                      <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">
                        প্রবাসীদের সকল তথ্য এবং অর্থনৈতিক রেকর্ড এনক্রিপ্টেড পদ্ধতিতে আমাদের সম্পূর্ণ নিরাপদ ডাটাবেজে জমা থাকে।
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-left bg-gray-50 p-3 rounded-xl border border-gray-100" style={{ borderWidth: '0.5px' }}>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#1D9E75] text-[12px] font-bold mt-0.5">✓</span>
                      <p className="text-xs text-[#1A1A2E] leading-relaxed">আমাদের সকল তথ্য এনক্রিপ্টেড এবং সুরক্ষিত</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#1D9E75] text-[12px] font-bold mt-0.5">✓</span>
                      <p className="text-xs text-[#1A1A2E] leading-relaxed">আমরা কখনো তৃতীয় পক্ষের সাথে তথ্য শেয়ার করি না</p>
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordReset}
                    disabled={pwResetLoading}
                    className="w-full bg-[#1B4F72] hover:bg-opacity-95 text-white py-3 rounded-xl text-xs font-medium cursor-pointer outline-none select-none transition-all flex items-center justify-center"
                  >
                    {pwResetLoading ? "অনুরোধ পাঠানো হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন (Change Password)"}
                  </button>

                  {pwResetMsg && (
                    <div 
                      className={`p-3 rounded-xl text-[11px] leading-relaxed border ${
                        pwResetMsg.isError ? "bg-red-50 text-[#E74C3C] border-red-100" : "bg-green-50 text-[#1D9E75] border-green-100"
                      }`}
                      style={{ borderWidth: '0.5px' }}
                    >
                      {pwResetMsg.text}
                    </div>
                  )}
                </div>
              )}

              {/* 4. HELPLINE */}
              {activeModal === "helpline" && (
                <div className="space-y-4 font-sans text-left">
                  <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex items-center justify-between" style={{ borderWidth: '0.5px' }}>
                    <div className="text-left">
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-mono">অফিশিয়াল ওয়াটসঅ্যাপ</p>
                      <p className="text-sm font-bold text-[#1B4F72] mt-0.5">+855762012121</p>
                      <p className="text-[11px] text-[#6B7280] mt-1">সকাল 12টা থেকে রাত 9টা (12AM - 09PM)</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#EBF5FB] flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-[#1B4F72]" />
                    </div>
                  </div>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    কম্বোডিয়া প্রবাসী ভাইদের যেকোনো জরুরি সাহায্য, আইনি গাইডেন্স, কিংবা সেবা সংক্রান্ত সাহায্যের জন্য আমাদের অ্যাক্টিভ প্রবাসী ভলান্টিয়ার টিম সদা নিয়োজিত থাকে।
                  </p>

                  <a 
                    href="https://wa.me/855762012121" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-[#1D9E75] hover:bg-opacity-95 text-white py-3 rounded-xl text-xs font-medium block text-center transition-all select-none"
                  >
                    সরাসরি ওয়াটসঅ্যাপ মেসেজ দিন (WhatsApp Support)
                  </a>
                </div>
              )}

              {/* 5. ABOUT */}
              {activeModal === "about" && (
                <div className="space-y-4 font-sans text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#EBF5FB] flex items-center justify-center shrink-0 mx-auto border border-[#D5E6F2]" style={{ borderWidth: '0.5px' }}>
                    <Info className="w-7 h-7 text-[#1B4F72]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#1A1A2E]">প্রবাসী সেবা v1.0</h3>
                    <p className="text-xs text-[#1B4F72] font-medium mt-1">কম্বোডিয়ায় বাংলাদেশিদের বিশ্বস্ত সঙ্গী</p>
                    <p className="text-[11px] text-[#6B7280] mt-2 leading-relaxed">
                      কম্বোডিয়ায় বসবাসরত বাংলাদেশি ভাইদের জীবনযাত্রা ও সরকারি গাইডেন্স আরও সহজীকরণ করার লক্ষ্যে আমাদের এই ক্ষুদ্র প্রবাসবান্ধব উদ্যোগ।
                    </p>
                  </div>

                  <hr className="border-gray-100" />

                  <p className="text-[11px] text-[#6B7280] font-mono leading-none">
                    © 2026 Probashi Sheba. All rights reserved.
                  </p>
                </div>
              )}

              {/* 6. PREMIUM MEMBER GUIDE */}
              {activeModal === "premium_guide" && (
                <div className="space-y-4 font-sans text-left">
                  <div className="bg-[#E8F8F1] border border-[#D1F2E1] p-4 flex items-start space-x-3 text-[#1D9E75]" style={{ borderWidth: '0.5px', borderRadius: '12px' }}>
                    <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-semibold">প্রিমিয়াম ভিআইপি সুবিধা</p>
                      <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">
                        প্রবাসের মাটিতে আমাদের বিশেষ সাহায্য গাইডলাইনের মেম্বার হতে নিচের সুবিধাদি উপভোগ করুন:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-2 text-left">
                      <span className="text-[#1D9E75] font-bold text-[13px] shrink-0 mt-0.5">✓</span>
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A2E]">অগ্রাধিকার সেবা (Priority service)</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">যেকোনো ডিপোজিট বা টাকা পাঠানোর ফাইল দ্রুততম সময়ে সম্পন্ন করার সুবিধা।</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 text-left">
                      <span className="text-[#1D9E75] font-bold text-[13px] shrink-0 mt-0.5">✓</span>
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A2E]">বিশেষ এক্সচেঞ্জ রেট (Special exchange rate)</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">লেনদেন করার সময় সেরা বিনিময় হার উপভোগ করার সুবর্ণ সুযোগ ভাই!</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 text-left">
                      <span className="text-[#1D9E75] font-bold text-[13px] shrink-0 mt-0.5">✓</span>
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A2E]">২৪/৭ সাপোর্ট (24/7 support)</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">মেম্বারদের যেকোনো জরুরি প্রয়োজনে ২৪ ঘণ্টা মেসেজিং এবং ভলান্টিয়ার অ্যাসিস্ট্যান্স।</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="bg-gray-50 p-3 rounded-xl text-xs text-center font-semibold text-[#1B4F72] border border-gray-100" style={{ borderWidth: '0.5px' }}>
                    যোগাযোগ: +855762012121
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
