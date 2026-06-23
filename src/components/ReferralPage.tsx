import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  UserPlus, 
  DollarSign, 
  Coins, 
  Trophy, 
  MessageSquare, 
  Facebook, 
  Link2,
  Users
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from "firebase/firestore";

interface ReferralPageProps {
  onBackToHome: () => void;
}

export default function ReferralPage({ onBackToHome }: ReferralPageProps) {
  const { userDoc, currentUser } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referredFriends, setReferredFriends] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [referralCode, setReferralCode] = useState<string>(() => {
    if (userDoc?.userId) {
      return userDoc.userId.replace("PS-", "PS-REF-");
    }
    return userDoc?.referralCode || "PS-REF-000000";
  });

  const referralBalance = userDoc?.referralBalance || 0;
  const referralEarnings = userDoc?.referralEarnings || 0;

  // Mask Name helper (shows first 2 characters then stars)
  const maskName = (name: string) => {
    if (!name) return "ইউজার";
    const trimmed = name.trim();
    if (trimmed.length <= 2) return trimmed + "***";
    return trimmed.substring(0, 2) + "***";
  };

  // Fetch current user's document to guarantee correct referral code
  useEffect(() => {
    if (!currentUser) return;

    const fetchUserReferralCode = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const userId = data.userId || "";
          if (userId) {
            const realCode = userId.replace("PS-", "PS-REF-");
            setReferralCode(realCode);
          } else if (data.referralCode) {
            setReferralCode(data.referralCode);
          }
        }
      } catch (err) {
        console.error("Error fetching user document in ReferralPage:", err);
      }
    };

    fetchUserReferralCode();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !referralCode || referralCode === "PS-REF-000000") {
      setLoadingFriends(false);
      return;
    }

    // Fetch referred friends
    const fetchFriends = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("referredBy", "==", referralCode)
        );
        const snap = await getDocs(q);
        const friends = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "প্রবাসী ভাই",
            createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString("bn-BD") : "অজানা তারিখ",
            referralCompleted: data.referralCompleted || false
          };
        });
        setReferredFriends(friends);
      } catch (err) {
        console.error("Error fetching referred friends:", err);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [currentUser, referralCode]);

  useEffect(() => {
    // Fetch dynamic top 10 referrers leaderboard
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("totalReferrals", "desc"),
          limit(10)
        );
        const snap = await getDocs(q);
        const topUsers = snap.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "প্রবাসী ভাই",
              totalReferrals: data.totalReferrals || 0,
              referralEarnings: data.referralEarnings || 0
            };
          })
          .filter(u => u.totalReferrals > 0); // show only users who have referred at least 1 person

        setLeaderboard(topUsers);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Copy Referral Code with auto-filled Link
  const handleCopyCode = () => {
    const origin = window.location.origin || "https://probashisheba.vercel.app";
    const signupLink = `${origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(signupLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy Referral/App Link
  const handleCopyLink = () => {
    const origin = window.location.origin || "https://probashisheba.vercel.app";
    const signupLink = `${origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(signupLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Share message formats
  const shareMessage = `ভাই, প্রবাসী সেবা ব্যবহার করুন! আমার কোড দিয়ে register করলে আমি $1 bonus পাব। কোড: ${referralCode} — Link: ${window.location.origin || "https://probashisheba.vercel.app"}?ref=${referralCode}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin || "https://probashisheba.vercel.app")}&quote=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24 font-sans text-[#1A1A2E] antialiased">
      {/* Top sticky header */}
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] z-10" style={{ borderBottomWidth: "0.5px" }}>
        <div className="flex items-center h-14 px-4 max-w-md mx-auto">
          <button 
            type="button"
            onClick={onBackToHome}
            className="p-1.5 -ml-1 text-[#1B4F72] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="ml-3 font-medium text-[15px] font-sans">রেফারেল সিস্টেম</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* HERO CARD block based on rules */}
        <div className="bg-[#1B4F72] rounded-[16px] p-5 text-white shadow-sm flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-[18px] font-medium leading-tight font-sans">বন্ধুকে আমন্ত্রণ জানান</h2>
              <p className="text-[13px] text-white/80 font-sans">প্রতি সফল রেফারেলে $1 বোনাস পান</p>
            </div>
            <div className="p-2 bg-white/10 rounded-xl">
              <Gift className="w-6 h-6 text-white" />
            </div>
          </div>

          <div 
            onClick={handleCopyCode}
            className="bg-white/15 border border-white/25 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-all select-none"
            title="ট্যাপ করে অটো-কানেক্ট রেফার লিঙ্ক কপি করুন"
          >
            <div>
              <p className="text-[11px] text-white/70 font-sans leading-none mb-1 flex items-center gap-1.5">
                <span>আপনার রেফারেল কোড:</span>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full text-white/90">ট্যাপ করুন</span>
              </p>
              <p className="text-[22px] font-semibold tracking-[2px] font-sans leading-tight text-white">{referralCode}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCode();
              }}
              className="px-4 py-2 bg-white text-[#1B4F72] rounded-lg text-xs font-semibold hover:bg-opacity-95 transition-all flex items-center space-x-1 cursor-pointer shadow-sm select-none"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>কপি হয়েছে! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SHARE BUTTONS */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3.5 bg-white border border-[#E5E7EB] rounded-[14px] hover:bg-gray-50 transition-all text-center space-y-1.5"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[11px] text-[#1A1A2E] font-medium leading-tight font-sans">WhatsApp শেয়ার</span>
          </a>

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3.5 bg-white border border-[#E5E7EB] rounded-[14px] hover:bg-gray-50 transition-all text-center space-y-1.5"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
              <Facebook className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[11px] text-[#1A1A2E] font-medium leading-tight font-sans">Facebook শেয়ার</span>
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex flex-col items-center justify-center p-3.5 bg-white border border-[#E5E7EB] rounded-[14px] hover:bg-gray-50 transition-all text-center space-y-1.5 cursor-pointer"
            style={{ borderWidth: "0.5px" }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${copiedLink ? "bg-[#1D9E75]/10 text-[#1D9E75]" : "bg-[#1B4F72]/10 text-[#1B4F72]"}`}>
              {copiedLink ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
            </div>
            <span className="text-[11px] text-[#1A1A2E] font-medium leading-tight font-sans">
              {copiedLink ? "লিংক কপি হয়েছে" : "লিংক কপি"}
            </span>
          </button>
        </div>

        {/* BALANCE CARDS (2 Column) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Referral Balance */}
          <div className="bg-[#FDF2E9] border border-[#F5A623]/30 rounded-[14px] p-4 flex flex-col space-y-2" style={{ borderWidth: "0.5px" }}>
            <span className="text-[11px] text-[#6B7280] leading-none font-sans font-medium">রেফারেল ব্যালেন্স</span>
            <span className="text-[20px] font-medium tracking-tight text-[#D68910] leading-none font-sans">${referralBalance}</span>
            <div className="space-y-0.5 pt-1">
              <p className="text-[11px] text-[#D68910] font-sans leading-none font-medium">মেইনে যাওয়ার অপেক্ষায়</p>
              <p className="text-[9px] text-[#6B7280] font-sans leading-tight">বন্ধু $50+ পাঠালে মেইনে যাবে</p>
            </div>
          </div>

          {/* Card 2: Total Earnings */}
          <div className="bg-[#E8F8F1] border border-[#1D9E75]/30 rounded-[14px] p-4 flex flex-col space-y-2" style={{ borderWidth: "0.5px" }}>
            <span className="text-[11px] text-[#6B7280] leading-none font-sans font-medium">মোট উপার্জন</span>
            <span className="text-[20px] font-medium tracking-tight text-[#0F6E56] leading-none font-sans">${referralEarnings}</span>
            <div className="space-y-0.5 pt-1">
              <p className="text-[11px] text-[#1D9E75] font-sans leading-none font-medium">মোট রেফারেল বোনাস</p>
              <p className="text-[9px] text-[#6B7280] font-sans leading-tight font-normal">এখন পর্যন্ত মোট</p>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 space-y-3" style={{ borderWidth: "0.5px" }}>
          <h4 className="text-[13px] font-medium text-[#1A1A2E] border-b border-gray-100 pb-2 font-sans" style={{ borderBottomWidth: "0.5px" }}>
            কিভাবে বোনাস পাবেন ভাই?
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#1B4F72]/10 flex items-center justify-center text-[#1B4F72] shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#1A1A2E] font-sans">১. কোড শেয়ার করুন</p>
                <p className="text-[#6B7280] font-sans">বন্ধুকে আপনার ৬ ডিজিটের রেফারেল কোড দিন</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#1A1A2E] font-sans">২. বন্ধু register করুন</p>
                <p className="text-[#6B7280] font-sans">নিবন্ধন করার সময় বন্ধু আপনার কোডটি ব্যবহার করবেন</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#F5A623]/10 flex items-center justify-center text-[#D68910] shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#1A1A2E] font-sans">৩. $1 বোনাস পান</p>
                <p className="text-[#6B7280] font-sans">বন্ধু প্রথমবার $50+ পাঠালে টাকা মেইন ব্যালেন্সে যোগ হবে</p>
              </div>
            </div>
          </div>
        </div>

        {/* REFERRED FRIENDS LIST */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 space-y-3" style={{ borderWidth: "0.5px" }}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2" style={{ borderBottomWidth: "0.5px" }}>
            <h4 className="text-[13px] font-medium text-[#1A1A2E] font-sans flex items-center space-x-1.5">
              <Users className="w-4.5 h-4.5 text-[#1B4F72]" />
              <span>আপনার রেফার করা বন্ধুরা</span>
            </h4>
            <span className="text-[10px] bg-gray-100 text-[#6B7280] px-2 py-0.5 rounded-full font-mono">{referredFriends.length} জন</span>
          </div>

          {loadingFriends ? (
            <p className="text-xs text-[#6B7280] text-center py-4 font-sans">লোড হচ্ছে ভাই...</p>
          ) : referredFriends.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-6 font-sans">এখনো কোনো বন্ধু আপনার কোড দিয়ে যুক্ত হয়নি ভাই।</p>
          ) : (
            <div className="divide-y divide-gray-100" style={{ divideWidth: "0.5px" }}>
              {referredFriends.map((friend) => (
                <div key={friend.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#1A1A2E] font-sans">{maskName(friend.name)}</p>
                    <p className="text-[10px] text-[#6B7280] font-sans font-normal">যুক্ত হয়েছেন: {friend.createdAt}</p>
                  </div>
                  <div>
                    {friend.referralCompleted ? (
                      <span className="px-2 py-1 bg-[#E8F8F1] text-[#1D9E75] font-semibold text-[10px] rounded-lg border border-[#1D9E75]/25">
                        সম্পন্ন ✓
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-[#FFF9E6] text-[#D68910] font-semibold text-[10px] rounded-lg border border-[#F5A623]/25">
                        অপেক্ষায়...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEADERBOARD */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 space-y-3" style={{ borderWidth: "0.5px" }}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2" style={{ borderBottomWidth: "0.5px" }}>
            <h4 className="text-[13px] font-medium text-[#1A1A2E] font-sans flex items-center space-x-1.5">
              <Trophy className="w-4.5 h-4.5 text-[#F5A623]" />
              <span>এই মাসের সেরা রেফারার</span>
            </h4>
          </div>

          {loadingLeaderboard ? (
            <p className="text-xs text-[#6B7280] text-center py-4 font-sans">লোড হচ্ছে ভাই...</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-6 font-sans">এখনো এই মাসে কোনো রেফার হয়নি ভাই।</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((item, index) => {
                const isMe = item.id === currentUser?.uid;
                return (
                  <div 
                    key={item.id} 
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                      isMe ? "bg-[#EBF5FB] border border-[#1B4F72]/20" : "bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        index === 0 ? "bg-[#F5A623] text-white" : index === 1 ? "bg-gray-300 text-black" : index === 2 ? "bg-[#CD7F32] text-white" : "bg-gray-200 text-[#6B7280]"
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`font-sans ${isMe ? "font-semibold text-[#1B4F72]" : "text-[#1A1A2E]"}`}>
                        {maskName(item.name)} {isMe && "(আপনি)"}
                      </span>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="font-medium text-[#1A1A2E] font-sans">{item.totalReferrals} রেফারেল</p>
                      <p className="text-[10px] text-[#6B7280] font-sans">উপার্জন: ${item.referralEarnings}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
