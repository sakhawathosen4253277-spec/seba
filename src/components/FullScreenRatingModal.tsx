import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, updateDoc, addDoc, collection, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Loader2, X, Star, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface FullScreenRatingModalProps {
  currentUser: any;
}

export default function FullScreenRatingModal({ currentUser }: FullScreenRatingModalProps) {
  const [pendingTransfer, setPendingTransfer] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const ratingLabels: Record<number, string> = {
    1: "খুব খারাপ 😞",
    2: "খারাপ 😐",
    3: "ঠিক আছে 🙂",
    4: "ভালো 😊",
    5: "অসাধারণ! 😍"
  };

  const quickComments = [
    "খুব দ্রুত সার্ভিস ও ভালো রেট! ⚡",
    "১০০% নিরাপদ ও অনেক বিশ্বস্ত ভাই 👍",
    "অসাধারণ সার্ভিস, অনেক ধন্যবাদ! 🙏",
    "মাত্র ১০ মিনিটে সম্পন্ন হয়েছে! ⏰"
  ];

  useEffect(() => {
    if (!currentUser) {
      setPendingTransfer(null);
      return;
    }

    // Query for user's completed but unreviewed transfer requests
    const q = query(
      collection(db, "transferRequests"),
      where("userId", "==", currentUser.uid),
      where("status", "==", "completed")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let unreviewedItem: any = null;
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const transferId = docSnap.id;
        
        // If review is not submitted yet and user hasn't dismissed it in local storage
        if (!data.reviewSubmitted && !localStorage.getItem(`dismissed_review_${transferId}`)) {
          unreviewedItem = { id: transferId, ...data };
        }
      });

      setPendingTransfer(unreviewedItem);
    }, (err) => {
      console.warn("Error listening to completed transfers for rating:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle closing/dismissing the modal
  const handleDismiss = () => {
    if (pendingTransfer) {
      localStorage.setItem(`dismissed_review_${pendingTransfer.id}`, "true");
      setPendingTransfer(null);
      // Reset state for next time
      setRating(5);
      setReviewText("");
      setErrorText("");
      setSuccess(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!pendingTransfer) return;
    if (rating === 0) {
      setErrorText("দয়া করে একটি রেটিং নির্বাচন করুন ভাই!");
      return;
    }

    setErrorText("");
    setSubmittingReview(true);

    try {
      const transferId = pendingTransfer.id;
      const userId = pendingTransfer.userId || currentUser?.uid || "";
      const originalName = pendingTransfer.senderName || "ওয়ালেট ইউজার";
      
      // Masking sender name
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

      const method = pendingTransfer.recipientMethod || "bkash";
      const amount = pendingTransfer.amount || 0;

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

      // 3. Send Telegram notification
      try {
        const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
        const CHAT_ID = "8885859813";
        const telegramMsg = `⭐ <b>নতুন রিভিউ (পপআপ থেকে)</b>\n\n` +
          `রেটিং: ${'⭐'.repeat(rating)}\n` +
          `পরিমাণ: $${amount}\n` +
          `মন্তব্য: ${reviewText || 'কোনো মন্তব্য নেই'}\n` +
          `মাধ্যম: ${method.toUpperCase()}`;

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
        console.warn("Telegram notification failed for modal review:", telErr);
      }

      setSuccess(true);
      
      // Auto close after 1.5s success message
      setTimeout(() => {
        localStorage.setItem(`dismissed_review_${transferId}`, "true");
        setPendingTransfer(null);
        // Reset states
        setRating(5);
        setReviewText("");
        setErrorText("");
        setSuccess(false);
      }, 1500);

    } catch (err) {
      console.error("Error submitting review via modal:", err);
      setErrorText("রিভিউ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন ভাই।");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!pendingTransfer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative border border-[#E5E7EB] max-h-[90vh] flex flex-col"
          style={{ borderWidth: "0.5px" }}
        >
          {/* Header Block with primary brand color */}
          <div className="bg-[#1B4F72] text-white p-5 text-center relative shrink-0">
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-all p-1.5 rounded-full hover:bg-white/10 active:scale-95 outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-2.5">
              <CheckCircle2 className="w-7 h-7 text-[#1D9E75]" />
            </div>
            <h3 className="text-base font-medium">ট্রান্সফার সম্পন্ন হয়েছে! 🎉</h3>
            <p className="text-[11px] text-white/80 mt-1">
              আইডি: <span className="font-mono font-bold">{pendingTransfer.id}</span> • পরিমাণ: <span className="font-bold">${pendingTransfer.amount} USD</span>
            </p>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-2"
              >
                <div className="text-4xl">🙏</div>
                <h4 className="text-sm font-semibold text-[#1D9E75]">ধন্যবাদ ভাই!</h4>
                <p className="text-xs text-[#6B7280]">আপনার মূল্যবান মতামত ও রেটিং সংরক্ষিত হয়েছে।</p>
              </motion.div>
            ) : (
              <>
                <div className="text-center space-y-1.5">
                  <h4 className="text-[13.5px] font-medium text-[#1A1A2E]">
                    আমাদের সার্ভিসটি কেমন লেগেছে ভাই?
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    আপনার একটি সৎ রিভিউ আমাদের বাকি প্রবাসী ভাইদের সহায়তা করবে।
                  </p>
                </div>

                {/* Rating selection stars */}
                <div className="flex flex-col items-center space-y-1.5 py-3.5 bg-[#F7F8FA] rounded-2xl border border-[#E5E7EB]" style={{ borderWidth: "0.5px" }}>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-4xl focus:outline-none transition-transform active:scale-110 cursor-pointer"
                        style={{
                          color: (hoverRating || rating) >= star ? "#F5A623" : "#E5E7EB",
                        }}
                      >
                        {(hoverRating || rating) >= star ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#1B4F72] min-h-[18px]">
                    {ratingLabels[rating] || "আপনার রেটিং দিন"}
                  </span>
                </div>

                {/* Quick select buttons */}
                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-[#6B7280] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#1B4F72]" />
                    <span>সহজেই মন্তব্য নির্বাচন করুন:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {quickComments.map((comment, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setReviewText(comment);
                          setRating(5); // Encourage 5 star
                        }}
                        className={`text-[10px] p-2 rounded-xl text-left border transition-all active:scale-[0.98] cursor-pointer font-sans leading-normal ${
                          reviewText === comment 
                            ? "bg-[#1B4F72] text-white border-[#1B4F72]" 
                            : "bg-[#F7F8FA] hover:bg-gray-100 text-[#1A1A2E] border-[#E5E7EB]"
                        }`}
                        style={{ borderWidth: "0.5px" }}
                      >
                        {comment}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Textarea */}
                <div className="space-y-1">
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="নিজের মতো করে মন্তব্য লিখুন (ঐচ্ছিক)..."
                    maxLength={150}
                    className="w-full text-xs p-3 bg-white border border-[#E5E7EB] rounded-xl focus:border-[#1B4F72] focus:ring-1 focus:ring-[#1B4F72] outline-none transition-all resize-none h-20"
                    style={{ borderWidth: "0.5px" }}
                  />
                  <div className="flex justify-end text-[10px] text-[#6B7280]">
                    <span>{reviewText.length}/150 অক্ষর</span>
                  </div>
                </div>

                {errorText && (
                  <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-1.5 text-[11px] text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 pt-1.5">
                  <button
                    onClick={handleDismiss}
                    type="button"
                    className="flex-1 border border-[#E5E7EB] text-[#6B7280] font-medium text-xs py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all cursor-pointer text-center font-sans"
                    style={{ borderWidth: "0.5px" }}
                  >
                    পরে জানাবো
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    type="button"
                    className="flex-1 bg-[#1D9E75] hover:bg-opacity-95 text-white font-medium text-xs py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer font-sans disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "রিভিউ দিন"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
