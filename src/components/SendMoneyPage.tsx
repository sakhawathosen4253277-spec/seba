import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, setDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

interface SendMoneyPageProps {
  onBack: () => void;
  userEmail: string;
  walletBalance: number;
}

export default function SendMoneyPage({ onBack, userEmail, walletBalance }: SendMoneyPageProps) {
  const { userDoc, currentUser } = useAuth();
  const balance = userDoc?.balance || 0;

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

  const [feeSettings, setFeeSettings] = useState<any>({
    transferFeePercent: 2,
    transferFeeFixed: 0,
    minimumTransfer: 1,
    maximumTransfer: 1000,
    firstTransferFree: true
  });
  const [loadingFees, setLoadingFees] = useState<boolean>(true);
  const [isFirstTransfer, setIsFirstTransfer] = useState<boolean>(false);
  const [timeDisplay, setTimeDisplay] = useState<string>("৫ মিনিট থেকে ২ ঘণ্টার মধ্যে");

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'transfer'));
        if (snap.exists()) {
          setTimeDisplay(snap.data().timeDisplay || "৫ মিনিট থেকে ২ ঘণ্টার মধ্যে");
        }
      } catch (err) {
        console.error("Error fetching transfer time:", err);
      }
    };
    fetchTime();
  }, []);

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
        const errMessage = err instanceof Error ? err.message : String(err);
        const isOffline = errMessage.toLowerCase().includes("offline") || 
                          errMessage.toLowerCase().includes("failed to get document") ||
                          errMessage.toLowerCase().includes("network");
        if (isOffline) {
          console.warn("SendMoneyPage rate load skipped (offline):", errMessage);
        } else {
          console.error("Error loading exchange rate inside SendMoneyPage:", err);
        }
      } finally {
        setLoadingRate(false);
      }
    }
    loadRate();
  }, []);

  // Load fee settings and transfer history check
  useEffect(() => {
    async function loadFeesAndHistory() {
      const uid = currentUser?.uid || "guest_user";
      try {
        // 1. Fetch fees document
        const feeSnap = await getDoc(doc(db, "settings", "fees"));
        if (feeSnap.exists()) {
          const fData = feeSnap.data();
          setFeeSettings({
            transferFeePercent: fData.transferFeePercent !== undefined ? Number(fData.transferFeePercent) : 2,
            transferFeeFixed: fData.transferFeeFixed !== undefined ? Number(fData.transferFeeFixed) : 0,
            minimumTransfer: fData.minimumTransfer !== undefined ? Number(fData.minimumTransfer) : 1,
            maximumTransfer: fData.maximumTransfer !== undefined ? Number(fData.maximumTransfer) : 1000,
            firstTransferFree: fData.firstTransferFree !== undefined ? Boolean(fData.firstTransferFree) : true
          });
        }

        // 2. Fetch past transaction history size
        const q = query(
          collection(db, "transferRequests"),
          where("userId", "==", uid)
        );
        const transSnap = await getDocs(q);
        setIsFirstTransfer(transSnap.size === 0);
      } catch (err) {
        console.error("Error loading fees settings/history:", err);
      } finally {
        setLoadingFees(false);
      }
    }
    loadFeesAndHistory();
  }, [currentUser]);

  const feePercent = (feeSettings.firstTransferFree && isFirstTransfer) ? 0 : feeSettings.transferFeePercent;
  const feeFixed = (feeSettings.firstTransferFree && isFirstTransfer) ? 0 : feeSettings.transferFeeFixed;

  const totalAmount = parseFloat(amountUsd) || 0;
  const serviceCharge = (totalAmount * feePercent / 100) + feeFixed;
  const recipientGets = Math.max(0, totalAmount - serviceCharge);
  const bdtAmount = recipientGets * exchangeRate;

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalAmount <= 0) {
      alert("সঠিক ডলারের পরিমাণ লিখুন ভাই!");
      return;
    }
    if (totalAmount < feeSettings.minimumTransfer) {
      alert(`সর্বনিম্ন ট্রান্সফার $${feeSettings.minimumTransfer} USD ভাই!`);
      return;
    }
    if (totalAmount > feeSettings.maximumTransfer) {
      alert(`সর্বোচ্চ ট্রান্সফার $${feeSettings.maximumTransfer} USD ভাই!`);
      return;
    }
    if (totalAmount > balance) {
      alert("দুঃখিত ভাই, আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!");
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
      const userRef = doc(db, "users", currentUser?.uid || userEmail || "guest@probashi.com");
      const userSnap = await getDoc(userRef);
      let currentBal = balance;
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (uData.balance !== undefined) {
          currentBal = Number(uData.balance);
        }
      }

      // Deduct balance from Firestore
      const newBal = currentBal - totalAmount;
      await setDoc(userRef, { balance: newBal }, { merge: true });

      // Create transfer request directly in Firestore first (perfect for client-only/Vercel support)
      await setDoc(doc(db, "transferRequests", transferId), {
        id: transferId,
        userId: currentUser?.uid || userEmail || "guest_user",
        totalDeducted: totalAmount,
        serviceCharge: serviceCharge,
        recipientAmount: recipientGets,
        bdtAmount: bdtAmount,
        recipientName: recipientName.trim(),
        recipientPhone: isBank ? bankAccount.trim() : recipientPhone.trim(),
        recipientMethod: recipientMethod,
        recipientBankName: isBank ? bankName.trim() : "",
        recipientBankAccount: isBank ? bankAccount.trim() : "",
        recipientMethodName: recipientMethod,
        status: "pending",
        createdAt: new Date().toISOString(),
        // backward compatibility with server.ts and AdminPanel
        amount: recipientGets,
        calculatedBdt: bdtAmount,
        senderName: "ওয়ালেট ইউজার",
        senderPhone: ""
      });

      // Send Telegram notification directly from frontend
      try {
        const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
        const CHAT_ID = "8885859813";
        const userName = userDoc?.name || "ওয়ালেট ইউজার";
        const method = recipientMethod || "";
        const rPhone = isBank ? bankAccount.trim() : recipientPhone.trim();
        const message = `💸 <b>নতুন ট্রান্সফার অনুরোধ</b>

👤 ইউজার: ${userName}
💵 পরিমাণ: $${totalAmount} USD
📊 প্রাপক পাবেন: ${bdtAmount} BDT
📱 মাধ্যম: ${method}
👨 প্রাপক: ${recipientName.trim()}
📞 নম্বর: ${rPhone}
⏰ সময়: ${new Date().toLocaleString('bn-BD')}

👉 Admin Panel এ process করুন`;

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
          <p className="text-[14px] font-medium text-[#1A1A2E] leading-relaxed">
            আমরা যাচাই করে {timeDisplay} পাঠিয়ে দেব ইনশাআল্লাহ 🤲
          </p>
          <div className="bg-[#F7F8FA] px-4 py-1.5 rounded-full border border-[#E5E7EB]">
            <span className="text-xs font-medium text-[#1B4F72]">Status: অপেক্ষায়...</span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            পাঠানো নিশ্চিত হলে আপনাকে জানানো হবে
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
    <div className="flex flex-col space-y-4 px-4 bg-[#F7F8FA] min-h-screen font-sans text-[#1A1A2E]" style={{ paddingBottom: "80px" }}>
      
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

      <div className="text-left">
        <h2 className="text-lg font-medium text-[#1A1A2E]">বাংলাদেশে পাঠান 🇧🇩</h2>
        <p className="text-xs text-[#6B7280]">আপনার ব্যালেন্স থেকে পাঠান</p>
      </div>

      {/* WALLET BALANCE CARD */}
      <div className="bg-[#1B4F72] rounded-xl p-4 text-center text-white">
        <p className="text-[11px] text-[#7FB3D3]">আপনার ব্যালেন্স (Available Balance)</p>
        <h3 className="text-2xl font-semibold mt-1">আপনার বর্তমান ব্যালেন্স: ${balance.toFixed(2)} USD</h3>
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
                onClick={() => setAmountUsd(Math.floor(balance).toString())}
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

            {/* Limit and fee rules info banner */}
            <div className="flex flex-col space-y-0.5 pt-1 text-[10px] text-[#6B7280] font-sans">
              <div className="flex justify-between">
                <span>সীমা: ${feeSettings.minimumTransfer} - ${feeSettings.maximumTransfer} USD</span>
                <span>ফি: {feeSettings.transferFeePercent}% + ${feeSettings.transferFeeFixed}</span>
              </div>
              {feeSettings.firstTransferFree && isFirstTransfer && (
                <div className="text-[#1D9E75] font-semibold mt-0.5">🎉 অভিনন্দন! প্রথম ট্রান্সফার সম্পূর্ণ ফ্রি।</div>
              )}
            </div>

            {/* Live rates and charges breakdown */}
            {totalAmount > 0 && (
              <div className="bg-[#F7F8FA] rounded-xl p-3 space-y-1.5 font-sans border border-gray-100 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">আপনার ব্যালেন্স থেকে কাটবে:</span>
                  <span className="text-[#1A1A2E] font-medium">${totalAmount} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">সার্ভিস চার্জ:</span>
                  <span className="text-[#E74C3C] font-mono">${serviceCharge.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">প্রাপক পাবেন:</span>
                  <span className="text-[#0F6E56] font-semibold">${recipientGets.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">টাকায়:</span>
                  <span className="text-[#1B4F72] font-bold font-mono">{bdtAmount.toFixed(0)} BDT</span>
                </div>
              </div>
            )}
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
              placeholder="মোবাইল অ্যাকাউন্টের সম্পূর্ণ নাম"
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1B4F72]"
            />
          </div>

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
