import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { ArrowLeft, Phone, Wifi, CheckCircle, Flame, AlertCircle } from "lucide-react";

interface RechargePackage {
  id: string;
  operator: string;
  operatorCode: string;
  color: string;
  logo: string;
  type: "recharge" | "mb" | "minute" | "mixed";
  amount: string;
  price: number;
  validity?: string;
  isActive: boolean;
  isOffer: boolean;
  offerText: string;
  order: number;
}

interface RechargePageProps {
  onBack: () => void;
}

const OPERATORS = [
  { name: "সব", code: "all", color: "#1B4F72" },
  { name: "GP", code: "GP", color: "#EE3439" },
  { name: "Robi", code: "RB", color: "#E2001A" },
  { name: "BL", code: "BL", color: "#F7941D" },
  { name: "Teletalk", code: "TT", color: "#006838" },
  { name: "Airtel", code: "AT", color: "#ED1C24" }
];

const PACKAGE_TYPES = [
  { label: "রিচার্জ", value: "recharge" },
  { label: "MB প্যাক", value: "mb" },
  { label: "মিনিট", value: "minute" },
  { label: "মিক্সড", value: "mixed" }
];

export default function RechargePage({ onBack }: RechargePageProps) {
  const { userDoc } = useAuth();
  const [balance, setBalance] = useState<number>(userDoc?.balance || 0);

  // Sync balance from userDoc
  useEffect(() => {
    if (userDoc) {
      setBalance(userDoc.balance);
    }
  }, [userDoc]);

  const [recipientNumber, setRecipientNumber] = useState<string>("");
  const [detectedOperatorCode, setDetectedOperatorCode] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("recharge");
  const [packages, setPackages] = useState<RechargePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);
  
  // Modal and checkout states
  const [confirmingPackage, setConfirmingPackage] = useState<RechargePackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successOrder, setSuccessOrder] = useState<{ transId: string; amount: string; price: number; recipient: string; operator: string } | null>(null);
  const [errorText, setErrorText] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");

  // Fetch packages from DB
  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoadingPackages(true);
        const querySnapshot = await getDocs(collection(db, "rechargePackages"));
        const list: RechargePackage[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.isActive) {
            list.push({ id: docSnap.id, ...data } as RechargePackage);
          }
        });
        // Sort by order field
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setPackages(list);
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setLoadingPackages(false);
      }
    }
    fetchPackages();
  }, []);

  // Auto detect operator code from recipient number
  useEffect(() => {
    const cleanNum = recipientNumber.trim();
    if (cleanNum.length >= 3) {
      const prefix3 = cleanNum.slice(0, 3);
      if (prefix3 === "017" || prefix3 === "013") {
        setDetectedOperatorCode("GP");
        setSelectedOperator("GP");
      } else if (prefix3 === "018") {
        setDetectedOperatorCode("RB");
        setSelectedOperator("RB");
      } else if (prefix3 === "019" || prefix3 === "014") {
        setDetectedOperatorCode("BL");
        setSelectedOperator("BL");
      } else if (prefix3 === "015") {
        setDetectedOperatorCode("TT");
        setSelectedOperator("TT");
      } else if (prefix3 === "016") {
        setDetectedOperatorCode("AT");
        setSelectedOperator("AT");
      } else {
        setDetectedOperatorCode("");
      }
    } else {
      setDetectedOperatorCode("");
    }
  }, [recipientNumber]);

  // Filter packages based on selected operator and type
  const filteredPackages = packages.filter((pkg) => {
    const matchesOperator = selectedOperator === "all" || pkg.operatorCode === selectedOperator;
    const matchesType = pkg.type === selectedType;
    return matchesOperator && matchesType;
  });

  // Get special offers (isOffer === true)
  const specialOffers = packages.filter((pkg) => pkg.isOffer);

  const handleOpenConfirm = (pkg: RechargePackage) => {
    setErrorText("");
    if (!recipientNumber.trim()) {
      setErrorText("অনুগ্রহ করে রিচার্জ নম্বরটি প্রদান করুন ভাই।");
      return;
    }
    if (recipientNumber.trim().length < 11) {
      setErrorText("সঠিক ১১ ডিজিটের বাংলাদেশী নম্বরটি দিন ভাই।");
      return;
    }
    setConfirmingPackage(pkg);
  };

  const handleCustomAmountSubmit = () => {
    setErrorText("");
    if (!recipientNumber.trim()) {
      setErrorText("অনুগ্রহ করে রিচার্জ নম্বরটি প্রদান করুন ভাই।");
      return;
    }
    if (recipientNumber.trim().length < 11) {
      setErrorText("সঠিক ১১ ডিজিটের বাংলাদেশী নম্বরটি দিন ভাই।");
      return;
    }
    if (!customAmount.trim()) {
      setErrorText("অনুগ্রহ করে রিচার্জের পরিমাণটি লিখুন ভাই।");
      return;
    }
    const amt = parseInt(customAmount, 10);
    if (isNaN(amt) || amt < 20) {
      setErrorText("সর্বনিম্ন রিচার্জ ২০ টাকা");
      return;
    }

    const opCode = detectedOperatorCode || selectedOperator;
    if (!opCode || opCode === "all") {
      setErrorText("অনুগ্রহ করে একটি অপারেটর নির্বাচন করুন ভাই।");
      return;
    }

    const opDetails = getOperatorDetails(opCode);
    const usdPrice = Number((amt * 0.0085).toFixed(2));

    const virtualPkg: RechargePackage = {
      id: "custom_" + Date.now(),
      operator: opDetails.name,
      operatorCode: opCode,
      color: opDetails.color,
      logo: opDetails.logo,
      type: "recharge",
      amount: customAmount,
      price: usdPrice,
      isActive: true,
      isOffer: false,
      offerText: "",
      order: 99
    };

    setConfirmingPackage(virtualPkg);
  };

  const handleConfirmRecharge = async () => {
    if (!confirmingPackage || !userDoc) return;
    const pkg = confirmingPackage;
    
    if (balance < pkg.price) {
      setErrorText("আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই ভাই। অনুগ্রহ করে আগে ডিপোজিট করুন।");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText("");

      const transId = "RC" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
      
      // 1. Deduct from balance
      const userRef = doc(db, "users", userDoc.uid);
      await updateDoc(userRef, {
        balance: increment(-pkg.price)
      });

      // 2. Save order to Firestore
      const orderPayload = {
        id: transId,
        userId: userDoc.uid,
        userName: userDoc.name || "Unknown User",
        userPhone: userDoc.phone || "",
        operator: pkg.operator,
        operatorCode: pkg.operatorCode,
        packageType: pkg.type,
        amount: pkg.amount,
        price: pkg.price,
        recipientNumber: recipientNumber.trim(),
        status: 'pending',
        balanceDeducted: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "rechargeOrders", transId), orderPayload);

      // 3. Send Telegram Notification
      try {
        const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
        const CHAT_ID = "8885859813";
        const message = `📱 <b>নতুন রিচার্জ অনুরোধ</b>

👤 ইউজার: ${userDoc.name || "Unknown User"}
📞 নম্বর: ${recipientNumber.trim()}
📡 অপারেটর: ${pkg.operator}
💰 প্যাকেজ: ${pkg.type === 'recharge' ? '৳' + pkg.amount : pkg.amount}
💵 মূল্য: $${pkg.price}
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
      } catch (tgErr) {
        console.warn("Telegram notification failed:", tgErr);
      }

      // Show success screen
      setSuccessOrder({
        transId,
        amount: pkg.amount,
        price: pkg.price,
        recipient: recipientNumber.trim(),
        operator: pkg.operator
      });
      setConfirmingPackage(null);
    } catch (err) {
      console.error("Recharge process failed:", err);
      setErrorText("রিচার্জ অনুরোধ প্রক্রিয়া করতে সমস্যা হয়েছে ভাই। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render operator badge info or logo
  const getOperatorDetails = (code: string) => {
    switch (code) {
      case "GP": return { logo: "🟥", name: "GP", color: "#EE3439" };
      case "RB": return { logo: "🔴", name: "Robi", color: "#E2001A" };
      case "BL": return { logo: "🟠", name: "Banglalink", color: "#F7941D" };
      case "TT": return { logo: "🟢", name: "Teletalk", color: "#006838" };
      case "AT": return { logo: "❤️", name: "Airtel", color: "#ED1C24" };
      default: return { logo: "📱", name: "Unknown", color: "#1B4F72" };
    }
  };

  if (successOrder) {
    return (
      <div className="flex flex-col space-y-5 px-4 bg-[#F7F8FA] min-h-screen text-[#1A1A2E] font-sans pb-10">
        {/* Success Header */}
        <div className="flex items-center gap-2 py-3 border-b border-[#E5E7EB] bg-white -mx-4 px-4 sticky top-0 z-10">
          <button onClick={onBack} className="text-[#1B4F72] hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-medium text-[#1A1A2E]">মোবাইল রিচার্জ</span>
        </div>

        <div className="bg-white border rounded-2xl p-6 text-center space-y-4 shadow-sm border-[#E5E7EB] mt-4">
          <div className="text-[#1D9E75] flex justify-center text-5xl">
            <CheckCircle size={56} className="text-[#1D9E75]" />
          </div>
          <h2 className="text-lg font-medium text-[#1A1A2E]">রিচার্জ অনুরোধ পাওয়া গেছে!</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            আমরা ৫-১০ মিনিটের মধ্যে আপনার নম্বরে রিচার্জটি সম্পন্ন করব ভাই।
          </p>

          <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-2 text-left text-xs border border-gray-100">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[#6B7280]">নম্বর:</span>
              <span className="font-semibold text-gray-900">{successOrder.recipient}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[#6B7280]">অপারেটর:</span>
              <span className="font-semibold text-gray-900">{successOrder.operator}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[#6B7280]">প্যাকেজ:</span>
              <span className="font-semibold text-gray-900">{selectedType === 'recharge' ? '৳' + successOrder.amount : successOrder.amount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[#6B7280]">মূল্য:</span>
              <span className="font-semibold text-[#1B4F72]">${successOrder.price} USD</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6B7280]">Transaction ID:</span>
              <span className="font-mono font-bold text-gray-900 select-all">{successOrder.transId}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccessOrder(null);
              setRecipientNumber("");
              setCustomAmount("");
            }}
            className="w-full h-11 bg-[#1B4F72] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-opacity-95 transition-all mt-4"
          >
            আরেকটি রিচার্জ করুন
          </button>
          <button
            onClick={onBack}
            className="w-full h-11 bg-transparent border border-[#E5E7EB] text-[#1A1A2E] text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 px-4 bg-[#F7F8FA] min-h-screen text-[#1A1A2E] font-sans pb-24 text-left">
      {/* PAGE HEADER */}
      <div className="flex items-center gap-2 py-3 border-b border-[#E5E7EB] bg-white -mx-4 px-4 sticky top-0 z-10">
        <button onClick={onBack} className="text-[#1B4F72] hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#1A1A2E]">মোবাইল রিচার্জ 📱</span>
          <span className="text-[11px] text-[#6B7280]">বাংলাদেশে রিচার্জ করুন</span>
        </div>
      </div>

      {/* USER BALANCE CARD */}
      <div className="bg-[#1B4F72] text-white rounded-2xl p-4 shadow-sm space-y-1">
        <div className="text-[11px] text-gray-300">আপনার ব্যালেন্স</div>
        <div className="text-xl font-medium font-sans">${balance.toFixed(2)} USD</div>
        <div className="text-[10px] text-gray-300 pt-1 border-t border-white/10">
          রিচার্জ করলে ব্যালেন্স থেকে কাটাবে ভাই।
        </div>
      </div>

      {/* RECIPIENT NUMBER INPUT */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-2">
        <label className="text-xs font-medium text-[#1A1A2E] block">যার নম্বরে রিচার্জ করবেন</label>
        <div className="relative">
          <input
            type="tel"
            maxLength={11}
            placeholder="01XXXXXXXXX"
            value={recipientNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setRecipientNumber(val);
            }}
            className="w-full h-11 px-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#1B4F72] text-sm tracking-widest font-sans"
          />
          {detectedOperatorCode && (
            <div className="absolute right-3 top-2.5 flex items-center gap-1 bg-white px-2 py-1 border rounded-lg text-[10px] font-semibold border-[#E5E7EB]">
              <span>{getOperatorDetails(detectedOperatorCode).logo}</span>
              <span style={{ color: getOperatorDetails(detectedOperatorCode).color }}>
                {getOperatorDetails(detectedOperatorCode).name}
              </span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-[#6B7280]">বাংলাদেশের সঠিক ১১ ডিজিটের নম্বরটি দিন ভাই।</p>

        {selectedType === "recharge" && (
          <div className="space-y-1.5 pt-3 border-t border-gray-100 mt-2">
            <label className="text-xs font-medium text-[#1A1A2E] block">নিজে পরিমাণ লিখুন (টাকা)</label>
            <div className="flex gap-2">
              <input
                type="tel"
                maxLength={5}
                placeholder="পরিমাণ দিন (যেমন: ৫০)"
                value={customAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setCustomAmount(val);
                  setErrorText("");
                }}
                className="flex-1 h-11 px-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#1B4F72] text-sm font-sans"
              />
              <button
                onClick={handleCustomAmountSubmit}
                className="bg-[#1B4F72] text-white text-xs font-medium px-4 rounded-xl cursor-pointer hover:bg-opacity-95 transition-all whitespace-nowrap"
              >
                রিচার্জ করুন
              </button>
            </div>
          </div>
        )}
        
        {errorText && (
          <div className="flex items-center gap-1.5 text-[#E74C3C] text-[11px] bg-red-50 p-2 rounded-lg border border-red-100">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorText}</span>
          </div>
        )}
      </div>

      {/* SPECIAL OFFERS SECTION */}
      {specialOffers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[13px] font-medium text-[#1A1A2E] flex items-center gap-1">
            <Flame size={15} className="text-[#E74C3C] fill-[#E74C3C]" /> 🔥 বিশেষ অফার
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x no-scrollbar">
            {specialOffers.map((offer) => {
              const op = getOperatorDetails(offer.operatorCode);
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border p-4 w-[240px] shrink-0 snap-start flex flex-col justify-between relative shadow-sm"
                  style={{ borderLeft: `4px solid ${op.color}`, borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                >
                  {/* Top Right offer tag */}
                  <div className="absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: op.color }}>
                    {offer.offerText || "অফার"}
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-[#6B7280] mb-1">
                      <span>{op.logo}</span>
                      <span>{offer.operator}</span>
                    </div>
                    <div className="text-base font-semibold text-[#1A1A2E]">
                      {offer.type === 'recharge' ? '৳' + offer.amount : offer.amount}
                    </div>
                    {offer.validity && (
                      <div className="text-[11px] text-[#6B7280] mt-0.5 font-sans">
                        মেয়াদ: {offer.validity}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                    <span className="text-xs font-semibold text-[#1B4F72] font-sans">${offer.price.toFixed(2)} USD</span>
                    <button
                      onClick={() => handleOpenConfirm(offer)}
                      className="text-[11px] text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                      style={{ backgroundColor: op.color }}
                    >
                      এখনই নিন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OPERATOR TABS (horizontal scroll) */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#1A1A2E]">অপারেটর নির্বাচন করুন</label>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {OPERATORS.map((op) => {
            const isActive = selectedOperator === op.code;
            return (
              <button
                key={op.code}
                onClick={() => setSelectedOperator(op.code)}
                className="px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-all border cursor-pointer"
                style={{
                  backgroundColor: isActive ? op.color : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#6B7280",
                  borderColor: isActive ? op.color : "#E5E7EB",
                  borderWidth: "0.5px"
                }}
              >
                {op.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* PACKAGE TYPE TABS */}
      <div className="grid grid-cols-4 bg-white border border-[#E5E7EB] rounded-xl p-1">
        {PACKAGE_TYPES.map((type) => {
          const isActive = selectedType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`py-2 text-[12px] font-medium rounded-lg text-center cursor-pointer transition-all ${
                isActive
                  ? "bg-[#1B4F72] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#1A1A2E]"
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* PACKAGES GRID */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-[#6B7280]">প্যাকেজ সমূহ ({filteredPackages.length})</h3>
        
        {loadingPackages ? (
          <div className="text-center py-10">
            <span className="text-xs text-gray-400">লোড হচ্ছে...</span>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-xs text-gray-400 border-[#E5E7EB] italic">
            এই ক্যাটাগরিতে কোনো সক্রিয় প্যাকেজ পাওয়া যায়নি ভাই।
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredPackages.map((pkg) => {
              const op = getOperatorDetails(pkg.operatorCode);
              return (
                <div
                  key={pkg.id}
                  className="bg-white border rounded-2xl p-4 flex flex-col justify-between relative shadow-sm"
                  style={{
                    borderColor: pkg.isOffer ? op.color : "#E5E7EB",
                    borderWidth: pkg.isOffer ? "1.5px" : "0.5px"
                  }}
                >
                  {/* Offer Badge if isOffer */}
                  {pkg.isOffer && (
                    <div
                      className="absolute top-2 right-2 text-[8px] font-semibold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: op.color }}
                    >
                      {pkg.offerText || "অফার"}
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                      <span>{op.logo}</span>
                      <span>{pkg.operator}</span>
                    </div>
                    <div className="text-base font-semibold text-[#1A1A2E]">
                      {pkg.type === 'recharge' ? '৳' + pkg.amount : pkg.amount}
                    </div>
                    {pkg.validity && (
                      <div className="text-[10px] text-[#6B7280] font-sans">
                        মেয়াদ: {pkg.validity}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-semibold text-[#1B4F72] text-left font-sans">
                      ${pkg.price.toFixed(2)} USD
                    </div>
                    <button
                      onClick={() => handleOpenConfirm(pkg)}
                      className="w-full h-9 text-xs font-medium text-white rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: op.color }}
                    >
                      রিচার্জ করুন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM MODAL */}
      {confirmingPackage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center transition-opacity duration-300">
          {/* Modal Card */}
          <div className="bg-white rounded-t-[20px] w-full max-w-md p-5 pb-8 space-y-4 shadow-xl transform transition-transform duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-medium text-[#1A1A2E]">রিচার্জ নিশ্চিত করুন</h3>
              <button
                onClick={() => setConfirmingPackage(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-3 text-xs text-left">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[#6B7280]">নম্বর:</span>
                <span className="font-semibold text-gray-900 tracking-wider font-sans">{recipientNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[#6B7280]">অপারেটর:</span>
                <span className="font-semibold text-gray-900">{confirmingPackage.operator}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[#6B7280]">প্যাকেজ:</span>
                <span className="font-semibold text-gray-900">
                  {confirmingPackage.type === 'recharge' ? '৳' + confirmingPackage.amount : confirmingPackage.amount}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[#6B7280]">মূল্য:</span>
                <span className="font-semibold text-[#1B4F72] font-sans">${confirmingPackage.price.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B7280]">আপনার ব্যালেন্স:</span>
                <span className="font-medium font-sans">
                  ${balance.toFixed(2)} → <span className="text-[#1D9E75] font-bold">${(balance - confirmingPackage.price).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {errorText && (
              <div className="flex items-center gap-1.5 text-[#E74C3C] text-[11px] bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmRecharge}
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1B4F72] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? "প্রক্রিয়া হচ্ছে..." : "নিশ্চিত করুন"}
              </button>
              <button
                onClick={() => setConfirmingPackage(null)}
                disabled={isSubmitting}
                className="w-full h-11 bg-transparent border border-[#E5E7EB] text-[#1A1A2E] text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
