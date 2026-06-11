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
  // "news" | "ticker" | "exchange" | "jobs" | "scams" | "tickets" | "emergency"
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
  
  // Completed proof upload and reject modal states
  const [selectedCompletedTransfer, setSelectedCompletedTransfer] = useState<any | null>(null);
  const [proofSentImageCode, setProofSentImageCode] = useState<string>("");
  const [proofSentImageName, setProofSentImageName] = useState<string>("");
  const [minutesDuration, setMinutesDuration] = useState<string>("10");

  const [selectedRejectTransfer, setSelectedRejectTransfer] = useState<any | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState<string>("");

  // Form states for deposit and payment methods
  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodCountry, setNewMethodCountry] = useState<"BD" | "KH">("BD");
  const [newMethodColor, setNewMethodColor] = useState("#1B4F72");
  const [newMethodAccount, setNewMethodAccount] = useState("");

  // Form states for adding items
  const [newNews, setNewNews] = useState({ title: "", tag: "ভিসা", description: "" });
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

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchTabData(activeTab);
    }
  }, [isAdminLoggedIn, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "probashi2024admin") {
      localStorage.setItem("isAdminLogged", "true");
      setIsAdminLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন ভাই।");
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
        // Fetch deposit requests
        const q = query(collection(db, "depositRequests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setDepositRequests(list);

        // Fetch payment methods
        const snapM = await getDocs(collection(db, "paymentMethods"));
        const listM = snapM.docs.map(d => ({ id: d.id, ...d.data() }));
        listM.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setPaymentMethodsList(listM);
      } else if (tab === "transfer") {
        // Fetch transfer requests
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

  // --- ACTIONS ---

  // NEWS TAB
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.description) {
      showStatusMsg("সবগুলো ঘর পূরণ করুন ভাই!", true);
      return;
    }
    const path = "news";
    try {
      const newsId = `news_${Date.now()}`;
      await setDoc(doc(db, path, newsId), {
        id: newsId,
        title: newNews.title,
        tag: newNews.tag,
        description: newNews.description,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setNewNews({ title: "", tag: "ভিসা", description: "" });
      showStatusMsg("নতুন নোটিফিকেশন খবর সফলভাবে যুক্ত হয়েছে!");
      fetchTabData("news");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleToggleNews = async (item: any) => {
    const path = `news/${item.id}`;
    try {
      await updateDoc(doc(db, "news", item.id), {
        isActive: !item.isActive
      });
      showStatusMsg("খবরের স্থিতি পরিবর্তন করা হয়েছে।");
      fetchTabData("news");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
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
      handleFirestoreError(err, OperationType.DELETE, path);
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
    try {
      const tickerId = `ticker_${Date.now()}`;
      await setDoc(doc(db, path, tickerId), {
        id: tickerId,
        message: newTicker.message,
        isActive: true,
        order: Number(newTicker.order) || (ticker.length + 1),
        createdAt: new Date().toISOString()
      });
      setNewTicker({ message: "", order: ticker.length + 2 });
      showStatusMsg("টিকার বার্তা সফলভাবে যুক্ত হয়েছে!");
      fetchTabData("ticker");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleToggleTicker = async (item: any) => {
    const path = `ticker/${item.id}`;
    try {
      await updateDoc(doc(db, "ticker", item.id), {
        isActive: !item.isActive
      });
      showStatusMsg("টিকার বার্তার স্থিতি পরিবর্তন করা হয়েছে।");
      fetchTabData("ticker");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
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
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // EXCHANGE RATE TAB
  const handleUpdateExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = "exchangeRates/current";
    try {
      await setDoc(doc(db, "exchangeRates", "current"), {
        bkash: Number(exchange.bkash),
        nagad: Number(exchange.nagad),
        bank: Number(exchange.bank),
        usdRate: Number(exchange.usdRate),
        updatedAt: new Date().toISOString()
      });
      showStatusMsg("এক্সচেঞ্জ রেট সফলভাবে আপডেট করা হয়েছে ভাই!");
      fetchTabData("exchange");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
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
  const handleVerifyDeposit = async (id: string) => {
    try {
      const depRef = doc(db, "depositRequests", id);
      const depSnap = await getDoc(depRef);
      if (!depSnap.exists()) {
        showStatusMsg("অনুরোধটি পাওয়া যায়নি ভাই!", true);
        return;
      }
      
      const depData = depSnap.data();
      const defaultAmount = depData.amount || 0;
      const userId = depData.userId || "";
      
      const promptValue = window.prompt("কত ডলার যোগ করবেন?", defaultAmount.toString());
      if (promptValue === null) {
        return; // Clicked Cancel
      }
      
      const verifiedAmount = Number(promptValue);
      if (isNaN(verifiedAmount) || verifiedAmount <= 0) {
        showStatusMsg("সঠিক ডলার পরিমাণ ইনপুট দিন ভাই!", true);
        return;
      }
      
      // Update deposit request
      await updateDoc(depRef, {
        status: "verified",
        verifiedAmount: verifiedAmount,
        verifiedAt: new Date().toISOString()
      });
      
      // Update user wallet balance in real-time
      if (userId) {
        // Query user doc by matching are userId field "PS-XXXXXX"
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
          // If legacy/other format (e.g. document ID itself is PS-XXXXXX or email or uid)
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
      fetchTabData("deposit");
    } catch (err) {
      console.error("Error verifying deposit:", err);
      showStatusMsg("ভেরিফাই করতে সমস্যা হয়েছে ভাই।", true);
    }
  };

  const handleRejectDeposit = async (id: string) => {
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

      // 1. Update transfer request in Firestore
      await updateDoc(doc(db, "transferRequests", transferId), {
        status: "completed",
        proofImageUrl: proofSentImageCode,
        completedAt: new Date().toISOString()
      });

      // 2. Add an anonymized trust record to Public Transactions
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
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A2E]">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm text-center">
          <div className="w-14 h-14 bg-[#1B4F72]/10 text-[#1B4F72] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-medium text-[#1A1A2E] leading-tight mb-1">অ্যাডমিন লগইন পোর্টাল</h2>
          <p className="text-xs text-[#6B7280] mb-5">সিস্টেম কন্টেন্ট পরিবর্তন ও ডাটাবেজ আপডেট করতে পাসওয়ার্ড দিন</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-medium text-[#6B7280]">অ্যাডমিন অ্যাক্সেস পাসওয়ার্ড:</label>
              <input
                type="password"
                required
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-3 text-xs outline-none focus:border-[#1B4F72] transition-colors"
                style={{ fontSize: "14px" }}
              />
            </div>

            {loginError && (
              <p className="text-xs text-[#E74C3C] text-left leading-relaxed">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#1B4F72] text-white py-3 text-xs font-semibold rounded-xl hover:opacity-95 transition-all cursor-pointer"
            >
              লগইন করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-[#1A1A2E] pb-24 flex flex-col">
      {/* Top Banner Header */}
      <header className="bg-[#1B4F72] text-white px-4 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-[#1D9E75]" />
          <div>
            <h1 className="text-sm font-medium tracking-tight">প্রবাসী সেবা অ্যাডমিন কন্ট্রোল</h1>
            <p className="text-[10px] text-white/70">Probashi Sheba Firestore System</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-white/10 text-white border border-white/20 hover:bg-white/20 text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all"
        >
          লগআউট
        </button>
      </header>

      {/* Tabs navigation list */}
      <div className="bg-white border-b border-[#E5E7EB] px-3 py-2 flex overflow-x-auto no-scrollbar space-x-1.5 shrink-0">
        {[
          { id: "news", name: "নিউজ" },
          { id: "ticker", name: "টিকার" },
          { id: "exchange", name: "এক্সচেঞ্জ রেট" },
          { id: "jobs", name: "চাকরি" },
          { id: "scams", name: "স্ক্যাম রিপোর্ট" },
          { id: "tickets", name: "টিকেট অনুরোধ" },
          { id: "emergency", name: "জরুরি যোগাযোগ" },
          { id: "deposit", name: "ডিপোজিট" },
          { id: "transfer", name: "টাকা ট্রান্সফার" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs px-3.5 py-2.5 rounded-lg font-medium shrink-0 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? "bg-[#1B4F72] text-white" 
                : "text-[#6B7280] hover:bg-gray-100"
            }`}
          >
            {tab.name}
          </button>
        ))}
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
          <div className="space-y-4">
            
            {/* ==== NEWS TAB CONSOLE ==== */}
            {activeTab === "news" && (
              <div className="space-y-4">
                {/* Form to add */}
                <form onSubmit={handleAddNews} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-[#1B4F72] flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>নতুন নোটিশ / সংবাদ খাজাঞ্চি</span>
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">শিরোনাম (Title):</label>
                    <input 
                      type="text" 
                      required
                      placeholder="যেমন: কম্বোডিয়ায় ট্রাফিক নিয়ম কঠোর করা হয়েছে"
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">ক্যাটাগরি বা ট্যাগ (Tag):</label>
                      <select
                        value={newNews.tag}
                        onChange={(e) => setNewNews({ ...newNews, tag: e.target.value })}
                        className="w-full border border-[#E5E7EB] rounded-xl px-2 py-2 text-xs outline-none"
                      >
                        <option value="ভিসা">ভিসা</option>
                        <option value="সতর্কতা">সতর্কতা</option>
                        <option value="স্বাস্থ্য">স্বাস্থ্য</option>
                        <option value="চাকরি">চাকরি</option>
                        <option value="জরুরি">জরুরি</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">বিস্তারিত বার্তা (Description):</label>
                    <textarea
                      required
                      placeholder="খবরের বিস্তারিত বিবরণ এখানে বাংলায় লিখুন ভাই..."
                      rows={3}
                      value={newNews.description}
                      onChange={(e) => setNewNews({ ...newNews, description: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#1B4F72] text-white py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-95"
                  >
                    খবর পোস্ট করুন
                  </button>
                </form>

                {/* News listing */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#6B7280]">বর্তমানে লাইভ নোটিশ খবরের তালিকা:</h3>
                  {news.length === 0 ? (
                    <p className="text-xs text-[#6B7280] italic py-2">কোনো আইটেম পাওয়া যায়নি।</p>
                  ) : (
                    news.map((item) => (
                      <div key={item.id} className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex justify-between items-start space-x-2">
                        <div className="space-y-1 flex-1 text-left">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <span className="text-[10px] bg-[#EBF5FB] text-[#1B6CA8] px-2 py-0.5 rounded-full font-medium">
                              {item.tag}
                            </span>
                            <span className="text-[10px] text-[#6B7280]">{item.date}</span>
                            {!item.isActive && (
                              <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.25 rounded font-bold">ইনঅ্যাক্টিভ</span>
                            )}
                          </div>
                          <h4 className="text-xs font-medium text-[#1A1A2E] leading-tight">{item.title}</h4>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed">{item.description}</p>
                        </div>
                        <div className="flex flex-col space-y-1 shrink-0">
                          <button
                            onClick={() => handleToggleNews(item)}
                            className={`p-1.5 rounded-lg border text-xs flex items-center justify-center hover:bg-gray-50 cursor-pointer ${
                              item.isActive ? "border-green-300 text-green-600 mb-1" : "border-yellow-300 text-yellow-600 mb-1"
                            }`}
                            title={item.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                          >
                            {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="bg-[#E74C3C] text-white p-1.5 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
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
              <div className="space-y-4">
                {/* Form to add */}
                <form onSubmit={handleAddTicker} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-[#1B4F72] flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>নতুন স্ক্রলিং টিকার বার্তা এড করুন</span>
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">টিকার বার্তা (Message):</label>
                    <textarea
                      required
                      placeholder="যেমন: ⚠️ ওভারস্টে জরিমানা ১০ ডলার প্রতিদিন..."
                      value={newTicker.message}
                      onChange={(e) => setNewTicker({ ...newTicker, message: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs outline-none h-16 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">অগ্রাধিকার ক্রম (Order Number):</label>
                    <input
                      type="number"
                      required
                      value={newTicker.order}
                      onChange={(e) => setNewTicker({ ...newTicker, order: Number(e.target.value) })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#1B4F72] text-white py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-95"
                  >
                    টিকার বার্তা যোগ করুন
                  </button>
                </form>

                {/* Ticker list */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#6B7280]">বর্তমানে চালু থাকা স্ক্রলিং টিকারসমূহ:</h3>
                  {ticker.length === 0 ? (
                    <p className="text-xs text-[#6B7280] italic py-2">কোনো বার্তা পাওয়া যায়নি।</p>
                  ) : (
                    ticker.map((item) => (
                      <div key={item.id} className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex justify-between items-center space-x-2">
                        <div className="text-left flex-1 space-y-1">
                          <p className="text-xs text-[#1A1A2E] leading-normal">{item.message}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-[#6B7280]">
                            <span>ক্রম: {item.order}</span>
                            {!item.isActive && (
                              <span className="bg-red-100 text-red-600 px-1 py-0.25 rounded font-bold">বন্ধ</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1 shrink-0">
                          <button
                            onClick={() => handleToggleTicker(item)}
                            className={`p-1.5 rounded-lg border text-xs flex items-center justify-center hover:bg-gray-50 cursor-pointer ${
                              item.isActive ? "border-green-300 text-green-600" : "border-yellow-300 text-yellow-600"
                            }`}
                          >
                            {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTicker(item.id)}
                            className="bg-[#E74C3C] text-white p-1.5 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
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
              <form onSubmit={handleUpdateExchange} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-semibold text-[#1B4F72] flex items-center space-x-1.5 mb-1 text-left">
                  <Tag className="w-4 h-4" />
                  <span>লাইভ রেমিট্যান্স এক্সচেঞ্জ রেট কন্ট্রোল</span>
                </h3>

                <div className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">বিকাশ রেট (bKash Rate BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.bkash}
                      onChange={(e) => setExchange({ ...exchange, bkash: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1B4F72]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">নগদ রেট (Nagad Rate BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.nagad}
                      onChange={(e) => setExchange({ ...exchange, nagad: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1B4F72]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">ব্যাংক ট্রান্সফার রেট (Bank Transfer BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.bank}
                      onChange={(e) => setExchange({ ...exchange, bank: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1B4F72]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">সাধারণ ১ ডলার এক্সচেঞ্জ লিমিট রেট (USD rate):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={exchange.usdRate}
                      onChange={(e) => setExchange({ ...exchange, usdRate: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1B4F72]"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#1B4F72] text-white py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-95"
                >
                  এক্সচেঞ্জ রেট সেভ করুন
                </button>
              </form>
            )}

            {/* ==== JOBS TAB ==== */}
            {activeTab === "jobs" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#6B7280] text-left">কর্মসংস্থান ও চাকরি পোস্টসমূহ:</h3>
                {jobs.length === 0 ? (
                  <p className="text-xs text-[#6B7280] italic py-2">কোনো চাকরি পাওয়া যায়নি। ইউজার রিকোয়েস্ট তৈরি হলে এখানে আসবে ভাই।</p>
                ) : (
                  jobs.map((item) => (
                    <div key={item.id} className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex justify-between items-start space-x-2 text-left">
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-medium text-[#1A1A2E]">{item.title}</h4>
                        <p className="text-[11px] text-[#6B7280]">{item.company} • {item.location}</p>
                        <p className="text-[11px] font-medium text-[#1D9E75]">{item.salary}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                        
                        <div className="flex space-x-1.5 items-center mt-2 flex-wrap gap-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                            item.isVerified ? "bg-[#E9F7EF] text-[#1D9E75] border border-[#D4EFDF]" : "bg-gray-100 text-[#6B7280]"
                          }`}>
                            {item.isVerified ? "ভেরিফাইড" : "আনভেরিফাইড"}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                            item.isActive ? "bg-blue-50 text-[#1B4F72] border border-blue-100" : "bg-red-50 text-red-600"
                          }`}>
                            {item.isActive ? "সক্রিয়" : "বন্ধ"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleJobVerified(item)}
                          className="bg-white border border-[#E5E7EB] p-1.5 rounded-lg text-xs font-medium text-[#1B4F72] hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                          title="ভেরিফাইড টগল করুন"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleJobActive(item)}
                          className="bg-white border border-[#E5E7EB] p-1.5 rounded-lg text-xs font-medium text-[#1B4F72] hover:bg-gray-50 flex items-center justify-center cursor-pointer"
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
                  <p className="text-xs text-[#6B7280] italic py-2">কোনো স্ক্যাম রিপোর্ট পাওয়া যায়নি এখনও ভাই।</p>
                ) : (
                  scams.map((item) => (
                    <div key={item.id} className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-2 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-medium text-[#E74C3C]">{item.scammerInfo}</h4>
                          <p className="text-[10px] text-[#6B7280]">রিপোর্টার: {item.reporterName}</p>
                        </div>
                        <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase ${
                          item.status === 'verified' ? "bg-[#E9F7EF] text-[#1D9E75] border border-[#D4EFDF]" : 
                          item.status === 'rejected' ? "bg-red-50 text-red-600 border border-red-100" : 
                          "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {item.status === 'verified' ? "যাচাইকৃত সত্য" :
                           item.status === 'rejected' ? "বাতিলকৃত" : "তদন্তাধীন (Pending)"}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#1A1A2E] leading-relaxed bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]/50">{item.description}</p>
                      
                      <div className="flex justify-end space-x-1.5 pt-1">
                        <button
                          onClick={() => handleUpdateScamStatus(item.id, "verified")}
                          className="bg-[#1D9E75] text-white text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all"
                        >
                          সত্য নিশ্চিত (Verify)
                        </button>
                        <button
                          onClick={() => handleUpdateScamStatus(item.id, "rejected")}
                          className="bg-[#E74C3C] text-white text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all"
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
                  <p className="text-xs text-[#6B7280] italic py-2">কোনো বিমান টিকিটের বুকিং রিকোয়েস্ট পাওয়া যায়নি এখনও।</p>
                ) : (
                  tickets.map((item) => (
                    <div key={item.id} className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-2 text-left">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Plane className="w-5 h-5 text-[#1B4F72] shrink-0" />
                          <div>
                            <h4 className="text-xs font-medium text-[#1A1A2E]">{item.passengerName}</h4>
                            <p className="text-[10px] text-[#6B7280] font-mono">{item.phone}</p>
                          </div>
                        </div>
                        <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded ${
                          item.status === 'confirmed' ? "bg-[#E9F7EF] text-[#1D9E75] border border-[#D4EFDF]" : 
                          item.status === 'cancelled' ? "bg-red-50 text-red-600 border border-red-100" : 
                          "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {item.status === 'confirmed' ? "নিশ্চিত টিকিট" :
                           item.status === 'cancelled' ? "বাতিল" : "অপেক্ষমান"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]/50">
                        <div>
                          <span className="text-[#6B7280] text-[10px]">কোথা থেকে:</span>
                          <p className="font-medium text-[#1A1A2E]">{item.routeFrom}</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] text-[10px]">গন্তব্য:</span>
                          <p className="font-medium text-[#1A1A2E]">{item.routeTo}</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] text-[10px]">ফ্লাইট তারিখ:</span>
                          <p className="font-medium text-[#1A1A2E]">{item.date}</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] text-[10px]">যাত্রী সংখ্যা:</span>
                          <p className="font-medium text-[#1A1A2E]">{item.passengerCount} জন</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-1.5 pt-1">
                        <button
                          onClick={() => handleUpdateTicketStatus(item.id, "confirmed")}
                          className="bg-[#1D9E75] text-white text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all"
                        >
                          কনফার্ম করুন
                        </button>
                        <button
                          onClick={() => handleUpdateTicketStatus(item.id, "cancelled")}
                          className="bg-[#E74C3C] text-white text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all"
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
                {/* Form to add */}
                <form onSubmit={handleAddContact} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-[#1B4F72] flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>নতুন জরুরি কন্টাক্ট নম্বর যুক্ত করুন</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">সংস্থার নাম:</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: Phnom Penh Hospital"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        className="w-full border border-[#E5E7EB] rounded-xl px-2.5 py-2 text-xs outline-none"
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
                        className="w-full border border-[#E5E7EB] rounded-xl px-2.5 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">ক্যাটাগরি:</label>
                      <select
                        value={newContact.category}
                        onChange={(e) => setNewContact({ ...newContact, category: e.target.value })}
                        className="w-full border border-[#E5E7EB] rounded-xl px-2 py-2 text-xs outline-none"
                      >
                        <option value="দূতাবাস">দূতাবাস</option>
                        <option value="পুলিশ">পুলিশ</option>
                        <option value="হাসপাতাল">হাসপাতাল</option>
                        <option value="জরুরি">জরুরি</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B7280]">வரிசை ক্রম (Order):</label>
                      <input
                        type="number"
                        required
                        value={newContact.order}
                        onChange={(e) => setNewContact({ ...newContact, order: Number(e.target.value) })}
                        className="w-full border border-[#E5E7EB] rounded-xl px-2.5 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B7280]">সংক্ষিপ্ত বিবরণ (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      placeholder="যেমন: বিপদে ২৪ ঘণ্টা সহায়তা দেবে"
                      value={newContact.description}
                      onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#1B4F72] text-white py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-95"
                  >
                    ভলান্টিয়ার নম্বর এড করুন
                  </button>
                </form>

                {/* Contacts list */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#6B7280]">লাইভ সেভ করা কন্টাক্টসমূহ:</h3>
                  {emergency.length === 0 ? (
                    <p className="text-xs text-[#6B7280] italic py-2">কোনো কন্টাক্ট পাওয়া যায়নি ভাই।</p>
                  ) : (
                    emergency.map((item) => (
                      <div key={item.id} className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex justify-between items-center text-left">
                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs font-semibold text-[#1A1A2E]">{item.name}</p>
                          <div className="flex items-center space-x-1">
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
                                className="border border-[#E5E7EB] text-xs px-2 py-1 rounded outline-none w-36 font-semibold"
                              />
                              <button
                                onClick={() => handleUpdateContactPhone(item.id)}
                                className="bg-[#1D9E75] text-white p-1 rounded hover:opacity-90"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingContactId(null);
                                  setEditPhoneValue("");
                                }}
                                className="bg-gray-200 text-[#1A1A2E] p-1 rounded hover:opacity-90"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs font-medium text-[#1B4F72] mt-1 flex items-center space-x-1">
                              <Smartphone className="w-3.5 h-3.5 text-[#6B7280]" />
                              <span>{item.phone}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingContactId(item.id);
                              setEditPhoneValue(item.phone);
                            }}
                            className="bg-white border border-[#E5E7EB] text-[#1B4F72] hover:bg-gray-50 p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(item.id)}
                            className="bg-[#E74C3C] text-white p-1.5 rounded-lg hover:opacity-90 flex items-center justify-center cursor-pointer"
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

            {/* ==== DEPOSIT SYSTEM TAB ==== */}
            {activeTab === "deposit" && (
              <div className="space-y-4">
                
                {/* Sub-tabs selector for Deposit Dashboard */}
                <div className="flex bg-white rounded-xl p-1 border border-[#E5E7EB] select-none text-xs">
                  <button
                    onClick={() => setDepositSubTab("requests")}
                    className={`flex-1 py-2 font-medium rounded-lg transition-all ${
                      depositSubTab === "requests"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    অনুরোধ ({depositRequests.length})
                  </button>
                  <button
                    onClick={() => setDepositSubTab("methods")}
                    className={`flex-1 py-2 font-medium rounded-lg transition-all ${
                      depositSubTab === "methods"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    পেমেন্ট মেথড ({paymentMethodsList.length})
                  </button>
                </div>

                {/* SUB-TAB 1: DEPOSIT REQUESTS */}
                {depositSubTab === "requests" && (
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-semibold text-[#6B7280] text-left">ডিপোজিট ভাউচার ও অনুরোধের তালিকা:</h3>
                    
                    {depositRequests.length === 0 ? (
                      <p className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl p-6 text-center italic">
                        কোনো ডিপোজিট অনুরোধ পাওয়া যায়নি ভাই।
                      </p>
                    ) : (
                      depositRequests.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-white border rounded-2xl p-4 space-y-3 text-left"
                          style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                        >
                          {/* Card Header Info */}
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <p className="text-xs font-semibold text-[#1A1A2E]">{item.id}</p>
                              <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">ইউজার: {item.userId}</p>
                            </div>
                            
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                              item.status === "verified" ? "bg-[#E9F7EF] text-[#1D9E75] border border-[#D4EFDF]" :
                              item.status === "rejected" ? "bg-red-50 text-red-600 border border-red-100" :
                              "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}>
                              {item.status === "verified" ? "ভেরিফাইড" :
                               item.status === "rejected" ? "বাতিলকৃত" : "অপেক্ষমান (Pending)"}
                            </span>
                          </div>

                          {/* Details Row */}
                          <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                            <div>
                              <span className="text-[#6B7280] text-[10px]">পরিমাণ (Amount):</span>
                              <p className="font-semibold text-[#1A1A2E]">{item.amount} {item.currency}</p>
                            </div>
                            <div>
                              <span className="text-[#6B7280] text-[10px]">পেমেন্ট মাধ্যম (Method):</span>
                              <p className="font-semibold text-[#1A1A2E]">{item.paymentMethodName || item.paymentMethodId}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[#6B7280] text-[10px]">Transaction / Reference No:</span>
                              <p className="font-mono text-[11px] font-semibold text-[#1B4F72] break-all">{item.transactionId}</p>
                            </div>
                            {item.createdAt && (
                              <div className="col-span-2 text-[10px] text-[#6B7280] border-t border-gray-100 pt-1.5 flex justify-between">
                                <span>তারিখ: {new Date(item.createdAt).toLocaleString("bn-BD")}</span>
                                {item.verifiedAt && <span className="text-emerald-600">ভেরিফাইড: {new Date(item.verifiedAt).toLocaleDateString("bn-BD")}</span>}
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {item.note && (
                            <p className="text-[11px] text-[#6B7280] bg-orange-50/50 border border-orange-100/50 p-2 rounded-lg leading-relaxed">
                              💡 <strong>নোট:</strong> {item.note}
                            </p>
                          )}

                          {/* Screenshot display */}
                          {item.screenshotUrl && (
                            <div className="border border-gray-100 rounded-xl p-1.5 bg-gray-50 flex items-center justify-center">
                              <div className="text-center w-full">
                                <p className="text-[9.5px] text-gray-500 mb-1">পেমেন্ট স্ক্রিনশট রিসিট:</p>
                                <img 
                                  src={item.screenshotUrl} 
                                  alt="Payment Screenshot Receipt" 
                                  className="max-h-[220px] max-w-full object-contain rounded-lg border border-gray-200 mx-auto"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                          )}

                          {/* Actions Footer */}
                          {item.status === "pending" && (
                            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 pt-2.5">
                              <button
                                onClick={() => handleVerifyDeposit(item.id)}
                                className="bg-[#1D9E75] hover:opacity-90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all select-none"
                              >
                                Verify (অনুমোদন)
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(item.id)}
                                className="bg-[#E74C3C] hover:opacity-90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all select-none"
                              >
                                Reject (বাতিল)
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SUB-TAB 2: PAYMENT METHODS */}
                {depositSubTab === "methods" && (
                  <div className="space-y-4">
                    
                    {/* Add New Method Form */}
                    <form onSubmit={handleAddPaymentMethod} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-[#1B4F72] flex items-center space-x-1.5">
                        <Plus className="w-4 h-4" />
                        <span>নতুন পেমেন্ট গেটওয়ে সংযুক্তি</span>
                      </h3>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-medium text-[#6B7280]">গেটওয়ে নাম:</label>
                          <input 
                            type="text" 
                            required
                            placeholder="যেমন: Rocket বা CellFin"
                            value={newMethodName}
                            onChange={(e) => setNewMethodName(e.target.value)}
                            className="w-full border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                        
                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-medium text-[#6B7280]">দেশ/কান্ট্রি:</label>
                          <select
                            value={newMethodCountry}
                            onChange={(e) => setNewMethodCountry(e.target.value as "BD" | "KH")}
                            className="w-full border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-xs outline-none"
                          >
                            <option value="BD">🇧🇩 বাংলাদেশ (BDT)</option>
                            <option value="KH">🇰🇭 কম্বোডিয়া (USD)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1 text-left">
                          <label className="text-[11px] font-medium text-[#6B7280]">প্রাপক হিসাব (Account Details):</label>
                          <input 
                            type="text" 
                            required
                            placeholder="যেমন: Personal ০১৭xxxxxx বা ABA xxxxx"
                            value={newMethodAccount}
                            onChange={(e) => setNewMethodAccount(e.target.value)}
                            className="w-full border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-medium text-[#6B7280]">কালার কোড:</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={newMethodColor}
                              onChange={(e) => setNewMethodColor(e.target.value)}
                              className="w-8 h-7 p-0 border border-gray-200 rounded cursor-pointer shrink-0"
                            />
                            <span className="text-[11px] font-mono select-all text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">{newMethodColor}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#1B4F72] text-white py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-95"
                      >
                        গেটওয়ে যুক্ত করুন
                      </button>
                    </form>

                    {/* Listing existing methods */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[#6B7280] text-left">বিদ্যমান গেটওয়ে সমূহের তালিকা:</h3>
                      
                      {paymentMethodsList.length === 0 ? (
                        <p className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl p-4 text-center italic">
                          কোনো মেথড পাওয়া যায়নি।
                        </p>
                      ) : (
                        paymentMethodsList.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-white border rounded-xl p-3.5 flex flex-col gap-2.5 text-left"
                            style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                          >
                            <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl">
                              <div className="flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-xs font-bold text-[#1A1A2E]">{item.name}</span>
                                <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.25 rounded">
                                  {item.country === "BD" ? "🇧🇩 BD (BDT)" : "🇰🇭 KH (USD)"}
                                </span>
                              </div>

                              {/* Toggle Active state */}
                              <div className="flex items-center space-x-1.5 select-none">
                                <span className="text-[10px] text-gray-500">{item.isActive ? "সক্রিয়" : "বন্ধ"}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleMethodActive(item.id, item.isActive)}
                                  className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 outline-none ${
                                    item.isActive ? "bg-[#1D9E75]" : "bg-gray-300"
                                  }`}
                                >
                                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                    item.isActive ? "translate-x-4" : "translate-x-0"
                                  }`} />
                                </button>
                              </div>
                            </div>

                            {/* Details and QR area */}
                            <div className="flex justify-between items-center gap-3">
                              <div className="text-xs text-gray-600 flex-1">
                                <p><strong>হিসাব:</strong> {item.accountName}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">অর্ডার: {item.order}</p>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                {item.qrImageUrl ? (
                                  <img 
                                    src={item.qrImageUrl} 
                                    alt="QR Preview" 
                                    className="w-[50px] h-[50px] object-contain rounded border bg-gray-50"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <span className="text-[9px] text-[#E74C40] italic shrink-0 font-sans">কোনো QR নেই</span>
                                )}

                                {/* Styled File Selector for uploading QR image */}
                                <label className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl cursor-pointer font-semibold transition-all shrink-0">
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
                )}
              </div>
            )}

            {/* ==== MONEY TRANSFER SYSTEM TAB ==== */}
            {activeTab === "transfer" && (
              <div className="space-y-4 font-sans">
                
                {/* Sub-tabs selector for Transfer Dashboard */}
                <div className="flex bg-white rounded-xl p-1 border border-[#E5E7EB] select-none text-xs">
                  <button
                    onClick={() => setTransferSubTab("new")}
                    className={`flex-1 py-2 font-medium rounded-lg transition-all ${
                      transferSubTab === "new"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    নতুন অনুরোধ ({transferRequests.filter(r => r.status === "pending").length})
                  </button>
                  <button
                    onClick={() => setTransferSubTab("processing")}
                    className={`flex-1 py-2 font-medium rounded-lg transition-all ${
                      transferSubTab === "processing"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    প্রক্রিয়াধীন ({transferRequests.filter(r => r.status === "processing" || r.status === "sent").length})
                  </button>
                  <button
                    onClick={() => setTransferSubTab("completed")}
                    className={`flex-1 py-2 font-medium rounded-lg transition-all ${
                      transferSubTab === "completed"
                        ? "bg-[#1B4F72] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    সম্পন্ন/বাতিল ({transferRequests.filter(r => r.status === "completed" || r.status === "failed").length})
                  </button>
                </div>

                {/* Filtering transfer items based on subtab */}
                <div className="space-y-4">
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
                        className="bg-white border rounded-2xl p-4 space-y-3.5 text-left font-sans"
                        style={{ borderColor: "#E5E7EB", borderWidth: "0.5px" }}
                      >
                        {/* Header info */}
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <p className="text-xs font-semibold text-[#1B4F72] font-mono">{item.id}</p>
                            <p className="text-[10px] text-[#6B7280]">ইউজার আইডি: {item.userId}</p>
                          </div>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                            item.status === "completed" ? "bg-[#E9F7EF] text-[#1D9E75] border border-[#D4EFDF]" :
                            item.status === "failed" ? "bg-red-50 text-red-600 border border-red-100" :
                            item.status === "processing" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            item.status === "sent" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                            "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {item.status === "completed" ? "সম্পন্ন" :
                             item.status === "failed" ? "বাতিল" :
                             item.status === "processing" ? "যাচাইকরণ (Processing)" :
                             item.status === "sent" ? "টাকা পাঠানো হচ্ছে (Sent)" : "নতুন (Pending)"}
                          </span>
                        </div>

                        {/* Main grid fields */}
                        <div className="grid grid-cols-2 gap-2.5 text-xs bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-[#6B7280] text-[10px] block">প্রেরক নাম:</span>
                            <span className="font-semibold text-gray-800">{item.senderName}</span>
                          </div>
                          <div>
                            <span className="text-[#6B7280] text-[10px] block">প্রেরক ফোন:</span>
                            <span className="font-semibold text-gray-800">{item.senderPhone}</span>
                          </div>

                          <div className="col-span-2 border-t border-gray-100/60 my-0.5" />

                          <div>
                            <span className="text-[#6B7280] text-[10px] block">পাঠানো পরিমাণ:</span>
                            <span className="font-bold text-[#1B4F72]">${item.amount} USD</span>
                            <p className="text-[10.5px] text-emerald-600 font-semibold mt-0.5">রিসিভ পাবেন: {(item.amount * 110.8).toFixed(1)} BDT</p>
                          </div>

                          <div>
                            <span className="text-[#6B7280] text-[10px] block">প্রাপকের চ্যানেল/ফোন:</span>
                            <span className="font-bold text-gray-800">{item.recipientMethod.toUpperCase()}</span>
                            <p className="font-mono text-gray-700 mt-0.5">{item.recipientPhone}</p>
                          </div>

                          {item.recipientMethod === "bank" && (
                            <div className="col-span-2 bg-[#F2F4F4]/70 p-2 rounded-lg text-[11px] leading-relaxed text-gray-700">
                              <p>🏦 <strong>ব্যাংক:</strong> {item.recipientBank}</p>
                              <p>💳 <strong>অ্যাকাউন্ট:</strong> {item.recipientAccount}</p>
                            </div>
                          )}

                          <div className="col-span-2 border-t border-gray-100/60 my-0.5" />

                          <div className="col-span-2">
                            <span className="text-[#6B7280] text-[10px] block">Cambodia Payment Reference ID:</span>
                            <span className="font-mono font-bold text-gray-700">{item.transactionId || "N/A"}</span>
                          </div>

                          {item.createdAt && (
                            <div className="col-span-2 text-[10.5px] text-gray-500 pt-1 flex justify-between">
                              <span>অনুরোধ সময়: {new Date(item.createdAt).toLocaleString("bn-BD")}</span>
                              {item.completedAt && <span className="text-[#1D9E75]">সম্পন্ন তারিখ: {new Date(item.completedAt).toLocaleString("bn-BD")}</span>}
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
                          <p className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-100">
                            ⚠️ <strong>বাতিল কারণ:</strong> {item.rejectReason}
                          </p>
                        )}

                        {/* User's uploaded screenshot of initial payment */}
                        {item.proofImageUrl && item.status !== "completed" && (
                          <div className="border border-gray-100 rounded-xl p-2 bg-gray-50 text-center">
                            <p className="text-[10px] text-gray-400 mb-1">গ্রাহকের পেমেন্ট স্ক্রিনশট:</p>
                            <img 
                              src={item.proofImageUrl} 
                              alt="Customer Payment Receipt" 
                              className="max-h-[220px] max-w-full object-contain rounded-lg border border-gray-100 mx-auto"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Admin's uploaded proof of transfer to bKash (If completed) */}
                        {item.status === "completed" && item.proofImageUrl && (
                          <div className="border border-gray-100 rounded-xl p-2 bg-emerald-50/20 text-center">
                            <p className="text-[10px] text-emerald-600 mb-1">অফিসিয়াল ট্রান্সফার রিসিট প্রুফ:</p>
                            <img 
                              src={item.proofImageUrl} 
                              alt="Official Receipt proof" 
                              className="max-h-[220px] max-w-full object-contain rounded-lg border border-gray-100 mx-auto"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStartProcessingTransfer(item.id)}
                                className="bg-[#1B4F72] hover:bg-opacity-95 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl select-none"
                              >
                                যাচাই শুরু করুন (Processing)
                              </button>
                              <button
                                onClick={() => setSelectedRejectTransfer(item)}
                                className="bg-[#E74C3C] hover:bg-opacity-90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl select-none"
                              >
                                বাতিল (Reject)
                              </button>
                            </>
                          )}

                          {item.status === "processing" && (
                            <>
                              <button
                                onClick={() => handleStartSentTransfer(item.id)}
                                className="bg-indigo-600 hover:opacity-95 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl select-none"
                              >
                                টাকা পাঠানো হচ্ছে (Sent)
                              </button>
                              <button
                                onClick={() => setSelectedCompletedTransfer(item)}
                                className="bg-[#1D9E75] hover:opacity-95 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl select-none"
                              >
                                পেমেন্ট সম্পন্ন করুন ✅
                              </button>
                              <button
                                onClick={() => setSelectedRejectTransfer(item)}
                                className="bg-[#E74C3C] hover:bg-opacity-90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl select-none"
                              >
                                বাতিল (Failed)
                              </button>
                            </>
                          )}

                          {item.status === "sent" && (
                            <>
                              <button
                                onClick={() => setSelectedCompletedTransfer(item)}
                                className="bg-[#1D9E75] hover:opacity-95 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl select-none"
                              >
                                পেমেন্ট সম্পন্ন করুন ✅
                              </button>
                              <button
                                onClick={() => setSelectedRejectTransfer(item)}
                                className="bg-[#E74C3C] hover:bg-opacity-90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl select-none"
                              >
                                বাতিল (Failed)
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

          </div>
        )}
      </div>

      {/* ==== MODAL 1: COMPLETE TRANSFER WITH RECEIPT ==== */}
      {selectedCompletedTransfer && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-[#1A1A2E] font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] text-left relative space-y-4">
            <button
              onClick={() => setSelectedCompletedTransfer(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black rounded-full bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1D9E75]">ট্রান্সফার সম্পন্ন নিশ্চিত করুন</h3>
              <p className="text-[11px] text-gray-500">আইডি: {selectedCompletedTransfer.id}</p>
            </div>

            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] space-y-1">
              <p>👤 <strong>গ্রাহক:</strong> {selectedCompletedTransfer.senderName}</p>
              <p>📞 <strong>প্রাপক:</strong> {selectedCompletedTransfer.recipientName} ({selectedCompletedTransfer.recipientPhone})</p>
              <p>💵 <strong>পরিমাণ:</strong> ${selectedCompletedTransfer.amount} USD ({(selectedCompletedTransfer.amount * 110.8).toFixed(1)} BDT)</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-gray-600 font-medium">কত মিনিট লেগেছে সম্পন্ন করতে (ট্রাস্ট ফিডের জন্য):</label>
                <input
                  type="number"
                  value={minutesDuration}
                  onChange={(e) => setMinutesDuration(e.target.value)}
                  placeholder="যেমন: 10"
                  className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-gray-600 font-medium">বিকাশ/নগদ পেমেন্ট রিসিট (প্রুফ স্ক্রিনশট):</label>
                <label className="border border-dashed border-[#E5E7EB] bg-[#F7F8FA] hover:bg-gray-100 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofImageChange}
                    className="hidden"
                  />
                  {proofSentImageCode ? (
                    <span className="text-[11px] text-emerald-600 font-semibold truncate max-w-[200px]">{proofSentImageName || "স্ক্রিনশট যুক্ত হয়েছে"}</span>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-[11px] text-gray-500">ফাইল নির্বাচন করুন</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={handleCompleteTransferSubmit}
              className="w-full py-2 bg-[#1C9670] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl transition-all"
            >
              সম্পন্ন নিশ্চিত করুন (Complete)
            </button>
          </div>
        </div>
      )}

      {/* ==== MODAL 2: REJECT REQUEST ==== */}
      {selectedRejectTransfer && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-[#1A1A2E] font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] text-left relative space-y-4">
            <button
              onClick={() => setSelectedRejectTransfer(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black rounded-full bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#E74C3C]">অনুরোধ বাতিল করুন</h3>
              <p className="text-[11px] text-gray-500">আইডি: {selectedRejectTransfer.id}</p>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-600 font-medium font-sans">বাতিল করার উপযুক্ত কারণ উল্লেখ করুন (ইউজার দেখতে পাবেন):</label>
              <textarea
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="যেমন: রেফারেন্স ভুল বা সম্পূর্ণ রিসিট পেমেন্ট পাওয়া যায়নি।"
                rows={3}
                className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs outline-none font-sans resize-none"
              />
            </div>

            <button
              onClick={handleRejectTransferSubmit}
              className="w-full py-2 bg-[#E74C3C] hover:bg-opacity-95 text-white font-semibold text-xs rounded-xl transition-all"
            >
              অনুরোধ বাতিল করুন (Reject Request)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
