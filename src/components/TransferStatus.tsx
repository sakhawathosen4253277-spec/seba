import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Search, Loader2, CheckCircle2, Clock, Hourglass, RefreshCw, X, AlertTriangle, AlertCircle, FileText } from "lucide-react";
import { downloadReceiptImage } from "../lib/receipt";

interface TransferRequest {
  id: string;
  senderName: string;
  senderPhone: string;
  amount: number;
  currency: string;
  serviceFee: number;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  recipientMethod: string;
  recipientBank?: string;
  recipientAccount?: string;
  status: "pending" | "processing" | "sent" | "completed" | "failed";
  proofImageUrl?: string;
  processedAt?: string;
  completedAt?: string;
  note?: string;
  createdAt: string;
  rejectReason?: string;
  userId?: string;
  serviceFeePercent?: number;
  serviceFeeFixed?: number;
  recipientMethodName?: string;
  calculatedBdt?: number;
  serviceCharge?: number;
  rating?: number;
  reviewText?: string;
  reviewSubmitted?: boolean;
}

interface TransferStatusProps {
  onBack: () => void;
  prefilledTxId?: string;
}

export default function TransferStatus({ onBack, prefilledTxId }: TransferStatusProps) {
  const [searchId, setSearchId] = useState<string>(prefilledTxId || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [requestData, setRequestData] = useState<TransferRequest | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Review & Rating States
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>("");
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  const ratingLabels: Record<number, string> = {
    1: "খুব খারাপ",
    2: "খারাপ",
    3: "ঠিক আছে",
    4: "ভালো",
    5: "অসাধারণ!"
  };

  // Trigger search automatically if prefilledTxId is supplied
  useEffect(() => {
    if (prefilledTxId) {
      handleSearch(prefilledTxId);
    }
  }, [prefilledTxId]);

  const handleSearch = async (txIdToSearch?: string) => {
    const id = (txIdToSearch || searchId).trim();
    if (!id) {
      setErrorStatus("দয়া করে একটি সঠিক ট্রান্সফার আইডি লিখুন ভাই!");
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setRequestData(null);

    try {
      const docRef = doc(db, "transferRequests", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRequestData({ id: docSnap.id, ...docSnap.data() } as TransferRequest);
      } else {
        setErrorStatus("দুঃখিত, এই আইডি দিয়ে কোনো ট্রান্সফার অনুরোধ পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডিটি দিন ভাই।");
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      const isOffline = errMessage.toLowerCase().includes("offline") || 
                        errMessage.toLowerCase().includes("failed to get document") ||
                        errMessage.toLowerCase().includes("network");
      if (isOffline) {
        console.warn("TransferStatus fetch skipped (offline):", errMessage);
      } else {
        console.error("Error fetching transfer status:", err);
      }
      setErrorStatus("সার্ভার থেকে তথ্য আনতে কিছুটা সমস্যা হয়েছে ভাই!");
    } finally {
      setLoading(false);
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { id: "pending", label: "অনুরোধ পাওয়া গেছে", icon: "⏳" },
      { id: "processing", label: "যাচাই হচ্ছে & প্রসেসিং", icon: "🔄" },
      { id: "sent", label: "টাকা পাঠানো হচ্ছে", icon: "💸" },
      { id: "completed", label: "সম্পন্ন হয়েছে", icon: "✅" }
    ];

    let currentActiveIdx = 0;
    if (status === "pending") currentActiveIdx = 0;
    else if (status === "processing") currentActiveIdx = 1;
    else if (status === "sent") currentActiveIdx = 2;
    else if (status === "completed") currentActiveIdx = 3;
    else if (status === "failed") currentActiveIdx = -1; // special handling

    return { steps, currentActiveIdx };
  };

  const { steps, currentActiveIdx } = requestData ? getTimelineSteps(requestData.status) : { steps: [], currentActiveIdx: 0 };

  return (
    <div className="flex flex-col space-y-4 px-4 pb-24 bg-[#F7F8FA]" id="transfer-status-container">
      
      {/* Header Back navigation */}
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
        <h2 className="text-base font-medium text-[#1A1A2E]">ট্রান্সফার ট্র্যাকিং 🇧🇩</h2>
        <p className="text-[11px] text-[#6B7280]">আপনার টাকা পাঠানোর সর্বশেষ অবস্থা জানুন</p>
      </div>

      {/* Search Input Box */}
      <div 
        className="bg-white rounded-2xl p-4 border text-left font-sans"
        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
      >
        <label className="text-[11px] font-medium text-[#6B7280] block mb-1.5">ট্রান্সফার আইডি (যেমন: TXN-xxxxxx):</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="আপনার ট্রান্সফার অনুরোধ আইডিটি দিন"
            className="flex-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1B4F72] outline-none font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-4 bg-[#1B4F72] hover:bg-opacity-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all select-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>খুঁজুন</span>
              </>
            )}
          </button>
        </div>

        {errorStatus && (
          <p className="text-[11.5px] text-red-600 mt-2 bg-red-50 p-2 rounded-xl border border-red-100 flex items-start gap-1 leading-normal">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{errorStatus}</span>
          </p>
        )}
      </div>

      {/* Results details panel */}
      {requestData && (
        <div className="space-y-4 animate-fade-in font-sans">
          
          {/* Status Header card */}
          <div 
            className="bg-white rounded-2xl p-4 border text-left flex justify-between items-center"
            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
          >
            <div>
              <p className="text-[10px] text-gray-500 font-mono">আইডি: {requestData.id}</p>
              <h3 className="text-sm font-semibold text-[#1A1A2E] mt-0.5">
                প্রাপক: {requestData.recipientName}
              </h3>
              <p className="text-[11px] text-gray-500">
                পরিমাণ: <span className="font-semibold text-[#1B4F72]">${requestData.amount} USD</span> • {requestData.recipientMethod.toUpperCase()}
              </p>
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
              requestData.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
              requestData.status === "failed" ? "bg-red-50 text-red-600 border border-red-100" :
              "bg-amber-50 text-amber-600 border border-amber-100"
            }`}>
              {requestData.status === "completed" ? "সম্পন্ন" :
               requestData.status === "failed" ? "বাতিল" : "অপেক্ষমান"}
            </span>
          </div>

          {/* Timeline Tracking */}
          <div 
            className="bg-white rounded-2xl p-5 border text-left space-y-4"
            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
          >
            <h4 className="text-xs font-bold text-[#1B4F72] uppercase tracking-wider pb-1.5 border-b border-gray-100">
              ট্র্যাকিং টাইমলাইন (Live Timeline)
            </h4>

            {requestData.status === "failed" ? (
              <div className="bg-red-50 p-3.5 rounded-xl border border-red-100 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div className="text-xs text-red-900 leading-normal">
                  <p className="font-bold">ট্রান্সফারটি বাতিল করা হয়েছে ভাই।</p>
                  <p className="mt-1"><strong>কারণ:</strong> {requestData.rejectReason || "তথ্য অসঙ্গতি বা পেমেন্ট পাওয়া যায়নি।"}</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 border-l-[2px] border-gray-100 space-y-5 ml-2.5 py-1">
                {steps.map((step, idx) => {
                  const isDone = idx < currentActiveIdx;
                  const isActive = idx === currentActiveIdx;
                  const isFuture = idx > currentActiveIdx;

                  return (
                    <div key={step.id} className="relative">
                      {/* circle dot */}
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border transition-all ${
                        isDone ? "bg-[#1D9E75] border-[#1D9E75] text-white" :
                        isActive ? "bg-[#1B4F72] border-[#1B4F72] text-white animate-pulse" :
                        "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {isDone ? "✓" : ""}
                      </span>

                      <div className="text-xs text-left">
                        <p className={`font-semibold ${
                          isDone ? "text-gray-600" :
                          isActive ? "text-[#1B4F72] text-sm" :
                          "text-gray-400"
                        }`}>
                          {step.icon} {step.label}
                        </p>
                        {isActive && (
                          <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100/50">
                            <Clock className="w-3 h-3 text-[#1B4F72]" />
                            <span>
                              {step.id === "pending" ? "আমাদের টিম ৫ মিনিটের মধ্যে প্রসেসিং শুরু করবে ভাই" :
                               step.id === "processing" ? "পেমেন্ট ম্যানুয়ালি যাচাই করা হচ্ছে" :
                               "বিকাশ/নগদ/রকেটে টাকা পৌঁছানোর প্রক্রিয়া চলমান রয়েছে"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recipient Details & Payment info */}
          <div 
            className="bg-white rounded-2xl p-4 border text-left space-y-3 text-xs text-gray-600"
            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
          >
            <h4 className="text-xs font-bold text-[#1B4F72] uppercase tracking-wider pb-1 border-b border-gray-100/60">
              লেনদেন ও পেমেন্ট বিবরণী
            </h4>

            <div className="grid grid-cols-2 gap-2 font-sans bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              <div>
                <span className="text-[10px] text-gray-500 block">প্রেরক নাম:</span>
                <span className="font-semibold text-gray-800">{requestData.senderName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">প্রেরক ফোন:</span>
                <span className="font-semibold text-gray-800">{requestData.senderPhone}</span>
              </div>
              
              <div className="col-span-2 border-t border-gray-100 my-1 pt-1"></div>

              <div>
                <span className="text-[10px] text-gray-500 block">প্রাপক নাম:</span>
                <span className="font-bold text-gray-800">{requestData.recipientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">প্রাপক চ্যানেল/ফোন:</span>
                <span className="font-bold text-gray-800 font-mono">{requestData.recipientPhone}</span>
              </div>

              {requestData.recipientMethod === "bank" && (
                <div className="col-span-2 bg-[#F2F4F4] p-2 rounded-lg mt-1 font-sans text-[11px] text-gray-700">
                  <p>🏦 <strong>ব্যাংক:</strong> {requestData.recipientBank}</p>
                  <p>💳 <strong>অ্যাকাউন্ট:</strong> {requestData.recipientAccount}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xs px-1">
              <span>পাঠানো পরিমাণ (USD):</span>
              <span className="font-bold text-gray-800">${requestData.amount} USD</span>
            </div>
            
            <div className="flex justify-between items-center text-xs px-1 text-emerald-600 font-semibold bg-emerald-50/45 p-1.5 rounded-lg">
              <span>প্রাপক পেয়েছেন (BDT):</span>
              <span>{(requestData.amount * 110.8).toFixed(1)} BDT</span>
            </div>

            <div className="text-[10px] text-gray-400 pt-1 text-center font-sans">
              অনুরোধের সময়: {new Date(requestData.createdAt).toLocaleString("bn-BD")}
            </div>
          </div>

          {/* Payment proof from admin (If completed) */}
          {requestData.status === "completed" && requestData.proofImageUrl && (
            <div 
              className="bg-white rounded-2xl p-4 border text-left space-y-2.5"
              style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
            >
              <h4 className="text-xs font-bold text-[#1D9E75] uppercase tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#1D9E75]" />
                <span>অফিসিয়াল ট্রান্সফার রিসিট</span>
              </h4>
              <p className="text-[11px] text-gray-500">বাংলাদেশে টাকা পৌঁছে দেওয়ার স্ক্রিনশট প্রুফ নিচে প্রদান করা হলো ভাই:</p>
              
              <div className="border border-gray-100 bg-gray-50 rounded-xl p-1.5 flex justify-center">
                <img 
                  src={requestData.proofImageUrl} 
                  alt="Official Transaction proof" 
                  className="max-h-[250px] object-contain rounded-lg max-w-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* Download Receipt Button (If completed) */}
          {requestData.status === "completed" && (
            <div 
              className="bg-white rounded-2xl p-4 border text-left space-y-2.5"
              style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
            >
              <h4 className="text-xs font-bold text-[#1B4F72] uppercase tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1">
                <FileText className="w-4 h-4 text-[#1B4F72]" />
                <span>ট্রান্সফার রশিদ (Official Receipt)</span>
              </h4>
              <p className="text-[11px] text-gray-500">আপনার লেনদেনের অফিশিয়াল রশিদটি ডাউনলোড করতে নিচের বোতামে চাপ দিন ভাই:</p>
              
              <button
                onClick={() => {
                  const displayDate = requestData.completedAt ? new Date(requestData.completedAt).toLocaleDateString("bn-BD", {day: "numeric", month: "long", year: "numeric"}) : "আজ";
                  const displayNum = requestData.recipientPhone || "";
                  const displayBdt = requestData.amount * 110.8;
                  const displayUsd = requestData.amount;
                  downloadReceiptImage({
                    id: requestData.id,
                    senderName: requestData.senderName || "ওয়ালেট ইউজার",
                    recipientName: requestData.recipientName,
                    recipientMethod: requestData.recipientMethod || "Bank",
                    recipientNumber: displayNum,
                    amountUsd: Number(displayUsd),
                    amountBdt: Number(displayBdt),
                    feeUsd: Number(requestData.serviceFee || 0),
                    date: displayDate,
                    status: "completed",
                    confirmationDigits: (requestData as any).confirmationDigits || ""
                  });
                }}
                className="w-full mt-2 text-xs text-white font-semibold flex items-center justify-center space-x-1.5 bg-[#1B4F72] hover:bg-opacity-95 p-3 rounded-xl transition-all cursor-pointer select-none"
              >
                <FileText className="w-4 h-4" />
                <span>রশিদ ডাউনলোড করুন</span>
              </button>
            </div>
          )}

          {/* Star Rating & Review Prompt */}
          {requestData.status === "completed" && (
            <div 
              className="bg-white rounded-2xl p-4 border text-left space-y-3"
              style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
            >
              <div className="flex flex-col">
                <h4 className="text-[14px] font-medium text-[#1A1A2E] font-sans">আপনার অভিজ্ঞতা শেয়ার করুন</h4>
                <p className="text-[12px] text-[#6B7280] font-sans">অন্য ভাইদের জানতে সাহায্য করুন</p>
              </div>

              {(requestData.reviewSubmitted || reviewSuccess) ? (
                <div className="bg-[#E9F7EF] border border-[#D4EFDF] text-[#1D9E75] p-4 rounded-xl text-center font-medium text-xs font-sans">
                  ধন্যবাদ! আপনার রিভিউ সংরক্ষিত হয়েছে 🙏
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Star Selection */}
                  <div className="flex flex-col items-center space-y-1 py-2 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-[32px] focus:outline-none transition-transform active:scale-110 cursor-pointer"
                          style={{
                            color: (hoverRating || rating) >= star ? "#F5A623" : "#E5E7EB",
                          }}
                        >
                          {(hoverRating || rating) >= star ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <span className="text-xs font-medium text-[#1B4F72] animate-fade-in font-sans">
                        {ratingLabels[rating]}
                      </span>
                    )}
                  </div>

                  {/* Comment Box */}
                  <div className="space-y-1">
                    <textarea
                      maxLength={200}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)"
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-3 text-xs outline-none focus:border-[#1B4F72] transition-colors font-sans resize-none h-20"
                      style={{ borderWidth: "0.5px" }}
                    />
                    <div className="flex justify-between items-center text-[10px] text-[#6B7280] font-sans px-1">
                      <span>সর্বোচ্চ ২০০ অক্ষর</span>
                      <span>{reviewText.length}/200</span>
                    </div>
                  </div>

                  {reviewError && (
                    <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-sans">
                      {reviewError}
                    </p>
                  )}

                  <button
                    onClick={async () => {
                      if (rating === 0) {
                        setReviewError("দয়া করে একটি স্টার রেটিং নির্বাচন করুন ভাই!");
                        return;
                      }
                      setReviewError("");
                      setSubmittingReview(true);
                      try {
                        const transferId = requestData.id;
                        const userId = requestData.userId || "";
                        const originalName = requestData.senderName || "ওয়ালেট ইউজার";
                        
                        const maskName = (name: string) => {
                          if (!name) return "ইউ***";
                          const str = String(name);
                          if (str.length <= 2) return str + "***";
                          return str.substring(0, 2) + "***";
                        };
                        const maskedName = maskName(originalName);

                        // 1. Update transferRequest in Firestore
                        await updateDoc(doc(db, "transferRequests", transferId), {
                          rating: rating,
                          reviewText: reviewText,
                          reviewSubmitted: true,
                          reviewedAt: serverTimestamp()
                        });

                        const method = requestData.recipientMethod || "bkash";
                        const amount = requestData.amount || 0;

                        // 2. Save to reviews collection
                        await addDoc(collection(db, "reviews"), {
                          transferId,
                          userId,
                          userName: maskedName,
                          rating,
                          reviewText,
                          amount,
                          method,
                          published: true,
                          createdAt: serverTimestamp()
                        });

                        // 3. Send Telegram notification via API/bot call
                        try {
                          const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
                          const CHAT_ID = "8885859813";
                          const telegramMsg = `⭐ <b>নতুন রিভিউ</b>

রেটিং: ${'⭐'.repeat(rating)}
পরিমাণ: $${amount}
মন্তব্য: ${reviewText || 'কোনো মন্তব্য নেই'}
মাধ্যম: ${method}`;

                          await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              chat_id: CHAT_ID,
                              text: telegramMsg,
                              parse_mode: "HTML"
                            })
                          });
                        } catch (telErr) {
                          console.warn("Telegram notification failed for review:", telErr);
                        }

                        setReviewSuccess(true);
                      } catch (err) {
                        console.error("Error submitting review:", err);
                        setReviewError("রিভিউ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন ভাই।");
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                    disabled={submittingReview}
                    className="w-full bg-[#1B4F72] text-white font-semibold text-xs h-[48px] rounded-xl flex items-center justify-center hover:bg-opacity-95 active:scale-[0.99] transition-all cursor-pointer font-sans select-none disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>রিভিউ দিন</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
