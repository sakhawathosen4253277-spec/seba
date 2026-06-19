import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
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
  orderBy 
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
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Collections Data States
  const [news, setNews] = useState<any[]>([]);
  const [ticker, setTicker] = useState<any[]>([]);
  const [exchange, setExchange] = useState<any>({ bkash: 110.50, nagad: 110.60, bank: 110.80, usdRate: 110.80 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [scams, setScams] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [emergency, setEmergency] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
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

  const [selectedRejectTransfer, setSelectedRejectTransfer] = useState<any | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState<string>("");

  // Viewing screenshots big modal
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Form states for deposit and payment methods
  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodCountry, setNewMethodCountry] = useState<"BD" | "KH">("BD");
  const [newMethodColor, setNewMethodColor] = useState("#1B4F72");
  const [newMethodAccount, setNewMethodAccount] = useState("");

  // Form states for adding items
  const [newNews, setNewNews] = useState({ title: "", tag: "ভিসا", description: "" });
  const [newTicker, setNewTicker] = useState({ message: "", order: 1 });
  const [newContact, setNewContact] = useState({ name: "", phone: "", category: "জরুরি", order: 1, description: "" });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState<string>("");

  useEffect(() => {
    const isLogged = localStorage.getItem("isAdminLogged") === "true";
    if (isLogged) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Fetch initial badge count data of Dep & Transfer pending on Logged state
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
    if (passwordInput === "shamim123456789") {
      localStorage.setItem("isAdminLogged", "true");
      setIsAdminLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("পাসওয়ার্ড ভুল হয়েছে");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLogged");
    setIsAdminLoggedIn(false);
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
    if (!proofSentImageCode) {
      showStatusMsg("দয়া করে পেমেন্ট সম্পন্ন করার একটি প্রুফ স্ক্রিনশট আপলোড করুন ভাই!", true);
      return;
    }

    try {
      const transferId = selectedCompletedTransfer.id;
      const amount = selectedCompletedTransfer.amount;
      const method = selectedCompletedTransfer.recipientMethod;
      const durationNum = Number(minutesDuration) || 12;

      // Update transfer request in Firestore
      await updateDoc(doc(db, "transferRequests", transferId), {
        status: "completed",
        proofImageUrl: proofSentImageCode,
        completedAt: new Date().toISOString()
      });

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

      showStatusMsg("অভিনন্দন! ট্রান্সফার সফলভাবে সম্পন্ন হয়েছে এবং পাবলিক ফিডে লগ করা হয়েছে।");
      setSelectedCompletedTransfer(null);
      setProofSentImageCode("");
      setProofSentImageName("");
      setMinutesDuration("10");
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
      if (file.size > 2 * 1024 * 1024) {
        showStatusMsg("ফাইল সাইজ ২ মেগাবাইটের বেশি হওয়া যাবে না!", true);
        return;
      }
      setProofSentImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofSentImageCode(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A2E]">
        <div className="w-full max-w-[340px] bg-white p-[32px] rounded-[20px] border border-[#E5E7EB] shadow-sm text-center">
          <div className="w-12 h-12 bg-[#1B4F72] text-white rounded-[10px] flex items-center justify-center mx-auto mb-4 font-bold text-sm">
            সেবা
          </div>
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
          { id: "deposit", name: "ডিপোজিট" },
          { id: "transfer", name: "ট্রান্সফার" },
          { id: "jobs", name: "চাকরি" },
          { id: "scams", name: "স্ক্যাম" },
          { id: "tickets", name: "টিকেট" },
          { id: "emergency", name: "জরুরি" }
        ].map((tab) => {
          let count = 0;
          if (tab.id === "deposit") {
            count = depositRequests.filter(r => r.status === "pending").length;
          } else if (tab.id === "transfer") {
            count = transferRequests.filter(r => r.status === "pending").length;
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
                            <span className="font-mono font-bold text-gray-700">{item.transactionId || "N/A"}</span>
                          </div>

                          {item.createdAt && (
                            <div className="col-span-2 text-[10px] text-gray-500 pt-1 flex flex-col space-y-0.5 font-sans">
                              <span>অনুরোধ সময়: {new Date(item.createdAt).toLocaleString("bn-BD")}</span>
                              {item.completedAt && <span className="text-[#1D9E75] font-semibold">সম্পন্ন তারিখ: {new Date(item.completedAt).toLocaleString("bn-BD")}</span>}
                            </div>
                          )}
                        </div>

                        {/* Note if submitted */}
                        {item.note && (
                          <p className="text-[11px] text-[#6B7280] bg-orange-50/50 p-2 rounded-lg border border-orange-100/30">
                            💡 <strong>ইউজার নোট:</strong> {item.note}
                          </p>
                        )}

                        {/* Rejection reason display if cancelled */}
                        {item.status === "failed" && item.rejectReason && (
                          <p className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-100 font-sans">
                            ⚠️ <strong>বাতিল কারণ:</strong> {item.rejectReason}
                          </p>
                        )}

                        {/* User's uploaded screenshot of initial payment */}
                        {item.proofImageUrl && item.status !== "completed" && (
                          <div className="border border-gray-100 rounded-xl p-2 bg-gray-50 text-center font-sans">
                            <p className="text-[10px] text-gray-400 mb-1">গ্রাহকের পেমেন্ট স্ক্রিনশট (বড় করতে ট্যাপ করুন):</p>
                            <img 
                              src={item.proofImageUrl} 
                              alt="Customer Payment Receipt" 
                              onClick={() => setViewingImage(item.proofImageUrl)}
                              className="max-h-[160px] max-w-full object-contain rounded-lg border border-gray-100 mx-auto cursor-pointer"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Admin's uploaded proof of transfer to bKash (If completed) */}
                        {item.status === "completed" && item.proofImageUrl && (
                          <div className="border border-gray-100 rounded-xl p-2 bg-emerald-50/20 text-center font-sans">
                            <p className="text-[10px] text-[#1D9E75] mb-1 font-semibold">অফিসিয়াল ট্রান্সফার রিসিট প্রুফ (বড় করতে ট্যাপ করুন):</p>
                            <img 
                              src={item.proofImageUrl} 
                              alt="Official Receipt proof" 
                              onClick={() => setViewingImage(item.proofImageUrl)}
                              className="max-h-[160px] max-w-full object-contain rounded-lg border border-gray-100 mx-auto cursor-pointer"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Action buttons following precise styling parameters */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 flex-wrap">
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStartProcessingTransfer(item.id)}
                                className="bg-[#1B4F72] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] select-none cursor-pointer hover:opacity-95"
                              >
                                প্রক্রিয়া শুরু
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
                                className="bg-[#1B4F72] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] select-none cursor-pointer hover:opacity-95"
                              >
                                টাকা পাঠানো হচ্ছে
                              </button>
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
              onClick={() => setSelectedCompletedTransfer(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black rounded-full bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1D9E75]">ট্রান্সফার সম্পন্ন নিশ্চিত করুন</h3>
              <p className="text-[11px] text-gray-500 font-mono leading-none">আইডি: {selectedCompletedTransfer.id}</p>
            </div>

            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] space-y-1">
              <p>👤 <strong>গ্রাহক:</strong> {selectedCompletedTransfer.senderName}</p>
              <p>📞 <strong>প্রাপক:</strong> {selectedCompletedTransfer.recipientPhone}</p>
              <p>💵 <strong>পরিমাণ:</strong> ${selectedCompletedTransfer.amount} USD ({(selectedCompletedTransfer.amount * 110.8).toFixed(1)} BDT)</p>
            </div>

            <div className="space-y-3">
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

              <div className="flex flex-col space-y-1 text-left">
                <label className="text-[10px] text-gray-600 font-semibold font-sans">বিকাশ/নগদ পেমেন্ট রিসিট (প্রুফ স্ক্রিনশট):</label>
                <label className="border border-dashed border-[#E5E7EB] bg-[#F7F8FA] hover:bg-gray-100 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofImageChange}
                    className="hidden"
                  />
                  {proofSentImageCode ? (
                    <span className="text-[11px] text-[#1D9E75] font-semibold truncate max-w-[200px]">{proofSentImageName || "স্ক্রিনশট যুক্ত হয়েছে"}</span>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-[11px] text-gray-500 font-sans">ফাইল নির্বাচন করুন</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={handleCompleteTransferSubmit}
              className="w-full py-3 bg-[#1D9E75] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer font-sans"
            >
              সম্পন্ন নিশ্চিত করুন (Complete)
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
