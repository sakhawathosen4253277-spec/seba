import { useState, useEffect } from "react";
import { 
  Language, 
  NavTab, 
  Transaction, 
  Message, 
  LiveNotification 
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
import PremiumMembership from "./components/PremiumMembership";
import AuthScreen from "./components/AuthScreen";

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
  const [lang, setLang] = useState<Language>("BN");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Logged in by default for high UX
  const [userEmail, setUserEmail] = useState<string>("sakhawathosen4253277@gmail.com");
  const [currentTab, setTab] = useState<NavTab>("home");
  
  // subView manages screens inside "services" or shortcuts
  const [subView, setSubView] = useState<string>("none"); // "visa" | "money" | "ticket" | "jobs" | "scam" | "emergency" | "premium"
  const [walletBalance, setWalletBalance] = useState<number>(250.00); // Start with $250.00 USD
  const [currentTier, setCurrentTier] = useState<string>("basic"); // "basic" | "pro" | "vip"
  
  // Random Support Agent Name for human touch
  const [agentName, setAgentName] = useState<string>("হাসান");
  
  useEffect(() => {
    const randomName = SUPPORT_NAMES[Math.floor(Math.random() * SUPPORT_NAMES.length)];
    setAgentName(randomName);
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
          agentName: agentName
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
  const handleUpgradeTier = (tier: string, cost: number) => {
    if (walletBalance < cost) {
      alert(`দুঃখিত ভাই, মেম্বারশিপ ফি $${cost} পরিশোধের জন্য আপনার ওয়ালেটে পর্যাপ্ত টাকা নেই। দয়া করে ব্যালেন্স রিচার্জ করুন ভাই।`);
      return;
    }
    setWalletBalance((prev) => prev - cost);
    setCurrentTier(tier);
    alert(`অভিনন্দন ভাই! আপনি সফলভাবে এবং নিরাপদ প্রক্রিয়ায় প্রবাসী সেবা '${tier.toUpperCase()}' মেম্বারশিপে আপগ্রেড হয়েছেন। আপনার প্রোফাইল ব্যাজটি এখন লাইভ হয়েছে।`);
  };

  const handleSetTabAndResetSubView = (tab: NavTab) => {
    setTab(tab);
    setSubView("none");
  };

  // Switch layout view by clicking Service Grid button
  const handleServiceSelect = (tab: NavTab, sub: string = "none") => {
    setTab(tab);
    if (tab === "services") {
      setSubView(sub);
    } else {
      setSubView("none");
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-[#ffffff] font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 flex flex-col max-w-md mx-auto relative border-x border-[#121c38] shadow-2xl overflow-x-hidden pb-16">
      
      {/* Sticky Header with glowing bell notice check */}
      <Header 
        notifications={notifications}
        unreadCount={unreadNotifications}
        onBellClick={() => {
          setTab("notifications");
          setUnreadNotifications(0);
        }}
        lang={lang}
      />

      {/* Main Routed Area body container */}
      <main className="flex-1 overflow-y-auto pt-4 pb-20">
        
        {!isLoggedIn ? (
          <AuthScreen 
            onLoginSuccess={(email) => {
              setUserEmail(email);
              setIsLoggedIn(true);
            }}
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
                      <h2 className="text-lg font-bold text-white font-sans">প্রবাসী সেবা ক্যাটাগরিসমূহ</h2>
                      <p className="text-xs text-slate-400 mt-0.5">সবগুলো সেবার তালিকা এখানে পাবেন ভাই</p>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { id: "visa", label: "ভিসা এবং আইনি তথ্য", icon: FileText, color: "text-blue-400 bg-blue-500/10" },
                        { id: "money", label: "টাকা পাঠান (রেমিটেন্স)", icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10" },
                        { id: "ticket", label: "এয়ার টিকেট ও ট্রাভেল গাইড", icon: Plane, color: "text-indigo-405 text-indigo-400 bg-indigo-500/10" },
                        { id: "jobs", label: "যাচাইকৃত চাকরি ও কর্মসংস্থান", icon: Briefcase, color: "text-emerald-300 bg-emerald-500/10" },
                        { id: "scam", label: "দালাল ও স্ক্যাম রিপোর্ট করুন", icon: ShieldAlert, color: "text-red-400 bg-red-500/10" },
                        { id: "emergency", label: "জরুরি সংকেত (SOS Call)", icon: AlertOctagon, color: "text-red-500 bg-red-500/20 animate-pulse" },
                        { id: "premium", label: "প্রিমিয়াম ভিআইপি মেম্বারশিপ", icon: Award, color: "text-amber-400 bg-amber-500/10" }
                      ].map((svc) => {
                        const Icon = svc.icon;
                        return (
                          <button
                            key={svc.id}
                            onClick={() => setSubView(svc.id)}
                            className="w-full bg-slate-950 p-4 rounded-xl border border-slate-900 hover:border-emerald-500/30 flex justify-between items-center text-left transition-all outline-none"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`p-2 rounded-lg border border-white/5 ${svc.color}`}>
                                <Icon className="w-5 h-5" />
                              </span>
                              <span className="text-xs font-bold text-white font-sans">{svc.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Floating Back navigation to list */}
                    <div className="px-4 py-2 border-b border-slate-900 bg-slate-950/40 flex justify-between items-center text-xs">
                      <button
                        onClick={() => setSubView("none")}
                        className="text-emerald-400 hover:text-emerald-300 font-bold font-sans"
                      >
                        ← সকল সেবা তালিকায় ফিরুন
                      </button>
                      <span className="text-slate-500 italic text-[10px]">অফিসিয়াল সেবা উইং</span>
                    </div>

                    <div className="pt-3">
                      {subView === "visa" && <VisaInformation />}
                      {subView === "money" && (
                        <MoneyTransfer 
                          walletBalance={walletBalance} 
                          onUpdateBalance={setWalletBalance}
                          transactions={transactions}
                          onAddTransaction={(newTx) => setTransactions([newTx, ...transactions])}
                        />
                      )}
                      {subView === "ticket" && <AirTicket />}
                      {subView === "jobs" && <JobBoard />}
                      {subView === "scam" && <ScamReport />}
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
              <div className="flex flex-col space-y-4 px-4 pb-10">
                <div className="text-center py-2 mt-2">
                  <h2 className="text-lg font-bold text-white font-sans">দূতাবাস ও প্রবাসী সেবা নোটিশ</h2>
                  <p className="text-xs text-slate-400 mt-1">সবচেয়ে গুরুত্বপূর্ণ আইনি সতর্কবার্তা ও লাইভ নোটিশ</p>
                </div>

                <div className="space-y-3.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-5 rounded-2xl border bg-slate-950/80 ${
                        notif.type === "alert" ? "border-red-500/20 bg-red-950/5" :
                        notif.type === "warning" ? "border-amber-500/20 bg-amber-950/5" :
                        notif.type === "success" ? "border-emerald-500/20" :
                        "border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          notif.type === "alert" ? "bg-red-500/15 text-red-400" :
                          notif.type === "warning" ? "bg-amber-500/15 text-amber-400" :
                          notif.type === "success" ? "bg-emerald-500/15 text-emerald-400" :
                          "bg-slate-800 text-slate-300"
                        }`}>
                          {notif.type === "alert" && "জরুরি সতর্কবার্তা"}
                          {notif.type === "warning" && "সতর্কতা পরামর্শ"}
                          {notif.type === "success" && "বিজ্ঞপ্তি আপডেট"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">{notif.date}</span>
                      </div>

                      <h3 className="text-xs font-bold font-sans text-white mb-2 leading-snug">{notif.bengaliTitle}</h3>
                      <p className="text-xs text-slate-350 leading-relaxed font-sans">{notif.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PROFILE & ACCREDS */}
            {currentTab === "profile" && (
              <div className="flex flex-col space-y-5 px-4 pb-10">
                
                {/* Profile Detail header */}
                <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl relative space-y-4 text-center">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gradient-to-tr from-slate-900 to-slate-850 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-md">
                      <User className="w-10 h-10" />
                    </div>
                    {currentTier !== "basic" && (
                      <span className="absolute bottom-0 right-0 bg-emerald-400 text-slate-950 p-1.5 rounded-full border-4 border-slate-950">
                        <Award className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white font-sans">প্রবাসী ভাই অ্যাকাউন্ট</h3>
                    <p className="text-[11px] text-slate-400 font-sans flex items-center justify-center space-x-1 mt-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{userEmail}</span>
                    </p>
                  </div>

                  {/* Wallet Widget */}
                  <div className="p-4 bg-[#0a0f1e] border border-slate-900/60 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span className="font-sans text-slate-400">ব্যালেন্স (Wallet):</span>
                    </div>
                    <span className="font-extrabold text-white text-sm font-sans">${walletBalance.toFixed(2)} USD</span>
                  </div>

                  {/* Profile Badges and plan details */}
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">প্যাকেজ মেম্বারশিপ:</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.75 rounded border border-emerald-500/20 uppercase tracking-widest font-mono">
                      {currentTier} Plan
                    </span>
                  </div>
                </div>

                {/* Sub features / Account helper lists */}
                <div className="bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden font-sans text-xs">
                  
                  <button
                    onClick={() => handleServiceSelect("services", "money")}
                    className="w-full px-4 py-4.5 border-b border-slate-900 hover:bg-slate-900 text-left text-slate-200.5 flex justify-between items-center"
                  >
                    <span>ভাউচার ও ওয়ালেট টপআপ বিবরণ</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleServiceSelect("services", "premium")}
                    className="w-full px-4 py-4.5 border-b border-slate-900 hover:bg-slate-900 text-left text-slate-205 flex justify-between items-center"
                  >
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>প্রিমিয়াম ভিআইপি বেনিফিট গাইড</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      alert("অনারারি সমাজকর্মী সোহেল মিয়া: +৮৫৫ ১২ ২২২ ১২৪\nকনস্যুলার প্রজেক্ট সহকারী: +৮৫৫ ৯৭ ৩৩২ ৯৯১");
                    }}
                    className="w-full px-4 py-4.5 border-b border-slate-900 hover:bg-slate-900 text-left text-slate-205 flex justify-between items-center"
                  >
                    <span>ফনম পেনের হেল্পলাইন ভলান্টিয়ার নম্বর</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      const ans = window.confirm("আপনি কি আসলেই অ্যাকাউন্ট লগআউট করতে চান ভাই?");
                      if (ans) setIsLoggedIn(false);
                    }}
                    className="w-full px-4 py-4.5 hover:bg-slate-900 text-left text-red-400 font-bold flex justify-between items-center"
                  >
                    <span className="flex items-center space-x-1.5">
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট করুন</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-red-500" />
                  </button>

                </div>

                {/* Platform legal footer details */}
                <div className="text-center space-y-1.5 select-none text-[10px] text-slate-500 mt-2 font-mono">
                  <p>Probashi Sheba v2.4.0 (Alpha)</p>
                  <p>© 2026 Probashi Sheba • All Rights Reserved</p>
                </div>

              </div>
            )}
          </>
        )}

      </main>

      {/* Persistent Bottom Nav for quick access */}
      {isLoggedIn && (
        <BottomNav 
          currentTab={currentTab} 
          setTab={handleSetTabAndResetSubView}
          unreadNotifications={unreadNotifications}
          unreadChatCount={0}
        />
      )}

    </div>
  );
}
