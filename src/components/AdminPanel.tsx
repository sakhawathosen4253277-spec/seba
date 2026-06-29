import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { seedDatabaseIfNeeded, seedPaymentMethodsIfNeeded } from "../lib/seed";
import probashiLogo from "../assets/images/probashi_logo_1782647533324.jpg";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp
} from "firebase/firestore";
import { 
  ShieldAlert, 
  Lock, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Edit2, 
  Smartphone,
  Tag, 
  MapPin, 
  Briefcase, 
  AlertCircle,
  Plane,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";

export default function AdminPanel() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Tabs state
  const [activeTab, setActiveTab] = useState<string>("news");
  const [loading, setLoading] = useState<boolean>(false);
  const [resettingDb, setResettingDb] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Registered Users management
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const [editingUserBalanceId, setEditingUserBalanceId] = useState<string | null>(null);
  const [editingUserBalanceValue, setEditingUserBalanceValue] = useState<string>("");

  // User history view states
  const [viewingUserHistory, setViewingUserHistory] = useState<any | null>(null);
  const [userHistoryDeposits, setUserHistoryDeposits] = useState<any[]>([]);
  const [userHistoryTransfers, setUserHistoryTransfers] = useState<any[]>([]);
  const [loadingUserHistory, setLoadingUserHistory] = useState(false);

  // Collections Data States
  const [news, setNews] = useState<any[]>([]);
  const [ticker, setTicker] = useState<any[]>([]);
  const [exchange, setExchange] = useState<any>({ bkash: 110.50, nagad: 110.60, rocket: 110.70, bank: 110.80, usdRate: 110.80 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [employerDeposits, setEmployerDeposits] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [jobSubTab, setJobSubTab] = useState<"verify_employers" | "employers" | "jobs" | "applications">("verify_employers");
  const [actioningEmployerId, setActioningEmployerId] = useState<string | null>(null);
  const [inlineActionType, setInlineActionType] = useState<"reject" | "forfeit" | null>(null);
  const [inlineNoteText, setInlineNoteText] = useState<string>("");
  const [scams, setScams] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [emergency, setEmergency] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [passwordResets, setPasswordResets] = useState<any[]>([]);
  const [resetPasswordsInputs, setResetPasswordsInputs] = useState<{[key: string]: string}>({});
  const [paymentMethodsList, setPaymentMethodsList] = useState<any[]>([]);
  const [depositSubTab, setDepositSubTab] = useState<"requests" | "methods">("requests");

  // Money Transfer States
  const [transferRequests, setTransferRequests] = useState<any[]>([]);
  const [transferSubTab, setTransferSubTab] = useState<"new" | "processing" | "completed">("new");
  
  // Custom dialogs & modals states
  const [verifyingDeposit, setVerifyingDeposit] = useState<any | null>(null);
  const [verifyAmountInput, setVerifyAmountInput] = useState<string>("");

  const [selectedCompletedTransfer, setSelectedCompletedTransfer] = useState<any | null>(null);
  const [proofSentImageCode, setProofSentImageCode] = useState<string>("");
  const [proofSentImageName, setProofSentImageName] = useState<string>("");
  const [minutesDuration, setMinutesDuration] = useState<string>("10");
  const [confirmationDigits, setConfirmationDigits] = useState<string>("");

  const [selectedRejectTransfer, setSelectedRejectTransfer] = useState<any | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState<string>("");

  // Viewing screenshots big modal
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Reviews management
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  // Form states for deposit and payment methods
  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodCountry, setNewMethodCountry] = useState<"BD" | "KH">("BD");
  const [newMethodColor, setNewMethodColor] = useState("#1B4F72");
  const [newMethodAccount, setNewMethodAccount] = useState("");

  // Maintenance Settings State
  const [maintenanceSettings, setMaintenanceSettings] = useState<any>({
    globalMaintenance: false,
    maintenanceMessage: "সাময়িক রক্ষণাবেক্ষণ চলছে। শীঘ্রই ফিরে আসব।",
    services: {
      deposit: { active: true, message: "" },
      transfer: { active: true, message: "" },
      visa: { active: true, message: "" },
      ticket: { active: true, message: "" },
      jobs: { active: true, message: "" },
      scam: { active: true, message: "" },
      emergency: { active: true, message: "" }
    }
  });

  // Fee settings state
  const [feeSettings, setFeeSettings] = useState<any>({
    transferFeePercent: 2,
    transferFeeFixed: 0,
    minimumTransfer: 1,
    maximumTransfer: 1000,
    firstTransferFree: true
  });

  // Referral settings state
  const [referralSettings, setReferralSettings] = useState<any>({
    referralSystemEnabled: true,
    referralBonusAmount: 1,
    referralMinTransfer: 100, // Updated default to 100
    prizeAnnouncement: "এই মাসের সেরা ৩ রেফারার পাবেন আকর্ষণীয় পুরস্কার! 🎁",
    signupBonusAmount: 2,
    noCodeBonusEnabled: true,
    noCodeBonusAmount: 2,
    dailyClaimAmount: 0.05,
    dailyMinWithdraw: 10
  });

  // Transfer time settings state
  const [transferSettings, setTransferSettings] = useState<any>({
    minTime: 5,
    maxTime: 120,
    timeDisplay: "৫ মিনিট থেকে ২ ঘণ্টার মধ্যে"
  });

  // Popup ad banner state
  const [adBannerSettings, setAdBannerSettings] = useState<any>({
    isActive: false,
    imageBase64: "",
    duration: 10,
    maxViewsPerDay: 3
  });

  // Blocked users settings state
  const [blockSettings, setBlockSettings] = useState<any>({
    blockMessage: "আপনার অ্যাকাউন্টটি সাময়িকভাবে ব্লক বা সাসপেন্ড করা হয়েছে ভাই। অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।",
    blockWhatsapp: "+855964898625"
  });

  // Home Alerts states
  const [homeAlertsList, setHomeAlertsList] = useState<any[]>([]);
  const [newHomeAlert, setNewHomeAlert] = useState({
    title: "",
    description: "",
    tag: "সতর্কতা",
    duration: 10,
    isActive: true,
    order: 1
  });

  // Form states for adding items
  const [newNews, setNewNews] = useState({ title: "", tag: "ভিসا", description: "" });
  const [newTicker, setNewTicker] = useState({ message: "", order: 1 });
  const [newContact, setNewContact] = useState({ name: "", phone: "", category: "জরুরি", order: 1, description: "" });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState<string>("");

  useEffect(() => {
    // Check initial login status and lockout
    const lockUntilText = localStorage.getItem("adminLockUntil");
    if (lockUntilText) {
      const lockUntil = parseInt(lockUntilText, 10);
      if (Date.now() < lockUntil) {
        setLoginError("৩ বার ভুল পাসওয়ার্ড দিয়েছেন। ৩০ মিনিট পর চেষ্টা করুন।");
      }
    }

    const isLogged = localStorage.getItem("isAdminLogged") === "true";
    const lastActive = localStorage.getItem("adminLastActivity");
    const now = Date.now();

    if (isLogged && lastActive) {
      const inactiveMs = now - parseInt(lastActive, 10);
      if (inactiveMs > 2 * 60 * 60 * 1000) { // 2 hours
        localStorage.removeItem("isAdminLogged");
        localStorage.removeItem("adminLoginTime");
        localStorage.removeItem("adminLastActivity");
        setIsAdminLoggedIn(false);
      } else {
        localStorage.setItem("adminLastActivity", now.toString());
        setIsAdminLoggedIn(true);
      }
    }
  }, []);

  // Track user activity & expire session after 2 hours of inactivity
  useEffect(() => {
    if (isAdminLoggedIn) {
      const checkSession = () => {
        const lastActive = localStorage.getItem("adminLastActivity");
        const now = Date.now();
        if (lastActive) {
          const inactiveMs = now - parseInt(lastActive, 10);
          if (inactiveMs > 2 * 60 * 60 * 1000) { // 2 hours
            handleLogout();
            alert("সেশন শেষ হয়ে গেছে ভাই। আবার লগইন করুন।");
          }
        }
      };

      localStorage.setItem("adminLastActivity", Date.now().toString());
      const interval = setInterval(checkSession, 10000); // Check every 10 seconds

      const updateActivity = () => {
        localStorage.setItem("adminLastActivity", Date.now().toString());
      };

      window.addEventListener("mousemove", updateActivity);
      window.addEventListener("keydown", updateActivity);
      window.addEventListener("click", updateActivity);

      return () => {
        clearInterval(interval);
        window.removeEventListener("mousemove", updateActivity);
        window.removeEventListener("keydown", updateActivity);
        window.removeEventListener("click", updateActivity);
      };
    }
  }, [isAdminLoggedIn]);

  // Fetch initial badge count data of Dep, Transfer & Password Resets pending on Logged state
  useEffect(() => {
    if (isAdminLoggedIn) {
      const fetchCounts = async () => {
        try {
          const qDep = query(collection(db, "depositRequests"), where("status", "==", "pending"));
          const snapshotDep = await getDocs(qDep);
          setDepositRequests(snapshotDep.docs.map(d => ({ id: d.id, ...d.data() })));

          const qTrans = query(collection(db, "transferRequests"), where("status", "==", "pending"));
          const snapshotTrans = await getDocs(qTrans);
          setTransferRequests(snapshotTrans.docs.map(d => ({ id: d.id, ...d.data() })));

          const qResets = query(collection(db, "passwordResets"), where("status", "==", "pending"));
          const snapshotResets = await getDocs(qResets);
          setPasswordResets(snapshotResets.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
          console.error("Error loading pending counts:", e);
        }
      };
      fetchCounts();
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchTabData(activeTab);
    }
  }, [isAdminLoggedIn, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    
    // Check lockout period
    const lockUntilText = localStorage.getItem("adminLockUntil");
    if (lockUntilText) {
      const lockUntil = parseInt(lockUntilText, 10);
      if (now < lockUntil) {
        setLoginError("৩ বার ভুল পাসওয়ার্ড দিয়েছেন। ৩০ মিনিট পর চেষ্টা করুন।");
        return;
      }
    }

    if (passwordInput === "PS@Admin#2024!Secure") {
      localStorage.setItem("isAdminLogged", "true");
      localStorage.setItem("adminLoginTime", now.toString());
      localStorage.setItem("adminLastActivity", now.toString());
      localStorage.removeItem("adminAttempts");
      localStorage.removeItem("adminLockUntil");
      setIsAdminLoggedIn(true);
      setLoginError("");
    } else {
      const currentAttempts = parseInt(localStorage.getItem("adminAttempts") || "0", 10) + 1;
      localStorage.setItem("adminAttempts", currentAttempts.toString());
      if (currentAttempts >= 3) {
        const lockDuration = 30 * 60 * 1000; // 30 mins
        localStorage.setItem("adminLockUntil", (now + lockDuration).toString());
        setLoginError("৩ বার ভুল পাসওয়ার্ড দিয়েছেন। ৩০ মিনিট পর চেষ্টা করুন।");
      } else {
        setLoginError(`পাসওয়ার্ড ভুল হয়েছে। আপনি ${currentAttempts}/৩ বার চেষ্টা করেছেন।`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLogged");
    localStorage.removeItem("adminLoginTime");
    localStorage.removeItem("adminLastActivity");
    setIsAdminLoggedIn(false);
  };

  const handleResetAllUsersAndData = async () => {
    const confirmation = window.confirm(
      "সাবধান ভাই!\n\nআপনি কি নিশ্চিত যে ডাটাবেজ থেকে সমস্ত ইউজার ডাটা ডিলিট করতে চান?\n\nএর ফলে সমস্ত নিবন্ধিত ইউজার প্রোফাইল, সমস্ত ডিপোজিট পেমেন্ট, টাকা পাঠানোর ট্রান্সফার রিকোয়েস্ট, স্ক্যাম রিপোর্ট এবং টিকেট রিকোয়েস্ট চিরতরে মুছে যাবে।\n\n(কিন্তু এক্সচেঞ্জ রেট, জরুরি কন্টাক্ট, পেমেন্ট গেটওয়ে এবং নিউজ নোটিশগুলো পুনরায় সেট করা থাকবে)।"
    );
    if (!confirmation) return;

    const secondConfirm = window.confirm(
      "আপনার সমস্ত ইউজার ডাটা মুছে যাবে! আপনি কি ১০০% নিশ্চিত ভাই?"
    );
    if (!secondConfirm) return;

    setResettingDb(true);
    setLoading(true);
    showStatusMsg("ডাটাবেজ সাফ করা শুরু হয়েছে, দয়া করে অপেক্ষা করুন...", false);

    try {
      // Helper function to delete a collection by fetching docs in batches/all
      const deleteCollectionDocs = async (collectionName: string) => {
        try {
          const snap = await getDocs(collection(db, collectionName));
          const deletePromises = snap.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
          await Promise.all(deletePromises);
          console.log(`Deleted all documents in collection: ${collectionName}`);
        } catch (err) {
          console.error(`Error deleting collection ${collectionName}:`, err);
        }
      };

      // Delete user specifics
      await deleteCollectionDocs("users");
      await deleteCollectionDocs("depositRequests");
      await deleteCollectionDocs("transferRequests");
      await deleteCollectionDocs("scamReports");
      await deleteCollectionDocs("ticketRequests");
      await deleteCollectionDocs("notifications");

      // Re-run references seeding so they are preserved
      showStatusMsg("ইউজার ডাটা ডিলিট হয়েছে। এবার বেসিক সিস্টেম ডাটা রি-সিড (re-seed) করা হচ্ছে...", false);
      await seedDatabaseIfNeeded();
      await seedPaymentMethodsIfNeeded();

      showStatusMsg("আলহামদুলিল্লাহ ভাই! সমস্ত ইউজার ডাটা ডিলিট এবং রিসেট সম্পন্ন হয়েছে। 🎉", false);
      
      // Update local states so Admin Panel UI updates immediately
      setUsersList([]);
      setDepositRequests([]);
      setTransferRequests([]);
      setScams([]);
      setTickets([]);
    } catch (err) {
      console.error("Database reset failed:", err);
      showStatusMsg("ডাটাবেজ রিসেট করতে কোনো সমস্যা হয়েছে ভাই। দয়া করে আবার চেষ্টা করুন।", true);
    } finally {
      setResettingDb(false);
      setLoading(false);
    }
  };

  const handleTogglePublishReview = async (reviewId: string, currentPublished: boolean) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        published: !currentPublished
      });
      showStatusMsg("রিভিউ স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে ভাই!");
      fetchTabData("reviews");
    } catch (err) {
      console.error("Error toggling review publish:", err);
      showStatusMsg("স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান ভাই?")) return;
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      showStatusMsg("রিভিউটি সফলভাবে মুছে ফেলা হয়েছে ভাই!");
      fetchTabData("reviews");
    } catch (err) {
      console.error("Error deleting review:", err);
      showStatusMsg("রিভিউ মুছতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleAdminResetUserPassword = async (requestId: string, identifier: string, newPassword: string, whatsappNumber: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert("পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে ভাই!");
      return;
    }
    
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে এই ব্যবহারকারীর (${identifier}) পাসওয়ার্ড পরিবর্তন করতে চান? এটি করার পর তাকে হোয়াটসঅ্যাপে (${whatsappNumber}) মেসেজ দেওয়ার লিংক দেওয়া হবে ভাই।`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/admin/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        alert("ভুল হয়েছে: " + (data.error || "পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ ভাই।"));
        return;
      }
      
      // Update status of password reset request in Firestore
      await updateDoc(doc(db, "passwordResets", requestId), {
        status: "completed",
        resolvedAt: new Date().toISOString(),
        assignedPassword: newPassword
      });
      
      alert("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে ভাই!");
      
      // Open WhatsApp prefilled message
      const cleanWhatsApp = whatsappNumber.replace(/\+/g, '').replace(/\s+/g, '').replace(/-/g, '');
      const message = encodeURIComponent(`সালাম ভাই, প্রবাসী সেবা অ্যাপে আপনার পাসওয়ার্ড পুনরুদ্ধারের অনুরোধটি সম্পন্ন হয়েছে। আপনার নতুন পাসওয়ার্ড হলো: ${newPassword}\n\nদয়া করে এই নতুন পাসওয়ার্ড দিয়ে লগইন করুন। ধন্যবাদ!`);
      const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${message}`;
      window.open(whatsappUrl, "_blank");
      
      fetchTabData("passwordResets");
    } catch (err: any) {
      console.error("Error resetting user password from admin:", err);
      alert("পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে ভাই: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectResetRequest = async (requestId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই অনুরোধটি বাতিল করতে চান?")) {
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "passwordResets", requestId), {
        status: "rejected",
        resolvedAt: new Date().toISOString()
      });
      alert("অনুরোধটি বাতিল করা হয়েছে ভাই।");
      fetchTabData("passwordResets");
    } catch (err: any) {
      console.error("Error rejecting reset request:", err);
      alert("সমস্যা হয়েছে ভাই: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showStatusMsg = (text: string, isError: boolean = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchTabData = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === "news") {
        const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setNews(list);
      } else if (tab === "ticker") {
        const q = query(collection(db, "ticker"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTicker(list);
      } else if (tab === "exchange") {
        const docRef = doc(db, "exchangeRates", "current");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setExchange(docSnap.data());
        }
      } else if (tab === "jobs") {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setJobs(list);

        const qEmp = query(collection(db, "employers"), orderBy("createdAt", "desc"));
        const snapshotEmp = await getDocs(qEmp);
        const listEmp = snapshotEmp.docs.map(d => ({ id: d.id, ...d.data() }));
        setEmployers(listEmp);

        const qDep = collection(db, "employerDeposits");
        const snapshotDep = await getDocs(qDep);
        const listDep = snapshotDep.docs.map(d => ({ id: d.id, ...d.data() }));
        setEmployerDeposits(listDep);

        const qApp = query(collection(db, "jobApplications"), orderBy("createdAt", "desc"));
        const snapshotApp = await getDocs(qApp);
        const listApp = snapshotApp.docs.map(d => ({ id: d.id, ...d.data() }));
        setJobApplications(listApp);
      } else if (tab === "scams") {
        const q = query(collection(db, "scamReports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setScams(list);
      } else if (tab === "tickets") {
        const q = query(collection(db, "ticketRequests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTickets(list);
      } else if (tab === "emergency") {
        const q = query(collection(db, "emergencyContacts"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setEmergency(list);
      } else if (tab === "deposit") {
        const q = query(collection(db, "depositRequests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setDepositRequests(list);

        const snapM = await getDocs(collection(db, "paymentMethods"));
        const listM = snapM.docs.map(d => ({ id: d.id, ...d.data() }));
        listM.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setPaymentMethodsList(listM);
      } else if (tab === "transfer") {
        const q = query(collection(db, "transferRequests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTransferRequests(list);
      } else if (tab === "users") {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setUsersList(list);

        const blockSnap = await getDoc(doc(db, "settings", "blockSettings"));
        if (blockSnap.exists()) {
          setBlockSettings(blockSnap.data());
        }
      } else if (tab === "passwordResets") {
        const q = query(collection(db, "passwordResets"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setPasswordResets(list);
      } else if (tab === "maintenance") {
        const docRef = doc(db, "maintenanceMode", "settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMaintenanceSettings(docSnap.data());
        }
      } else if (tab === "fees") {
        const docRef = doc(db, "settings", "fees");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFeeSettings(docSnap.data());
        }
        const transRef = doc(db, "settings", "transfer");
        const transSnap = await getDoc(transRef);
        if (transSnap.exists()) {
          setTransferSettings(transSnap.data());
        }
      } else if (tab === "alerts") {
        const q = query(collection(db, "homeAlerts"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const ordA = a.order !== undefined ? Number(a.order) : 999;
          const ordB = b.order !== undefined ? Number(b.order) : 999;
          return ordA - ordB;
        });
        setHomeAlertsList(list);
      } else if (tab === "ad_banner") {
        const docRef = doc(db, "settings", "adBanner");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdBannerSettings({
            isActive: false,
            imageBase64: "",
            duration: 10,
            maxViewsPerDay: 3,
            ...docSnap.data()
          });
        }
      } else if (tab === "referral") {
        const docRef = doc(db, "settings", "referral");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReferralSettings({
            dailyClaimAmount: 0.05,
            dailyMinWithdraw: 10,
            ...docSnap.data()
          });
        }
      } else if (tab === "reviews") {
        const q = query(collection(db, "reviews"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
          const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
          return dateB - dateA;
        });
        setReviews(list);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, tab);
      showStatusMsg("ডাটা আনতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।", true);
    } finally {
      setLoading(false);
    }
  };

  const getMinutesAgoText = (createdAtStr?: string) => {
    if (!createdAtStr) return "কিছুক্ষণ আগে";
    try {
      const diffMs = Date.now() - new Date(createdAtStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "এইমাত্র";
      if (diffMins < 60) return `${diffMins} মিনিট আগে`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} দিন আগে`;
    } catch (e) {
      return "কিছুক্ষণ আগে";
    }
  };

  // --- ACTIONS ---
  const callApiFallback = async (url: string, method: string, data?: any) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined
      });
      return response.ok;
    } catch (e) {
      console.error("API Fallback failed for " + url, e);
      return false;
    }
  };

  // MAINTENANCE TAB SAVE ACTION
  const handleSaveMaintenanceSettings = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "maintenanceMode", "settings"), maintenanceSettings);
      showStatusMsg("মেইনটেন্যান্স সেটিংস সফলভাবে আপডেট করা হয়েছে ভাই! 👍", false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "maintenanceMode");
      showStatusMsg("মেইনটেন্যান্স সেটিংস সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন ভাই।", true);
    } finally {
      setLoading(false);
    }
  };

  // REFERRAL TAB SAVE ACTION
  const handleSaveReferralSettings = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "referral"), referralSettings, { merge: true });
      showStatusMsg("রেফারেল সেটিংস সফলভাবে সেভ করা হয়েছে ভাই! 🎉", false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/referral");
      showStatusMsg("রেফারেল সেটিংস সেভ করতে সমস্যা হয়েছে ভাই!", true);
    } finally {
      setLoading(false);
    }
  };

  // AD BANNER TAB SAVE & UPLOAD ACTIONS
  const handleSaveAdBannerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "adBanner"), adBannerSettings, { merge: true });
      showStatusMsg("পপআপ ব্যানার সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে ভাই! 📢", false);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, "settings/adBanner");
      showStatusMsg("ব্যানার সেটিংস সেভ করতে সমস্যা হয়েছে ভাই!", true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showStatusMsg("ছবি প্রসেস করা হচ্ছে ভাই, দয়া করে অপেক্ষা করুন...", false);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const max_size = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
            
            setAdBannerSettings((prev: any) => ({
              ...prev,
              imageBase64: compressedBase64
            }));
            showStatusMsg("ছবি সফলভাবে সাইজ ও কম্প্রেস করা হয়েছে! নিচে সেভ করুন বাটনে চাপুন ভাই।", false);
          } else {
            setAdBannerSettings((prev: any) => ({
              ...prev,
              imageBase64: event.target?.result as string
            }));
            showStatusMsg("ছবি আপলোড সম্পন্ন হয়েছে! নিচে সেভ করুন বাটনে চাপুন।", false);
          }
        };
        img.onerror = () => {
          showStatusMsg("ছবি প্রসেস করতে সমস্যা হয়েছে ভাই!", true);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // NEWS TAB
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.description) {
      showStatusMsg("সবগুলো ঘর পূরণ করুন ভাই!", true);
      return;
    }
    const path = "news";
    const newsId = `news_${Date.now()}`;
    const newsData = {
      id: newsId,
      title: newNews.title,
      tag: newNews.tag,
      description: newNews.description,
      date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, path, newsId), newsData);
      setNewNews({ title: "", tag: "ভিসা", description: "" });
      showStatusMsg("নতুন নোটিফিকেশন খবর সফলভাবে যুক্ত হয়েছে!");
      fetchTabData("news");
    } catch (err) {
      console.warn("Client setDoc failed, attempting API server fallback:", err);
      const ok = await callApiFallback("/api/admin/news", "POST", newsData);
      if (ok) {
        setNewNews({ title: "", tag: "ভিসা", description: "" });
        showStatusMsg("নতুন নোটিফিকেশন খবর সফলভাবে যুক্ত হয়েছে!");
        fetchTabData("news");
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
        showStatusMsg("খবর যুক্ত করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।", true);
      }
    }
  };

  const handleToggleNews = async (item: any) => {
    const path = `news/${item.id}`;
    const updateData = { isActive: !item.isActive };
    try {
      await updateDoc(doc(db, "news", item.id), updateData);
      showStatusMsg("খবরের স্থিতি পরিবর্তন করা হয়েছে।");
      fetchTabData("news");
    } catch (err) {
      console.warn("Client updateDoc failed, attempting API server fallback:", err);
      const ok = await callApiFallback(`/api/admin/news/${item.id}`, "PUT", updateData);
      if (ok) {
        showStatusMsg("খবরের স্থিতি পরিবর্তন করা হয়েছে।");
        fetchTabData("news");
      } else {
        handleFirestoreError(err, OperationType.UPDATE, path);
        showStatusMsg("স্থিতি পরিবর্তন করতে সমস্যা হয়েছে।", true);
      }
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই খবরটি মুছে ফেলতে চান ভাই?")) return;
    const path = `news/${id}`;
    try {
      await deleteDoc(doc(db, "news", id));
      showStatusMsg("খবরটি সফলভাবে মুছে ফেলা হয়েছে।");
      fetchTabData("news");
    } catch (err) {
      console.warn("Client deleteDoc failed, attempting API server fallback:", err);
      const ok = await callApiFallback(`/api/admin/news/${id}`, "DELETE");
      if (ok) {
        showStatusMsg("খবরটি সফলভাবে মুছে ফেলা হয়েছে।");
        fetchTabData("news");
      } else {
        handleFirestoreError(err, OperationType.DELETE, path);
        showStatusMsg("খবরটি মুছতে সমস্যা হয়েছে।", true);
      }
    }
  };

  // TICKER TAB
  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.message) {
      showStatusMsg("টিকার বার্তাটি লিখুন ভাই!", true);
      return;
    }
    const path = "ticker";
    const tickerId = `ticker_${Date.now()}`;
    const tickerData = {
      id: tickerId,
      message: newTicker.message,
      isActive: true,
      order: Number(newTicker.order) || (ticker.length + 1),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, path, tickerId), tickerData);
      setNewTicker({ message: "", order: ticker.length + 2 });
      showStatusMsg("টিকার বার্তা সফলভাবে যুক্ত হয়েছে!");
      fetchTabData("ticker");
    } catch (err) {
      console.warn("Client setDoc failed, attempting API server fallback:", err);
      const ok = await callApiFallback("/api/admin/ticker", "POST", tickerData);
      if (ok) {
        setNewTicker({ message: "", order: ticker.length + 2 });
        showStatusMsg("টিকার বার্তা সফলভাবে যুক্ত হয়েছে!");
        fetchTabData("ticker");
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
        showStatusMsg("টিকার বার্তা যুক্ত করতে সমস্যা হয়েছে।", true);
      }
    }
  };

  const handleToggleTicker = async (item: any) => {
    const path = `ticker/${item.id}`;
    const updateData = { isActive: !item.isActive };
    try {
      await updateDoc(doc(db, "ticker", item.id), updateData);
      showStatusMsg("টিকার বার্তার স্থিতি পরিবর্তন করা হয়েছে।");
      fetchTabData("ticker");
    } catch (err) {
      console.warn("Client updateDoc failed, attempting API server fallback:", err);
      const ok = await callApiFallback(`/api/admin/ticker/${item.id}`, "PUT", updateData);
      if (ok) {
        showStatusMsg("টিকার বার্তার স্থিতি পরিবর্তন করা হয়েছে।");
        fetchTabData("ticker");
      } else {
        handleFirestoreError(err, OperationType.UPDATE, path);
        showStatusMsg("স্থিতি পরিবর্তন করতে সমস্যা হয়েছে।", true);
      }
    }
  };

  const handleDeleteTicker = async (id: string) => {
    if (!window.confirm("আপনি কি এটি ডিলিট করতে চান ভাই?")) return;
    const path = `ticker/${id}`;
    try {
      await deleteDoc(doc(db, "ticker", id));
      showStatusMsg("টিকার বার্তা সফলভাবে মুছে ফেলা হয়েছে।");
      fetchTabData("ticker");
    } catch (err) {
      console.warn("Client deleteDoc failed, attempting API server fallback:", err);
      const ok = await callApiFallback(`/api/admin/ticker/${id}`, "DELETE");
      if (ok) {
        showStatusMsg("টিকার বার্তা সফলভাবে মুছে ফেলা হয়েছে।");
        fetchTabData("ticker");
      } else {
        handleFirestoreError(err, OperationType.DELETE, path);
        showStatusMsg("টিকার বার্তা মুছতে সমস্যা হয়েছে।", true);
      }
    }
  };

  // EXCHANGE RATE TAB
  const handleUpdateExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = "exchangeRates/current";
    const exchangeData = {
      bkash: Number(exchange.bkash),
      nagad: Number(exchange.nagad),
      rocket: Number(exchange.rocket || 110.70),
      bank: Number(exchange.bank),
      usdRate: Number(exchange.usdRate),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "exchangeRates", "current"), exchangeData, { merge: true });
      showStatusMsg("এক্সচেঞ্জ রেট সফলভাবে আপডেট করা হয়েছে ভাই!");
      fetchTabData("exchange");
    } catch (err) {
      console.warn("Client setDoc failed, attempting API server fallback:", err);
      const ok = await callApiFallback("/api/admin/exchangeRate", "POST", exchangeData);
      if (ok) {
        showStatusMsg("এক্সচেঞ্জ রেট সফলভাবে আপডেট করা হয়েছে ভাই!");
        fetchTabData("exchange");
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
        showStatusMsg("এক্সচেঞ্জ রেট আপডেট করতে সমস্যা হয়েছে।", true);
      }
    }
  };

  // FEES TAB
  const handleUpdateFees = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = "settings/fees";
    const feeData = {
      transferFeePercent: Number(feeSettings.transferFeePercent),
      transferFeeFixed: Number(feeSettings.transferFeeFixed),
      minimumTransfer: Number(feeSettings.minimumTransfer),
      maximumTransfer: Number(feeSettings.maximumTransfer),
      firstTransferFree: Boolean(feeSettings.firstTransferFree),
      feeUpdatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "settings", "fees"), feeData, { merge: true });
      showStatusMsg("ফি সেটিংস সফলভাবে আপডেট করা হয়েছে ভাই!");
      fetchTabData("fees");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, path);
      showStatusMsg("ফি সেটিংস আপডেট করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleUpdateTransferTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = "settings/transfer";
    const transferData = {
      minTime: Number(transferSettings.minTime || 5),
      maxTime: Number(transferSettings.maxTime || 120),
      timeDisplay: (transferSettings.timeDisplay || "").trim() || "৫ মিনিট থেকে ২ ঘণ্টার মধ্যে"
    };

    try {
      await setDoc(doc(db, "settings", "transfer"), transferData, { merge: true });
      showStatusMsg("ট্রান্সফার সময় সেটিংস সফলভাবে আপডেট করা হয়েছে ভাই!");
      fetchTabData("fees");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, path);
      showStatusMsg("ট্রান্সফার সময় সেটিংস আপডেট করতে সমস্যা হয়েছে।", true);
    }
  };

  // HOME POPUP ALERTS TAB
  const handleCreateHomeAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = "homeAlerts";
    const alertData = {
      title: newHomeAlert.title.trim(),
      description: newHomeAlert.description.trim(),
      tag: newHomeAlert.tag.trim() || "সতর্কতা",
      duration: Number(newHomeAlert.duration) || 10,
      isActive: Boolean(newHomeAlert.isActive),
      order: Number(newHomeAlert.order) || 1,
      createdAt: new Date().toISOString()
    };

    if (!alertData.title || !alertData.description) {
      alert("শিরোনাম এবং বিবরণ সম্পূর্ণ পূরণ করুন ভাই!");
      return;
    }

    try {
      await addDoc(collection(db, "homeAlerts"), alertData);
      showStatusMsg("নতুন সতর্কতা পপআপ সফলভাবে যুক্ত করা হয়েছে ভাই!");
      setNewHomeAlert({
        title: "",
        description: "",
        tag: "সতর্কতা",
        duration: 10,
        isActive: true,
        order: homeAlertsList.length + 2
      });
      fetchTabData("alerts");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, path);
      showStatusMsg("সতর্কতা পপআপ যুক্ত করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleToggleAlertActive = async (item: any) => {
    const path = `homeAlerts/${item.id}`;
    try {
      await updateDoc(doc(db, "homeAlerts", item.id), {
        isActive: !item.isActive
      });
      showStatusMsg("সতর্কতা পপআপ অ্যাক্টিভ স্থিতি আপডেট হয়েছে।");
      fetchTabData("alerts");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      showStatusMsg("অ্যাক্টিভ স্থিতি পরিবর্তন করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleDeleteHomeAlert = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই সতর্কতা পপআপটি ডিলিট করতে চান ভাই?")) return;
    const path = `homeAlerts/${id}`;
    try {
      await deleteDoc(doc(db, "homeAlerts", id));
      showStatusMsg("সতর্কতা পপআপটি সফলভাবে মুছে ফেলা হয়েছে ভাই!");
      fetchTabData("alerts");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      showStatusMsg("সতর্কতা পপআপটি মুছতে সমস্যা হয়েছে।", true);
    }
  };

  // JOBS TAB
  const handleToggleJobActive = async (item: any) => {
    const path = `jobs/${item.id}`;
    try {
      await updateDoc(doc(db, "jobs", item.id), {
        isActive: !item.isActive
      });
      showStatusMsg("চাকরির অ্যাক্টিভ স্থিতি আপডেট হয়েছে।");
      fetchTabData("jobs");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleToggleJobVerified = async (item: any) => {
    const path = `jobs/${item.id}`;
    try {
      await updateDoc(doc(db, "jobs", item.id), {
        isVerified: !item.isVerified
      });
      showStatusMsg("চাকরির ভেরিফাইড স্থিতি আপডেট হয়েছে।");
      fetchTabData("jobs");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleApproveJob = async (job: any) => {
    try {
      await updateDoc(doc(db, "jobs", job.id), {
        isVerified: true,
        isActive: true,
        isRejected: false
      });

      let empUserId = job.employerId;
      if (empUserId && empUserId.startsWith("employer-")) {
        empUserId = empUserId.replace("employer-", "");
      }

      await addDoc(collection(db, "notifications"), {
        userId: empUserId,
        message: "আপনার চাকরির পোস্ট প্রকাশিত হয়েছে! ✅ পদ: " + job.title,
        type: 'job_approved',
        isRead: false,
        createdAt: serverTimestamp()
      });

      showStatusMsg("চাকরি পোস্টটি সফলভাবে প্রকাশ করা হয়েছে!");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("চাকরি প্রকাশ করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleRejectJob = async (job: any) => {
    try {
      await updateDoc(doc(db, "jobs", job.id), {
        isVerified: false,
        isActive: false,
        isRejected: true
      });

      let empUserId = job.employerId;
      if (empUserId && empUserId.startsWith("employer-")) {
        empUserId = empUserId.replace("employer-", "");
      }

      await addDoc(collection(db, "notifications"), {
        userId: empUserId,
        message: "আপনার চাকরির পোস্ট প্রত্যাখ্যাত হয়েছে। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।",
        type: 'job_rejected',
        isRead: false,
        createdAt: serverTimestamp()
      });

      showStatusMsg("চাকরি পোস্টটি প্রত্যাখ্যান করা হয়েছে!");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("চাকরি প্রত্যাখ্যান করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই চাকরি পোস্টটি সরিয়ে দিতে চান ভাই?")) return;
    const path = `jobs/${id}`;
    try {
      await deleteDoc(doc(db, "jobs", id));
      showStatusMsg("চাকরি পোস্টটি মুছে ফেলা হয়েছে।");
      fetchTabData("jobs");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // EMPLOYERS & APPLICATIONS ADMIN HANDLERS
  const handleVerifyEmployer = async (emp: any) => {
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        verificationStatus: "verified",
        depositStatus: "paid"
      });

      // Also find corresponding deposit and verify it
      const q = query(collection(db, "employerDeposits"), where("employerId", "==", emp.id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, "employerDeposits", d.id), {
          status: "verified"
        });
      }

      showStatusMsg("নিয়োগকর্তা এবং জামানত সফলভাবে ভেরিফাই করা হয়েছে ভাই!");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("ভেরিফাই করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleRejectEmployer = async (emp: any) => {
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        verificationStatus: "rejected",
        depositStatus: "refunded"
      });

      const q = query(collection(db, "employerDeposits"), where("employerId", "==", emp.id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, "employerDeposits", d.id), {
          status: "refunded",
          refundReason: "প্রশাসন কর্তৃক বাতিলকৃত"
        });
      }

      showStatusMsg("নিয়োগকর্তা নিবন্ধন রিজেক্ট ও জামানত রিফান্ড স্ট্যাটাস দেওয়া হয়েছে।");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("অপারেশন ব্যর্থ হয়েছে।", true);
    }
  };

  const handleBlockEmployer = async (emp: any) => {
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        verificationStatus: "blocked",
        depositStatus: "forfeited"
      });

      const q = query(collection(db, "employerDeposits"), where("employerId", "==", emp.id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, "employerDeposits", d.id), {
          status: "forfeited",
          refundReason: "প্রতারণার কারণে জামানত বাজেয়াপ্ত"
        });
      }

      showStatusMsg("নিয়োগকর্তা ব্লক এবং জামানত সফলভাবে বাজেয়াপ্ত করা হয়েছে!");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("অপারেশন ব্যর্থ হয়েছে।", true);
    }
  };

  const handleVerifyEmployerVerifySubTab = async (emp: any) => {
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        verificationStatus: "verified",
        depositStatus: "verified"
      });

      const q = query(collection(db, "employerDeposits"), where("employerId", "==", emp.id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, "employerDeposits", d.id), {
          status: "verified"
        });
      }

      showStatusMsg("নিয়োগকর্তা এবং জামানত সফলভাবে যাচাই করা হয়েছে!");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("যাচাই করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleRejectEmployerVerifySubTab = async (emp: any, reason: string) => {
    if (!reason.trim()) {
      showStatusMsg("প্রত্যাখ্যানের কারণ লিখুন ভাই!", true);
      return;
    }
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        verificationStatus: "rejected"
      });

      await addDoc(collection(db, "notifications"), {
        userId: emp.userId,
        message: `আপনার নিয়োগকর্তা যাচাই অনুরোধটি প্রত্যাখ্যান করা হয়েছে। কারণ: ${reason.trim()}`,
        type: "employer_verification_rejected",
        isRead: false,
        createdAt: serverTimestamp()
      });

      showStatusMsg("নিয়োগকর্তা সফলভাবে প্রত্যাখ্যান করা হয়েছে এবং নোটিফিকেশন পাঠানো হয়েছে।");
      setActioningEmployerId(null);
      setInlineActionType(null);
      setInlineNoteText("");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("প্রত্যাখ্যান করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleRefundEmployerVerifySubTab = async (emp: any) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে $20 জামানত ফেরত দিতে চান ভাই?")) return;
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        depositStatus: "refunded"
      });

      const q = query(collection(db, "employerDeposits"), where("employerId", "==", emp.id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, "employerDeposits", d.id), {
          status: "refunded",
          refundReason: "প্রশাসন কর্তৃক জামানত ফেরত"
        });
      }

      const userRef = doc(db, "users", emp.userId);
      const userSnap = await getDoc(userRef);
      let currentBalance = 0;
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (uData.balance !== undefined) {
          currentBalance = Number(uData.balance);
        }
      }
      const newBalance = currentBalance + 20;
      await setDoc(userRef, { balance: newBalance }, { merge: true });

      await addDoc(collection(db, "notifications"), {
        userId: emp.userId,
        message: `আপনার নিয়োগকর্তা সিকিউরিটি জামানত $20 ফেরত দেওয়া হয়েছে এবং আপনার মূল ব্যালেন্সে যোগ করা হয়েছে ভাই!`,
        type: "employer_deposit_refunded",
        isRead: false,
        createdAt: serverTimestamp()
      });

      showStatusMsg("সিকিউরিটি জামানত সফলভাবে ফেরত দেওয়া হয়েছে এবং মূল ব্যালেন্সে যোগ করা হয়েছে!");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("জামানত ফেরত দিতে সমস্যা হয়েছে।", true);
    }
  };

  const handleForfeitEmployerVerifySubTab = async (emp: any, note: string) => {
    if (!note.trim()) {
      showStatusMsg("বাজেয়াপ্ত করার কারণ উল্লেখ করুন ভাই!", true);
      return;
    }
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        depositStatus: "forfeited"
      });

      const q = query(collection(db, "employerDeposits"), where("employerId", "==", emp.id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, "employerDeposits", d.id), {
          status: "forfeited",
          refundReason: note.trim()
        });
      }

      await addDoc(collection(db, "notifications"), {
        userId: emp.userId,
        message: `প্রতারণার অভিযোগে আপনার নিয়োগকর্তা জামানত বাজেয়াপ্ত করা হয়েছে। কারণ: ${note.trim()}`,
        type: "employer_deposit_forfeited",
        isRead: false,
        createdAt: serverTimestamp()
      });

      showStatusMsg("জামানত সফলভাবে বাজেয়াপ্ত করা হয়েছে!");
      setActioningEmployerId(null);
      setInlineActionType(null);
      setInlineNoteText("");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("জামানত বাজেয়াপ্ত করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleBlockEmployerVerifySubTab = async (emp: any) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই নিয়োগকর্তাকে ব্লক করতে চান ভাই?")) return;
    try {
      await updateDoc(doc(db, "employers", emp.id), {
        verificationStatus: "blocked"
      });

      await addDoc(collection(db, "notifications"), {
        userId: emp.userId,
        message: `আপনার নিয়োগকর্তা অ্যাকাউন্টটি ব্লক করা হয়েছে।`,
        type: "employer_blocked",
        isRead: false,
        createdAt: serverTimestamp()
      });

      showStatusMsg("নিয়োগকর্তা সফলভাবে ব্লক করা হয়েছে!");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("ব্লক করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleHireApplicant = async (app: any) => {
    try {
      // 1. Mark application status as hired
      await updateDoc(doc(db, "jobApplications", app.id), {
        status: "hired"
      });

      // 2. Increment totalBonusGiven on the employer document
      if (app.employerId) {
        const empRef = doc(db, "employers", app.employerId);
        const empSnap = await getDoc(empRef);
        if (empSnap.exists()) {
          const empData = empSnap.data();
          await updateDoc(empRef, {
            totalBonusGiven: (empData.totalBonusGiven || 0) + 10,
            depositStatus: "refunded"
          });
        }

        // Also mark corresponding deposit as refunded
        const q = query(collection(db, "employerDeposits"), where("employerId", "==", app.employerId));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await updateDoc(doc(db, "employerDeposits", d.id), {
            status: "refunded",
            refundReason: "কর্মী নিয়োগ নিশ্চিত হওয়ায় ফেরত"
          });
        }
      }

      showStatusMsg("কর্মী নিয়োগ নিশ্চিত হয়েছে! নিয়োগকর্তা $20 ফেরত ও $10 বোনাস পাবেন।");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("অপারেশন ব্যর্থ হয়েছে।", true);
    }
  };

  const handleRejectApplicant = async (app: any) => {
    try {
      await updateDoc(doc(db, "jobApplications", app.id), {
        status: "rejected"
      });
      showStatusMsg("আবেদনটি বাতিল করা হয়েছে ভাই।");
      fetchTabData("jobs");
    } catch (err) {
      console.error(err);
      showStatusMsg("অপারেশন ব্যর্থ হয়েছে।", true);
    }
  };

  // SCAM REPORTS TAB
  const handleUpdateScamStatus = async (id: string, status: "pending" | "verified" | "rejected") => {
    const path = `scamReports/${id}`;
    try {
      await updateDoc(doc(db, "scamReports", id), {
        status: status
      });
      showStatusMsg(`রিপোর্ট স্থিতি সফলভাবে '${status}' করা হয়েছে ভাই।`);
      fetchTabData("scams");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // TICKET REQUESTS TAB
  const handleUpdateTicketStatus = async (id: string, status: "pending" | "confirmed" | "cancelled") => {
    const path = `ticketRequests/${id}`;
    try {
      await updateDoc(doc(db, "ticketRequests", id), {
        status: status
      });
      showStatusMsg(`টিকেটের আবেদন স্থিতি '${status}' করা হয়েছে।`);
      fetchTabData("tickets");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // EMERGENCY CONTACTS TAB
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) {
      showStatusMsg("নাম ও ফোন নম্বর দিন ভাই!", true);
      return;
    }
    const path = "emergencyContacts";
    try {
      const contactId = `contact_${Date.now()}`;
      await setDoc(doc(db, path, contactId), {
        id: contactId,
        name: newContact.name,
        phone: newContact.phone,
        description: newContact.description,
        category: newContact.category,
        order: Number(newContact.order) || 1
      });
      setNewContact({ name: "", phone: "", category: "জরুরি", order: 1, description: "" });
      showStatusMsg("কন্টাক্ট সফলভাবে যুক্ত করা হয়েছে!");
      fetchTabData("emergency");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleUpdateContactPhone = async (id: string) => {
    if (!editPhoneValue) return;
    const path = `emergencyContacts/${id}`;
    try {
      await updateDoc(doc(db, "emergencyContacts", id), {
        phone: editPhoneValue
      });
      setEditingContactId(null);
      setEditPhoneValue("");
      showStatusMsg("ফোন নম্বর পরিবর্তন করা হয়েছে!");
      fetchTabData("emergency");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই জরুরি নাম্বারটি ডিলিট করতে চান ভাই?")) return;
    const path = `emergencyContacts/${id}`;
    try {
      await deleteDoc(doc(db, "emergencyContacts", id));
      showStatusMsg("জরুরি নাম্বার মুছে ফেলা হয়েছে।");
      fetchTabData("emergency");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleUpdateUserBalance = async (userId: string) => {
    const amount = Number(editingUserBalanceValue);
    if (isNaN(amount)) {
      showStatusMsg("সঠিক সংখ্যা লিখুন ভাই।", true);
      return;
    }
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { balance: amount }, { merge: true });
      showStatusMsg("ইউজারের ব্যালেন্স সফলভাবে আপডেট করা হয়েছে ভাই।");
      setEditingUserBalanceId(null);
      setEditingUserBalanceValue("");
      fetchTabData("users");
    } catch (e) {
      console.error("Error updating user balance in admin:", e);
      showStatusMsg("ব্যালেন্স আপডেট করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleToggleUserPremium = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { isPremium: !currentStatus, tier: !currentStatus ? "vip" : "basic" }, { merge: true });
      showStatusMsg(`ইউজারের প্রিমিয়াম স্ট্যাটাস সফলভাবে ${!currentStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে ভাই।`);
      fetchTabData("users");
    } catch (e) {
      console.error("Error toggling user premium in admin:", e);
      showStatusMsg("আপডেট করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleToggleUserBlock = async (userId: string, currentBlocked: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { isBlocked: !currentBlocked }, { merge: true });
      showStatusMsg(`ইউজারকে সফলভাবে ${!currentBlocked ? 'ব্লক' : 'আনব্লক'} করা হয়েছে ভাই।`);
      fetchTabData("users");
    } catch (e) {
      console.error("Error toggling user block in admin:", e);
      showStatusMsg("আপডেট করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleDeleteUser = async (userId: string, userNameOrPhone: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ইউজার "${userNameOrPhone}" এর অ্যাকাউন্ট ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না ভাই!`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "users", userId));
      showStatusMsg("ইউজার অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে ভাই।");
      fetchTabData("users");
    } catch (e) {
      console.error("Error deleting user in admin:", e);
      showStatusMsg("ডিলিট করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleSaveBlockSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "blockSettings"), blockSettings, { merge: true });
      showStatusMsg("ব্লকড ইউজার সেটিংস সফলভাবে সেভ করা হয়েছে ভাই! 🎉", false);
    } catch (e) {
      console.error("Error saving block settings:", e);
      showStatusMsg("সেটিংস সেভ করতে সমস্যা হয়েছে ভাই!", true);
    }
  };

  const handleViewUserHistory = async (user: any) => {
    setViewingUserHistory(user);
    setLoadingUserHistory(true);
    setUserHistoryDeposits([]);
    setUserHistoryTransfers([]);
    try {
      // 1. Fetch deposit requests
      const depQuery = query(
        collection(db, "depositRequests"),
        where("userId", "==", user.userId)
      );
      const depSnap = await getDocs(depQuery);
      const depList = depSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      depList.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUserHistoryDeposits(depList);

      // 2. Fetch transfer requests
      const transQuery1 = query(
        collection(db, "transferRequests"),
        where("userId", "==", user.uid)
      );
      const transSnap1 = await getDocs(transQuery1);
      let transList = transSnap1.docs.map(d => ({ id: d.id, ...d.data() }));

      if (user.email) {
        const transQuery2 = query(
          collection(db, "transferRequests"),
          where("userId", "==", user.email)
        );
        const transSnap2 = await getDocs(transQuery2);
        const transList2 = transSnap2.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const existingIds = new Set(transList.map(t => t.id));
        for (const t of transList2) {
          if (!existingIds.has(t.id)) {
            transList.push(t);
          }
        }
      }

      transList.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUserHistoryTransfers(transList);
    } catch (err) {
      console.error("Error loading user history:", err);
    } finally {
      setLoadingUserHistory(false);
    }
  };

  // DEPOSIT SYSTEM HANDLERS
  const startVerifyDeposit = (request: any) => {
    setVerifyingDeposit(request);
    setVerifyAmountInput(request.amount?.toString() || "");
  };

  const submitVerifyDeposit = async () => {
    if (!verifyingDeposit) return;
    const id = verifyingDeposit.id;
    const verifiedAmount = Number(verifyAmountInput);
    if (isNaN(verifiedAmount) || verifiedAmount <= 0) {
      showStatusMsg("সঠিক ডলার পরিমাণ ইনপুট দিন ভাই!", true);
      return;
    }

    try {
      const depRef = doc(db, "depositRequests", id);
      const depSnap = await getDoc(depRef);
      if (!depSnap.exists()) {
        showStatusMsg("অনুরোধটি পাওয়া যায়নি ভাই!", true);
        return;
      }
      
      const depData = depSnap.data();
      const userId = depData.userId || "";

      // Update deposit request
      await updateDoc(depRef, {
        status: "verified",
        verifiedAmount: verifiedAmount,
        verifiedAt: new Date().toISOString()
      });
      
      // Update user wallet balance in real-time
      if (userId) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userId", "==", userId));
        const qSnap = await getDocs(q);
        
        if (!qSnap.empty) {
          const userDocSnap = qSnap.docs[0];
          const userRef = doc(db, "users", userDocSnap.id);
          const uData = userDocSnap.data();
          const currentBalance = Number(uData.balance) || 0;
          const newBalance = currentBalance + verifiedAmount;
          await setDoc(userRef, { balance: newBalance }, { merge: true });
        } else {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const uData = userSnap.data();
            const currentBalance = Number(uData.balance) || 0;
            const newBalance = currentBalance + verifiedAmount;
            await setDoc(userRef, { balance: newBalance }, { merge: true });
          } else {
            console.warn(`User with PS ID ${userId} not found in Firestore.`);
          }
        }
      }
      
      showStatusMsg(`অনুরোধটি সফলভাবে ভেরিফাই করা হয়েছে এবং $${verifiedAmount} USD ব্যালেন্স যোগ করা হয়েছে!`);
      setVerifyingDeposit(null);
      fetchTabData("deposit");
    } catch (err) {
      console.error("Error verifying deposit:", err);
      showStatusMsg("ভেরিফাই করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ডিপোজিট বাতিল করতে চান?")) return;
    try {
      await updateDoc(doc(db, "depositRequests", id), {
        status: "rejected"
      });
      showStatusMsg("অনুরোধটি বাতিল (Rejected) করা হয়েছে।");
      fetchTabData("deposit");
    } catch (err) {
      console.error("Error rejecting deposit:", err);
      showStatusMsg("বাতিল করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleToggleMethodActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, "paymentMethods", id), {
        isActive: !currentActive
      });
      showStatusMsg("পেমেন্ট মেথড সক্রিয়তা পরিবর্তন করা হয়েছে!");
      fetchTabData("deposit");
    } catch (err) {
      console.error("Error toggling method active:", err);
      showStatusMsg("আপডেট করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim() || !newMethodAccount.trim()) {
      showStatusMsg("বক্সগুলো পূরণ করুন ভাই!", true);
      return;
    }
    try {
      const methodId = `method_${Date.now()}`;
      await setDoc(doc(db, "paymentMethods", methodId), {
        id: methodId,
        name: newMethodName.trim(),
        country: newMethodCountry,
        color: newMethodColor,
        isActive: true,
        order: paymentMethodsList.length + 1,
        accountName: newMethodAccount.trim(),
        qrImageUrl: ""
      });
      setNewMethodName("");
      setNewMethodAccount("");
      showStatusMsg("নতুন পেমেন্ট গেটওয়ে সফলভাবে যুক্ত করা হয়েছে!");
      fetchTabData("deposit");
    } catch (err) {
      console.error("Error adding payment method:", err);
      showStatusMsg("গেটওয়ে যুক্ত করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleUploadQR = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showStatusMsg("ফাইল সাইজ ২ মেগাবাইটের বেশি হওয়া যাবে না!", true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await updateDoc(doc(db, "paymentMethods", id), {
            qrImageUrl: reader.result as string
          });
          showStatusMsg("QR কোড সফলভাবে আপলোড এবং যুক্ত করা হয়েছে!");
          fetchTabData("deposit");
        } catch (err) {
          console.error("Error saving QR Code:", err);
          showStatusMsg("QR কোড সেভ করতে সমস্যা হয়েছে।", true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ----- MONEY TRANSFER DASHBOARD HANDLERS -----
  const handleStartProcessingTransfer = async (id: string) => {
    try {
      await updateDoc(doc(db, "transferRequests", id), {
        status: "processing",
        processedAt: new Date().toISOString()
      });
      showStatusMsg("অনুরোধটি প্রসেসিং (যাচাইকরণ) অবস্থায় সেট করা হয়েছে!");
      fetchTabData("transfer");
    } catch (err) {
      console.error("Error processing transfer:", err);
      showStatusMsg("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleStartSentTransfer = async (id: string) => {
    try {
      await updateDoc(doc(db, "transferRequests", id), {
        status: "sent"
      });
      showStatusMsg("অপারেশন স্ট্যাটাস: টাকা পাঠানো হচ্ছে (Sent)!");
      fetchTabData("transfer");
    } catch (err) {
      console.error("Error setting sent transfer:", err);
      showStatusMsg("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleCompleteTransferSubmit = async () => {
    if (!selectedCompletedTransfer) return;
    if (!confirmationDigits.trim()) {
      showStatusMsg("দয়া করে bKash নম্বরের শেষ ৪ সংখ্যা লিখুন ভাই!", true);
      return;
    }

    try {
      const transferId = selectedCompletedTransfer.id;
      const amount = selectedCompletedTransfer.amount || 0;
      const method = selectedCompletedTransfer.recipientMethod || selectedCompletedTransfer.recipientMethodName || "bkash";
      const durationNum = Number(minutesDuration) || 10;

      // Update transfer request in Firestore
      await updateDoc(doc(db, "transferRequests", transferId), {
        status: "completed",
        proofImageUrl: proofSentImageCode || "",
        completedAt: new Date().toISOString(),
        confirmationDigits: confirmationDigits.trim()
      });

      // Save notification to user
      if (selectedCompletedTransfer.userId) {
        await addDoc(collection(db, "notifications"), {
          userId: selectedCompletedTransfer.userId,
          type: 'transfer_completed',
          message: "আপনার ট্রান্সফার সম্পন্ন হয়েছে! রশিদ ডাউনলোড করুন।",
          transferId: transferId,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }

      // Add an anonymized trust record to Public Transactions
      const pubId = `pub_${Date.now()}`;
      await setDoc(doc(db, "publicTransactions", pubId), {
        id: pubId,
        amount: amount,
        currency: "USD",
        method: method === "bkash" ? "bKash" : method === "nagad" ? "Nagad" : method === "rocket" ? "Rocket" : "Bank",
        minutesTaken: durationNum,
        createdAt: new Date().toISOString()
      });

      // Progressive cumulative referral bonus unlocking when user hits cumulative completed transfers target (e.g. $100)
      if (selectedCompletedTransfer.userId) {
        let referralEnabled = true;
        let referralBonus = 1;
        let referralMin = 100;
        let signupBonusAmount = 2;
        
        try {
          const configSnap = await getDoc(doc(db, "settings", "referral"));
          if (configSnap.exists()) {
            const configData = configSnap.data();
            if (configData.referralSystemEnabled !== undefined) {
              referralEnabled = configData.referralSystemEnabled;
            }
            if (configData.referralBonusAmount !== undefined) {
              referralBonus = Number(configData.referralBonusAmount);
            }
            if (configData.referralMinTransfer !== undefined) {
              referralMin = Number(configData.referralMinTransfer);
            }
            if (configData.signupBonusAmount !== undefined) {
              signupBonusAmount = Number(configData.signupBonusAmount);
            }
          }
        } catch (confErr) {
          console.error("Error loading referral settings, using defaults:", confErr);
        }

        const referredUserRef = doc(db, "users", selectedCompletedTransfer.userId);
        const referredUserSnap = await getDoc(referredUserRef);
        if (referredUserSnap.exists()) {
          const referredUserData = referredUserSnap.data();
          const currentTotalCompletedAmount = (referredUserData.totalCompletedTransfersAmount || 0) + amount;
          
          // Always save totalCompletedTransfersAmount in user document
          await updateDoc(referredUserRef, {
            totalCompletedTransfersAmount: currentTotalCompletedAmount
          });

          // Check if user has not completed the referral bonus unlock yet, and their total successful transfers reaches the target (e.g. $100)
          if (!referredUserData.referralCompleted && currentTotalCompletedAmount >= referralMin) {
            const pendingBonusToUnlock = referredUserData.pendingBonus !== undefined ? Number(referredUserData.pendingBonus) : signupBonusAmount;
            
            // 1. Credit the pending bonus to the new user's main wallet balance (balance)
            await updateDoc(referredUserRef, {
              balance: increment(pendingBonusToUnlock),
              pendingBonus: 0,
              referralCompleted: true
            });

            // Send notification to the user
            await addDoc(collection(db, "notifications"), {
              userId: selectedCompletedTransfer.userId,
              message: `অভিনন্দন ভাই! আপনার টোটাল ট্রান্সফার $${referralMin} পূর্ণ হয়েছে। আপনার $${pendingBonusToUnlock} সাইন-আপ বোনাস মেইন ওয়ালেটে যোগ করা হয়েছে 🎉`,
              type: "signup_bonus_unlocked",
              isRead: false,
              createdAt: serverTimestamp()
            });

            // 2. If referred by a friend and referral system is enabled, reward the friend as well
            if (referralEnabled && referredUserData.referredBy) {
              const refCode = referredUserData.referredBy;
              let referrerQuery = query(collection(db, "users"), where("referralCode", "==", refCode));
              let referrerQuerySnap = await getDocs(referrerQuery);
              
              if (referrerQuerySnap.empty) {
                const derivedUserId = refCode.replace("PS-REF-", "PS-");
                referrerQuery = query(collection(db, "users"), where("userId", "==", derivedUserId));
                referrerQuerySnap = await getDocs(referrerQuery);
              }
              
              if (!referrerQuerySnap.empty) {
                const referrerDoc = referrerQuerySnap.docs[0];
                const referrerRef = referrerDoc.ref;
                
                // Decrement from referralBalance (pending) and add to balance (main wallet) and referralEarnings (total)
                await updateDoc(referrerRef, {
                  balance: increment(referralBonus),
                  referralEarnings: increment(referralBonus),
                  referralBalance: increment(-referralBonus),
                  totalReferrals: increment(1)
                });
                
                await addDoc(collection(db, "notifications"), {
                  userId: referrerDoc.id,
                  message: `আপনার রেফার করা বন্ধু $${referralMin}+ পাঠিয়েছেন! $${referralBonus} রেফারেল বোনাস মেইন ব্যালেন্সে যোগ হয়েছে 🎉`,
                  type: "referral_bonus_completed",
                  isRead: false,
                  createdAt: serverTimestamp()
                });
              }
            }
          }
        }
      }

      showStatusMsg("অভিনন্দন! ট্রান্সফার সফলভাবে সম্পন্ন হয়েছে এবং পাবলিক ফিডে লগ করা হয়েছে।");
      setSelectedCompletedTransfer(null);
      setProofSentImageCode("");
      setProofSentImageName("");
      setMinutesDuration("10");
      setConfirmationDigits("");
      fetchTabData("transfer");
    } catch (err) {
      console.error("Error completing transfer:", err);
      showStatusMsg("ট্রান্সফার সম্পন্ন করতে সমস্যা হয়েছে ভাই!", true);
    }
  };

  const handleRejectTransferSubmit = async () => {
    if (!selectedRejectTransfer) return;
    if (!rejectReasonText.trim()) {
      showStatusMsg("দয়া করে বাতিল করার একটি কারণ উল্লেখ করুন!", true);
      return;
    }

    try {
      const transId = selectedRejectTransfer.id;
      const userId = selectedRejectTransfer.userId || "";
      const refundAmount = Number(selectedRejectTransfer.totalDeducted) || Number(selectedRejectTransfer.amount) || 0;

      await updateDoc(doc(db, "transferRequests", transId), {
        status: "failed",
        rejectReason: rejectReasonText.trim()
      });

      // Refund balance back to user document
      if (userId && refundAmount > 0) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        let currentBalance = 250.00; // default Fallback
        
        if (userSnap.exists()) {
          const uData = userSnap.data();
          if (uData.balance !== undefined) {
            currentBalance = Number(uData.balance);
          }
        }
        
        const newBalance = currentBalance + refundAmount;
        await setDoc(userRef, { balance: newBalance }, { merge: true });
      }

      showStatusMsg(`অনুরোধটি বাতিল করা হয়েছে এবং $${refundAmount} USD সরাসরি গ্রাহকের মেম্বার ওয়ালেটে রিফান্ড করা হয়েছে!`);
      setSelectedRejectTransfer(null);
      setRejectReasonText("");
      fetchTabData("transfer");
    } catch (err) {
      console.error("Error rejecting transfer request:", err);
      showStatusMsg("বাতিল করতে সমস্যা হয়েছে।", true);
    }
  };

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showStatusMsg("ফাইল সাইজ ৫ মেগাবাইটের বেশি হওয়া যাবে না!", true);
        return;
      }
      setProofSentImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          // Downscale and compress to pass within Firestore 1MB document limit
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Use JPEG format with 0.65 quality factor to dramatically reduce base64 length
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.65);
            setProofSentImageCode(compressedBase64);
          } else {
            setProofSentImageCode(reader.result as string);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A2E]">
        <div className="w-full max-w-[340px] bg-white p-[32px] rounded-[20px] border border-[#E5E7EB] shadow-sm text-center">
          <img 
            src={probashiLogo} 
            alt="প্রবাসী সেবা" 
            className="w-12 h-12 rounded-[10px] object-cover mx-auto mb-4 border border-gray-200"
            referrerPolicy="no-referrer"
            style={{ borderWidth: "0.5px" }}
          />
          <h2 className="text-[18px] font-medium text-[#1A1A2E] leading-tight mb-1">প্রবাসী সেবা অ্যাডমিন</h2>
          <p className="text-[12px] text-[#6B7280] mb-6 font-sans">শুধুমাত্র অনুমোদিত ব্যক্তি</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <input
                type="password"
                required
                placeholder="পাসওয়ার্ড"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] px-3.5 h-[52px] text-sm outline-none focus:border-[#1B4F72] transition-colors"
                style={{ borderWidth: "0.5px" }}
              />
            </div>

            {loginError && (
              <p className="text-[12px] text-[#E74C3C] text-center font-medium my-2">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#1B4F72] text-white h-[52px] rounded-[14px] font-medium text-sm hover:opacity-95 transition-all cursor-pointer"
            >
              লগইন করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Group Payments by Country for Separate Column Listing
  const bdMethods = paymentMethodsList.filter(item => item.country === "BD" || !item.country);
  const khMethods = paymentMethodsList.filter(item => item.country === "KH");

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-[#1A1A2E] pb-24 flex flex-col">
      {/* Top Banner Header */}
      <header className="bg-[#1B4F72] text-white px-4 py-4 flex justify-between items-center shrink-0">
        <h1 className="text-[16px] font-medium text-white">প্রবাসী সেবা — Admin</h1>
        <button 
          onClick={handleLogout}
          className="bg-white/15 text-white hover:bg-white/25 text-[12px] px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
        >
          লগআউট
        </button>
      </header>

      {/* Tabs navigation list - horizontal scroll, no scrollbar, custom padding, gaps & badges */}
      <div 
        className="px-4 py-3 flex overflow-x-auto gap-2 shrink-0 bg-white border-b border-[#E5E7EB] scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {[
          { id: "news", name: "নিউজ" },
          { id: "ticker", name: "টিকার" },
          { id: "exchange", name: "এক্সচেঞ্জ রেট" },
          { id: "fees", name: "ফি সেটিংস" },
          { id: "alerts", name: "হোম সতর্কতা" },
          { id: "ad_banner", name: "পপআপ ব্যানার" },
          { id: "referral", name: "রেফারেল" },
          { id: "deposit", name: "ডিপোজিট" },
          { id: "transfer", name: "ট্রান্সফার" },
          { id: "passwordResets", name: "পাসওয়ার্ড রিসেট" },
          { id: "reviews", name: "রিভিউসমূহ" },
          { id: "jobs", name: "চাকরি" },
          { id: "scams", name: "স্ক্যাম" },
          { id: "tickets", name: "টিকেট" },
          { id: "emergency", name: "জরুরি" },
          { id: "users", name: "ইউজার্স" },
          { id: "maintenance", name: "মেইনটেন্যান্স" },
          { id: "database", name: "ডাটাবেজ ডিলিট" }
        ].map((tab) => {
          let count = 0;
          if (tab.id === "deposit") {
            count = depositRequests.filter(r => r.status === "pending").length;
          } else if (tab.id === "transfer") {
            count = transferRequests.filter(r => r.status === "pending").length;
          } else if (tab.id === "jobs") {
            count = employers.filter(e => e.verificationStatus === "pending").length;
          } else if (tab.id === "passwordResets") {
            count = passwordResets.filter(r => r.status === "pending").length;
          }

          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[12px] px-4 py-2 rounded-[20px] font-medium shrink-0 transition-all cursor-pointer flex items-center space-x-1 border ${
                isActive 
                  ? "bg-[#1B4F72] text-white border-[#1B4F72]" 
                  : "bg-white text-[#6B7280] border-[#E5E7EB]"
              }`}
              style={{ borderWidth: "0.5px" }}
            >
              <span>{tab.name}</span>
              {count > 0 && (
                <span className="bg-[#E74C3C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[16px] h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main content body */}
      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Status notification */}
        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border animate-fade-in ${
            message.isError 
              ? "bg-[#FDEDEC] text-[#E74C3C] border-[#FADBD8]" 
              : "bg-[#E9F7EF] text-[#1D9E75] border-[#D4EFDF]"
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <RefreshCw className="w-6 h-6 text-[#1B4F72] animate-spin" />
            <p className="text-xs text-[#6B7280]">ডাটাবেজ লোড করা হচ্ছে...</p>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* ==== NEWS TAB CONSOLE ==== */}
            {activeTab === "news" && (
              <div className="space-y-3">
                {/* Add Form (white card) */}
                <form onSubmit={handleAddNews} className="bg-white border rounded-2xl p-5 space-y-3" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                  <h3 className="text-sm font-semibold text-[#1B4F72] flex items-center space-x-1.5 mb-1 text-left">
                    <Plus className="w-4 h-4 text-[#1B4F72]" />
                    <span>নতুন নোটিশ / সংবাদ সংযুক্তি</span>
                  </h3>
                  
                  <div className="space-y-1 text-left">
                    <label className="text-[12px] font-medium text-[#6B7280]">শিরোনাম (Title):</label>
                    <input 
                      type="text" 
                      required
                      placeholder="খবরের শিরোনাম বাংলায় লিখুন..."
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs outline-none bg-[#F9FAFB]"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[12px] font-medium text-[#6B7280]">ক্যাটাগরি বা ট্যাগ (Tag):</label>
                    <select
                      value={newNews.tag}
                      onChange={(e) => setNewNews({ ...newNews, tag: e.target.value })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs outline-none bg-[#F9FAFB]"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    >
                      <option value="ভিসা">ভিসা</option>
                      <option value="সতর্কতা">সতর্কতা</option>
                      <option value="স্বাস্থ্য">স্বাস্থ্য</option>
                      <option value="চাকরি">চাকরি</option>
                      <option value="জরুরি">জরুরি</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[12px] font-medium text-[#6B7280]">বিস্তারিত বার্তা (Description):</label>
                    <textarea
                      required
                      placeholder="খবরের বিস্তারিত বিবরণ এখানে বাংলায় লিখুন ভাই..."
                      rows={3}
                      value={newNews.description}
                      onChange={(e) => setNewNews({ ...newNews, description: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs outline-none resize-none bg-[#F9FAFB]"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#1B4F72] text-white h-[44px] rounded-xl text-xs font-semibold transition-all hover:opacity-95 cursor-pointer"
                  >
                    খবর পোস্ট করুন
                  </button>
                </form>

                {/* News listing */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#6B7280] text-left">বর্তমানে লাইভ নোটিশ খবরের তালিকা:</h3>
                  {news.length === 0 ? (
                    <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-4 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো আইটেম পাওয়া যায়নি।</p>
                  ) : (
                    news.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border p-4 rounded-[14px] flex justify-between items-start space-x-2"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        <div className="space-y-1 flex-1 text-left">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <span className="text-[10px] bg-[#EBF5FB] text-[#1B6CA8] px-2 py-0.5 rounded-full font-medium">
                              {item.tag}
                            </span>
                            <span className="text-[10px] text-[#6B7280] font-sans">{item.date}</span>
                            {!item.isActive && (
                              <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.25 rounded font-semibold font-sans">ইনঅ্যাক্টিভ</span>
                            )}
                          </div>
                          <h4 className="text-xs font-medium text-[#1A1A2E] leading-tight mt-1">{item.title}</h4>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed font-sans">{item.description}</p>
                        </div>
                        <div className="flex flex-col space-y-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleNews(item)}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-center hover:bg-gray-50 cursor-pointer ${
                              item.isActive ? "border-green-200 text-[#1D9E75]" : "border-gray-200 text-gray-500"
                            }`}
                            title={item.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                          >
                            {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="bg-[#E74C3C] text-white p-2 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ==== TICKER TAB CONSOLE ==== */}
            {activeTab === "ticker" && (
              <div className="space-y-3">
                {/* Add Form */}
                <form onSubmit={handleAddTicker} className="bg-white border rounded-2xl p-5 space-y-3" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                  <h3 className="text-sm font-semibold text-[#1B4F72] flex items-center space-x-1.5 text-left mb-1">
                    <Plus className="w-4 h-4 text-[#1B4F72]" />
                    <span>নতুন স্ক্রলিং টিকার বার্তা এড করুন</span>
                  </h3>

                  <div className="space-y-1 text-left">
                    <label className="text-[12px] font-medium text-[#6B7280]">টিকার বার্তা (Message):</label>
                    <textarea
                      required
                      placeholder="যেমন: ⚠️ ওভারস্টে জরিমানা ১০ ডলার প্রতিদিন..."
                      value={newTicker.message}
                      onChange={(e) => setNewTicker({ ...newTicker, message: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs outline-none h-16 resize-none bg-[#F9FAFB]"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                      💡 <strong>লাইভ রেট টিপস:</strong> আপনি যদি এই মেসেজের মধ্যে আজকের লাইভ রেট দেখাতে চান, তবে যেখানে দেখাতে চান সেখানে লিখুন: <span className="font-mono text-[#1B4F72] bg-[#1B4F72]/5 px-1 rounded">{"{bkash}"}</span>, <span className="font-mono text-[#1B4F72] bg-[#1B4F72]/5 px-1 rounded">{"{nagad}"}</span>, <span className="font-mono text-[#1B4F72] bg-[#1B4F72]/5 px-1 rounded">{"{rocket}"}</span>, অথবা <span className="font-mono text-[#1B4F72] bg-[#1B4F72]/5 px-1 rounded">{"{bank}"}</span>। এগুলো অটোমেটিক আপনার আপডেট করা এক্সচেঞ্জ রেট দিয়ে পরিবর্তন হয়ে যাবে!
                    </p>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[12px] font-medium text-[#6B7280]">অগ্রাধিকার ক্রম (Order Number):</label>
                    <input
                      type="number"
                      required
                      value={newTicker.order}
                      onChange={(e) => setNewTicker({ ...newTicker, order: Number(e.target.value) })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs outline-none bg-[#F9FAFB] font-sans"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#1B4F72] text-white h-[44px] rounded-xl text-xs font-semibold transition-all hover:opacity-95 cursor-pointer"
                  >
                    টিকার বার্তা যোগ করুন
                  </button>
                </form>

                {/* Ticker list */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#6B7280] text-left">বর্তমানে চালু থাকা স্ক্রলিং টিকারসমূহ:</h3>
                  {ticker.length === 0 ? (
                    <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-4 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো বার্তা পাওয়া যায়নি।</p>
                  ) : (
                    ticker.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border p-4 rounded-[14px] flex justify-between items-center space-x-2"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        <div className="text-left flex-1 space-y-1">
                          <p className="text-xs text-[#1A1A2E] leading-normal font-sans">{item.message}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-[#6B7280] font-sans">
                            <span>ক্রম: {item.order}</span>
                            {!item.isActive && (
                              <span className="bg-red-100 text-red-600 px-1 py-0.25 rounded font-semibold font-sans">বন্ধ</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleTicker(item)}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-center hover:bg-gray-50 cursor-pointer ${
                              item.isActive ? "border-green-200 text-[#1D9E75]" : "border-gray-200 text-gray-500"
                            }`}
                          >
                            {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTicker(item.id)}
                            className="bg-[#E74C3C] text-white p-2 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ==== EXCHANGE RATE TAB ==== */}
            {activeTab === "exchange" && (
              <form onSubmit={handleUpdateExchange} className="bg-white border rounded-2xl p-5 space-y-4" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                <h3 className="text-sm font-semibold text-[#1B4F72] flex items-center space-x-1.5 mb-1 text-left">
                  <Tag className="w-4 h-4 text-[#1B4F72]" />
                  <span>লাইভ রেমিট্যান্স এক্সচেঞ্জ রেট কন্ট্রোল</span>
                </h3>

                <div className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#6B7280]">বিকাশ রেট (bKash Rate BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.bkash}
                      onChange={(e) => setExchange({ ...exchange, bkash: e.target.value })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs font-semibold outline-none bg-[#F9FAFB] font-sans"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#6B7280]">নগদ রেট (Nagad Rate BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.nagad}
                      onChange={(e) => setExchange({ ...exchange, nagad: e.target.value })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs font-semibold outline-none bg-[#F9FAFB] font-sans"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#6B7280]">রকেট রেট (Rocket Rate BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.rocket || ""}
                      onChange={(e) => setExchange({ ...exchange, rocket: e.target.value })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs font-semibold outline-none bg-[#F9FAFB] font-sans"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#6B7280]">ব্যাংক ট্রান্সফার রেট (Bank Transfer BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.bank}
                      onChange={(e) => setExchange({ ...exchange, bank: e.target.value })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs font-semibold outline-none bg-[#F9FAFB] font-sans"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#6B7280]">সাধারণ ১ ডলার এক্সচেঞ্জ লিমিট রেট (USD rate):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.usdRate}
                      onChange={(e) => setExchange({ ...exchange, usdRate: e.target.value })}
                      className="w-full border rounded-xl px-3 h-[44px] text-xs font-semibold outline-none bg-[#F9FAFB] font-sans"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#1B4F72] text-white h-[48px] rounded-xl text-xs font-semibold transition-all hover:opacity-95 cursor-pointer"
                >
                  এক্সচেঞ্জ রেট সেভ করুন
                </button>
              </form>
            )}

            {/* ==== DEPOSIT TAB ==== */}
            {activeTab === "deposit" && (
              <div className="space-y-4">
                {/* Subtabs selector */}
                <div className="flex bg-white rounded-xl p-1 border select-none text-xs" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                  <button
                    onClick={() => setDepositSubTab("requests")}
                    className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                      depositSubTab === "requests"
                        ? "bg-[#1B4F72] text-white"
                        : "text-[#6B7280] hover:bg-gray-50"
                    }`}
                  >
                    নতুন ডিপোজিট অনুরোধ ({depositRequests.filter(r => r.status === "pending").length})
                  </button>
                  <button
                    onClick={() => setDepositSubTab("methods")}
                    className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                      depositSubTab === "methods"
                        ? "bg-[#1B4F72] text-white"
                        : "text-[#6B7280] hover:bg-gray-50"
                    }`}
                  >
                    পেমেন্ট মেথড গেটওয়ে
                  </button>
                </div>

                {depositSubTab === "requests" && (
                  <div className="space-y-2">
                    {depositRequests.length === 0 ? (
                      <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-5 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো ডিপোজিট অনুরোধ নেই।</p>
                    ) : (
                      depositRequests.map((item) => {
                        const dateText = getMinutesAgoText(item.createdAt);
                        const displayImage = item.proofImageUrl || item.screenshotUrl;
                        return (
                          <div 
                            key={item.id} 
                            className="bg-white border rounded-[14px] p-4 flex flex-col gap-3 text-left" 
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[13px] font-medium text-[#1B4F72] font-mono">অনুরোধ আইডি: {item.id}</p>
                                <p className="text-[11px] text-gray-500 font-mono mt-0.5">ইউজার আইডি: {item.userId || "PS-000000"}</p>
                              </div>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-sans ${
                                item.status === "verified" ? "bg-[#E9F7EF] text-[#1D9E75]" :
                                item.status === "rejected" ? "bg-red-50 text-[#E74C3C]" : "bg-amber-50 text-amber-600"
                              }`}>
                                {item.status === "verified" ? "অনুমোদিত (Verified)" :
                                 item.status === "rejected" ? "বাতিল (Rejected)" : "অপেক্ষমান (Pending)"}
                              </span>
                            </div>

                            <div className="flex justify-between items-center bg-[#F9FAFB] p-3 rounded-xl">
                              <div>
                                <p className="text-[18px] font-semibold text-[#1A1A2E] font-sans">${item.amount} USD</p>
                                {item.calculatedBdt ? (
                                  <p className="text-[12px] font-medium text-[#1D9E75] font-sans mt-0.5">⇄৳{item.calculatedBdt} BDT</p>
                                ) : null}
                                <div className="flex items-center space-x-1.5 mt-1 font-sans">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.methodColor || "#1B4F72" }} />
                                  <span className="text-xs text-gray-700 font-medium">{item.methodName || "বিকাশ"}</span>
                                </div>
                              </div>

                              {displayImage && (
                                <img 
                                  src={displayImage} 
                                  alt="Screenshot Thumbnail" 
                                  onClick={() => setViewingImage(displayImage)}
                                  className="w-[80px] h-[80px] object-cover rounded-lg border border-[#E5E7EB] cursor-pointer hover:opacity-90 bg-gray-50 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                            </div>

                            <div className="text-[12px] text-gray-500 font-sans space-y-1">
                              <p><strong>ইউজার নাম:</strong> <span className="text-gray-800 font-medium">{item.senderName || "প্রবাসী ইউজার"}</span></p>
                              {item.senderPhone ? (
                                <p><strong>ইউজার মোবাইল:</strong> <span className="text-gray-800 font-medium">{item.senderPhone}</span></p>
                              ) : null}
                              <p><strong>Cambodia Tx ID:</strong> <span className="font-mono text-gray-700 font-bold">{item.transactionId || "N/A"}</span></p>
                              <p className="text-[11px] text-[#6B7280]">অনুরোধ সময়: {dateText}</p>
                            </div>

                            {item.status === "pending" && (
                              <div className="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => startVerifyDeposit(item)}
                                  className="flex-1 bg-[#1D9E75] text-white hover:opacity-95 text-[13px] font-semibold h-[40px] rounded-[10px] select-none transition-all cursor-pointer"
                                >
                                  যাচাই করুন
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectDeposit(item.id)}
                                  className="flex-1 bg-[#E74C3C] text-white hover:opacity-90 text-[13px] font-semibold h-[40px] rounded-[10px] select-none transition-all cursor-pointer"
                                >
                                  বাতিল
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {depositSubTab === "methods" && (
                  <div className="space-y-4">
                    
                    {/* Add New Method Form */}
                    <form onSubmit={handleAddPaymentMethod} className="bg-white border rounded-2xl p-5 space-y-3" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                      <h3 className="text-sm font-semibold text-[#1B4F72] flex items-center space-x-1.5 mb-1">
                        <Plus className="w-4 h-4 text-[#1B4F72]" />
                        <span>নতুন পেমেন্ট গেটওয়ে সংযুক্তি</span>
                      </h3>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[#6B7280]">গেটওয়ে নাম:</label>
                          <input 
                            type="text" 
                            required
                            placeholder="যেমন: Rocket বা CellFin"
                            value={newMethodName}
                            onChange={(e) => setNewMethodName(e.target.value)}
                            className="w-full border rounded-xl px-2.5 py-1.5 text-xs outline-none bg-[#F9FAFB]"
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[#6B7280]">দেশ/কান্ট্রি:</label>
                          <select
                            value={newMethodCountry}
                            onChange={(e) => setNewMethodCountry(e.target.value as "BD" | "KH")}
                            className="w-full border rounded-xl px-2.5 py-1.5 text-xs outline-none bg-[#F9FAFB]"
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          >
                            <option value="BD">🇧🇩 বাংলাদেশ (BDT)</option>
                            <option value="KH">🇰🇭 কম্বোডিয়া (USD)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-left">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[11px] font-medium text-[#6B7280]">প্রাপক হিসাব (Account Details):</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Personal ০১৭xxxxxx বা ABA xxxxx"
                            value={newMethodAccount}
                            onChange={(e) => setNewMethodAccount(e.target.value)}
                            className="w-full border rounded-xl px-2.5 py-1.5 text-xs outline-none bg-[#F9FAFB]"
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[#6B7280]">কালার কোড:</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={newMethodColor}
                              onChange={(e) => setNewMethodColor(e.target.value)}
                              className="w-8 h-7 p-0 border border-gray-200 rounded cursor-pointer shrink-0"
                            />
                            <span className="text-[10px] font-mono select-all text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">{newMethodColor}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#1B4F72] text-white py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-95 cursor-pointer"
                      >
                        গেটওয়ে যুক্ত করুন
                      </button>
                    </form>

                    {/* Listing existing methods separated by BD and KH countries */}
                    <div className="space-y-4 text-left">
                      
                      {/* BD Methods group */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#1B4F72] border-l-2 border-[#1B4F72] pl-2">🇧🇩 বাংলাদেশী পেমেন্ট পদ্ধতি সমূহ (BDT):</h4>
                        {bdMethods.length === 0 ? (
                          <p className="text-xs text-gray-400 bg-white border border-[#E5E7EB] rounded-xl p-3 text-center italic">কোনো বাংলাদেশী মেথড নেই</p>
                        ) : (
                          bdMethods.map((item) => (
                            <div key={item.id} className="bg-white border rounded-xl p-3 flex flex-col gap-2" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                  <span className="text-xs font-bold text-[#1A1A2E]">{item.name}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 select-none font-sans">
                                  <span className="text-[10px] text-gray-500">{item.isActive ? "সক্রিয়" : "বন্ধ"}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMethodActive(item.id, item.isActive)}
                                    className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer ${
                                      item.isActive ? "bg-[#1D9E75]" : "bg-gray-300"
                                    }`}
                                  >
                                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                      item.isActive ? "translate-x-4" : "translate-x-0"
                                    }`} />
                                  </button>
                                </div>
                              </div>

                              <div className="flex justify-between items-center gap-3">
                                <div className="text-xs text-gray-600 flex-1 font-sans">
                                  <p><strong>হিসাব:</strong> {item.accountName}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">অর্ডার: {item.order}</p>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                  {item.qrImageUrl ? (
                                    <img 
                                      src={item.qrImageUrl} 
                                      alt="QR Preview" 
                                      onClick={() => setViewingImage(item.qrImageUrl)}
                                      className="w-[44px] h-[44px] object-contain rounded border bg-gray-50 cursor-pointer"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[10px] text-amber-600 italic shrink-0">QR নেই</span>
                                  )}
                                  <label className="text-[10px] bg-blue-50 text-[#1B4F72] border border-blue-100 px-2.5 py-1.5 rounded-xl cursor-pointer font-semibold shrink-0">
                                    QR আপলোড
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleUploadQR(item.id, e)} 
                                      className="hidden" 
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* KH Methods group */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#1B4F72] border-l-2 border-[#1B4F72] pl-2">🇰🇭 কম্বোডিয়ান পেমেন্ট পদ্ধতি সমূহ (USD):</h4>
                        {khMethods.length === 0 ? (
                          <p className="text-xs text-gray-400 bg-white border border-[#E5E7EB] rounded-xl p-3 text-center italic">কোনো কম্বোডিয়ান মেথড নেই</p>
                        ) : (
                          khMethods.map((item) => (
                            <div key={item.id} className="bg-white border rounded-xl p-3 flex flex-col gap-2" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                  <span className="text-xs font-bold text-[#1A1A2E]">{item.name}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 select-none font-sans">
                                  <span className="text-[10px] text-gray-500">{item.isActive ? "সক্রিয়" : "বন্ধ"}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMethodActive(item.id, item.isActive)}
                                    className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer ${
                                      item.isActive ? "bg-[#1D9E75]" : "bg-gray-300"
                                    }`}
                                  >
                                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                      item.isActive ? "translate-x-4" : "translate-x-0"
                                    }`} />
                                  </button>
                                </div>
                              </div>

                              <div className="flex justify-between items-center gap-3">
                                <div className="text-xs text-gray-600 flex-1 font-sans">
                                  <p><strong>হিসাব:</strong> {item.accountName}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">অর্ডার: {item.order}</p>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                  {item.qrImageUrl ? (
                                    <img 
                                      src={item.qrImageUrl} 
                                      alt="QR Preview" 
                                      onClick={() => setViewingImage(item.qrImageUrl)}
                                      className="w-[44px] h-[44px] object-contain rounded border bg-gray-50 cursor-pointer"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[10px] text-amber-600 italic shrink-0">QR নেই</span>
                                  )}
                                  <label className="text-[10px] bg-blue-50 text-[#1B4F72] border border-blue-100 px-2.5 py-1.5 rounded-xl cursor-pointer font-semibold shrink-0">
                                    QR আপলোড
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleUploadQR(item.id, e)} 
                                      className="hidden" 
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==== MONEY TRANSFER SYSTEM TAB ==== */}
            {activeTab === "transfer" && (
              <div className="space-y-4">
                
                {/* Sub-tabs selector for Transfer Dashboard */}
                <div className="flex bg-white rounded-xl p-1 border select-none text-xs" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                  <button
                    onClick={() => setTransferSubTab("new")}
                    className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                      transferSubTab === "new"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    নতুন অনুরোধ ({transferRequests.filter(r => r.status === "pending").length})
                  </button>
                  <button
                    onClick={() => setTransferSubTab("processing")}
                    className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                      transferSubTab === "processing"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    প্রক্রিয়াধীন ({transferRequests.filter(r => r.status === "processing" || r.status === "sent").length})
                  </button>
                  <button
                    onClick={() => setTransferSubTab("completed")}
                    className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                      transferSubTab === "completed"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    সম্পন্ন/বাতিল ({transferRequests.filter(r => r.status === "completed" || r.status === "failed").length})
                  </button>
                </div>

                {/* Filtering transfer items based on subtab */}
                <div className="space-y-2">
                  {transferRequests.filter(r => {
                    if (transferSubTab === "new") return r.status === "pending";
                    if (transferSubTab === "processing") return r.status === "processing" || r.status === "sent";
                    return r.status === "completed" || r.status === "failed";
                  }).length === 0 ? (
                    <p className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl p-6 text-center italic text-left">
                      এই ক্যাটাগরিতে কোনো ট্রান্সফার অনুরোধ পাওয়া যায়নি ভাই।
                    </p>
                  ) : (
                    transferRequests.filter(r => {
                      if (transferSubTab === "new") return r.status === "pending";
                      if (transferSubTab === "processing") return r.status === "processing" || r.status === "sent";
                      return r.status === "completed" || r.status === "failed";
                    }).map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border rounded-[14px] p-4 space-y-3 text-left font-sans"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        {/* Header info */}
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <p className="text-[13px] font-medium text-[#1B4F72] font-mono">{item.id}</p>
                            <p className="text-[10px] text-[#6B7280]">ইউজার আইডি: {item.userId || "N/A"}</p>
                          </div>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                            item.status === "completed" ? "bg-[#E9F7EF] text-[#1D9E75] border border-[#D4EFDF]" :
                            item.status === "failed" ? "bg-red-50 text-red-600 border border-red-100" :
                            item.status === "processing" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            item.status === "sent" ? "bg-[#EBF5FB] text-[#1B6CA8] border border-[#D4E6F1]" :
                            "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {item.status === "completed" ? "সম্পন্ন" :
                             item.status === "failed" ? "বাতিল" :
                             item.status === "processing" ? "প্রসেসিং" :
                             item.status === "sent" ? "পাঠানো হচ্ছে" : "নতুন (Pending)"}
                          </span>
                        </div>

                        {/* Main grid fields */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-[#6B7280] text-[10px] block">প্রেরক নাম:</span>
                            <span className="font-semibold text-gray-800">{item.senderName}</span>
                          </div>
                          <div>
                            <span className="text-[#6B7280] text-[10px] block">প্রেরক ফোন:</span>
                            <span className="font-semibold text-gray-800 font-sans">{item.senderPhone}</span>
                          </div>

                          <div className="col-span-2 border-t border-gray-100/60 my-0.5" />

                          <div>
                            <span className="text-[#6B7280] text-[10px] block">পাঠানো পরিমাণ:</span>
                            <span className="font-bold text-[#1B4F72]">${item.amount} USD</span>
                            {/* Always preserve rate logic */}
                            <p className="text-[10.5px] text-[#1D9E75] font-semibold mt-0.5">রিসিভ পাবেন: {(item.amount * 110.8).toFixed(1)} BDT</p>
                          </div>

                          <div>
                            <span className="text-[#6B7280] text-[10px] block">প্রাপকের চ্যানেল/ফোন:</span>
                            <span className="font-bold text-gray-800">{item.recipientMethod ? item.recipientMethod.toUpperCase() : "BKASH"}</span>
                            <p className="font-mono text-gray-700 mt-0.5 font-bold">{item.recipientPhone}</p>
                          </div>

                          {item.recipientMethod === "bank" && (
                            <div className="col-span-2 bg-gray-100 p-2 rounded-lg text-[10px] text-gray-700 mt-1">
                              <p>🏦 <strong>ব্যাংক:</strong> {item.recipientBank}</p>
                              <p>💳 <strong>অ্যাকাউন্ট:</strong> {item.recipientAccount}</p>
                            </div>
                          )}

                          <div className="col-span-2 border-t border-gray-100/60 my-0.5" />

                          <div className="col-span-2">
                            <span className="text-[#6B7280] text-[10px] block">Cambodia Reference/Tx ID:</span>
                            <p className="font-mono text-gray-900 font-bold select-all bg-gray-100 p-1 rounded inline-block text-xs">{item.transactionId || "N/A"}</p>
                          </div>

                          {item.screenshotUrl && (
                            <div className="col-span-2">
                              <span className="text-[#6B7280] text-[10px] block mb-1">ইউজার আপলোডকৃত স্ক্রিনশট:</span>
                              <img 
                                src={item.screenshotUrl} 
                                alt="screenshot" 
                                onClick={() => setViewingImage(item.screenshotUrl)}
                                className="w-full max-h-[140px] object-contain rounded border bg-gray-100 cursor-zoom-in hover:opacity-90 transition-all"
                              />
                            </div>
                          )}

                          {item.rejectReason && (
                            <div className="col-span-2 p-2.5 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] leading-relaxed">
                              ❌ <strong>বাতিল করার কারণ:</strong> {item.rejectReason}
                            </div>
                          )}

                          {item.proofSentImageUrl && (
                            <div className="col-span-2">
                              <span className="text-[#1D9E75] text-[10px] block font-bold mb-1">🏦 প্রেরিত টাকা পাঠানোর প্রমাণ (স্ক্রিনশট):</span>
                              <img 
                                src={item.proofSentImageUrl} 
                                alt="proof screenshot" 
                                onClick={() => setViewingImage(item.proofSentImageUrl)}
                                className="w-full max-h-[140px] object-contain rounded border bg-emerald-50/50 cursor-zoom-in hover:opacity-90 transition-all border-emerald-100"
                              />
                              {item.durationMinutes && (
                                <p className="text-[10px] text-gray-400 mt-1">সম্পন্ন করতে সময় লেগেছে: {item.durationMinutes} মিনিট</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for transfer requests based on status */}
                        <div className="flex gap-2 pt-1">
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStartProcessingTransfer(item.id)}
                                className="bg-[#1B4F72] text-white text-[13px] font-semibold flex-1 py-2 rounded-[10px] select-none cursor-pointer hover:bg-opacity-95"
                              >
                                প্রসেসিং করুন
                              </button>
                              <button
                                onClick={() => handleStartSentTransfer(item.id)}
                                className="bg-[#1B6CA8] text-white text-[13px] font-semibold flex-1 py-2 rounded-[10px] select-none cursor-pointer hover:bg-opacity-95"
                              >
                                সেন্ড করুন
                              </button>
                              <button
                                onClick={() => setSelectedRejectTransfer(item)}
                                className="bg-[#E74C3C] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] select-none cursor-pointer hover:opacity-90"
                              >
                                বাতিল
                              </button>
                            </>
                          )}

                          {item.status === "processing" && (
                            <>
                              <button
                                onClick={() => handleStartSentTransfer(item.id)}
                                className="bg-[#1B6CA8] text-white text-[13px] font-semibold flex-1 py-2 rounded-[10px] select-none cursor-pointer hover:bg-opacity-95"
                              >
                                সেন্ড করুন (Mark Sent)
                              </button>
                              <button
                                onClick={() => setSelectedRejectTransfer(item)}
                                className="bg-[#E74C3C] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] select-none cursor-pointer hover:opacity-90"
                              >
                                বাতিল
                              </button>
                            </>
                          )}

                          {item.status === "sent" && (
                            <>
                              <button
                                onClick={() => setSelectedCompletedTransfer(item)}
                                className="bg-[#1D9E75] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] select-none cursor-pointer hover:opacity-95"
                              >
                                সম্পন্ন
                              </button>
                              <button
                                onClick={() => setSelectedRejectTransfer(item)}
                                className="bg-[#E74C3C] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] select-none cursor-pointer hover:opacity-90"
                              >
                                বাতিল
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ==== JOBS TAB ==== */}
            {activeTab === "jobs" && (
              <div className="space-y-4">
                {/* Job board administrative sub-tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 overflow-x-auto scrollbar-none gap-1">
                  {[
                    { id: "verify_employers", label: "নিয়োগকর্তা যাচাই (" + employers.filter(e => e.verificationStatus === "pending").length + ")" },
                    { id: "employers", label: "নিয়োগকর্তা (" + employers.length + ")" },
                    { id: "jobs", label: "চাকরি (" + jobs.length + ")" },
                    { id: "applications", label: "আবেদন (" + jobApplications.length + ")" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setJobSubTab(sub.id as any)}
                      className={`flex-1 min-w-[100px] py-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer outline-none ${
                        jobSubTab === sub.id
                          ? "bg-[#1B4F72] text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Sub-tab 0: Employer Verification Queue */}
                {jobSubTab === "verify_employers" && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-[#6B7280] text-left">নিয়োগকর্তা ও জামানত যাচাই প্যানেল:</h3>
                    {employers.length === 0 ? (
                      <p className="text-xs text-[#6B7280] italic py-4 text-center bg-white rounded-xl border" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো নিয়োগকর্তা নিবন্ধন পাওয়া যায়নি ভাই।</p>
                    ) : (
                      employers.map((emp) => {
                        const deposit = employerDeposits.find(d => d.employerId === emp.id);
                        return (
                          <div 
                            key={emp.id} 
                            className="bg-white border p-4 rounded-[14px] space-y-4 text-left font-sans"
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          >
                            <div className="flex justify-between items-start gap-2 border-b pb-2">
                              <div>
                                <h4 className="text-sm font-medium text-[#1A1A2E]">{emp.fullName} ({emp.phone})</h4>
                                <p className="text-xs text-[#6B7280] mt-0.5">কোম্পানি: <span className="font-medium text-[#1A1A2E]">{emp.companyName}</span></p>
                                <p className="text-[10px] text-gray-400 mt-1">রেজিস্ট্রেশন: {emp.createdAt ? new Date(emp.createdAt).toLocaleString('bn-BD') : "তারিখ পাওয়া যায়নি"}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-gray-400">ভেরিফিকেশন:</span>
                                  <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                    emp.verificationStatus === "verified" ? "bg-emerald-50 text-[#1D9E75] border border-emerald-100" :
                                    emp.verificationStatus === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    emp.verificationStatus === "rejected" ? "bg-rose-50 text-[#E74C3C] border border-rose-100" :
                                    "bg-red-100 text-red-700 border border-red-200"
                                  }`} style={{ borderWidth: "0.5px" }}>
                                    {emp.verificationStatus === "pending" && "অপেক্ষায়"}
                                    {emp.verificationStatus === "verified" && "যাচাইকৃত"}
                                    {emp.verificationStatus === "rejected" && "প্রত্যাখ্যাত"}
                                    {emp.verificationStatus === "blocked" && "ব্লক"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-gray-400">জামানত:</span>
                                  <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                    emp.depositStatus === "verified" || emp.depositStatus === "paid" ? "bg-emerald-50 text-[#1D9E75] border border-emerald-100" :
                                    emp.depositStatus === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    emp.depositStatus === "refunded" ? "bg-blue-50 text-[#1B4F72] border border-blue-100" :
                                    "bg-rose-50 text-[#E74C3C] border border-rose-100"
                                  }`} style={{ borderWidth: "0.5px" }}>
                                    {(!emp.depositStatus || emp.depositStatus === "pending") && "যাচাই বাকি"}
                                    {(emp.depositStatus === "verified" || emp.depositStatus === "paid") && "যাচাই হয়েছে"}
                                    {emp.depositStatus === "refunded" && "ফেরত দেওয়া হয়েছে"}
                                    {emp.depositStatus === "forfeited" && "বাজেয়াপ্ত"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2.5 rounded-xl">
                              <div>
                                <span className="text-[11px] text-gray-500 block mb-1">ছবি (Selfie):</span>
                                {emp.selfieUrl ? (
                                  <img 
                                    onClick={() => setViewingImage(emp.selfieUrl)}
                                    src={emp.selfieUrl} 
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 bg-white"
                                    alt="Selfie"
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 border border-dashed">ছবি নেই</div>
                                )}
                              </div>
                              <div>
                                <span className="text-[11px] text-gray-500 block mb-1">পাসপোর্ট/NID স্ক্যান:</span>
                                {emp.passportUrl ? (
                                  <img 
                                    onClick={() => setViewingImage(emp.passportUrl)}
                                    src={emp.passportUrl} 
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 bg-white"
                                    alt="Passport"
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 border border-dashed">ছবি নেই</div>
                                )}
                              </div>
                            </div>

                            <div className="border border-gray-200 rounded-xl p-3 space-y-2.5 bg-white" style={{ borderWidth: "0.5px" }}>
                              <h5 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ডিপোজিট ট্রানজেকশন তথ্য:</h5>
                              <div className="flex gap-4 items-start">
                                {deposit?.screenshotUrl ? (
                                  <div className="shrink-0">
                                    <span className="text-[10px] text-gray-400 block mb-0.5">রিসিট স্ক্রিনশট:</span>
                                    <img 
                                      onClick={() => setViewingImage(deposit.screenshotUrl)}
                                      src={deposit.screenshotUrl} 
                                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 bg-gray-50"
                                      alt="Deposit Screenshot"
                                    />
                                  </div>
                                ) : (
                                  <div className="shrink-0">
                                    <span className="text-[10px] text-gray-400 block mb-0.5">রিসিট স্ক্রিনশট:</span>
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400 border border-dashed">ছবি নেই</div>
                                  </div>
                                )}
                                <div className="flex-1 space-y-1 text-xs">
                                  <p className="text-gray-600">জামানত পরিমাণ: <span className="font-bold text-[#1A1A2E] font-sans">${deposit?.amount || emp.depositAmount || 20} USD</span></p>
                                  <p className="text-gray-600">পেমেন্ট মেথড: <span className="font-semibold text-gray-850">{deposit?.paymentMethod || "বিকাশ/নগদ"}</span></p>
                                  <p className="text-gray-600">ট্রানজেকশন আইডি: <span className="font-mono font-bold text-[#1B4F72] break-all">{deposit?.transactionId || "পাওয়া যায়নি"}</span></p>
                                  {deposit?.refundReason && (
                                    <p className="text-red-600 text-[11px] italic bg-red-50 px-2 py-1 rounded-md mt-1">মন্তব্য/কারণ: {deposit.refundReason}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {actioningEmployerId === emp.id && inlineActionType && (
                              <div className="bg-[#F7F8FA] border border-gray-200 rounded-xl p-3 space-y-2 text-left" style={{ borderWidth: "0.5px" }}>
                                <label className="text-[11px] font-semibold text-gray-600 block">
                                  {inlineActionType === "reject" ? "প্রত্যাখ্যানের কারণ লিখুন (নিয়োগকর্তা নোটিফিকেশন পাবেন):" : "বাজেয়াপ্ত করার কারণ লিখুন (জামানত রিসিটে দেখা যাবে):"}
                                </label>
                                <textarea
                                  value={inlineNoteText}
                                  onChange={(e) => setInlineNoteText(e.target.value)}
                                  placeholder={inlineActionType === "reject" ? "যেমন: পাসপোর্টের ছবি পরিষ্কার নয় বা ভুল তথ্য দেওয়া হয়েছে।" : "যেমন: ফেক ট্রানজেকশন রিসিট আপলোড বা প্রতারণার কারণে জামানত বাজেয়াপ্ত করা হলো।"}
                                  rows={2}
                                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs outline-none font-sans resize-none"
                                  style={{ borderWidth: "0.5px" }}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setActioningEmployerId(null);
                                      setInlineActionType(null);
                                      setInlineNoteText("");
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 hover:text-black bg-gray-100 rounded-lg cursor-pointer"
                                  >
                                    বাতিল
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (inlineActionType === "reject") {
                                        handleRejectEmployerVerifySubTab(emp, inlineNoteText);
                                      } else {
                                        handleForfeitEmployerVerifySubTab(emp, inlineNoteText);
                                      }
                                    }}
                                    className={`px-3 py-1 text-[11px] font-semibold text-white rounded-lg cursor-pointer ${
                                      inlineActionType === "reject" ? "bg-[#E74C3C] hover:opacity-90" : "bg-amber-600 hover:opacity-90"
                                    }`}
                                  >
                                    নিশ্চিত করুন
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2 pt-2 border-t border-dashed font-sans">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleVerifyEmployerVerifySubTab(emp)}
                                  disabled={emp.verificationStatus === "verified"}
                                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    emp.verificationStatus === "verified"
                                      ? "bg-emerald-100 text-[#1D9E75] opacity-60 cursor-not-allowed"
                                      : "bg-[#1D9E75] text-white hover:opacity-90 shadow-sm"
                                  }`}
                                >
                                  ✓ যাচাই করুন
                                </button>
                                <button
                                  onClick={() => {
                                    setActioningEmployerId(emp.id);
                                    setInlineActionType("reject");
                                    setInlineNoteText("");
                                  }}
                                  disabled={emp.verificationStatus === "rejected"}
                                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    emp.verificationStatus === "rejected"
                                      ? "bg-rose-100 text-[#E74C3C] opacity-60 cursor-not-allowed"
                                      : "bg-[#E74C3C] text-white hover:opacity-90 shadow-sm"
                                  }`}
                                >
                                  ✗ প্রত্যাখ্যান
                                </button>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRefundEmployerVerifySubTab(emp)}
                                  disabled={emp.depositStatus === "refunded"}
                                  className={`flex-1 py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                    emp.depositStatus === "refunded"
                                      ? "bg-blue-100 text-[#1B4F72] opacity-60 cursor-not-allowed"
                                      : "bg-[#1B4F72] text-white hover:opacity-90 shadow-sm"
                                  }`}
                                >
                                  💰 জামানত ফেরত
                                </button>
                                <button
                                  onClick={() => {
                                    setActioningEmployerId(emp.id);
                                    setInlineActionType("forfeit");
                                    setInlineNoteText("");
                                  }}
                                  disabled={emp.depositStatus === "forfeited"}
                                  className={`flex-1 py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                    emp.depositStatus === "forfeited"
                                      ? "bg-amber-100 text-amber-700 opacity-60 cursor-not-allowed"
                                      : "bg-amber-500 text-white hover:opacity-90 shadow-sm"
                                  }`}
                                >
                                  🚫 বাজেয়াপ্ত
                                </button>
                                <button
                                  onClick={() => handleBlockEmployerVerifySubTab(emp)}
                                  disabled={emp.verificationStatus === "blocked"}
                                  className={`flex-1 py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                    emp.verificationStatus === "blocked"
                                      ? "bg-red-200 text-red-800 opacity-60 cursor-not-allowed"
                                      : "bg-red-800 text-white hover:opacity-90 shadow-sm"
                                  }`}
                                >
                                  🔒 ব্লক
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Sub-tab 1: Employers Management */}
                {jobSubTab === "employers" && (
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-semibold text-[#6B7280] text-left">নিবন্ধিত নিয়োগকর্তা তালিকা:</h3>
                    {employers.length === 0 ? (
                      <p className="text-xs text-[#6B7280] italic py-4 text-center bg-white rounded-xl border" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো নিয়োগকর্তা নিবন্ধন পাওয়া যায়নি ভাই।</p>
                    ) : (
                      employers.map((emp) => (
                        <div 
                          key={emp.id} 
                          className="bg-white border p-4 rounded-[14px] space-y-3 text-left font-sans"
                          style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                        >
                          <div className="flex justify-between items-start gap-2 border-b pb-2">
                            <div>
                              <h4 className="text-xs font-bold text-[#1A1A2E]">{emp.fullName}</h4>
                              <p className="text-[10px] text-[#6B7280] font-sans">UserId: {emp.userId}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{emp.createdAt ? new Date(emp.createdAt).toLocaleString('bn-BD') : ""}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold ${
                                emp.verificationStatus === "verified" ? "bg-emerald-50 text-[#1D9E75] border border-emerald-100" :
                                emp.verificationStatus === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                "bg-red-50 text-red-600 border border-red-100"
                              }`}>
                                {emp.verificationStatus === "verified" && "ভেরিফাইড"}
                                {emp.verificationStatus === "pending" && "পেন্ডিং রিভিউ"}
                                {emp.verificationStatus === "rejected" && "রিজেক্টেড"}
                                {emp.verificationStatus === "blocked" && "ব্লকড"}
                              </span>
                              <div className="text-[9px] text-gray-500">
                                ডিপোজিট: <span className="font-bold font-sans">${emp.depositAmount || 20}</span> ({emp.depositStatus === "paid" ? "পেইড" : emp.depositStatus === "pending" ? "পেন্ডিং" : emp.depositStatus === "refunded" ? "ফেরত" : "বাজেয়াপ্ত"})
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-700 font-sans">
                            <div>
                              <span className="text-[#6B7280] block text-[10px]">কোম্পানি নাম:</span>
                              <span className="font-semibold text-gray-950">{emp.companyName}</span>
                            </div>
                            <div>
                              <span className="text-[#6B7280] block text-[10px]">যোগাযোগ ফোন:</span>
                              <span className="font-semibold text-gray-950 font-mono">{emp.phone}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[#6B7280] block text-[10px]">কোম্পানি ঠিকানা:</span>
                              <span className="text-gray-950">{emp.companyAddress}</span>
                            </div>
                          </div>

                          {/* Image Attachments */}
                          <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <div>
                              <span className="text-[10px] text-gray-400 block mb-1">ছবি (Selfie):</span>
                              {emp.selfieUrl ? (
                                <img 
                                  onClick={() => setViewingImage(emp.selfieUrl)}
                                  src={emp.selfieUrl} 
                                  className="w-full h-20 object-cover rounded-lg border border-gray-100 cursor-zoom-in hover:opacity-90"
                                  alt="Selfie"
                                />
                              ) : (
                                <div className="w-full h-20 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] text-gray-400">ছবি নেই</div>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block mb-1">পাসপোর্ট/NID স্ক্যান:</span>
                              {emp.passportUrl ? (
                                <img 
                                  onClick={() => setViewingImage(emp.passportUrl)}
                                  src={emp.passportUrl} 
                                  className="w-full h-20 object-cover rounded-lg border border-gray-100 cursor-zoom-in hover:opacity-90"
                                  alt="Passport"
                                />
                              ) : (
                                <div className="w-full h-20 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] text-gray-400">ছবি নেই</div>
                              )}
                            </div>
                          </div>

                          {/* Verification Actions */}
                          {emp.verificationStatus === "pending" && (
                            <div className="flex gap-2 pt-2.5 border-t border-dashed">
                              <button
                                onClick={() => handleVerifyEmployer(emp)}
                                className="flex-1 py-2 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer text-center"
                              >
                                অনুমোদন ও ভেরিফাই
                              </button>
                              <button
                                onClick={() => handleRejectEmployer(emp)}
                                className="py-2 px-3 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer"
                              >
                                রিজেক্ট ও ফেরত
                              </button>
                              <button
                                onClick={() => handleBlockEmployer(emp)}
                                className="py-2 px-3 bg-[#E74C3C] text-white text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer"
                              >
                                ব্লক ও বাজেয়াপ্ত
                              </button>
                            </div>
                          )}

                          {emp.verificationStatus === "verified" && (
                            <div className="flex justify-end pt-2 border-t border-dashed">
                              <button
                                onClick={() => handleBlockEmployer(emp)}
                                className="py-1.5 px-3 bg-red-50 text-[#E74C3C] border border-red-100 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all cursor-pointer"
                              >
                                স্থগিত করুন (Block)
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sub-tab 2: Jobs Management */}
                {jobSubTab === "jobs" && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-[#6B7280] text-left">কর্মসংস্থান ও চাকরি পোস্টসমূহ:</h3>
                    {jobs.length === 0 ? (
                      <p className="text-xs text-[#6B7280] italic py-2 text-left bg-white rounded-xl p-4 border" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো চাকরি পাওয়া যায়নি। ইউজার রিকোয়েস্ট তৈরি হলে এখানে আসবে ভাই।</p>
                    ) : (
                      jobs.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-white border p-4 rounded-[14px] flex flex-col space-y-3 text-left"
                          style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                        >
                          <div className="flex justify-between items-start space-x-2">
                            <div className="flex-1 space-y-1">
                              <h4 className="text-xs font-medium text-[#1A1A2E]">{item.title}</h4>
                              <p className="text-[11px] text-[#6B7280] font-sans">{item.company} • {item.location}</p>
                              <p className="text-[11px] font-medium text-[#1D9E75]">{item.salaryRange || item.salary}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 font-sans">{item.description}</p>
                              
                              <div className="flex space-x-1.5 items-center mt-2 flex-wrap gap-1 font-sans">
                                {(!item.isVerified && item.isActive === false && !item.isRejected) && (
                                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-[#FEF3CD] text-[#7D5000]">⏳ যাচাই হচ্ছে</span>
                                )}
                                {(item.isVerified && item.isActive === true) && (
                                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-[#E8F8F1] text-[#0F6E56]">✅ প্রকাশিত</span>
                                )}
                                {(item.isActive === false && item.isRejected === true) && (
                                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-[#FDEDEC] text-[#C0392B]">❌ প্রত্যাখ্যাত</span>
                                )}
                                {(item.isActive === false && item.isVerified === true) && (
                                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-[#F0F3F4] text-[#444441]">⏸️ স্থগিত</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col space-y-1.5 shrink-0">
                              {/* Verify/Unverify Toggle */}
                              <button
                                onClick={() => handleToggleJobVerified(item)}
                                className="bg-white border p-1.5 rounded-lg text-xs font-medium text-[#1B4F72] hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                                style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                                title="ভেরিফাইড টগল করুন"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleJobActive(item)}
                                className="bg-white border p-1.5 rounded-lg text-xs font-medium text-[#1B4F72] hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                                style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                                title="অ্যাক্টিভ টগল করুন"
                              >
                                {item.isActive !== false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(item.id)}
                                className="bg-[#E74C3C] text-white p-1.5 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2 border-t border-dashed border-gray-100 font-sans">
                            <button
                              onClick={() => handleApproveJob(item)}
                              className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#1D9E75] hover:opacity-90 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                            >
                              ✓ প্রকাশ করুন
                            </button>
                            <button
                              onClick={() => handleRejectJob(item)}
                              className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#E74C3C] hover:opacity-90 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                            >
                              ✗ প্রত্যাখ্যান
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sub-tab 3: Applications Management */}
                {jobSubTab === "applications" && (
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-semibold text-[#6B7280] text-left">চাকরির আবেদনসমূহ:</h3>
                    {jobApplications.length === 0 ? (
                      <p className="text-xs text-[#6B7280] italic py-4 text-center bg-white rounded-xl border" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো চাকরির আবেদন পাওয়া যায়নি ভাই।</p>
                    ) : (
                      jobApplications.map((app) => (
                        <div 
                          key={app.id} 
                          className="bg-white border p-4 rounded-[14px] space-y-2.5 text-left font-sans"
                          style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                        >
                          <div className="flex justify-between items-start border-b pb-2">
                            <div>
                              <span className="text-[10px] text-gray-400 block">আবেদন আইডি: {app.id}</span>
                              <h4 className="text-xs font-bold text-[#1B4F72]">{app.jobTitle}</h4>
                              <p className="text-[10px] text-gray-500 font-sans">{app.companyName}</p>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                              app.status === "hired" ? "bg-emerald-50 text-[#1D9E75] border border-emerald-100" :
                              app.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                              "bg-red-50 text-red-600 border border-red-100"
                            }`}>
                              {app.status === "hired" && "নিযুক্ত (Hired)"}
                              {app.status === "pending" && "পেন্ডিং রিভিউ"}
                              {app.status === "rejected" && "বাতিলকৃত"}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-700 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-gray-100 font-sans">
                            <p>👤 <strong>আবেদনকারী:</strong> {app.applicantName}</p>
                            <p>📞 <strong>যোগাযোগ:</strong> {app.applicantPhone}</p>
                            <p>📍 <strong>ঠিকানা:</strong> {app.currentLocation}</p>
                            {app.whyApply && (
                              <p className="mt-1 pt-1 border-t border-gray-200/50 text-gray-500 italic">
                                "{app.whyApply}"
                              </p>
                            )}
                          </div>

                          {app.status === "pending" && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => {
                                  if (window.confirm("আপনি কি নিশ্চিতভাবে এই কর্মী নিয়োগ নিশ্চিত করতে চান? এটি নিয়োগকর্তাকে $20 রিফান্ড এবং $10 অতিরিক্ত বোনাস প্রদান করবে ভাই!")) {
                                    handleHireApplicant(app);
                                  }
                                }}
                                className="flex-1 py-1.5 bg-[#1D9E75] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 cursor-pointer"
                              >
                                নিয়োগ নিশ্চিত করুন (Hired)
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("আপনি কি এই আবেদনটি রিজেক্ট করতে চান?")) {
                                    handleRejectApplicant(app);
                                  }
                                }}
                                className="py-1.5 px-3.5 bg-[#E74C3C] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==== JOBS TAB ==== */}
            {activeTab === "jobs" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#6B7280] text-left">কর্মসংস্থান ও চাকরি পোস্টসমূহ:</h3>
                {jobs.length === 0 ? (
                  <p className="text-xs text-[#6B7280] italic py-2 text-left bg-white rounded-xl p-4 border" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো চাকরি পাওয়া যায়নি। ইউজার রিকোয়েস্ট তৈরি হলে এখানে আসবে ভাই।</p>
                ) : (
                  jobs.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white border p-4 rounded-[14px] flex justify-between items-start space-x-2 text-left"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    >
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-medium text-[#1A1A2E]">{item.title}</h4>
                        <p className="text-[11px] text-[#6B7280] font-sans">{item.company} • {item.location}</p>
                        <p className="text-[11px] font-medium text-[#1D9E75]">{item.salary}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 font-sans">{item.description}</p>
                        
                        <div className="flex space-x-1.5 items-center mt-2 flex-wrap gap-1 font-sans">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                            item.isVerified ? "bg-[#E9F7EF] text-[#1D9E75]" : "bg-gray-100 text-[#6B7280]"
                          }`}>
                            {item.isVerified ? "ভেরিফাইড" : "আনভেরিফাইড"}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                            item.isActive ? "bg-blue-50 text-[#1B4F72]" : "bg-red-50 text-[#E74C3C]"
                          }`}>
                            {item.isActive ? "সক্রিয়" : "বন্ধ"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5 shrink-0">
                        {/* Verify/Unverify Toggle */}
                        <button
                          onClick={() => handleToggleJobVerified(item)}
                          className="bg-white border p-1.5 rounded-lg text-xs font-medium text-[#1B4F72] hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                          style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          title="ভেরিফাইড টগল করুন"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleJobActive(item)}
                          className="bg-white border p-1.5 rounded-lg text-xs font-medium text-[#1B4F72] hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                          style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          title="অ্যাক্টিভ টগল করুন"
                        >
                          {item.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(item.id)}
                          className="bg-[#E74C3C] text-white p-1.5 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ==== SCAM REPORTS TAB ==== */}
            {activeTab === "scams" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#6B7280] text-left">দালাল ও স্ক্যামারের বিরুদ্ধে রিপোর্টসমূহ:</h3>
                {scams.length === 0 ? (
                  <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-4 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো স্ক্যাম রিপোর্ট পাওয়া যায়নি এখনও ভাই।</p>
                ) : (
                  scams.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white border p-4 rounded-[14px] space-y-2 text-left"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-medium text-[#E74C3C]">{item.scammerInfo}</h4>
                          <p className="text-[10px] text-[#6B7280] font-sans">রিপোর্টার: {item.reporterName}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-sans ${
                          item.status === 'verified' ? "bg-[#E9F7EF] text-[#1D9E75]" : 
                          item.status === 'rejected' ? "bg-red-50 text-[#E74C3C]" : "bg-amber-50 text-amber-600"
                        }`}>
                          {item.status === 'verified' ? "যাচাইকৃত সত্য" :
                           item.status === 'rejected' ? "বাতিলকৃত" : "তদন্তাধীন (Pending)"}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#1A1A2E] leading-relaxed bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]/50 font-sans">{item.description}</p>
                      
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleUpdateScamStatus(item.id, "verified")}
                          className="bg-[#1D9E75] text-white text-[11px] px-3 py-1.5 rounded-[10px] font-semibold select-none cursor-pointer hover:opacity-95"
                        >
                          সত্য নিশ্চিত (Verify)
                        </button>
                        <button
                          onClick={() => handleUpdateScamStatus(item.id, "rejected")}
                          className="bg-[#E74C3C] text-white text-[11px] px-3 py-1.5 rounded-[10px] font-semibold select-none cursor-pointer hover:opacity-90"
                        >
                          রিজেক্ট (Reject)
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ==== TICKET REQUESTS TAB ==== */}
            {activeTab === "tickets" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#6B7280] text-left">বিমান টিকিট কাটার প্রবাসী ভাইদের আবেদন:</h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-4 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো বিমান টিকিটের বুকিং রিকোয়েস্ট পাওয়া যায়নি এখনও।</p>
                ) : (
                  tickets.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white border p-4 rounded-[14px] space-y-2 text-left"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Plane className="w-5 h-5 text-[#1B4F72] shrink-0" />
                          <div>
                            <h4 className="text-xs font-medium text-[#1A1A2E]">{item.passengerName}</h4>
                            <p className="text-[10px] text-[#6B7280] font-mono leading-none">{item.phone}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-sans ${
                          item.status === 'confirmed' ? "bg-[#E9F7EF] text-[#1D9E75]" : 
                          item.status === 'cancelled' ? "bg-red-50 text-[#E74C3C]" : "bg-amber-50 text-amber-600"
                        }`}>
                          {item.status === 'confirmed' ? "নিশ্চিত টিকিট" :
                           item.status === 'cancelled' ? "বাতিল" : "অপেক্ষমান"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]/50 font-sans">
                        <div>
                          <span className="text-[#6B7280] text-[10px]">কোথা থেকে:</span>
                          <p className="font-semibold text-[#1A1A2E]">{item.routeFrom}</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] text-[10px]">গন্তব্য:</span>
                          <p className="font-semibold text-[#1A1A2E]">{item.routeTo}</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] text-[10px]">ফ্লাইট তারিখ:</span>
                          <p className="font-semibold text-[#1A1A2E] font-mono">{item.date}</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] text-[10px]">যাত্রী সংখ্যা:</span>
                          <p className="font-semibold text-[#1A1A2E]">{item.passengerCount} জন</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleUpdateTicketStatus(item.id, "confirmed")}
                          className="bg-[#1D9E75] text-white text-[11px] px-3 py-1.5 rounded-[10px] font-semibold select-none cursor-pointer hover:opacity-95"
                        >
                          কনফার্ম করুন
                        </button>
                        <button
                          onClick={() => handleUpdateTicketStatus(item.id, "cancelled")}
                          className="bg-[#E74C3C] text-white text-[11px] px-3 py-1.5 rounded-[10px] font-semibold select-none cursor-pointer hover:opacity-90"
                        >
                          বাতিল করুন
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ==== EMERGENCY CONTACTS TAB ==== */}
            {activeTab === "emergency" && (
              <div className="space-y-4">
                {/* Add Form */}
                <form onSubmit={handleAddContact} className="bg-white border rounded-2xl p-5 space-y-3" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>
                  <h3 className="text-sm font-semibold text-[#1B4F72] flex items-center space-x-1 text-left">
                    <Plus className="w-4 h-4 text-[#1B4F72]" />
                    <span>নতুন জরুরি কন্টাক্ট নম্বর যুক্ত করুন</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">সংস্থার নাম:</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: Phnom Penh Hospital"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        className="w-full border rounded-xl px-2.5 py-1.5 text-xs outline-none bg-[#F9FAFB]"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">ফোন নম্বর:</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: 119"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        className="w-full border rounded-xl px-2.5 py-1.5 text-xs outline-none bg-[#F9FAFB] font-sans"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">ক্যাটাগরি:</label>
                      <select
                        value={newContact.category}
                        onChange={(e) => setNewContact({ ...newContact, category: e.target.value })}
                        className="w-full border rounded-xl px-2 py-1.5 text-xs outline-none bg-[#F9FAFB]"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        <option value="দূতাবাস">দূতাবাস</option>
                        <option value="পুলিশ">পুলিশ</option>
                        <option value="হাসপাতাল">হাসপাতাল</option>
                        <option value="জরুরি">জরুরি</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">অর্ডার ক্রম (Order):</label>
                      <input
                        type="number"
                        required
                        value={newContact.order}
                        onChange={(e) => setNewContact({ ...newContact, order: Number(e.target.value) })}
                        className="w-full border rounded-xl px-2.5 py-1.5 text-xs outline-none bg-[#F9FAFB] font-sans"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-medium text-[#6B7280]">সংক্ষিপ্ত বিবরণ (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      placeholder="যেমন: বিপদে ২৪ ঘণ্টা সহায়তা দেবে"
                      value={newContact.description}
                      onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs outline-none bg-[#F9FAFB]"
                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#1B4F72] text-white py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-95 cursor-pointer"
                  >
                    জরুরি নম্বর এড করুন
                  </button>
                </form>

                {/* Contacts list */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#6B7280] text-left">লাইভ সেভ করা কন্টাক্টসমূহ:</h3>
                  {emergency.length === 0 ? (
                    <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-4 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো কন্টাক্ট পাওয়া যায়নি ভাই।</p>
                  ) : (
                    emergency.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border p-4 rounded-[14px] flex justify-between items-center text-left"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs font-semibold text-[#1A1A2E]">{item.name}</p>
                          <div className="flex items-center space-x-1 font-sans">
                            <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.25 rounded font-medium">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-[#6B7280]">ক্রম: {item.order}</span>
                          </div>
                          
                          {editingContactId === item.id ? (
                            <div className="flex items-center space-x-1.5 pt-2">
                              <input
                                type="text"
                                value={editPhoneValue}
                                onChange={(e) => setEditPhoneValue(e.target.value)}
                                className="border text-xs px-2 py-1 rounded outline-none w-36 font-semibold bg-[#F9FAFB] font-sans"
                                style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                              />
                              <button
                                onClick={() => handleUpdateContactPhone(item.id)}
                                className="bg-[#1D9E75] text-white p-1.5 rounded hover:opacity-90 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingContactId(null);
                                  setEditPhoneValue("");
                                }}
                                className="bg-gray-200 text-[#1A1A2E] p-1.5 rounded hover:opacity-90 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs font-medium text-[#1B4F72] mt-1 flex items-center space-x-1 font-sans">
                              <Smartphone className="w-3.5 h-3.5 text-[#6B7280]" />
                              <span>{item.phone}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingContactId(item.id);
                              setEditPhoneValue(item.phone);
                            }}
                            className="bg-white border text-[#1B4F72] hover:bg-gray-50 p-2 rounded-lg flex items-center justify-center cursor-pointer"
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(item.id)}
                            className="bg-[#E74C3C] text-white p-2 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-semibold">রেজিস্টার্ড প্রবাসী ইউজার লিস্ট</h2>
                    <p className="text-[11px] opacity-90 font-sans">মোট ইউজার: {usersList.length} জন</p>
                  </div>
                  <button 
                    onClick={() => fetchTabData("users")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={usersSearchQuery}
                    onChange={(e) => setUsersSearchQuery(e.target.value)}
                    placeholder="নাম, পিএস-আইডি, মোবাইল বা ইমেইল দিয়ে খুঁজুন ভাই..."
                    className="w-full h-11 bg-white text-[#1A1A2E] text-[13px] pl-4 pr-10 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none transition-colors font-sans font-medium"
                    style={{ borderWidth: "0.5px" }}
                  />
                  <span className="absolute right-3.5 top-3 text-[#9CA3AF] text-xs font-sans font-medium">খুঁজুন</span>
                </div>

                {/* Blocked Users Settings Section */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-4" style={{ borderWidth: "0.5px" }}>
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-xs font-semibold text-[#1B4F72] font-sans flex items-center gap-1.5">
                      <span>🛑</span> ব্লকড ইউজার সেটিংস (Custom Block Message & Support)
                    </h3>
                    <p className="text-[10px] text-[#6B7280]">ইউজার অ্যাকাউন্ট ব্লক করা হলে লগইন স্ক্রিনে প্রদর্শিত মেসেজ ও সাপোর্ট নাম্বার পরিবর্তন করুন ভাই</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1A1A2E] mb-1">কাস্টম ব্লকড নোটিশ মেসেজ</label>
                      <textarea
                        rows={2}
                        value={blockSettings.blockMessage || ""}
                        onChange={(e) => setBlockSettings({ ...blockSettings, blockMessage: e.target.value })}
                        placeholder="আপনার অ্যাকাউন্টটি সাময়িকভাবে ব্লক বা সাসপেন্ড করা হয়েছে ভাই..."
                        className="w-full text-xs p-2.5 bg-[#F9FAFB] rounded-lg border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none font-sans"
                        style={{ borderWidth: "0.5px" }}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#1A1A2E] mb-1">সাপোর্ট হোয়াটসঅ্যাপ নাম্বার</label>
                        <input
                          type="text"
                          value={blockSettings.blockWhatsapp || ""}
                          onChange={(e) => setBlockSettings({ ...blockSettings, blockWhatsapp: e.target.value })}
                          placeholder="+855XXXXXXXX"
                          className="w-full h-9 text-xs px-3 bg-[#F9FAFB] rounded-lg border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none font-mono"
                          style={{ borderWidth: "0.5px" }}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveBlockSettings}
                          className="bg-[#1B4F72] text-white text-[11px] font-medium px-4 py-2 rounded-xl cursor-pointer hover:bg-opacity-95 transition-all flex items-center gap-1"
                        >
                          <span>💾 সেটিংস সেভ করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users list container */}
                <div className="space-y-3">
                  {usersList.length === 0 ? (
                    <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-4 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>লোড হচ্ছে বা কোনো ইউজার পাওয়া যায়নি ভাই।</p>
                  ) : (
                    (() => {
                      const filtered = usersList.filter(u => {
                        const q = usersSearchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return (u.name || "").toLowerCase().includes(q) ||
                               (u.email || "").toLowerCase().includes(q) ||
                               (u.phone || "").toLowerCase().includes(q) ||
                               (u.userId || "").toLowerCase().includes(q);
                      });
                      if (filtered.length === 0) {
                        return <p className="text-xs text-[#6B7280] bg-white border rounded-xl p-4 text-center italic" style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}>কোনো ইউজার মেলেনি ভাই।</p>;
                      }
                      return filtered.map((u) => {
                        const isPhoneUser = u.email && u.email.endsWith("@probashi.com");
                        return (
                          <div
                            key={u.id}
                            className="bg-white border p-4 rounded-[14px] space-y-3 text-left font-sans"
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <p className="text-[14px] font-semibold text-[#1A1A2E] font-sans flex items-center space-x-1.5">
                                  <span>{u.name}</span>
                                  {u.isPremium && (
                                    <span className="bg-[#1B4F72] text-white text-[9px] font-bold px-1.5 py-0.25 rounded">VIP</span>
                                  )}
                                  {u.isBlocked && (
                                    <span className="bg-[#E74C3C] text-white text-[9px] font-bold px-1.5 py-0.25 rounded">BLOCKED</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-[#6B7280] font-mono font-bold">আইডি: {u.userId || "N/A"}</p>
                              </div>
                              <span className="text-[10px] text-[#6B7280] bg-[#F7F8FA] px-2 py-0.5 rounded-md">
                                {isPhoneUser ? "ফ্রি মোবাইল অ্যাকাউন্ট" : "ইমেইল অ্যাকাউন্ট"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7280] bg-[#F9FAFB] p-2.5 rounded-xl border border-gray-100" style={{ borderWidth: '0.5px' }}>
                              <div>
                                <p className="font-semibold text-[10px] text-[#9CA3AF]">মোবাইল (WhatsApp):</p>
                                <p className="font-semibold text-[#1A1A2E] font-sans break-all">{u.phone || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-[10px] text-[#9CA3AF]">ইমেইল এড্রেস:</p>
                                <p className="font-semibold text-[#1B4F72] font-sans break-all">{u.email || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-[10px] text-[#9CA3AF]">পাসওয়ার্ড (Password):</p>
                                <p className="font-semibold text-[#E74C3C] font-mono break-all">{u.password || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-[10px] text-[#9CA3AF]">রেফারেল কোড:</p>
                                <p className="font-semibold text-[#1B4F72] font-mono break-all">{u.referralCode || "N/A"}</p>
                              </div>
                              {u.referredBy && (
                                <div className="col-span-2 border-t border-gray-200/50 pt-1">
                                  <p className="font-semibold text-[10px] text-[#9CA3AF]">আমন্ত্রিত (Referred By):</p>
                                  <p className="font-semibold text-[#1A1A2E] font-sans">{u.referredBy} (পেন্ডিং বোনাস: ${u.pendingBonus !== undefined ? u.pendingBonus : 2})</p>
                                </div>
                              )}
                              <div className="col-span-2 border-t border-dashed border-gray-200 pt-1 mt-1 flex justify-between">
                                <div>
                                  <p className="font-semibold text-[10px] text-[#9CA3AF]">মোট সফল ট্রান্সফার:</p>
                                  <p className="font-bold text-[#1D9E75] font-sans">${u.totalCompletedTransfersAmount || 0} USD</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-[10px] text-[#9CA3AF]">নিবন্ধনের তারিখ:</p>
                                  <p className="text-[#1A1A2E] font-mono">{u.createdAt ? new Date(u.createdAt).toLocaleString("bn-BD") : "N/A"}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-[#6B7280]">ব্যালেন্স:</span>
                                {editingUserBalanceId === u.id ? (
                                  <div className="flex items-center space-x-1">
                                    <input
                                      type="number"
                                      value={editingUserBalanceValue}
                                      onChange={(e) => setEditingUserBalanceValue(e.target.value)}
                                      className="border text-xs px-2 py-1 rounded outline-none w-20 font-bold bg-[#F9FAFB] font-sans"
                                      style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                                    />
                                    <button
                                      onClick={() => handleUpdateUserBalance(u.id)}
                                      className="bg-[#1D9E75] text-white text-xs px-2 py-1 rounded-[6px] hover:opacity-90 cursor-pointer text-[11px]"
                                    >
                                      সেভ
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingUserBalanceId(null);
                                        setEditingUserBalanceValue("");
                                      }}
                                      className="bg-gray-100 border text-gray-500 text-xs px-2 py-1 rounded-[6px] hover:bg-gray-200 cursor-pointer text-[11px]"
                                      style={{ borderWidth: "0.5px", borderColor: "#E5E7EB" }}
                                    >
                                      বাতিল
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-sm font-bold text-[#1D9E75] font-sans">${u.balance || 0} USD</span>
                                    <button
                                      onClick={() => {
                                        setEditingUserBalanceId(u.id);
                                        setEditingUserBalanceValue(String(u.balance || 0));
                                      }}
                                      className="text-[10px] text-[#1B4F72] bg-blue-50 border border-blue-100 hover:bg-blue-100 px-1.5 py-0.5 rounded cursor-pointer font-sans"
                                    >
                                      সংশোধন
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex space-x-1.5">
                                <button
                                  onClick={() => handleViewUserHistory(u)}
                                  className="text-[10px] font-semibold px-2 py-1 bg-amber-500 text-white rounded-lg cursor-pointer hover:bg-amber-600 transition-all"
                                >
                                  ইতিহাস
                                </button>
                                <button
                                  onClick={() => handleToggleUserPremium(u.id, !!u.isPremium)}
                                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg cursor-pointer ${
                                    u.isPremium
                                      ? "bg-[#6B7280] text-white"
                                      : "bg-[#1B4F72] text-white"
                                  }`}
                                >
                                  {u.isPremium ? "VIP বাতিল" : "VIP করুন"}
                                </button>
                                 <button
                                  onClick={() => handleToggleUserBlock(u.id, !!u.isBlocked)}
                                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg cursor-pointer ${
                                    u.isBlocked
                                      ? "bg-[#1D9E75] text-white"
                                      : "bg-[#E74C3C] text-white"
                                  }`}
                                >
                                  {u.isBlocked ? "আনব্লক" : "ব্লক"}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name || u.phone || "ইউজার")}
                                  className="text-[10px] font-semibold px-2 py-1 bg-[#E74C3C] text-white rounded-lg cursor-pointer hover:bg-opacity-90 transition-all font-sans"
                                >
                                  ডিলিট
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-semibold">মেইনটেন্যান্স সেটিংস সিস্টেম</h2>
                    <p className="text-[11px] opacity-90 font-sans">অ্যাপ্লিকেশন ও সেবা ব্লক পরিবর্তন করুন</p>
                  </div>
                  <button 
                    onClick={() => fetchTabData("maintenance")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                {/* Global Maintenance Banner Block */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 text-left" style={{ borderWidth: "0.5px" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-[#1A1A2E]">সমগ্র অ্যাপ মেইনটেন্যান্স (Global)</h3>
                      <p className="text-[11px] text-[#6B7280]">এটি চালু করলে সাধারণ ইউজাররা পুরো অ্যাপ্লিকেশন থেকে ব্লকড হয়ে যাবে</p>
                    </div>
                    <button
                      onClick={() => setMaintenanceSettings((prev: any) => ({
                        ...prev,
                        globalMaintenance: !prev.globalMaintenance
                      }))}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        maintenanceSettings.globalMaintenance 
                          ? "bg-[#E74C3C] text-white" 
                          : "bg-gray-100 text-[#6B7280]"
                      }`}
                    >
                      {maintenanceSettings.globalMaintenance ? "সক্রিয় (Maint ON)" : "নিষ্ক্রিয় (OFF)"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E]">রক্ষণাবেক্ষণ বার্তা (Message for Users)</label>
                    <textarea
                      value={maintenanceSettings.maintenanceMessage || ""}
                      onChange={(e) => setMaintenanceSettings((prev: any) => ({
                        ...prev,
                        maintenanceMessage: e.target.value
                      }))}
                      placeholder="মেইনটেন্যান্স চলাকালীন ইউজাররা যে বার্তাটি দেখবে..."
                      className="w-full min-h-[80px] bg-gray-50 border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors resize-y font-sans"
                      style={{ borderWidth: "0.5px" }}
                    />
                  </div>
                </div>

                {/* Individual Services Blocks */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 text-left" style={{ borderWidth: "0.5px" }}>
                  <h3 className="text-sm font-medium text-[#1A1A2E] border-b border-[#F3F4F6] pb-2">সেবা ভিত্তিক মেইনটেন্যান্স (Service Controls)</h3>
                  
                  <div className="space-y-4 divide-y divide-[#F3F4F6]">
                    {[
                      { key: "deposit", label: "ডিপোজিট গেটওয়ে (Deposit)" },
                      { key: "transfer", label: "টাকা ট্রান্সফার (Hundi Transfer)" },
                      { key: "visa", label: "ভিসা তথ্য (Visa Information)" },
                      { key: "ticket", label: "এয়ার টিকেট (Flight Tickets)" },
                      { key: "jobs", label: "চাকরির বোর্ড (Job Board)" },
                      { key: "scam", label: "স্ক্যাম রিপোর্ট (Scam Report)" },
                      { key: "emergency", label: "জরুরি সাহায্য / SOS" }
                    ].map((service, index) => {
                      const serviceObj = maintenanceSettings.services?.[service.key] || { active: true, message: "" };
                      
                      return (
                        <div key={service.key} className={`space-y-2.5 ${index > 0 ? "pt-4" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#1A1A2E]">{service.label}</span>
                            
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setMaintenanceSettings((prev: any) => {
                                    const updatedServices = { ...prev.services };
                                    updatedServices[service.key] = {
                                      ...serviceObj,
                                      active: true
                                    };
                                    return { ...prev, services: updatedServices };
                                  });
                                }}
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg cursor-pointer transition-all ${
                                  serviceObj.active 
                                    ? "bg-[#1D9E75] text-white" 
                                    : "bg-gray-100 text-[#6B7280]"
                                }`}
                              >
                                সক্রিয় (Active)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMaintenanceSettings((prev: any) => {
                                    const updatedServices = { ...prev.services };
                                    updatedServices[service.key] = {
                                      ...serviceObj,
                                      active: false
                                    };
                                    return { ...prev, services: updatedServices };
                                  });
                                }}
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg cursor-pointer transition-all ${
                                  !serviceObj.active 
                                    ? "bg-[#E74C3C] text-white" 
                                    : "bg-gray-100 text-[#6B7280]"
                                }`}
                              >
                                বন্ধ (Maint)
                              </button>
                            </div>
                          </div>

                          {!serviceObj.active && (
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-500 font-medium">কাস্টম সতর্কতা বার্তা (Custom Message)</label>
                              <input
                                type="text"
                                value={serviceObj.message || ""}
                                onChange={(e) => {
                                  setMaintenanceSettings((prev: any) => {
                                    const updatedServices = { ...prev.services };
                                    updatedServices[service.key] = {
                                      ...serviceObj,
                                      message: e.target.value
                                    };
                                    return { ...prev, services: updatedServices };
                                  });
                                }}
                                placeholder="এই সেবা সাময়িকভাবে বন্ধ আছে। কিছুক্ষণের মধ্যে ফিরে আসব।"
                                className="w-full h-9 bg-gray-50 border border-[#E5E7EB] rounded-lg px-3 text-xs text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors"
                                style={{ borderWidth: "0.5px" }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Save Button Action Trigger */}
                <button
                  onClick={handleSaveMaintenanceSettings}
                  className="w-full bg-[#1B4F72] text-white py-3.5 rounded-xl font-medium hover:bg-opacity-95 active:scale-[0.99] transition-all font-sans cursor-pointer text-sm"
                >
                  সেটিংস সংরক্ষণ করুন (Save Settings)
                </button>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#E74C3C] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-semibold">ডাটাবেজ নিয়ন্ত্রণ ও ক্লিয়ার সেন্টার</h2>
                    <p className="text-[11px] opacity-90 font-sans">সমস্ত ইউজার প্রোফাইল ও ট্রানজেকশন ক্লিয়ার করুন</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 text-left" style={{ borderWidth: "0.5px" }}>
                  <div className="flex items-start space-x-3 text-[#E74C3C]">
                    <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold">অতি বিপজ্জনক কর্নার!</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed mt-1">
                        নিচের লাল বাটনে ক্লিক করলে ডাটাবেজ থেকে সমস্ত রেজিস্টার্ড প্রবাসী ইউজার প্রোফাইল এবং তাদের অধীনে করা সমস্ত লেনদেন (ডিপোজিট, ট্রান্সফার, স্ক্যাম রিপোর্ট, টিকেট) চিরতরে মুছে যাবে।
                      </p>
                      <p className="text-xs text-[#6B7280] leading-relaxed mt-1 font-semibold">
                        কিন্তু খবর (News), এক্সচেঞ্জ রেট, জরুরি কন্টাক্ট এবং পেমেন্ট মেথড গেটওয়েগুলো অক্ষত থাকবে এবং স্বয়ংক্রিয়ভাবে রিসেট হয়ে থাকবে।
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="bg-red-50 p-3.5 rounded-xl border border-red-100">
                    <p className="text-xs text-[#E74C3C] font-semibold">
                      🚨 নিয়মাবলি:
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-[#A04000] mt-1 space-y-1 font-medium leading-relaxed">
                      <li>এটি মূলত ডেমো বা টেস্ট ইউজারদের সাফ করার জন্য ব্যবহৃত হয়।</li>
                      <li>ক্লিক করার পর নিশ্চিতকরণের জন্য ২টি পপআপ দেখাবে, সাবধানে "Yes"/"Ok" করবেন।</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleResetAllUsersAndData}
                    disabled={resettingDb}
                    className="w-full bg-[#E74C3C] hover:bg-opacity-95 text-white py-3.5 rounded-xl font-medium active:scale-[0.99] transition-all font-sans cursor-pointer text-sm flex items-center justify-center space-x-2"
                  >
                    <span>{resettingDb ? "ডাটা সাফ হচ্ছে..." : "সমস্ত ইউজার ডাটা ডিলিট করুন (Reset Users Data)"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "passwordResets" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-medium font-sans">পাসওয়ার্ড রিসেট অনুরোধসমূহ</h2>
                    <p className="text-[11px] opacity-90 font-sans">ইউজারদের ভুলে যাওয়া পাসওয়ার্ড পুনরুদ্ধার ও ভেরিফিকেশন কন্ট্রোল করুন</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => fetchTabData("passwordResets")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                {passwordResets.length === 0 ? (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-gray-500 text-xs" style={{ borderWidth: "0.5px" }}>
                    কোনো পাসওয়ার্ড রিসেট অনুরোধ পাওয়া যায়নি ভাই।
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passwordResets.map((req) => {
                      const dateText = req.createdAt ? new Date(req.createdAt).toLocaleString("bn-BD") : "আজ";
                      const isPending = req.status === "pending" || !req.status;
                      const isCompleted = req.status === "completed";
                      const isRejected = req.status === "rejected";

                      // Get or initialize input state for this request
                      const currentVal = resetPasswordsInputs[req.id] !== undefined 
                        ? resetPasswordsInputs[req.id] 
                        : Math.floor(100000 + Math.random() * 900000).toString(); // default 6 digit random pw

                      return (
                        <div 
                          key={req.id}
                          className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between space-y-4"
                          style={{ borderWidth: "0.5px" }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* User details */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] text-[#6B7280] font-mono block uppercase">ইউজার আইডি / ইমেইল / মোবাইল</span>
                                  <h4 className="text-xs font-semibold text-[#1A1A2E]">{req.usernameOrId}</h4>
                                </div>
                                <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                                  isPending ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                  isCompleted ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                  "bg-red-50 text-red-700 border border-red-100"
                                }`} style={{ borderWidth: "0.5px" }}>
                                  {isPending ? "🟡 অপেক্ষমান" : isCompleted ? "🟢 সম্পন্ন" : "🔴 বাতিল"}
                                </span>
                              </div>

                              <div className="pt-1 flex items-center justify-between border-t border-gray-50 text-xs text-[#6B7280]">
                                <span>অনুরোধের সময়:</span>
                                <span className="font-mono text-[11px] text-[#1A1A2E]">{dateText}</span>
                              </div>

                              <div className="pt-1.5 border-t border-gray-50 space-y-1">
                                <span className="text-[10px] text-[#6B7280] font-mono block uppercase">যোগাযোগের জন্য হোয়াটসঅ্যাপ নাম্বার</span>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-[#1B4F72] font-mono">{req.whatsappNumber}</span>
                                  <a 
                                    href={`https://wa.me/${req.whatsappNumber.replace(/\+/g, '').replace(/\s+/g, '').replace(/-/g, '')}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-[#1D9E75] text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all"
                                  >
                                    💬 চ্যাট করুন
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Verification credentials */}
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-2" style={{ borderWidth: "0.5px" }}>
                              <p className="text-[10px] text-[#6B7280] font-mono uppercase font-bold tracking-wider border-b border-gray-200 pb-1">
                                ইউজার ভেরিফিকেশন তথ্য (User Provided Info):
                              </p>
                              
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#6B7280]">১. শেষ ওয়ালেট ব্যালেন্স:</span>
                                <span className="font-semibold text-[#1A1A2E] font-mono">{req.lastBalance || "N/A"}</span>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#6B7280]">২. শেষ ডিপোজিট বা টাকা পাঠানো:</span>
                                <span className="font-semibold text-[#1A1A2E] font-mono">{req.lastDeposit || "N/A"}</span>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#6B7280]">৩. শেষ উইথড্র বা টাকা তোলা:</span>
                                <span className="font-semibold text-[#1A1A2E] font-mono">{req.lastWithdraw || "N/A"}</span>
                              </div>

                              <p className="text-[10px] text-[#E74C3C] leading-relaxed mt-1">
                                * এডমিন প্যানেলের "ইউজার্স" ট্যাব থেকে উক্ত ইউজারের ব্যালেন্স এবং লেজার এর সাথে মিলিয়ে মিলিয়ে দেখুন ভাই।
                              </p>
                            </div>
                          </div>

                          {isPending && (
                            <div className="bg-[#FFFDF5] border border-[#FBEFCD] rounded-xl p-3.5 space-y-3" style={{ borderWidth: "0.5px" }}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                  <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                                    নতুন পাসওয়ার্ড সেট করুন (৬ অক্ষরের বেশি):
                                  </label>
                                  <input 
                                    type="text"
                                    value={currentVal}
                                    onChange={(e) => {
                                      setResetPasswordsInputs({
                                        ...resetPasswordsInputs,
                                        [req.id]: e.target.value
                                      });
                                    }}
                                    placeholder="৬ সংখ্যার নতুন পাসওয়ার্ড দিন"
                                    className="w-full h-10 bg-white text-[#1A1A2E] text-[12px] px-3.5 rounded-[8px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none transition-colors font-mono"
                                    style={{ borderWidth: '0.5px' }}
                                  />
                                </div>

                                <div className="flex gap-2 shrink-0 pt-3 sm:pt-0">
                                  <button
                                    onClick={() => handleAdminResetUserPassword(req.id, req.usernameOrId, currentVal, req.whatsappNumber)}
                                    className="bg-[#1B4F72] hover:bg-opacity-95 text-white text-xs px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-all flex items-center justify-center font-sans"
                                  >
                                    🔑 পাসওয়ার্ড পরিবর্তন ও হোয়াটস্যাপ করুন
                                  </button>
                                  <button
                                    onClick={() => handleRejectResetRequest(req.id)}
                                    className="bg-red-50 hover:bg-red-100 text-[#E74C3C] border border-red-200 text-xs px-3.5 py-2.5 rounded-xl font-medium cursor-pointer transition-all flex items-center justify-center font-sans"
                                  >
                                    বাতিল করুন
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs leading-relaxed flex items-center justify-between font-sans">
                              <span>
                                ✔ <strong>সমাধান করা হয়েছে:</strong> এই অনুরোধকারীর পাসওয়ার্ড সফলভাবে <strong>"{req.assignedPassword || 'N/A'}"</strong> তে পরিবর্তন করা হয়েছে ভাই।
                              </span>
                              {req.resolvedAt && (
                                <span className="text-[10px] text-emerald-600 font-mono">
                                  {new Date(req.resolvedAt).toLocaleDateString("bn-BD")}
                                </span>
                              )}
                            </div>
                          )}

                          {isRejected && (
                            <div className="bg-red-50/50 border border-red-100 text-red-800 rounded-xl p-3 text-xs leading-relaxed flex items-center justify-between font-sans">
                              <span>
                                ❌ <strong>বাতিল করা হয়েছে:</strong> এই অনুরোধটি এডমিন বাতিল করেছেন।
                              </span>
                              {req.resolvedAt && (
                                <span className="text-[10px] text-red-600 font-mono">
                                  {new Date(req.resolvedAt).toLocaleDateString("bn-BD")}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-medium font-sans">ব্যবহারকারীদের রিভিউসমূহ</h2>
                    <p className="text-[11px] opacity-90 font-sans">লেনদেন সম্পন্ন হওয়ার পর দেওয়া রিভিউ ও রেটিং কন্ট্রোল করুন</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => fetchTabData("reviews")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-gray-500 text-xs" style={{ borderWidth: "0.5px" }}>
                    এখনও কোনো রিভিউ দেওয়া হয়নি ভাই।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => {
                      const isPublished = rev.published !== false;
                      const dateText = rev.createdAt ? (rev.createdAt.toDate ? rev.createdAt.toDate().toLocaleString("bn-BD") : new Date(rev.createdAt).toLocaleString("bn-BD")) : "আজ";
                      return (
                        <div 
                          key={rev.id}
                          className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                          style={{ borderWidth: "0.5px" }}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-semibold text-[#1A1A2E]">{rev.userName || "ওয়ালেট ইউজার"}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{dateText}</p>
                              </div>
                              <div className="flex items-center gap-0.5 text-xs text-yellow-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>
                                    {i < rev.rating ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <p className="text-xs text-[#1A1A2E] leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              {rev.reviewText || <em className="text-gray-400">কোনো মন্তব্য লিখেননি ভাই</em>}
                            </p>

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="font-medium text-[#1B4F72]">পরিমাণ: ${rev.amount} USD</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{rev.method}</span>
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleTogglePublishReview(rev.id, isPublished)}
                              className={`flex-1 text-xs py-2 rounded-xl font-medium transition-all cursor-pointer text-center select-none ${
                                isPublished 
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" 
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                              }`}
                            >
                              {isPublished ? "🟢 প্রকাশিত (লুকান)" : "🟡 লুকানো (প্রকাশ করুন)"}
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="px-3 bg-red-50 hover:bg-red-100 text-[#E74C3C] rounded-xl border border-red-200 transition-all cursor-pointer flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "fees" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-medium font-sans">লেনদেনের সার্ভিস ফি সেটিংস</h2>
                    <p className="text-[11px] opacity-90 font-sans">ট্রান্সফার ফি ও লিমিট পরিবর্তন করুন</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => fetchTabData("fees")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                <form onSubmit={handleUpdateFees} className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-5 text-left" style={{ borderWidth: "0.5px" }}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">ট্রান্সফার ফি (%)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={feeSettings.transferFeePercent !== undefined ? feeSettings.transferFeePercent : ""}
                      onChange={(e) => setFeeSettings((prev: any) => ({
                        ...prev,
                        transferFeePercent: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ২"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">যেমন: 2 মানে 2% ফি</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">নির্দিষ্ট ফি ($)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={feeSettings.transferFeeFixed !== undefined ? feeSettings.transferFeeFixed : ""}
                      onChange={(e) => setFeeSettings((prev: any) => ({
                        ...prev,
                        transferFeeFixed: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ০"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">% ফি এর পাশাপাশি fixed ফি (0 = নেই)</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">সর্বনিম্ন ট্রান্সফার ($)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={feeSettings.minimumTransfer !== undefined ? feeSettings.minimumTransfer : ""}
                      onChange={(e) => setFeeSettings((prev: any) => ({
                        ...prev,
                        minimumTransfer: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ১"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">সর্বোচ্চ ট্রান্সফার ($)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={feeSettings.maximumTransfer !== undefined ? feeSettings.maximumTransfer : ""}
                      onChange={(e) => setFeeSettings((prev: any) => ({
                        ...prev,
                        maximumTransfer: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ১০০০"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 font-sans">
                    <div>
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">প্রথম ট্রান্সফার ফ্রি</label>
                      <p className="text-[11px] text-[#6B7280] font-sans">সক্রিয় থাকলে প্রথমবার লেনদেন সম্পূর্ণ ফ্রিতে করা যাবে</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeeSettings((prev: any) => ({
                        ...prev,
                        firstTransferFree: !prev.firstTransferFree
                      }))}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        feeSettings.firstTransferFree 
                          ? "bg-[#1D9E75] text-white" 
                          : "bg-gray-100 text-[#6B7280]"
                      }`}
                    >
                      {feeSettings.firstTransferFree ? "চালু (ON)" : "বন্ধ (OFF)"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1B4F72] text-white py-3 rounded-xl font-medium hover:bg-opacity-95 active:scale-[0.99] transition-all font-sans cursor-pointer text-sm"
                  >
                    আপডেট করুন
                  </button>
                </form>

                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center mt-6">
                  <div>
                    <h2 className="text-[15px] font-medium font-sans">ট্রান্সফার সময় সেটিংস</h2>
                    <p className="text-[11px] opacity-90 font-sans">লেনদেন সম্পন্ন করার সর্বনিম্ন ও সর্বোচ্চ সময় নির্ধারণ করুন</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateTransferTime} className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-5 text-left" style={{ borderWidth: "0.5px" }}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">সর্বনিম্ন সময়</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={transferSettings.minTime !== undefined ? transferSettings.minTime : ""}
                        onChange={(e) => setTransferSettings((prev: any) => ({
                          ...prev,
                          minTime: e.target.value !== "" ? Number(e.target.value) : ""
                        }))}
                        placeholder="যেমন: ৫"
                        className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl pl-3 pr-16 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                        style={{ borderWidth: "0.5px" }}
                        required
                      />
                      <span className="absolute right-3 text-xs text-[#6B7280] font-sans">মিনিট</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">সর্বোচ্চ সময়</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={transferSettings.maxTime !== undefined ? transferSettings.maxTime : ""}
                        onChange={(e) => setTransferSettings((prev: any) => ({
                          ...prev,
                          maxTime: e.target.value !== "" ? Number(e.target.value) : ""
                        }))}
                        placeholder="যেমন: ১২০"
                        className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl pl-3 pr-24 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                        style={{ borderWidth: "0.5px" }}
                        required
                      />
                      <span className="absolute right-3 text-xs text-[#6B7280] font-sans">মিনিট/ঘণ্টা</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">প্রদর্শন টেক্সট</label>
                    <input
                      type="text"
                      value={transferSettings.timeDisplay !== undefined ? transferSettings.timeDisplay : ""}
                      onChange={(e) => setTransferSettings((prev: any) => ({
                        ...prev,
                        timeDisplay: e.target.value
                      }))}
                      placeholder="যেমন: ৫ মিনিট থেকে ২ ঘণ্টার মধ্যে"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">এই টেক্সটটি user দের দেখানো হবে</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1B4F72] text-white py-3 rounded-xl font-medium hover:bg-opacity-95 active:scale-[0.99] transition-all font-sans cursor-pointer text-sm"
                  >
                    আপডেট করুন
                  </button>
                </form>
              </div>
            )}

            {activeTab === "referral" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-medium font-sans">রেফারেল সিস্টেম সেটিংস</h2>
                    <p className="text-[11px] opacity-90 font-sans">রেফারেল বোনাস, লিমিট ও অন/অফ সেটিংস</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => fetchTabData("referral")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveReferralSettings();
                  }} 
                  className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-5 text-left" 
                  style={{ borderWidth: "0.5px" }}
                >
                  <div className="flex items-center justify-between pt-1 font-sans">
                    <div>
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">রেফারেল সিস্টেম</label>
                      <p className="text-[11px] text-[#6B7280] font-sans">রেফারেল সিস্টেম সচল বা নিষ্ক্রিয় করুন</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReferralSettings((prev: any) => ({
                        ...prev,
                        referralSystemEnabled: !prev.referralSystemEnabled
                      }))}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        referralSettings.referralSystemEnabled 
                          ? "bg-[#1D9E75] text-white" 
                          : "bg-gray-100 text-[#6B7280]"
                      }`}
                    >
                      {referralSettings.referralSystemEnabled ? "চালু (ON)" : "বন্ধ (OFF)"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">রেফারেল বোনাস পরিমাণ ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={referralSettings.referralBonusAmount !== undefined ? referralSettings.referralBonusAmount : ""}
                      onChange={(e) => setReferralSettings((prev: any) => ({
                        ...prev,
                        referralBonusAmount: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ১"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">প্রতি সফল রেফারেলে কত বোনাস পাবে (ডিফল্ট: $১)</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">আনলকের জন্য সর্বনিম্ন মোট ট্রান্সফার ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={referralSettings.referralMinTransfer !== undefined ? referralSettings.referralMinTransfer : ""}
                      onChange={(e) => setReferralSettings((prev: any) => ({
                        ...prev,
                        referralMinTransfer: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ১০০"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">আমন্ত্রিত বা নতুন ইউজার মোট কত ডলার সফলভাবে পাঠালে বোনাস মূল ব্যালেন্সে যুক্ত হবে (ডিফল্ট: $১০০)</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">রেফার কোড সহ সাইন-আপ বোনাস পরিমাণ ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={referralSettings.signupBonusAmount !== undefined ? referralSettings.signupBonusAmount : ""}
                      onChange={(e) => setReferralSettings((prev: any) => ({
                        ...prev,
                        signupBonusAmount: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ২"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">রেফার কোড ব্যবহার করে অ্যাকাউন্ট খুললে কত ডলার পেন্ডিং বোনাস পাবে (ডিফল্ট: $২)</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-sans">
                    <div>
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">রেফার কোড ছাড়া সাইন-আপ বোনাস</label>
                      <p className="text-[11px] text-[#6B7280] font-sans">কোনো কোড ছাড়া সাইন-আপ করলেও বোনাস পাবে কি না (ON/OFF)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReferralSettings((prev: any) => ({
                        ...prev,
                        noCodeBonusEnabled: !prev.noCodeBonusEnabled
                      }))}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        referralSettings.noCodeBonusEnabled 
                          ? "bg-[#1D9E75] text-white" 
                          : "bg-gray-100 text-[#6B7280]"
                      }`}
                    >
                      {referralSettings.noCodeBonusEnabled ? "সক্রিয় (ON)" : "নিষ্ক্রিয় (OFF)"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">রেফার কোড ছাড়া সাইন-আপ বোনাস পরিমাণ ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={referralSettings.noCodeBonusAmount !== undefined ? referralSettings.noCodeBonusAmount : ""}
                      onChange={(e) => setReferralSettings((prev: any) => ({
                        ...prev,
                        noCodeBonusAmount: e.target.value !== "" ? Number(e.target.value) : ""
                      }))}
                      placeholder="যেমন: ২"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required={referralSettings.noCodeBonusEnabled}
                      disabled={!referralSettings.noCodeBonusEnabled}
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">রেফার কোড ছাড়া অ্যাকাউন্ট খুললে কত ডলার পেন্ডিং বোনাস পাবে (ডিফল্ট: $২)</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">অ্যানাউন্সমেন্ট টেক্সট</label>
                    <input
                      type="text"
                      value={referralSettings.prizeAnnouncement || ""}
                      onChange={(e) => setReferralSettings((prev: any) => ({
                        ...prev,
                        prizeAnnouncement: e.target.value
                      }))}
                      placeholder="যেমন: এই মাসের সেরা ৩ রেফারার পাবেন পুরস্কার!"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                    />
                    <p className="text-[11px] text-[#6B7280] font-sans">রেফারেল পেজের লিডারবোর্ডের ওপরে প্রদর্শিত হবে</p>
                  </div>

                  {/* Daily Claim Settings */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold text-[#1B4F72] font-sans">🎁 দৈনিক ফ্রি বোনাস সেটিংস (Daily Bonus Settings)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1A1A2E] font-sans">প্রতিদিনের ক্লেইম বোনাস ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={referralSettings.dailyClaimAmount !== undefined ? referralSettings.dailyClaimAmount : ""}
                          onChange={(e) => setReferralSettings((prev: any) => ({
                            ...prev,
                            dailyClaimAmount: e.target.value !== "" ? Number(e.target.value) : ""
                          }))}
                          placeholder="যেমন: ০.০৫"
                          className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                          style={{ borderWidth: "0.5px" }}
                        />
                        <p className="text-[11px] text-[#6B7280] font-sans">ডেইলি ক্লেইম করলে ইউজার কত ডলার বোনাস পাবে (ডিফল্ট: $০.০৫)</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1A1A2E] font-sans">মেইন ওয়ালেটে নেয়ার সর্বনিম্ন সীমা ($)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={referralSettings.dailyMinWithdraw !== undefined ? referralSettings.dailyMinWithdraw : ""}
                          onChange={(e) => setReferralSettings((prev: any) => ({
                            ...prev,
                            dailyMinWithdraw: e.target.value !== "" ? Number(e.target.value) : ""
                          }))}
                          placeholder="যেমন: ১০"
                          className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                          style={{ borderWidth: "0.5px" }}
                        />
                        <p className="text-[11px] text-[#6B7280] font-sans">ডেইলি বোনাস ব্যালেন্স মেইন ওয়ালেটে ট্রান্সফার করতে সর্বনিম্ন কত ডলার লাগবে</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1B4F72] text-white py-3 rounded-xl font-medium hover:bg-opacity-95 active:scale-[0.99] transition-all font-sans cursor-pointer text-sm"
                  >
                    সেটিংস সংরক্ষণ করুন
                  </button>
                </form>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-medium font-sans">হোম সতর্কতা পপআপ সেটিংস</h2>
                    <p className="text-[11px] opacity-90 font-sans">পপআপের লেখা, সময়সীমা ও সিকোয়েন্স নির্ধারণ করুন</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => fetchTabData("alerts")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                {/* Add New Alert Form */}
                <form onSubmit={handleCreateHomeAlert} className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-4 text-left" style={{ borderWidth: "0.5px" }}>
                  <h3 className="text-xs font-semibold text-[#1B4F72] font-sans border-b pb-2 mb-2">নতুন সতর্কতা পপআপ যোগ করুন</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">সতর্কতা টাইটেল (Title) *</label>
                    <input
                      type="text"
                      value={newHomeAlert.title}
                      onChange={(e) => setNewHomeAlert((prev: any) => ({ ...prev, title: e.target.value }))}
                      placeholder="যেমন: ফনম পেনহে নতুন স্ক্যাম চক্র সক্রিয়"
                      className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">বিস্তারিত বার্তা (Description) *</label>
                    <textarea
                      value={newHomeAlert.description}
                      onChange={(e) => setNewHomeAlert((prev: any) => ({ ...prev, description: e.target.value }))}
                      placeholder="যেমন: অপরিচিত কেউ ভালো কাজের প্রলোভন দেখালে পা বাড়াবেন না ভাই।"
                      rows={3}
                      className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl p-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                      style={{ borderWidth: "0.5px" }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-sans">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">ট্যাগ (Tag)</label>
                      <input
                        type="text"
                        value={newHomeAlert.tag}
                        onChange={(e) => setNewHomeAlert((prev: any) => ({ ...prev, tag: e.target.value }))}
                        placeholder="যেমন: সতর্কতা"
                        className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                        style={{ borderWidth: "0.5px" }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">সময়সীমা (সেকেন্ড) *</label>
                      <input
                        type="number"
                        min="3"
                        max="120"
                        value={newHomeAlert.duration !== undefined ? newHomeAlert.duration : ""}
                        onChange={(e) => setNewHomeAlert((prev: any) => ({ ...prev, duration: e.target.value !== "" ? Number(e.target.value) : "" }))}
                        placeholder="যেমন: ১০"
                        className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                        style={{ borderWidth: "0.5px" }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-sans">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">ক্রমানুসার (Order) *</label>
                      <input
                        type="number"
                        min="1"
                        value={newHomeAlert.order !== undefined ? newHomeAlert.order : ""}
                        onChange={(e) => setNewHomeAlert((prev: any) => ({ ...prev, order: e.target.value !== "" ? Number(e.target.value) : "" }))}
                        placeholder="যেমন: ১"
                        className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                        style={{ borderWidth: "0.5px" }}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-[22px] px-1 font-sans">
                      <label className="text-[11px] font-semibold text-[#1A1A2E]">অবস্থা: {newHomeAlert.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</label>
                      <button
                        type="button"
                        onClick={() => setNewHomeAlert((prev: any) => ({ ...prev, isActive: !prev.isActive }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          newHomeAlert.isActive 
                            ? "bg-[#1D9E75] text-white" 
                            : "bg-gray-100 text-[#6B7280]"
                        }`}
                      >
                        {newHomeAlert.isActive ? "সক্রিয় (ON)" : "বন্ধ (OFF)"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1B4F72] text-white py-3 rounded-xl font-medium hover:bg-opacity-95 active:scale-[0.99] transition-all font-sans cursor-pointer text-sm"
                  >
                    সতর্কতা যোগ করুন
                  </button>
                </form>

                {/* Existing Alerts Queue List */}
                <div className="space-y-3 font-sans">
                  <h3 className="text-xs font-semibold text-[#1A1A2E] font-sans px-1">চলমান সতর্কতা তালিকা (সিরিয়াল অনুযায়ী প্রদর্শিত হবে)</h3>
                  
                  {homeAlertsList.length === 0 ? (
                    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-8 text-center text-xs text-[#6B7280]" style={{ borderWidth: "0.5px" }}>
                      কোনো সতর্কতা পপআপ সেট করা নেই ভাই।
                    </div>
                  ) : (
                    homeAlertsList.map((item) => (
                      <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 space-y-3 relative text-left" style={{ borderWidth: "0.5px" }}>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] bg-[#FDEDEC] text-[#C0392B] px-2 py-0.5 rounded-full font-medium">{item.tag || "সতর্কতা"}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">ক্রম #{item.order}</span>
                            <span className="text-[10px] bg-sky-50 text-[#1B4F72] px-2 py-0.5 rounded-full">{item.duration} সেকেন্ড</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleAlertActive(item)}
                              className={`text-[10px] font-semibold px-2 py-1 rounded cursor-pointer ${
                                item.isActive 
                                  ? "bg-[#E9F7EF] text-[#1D9E75]" 
                                  : "bg-gray-100 text-[#6B7280]"
                              }`}
                            >
                              {item.isActive ? "সক্রিয়" : "বন্ধ"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHomeAlert(item.id)}
                              className="p-1 hover:bg-gray-50 rounded-lg text-[#E74C3C] cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-[#1A1A2E]">{item.title}</h4>
                          <p className="text-xs text-[#6B7280] leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "ad_banner" && (
              <div className="space-y-4 text-left font-sans animate-fade-in pb-12">
                <div className="bg-[#1B4F72] text-white p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-[15px] font-medium font-sans">পপআপ ব্যানার বিজ্ঞাপন সেটিংস</h2>
                    <p className="text-[11px] opacity-90 font-sans">ইউজারদের ড্যাশবোর্ডে সরাসরি পপআপ ইমেজ বিজ্ঞাপন প্রদর্শন ও নিয়ন্ত্রণ করুন</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => fetchTabData("ad_banner")}
                    className="p-1 px-[10px] text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                <form onSubmit={handleSaveAdBannerSettings} className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-4 text-left" style={{ borderWidth: "0.5px" }}>
                  <h3 className="text-xs font-semibold text-[#1B4F72] font-sans border-b pb-2 mb-2">বিজ্ঞাপন ব্যানার পরিবর্তন ও নিয়ন্ত্রণ</h3>

                  {/* Activation Status */}
                  <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="text-xs font-semibold text-[#1A1A2E]">বিজ্ঞাপন সক্রিয় করুন</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">ড্যাশবোর্ডে ইউজারদের এই ব্যানারটি দেখানো হবে কিনা</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdBannerSettings((prev: any) => ({ ...prev, isActive: !prev.isActive }))}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        adBannerSettings.isActive 
                          ? "bg-[#1D9E75] text-white" 
                          : "bg-gray-100 text-[#6B7280]"
                      }`}
                    >
                      {adBannerSettings.isActive ? "সক্রিয় (ON)" : "বন্ধ (OFF)"}
                    </button>
                  </div>

                  {/* Direct Image Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#1A1A2E] font-sans">বিজ্ঞাপন ব্যানার ছবি আপলোড করুন *</label>
                    
                    <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 flex flex-col items-center justify-center space-y-2">
                      {adBannerSettings.imageBase64 ? (
                        <div className="relative group max-w-[200px]">
                          <img 
                            src={adBannerSettings.imageBase64} 
                            alt="Preview" 
                            className="max-h-40 rounded-lg object-contain border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setAdBannerSettings((prev: any) => ({ ...prev, imageBase64: "" }))}
                            className="absolute -top-2 -right-2 bg-[#E74C3C] text-white rounded-full p-1 shadow-md hover:bg-opacity-90"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-2">
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">কোনো ছবি সিলেক্ট করা নেই ভাই</span>
                        </div>
                      )}

                      <label className="bg-[#1B4F72] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-opacity-90 cursor-pointer inline-block transition-all shadow-xs">
                        {adBannerSettings.imageBase64 ? "ছবি পরিবর্তন করুন" : "ছবি সিলেক্ট করুন"}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAdBannerImageUpload} 
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-gray-400">সর্বোচ্চ ২ মেগাবাইট সাইজ অনুমোদিত</p>
                    </div>
                  </div>

                  {/* Grid of Auto-Close Seconds & Max Views */}
                  <div className="grid grid-cols-2 gap-3 font-sans">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">অটো-ক্লোজ সময় (সেকেন্ড)</label>
                      <input
                        type="number"
                        min="3"
                        max="60"
                        value={adBannerSettings.duration !== undefined ? adBannerSettings.duration : ""}
                        onChange={(e) => setAdBannerSettings((prev: any) => ({ ...prev, duration: e.target.value !== "" ? Number(e.target.value) : "" }))}
                        placeholder="যেমন: ১০"
                        className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                        style={{ borderWidth: "0.5px" }}
                        required
                      />
                      <p className="text-[10px] text-gray-400">কত সেকেন্ড পর পপআপ স্বয়ংক্রিয়ভাবে বন্ধ হবে</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1A1A2E] font-sans">দৈনিক সর্বোচ্চ প্রদর্শন (জনপ্রতি)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={adBannerSettings.maxViewsPerDay !== undefined ? adBannerSettings.maxViewsPerDay : ""}
                        onChange={(e) => setAdBannerSettings((prev: any) => ({ ...prev, maxViewsPerDay: e.target.value !== "" ? Number(e.target.value) : "" }))}
                        placeholder="যেমন: ৩"
                        className="w-full h-11 bg-gray-50 border border-[#E5E7EB] rounded-xl px-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B4F72] transition-colors font-sans"
                        style={{ borderWidth: "0.5px" }}
                        required
                      />
                      <p className="text-[10px] text-gray-400">প্রতিদিন একজন ইউজার সর্বোচ্চ কতবার বিজ্ঞাপনটি দেখবে</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1B4F72] text-white py-3 rounded-xl font-medium hover:bg-opacity-95 active:scale-[0.99] transition-all font-sans cursor-pointer text-sm disabled:opacity-55"
                  >
                    {loading ? "সংরক্ষণ করা হচ্ছে..." : "ব্যানার সেটিংস সংরক্ষণ করুন"}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ==== MODAL 0: CUSTOM VERIFY DEPOSIT POPUP ==== */}
      {verifyingDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-[#1A1A2E] font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] text-left relative space-y-4 border border-[#E5E7EB] shadow-lg animate-fade-in">
            <button
              onClick={() => setVerifyingDeposit(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black rounded-full bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1D9E75] font-sans">ডিপোজিট ভেরিফিকেশন</h3>
              <p className="text-[11px] text-gray-500 font-sans font-mono leading-none">আইডি: {verifyingDeposit.id}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl text-[12px] space-y-1.5 text-left font-sans border border-gray-100">
              <p>👤 <strong>ইউজার আইডি:</strong> {verifyingDeposit.userId}</p>
              <p>🏷️ <strong>ইউজার নাম:</strong> {verifyingDeposit.senderName || "প্রবাসী ইউজার"}</p>
              {verifyingDeposit.senderPhone ? (
                <p>📞 <strong>মোবাইল:</strong> {verifyingDeposit.senderPhone}</p>
              ) : null}
              <p>💵 <strong>দাবীকৃত পরিমাণ:</strong> ${verifyingDeposit.amount} USD</p>
              {verifyingDeposit.calculatedBdt ? (
                <p>৳ <strong>হিসাবকৃত টাকা:</strong> ৳{verifyingDeposit.calculatedBdt} BDT</p>
              ) : null}
              <p>🏦 <strong>পেমেন্ট মাধ্যম:</strong> {verifyingDeposit.methodName || "বিকাশ"}</p>
              <p>🔑 <strong>Cambodia Tx ID:</strong> <span className="font-mono font-bold text-[#1B4F72]">{verifyingDeposit.transactionId || "N/A"}</span></p>
            </div>

            {/* Proof Image in pop-up */}
            {(verifyingDeposit.proofImageUrl || verifyingDeposit.screenshotUrl) && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-[#6B7280] font-sans">পেমেন্ট স্ক্রিনশট:</p>
                <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                  <img
                    src={verifyingDeposit.proofImageUrl || verifyingDeposit.screenshotUrl}
                    alt="Proof Image"
                    onClick={() => setViewingImage(verifyingDeposit.proofImageUrl || verifyingDeposit.screenshotUrl)}
                    className="max-h-[140px] w-auto object-contain cursor-pointer rounded-lg hover:opacity-95"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-sans pointer-events-none">
                    বড় করে দেখতে ছবিতে ট্যাপ করুন
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[11px] font-semibold text-[#6B7280] font-sans">নিশ্চিতকৃত ডলার পরিমাণ (USD):</label>
              <input
                type="number"
                step="0.01"
                value={verifyAmountInput}
                onChange={(e) => setVerifyAmountInput(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3.5 h-[48px] text-sm outline-none focus:border-[#1B4F72] transition-colors font-sans font-bold"
                style={{ borderWidth: "0.5px" }}
              />
            </div>

            <button
              onClick={submitVerifyDeposit}
              className="w-full h-12 bg-[#1D9E75] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl transition-all font-sans cursor-pointer"
            >
              ভেরিফাই ও ব্যালেন্স যোগ করুন ✅
            </button>
          </div>
        </div>
      )}

      {/* ==== MODAL 1: COMPLETE TRANSFER WITH RECEIPT ==== */}
      {selectedCompletedTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-[#1A1A2E] font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] text-left relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedCompletedTransfer(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black rounded-full bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1B4F72]">ট্রান্সফার নিশ্চিত করুন</h3>
              <p className="text-[11px] text-gray-500 font-mono leading-none">আইডি: {selectedCompletedTransfer.id}</p>
            </div>

            {/* Modal internal status notification */}
            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border animate-fade-in ${
                message.isError 
                  ? "bg-[#FDEDEC] text-[#E74C3C] border-[#FADBD8]" 
                  : "bg-[#E9F7EF] text-[#1D9E75] border-[#D4EFDF]"
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{message.text}</span>
              </div>
            )}

            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] space-y-1">
              <p>👤 <strong>গ্রাহক:</strong> {selectedCompletedTransfer.senderName}</p>
              <p>📞 <strong>প্রাপক:</strong> {selectedCompletedTransfer.recipientPhone}</p>
              <p>💵 <strong>পরিমাণ:</strong> ${selectedCompletedTransfer.amount} USD ({(selectedCompletedTransfer.amount * 110.8).toFixed(1)} BDT)</p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col space-y-1 text-left">
                <label className="text-[10px] text-gray-600 font-semibold font-sans">আপনার bKash নম্বরের শেষ ৪ সংখ্যা:</label>
                <input
                  type="text"
                  maxLength={4}
                  value={confirmationDigits}
                  onChange={(e) => setConfirmationDigits(e.target.value)}
                  placeholder="যেমন: 6602"
                  className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-xs outline-none font-sans font-bold"
                  style={{ borderWidth: "0.5px" }}
                />
                <span className="text-[9px] text-[#6B7280]">যে নম্বর থেকে পাঠিয়েছেন তার শেষ ৪ সংখ্যা</span>
              </div>

              <div className="flex flex-col space-y-1 text-left">
                <label className="text-[10px] text-gray-600 font-semibold font-sans">কত মিনিট লেগেছে সম্পন্ন করতে (ট্রাস্ট ফিডের জন্য):</label>
                <input
                  type="number"
                  value={minutesDuration}
                  onChange={(e) => setMinutesDuration(e.target.value)}
                  placeholder="যেমন: 10"
                  className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-xs outline-none font-sans font-bold"
                  style={{ borderWidth: "0.5px" }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteTransferSubmit}
              className="w-full py-3 bg-[#1B4F72] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer font-sans"
            >
              নিশ্চিত করুন
            </button>
          </div>
        </div>
      )}

      {/* ==== MODAL 2: REJECT REQUEST ==== */}
      {selectedRejectTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-[#1A1A2E] font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] text-left relative space-y-4">
            <button
              onClick={() => setSelectedRejectTransfer(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black rounded-full bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#E74C3C]">অনুরোধ বাতিল করুন</h3>
              <p className="text-[11px] text-gray-500 font-mono leading-none font-sans">আইডি: {selectedRejectTransfer.id}</p>
            </div>

            <div className="flex flex-col space-y-1 text-left">
              <label className="text-[10px] text-gray-600 font-semibold font-sans">বাতিল করার উপযুক্ত কারণ উল্লেখ করুন (ইউজার দেখতে পাবেন):</label>
              <textarea
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="যেমন: রেফারেন্স ভুল বা সম্পূর্ণ রিসিট পেমেন্ট পাওয়া যায়নি।"
                rows={3}
                className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs outline-none font-sans resize-none"
                style={{ borderWidth: "0.5px" }}
              />
            </div>

            <button
              onClick={handleRejectTransferSubmit}
              className="w-full py-3 bg-[#E74C3C] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer font-sans"
            >
              অনুরোধ বাতিল করুন (Reject Request)
            </button>
          </div>
        </div>
      )}

      {/* ==== MODAL: VIEW USER HISTORY OVERLAY ==== */}
      {viewingUserHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F7F8FA] w-full max-w-lg rounded-[16px] overflow-hidden shadow-xl border border-[#E5E7EB] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#1B4F72] text-white p-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-semibold font-sans">{viewingUserHistory.name} - এর ইতিহাস</h3>
                <p className="text-[10px] opacity-90 font-sans">ইউজার আইডি: {viewingUserHistory.userId}</p>
              </div>
              <button
                onClick={() => setViewingUserHistory(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content container */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {loadingUserHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4F72] mx-auto mb-2"></div>
                  <p className="text-xs text-[#6B7280]">ইতিহাস লোড হচ্ছে ভাই...</p>
                </div>
              ) : (
                <>
                  {/* Deposits Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#1B4F72] flex items-center justify-between border-b pb-1">
                      <span>📥 ডিপোজিট ইতিহাস (মোট: {userHistoryDeposits.length})</span>
                    </h4>
                    {userHistoryDeposits.length === 0 ? (
                      <p className="text-[11px] text-[#6B7280] bg-white p-3 rounded-xl border border-dashed border-gray-200 text-center">কোনো ডিপোজিট রেকর্ড পাওয়া যায়নি ভাই।</p>
                    ) : (
                      <div className="space-y-2">
                        {userHistoryDeposits.map((dep) => (
                          <div key={dep.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-start text-xs" style={{ borderWidth: '0.5px' }}>
                            <div className="space-y-0.5 text-left">
                              <p className="font-bold text-[#1A1A2E] font-sans">{dep.id}</p>
                              <p className="text-[10px] text-[#6B7280]">{dep.methodName} - ট্রানজেকশন: {dep.transactionId}</p>
                              <p className="text-[10px] text-gray-400">{dep.createdAt ? new Date(dep.createdAt).toLocaleString("bn-BD") : "N/A"}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-bold text-[#1D9E75] font-sans">${dep.amount} USD</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                dep.status === "completed" || dep.status === "approved" || dep.status === "verified"
                                  ? "bg-[#1D9E75]/10 text-[#1D9E75]"
                                  : dep.status === "pending"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-[#E74C3C]/10 text-[#E74C3C]"
                              }`}>
                                {dep.status === "completed" || dep.status === "approved" || dep.status === "verified" ? "সফল" : dep.status === "pending" ? "পেন্ডিং" : "বাতিল"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transfers Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#1B4F72] flex items-center justify-between border-b pb-1">
                      <span>💸 টাকা পাঠানোর ইতিহাস (মোট: {userHistoryTransfers.length})</span>
                    </h4>
                    {userHistoryTransfers.length === 0 ? (
                      <p className="text-[11px] text-[#6B7280] bg-white p-3 rounded-xl border border-dashed border-gray-200 text-center">কোনো ট্র্যান্সফার রেকর্ড পাওয়া যায়নি ভাই।</p>
                    ) : (
                      <div className="space-y-2">
                        {userHistoryTransfers.map((trans) => (
                          <div key={trans.id} className="bg-white p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs text-left" style={{ borderWidth: '0.5px' }}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-[#1A1A2E] font-sans">{trans.id}</p>
                                <p className="text-[10px] text-[#6B7280]">প্রাপক: {trans.recipientName} ({trans.recipientPhone})</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#1B4F72] font-sans">${trans.totalDeducted || trans.amount} USD</p>
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                  trans.status === "completed"
                                    ? "bg-[#1D9E75]/10 text-[#1D9E75]"
                                    : trans.status === "pending" || trans.status === "processing"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-[#E74C3C]/10 text-[#E74C3C]"
                                }`}>
                                  {trans.status === "completed" ? "সফল" : (trans.status === "pending" || trans.status === "processing") ? "পেন্ডিং" : "বাতিল"}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 border-t border-gray-50 pt-1 mt-1">
                              <span>মাধ্যম: {trans.recipientMethod}</span>
                              <span>{trans.createdAt ? new Date(trans.createdAt).toLocaleString("bn-BD") : "N/A"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-[#E5E7EB] shrink-0 text-right">
              <button
                onClick={() => setViewingUserHistory(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1A1A2E] rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== MODAL 3: VIEW FULL SCREEN IMAGE SCREENSHOT ==== */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={viewingImage} 
            alt="Full screenshot" 
            className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/15"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

    </div>
  );
}
