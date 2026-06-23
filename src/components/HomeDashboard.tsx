import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  DollarSign, 
  Plane, 
  MessageCircle, 
  Briefcase, 
  AlertOctagon,
  ChevronRight,
  Loader2,
  Gift,
  Clock,
  CheckCircle2,
  RefreshCw,
  X
} from "lucide-react";
import { NavTab } from "../types";
import { db } from "../lib/firebase";
import { collection, getDocs, getDoc, doc, updateDoc, setDoc, query, where } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";

interface HomeDashboardProps {
  onServiceSelect: (tab: NavTab, subView?: string) => void;
  walletBalance: number;
  exchangeRate?: number;
  userName?: string;
}

export default function HomeDashboard({ onServiceSelect, walletBalance }: HomeDashboardProps) {
  const { userDoc, currentUser } = useAuth();
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbRates, setDbRates] = useState({
    bkash: 110.50,
    nagad: 110.60,
    bank: 110.80,
    usdRate: 110.80
  });
  
  const [newsList, setNewsList] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState<number>(0);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);

  const defaultNewsCards = [
    {
      id: "news-1",
      title: "কম্বোডিয়ার নতুন visa নীতি",
      date: "আজ",
      tag: "ভিসা আপডেট",
      desc: "ভিসা এক্সটেনশনের ক্ষেত্রে অনলাইন আবেদন গ্রহণের প্রক্রিয়া সহজ করা হয়েছে। যেকোনো দালাল ছাড়া সরাসরি ইমিগ্রেশনে আবেদন করার সুযোগ আছে।"
    },
    {
      id: "news-2",
      title: "বিকাশ ও নগদে টাকা প্রেরণে সতর্কতা",
      date: "yesterday",
      tag: "স্ক্যাম সতর্কতা",
      desc: "অবৈধ হুন্ডি চক্র থেকে নিরাপদ থাকতে হবে ভাই। হুন্ডিতে পাঠানো টাকা আটকে গেলে দূতাবাস আইনি সাহায্য দিতে পারে না। বিশ্বস্ত ব্যাংক চ্যানেল ব্যবহার করুন।"
    }
  ];

  // Fetch Firestore Data
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch Exchange rates
        const rateSnap = await getDoc(doc(db, "exchangeRates", "current"));
        if (rateSnap.exists()) {
          const r = rateSnap.data();
          setDbRates({
            bkash: r.bkash || 110.50,
            nagad: r.nagad || 110.60,
            bank: r.bank || 110.80,
            usdRate: r.usdRate || 110.80
          });
        }

        // 2. Fetch News
        const newsSnap = await getDocs(collection(db, "news"));
        if (!newsSnap.empty) {
          const fetchedNews = newsSnap.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title,
                date: data.date || "আজ",
                tag: data.tag || "বিজ্ঞপ্তি",
                desc: data.description,
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdAt: data.createdAt || ""
              };
            })
            .filter(n => n.isActive === true)
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setNewsList(fetchedNews.length > 0 ? fetchedNews : defaultNewsCards);
        } else {
          setNewsList(defaultNewsCards);
        }

        // 3. Fetch Home Alerts (Warnings)
        const alertsSnap = await getDocs(collection(db, "homeAlerts"));
        if (!alertsSnap.empty) {
          const fetchedAlerts = alertsSnap.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || "",
                desc: data.description || "",
                tag: data.tag || "সতর্কতা",
                duration: data.duration !== undefined ? Number(data.duration) : 10,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
                order: data.order !== undefined ? Number(data.order) : 100
              };
            })
            .filter(a => a.isActive === true)
            .sort((a, b) => a.order - b.order);
          setActiveAlerts(fetchedAlerts);
        } else {
          setActiveAlerts([
            {
              id: "alert-default-1",
              title: "ফনম পেনহে নতুন স্ক্যাম চক্র সক্রিয়",
              desc: "অপরিচিত এজেন্ট বা দালালের দেওয়া কাজের প্রলোভন থেকে সাবধান থাকুন ভাই।",
              tag: "সতর্কতা",
              duration: 10,
              isActive: true,
              order: 1
            }
          ]);
        }
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : String(err);
        const isOffline = errMessage.toLowerCase().includes("offline") || 
                          errMessage.toLowerCase().includes("failed to get document") ||
                          errMessage.toLowerCase().includes("network");
        if (isOffline) {
          console.warn("Home dashboard database load skipped (offline):", errMessage);
        } else {
          console.error("Error loading home dashboard data from firestore:", err);
        }
        // Fallbacks
        setNewsList(defaultNewsCards);
      } finally {
        setDbLoading(false);
      }
    }
    loadData();
  }, []);

  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  // Fetch Live Deposit and Transfer Transactions
  useEffect(() => {
    if (!currentUser) {
      setLoadingTransactions(false);
      return;
    }
    async function fetchUserTransactions() {
      try {
        setLoadingTransactions(true);
        const uid = currentUser?.uid;
        const customerId = userDoc?.userId;

        // Fetch transfers
        const transfersRef = collection(db, "transferRequests");
        const qTrans1 = query(transfersRef, where("userId", "==", uid));
        const transSnap1 = await getDocs(qTrans1);
        let txList: any[] = [];
        
        transSnap1.forEach((doc) => {
          const data = doc.data();
          txList.push({
            id: doc.id,
            type: "transfer",
            amountUsd: Number(data.amount || data.totalDeducted || 0),
            amountBdt: Number(data.calculatedBdt || data.bdtAmount || 110 * (data.amount || data.totalDeducted || 0)),
            recipientName: data.recipientName || "",
            recipientNumber: data.recipientPhone || "",
            methodName: data.recipientMethodName || data.recipientMethod || "",
            status: data.status || "pending",
            createdAt: data.createdAt || "",
            rejectReason: data.rejectReason || "",
            proofImageUrl: data.proofImageUrl || "",
          });
        });

        // Query using customerId if available
        if (customerId && customerId !== uid) {
          const qTrans2 = query(transfersRef, where("userId", "==", customerId));
          const transSnap2 = await getDocs(qTrans2);
          transSnap2.forEach((doc) => {
            if (!txList.some(item => item.id === doc.id)) {
              const data = doc.data();
              txList.push({
                id: doc.id,
                type: "transfer",
                amountUsd: Number(data.amount || data.totalDeducted || 0),
                amountBdt: Number(data.calculatedBdt || data.bdtAmount || 110 * (data.amount || data.totalDeducted || 0)),
                recipientName: data.recipientName || "",
                recipientNumber: data.recipientPhone || "",
                methodName: data.recipientMethodName || data.recipientMethod || "",
                status: data.status || "pending",
                createdAt: data.createdAt || "",
                rejectReason: data.rejectReason || "",
                proofImageUrl: data.proofImageUrl || "",
              });
            }
          });
        }

        // Fetch deposits
        const depositsRef = collection(db, "depositRequests");
        const qDep1 = query(depositsRef, where("userId", "==", uid));
        const depSnap1 = await getDocs(qDep1);
        
        depSnap1.forEach((doc) => {
          const data = doc.data();
          txList.push({
            id: doc.id,
            type: "deposit",
            amountUsd: Number(data.amount || 0),
            amountBdt: Number(data.calculatedBdt || 0),
            recipientName: "",
            recipientNumber: data.transactionId || "",
            methodName: data.methodName || "",
            status: data.status || "pending",
            createdAt: data.createdAt || "",
            rejectReason: data.rejectReason || "",
            proofImageUrl: data.proofImageUrl || "",
          });
        });

        if (customerId && customerId !== uid) {
          const qDep2 = query(depositsRef, where("userId", "==", customerId));
          const depSnap2 = await getDocs(qDep2);
          depSnap2.forEach((doc) => {
            if (!txList.some(item => item.id === doc.id)) {
              const data = doc.data();
              txList.push({
                id: doc.id,
                type: "deposit",
                amountUsd: Number(data.amount || 0),
                amountBdt: Number(data.calculatedBdt || 0),
                recipientName: "",
                recipientNumber: data.transactionId || "",
                methodName: data.methodName || "",
                status: data.status || "pending",
                createdAt: data.createdAt || "",
                rejectReason: data.rejectReason || "",
                proofImageUrl: data.proofImageUrl || "",
              });
            }
          });
        }

        // Sort by createdAt desc
        txList.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setUserTransactions(txList);
      } catch (err) {
        console.error("Error fetching user transactions:", err);
      } finally {
        setLoadingTransactions(false);
      }
    }

    fetchUserTransactions();
  }, [currentUser, userDoc?.userId]);

  const currentNewsList = newsList.length > 0 ? newsList : defaultNewsCards;

  const handleCloseAlert = () => {
    if (activeAlert) {
      try {
        const userRefKey = currentUser ? `dismissed_alerts_${currentUser.uid}` : "dismissed_alerts_anon";
        const dismissedAlertsRaw = localStorage.getItem(userRefKey);
        const dismissedAlertsList: string[] = dismissedAlertsRaw ? JSON.parse(dismissedAlertsRaw) : [];
        if (!dismissedAlertsList.includes(activeAlert.id)) {
          dismissedAlertsList.push(activeAlert.id);
          localStorage.setItem(userRefKey, JSON.stringify(dismissedAlertsList));
        }
      } catch (e) {
        console.warn("Failed to set localStorage dismissed_alerts List", e);
      }
    }
    setAlertOpen(false);
    setTimeout(() => {
      setCurrentAlertIndex(prev => prev + 1);
    }, 400);
  };

  // Trigger important popup alerts in sequence based on order and duration
  useEffect(() => {
    if (!dbLoading && activeAlerts.length > 0) {
      // Filter out alerts already dismissed in previous sessions
      const userRefKey = currentUser ? `dismissed_alerts_${currentUser.uid}` : "dismissed_alerts_anon";
      let dismissedAlertsList: string[] = [];
      try {
        const dismissedAlertsRaw = localStorage.getItem(userRefKey);
        dismissedAlertsList = dismissedAlertsRaw ? JSON.parse(dismissedAlertsRaw) : [];
      } catch (e) {
        console.warn("Failed to parse dismissed alerts", e);
      }

      const freshAlerts = activeAlerts.filter(alert => !dismissedAlertsList.includes(alert.id));
      if (freshAlerts.length === 0) {
        setAlertOpen(false);
        setActiveAlert(null);
        return;
      }

      const storageKey = currentUser ? `home_alerts_shown_${currentUser.uid}` : "home_alerts_shown_anon";
      if (sessionStorage.getItem(storageKey) === "true") {
        setAlertOpen(false);
        setActiveAlert(null);
        return;
      }

      if (currentAlertIndex < freshAlerts.length) {
        // Mark as shown immediately when the first alert is about to be displayed 
        // to prevent repetitive popups if the user navigates away or taps Home rapidly
        if (currentAlertIndex === 0) {
          try {
            sessionStorage.setItem(storageKey, "true");
          } catch (e) {
            console.warn("Failed to set sessionStorage", e);
          }
        }

        const currentAlertItem = freshAlerts[currentAlertIndex];
        setActiveAlert(currentAlertItem);
        setAlertOpen(true);

        const durationSec = currentAlertItem.duration !== undefined ? currentAlertItem.duration : 10;
        const timer = setTimeout(() => {
          // Auto dismiss
          try {
            const dismissedAlertsRaw = localStorage.getItem(userRefKey);
            const currentList: string[] = dismissedAlertsRaw ? JSON.parse(dismissedAlertsRaw) : [];
            if (!currentList.includes(currentAlertItem.id)) {
              currentList.push(currentAlertItem.id);
              localStorage.setItem(userRefKey, JSON.stringify(currentList));
            }
          } catch (e) {
            console.warn("Failed to set localStorage auto dismiss", e);
          }

          setAlertOpen(false);
          const nextTimer = setTimeout(() => {
            setCurrentAlertIndex(prev => prev + 1);
          }, 500);
          return () => clearTimeout(nextTimer);
        }, durationSec * 1000);

        return () => clearTimeout(timer);
      } else {
        setAlertOpen(false);
        setActiveAlert(null);
      }
    }
  }, [dbLoading, activeAlerts, currentAlertIndex, currentUser]);

  // Daily check-in logic
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<string>("");

  useEffect(() => {
    const calculateCooldown = () => {
      if (!userDoc?.lastDailyClaim) {
        setCooldownRemaining("");
        return;
      }
      const lastClaimTime = new Date(userDoc.lastDailyClaim).getTime();
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const diff = oneDayMs - (now - lastClaimTime);

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCooldownRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        setCooldownRemaining("");
      }
    };

    calculateCooldown();
    const interval = setInterval(calculateCooldown, 1000);
    return () => clearInterval(interval);
  }, [userDoc?.lastDailyClaim]);

  const handleCollectDailyBonus = async () => {
    if (!currentUser) {
      setClaimMsg({ text: "বোনাস সংগ্রহ করতে অনুগ্রহ করে আগে লগইন করুন ভাই।", type: "error" });
      return;
    }
    if (claiming) return;

    const lastClaimTime = userDoc?.lastDailyClaim ? new Date(userDoc.lastDailyClaim).getTime() : 0;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (lastClaimTime && (now - lastClaimTime < oneDayMs)) {
      setClaimMsg({ text: "আপনি আজকে ইতিমধ্যে বোনাস নিয়েছেন ভাই! ২৪ ঘণ্টা পর আবার চেষ্টা করুন।", type: "error" });
      return;
    }

    setClaiming(true);
    setClaimMsg(null);

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const newBalance = Number((userDoc?.balance || 0) + 0.05);
      const claimDateStr = new Date().toISOString();

      await setDoc(userRef, {
        balance: newBalance,
        lastDailyClaim: claimDateStr
      }, { merge: true });

      setClaimMsg({ text: "আলহামদুলিল্লাহ ভাই! $0.05 ডেইলি বোনাস আপনার ওয়ালেটে যুক্ত হয়েছে। 🎉", type: "success" });
      setTimeout(() => setClaimMsg(null), 6000);
    } catch (err) {
      console.error("Failed to collect daily bonus:", err);
      setClaimMsg({ text: "বোনাস সংগ্রহ করতে সমস্যা হয়েছে ভাই। দয়া করে আবার চেষ্টা করুন।", type: "error" });
    } finally {
      setClaiming(false);
    }
  };

  // 7 grid services
  const gridServices = [
    {
      id: "visa",
      label: "ভিসা তথ্য",
      icon: FileText,
      action: () => onServiceSelect("services", "visa")
    },
    {
      id: "money",
      label: "টাকা পাঠান",
      icon: DollarSign,
      action: () => onServiceSelect("transfer")
    },
    {
      id: "ticket",
      label: "এয়ার টিকেট",
      icon: Plane,
      action: () => onServiceSelect("services", "ticket")
    },
    {
      id: "ai_chat",
      label: "AI সহায়তা",
      icon: MessageCircle,
      action: () => onServiceSelect("chat")
    },
    {
      id: "scam",
      label: "স্ক্যাম রিপোর্ট",
      icon: ShieldAlert,
      action: () => onServiceSelect("services", "scam")
    },
    {
      id: "job",
      label: "চাকরির বোর্ড",
      icon: Briefcase,
      action: () => onServiceSelect("services", "jobs")
    },
    {
      id: "referral",
      label: "রেফার ও ইনকাম",
      icon: Gift,
      action: () => onServiceSelect("referral")
    }
  ];

  if (dbLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-[#F7F8FA]">
        <Loader2 className="w-8 h-8 text-[#1B4F72] animate-spin" />
        <p className="text-[12px] text-[#6B7280] font-sans font-normal">ডাটাবেজ লোড হচ্ছে ভাই...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 bg-[#F7F8FA]" style={{ paddingBottom: "80px" }}>
      
      {/* 1. Wallet Card - #1B4F72 background, balance */}
      <div className="px-4 text-left">
        <div 
          className="bg-[#1B4F72] text-white" 
          style={{ padding: '20px', borderRadius: '16px' }}
          id="wallet-balance-card"
        >
          {/* Greeting & Balance Block */}
          <div className="mb-4 text-left font-sans">
            <h2 className="text-[16px] font-medium text-white/90 mb-1">
              আস-সালামু আলাইকুম {userDoc?.name || currentUser?.displayName ? `${userDoc?.name || currentUser?.displayName} ভাই` : "ভাই"} 👋
            </h2>
            <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.7)' }}>
              আপনার মেম্বার ওয়ালেট (Wallet Balance)
            </p>
            <h3 className="text-[34px] font-semibold leading-none font-sans mt-2 text-white">
              ${walletBalance.toFixed(2)}
              <span className="text-[12px] ml-1.5 font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>USD</span>
            </h3>
          </div>

          {/* Quick Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onServiceSelect("deposit")}
              className="flex items-center justify-center gap-2 cursor-pointer font-sans font-medium select-none text-white hover:bg-white/20 active:scale-95 transition-all outline-none"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '0.5px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                height: '50px',
                flex: 1
              }}
            >
              <CreditCard className="w-5 h-5" />
              <span>ডিপোজিট করুন</span>
            </button>
            <button
              onClick={() => onServiceSelect("transfer")}
              className="flex items-center justify-center gap-2 cursor-pointer font-sans font-medium select-none text-white hover:bg-white/20 active:scale-95 transition-all outline-none"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '0.5px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                height: '50px',
                flex: 1
              }}
            >
              <DollarSign className="w-5 h-5" />
              <span>টাকা পাঠান</span>
            </button>
          </div>

          {/* Custom rates block */}
          <div 
            className="grid grid-cols-3 text-center"
            style={{
              borderTop: '0.5px solid rgba(255,255,255,0.15)',
              paddingTop: '12px',
              marginTop: '16px'
            }}
          >
            <div className="border-r border-white/10">
              <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>bKash রেট</p>
              <p className="text-[12px] font-medium font-sans mt-0.5" style={{ color: '#FFFFFF' }}>{dbRates.bkash.toFixed(2)} BDT</p>
            </div>
            <div className="border-r border-white/10">
              <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>Nagad রেট</p>
              <p className="text-[12px] font-medium font-sans mt-0.5" style={{ color: '#FFFFFF' }}>{dbRates.nagad.toFixed(2)} BDT</p>
            </div>
            <div>
              <p className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>Bank রেট</p>
              <p className="text-[12px] font-medium font-sans mt-0.5" style={{ color: '#FFFFFF' }}>{dbRates.bank.toFixed(2)} BDT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Banner/Ad Card below Wallet Card */}
      <div className="px-4 mb-2">
        <div 
          className="bg-white border text-left flex items-center justify-between"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px',
            padding: '12px 14px'
          }}
        >
          <div className="flex items-center flex-1 mr-3">
            <div 
              className="w-9 h-9 flex items-center justify-center shrink-0 mr-3 animate-bounce"
              style={{
                backgroundColor: '#EBF5FB',
                color: '#1B4F72',
                borderRadius: '10px'
              }}
            >
              <Gift className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-[#1A1A2E] leading-tight font-sans">
                রেফার করুন ও ইনকাম করুন!
              </h4>
              <p className="text-[11px] font-normal text-[#6B7280] mt-0.5 font-sans leading-tight">
                বন্ধুদের সাথে রেফারেল কোড শেয়ার করে প্রতি সফল রেফারেলে $1 বোনাস পান!
              </p>
            </div>
          </div>
          <button
            onClick={() => onServiceSelect("referral")}
            className="shrink-0 px-3 py-1.5 font-sans font-medium text-[11px] text-white hover:bg-opacity-90 transition-all select-none cursor-pointer outline-none"
            style={{
              backgroundColor: '#1B4F72',
              borderRadius: '8px'
            }}
          >
            কোড কপি
          </button>
        </div>
      </div>

      {/* Daily Check-in Card */}
      <div className="px-4 mb-2">
        <div 
          className="bg-white border text-left"
          style={{
            borderColor: '#E5E7EB',
            borderWidth: '0.5px',
            borderRadius: '16px',
            padding: '16px'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 mr-3">
              <div 
                className="w-10 h-10 flex items-center justify-center shrink-0 mr-3"
                style={{
                  backgroundColor: '#E8F8F1',
                  color: '#1D9E75',
                  borderRadius: '12px'
                }}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-[13px] font-semibold text-[#1A1A2E] leading-tight font-sans">
                  দৈনিক ফ্রি বোনাস সংগ্রহ
                </h4>
                <p className="text-[11px] font-normal text-[#6B7280] mt-1 font-sans leading-tight">
                  প্রতি ২৪ ঘণ্টায় প্রবাসী সেবার পক্ষ থেকে $0.05 বোনাস পান ভাই!
                </p>
              </div>
            </div>
            
            {cooldownRemaining ? (
              <div
                className="shrink-0 px-3 py-2 font-sans font-medium text-[11px] text-center border border-gray-200"
                style={{
                  backgroundColor: '#F7F8FA',
                  color: '#6B7280',
                  borderRadius: '10px',
                  minWidth: '85px'
                }}
              >
                <div style={{ fontSize: '9px', color: '#9CA3AF' }} className="mb-0.5">অপেক্ষা করুন</div>
                <div className="font-mono">{cooldownRemaining}</div>
              </div>
            ) : (
              <button
                onClick={handleCollectDailyBonus}
                disabled={claiming}
                className="shrink-0 px-4 py-2 font-sans font-medium text-[12px] text-white hover:bg-opacity-90 active:scale-95 transition-all select-none cursor-pointer outline-none"
                style={{
                  backgroundColor: '#1B4F72',
                  borderRadius: '10px'
                }}
              >
                {claiming ? "লোড হচ্ছে..." : "বোনাস নিন"}
              </button>
            )}
          </div>

          {claimMsg && (
            <div 
              className={`mt-3 p-2.5 rounded-xl text-xs font-sans text-left transition-all ${
                claimMsg.type === "success" 
                  ? "bg-[#E9F7EF] text-[#1D9E75]" 
                  : "bg-[#FDEDEC] text-[#E74C3C]"
              }`}
            >
              {claimMsg.text}
            </div>
          )}
        </div>
      </div>

      {/* 4. SOS Button - Red bordered card, full width, always visible */}
      <div className="px-4">
        <button
          onClick={() => onServiceSelect("emergency")}
          className="w-full flex items-center justify-between bg-white cursor-pointer focus:outline-none"
          style={{
            borderLeft: '4px solid #E74C3C',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: 'none',
            borderTop: '0.5px solid #E5E7EB',
            borderRight: '0.5px solid #E5E7EB',
            borderBottom: '0.5px solid #E5E7EB'
          }}
          id="btn-main-emergency-sos"
        >
          <div className="flex items-center text-left">
            <div 
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: '#FDEDEC',
                color: '#E74C3C',
                borderRadius: '12px'
              }}
            >
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div className="ml-3">
              <h4 className="text-[14px] font-medium text-[#1A1A2E] leading-tight font-sans">
                জরুরি সাহায্য
              </h4>
              <p className="text-[11px] font-normal text-[#E74C3C] mt-0.5 font-sans">
                SOS • ২৪/৭ উপলব্ধ
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#6B7280]" />
        </button>
      </div>

      {/* 4.5 Your Transactions & Deposits Status Section */}
      <div className="px-4 text-left">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[14px] font-medium text-[#1A1A2E] font-sans">
            আপনার লেনদেন ও ডিপোজিট স্ট্যাটাস
          </h4>
          <button 
            onClick={() => onServiceSelect("profile")}
            className="text-[11px] text-[#1B4F72] font-sans font-medium hover:underline"
          >
            সব দেখুন
          </button>
        </div>

        <div className="bg-white border rounded-[16px] p-4 space-y-3" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
          {loadingTransactions ? (
            <div className="py-4 flex flex-col items-center justify-center space-y-1.5">
              <Loader2 className="w-5 h-5 text-[#1B4F72] animate-spin" />
              <p className="text-[11px] text-[#6B7280]">অপেক্ষমান আপডেট লোড হচ্ছে ভাই...</p>
            </div>
          ) : userTransactions.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[12px] text-[#6B7280] leading-relaxed">আপনার অ্যাকাউন্টে এখনও কোন ডিপোজিট বা টাকা পাঠানোর অনুরোধ নেই ভাই।</p>
              <div className="flex gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={() => onServiceSelect("deposit" as any)}
                  className="flex-1 py-2 text-[11px] bg-[#1B4F72] text-white rounded-lg hover:bg-opacity-90 transition-all font-medium cursor-pointer"
                >
                  ডিপোজিট করুন
                </button>
                <button
                  type="button"
                  onClick={() => onServiceSelect("services" as any, "money")}
                  className="flex-1 py-2 text-[11px] border border-[#1B4F72] text-[#1B4F72] rounded-lg hover:bg-gray-50 transition-all font-medium cursor-pointer"
                >
                  টাকা পাঠান
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userTransactions.slice(0, 3).map((tx, idx) => {
                const isDeposit = tx.type === "deposit";
                
                let statusLabel = "";
                let statusColorClass = "";
                
                if (tx.status === "completed") {
                  statusLabel = "সম্পন্ন";
                  statusColorClass = "bg-emerald-50 text-[#1D9E75] border-emerald-100";
                } else if (tx.status === "pending") {
                  statusLabel = "অপেক্ষমান";
                  statusColorClass = "bg-amber-50 text-amber-600 border-amber-100";
                } else if (tx.status === "processing") {
                  statusLabel = "প্রসেসিং";
                  statusColorClass = "bg-blue-50 text-blue-600 border-blue-100";
                } else if (tx.status === "sent") {
                  statusLabel = "পাঠানো হচ্ছে";
                  statusColorClass = "bg-indigo-50 text-indigo-600 border-indigo-100";
                } else {
                  statusLabel = "বাতিল";
                  statusColorClass = "bg-[#FDEDEC] text-[#E74C3C] border-red-100";
                }

                return (
                  <button
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      setTxModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 transition-colors py-2.5 first:pt-0 last:pb-0 outline-none"
                    style={{ border: "none" }}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDeposit ? "bg-[#EBF5FB]" : "bg-[#E8F8F1]"}`}>
                        {isDeposit ? (
                          <CreditCard className="w-4 h-4 text-[#1B6CA8]" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-[#0F6E56]" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-[13px] font-medium text-[#1A1A2E] leading-tight font-sans">
                          {isDeposit ? "ডলার ডিপোজিট" : `টাকা পাঠানো (${tx.recipientName || "প্রবাসী"})`}
                        </h4>
                        <p className="text-[10px] text-[#6B7280] font-sans mt-0.5">
                          {tx.methodName || "MFS"} • ID: <span className="font-mono">{tx.id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[13px] font-medium font-sans">
                        ${tx.amountUsd.toFixed(2)} USD
                      </span>
                      {tx.amountBdt > 0 && (
                        <span className="text-[10px] text-[#6B7280] font-sans">
                          ≈ {tx.amountBdt.toLocaleString()} BDT
                        </span>
                      )}
                      <span className={`text-[9px] font-semibold border px-1.5 py-0.5 rounded-lg mt-1 font-sans ${statusColorClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Services Grid - 2 column grid of white cards, same style */}
      <div className="px-4 text-left">
        <div className="flex items-center justify-between mb-2 text-left">
          <h4 className="text-[14px] font-medium text-[#1A1A2E] font-sans">
            আমাদের সেবাসমূহ (Our Services)
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pb-1">
          {gridServices.map((service) => {
            const Icon = service.icon;
            
            // Map individual service container bg and icon text color
            let cardBg = "#F0F3F4";
            let iconClr = "#444441";
            
            if (service.id === "visa") {
              cardBg = "#EBF5FB";
              iconClr = "#1B6CA8";
            } else if (service.id === "money") {
              cardBg = "#E8F8F1";
              iconClr = "#0F6E56";
            } else if (service.id === "ticket") {
              cardBg = "#EEF2FF";
              iconClr = "#534AB7";
            } else if (service.id === "ai_chat") {
              cardBg = "#FDF2E9";
              iconClr = "#D68910";
            } else if (service.id === "scam") {
              cardBg = "#FDEDEC";
              iconClr = "#C0392B";
            } else if (service.id === "job") {
              cardBg = "#F0F3F4";
              iconClr = "#444441";
            } else if (service.id === "referral") {
              cardBg = "#EBF5FB";
              iconClr = "#1A5276";
            }

            return (
              <button
                key={service.id}
                onClick={service.action}
                className="bg-white hover:bg-gray-50 flex items-center text-left cursor-pointer select-none border border-[#E5E7EB] active:scale-98 transition-all outline-none"
                style={{
                  borderRadius: '14px',
                  borderWidth: '0.5px',
                  padding: '12px 14px'
                }}
                id={`btn-service-${service.id}`}
              >
                {/* Icon container: 40x40px, border-radius 12px */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-3" 
                  style={{ backgroundColor: cardBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: iconClr }} />
                </div>
                
                {/* Name */}
                <span className="text-[13px] font-medium text-[#1A1A2E] font-sans leading-tight">
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. News/Updates: List of clean white cards with category tags */}
      <div className="px-4 text-left">
        <h4 className="text-[14px] font-medium text-[#1A1A2E] font-sans mb-3 text-left">
          সর্বশেষ আপডেট ও বিজ্ঞপ্তি
        </h4>
        
        <div className="space-y-4">
          {currentNewsList.slice(0, 3).map((item) => {
            // Map category colors
            let categoryBg = "#EBF5FB";
            let categoryText = "#1B6CA8";

            if (item.tag?.includes("স্ক্যাম") || item.tag?.includes("সতর্কতা")) {
              categoryBg = "#FDEDEC";
              categoryText = "#C0392B";
            } else if (item.tag?.includes("টিকেট") || item.tag?.includes("ভ্রমণ")) {
              categoryBg = "#EEF2FF";
              categoryText = "#534AB7";
            } else if (item.tag?.includes("চাকরি") || item.tag?.includes("কাজ")) {
              categoryBg = "#F0F3F4";
              categoryText = "#444441";
            } else if (item.tag?.includes("ভিসা")) {
              categoryBg = "#EBF5FB";
              categoryText = "#1B6CA8";
            } else {
              categoryBg = "#E8F8F1";
              categoryText = "#0F6E56";
            }

            return (
              <div 
                key={item.id}
                className="bg-white border text-left p-4" 
                style={{
                  borderRadius: '14px',
                  borderColor: '#E5E7EB',
                  borderWidth: '0.5px'
                }}
              >
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <span 
                    className="inline-block font-sans font-medium text-[10px] px-2.5 py-0.5 rounded-[20px]"
                    style={{ backgroundColor: categoryBg, color: categoryText }}
                  >
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-[#6B7280] font-sans font-normal">
                    {item.date}
                  </span>
                </div>
                <h4 className="text-[13px] font-medium text-[#1A1A2E] leading-snug font-sans mb-1">
                  {item.title}
                </h4>
                <p className="text-[12px] text-[#6B7280] leading-relaxed font-sans font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgent Pop-up Alert Modal overlay for Migrant Workers */}
      {alertOpen && activeAlert && (
        <div id="urgent-popup-alert-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
          <div 
            className="bg-white rounded-[16px] max-w-sm w-full border border-[#E5E7EB] p-5 text-left flex flex-col font-sans relative shadow-md transform transition-all scale-100"
            style={{ borderWidth: '0.5px' }}
          >
            {/* Alert Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FDEDEC] flex items-center justify-center text-[#E74C3C] shrink-0">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
              </div>
              <span 
                className="inline-block text-[11px] px-2.5 py-0.5 rounded-[20px] font-medium"
                style={{ backgroundColor: '#FDEDEC', color: '#C0392B' }}
              >
                {activeAlert.tag}
              </span>
            </div>

            {/* Alert Title */}
            <h4 className="text-[15px] font-medium text-[#1A1A2E] leading-snug mb-2 font-sans">
              {activeAlert.title}
            </h4>

            {/* Alert Body */}
            <p className="text-[13px] text-[#6B7280] leading-relaxed font-sans font-normal mb-5 flex-1" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              {activeAlert.desc}
            </p>

            {/* Prominent Close Button */}
            <button
              onClick={handleCloseAlert}
              className="w-full h-[46px] flex items-center justify-center text-white cursor-pointer select-none outline-none font-sans font-medium hover:bg-[#153e5a] active:scale-95 transition-all"
              style={{
                backgroundColor: '#1B4F72',
                borderRadius: '12px',
                fontSize: '14px'
              }}
              id="btn-close-urgent-popup-alert"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {txModalOpen && selectedTx && (
        <div id="txn-details-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div 
            className="bg-white rounded-[16px] max-w-sm w-full border border-[#E5E7EB] p-5 text-left flex flex-col font-sans relative shadow-md transform transition-all scale-100"
            style={{ borderWidth: '0.5px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "#E5E7EB", borderBottomWidth: "0.5px" }}>
              <div className="flex items-center gap-2">
                <span className="text-[15px]">{selectedTx.type === "deposit" ? "🏦" : "💸"}</span>
                <span className="text-[13px] font-medium text-[#1B4F72] font-sans">
                  {selectedTx.type === "deposit" ? "ডিপোজিট বিবরণী" : "টাকা পাঠানোর বিবরণী"}
                </span>
              </div>
              <button 
                onClick={() => setTxModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Layout Box */}
            <div className="space-y-3.5 mb-5 select-text text-left font-sans">
              <div className="flex justify-between items-center bg-[#F7F8FA] p-3 rounded-xl border border-gray-100 text-[11px]">
                <div>
                  <p className="text-[10px] text-[#6B7280]">লেনদেন আইডি (ID):</p>
                  <p className="font-semibold text-gray-800 font-mono mt-0.5">{selectedTx.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#6B7280]">সময় ও তারিখ:</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString("bn-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "আজ"}
                  </p>
                </div>
              </div>

              {/* Status Section */}
              <div className="border border-gray-100 bg-gray-50/50 p-3.5 rounded-xl text-[11px] space-y-2">
                <p className="font-medium text-[#1B4F72]">বর্তমান অবস্থা (Status):</p>
                
                {selectedTx.status === "pending" && (
                  <div className="flex items-start gap-2 text-[#7F5A00] bg-[#FEF9E7] p-2.5 rounded-lg border border-[#F9E79F]/60">
                    <Clock className="w-5 h-5 shrink-0 animate-pulse text-[#D68910]" />
                    <p className="leading-snug">
                      <strong>অপেক্ষমান:</strong> আপনার পেমেন্টটি আমাদের টিম ৫-১৫ মিনিটের মধ্যে ম্যানুয়ালি ভেরিফাই করে অ্যাপ্রুভ করবে ভাই। দয়া করে অপেক্ষা করুন!
                    </p>
                  </div>
                )}

                {selectedTx.status === "processing" && (
                  <div className="flex items-start gap-2 text-blue-900 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                    <RefreshCw className="w-5 h-5 shrink-0 animate-spin text-blue-600" />
                    <p className="leading-snug">
                      <strong>প্রসেসিং:</strong> আপনার লেনদেনের তথ্য ইমিগ্রেশন ও ব্যাংক চ্যানেলে সাবমিট করা হয়েছে ভাই। খুব দ্রুত বাটন চাপলেই সম্পন্ন হবে।
                    </p>
                  </div>
                )}

                {selectedTx.status === "sent" && (
                  <div className="flex items-start gap-2 text-[#1F3A52] bg-blue-50 p-2.5 rounded-lg border border-[#CFD8DC]">
                    <DollarSign className="w-5 h-5 shrink-0 text-[#1B4F72]" />
                    <p className="leading-snug text-xs">
                      <strong>পাঠানো হচ্ছে:</strong> বাংলাদেশে বিকাশ/নগদ/রকেট মোবাইল নাম্বারে টাকা পৌঁছানোর প্রক্রিয়া সচল রয়েছে ভাই।
                    </p>
                  </div>
                )}

                {selectedTx.status === "completed" && (
                  <div className="flex items-start gap-2 text-[#0F6E56] bg-[#E8F8F1] p-2.5 rounded-lg border border-[#1D9E75]/35">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#1D9E75]" />
                    <p className="leading-snug">
                      <strong>সম্পন্ন হয়েছে:</strong> আলহামদুলিল্লাহ ভাই! লেনদেনটি সফলভাবে সম্পন্ন হয়েছে এবং ব্যালেন্স যোগ হয়েছে বা টাকা পৌঁছে গেছে।
                    </p>
                  </div>
                )}

                {(selectedTx.status === "cancelled" || selectedTx.status === "failed") && (
                  <div className="flex items-start gap-2 text-[#922B21] bg-[#FDEDEC] p-2.5 rounded-lg border border-[#E74C3C]/35">
                    <X className="w-5 h-5 shrink-0 text-[#E74C3C]" />
                    <div className="leading-snug">
                      <p><strong>লেনদেনটি বাতিল করা হয়েছে ভাই।</strong></p>
                      {selectedTx.rejectReason && (
                        <p className="mt-1 font-sans text-[11px] text-[#C0392B]"><strong>বাতিলের কারণ:</strong> {selectedTx.rejectReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sender & Recipient brief */}
              <div className="bg-[#F8F9FA] rounded-xl p-3.5 border border-gray-100 font-sans text-[11px] space-y-1.5 text-gray-700">
                <div className="flex justify-between">
                  <span>লেনদেনের মাধ্যম:</span>
                  <span className="font-semibold text-[#1A1A2E]">{selectedTx.methodName || "ওয়ালেট ব্যালেন্স"}</span>
                </div>
                
                {selectedTx.type === "deposit" ? (
                  <div className="flex justify-between font-sans">
                    <span>Transaction ID:</span>
                    <span className="font-semibold text-[#1A1A2E] font-mono">{selectedTx.recipientNumber}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between font-sans">
                      <span>প্রাপকের নাম:</span>
                      <span className="font-semibold text-[#1A1A2E]">{selectedTx.recipientName}</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span>প্রাপকের অ্যাকাউন্ট/নম্বর:</span>
                      <span className="font-semibold text-[#1A1A2E] font-mono">{selectedTx.recipientNumber}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200/60 my-2 pt-2 flex justify-between font-sans">
                  <span className="font-medium text-[#1A1A2E]">ডলারের পরিমাণ:</span>
                  <span className="font-bold text-[#1B4F72]">${selectedTx.amountUsd.toFixed(2)} USD</span>
                </div>

                {selectedTx.amountBdt > 0 && (
                  <div className="flex justify-between text-[11px] font-semibold text-[#1D9E75] font-sans">
                    <span>বাংলাদেশে প্রাপক পাবেন:</span>
                    <span>৳ {selectedTx.amountBdt.toLocaleString()} BDT</span>
                  </div>
                )}
              </div>

              {/* Receipt screenshot if uploaded/proof available */}
              {selectedTx.proofImageUrl && (
                <div className="space-y-1.5 text-[11px] font-sans">
                  <span className="text-[11px] font-medium text-[#6B7280]">অফিসিয়াল ট্রানজেকশন প্রুফ:</span>
                  <div className="border border-gray-200 rounded-xl p-1 bg-gray-50 flex items-center justify-center">
                    <img 
                      src={selectedTx.proofImageUrl} 
                      alt="Transaction Proof" 
                      className="max-h-[140px] rounded object-contain w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={() => setTxModalOpen(false)}
              className="w-full h-11 flex items-center justify-center text-white cursor-pointer select-none font-sans font-medium hover:bg-[#153e5a] active:scale-95 transition-all outline-none"
              style={{
                backgroundColor: '#1B4F72',
                borderRadius: '12px',
                fontSize: '13px'
              }}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
