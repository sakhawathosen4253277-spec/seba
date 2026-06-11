import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, setDoc, doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Loader2 } from "lucide-react";

interface SendMoneyPageProps {
  onBack: () => void;
  userEmail: string;
  walletBalance: number;
}

export default function SendMoneyPage({ onBack, userEmail, walletBalance }: SendMoneyPageProps) {
  const [exchangeRate, setExchangeRate] = useState<number>(110.8);
  const [loadingRate, setLoadingRate] = useState<boolean>(true);
  
  // Form fields
  const [amountUsd, setAmountUsd] = useState<string>("");
  const [recipientMethod, setRecipientMethod] = useState<string>("bKash (পার্সোনাল)");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Load exchange rate from DB
  useEffect(() => {
    async function loadRate() {
      try {
        const rateSnap = await getDoc(doc(db, "exchangeRates", "current"));
        if (rateSnap.exists()) {
          const rateData = rateSnap.data();
          if (rateData.usdRate) {
            setExchangeRate(Number(rateData.usdRate));
          } else if (rateData.rate) {
            setExchangeRate(Number(rateData.rate));
          }
        }
      } catch (err) {
        console.error("Error loading exchange rate inside SendMoneyPage:", err);
      } finally {
        setLoadingRate(false);
      }
    }
    loadRate();
  }, []);

  const numAmount = Number(amountUsd) || 0;
  
  // Calculate service charge: 1 - 19.99 USD has NO service charge. Otherwise 2%
  const serviceChargePercent = (numAmount > 0 && numAmount < 20) ? 0 : 2;
  const serviceChargeUsd = Number(((numAmount * serviceChargePercent) / 100).toFixed(2));
  
  // Calculate total deductible standard and amount recipient will get
  // For simplicity, is service charge added or subtracted?
  // Let's standardly show recipient BDT based on amountUsd (minus service charge, or is service charge subtracted from balance?
  // Let's deduce service charge from the amount sent, i.e. recipient receives (amountUsd - serviceChargeUsd) * exchangeRate.
  // Or is service charge extra? Usually, "আপনি পাঠাচ্ছেন $50, আপনার ওয়ালেট থেকে কাটবে $51, প্রাপক পাবে $50 value". Yes! That is perfect for wallets.
  // Let's check max allowance: amountUsd + serviceChargeUsd must be <= walletBalance.
  const totalNeededUsd = numAmount + serviceChargeUsd;
  const bdtRecipientGets = Number((numAmount * exchangeRate).toFixed(1));

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numAmount <= 0) {
      alert("সঠিক ডলারের পরিমাণ লিখুন ভাই!");
      return;
    }
    if (totalNeededUsd > walletBalance) {
      alert(`দুঃখিত ভাই! আপনার মেম্বার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। প্রয়োজনীয় মোট: $${totalNeededUsd} USD আপনার ওয়ালেটে আছে: $${walletBalance.toFixed(2)} USD। অনুগ্রহ করে প্রথমে ডলারে ডিপোজিট করুন।`);
      return;
    }
    if (!recipientName.trim()) {
      alert("প্রাপকের নাম লিখুন ভাই!");
      return;
    }

    const isBank = recipientMethod.includes("ব্যাংক");
    if (isBank) {
      if (!bankName.trim() || !bankAccount.trim()) {
        alert("ব্যাংকের নাম এবং অ্যাকাউন্ট নম্বর সম্পূর্ণ লিখুন!");
        return;
      }
    } else {
      if (!recipientPhone.trim()) {
        alert("প্রাপকের মোবাইল ফিন্যান্স সার্ভিস নম্বর দিন!");
        return;
      }
    }

    setSubmitLoading(true);
    const transferId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Fetch latest wallet balance from Firestore for precision
      const userRef = doc(db, "users", userEmail || "guest@probashi.com");
      const userSnap = await getDoc(userRef);
      let currentBal = walletBalance;
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (uData.balance !== undefined) {
          currentBal = Number(uData.balance);
        }
      }

      if (totalNeededUsd > currentBal) {
        alert(`দুঃখিত ভাই! আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। প্রয়োজনীয় মোট: $${totalNeededUsd} USD আপনার ওয়ালেটে আছে: $${currentBal.toFixed(2)} USD। প্রথমে ডিপোজিট করুন ভাই।`);
        setSubmitLoading(false);
        return;
      }

      // Deduct balance from Firestore
      const newBal = currentBal - totalNeededUsd;
      await setDoc(userRef, { balance: newBal }, { merge: true });

      // Create transfer request
      await setDoc(doc(db, "transferRequests", transferId), {
        id: transferId,
        userId: userEmail || "guest@probashi.com",
        senderName: "ওয়ালেট ইউজার",
        senderPhone: "",
        amount: numAmount,
        serviceCharge: serviceChargeUsd,
        totalDeducted: totalNeededUsd,
        calculatedBdt: bdtRecipientGets,
        recipientName: recipientName.trim(),
        recipientPhone: isBank ? bankAccount.trim() : recipientPhone.trim(),
        recipientMethod: recipientMethod,
        recipientBankName: isBank ? bankName.trim() : "",
        recipientBankAccount: isBank ? bankAccount.trim() : "",
        recipientMethodName: recipientMethod,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
    } catch (err) {
      console.error("Error creating transfer request:", err);
      alert("অনুরোধ পাঠানো সম্ভব হয়নি ভাই। পুনরায় চেষ্টা করুন!");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 max-w-sm w-full flex flex-col items-center space-y-4">
          <span className="text-[48px] leading-none text-[#1D9E75]">✅</span>
          <h2 className="text-base font-semibold text-[#0F6E56]">অনুরোধ পাওয়া গেছে!</h2>
          <p className="text-[13px] leading-relaxed text-[#6B7280]">
            আমরা ৫ মিনিট থেকে ২ ঘণ্টার মধ্যে পাঠিয়ে দেব ইনশাআল্লাহ 🤲
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              onBack();
            }}
            className="w-full mt-4 py-3 bg-[#1B4F72] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            হোমে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  const isBank = recipientMethod.includes("ব্যাংক");

  return (
    <div className="flex flex-col space-y-4 px-4 pb-24 bg-[#F7F8FA] min-h-screen font-sans text-[#1A1A2E]">
      
      {/* PAGE HEADER */}
      <div className="flex items-center space-x-3 pt-4">
        <button 
          onClick={onBack}
          className="p-1.5 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-100 transition-all text-[#1B4F72] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs">ফিরুন</span>
        </button>
        <div className="text-left">
          <h2 className="text-lg font-medium text-[#1A1A2E]">বাংলাদেশে পাঠান 🇧🇩</h2>
          <p className="text-xs text-[#6B7280]">আপনার ব্যালেন্স থেকে পাঠান</p>
        </div>
      </div>

      {/* WALLET BALANCE CARD */}
      <div className="bg-[#1B4F72] rounded-xl p-4 text-center text-white">
        <p className="text-[11px] text-[#7FB3D3]">আপনার ব্যালেন্স (Available Balance)</p>
        <h3 className="text-2xl font-semibold mt-1">${walletBalance.toFixed(2)} USD</h3>
      </div>

      {/* SEND FORM */}
      <div 
        className="bg-white rounded-2xl p-5 border text-left"
        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
      >
        <form onSubmit={handleSendSubmit} className="space-y-4 text-xs">
          
          {/* Amount USD Input */}
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] text-[#6B7280] font-medium">কত পাঠাবেন ($):</label>
              <button 
                type="button" 
                onClick={() => setAmountUsd(Math.floor(walletBalance).toString())}
                className="text-[10px] text-[#1B4F72] font-semibold hover:underline"
              >
                Max Balance
              </button>
            </div>
            
            <div className="relative flex items-center">
              <input
                type="number"
                required
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                placeholder="যেমন: 50"
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72] font-mono"
                min="1"
                step="any"
              />
              <span className="absolute right-3 font-bold text-gray-400 text-[10.5px]">USD</span>
            </div>

            {/* Live rates and charges breakdown */}
            {numAmount > 0 && (
              <div className="bg-[#F7F8FA] rounded-xl p-3 space-y-1.5 font-sans border border-gray-100 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">আপনি পাঠাচ্ছেন:</span>
                  <span className="text-[#1A1A2E] font-medium">${numAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">প্রাপক পাবেন:</span>
                  <span className="text-[#0F6E56] font-semibold">{bdtRecipientGets.toFixed(1)} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">লাইভ রেট:</span>
                  <span className="text-[#1A1A2E] font-mono">1 USD = {exchangeRate.toFixed(2)} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">সার্ভিস চার্জ ({serviceChargePercent}%):</span>
                  <span className={serviceChargeUsd > 0 ? "text-[#E74C3C]" : "text-[#1D9E75]"}>
                    {serviceChargeUsd > 0 ? `$${serviceChargeUsd} USD` : "ফ্রি (no charge)"}
                  </span>
                </div>
                <div className="pt-1 border-t border-dashed border-gray-200 flex justify-between font-bold text-xs text-[#1B4F72]">
                  <span>মোট ব্যালেন্স কাটবে:</span>
                  <span>${totalNeededUsd.toFixed(2)} USD</span>
                </div>
              </div>
            )}
            
            {/* Disclaimer for service charge waiver under 20 USD */}
            <p className="text-[10px] text-[#1D9E75] font-semibold">
              💡 ১.০০$ থেকে ১৯.৯৯$ পর্যন্ত পাঠালে সম্পূর্ণ চার্জ ফ্রি!
            </p>
          </div>

          {/* Recipient Method Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">পাঠানোর মাধ্যম:</label>
            <select
              required
              value={recipientMethod}
              onChange={(e) => setRecipientMethod(e.target.value)}
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72]"
            >
              <option value="bKash (পার্সোনাল)">bKash (পার্সোনাল)</option>
              <option value="bKash (এজেন্ট)">bKash (এজেন্ট)</option>
              <option value="Nagad (পার্সোনাল)">Nagad (পার্সোনাল)</option>
              <option value="Nagad (এজেন্ট)">Nagad (এজেন্ট)</option>
              <option value="Rocket">Rocket</option>
              <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার</option>
            </select>
          </div>

          {/* Recipient Name Input */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] text-[#6B7280] font-medium">প্রাপকের নাম:</label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
              }}
              placeholder="মোবাইল বা ব্যাংক অ্যাকাউন্টের সম্পূর্ণ নাম"
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72]"
            />
          </div>

          {/* Conditional Input based on Bank Selection */}
          {isBank ? (
            <div className="space-y-3.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-gray-500 font-semibold">ব্যাংকের নাম:</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="যেমন: ডাচ-বাংলা ব্যাংক পিএলসি"
                  className="bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-gray-500 font-semibold">ব্যাংক অ্যাকাউন্ট নম্বর:</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="যেমন: ১২৩.৪৫৬.৭৮৯"
                  className="bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs outline-none font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] text-[#6B7280] font-medium">প্রাপকের নম্বর:</label>
              <input
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="যেমন: ০১৭XXXXXXXX"
                className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72] font-mono"
              />
            </div>
          )}

          {/* Submit transfer request */}
          <button
            type="submit"
            disabled={submitLoading || loadingRate}
            className="w-full py-3.5 bg-[#1B4F72] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {submitLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>অনুরোধ পাঠানো হচ্ছে...</span>
              </>
            ) : (
              <span>পাঠানোর অনুরোধ করুন</span>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
