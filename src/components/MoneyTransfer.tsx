import React, { useState, useEffect } from "react";
import { DollarSign, ArrowDown, HelpCircle, CheckCircle2, Clock, XCircle, ArrowUpRight, Download } from "lucide-react";
import { Transaction } from "../types";
import { downloadReceiptImage } from "../lib/receipt";

export const BANGLADESHI_BANKS = [
  { id: "islami", name: "ইসলামী ব্যাংক বাংলাদেশ পিএলসি (Islami Bank BD)" },
  { id: "dutch_bangla", name: "ডাচ-বাংলা ব্যাংক পিএলসি (Dutch-Bangla Bank)" },
  { id: "brac", name: "ব্র্যাক ব্যাংক পিএলসি (BRAC Bank)" },
  { id: "sonali", name: "সোনালী ব্যাংক পিএলসি (Sonali Bank)" },
  { id: "city", name: "সিটি ব্যাংক পিএলসি (City Bank)" },
  { id: "eastern", name: "ইস্টার্ন ব্যাংক পিএলসি (Eastern Bank)" },
  { id: "janata", name: "জনতা ব্যাংক পিএলসি (Janata Bank)" },
  { id: "agrani", name: "অগ্রণী ব্যাংক পিএলসি (Agrani Bank)" },
  { id: "prime", name: "প্রাইম ব্যাংক পিএলসি (Prime Bank)" },
  { id: "mutual_trust", name: "মিউচুয়াল ট্রাস্ট ব্যাংক পিএলসি (MTB)" },
  { id: "united_commercial", name: "ইউনাইটেড কমার্শিয়াল ব্যাংক পিএলসি (UCB)" },
  { id: "southeast", name: "সাউথইস্ট ব্যাংক পিএলসি (Southeast Bank)" },
  { id: "rupali", name: "রূপালী ব্যাংক পিএলসি (Rupali Bank)" },
  { id: "bank_asia", name: "ব্যাংক এশিয়া পিএলসি (Bank Asia)" },
  { id: "pubali", name: "পূবালী ব্যাংক পিএলসি (Pubali Bank)" },
  { id: "standard", name: "স্ট্যান্ডার্ড ব্যাংক পিএলসি (Standard Bank)" },
  { id: "trust", name: "ট্রাস্ট ব্যাংক লিমিটেড (Trust Bank)" },
  { id: "dhaka", name: "ঢাকা ব্যাংক পিএলসি (Dhaka Bank)" },
  { id: "mercantile", name: "মার্কেন্টাইল ব্যাংক পিএলসি (Mercantile Bank)" },
  { id: "jamuna", name: "যমুনা ব্যাংক পিএলসি (Jamuna Bank)" },
  { id: "ab", name: "এবি ব্যাংক পিএলসি (AB Bank)" },
  { id: "exim", name: "এক্সিম ব্যাংক পিএলসি (EXIM Bank)" },
  { id: "nbl", name: "ন্যাশনাল ব্যাংক লিমিটেড (National Bank)" },
  { id: "one", name: "ওয়ান ব্যাংক পিএলসি (One Bank)" },
  { id: "uttara", name: "উত্তরা ব্যাংক পিএলসি (Uttara Bank)" }
];

interface MoneyTransferProps {
  walletBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  exchangeRate?: number;
  exchangeRateUnderTen?: number;
  exchangeRateLimit?: number;
}

export default function MoneyTransfer({
  walletBalance,
  onUpdateBalance,
  transactions,
  onAddTransaction,
  exchangeRate,
  exchangeRateUnderTen,
  exchangeRateLimit = 10.00
}: MoneyTransferProps) {
  const [usdAmount, setUsdAmount] = useState<string>("");
  const [recipientMethod, setRecipientMethod] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
  const [recipientNumber, setRecipientNumber] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("ইসলামী ব্যাংক বাংলাদেশ পিএলসি (Islami Bank BD)");
  const [recipientName, setRecipientName] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [localRate, setLocalRate] = useState<number>(110.80);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  // Rate ticker animation fluctuation
  useEffect(() => {
    if (exchangeRate !== undefined) return;
    const t = setInterval(() => {
      setLocalRate(parseFloat((110.60 + Math.random() * 0.4).toFixed(2)));
    }, 5000);
    return () => clearInterval(t);
  }, [exchangeRate]);

  const numericUsd = parseFloat(usdAmount) || 0;
  const isPromoUnderTen = numericUsd >= 1 && numericUsd < exchangeRateLimit;
  const rateUnderTenValue = exchangeRateUnderTen !== undefined ? exchangeRateUnderTen : 120.00;
  const rate = isPromoUnderTen ? rateUnderTenValue : (exchangeRate !== undefined ? exchangeRate : localRate);

  const feeRate = 0.01; // 1% transfer charge
  const calculatedFee = numericUsd * feeRate;
  const recipientGets = numericUsd * rate;
  const totalUsdNeeded = numericUsd + calculatedFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!usdAmount || numericUsd <= 0) {
      newErrors.usdAmount = "টাকার পরিমাণ সঠিকভাবে লিখুন ভাই।";
    } else if (totalUsdNeeded > walletBalance) {
      newErrors.usdAmount = `আপনার ওয়ালেট ব্যালেন্স যথেষ্ট নয়! খরচসহ মোট লাগবে: $${totalUsdNeeded.toFixed(2)}`;
      alert(`দুঃখিত ভাই! আপনার মেম্বার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। প্রয়োজনীয় মোট: $${totalUsdNeeded.toFixed(2)} USD আপনার ওয়ালেটে আছে: $${walletBalance.toFixed(2)} USD। অনুগ্রহ করে প্রথমে ডলারে ডিপোজিট করুন।`);
    }

    if (!recipientNumber) {
      newErrors.recipientNumber = "মোবাইল নম্বর বা ব্যাংক অ্যাকাউন্ট নম্বর লিখুন ভাই।";
    }

    if (!recipientName) {
      newErrors.recipientName = "টাকা গ্রহণকারীর নাম বাংলায় লিখুন ভাই।";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Deduct wallet
    const newBalance = walletBalance - totalUsdNeeded;
    onUpdateBalance(newBalance);

    const newTx: Transaction = {
      id: "TX-" + Math.floor(100000 + Math.random() * 900000),
      senderName: "আপনি",
      recipientName,
      recipientMethod,
      recipientNumber: recipientMethod === "Bank" ? `${selectedBank} - A/C: ${recipientNumber}` : recipientNumber,
      amountUsd: numericUsd,
      amountBdt: Math.round(recipientGets),
      feeUsd: parseFloat(calculatedFee.toFixed(2)),
      date: "আজ, " + new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
      status: "pending"
    };

    onAddTransaction(newTx);
    setSuccessMsg("আপনার টাকা পাঠানোর অনুরোধ সফলভাবে জমা নেওয়া হয়েছে ভাই! আমাদের এজেন্ট ট্রানজেকশনটি যাচাই করে ৫ থেকে ১৫ মিনিটের মধ্যে সম্পন্ন করবেন।");
    
    // Clear inputs
    setUsdAmount("");
    setRecipientNumber("");
    setRecipientName("");
    setPromoCode("");

    // Clear alert after some time
    setTimeout(() => {
      setSuccessMsg("");
    }, 10000);
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-1">
          <span>টাকা পাঠান</span>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Cambodia to BD
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">সবচেয়ে বিশ্বস্ত উপায়ে নিরাপদে আপনার স্বদেশে টাকা পাঠান</p>
      </div>

      {/* 1 Dollar Highlight Scrolling Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl py-2 px-3 overflow-hidden flex items-center space-x-2">
        <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded shrink-0 animate-pulse font-sans">
          অফার
        </span>
        <div className="relative flex-grow overflow-hidden select-none">
          <div className="flex whitespace-nowrap text-xs font-bold text-amber-300 font-sans animate-marquee gap-8">
            <span>আপনার কষ্টের টাকার শতভাগ নিরাপত্তা ও গভীর বিশ্বাসই আমাদের প্রধান অঙ্গীকার! কোনো দ্বিধা ছাড়াই আমাদের সততা ও দ্রুত সেবা যাচাই করতে মাত্র ১ ডলার পাঠিয়ে আজই চেক করে দেখুন</span>
            <span>আপনার কষ্টের টাকার শতভাগ নিরাপত্তা ও গভীর বিশ্বাসই আমাদের প্রধান অঙ্গীকার! কোনো দ্বিধা ছাড়াই আমাদের সততা ও দ্রুত সেবা যাচাই করতে মাত্র ১ ডলার পাঠিয়ে আজই চেক করে দেখুন</span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Info card & Rate Alert */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold">ওয়ালেট ব্যালেন্স:</span>
          <h4 className="text-lg font-bold text-emerald-400 mt-1">${walletBalance.toFixed(2)} USD</h4>
        </div>
        
        <div className="bg-slate-950 p-4.5 rounded-xl border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold">আজকের সেরা রেট:</span>
          <h4 className="text-lg font-extrabold text-emerald-300 mt-1 animate-pulse">
            1 USD = {rate.toFixed(2)} BDT
          </h4>
        </div>
      </div>

      {/* Special rate promo banner for < exchangeRateLimit USD on mobile banking */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-xs flex items-center justify-between text-left">
        <div>
          <span className="font-semibold text-indigo-300">মোবাইল ব্যাংকিং অফার (১ - {(exchangeRateLimit - 0.01).toFixed(2)}$):</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{exchangeRateLimit.toFixed(2)} ডলারের চেয়ে কম পাঠালে পাবেন স্পেশাল ও চমৎকার এক্সপ্রেস রেট!</p>
        </div>
        <span className="bg-indigo-500/20 border border-indigo-500 text-indigo-300 font-extrabold px-2 py-0.5 rounded text-[11px] font-mono animate-bounce shrink-0 ml-2">
          ১ USD = {rateUnderTenValue.toFixed(2)} BDT
        </span>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500 text-xs text-emerald-300 leading-relaxed animate-bounce">
          <h4 className="font-extrabold text-sm mb-1 text-white flex items-center space-x-1">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <span>সফল ট্রানজেকশন!</span>
          </h4>
          <p>{successMsg}</p>
        </div>
      )}

      {/* Main Transfer Form */}
      <form onSubmit={handleSubmit} className="glass-glow-card p-5 rounded-2xl space-y-4">
        {/* Method selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-2">প্রাপক মাধ্যম নির্বাচন করুন (Payment Option):</label>
          <div className="grid grid-cols-3 gap-2">
            {(["bKash", "Nagad", "Rocket"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setRecipientMethod(method)}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all outline-none border ${
                  recipientMethod === method
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                    : "bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800"
                }`}
              >
                {method === "bKash" && "বিকাশ"}
                {method === "Nagad" && "নগদ"}
                {method === "Rocket" && "রকেট"}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1.5">পাঠাতে চান (USD Amount):</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 font-medium">$</span>
            <input
              type="number"
              value={usdAmount}
              onChange={(e) => {
                setUsdAmount(e.target.value);
                if (errors.usdAmount) setErrors(prev => ({ ...prev, usdAmount: "" }));
              }}
              placeholder="0.00"
              className="w-full bg-slate-950 rounded-xl py-3 pl-8 pr-12 text-sm text-white font-mono border border-slate-900 focus:border-emerald-500/50 focus:outline-none"
            />
            <span className="absolute right-3.5 text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-bold">USD</span>
          </div>
          {errors.usdAmount && <p className="text-[10px] text-red-400 mt-1 font-medium">{errors.usdAmount}</p>}
        </div>

        {/* BDT Live Equivalent Preview */}
        {numericUsd > 0 && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-xl flex justify-between items-center text-xs animate-slide-up">
            <span className="text-slate-400">প্রাপক বাংলাদেশে পাবেন:</span>
            <span className="font-extrabold text-emerald-400 text-sm">
              ৳ {Math.round(recipientGets).toLocaleString("bn-BD")} BDT
            </span>
          </div>
        )}

        {/* Recipient Details */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
              মোবাইল ওয়ালেট নম্বর (Number):
            </label>
            <input
              type="text"
              value={recipientNumber}
              onChange={(e) => {
                setRecipientNumber(e.target.value);
                if (errors.recipientNumber) setErrors(prev => ({ ...prev, recipientNumber: "" }));
              }}
              placeholder="যেমন: 01712xxxxxx"
              className="w-full bg-slate-950 rounded-xl py-3 px-4 text-sm text-white border border-slate-900 focus:border-emerald-500/50 focus:outline-none font-sans"
            />
            {errors.recipientNumber && <p className="text-[10px] text-red-400 mt-1 font-medium">{errors.recipientNumber}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">প্রাপকের পূর্ণ নাম (Recipient Name):</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                if (errors.recipientName) setErrors(prev => ({ ...prev, recipientName: "" }));
              }}
              placeholder="যেমন: মোঃ রহিম মিয়া"
              className="w-full bg-slate-950 rounded-xl py-3 px-4 text-sm text-white border border-slate-900 focus:border-emerald-500/50 focus:outline-none font-sans"
            />
            {errors.recipientName && <p className="text-[10px] text-red-400 mt-1 font-medium">{errors.recipientName}</p>}
          </div>
        </div>

        {/* Promo code */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">প্রোমো কোড (Promo Code - ঐচ্ছিক):</label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="PROBASHI50"
            className="w-full bg-slate-950 rounded-xl py-2.5 px-4 text-xs text-white border border-slate-900 focus:border-emerald-500/50 focus:outline-none uppercase font-mono"
          />
        </div>

        {/* Live Fee Breakdown Table */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 space-y-1.5 text-[11px] font-sans">
          <div className="flex justify-between text-slate-400">
            <span>প্রেরিত ডলার:</span>
            <span className="font-mono text-white">${numericUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>সার্ভিস ফি (1%):</span>
            <span className="font-mono text-white">${calculatedFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400 border-t border-slate-900 pt-1.5 font-bold">
            <span className="text-emerald-400">সর্বমোট অ্যাকাউন্ট ড্রাফট (Total Needs):</span>
            <span className="font-mono text-emerald-400">${totalUsdNeeded.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 glow-green-btn rounded-xl text-center text-slate-950 font-extrabold text-sm border-0 focus:outline-none tracking-wide select-none cursor-pointer"
          id="btn-confirm-money-send"
        >
          এখনই পাঠান (Confirm Send)
        </button>
      </form>

      {/* Recent Activity List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 font-sans">
          সাম্প্রতিক সফল লেনদেন (Recent Transactions)
        </h4>

        <div className="space-y-2.5">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">{tx.recipientName}</span>
                  <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                    {tx.recipientMethod === "bKash" && "বিকাশ"}
                    {tx.recipientMethod === "Nagad" && "নগদ"}
                    {tx.recipientMethod === "Rocket" && "রকেট"}
                    {tx.recipientMethod === "Bank" && "ব্যাংক"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{tx.date} • {tx.recipientNumber}</p>
                <button
                  type="button"
                  onClick={() => downloadReceiptImage(tx)}
                  className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center space-x-1 hover:bg-emerald-500/10 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1.5 rounded transition-colors cursor-pointer select-none inline-flex"
                  style={{ borderRadius: '6px', borderWidth: '0.5px' }}
                >
                  <Download className="w-3 h-3 text-emerald-400 shrink-0 mr-1" />
                  <span>রশিদ ডাউনলোড করুন</span>
                </button>
              </div>

              <div className="text-right">
                <h5 className="text-xs font-bold text-emerald-400">৳ {tx.amountBdt.toLocaleString("bn-BD")} BDT</h5>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">${tx.amountUsd} USD</p>
                <div className="mt-1 flex justify-end">
                  {tx.status === "completed" && (
                    <span className="flex items-center space-x-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.25 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>সম্পন্ন</span>
                    </span>
                  )}
                  {tx.status === "pending" && (
                    <span className="flex items-center space-x-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.25 rounded-md border border-amber-500/20 animate-pulse">
                      <Clock className="w-3 h-3" />
                      <span>অপেক্ষারত</span>
                    </span>
                  )}
                  {tx.status === "cancelled" && (
                    <span className="flex items-center space-x-0.5 text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.25 rounded-md border border-red-500/20">
                      <XCircle className="w-3 h-3" />
                      <span>বাতিল</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
