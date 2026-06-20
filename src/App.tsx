import { useState, useEffect } from "react";
import { 
  Language, 
  NavTab, 
  Transaction, 
  Message, 
  LiveNotification,
  Job,
  ScamReport as ScamReportType
} from "./types";

// Component imports
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeDashboard from "./components/HomeDashboard";
import AIChat from "./components/AIChat";
import MoneyTransfer from "./components/MoneyTransfer";
import VisaInformation from "./components/VisaInformation";
import AirTicket from "./components/AirTicket";
import JobBoard from "./components/JobBoard";
import ScamReport from "./components/ScamReport";
import EmergencyHelp from "./components/EmergencyHelp";
import EmergencyCenter from "./components/EmergencyCenter";
import PremiumMembership from "./components/PremiumMembership";
import AuthScreen from "./components/AuthScreen";
import DepositPage from "./components/DepositPage";
import SendMoneyPage from "./components/SendMoneyPage";
import TransferStatus from "./components/TransferStatus";
import AdminDashboard, { SupportTicket } from "./components/AdminDashboard";
import AdminPanel from "./components/AdminPanel";
import ProfilePage from "./components/ProfilePage";
import { useAuth } from "./lib/AuthContext";
import { seedDatabaseIfNeeded, seedPaymentMethodsIfNeeded } from "./lib/seed";
import { db } from "./lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import { 
  ShieldAlert, 
  DollarSign, 
  Plane, 
  FileText, 
  Briefcase, 
  AlertOctagon, 
  Award, 
  User, 
  Mail, 
  CreditCard, 
  LogOut, 
  HelpCircle, 
  Zap, 
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react";

const SUPPORT_NAMES = ["হাসান", "রহিম", "ইমরান", "সোহেল"];

export default function App() {
  const { currentUser, userDoc, loading } = useAuth();
  const [lang, setLang] = useState<Language>("BN");
  const [currentTab, setTab] = useState<NavTab>(
    window.location.pathname === "/emergency" || window.location.pathname === "/emergency/" 
      ? "emergency" 
      : "home"
  );
  const [prefilledTxId, setPrefilledTxId] = useState<string>("");
  
  const navigate = (dir: number | string) => {
    setTab("home");
  };
  
  // subView manages screens inside "services" or shortcuts
  const [subView, setSubView] = useState<string>("none"); // "visa" | "money" | "ticket" | "jobs" | "scam" | "emergency" | "premium"

  // Maintenance States
  const [maintenance, setMaintenance] = useState<any>(null);
  const [serviceInMaintenance, setServiceInMaintenance] = useState<any>(null);

  const walletBalance = userDoc?.balance || 0;
  const currentTier = userDoc?.isPremium ? "vip" : (userDoc?.tier || "basic");
  const userEmail = currentUser?.email || "";

  const handleUpdateBalance = async (newBalance: number) => {
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid), {
          balance: newBalance
        }, { merge: true });
      } catch (err) {
        console.error("Error updating user balance:", err);
      }
    }
  };
  
  // Unified Jobs State for Real-Time Sync
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "job-1",
      title: "গার্মেন্টস সেলাই অপারেটর",
      company: "Phnom Penh Apparels Ltd.",
      location: "Veng Sreng Road, Phnom Penh",
      salaryRange: "$৩৫০ - $৪২০ / প্রতি মাস",
      category: "factory",
      isVerified: true,
      description: "বাংলাদেশি ভাইদের জন্য দুর্দান্ত সুযোগ। ফুড ও বাসস্থান সম্পূর্ণ ফ্রি। ওভারটাইম করার সুযোগ থাকবে। কাজের সময় প্রতিদিন ৮ ঘণ্টা।"
    },
    {
      id: "job-2",
      title: "হোটেল সহকারী বাবুর্চি (Chef)",
      company: "Dhaka Spice Restaurant",
      location: "BKK1, Phnom Penh",
      salaryRange: "$৩০০ - $৩৮০ / প্রতি মাস",
      category: "restaurant",
      isVerified: true,
      description: "বাংলাদেশি স্পাইসি খাবার তৈরিতে পারদর্শী হতে হবে। বাংলা ভাষায় কথা বলার সহকারী আছে। টিপস এর সুবিধা আছে।"
    },
    {
      id: "job-3",
      title: "কনস্ট্রাকশন সাইট ফোরম্যান",
      company: "Sihanoukville Port Construction",
      location: "Sihanoukville",
      salaryRange: "$৫০০ - $৬৫০ / প্রতি মাস",
      category: "construction",
      isVerified: false,
      description: "কংক্রিট মিক্সিং ও শ্রমিক পরিচালনার কাজে ৩ বছরের কাজের অভিজ্ঞতা জরুরি। দয়া করে কোনো দালাল বা এজেন্টকে টাকা দেবেন না।"
    },
    {
      id: "job-4",
      title: "গৃহস্থালি ও পরিষ্কারকর্মী",
      company: "Sen Sok Residentials",
      location: "Sen Sok, Phnom Penh",
      salaryRange: "$২৫০ - $৩০০ / প্রতি মাস",
      category: "household",
      isVerified: true,
      description: "ভাড়া বাসার রুম ও কিচেন পরিষ্কার করার হালকা কাজ। সপ্তাহে একদিন ছুটি থকবে।"
    }
  ]);

  // Unified Scam Reports State
  const [scamReports, setScamReports] = useState<ScamReportType[]>([
    {
      id: "report-1",
      scammerName: "মহসিন রেজা (Mohsin Reza)",
      scammerMeta: "FB: Mohsin.Cambodia / Mob: +855 97 882 1211",
      type: "visa",
      description: "৩ মাসের মাল্টিপল বিজনেস ভিসা এবং ওয়ার্ক পারমিট করিয়ে দেওয়ার কথা বলে ৮৫০ ডলার অগ্রিম নিয়েছে। এখন ফোন বন্ধ করে বাড়ি পরিবর্তন করেছে। ফনম পেনে অবস্থান করে বলে ধারণা করা হচ্ছে।",
      date: "আজকে দুপুরে",
      isAnonymous: true,
      isApproved: true
    },
    {
      id: "report-2",
      scammerName: "জেসমিন আক্তার টিকেটস (Jasmine Tour & Travels)",
      scammerMeta: "Facebook Page / Imo: +880 1832 9901",
      type: "ticket",
      description: "কম্বোডিয়া টু ঢাকা বিমানের ভুয়া টিকিট এডিট করে দিয়ে ৩০০ ডলার হাতিয়ে নেয়। বিমানবন্দরে পৌঁছানোর পর টিকিট ডেক্স কোডটি ভুয়া এবং বাতিল বলে চিহ্নিত করে।",
      date: "৩ দিন আগে",
      isAnonymous: false,
      isApproved: true
    }
  ]);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: "ticket-1",
      name: "কামরুল ইসলাম",
      phoneOrImo: "+৮৫৫ ৯৭ ২১৩ ১১৪২",
      subject: "পাসপোর্ট আটকে রাখা হয়েছে",
      description: "আমার নিয়োগকারী কোম্পানি বিনা কারণে আমার পাসপোর্ট আটকে রেখেছে এবং ফেরত দিচ্ছে না ভাই। আমি কীভাবে সমাজকল্যাণ উইং থেকে আইনি সহায়তা পেতে পারি বা দূতাবাসে অভিযোগ জানাতে পারি?",
      status: "pending",
      date: "আজ সকাল ১০:১৫",
      replies: ["আমরা আপনার তথ্যটি পেয়েছি ভাই। খুব জলদি সমাজকর্মী সোহেল মিয়া কোম্পানির মালিকের সাথে সরাসরি যোগাযোগ করছেন।"]
    },
    {
      id: "ticket-2",
      name: "মিজানুর রহমান",
      phoneOrImo: "+৮৫৫ ১২ ২৫৫ ৩২১",
      subject: "ভিসা ওভারস্টে জরিমানা",
      description: "আমার ফ্যামিলি ইমার্জেন্সির কারণে visa নবায়ন করতে পারিনি এবং বর্তমানে ২৫ দিনের ওভারস্টে জরিমানা দেখাচ্ছে ভাই। ইমিগ্রেশন পার্টনার দিয়ে এই জরিমানা মওকুফ করার কোনো সুযোগ আছে কি ভাই?",
      status: "pending",
      date: "গতকাল দুপুর ০৩:৪৫",
      replies: []
    },
    {
      id: "ticket-3",
      name: "আরিফুল ভাই",
      phoneOrImo: "+৮৮০ ১৮১২ ৩৪৪ ২১১",
      subject: "টাকা পাঠানোর এজেন্ট সমস্যা",
      description: "আমি এই প্লাটফর্মে ২০০ ডলার bKash রেমিটেন্স রিকোয়েস্ট পাঠিয়েছিলাম ভাই। সেটি সফল হয়েছে কিন্তু পরবর্তী ধাপে আরেকটি ছোট ট্রানজেকশনে কোনো ফি লাগবে কি না জানতে চাচ্ছিলাম ভাই।",
      status: "resolved",
      date: "২ দিন আগে",
      replies: ["প্রবাসী ভাই, প্রথম ট্রানজেকশনের পরে যেকোনো ট্রানজেকশনে মাত্র ০.৫% ফি প্রযোজ্য হবে। ধন্যবাদ ভাই।"]
    }
  ]);

  // Random Support Agent Name for human touch
  const [agentName, setAgentName] = useState<string>("হাসান");

  // Global controlled Exchange Rate state
  const [exchangeRate, setExchangeRate] = useState<number>(110.80);
  const [exchangeRateUnderTen, setExchangeRateUnderTen] = useState<number>(120.00);
  const [exchangeRateLimit, setExchangeRateLimit] = useState<number>(10.00);
  
  useEffect(() => {
    const randomName = SUPPORT_NAMES[Math.floor(Math.random() * SUPPORT_NAMES.length)];
    setAgentName(randomName);
    seedDatabaseIfNeeded();
    seedPaymentMethodsIfNeeded();

    // Live update for global exchange rates
    const unsub = onSnapshot(doc(db, "exchangeRates", "current"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.usdRate !== undefined) {
          setExchangeRate(Number(data.usdRate));
        } else if (data.bkash !== undefined) {
          setExchangeRate(Number(data.bkash));
        }
        if (data.exchangeRateUnderTen !== undefined) {
          setExchangeRateUnderTen(Number(data.exchangeRateUnderTen));
        }
        if (data.exchangeRateLimit !== undefined) {
          setExchangeRateLimit(Number(data.exchangeRateLimit));
        }
      }
    }, (err) => {
      console.warn("Exchange rate real-time listener skipped or failed:", err);
    });

    const unsubMaintenance = onSnapshot(doc(db, "maintenanceMode", "settings"), (snapshot) => {
      if (snapshot.exists()) {
        setMaintenance(snapshot.data());
      }
    }, (err) => {
      console.warn("Maintenance real-time listener skipped or failed:", err);
    });

    return () => {
      unsub();
      unsubMaintenance();
    };
  }, []);

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TX-99812",
      senderName: "সাজ্জাদ হোসেন",
      recipientName: "মনোয়ারা বেগম (মা)",
      recipientMethod: "bKash",
      recipientNumber: "01723456789",
      amountUsd: 100.00,
      amountBdt: 11080,
      feeUsd: 1.00,
      date: "২৩ মে, ২০২৬",
      status: "completed"
    },
    {
      id: "TX-99450",
      senderName: "সাজ্জাদ হোসেন",
      recipientName: "আব্দুল খালেক (ভাই)",
      recipientMethod: "Bank",
      recipientNumber: "12300450098",
      amountUsd: 50.00,
      amountBdt: 5540,
      feeUsd: 0.50,
      date: "২০ মে, ২০২৬",
      status: "completed"
    }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState<LiveNotification[]>([
    {
      id: "notif-1",
      title: "Ambassador Warning: Police Checking",
      bengaliTitle: "ফনম পেন পুলিশ স্পেশাল চেকিং!",
      description: "কম্বোডিয়ার ফনম পেনের ওয়াট ফনম এবং সেন সক এলাকায় ট্রাফিক ও ইমিগ্রেশন চেক জোরদার রয়েছে। সকল প্রবাসী ভাইদের কাছে ভ্যালিড পাসপোর্ট ও বিজনেস ভিসা কপি সাথে রাখার জন্য অনুরোধ করা যাচ্ছে।",
      date: "আজকে, ১০:৩০ AM",
      type: "alert"
    },
    {
      id: "notif-2",
      title: "Exchange Rate Hike!",
      bengaliTitle: "আজকে ডলারের রেট বৃদ্ধি পেয়েছে!",
      description: "বাংলাদেশী প্রবাসী ভাইদের জন্য প্রবাসীদের কষ্টের অর্থ প্রেরণে বিশেষ বোনাস যুক্ত হয়েছে। প্রতি ডলারের রেট সর্বোচ্চ ১১০.৮০ বিডিটি!",
      date: "আজকে, ০৮:১৫ AM",
      type: "success"
    },
    {
      id: "notif-3",
      title: "Scam Warning",
      bengaliTitle: "ভুয়ো টিকেট বিক্রেতা চক্র হতে সাবধান",
      description: "সামাজিক যোগাযোগ মাধ্যমে কিছু হ্যাকার কম মূল্যে বিমান টিকিট সরবরাহের কথা বলে ভুয়া PNR ফাইল ছড়াচ্ছে। টিকিট কেনার আগে আমাদের পোর্টাল থেকে সঠিক কোড মিলিয়ে নিন।",
      date: "গতকাল",
      type: "warning"
    }
  ]);

  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);

  // Chat/Messages State with initial Agent text
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Init chat greeting when agentName changes or app loads
  useEffect(() => {
    setMessages([
      {
        id: "init-msg",
        sender: "agent",
        text: `আস-সালামু আলাইকুম ভাই, আমি ${agentName} বলছি। কম্বোডিয়ায় আপনার যেকোনো সমস্যা বা দরকারে আমি সাহায্য করব। আপনার কী সমস্যা সেটি আমাদের নিচের বক্সে বাংলায় লিখে বলুন, আমরা চমৎকার সমাধান দেব!`,
        timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [agentName]);

  const handleSendMessage = async (text: string, file: File | null = null) => {
    // 1. Append user message
    const userMsgId = "msg-" + Date.now();
    const timestampStr = new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: text,
      timestamp: timestampStr,
      attachmentUrl: file ? URL.createObjectURL(file) : undefined,
      attachmentName: file ? file.name : undefined
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // 2. Trigger typing indicators
    setIsTyping(true);

    // 3. Make server API call or use local rule-based system
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          previousMessages: updatedMessages,
          agentName: agentName,
          userId: userDoc?.userId || "",
          userName: userDoc?.name || "প্রিয় ইউজার",
          userBalance: userDoc?.balance || 0,
          userPhone: userDoc?.phone || "",
          userTier: userDoc?.isPremium ? "VIP" : "Basic"
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      
      // Delay response for 1.8 seconds to feel incredibly realistic & human
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: "agent-" + Date.now(),
            sender: "agent",
            text: data.response || "দুঃখিত ভাই, সার্ভারের সাথে সংযোগে কোনো সমস্যা হচ্ছে। আমি কিছুক্ষণের মাঝে আসছি ভাই।",
            timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }, 1800);

    } catch (err) {
      console.warn("Using local rule-based emergency engine fallback", err);
      // Fallback local emulator response
      setTimeout(() => {
        setIsTyping(false);
        let replyText = "";
        const lowerText = text.toLowerCase();

        if (lowerText.includes("ভিসা") || lowerText.includes("ওভারস্টে")) {
          replyText = `ভাই, ওভারস্টে নিয়ে চিন্তা করবেন না। কম্বোডিয়ায় ওভারস্টে জরিমানা প্রতিদিন ১০ ডলার করে। অতিরিক্ত ৯৯ দিনের উপরে হয়ে গেলে আউটপাস নিয়ে ট্রাভেল করার চমৎকার সমাধান আমি দূতাবাসের সাথে কথা বলে করে দিব। ঠিক কতো দিনের ওভারস্টে হয়েছে আপনার একটু বলুন ভাই? আর কোনো সাহায্য লাগলে বলুন ভাই।`;
        } else if (lowerText.includes("টাকা") || lowerText.includes("পাঠা")) {
          replyText = `প্রবাসী ভাই, আপনি দেশের যেকোনো বিকাশ, নগদ বা রকেট হিসাবে সরাসরি খুব অল্প চার্জে আমাদের প্লাটফর্মের ‘টাকা পাঠান’ মেন্যু দিয়ে ট্রান্সফার করতে পারবেন ভাই। কত টাকা পাঠাবেন একটু সঠিক হিসাবটা বলুন, আমি সাহায্য করবো ধাপে ধাপে। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
        } else if (lowerText.includes("টিকেট") || lowerText.includes("ফ্লাইট")) {
          replyText = `ফ্লাইটের টিকিট বুকিং এর ব্যাপারে ট্রাভেল এজেন্টকে দিয়ে অনেক সাশ্রয়ী টিকেট আমি ম্যানেজ করে দিতে পারবো ভাই। কতো তারিখে বিমান যাত্রা করবেন এবং কয়টি সিট লাগবে আমাকে বিস্তারিত খুলে বলুন ভাই। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
        } else if (lowerText.includes("পুলিশ") || lowerText.includes("আটক")) {
          replyText = `ভাই!! একদম মাথা ঠান্ডা রাখুন, পুলিশি হয়রানি বা তল্লাশিতে অযথা ভয় পাবেন না ভাই। আপনি ঠিক ফনম পেনের কোন থানায় বা সড়কে আছেন দ্রুত আমাকে জানান, আমি প্রবাসী উইং এর সমাজকর্মীদের ডেকে আইনি পদক্ষেপ নিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
        } else if (lowerText.includes("চাকরি") || lowerText.includes("কাজ")) {
          replyText = `কম্বোডিয়ায় নিরাপদ কারখানায় বা রেস্তোরাঁয় কাজের জন্য সরাসরি ‘চাকরি বোর্ড’ ফিল্টার চেক করুন ভাই। ভুয়া ফেসবুক পোস্ট দিয়ে দালালের ফাঁদে পা দিয়ে আসল পাসপোর্ট হাতছাড়া করবেন না। আমাকে কোনো কাজ নিয়ে সন্দেহ হলে বলতে পারেন। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
        } else {
          replyText = `ভাই, আপনার উদ্বেগ আমি বুঝতে পেরেছি। চিন্তা করবেন না, আমরা প্রবাসী ভাইরা এখানে একই সুতোয় বাঁধা আছি। বিষয়টি সম্পর্কে একটু স্পষ্ট বা খোলামেলাভাবে বলুন ভাই, যাতে আমি সরাসরি সঠিক লোক দিয়ে সমাধান করে দিতে পারি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: "agent-local-" + Date.now(),
            sender: "agent",
            text: replyText,
            timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }, 1900);
    }
  };

  // Add customized message payload
  const handleSendMessageToChat = (text: string) => {
    handleSendMessage(text, null);
  };

  // Upgrade transaction handle
  const handleUpgradeTier = async (tier: string, cost: number) => {
    const currentBal = userDoc?.balance || 0;
    if (currentBal < cost) {
      alert(`দুঃখিত ভাই, মেম্বারশিপ ফি $${cost} পরিশোধের জন্য আপনার ওয়ালেটে পর্যাপ্ত টাকা নেই। দয়া করে ব্যালেন্স রিচার্জ করুন ভাই।`);
      return;
    }
    const newBal = currentBal - cost;
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid), {
          balance: newBal,
          tier: tier,
          isPremium: true
        }, { merge: true });
        alert(`অভিনন্দন ভাই! আপনি সফলভাবে এবং নিরাপদ প্রক্রিয়ায় প্রবাসী সেবা '${tier.toUpperCase()}' মেম্বারশিপে আপগ্রেড হয়েছেন। আপনার প্রোফাইল ব্যাজটি এখন লাইভ হয়েছে।`);
      } catch (err) {
        console.error("Upgrade error:", err);
        alert("আপগ্রেড করা সম্ভব হয়নি ভাই। পুনরায় চেষ্টা করুন!");
      }
    }
  };

  const handleSetTabAndResetSubView = (tab: NavTab) => {
    setTab(tab);
    setSubView("none");
  };

  const getServiceKey = (tab: NavTab, sub: string = "none"): string | null => {
    if (tab === "deposit") return "deposit";
    if (tab === "transfer") return "transfer";
    if (tab === "services" && sub === "visa") return "visa";
    if (tab === "services" && sub === "ticket") return "ticket";
    if (tab === "services" && sub === "jobs") return "jobs";
    if (tab === "services" && sub === "scam") return "scam";
    if (tab === "emergency") return "emergency";
    return null;
  };

  // Switch layout view by clicking Service Grid button
  const handleServiceSelect = (tab: NavTab, sub: string = "none") => {
    const serviceKey = getServiceKey(tab, sub);
    if (serviceKey && maintenance?.services?.[serviceKey]) {
      const sObj = maintenance.services[serviceKey];
      if (sObj.active === false) {
        setServiceInMaintenance({
          key: serviceKey,
          message: sObj.message || "এই সেবা সাময়িকভাবে বন্ধ আছে"
        });
        return; // PREVENT navigation
      }
    }

    setTab(tab);
    if (tab === "services") {
      setSubView(sub);
    } else {
      setSubView("none");
    }
  };

  // Real-time kick of active views if a service gets disabled under-the-floor
  useEffect(() => {
    if (!maintenance) return;
    const serviceKey = getServiceKey(currentTab, subView);
    if (serviceKey && maintenance?.services?.[serviceKey]) {
      const sObj = maintenance.services[serviceKey];
      if (sObj.active === false) {
        setTab("home");
        setSubView("none");
        setServiceInMaintenance({
          key: serviceKey,
          message: sObj.message || "এই সেবা সাময়িকভাবে বন্ধ আছে"
        });
      }
    }
  }, [currentTab, subView, maintenance]);

  // Intercept Admin Route
  if (
    window.location.pathname === "/admin" || 
    window.location.pathname === "/admin/" || 
    window.location.pathname === "/shamim" || 
    window.location.pathname === "/shamim/"
  ) {
    window.location.href = "/";
    return <div className="min-h-screen bg-white" />;
  }

  if (
    window.location.pathname === "/ps-control-2024" || 
    window.location.pathname === "/ps-control-2024/"
  ) {
    return <AdminPanel />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#6B7280] mt-3 font-sans">প্রবাসী সেবা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (maintenance?.globalMaintenance && 
      !(window.location.pathname === "/ps-control-2024" || window.location.pathname === "/ps-control-2024/")) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-6 text-center select-none text-[#1A1A2E] font-sans">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 max-w-sm w-full mx-auto font-sans" style={{ borderWidth: "0.5px" }}>
          <span className="text-[48px] block mb-4">🔧</span>
          <h1 className="text-[20px] font-medium text-[#1A1A2E] mb-2">রক্ষণাবেক্ষণ চলছে</h1>
          <p className="text-[14px] text-[#6B7280] mb-6 whitespace-pre-line leading-relaxed">
            {maintenance.maintenanceMessage || "سامয়িক রক্ষণাবেক্ষণ চলছে। শীঘ্রই ফিরে আসব।"}
          </p>
          <div className="bg-[#1B4F72]/5 text-[#1B4F72] text-[13px] py-2 px-4 rounded-xl inline-block">
            শীঘ্রই ফিরে আসব ইনশাআল্লাহ 🤲
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F0F4F8] text-[#1A1A2E] font-sans antialiased selection:bg-[#1B4F72] selection:text-white flex flex-col max-w-md mx-auto relative border-x border-[#E5E7EB] shadow-sm overflow-hidden">
      
      {/* Sticky Header with glowing bell notice check */}
      <Header 
        notifications={notifications}
        unreadCount={unreadNotifications}
        onBellClick={() => {
          setTab("notifications");
          setUnreadNotifications(0);
        }}
        lang={lang}
        exchangeRate={exchangeRate}
      />

      {/* Main Routed Area body container */}
      <main className="flex-1 overflow-y-auto pt-4 pb-28">
        
        {!currentUser ? (
          <AuthScreen 
            lang={lang}
            onSetLang={setLang}
          />
        ) : (
          <>
            {/* TAB: HOME */}
            {currentTab === "home" && (
              <HomeDashboard 
                onServiceSelect={handleServiceSelect} 
                walletBalance={walletBalance}
                exchangeRate={exchangeRate}
                userName={userDoc?.name}
              />
            )}

            {/* TAB: DEPOSIT */}
            {currentTab === "deposit" && (
              <DepositPage 
                onBack={() => setTab("home")} 
                userEmail={userEmail}
              />
            )}

            {/* TAB: CHAT SUPPORT */}
            {currentTab === "chat" && (
              <AIChat 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isTyping={isTyping} 
                agentName={agentName}
              />
            )}

            {/* TAB: REAL SERVICES */}
            {currentTab === "services" && (
              <div className="flex flex-col space-y-4">
                
                {/* Switch boards selector for subServices when subView !== "none" */}
                {subView === "none" ? (
                  <div className="px-4 space-y-4 animate-fade-in py-2">
                    <div className="text-center">
                      <h2 className="text-lg font-medium text-[#1A1A2E] font-sans">প্রবাসী সেবা ক্যাটাগরিসমূহ</h2>
                      <p className="text-xs text-[#6B7280] mt-0.5">সবগুলো সেবার তালিকা এখানে পাবেন ভাই</p>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { id: "visa", label: "ভিসা এবং আইনি তথ্য", icon: FileText, color: "text-[#1B4F72] bg-[#EBF5FB]" },
                        { id: "money", label: "টাকা পাঠান (রেমিটেন্স)", icon: DollarSign, color: "text-[#1D9E75] bg-[#E9F7EF]" },
                        { id: "ticket", label: "এয়ার টিকেট ও ট্রাভেল গাইড", icon: Plane, color: "text-[#534AB7] bg-[#EEF2FF]" },
                        { id: "jobs", label: "যাচাইকৃত চাকরি ও কর্মসংস্থান", icon: Briefcase, color: "text-[#1B4F72] bg-[#F0F3F4]" },
                        { id: "scam", label: "দালাল ও স্ক্যাম রিপোর্ট করুন", icon: ShieldAlert, color: "text-[#C0392B] bg-[#FDEDEC]" },
                        { id: "emergency", label: "জরুরি সংকেত (SOS Call)", icon: AlertOctagon, color: "text-[#E74C3C] bg-[#FDEDEC] animate-pulse" },
                        { id: "premium", label: "প্রিমিয়াম ভিআইপি মেম্বারশিপ", icon: Award, color: "text-[#D68910] bg-[#FDF2E9]" }
                      ].map((svc) => {
                        const Icon = svc.icon;
                        return (
                          <button
                            key={svc.id}
                            onClick={() => setSubView(svc.id)}
                            className="w-full bg-white p-4 rounded-xl border border-[#E5E7EB] hover:border-[#1B4F72]/30 flex justify-between items-center text-left transition-all outline-none"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`p-2 rounded-lg ${svc.color}`}>
                                <Icon className="w-5 h-5" />
                              </span>
                              <span className="text-xs font-medium text-[#1A1A2E] font-sans">{svc.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Floating Back navigation to list */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: 'white',
                      borderBottom: '0.5px solid #E5E7EB',
                      cursor: 'pointer'
                    }} onClick={() => setSubView("none")}>
                      <i className="ti ti-arrow-left" style={{color:'#1B4F72', fontSize:'18px'}}></i>
                      <span style={{color:'#1B4F72', fontSize:'14px', fontWeight:'500'}}>ফিরে যান</span>
                    </div>

                    <div className="pt-3">
                      {subView === "visa" && <VisaInformation />}
                      {subView === "money" && (
                        <MoneyTransfer 
                          walletBalance={walletBalance} 
                          onUpdateBalance={handleUpdateBalance}
                          transactions={transactions}
                          onAddTransaction={(newTx) => setTransactions([newTx, ...transactions])}
                          exchangeRate={exchangeRate}
                          exchangeRateUnderTen={exchangeRateUnderTen}
                          exchangeRateLimit={exchangeRateLimit}
                        />
                      )}
                      {subView === "ticket" && <AirTicket />}
                      {subView === "jobs" && <JobBoard jobs={jobs} onUpdateJobs={setJobs} />}
                      {subView === "scam" && <ScamReport reports={scamReports} onUpdateReports={setScamReports} />}
                      {subView === "emergency" && (
                        <EmergencyHelp 
                          onSwitchTab={handleSetTabAndResetSubView} 
                          onSendMessageToChat={handleSendMessageToChat}
                        />
                      )}
                      {subView === "premium" && (
                        <PremiumMembership 
                          onUpgrade={handleUpgradeTier} 
                          currentTier={currentTier}
                        />
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB: SYSTEM NOTIFICATIONS */}
            {currentTab === "notifications" && (
              <div className="flex flex-col space-y-4 pb-10">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'white',
                  borderBottom: '0.5px solid #E5E7EB',
                  cursor: 'pointer'
                }} onClick={() => navigate(-1)}>
                  <i className="ti ti-arrow-left" style={{color:'#1B4F72', fontSize:'18px'}}></i>
                  <span style={{color:'#1B4F72', fontSize:'14px', fontWeight:'500'}}>ফিরে যান</span>
                </div>

                <div className="text-center py-2 mt-2 px-4">
                  <h2 className="text-lg font-medium text-[#1A1A2E] font-sans">দূতাবাস ও প্রবাসী সেবা নোটিশ</h2>
                  <p className="text-xs text-[#6B7280] mt-1">সবচেয়ে গুরুত্বপূর্ণ আইনি সতর্কবার্তা ও লাইভ নোটিশ</p>
                </div>

                <div className="space-y-3.5 px-4">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-5 rounded-2xl border bg-white border-[#E5E7EB] shadow-sm`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-lg ${
                          notif.type === "alert" ? "bg-[#FDEDEC] text-[#E74C3C]" :
                          notif.type === "warning" ? "bg-[#FDF2E9] text-[#D68910]" :
                          notif.type === "success" ? "bg-[#E9F7EF] text-[#1D9E75]" :
                          "bg-gray-100 text-[#6B7280]"
                        }`}>
                          {notif.type === "alert" && "জরুরি সতর্কবার্তা"}
                          {notif.type === "warning" && "সতর্কতা পরামর্শ"}
                          {notif.type === "success" && "বিজ্ঞপ্তি আপডেট"}
                        </span>
                        <span className="text-[10px] text-[#6B7280] font-sans">{notif.date}</span>
                      </div>

                      <h3 className="text-xs font-medium font-sans text-[#1A1A2E] mb-2 leading-snug">{notif.bengaliTitle}</h3>
                      <p className="text-xs text-[#4B5563] leading-relaxed font-sans">{notif.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MONEY TRANSFER */}
            {currentTab === "transfer" && (
              <SendMoneyPage
                onBack={() => handleServiceSelect("home", "none")}
                userEmail={userEmail}
                walletBalance={walletBalance}
              />
            )}

            {/* TAB: TRANSFER STATUS TRACKING */}
            {currentTab === "transferStatus" && (
              <TransferStatus
                onBack={() => handleServiceSelect("home", "none")}
                prefilledTxId={prefilledTxId}
              />
            )}

            {/* TAB: PROFILE & ACCREDS */}
            {currentTab === "profile" && (
              <ProfilePage
                onBackToHome={() => handleServiceSelect("home")}
                onSelectTab={(tab, subView) => handleServiceSelect(tab, subView)}
                transactions={transactions}
              />
            )}

            {/* TAB: EMERGENCY CENTER */}
            {currentTab === "emergency" && (
              <div className="flex flex-col">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'white',
                  borderBottom: '0.5px solid #E5E7EB',
                  cursor: 'pointer'
                }} onClick={() => navigate(-1)}>
                  <i className="ti ti-arrow-left" style={{color:'#1B4F72', fontSize:'18px'}}></i>
                  <span style={{color:'#1B4F72', fontSize:'14px', fontWeight:'500'}}>ফিরে যান</span>
                </div>
                <EmergencyCenter />
              </div>
            )}

            {/* TAB: ADMIN CONTROL PANEL PORTAL */}
            {currentTab === "admin" && (
              <AdminDashboard 
                onBack={() => setTab("profile")}
                reports={scamReports}
                onUpdateReports={setScamReports}
                jobs={jobs}
                onUpdateJobs={setJobs}
                tickets={supportTickets}
                onUpdateTickets={setSupportTickets}
                exchangeRate={exchangeRate}
                onUpdateExchangeRate={setExchangeRate}
                exchangeRateUnderTen={exchangeRateUnderTen}
                onUpdateExchangeRateUnderTen={setExchangeRateUnderTen}
                exchangeRateLimit={exchangeRateLimit}
                onUpdateExchangeRateLimit={setExchangeRateLimit}
              />
            )}
          </>
        )}

      </main>

      {/* Persistent Bottom Nav for quick access */}
      {!!currentUser && (
        <BottomNav 
          currentTab={currentTab} 
          currentSubView={subView}
          setTab={handleServiceSelect}
          unreadNotifications={unreadNotifications}
          unreadChatCount={0}
        />
      )}

      {/* Service maintenance modal popup */}
      {serviceInMaintenance && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full mx-auto font-sans text-left" style={{ borderWidth: "0.5px" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[28px]">⚠️</span>
              <h3 className="text-base font-semibold text-[#1A1A2E]">সেবা বন্ধ আছে</h3>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6 whitespace-pre-line">
              {serviceInMaintenance.message || "এই সেবা সাময়িকভাবে বন্ধ আছে। খুব শীঘ্রই আবার চালু করা হবে ইনশাআল্লাহ।"}
            </p>
            <button
              onClick={() => setServiceInMaintenance(null)}
              className="w-full bg-[#1B4F72] text-white py-3 rounded-xl font-medium hover:bg-opacity-90 active:scale-[0.98] transition-all font-sans cursor-pointer text-sm"
            >
              ঠিক আছে, ফিরুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
