import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  ShieldAlert, 
  Briefcase, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  Trash2, 
  ArrowLeft, 
  Search, 
  UserCheck, 
  Clock, 
  Send,
  AlertCircle
} from "lucide-react";
import { Job, ScamReport } from "../types";

export interface SupportTicket {
  id: string;
  name: string;
  phoneOrImo: string;
  subject: string;
  description: string;
  status: "pending" | "resolved" | "investigating";
  date: string;
  replies?: string[];
}

interface AdminDashboardProps {
  onBack: () => void;
  // Scam reports state
  reports: ScamReport[];
  onUpdateReports: (newReports: ScamReport[]) => void;
  // Jobs state
  jobs: Job[];
  onUpdateJobs: (newJobs: Job[]) => void;
  // Support tickets state
  tickets: SupportTicket[];
  onUpdateTickets: (newTickets: SupportTicket[]) => void;
  // Exchange rate control
  exchangeRate: number;
  onUpdateExchangeRate: (newRate: number) => void;
  exchangeRateUnderTen: number;
  onUpdateExchangeRateUnderTen: (newRate: number) => void;
  exchangeRateLimit: number;
  onUpdateExchangeRateLimit: (newLimit: number) => void;
}

export default function AdminDashboard({
  onBack,
  reports,
  onUpdateReports,
  jobs,
  onUpdateJobs,
  tickets,
  onUpdateTickets,
  exchangeRate,
  onUpdateExchangeRate,
  exchangeRateUnderTen,
  onUpdateExchangeRateUnderTen,
  exchangeRateLimit,
  onUpdateExchangeRateLimit
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"reports" | "jobs" | "tickets">("reports");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interactive selected items for details/reply actions
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  
  // Job posting inputs for Admin-side quick job creation
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobCategory, setJobCategory] = useState<Job["category"]>("factory");
  const [jobDescription, setJobDescription] = useState("");

  // Report creation inputs for Admin-side quick report creation
  const [showAddReport, setShowAddReport] = useState(false);
  const [scammerName, setScammerName] = useState("");
  const [scammerMeta, setScammerMeta] = useState("");
  const [scamType, setScamType] = useState<ScamReport["type"]>("visa");
  const [scamDescription, setScamDescription] = useState("");

  // Exchange rate controller local state
  const [rateInput, setRateInput] = useState<string>(exchangeRate.toString());
  const [rateUnderTenInput, setRateUnderTenInput] = useState<string>(exchangeRateUnderTen.toString());
  const [limitInput, setLimitInput] = useState<string>(exchangeRateLimit.toString());

  // 1. Report Actions
  const handleToggleReportApproval = (id: string) => {
    const updated = reports.map(r => r.id === id ? { ...r, isApproved: !r.isApproved } : r);
    onUpdateReports(updated);
    alert("রিপোর্ট স্ট্যাটাস পরিবর্তন সফল হয়েছে ভাই।");
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm("আপনি কি আসলেই এই রিপোর্টটি ডিলিট করতে চান ভাই?")) {
      const updated = reports.filter(r => r.id !== id);
      onUpdateReports(updated);
      alert("রিপোর্টটি সফলভাবে ডিলিট করা হয়েছে।");
    }
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scammerName || !scamDescription) {
      alert("দয়া করে অভিযুক্তের নাম এবং ঘটনার বিবরণ দিন ভাই।");
      return;
    }
    const newRep: ScamReport = {
      id: "report-" + Date.now(),
      scammerName,
      scammerMeta: scammerMeta || "N/A",
      type: scamType,
      description: scamDescription,
      date: "আজ, মাত্রই (অ্যাডমিন)",
      isAnonymous: false,
      isApproved: true
    };
    onUpdateReports([newRep, ...reports]);
    alert("নতুন চমৎকার সতর্কতা রিপোর্ট সফলভাবে যুক্ত করা হয়েছে।");
    setScammerName("");
    setScammerMeta("");
    setScamDescription("");
    setShowAddReport(false);
  };

  // 2. Job Actions
  const handleToggleJobVerification = (id: string) => {
    const updated = jobs.map(j => j.id === id ? { ...j, isVerified: !j.isVerified } : j);
    onUpdateJobs(updated);
    alert("চাকরি ভেরিফিকেশন স্ট্যাটাস আপডেট সফল হয়েছে ভাই।");
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm("আপনি কি আসলেই এই চাকরি বুকিং বোর্ড থেকে ডিলিট করতে চান ভাই?")) {
      const updated = jobs.filter(j => j.id !== id);
      onUpdateJobs(updated);
      alert("চাকরি পোস্টটি সফলভাবে সরিয়ে ফেলা হয়েছে।");
    }
  };

  const handleAddJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobCompany || !jobDescription) {
      alert("দয়া করে চাকরির শিরোনাম, কোম্পানির নাম এবং বিবরণ প্রদান করুন ভাই।");
      return;
    }
    const newJob: Job = {
      id: "job-" + Date.now(),
      title: jobTitle,
      company: jobCompany,
      location: jobLocation || "Phnom Penh",
      salaryRange: jobSalary || "$৩০০ - $৪০০ / প্রতি মাস",
      category: jobCategory,
      isVerified: true, // admin posted jobs are auto-verified
      description: jobDescription
    };
    onUpdateJobs([newJob, ...jobs]);
    alert("নতুন ভেরিফাইড চাকরি সফলভাবে বোর্ডে যোগ করা হয়েছে।");
    setJobTitle("");
    setJobCompany("");
    setJobLocation("");
    setJobSalary("");
    setJobDescription("");
    setShowAddJob(false);
  };

  // 3. Ticket Actions
  const handleToggleTicketStatus = (id: string, newStatus: SupportTicket["status"]) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: newStatus } : t);
    onUpdateTickets(updated);
    if (selectedTicket?.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
    alert(`टिकिटের স্ট্যাটাস সফলভাবে '${newStatus === "resolved" ? "সমাধান" : "তদন্তাধীন"}' করা হয়েছে ভাই।`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const currentReplies = t.replies || [];
        return {
          ...t,
          status: "resolved" as const,
          replies: [...currentReplies, replyText.trim()]
        };
      }
      return t;
    });

    onUpdateTickets(updated);
    
    // Update active modal state
    setSelectedTicket(prev => {
      if (!prev) return null;
      const currentReplies = prev.replies || [];
      return {
        ...prev,
        status: "resolved",
        replies: [...currentReplies, replyText.trim()]
      };
    });

    setReplyText("");
    alert("আপনার সাপোর্ট বার্তাটি সফলভাবে সংযুক্ত করা হয়েছে ভাই।");
  };

  const handleQuickReply = (msg: string) => {
    setReplyText(msg);
  };

  // Filtering based on tab & search query
  const filteredReports = reports.filter(r => 
    r.scammerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] text-[#1A1A2E] font-sans animate-fade-in">
      
      {/* Top Admin Navigation Header */}
      <div className="bg-[#1B4F72] text-white px-4 py-4.5 flex items-center justify-between shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>প্রোফাইলে ফিরুন</span>
        </button>
        <span className="text-sm font-medium font-sans">প্যানেল কন্ট্রোল ও মনিটরিং</span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-slate-950 px-2.5 py-0.75 rounded-full">
          Super Admin
        </span>
      </div>

      {/* Main Admin Content Body */}
      <div className="flex-1 p-4 space-y-4">
        
        {/* Welcome Board */}
        <div className="bg-white rounded-2xl border-[0.5px] border-[#E5E7EB] p-5">
          <h2 className="text-base font-medium text-[#1A1A2E] mb-1">প্রবাসী সেবা প্রশাসন বোর্ড (Admin Panel)</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            এই পোর্টাল দিয়ে আপনি কম্বোডিয়ায় বসবাসরত বাংলাদেশী প্রবাসীদের পাঠানো স্ক্যাম রিপোর্ট, চাকরি ভেরিফিকেশন এবং সাপোর্ট ইনবক্স টিকিটসমূহ সরাসরি রিয়েল-টাইমে নিয়ন্ত্রণ করতে পারবেন ভাই।
          </p>
        </div>

        {/* Exchange Rate Controller Card */}
        <div className="bg-white rounded-2xl border-[0.5px] border-[#E5E7EB] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#1B4F72]/10 flex items-center justify-center text-[#1B4F72]">
                <Send className="w-4 h-4 rotate-45 text-[#1B4F72]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#1A1A2E]">টাকা পাঠানোর রেট নিয়ন্ত্রণ (Exchange Rate Panel)</h3>
                <p className="text-[11px] text-[#6B7280]">ইউএসডি (USD) সমপরিমাণ বাংলাদেশি টাকা (BDT) এক্সচেঞ্জ রেট</p>
              </div>
            </div>
          </div>

          {/* Rate 1: Standard Rate */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1B4F72]">১. সাধারণ রেট ({exchangeRateLimit.toFixed(2)} ডলার বা তার বেশি):</span>
              <span className="text-[11px] font-semibold text-[#1D9E75] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg font-mono text-right">
                Active: {exchangeRate.toFixed(2)} ৳
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 shrink-0">1 USD =</span>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  max="200"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-28 bg-white p-2 text-xs font-semibold border border-slate-300 text-[#1A1A2E] text-center focus:outline-none focus:border-[#1B4F72]"
                />
                <span className="text-xs text-[#1A1A2E] font-medium">BDT</span>
              </div>

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[-1.0, -0.1, +0.1, +1.0].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      const currentVal = parseFloat(rateInput) || exchangeRate;
                      const newVal = parseFloat((currentVal + step).toFixed(2));
                      setRateInput(newVal.toString());
                    }}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg transition-all"
                  >
                    {step > 0 ? `+${step.toFixed(1)}` : step.toFixed(1)}
                  </button>
                ))}
              </div>

              {/* Apply button */}
              <button
                type="button"
                onClick={() => {
                  const parsed = parseFloat(rateInput);
                  if (isNaN(parsed) || parsed <= 0) {
                    alert("দয়া করে একটি সঠিক রেট নম্বর দিন ভাই।");
                    return;
                  }
                  const payload = {
                    usdRate: parsed,
                    bkash: parsed,
                    nagad: parsed,
                    bank: parsed,
                    updatedAt: new Date().toISOString()
                  };
                  setDoc(doc(db, "exchangeRates", "current"), payload, { merge: true })
                    .catch((err) => {
                      console.warn("Client-side save failed, sending to api server:", err);
                      fetch("/api/admin/exchangeRate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                      }).catch((e) => console.error("Server fallback also failed:", e));
                    });
                  onUpdateExchangeRate(parsed);
                  alert(`সাফল্যের সাথে সাধারণ এক্সচেঞ্জ রেট পরিবর্তন করে ১ USD = ${parsed.toFixed(2)} BDT করা হয়েছে ও লাইভে কার্যকর!`);
                }}
                className="w-full sm:w-auto ml-auto px-4 py-2 bg-[#1B4F72] text-white text-xs font-semibold rounded-xl hover:bg-[#1B4F72]/90 transition-all shadow-sm"
              >
                সাধারণ রেট আপডেট
              </button>
            </div>
          </div>

          {/* Rate 2: Under 10 USD Special Rate */}
          <div className="space-y-2 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900">২. বিশেষ রেট (১ থেকে {(exchangeRateLimit - 0.01).toFixed(2)} ডলার মোবাইল ব্যাংকিং):</span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg font-mono text-right">
                Active: {exchangeRateUnderTen.toFixed(2)} ৳
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 shrink-0">1 USD =</span>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  max="200"
                  value={rateUnderTenInput}
                  onChange={(e) => setRateUnderTenInput(e.target.value)}
                  className="w-28 bg-white p-2 rounded-lg text-xs font-semibold border border-slate-300 text-[#1A1A2E] text-center focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-[#1A1A2E] font-medium">BDT</span>
              </div>

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[-1.0, -0.1, +0.1, +1.0].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      const currentVal = parseFloat(rateUnderTenInput) || exchangeRateUnderTen;
                      const newVal = parseFloat((currentVal + step).toFixed(2));
                      setRateUnderTenInput(newVal.toString());
                    }}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg transition-all"
                  >
                    {step > 0 ? `+${step.toFixed(1)}` : step.toFixed(1)}
                  </button>
                ))}
              </div>

              {/* Apply button */}
              <button
                type="button"
                onClick={() => {
                  const parsed = parseFloat(rateUnderTenInput);
                  if (isNaN(parsed) || parsed <= 0) {
                    alert("দয়া করে একটি সঠিক রেট নম্বর দিন ভাই।");
                    return;
                  }
                  const payload = {
                    exchangeRateUnderTen: parsed,
                    updatedAt: new Date().toISOString()
                  };
                  setDoc(doc(db, "exchangeRates", "current"), payload, { merge: true })
                    .catch((err) => {
                      console.warn("Client-side save failed, sending to api server:", err);
                      fetch("/api/admin/exchangeRate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                      }).catch((e) => console.error("Server fallback also failed:", e));
                    });
                  onUpdateExchangeRateUnderTen(parsed);
                  alert(`সাফল্যের সাথে কম ব্যালেন্সের বিশেষ রেট পরিবর্তন করে ১ USD = ${parsed.toFixed(2)} BDT করা হয়েছে ও লাইভে কার্যকর!`);
                }}
                className="w-full sm:w-auto ml-auto px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
              >
                বিশেষ রেট আপডেট
              </button>
            </div>
          </div>

          {/* Rate 3: Special Rate Limit configuration */}
          <div className="space-y-2 p-3 bg-amber-50/40 rounded-xl border border-amber-100/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-950">৩. বিশেষ রেট লিমিট পরিবর্তন করুন (১ থেকে আপনার ইচ্ছামত ডলার):</span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg font-mono text-right">
                Active Limit: {exchangeRateLimit.toFixed(2)} $
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 shrink-0">Limit =</span>
                <input
                  type="number"
                  step="0.01"
                  min="2"
                  max="1000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-28 bg-white p-2 rounded-lg text-xs font-semibold border border-slate-300 text-[#1A1A2E] text-center focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-[#1A1A2E] font-medium">USD</span>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[10.0, 50.0, 100.0, 200.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setLimitInput(val.toFixed(2));
                    }}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg transition-all"
                  >
                    Set {val}$
                  </button>
                ))}
              </div>

              {/* Apply button */}
              <button
                type="button"
                onClick={() => {
                  const parsed = parseFloat(limitInput);
                  if (isNaN(parsed) || parsed <= 1) {
                    alert("দয়া করে ১ এর চেয়ে বড় একটি ডলার লিমিট ভাই সংখ্যা দিন।");
                    return;
                  }
                  const payload = {
                    exchangeRateLimit: parsed,
                    updatedAt: new Date().toISOString()
                  };
                  setDoc(doc(db, "exchangeRates", "current"), payload, { merge: true })
                    .catch((err) => {
                      console.warn("Client-side save failed, sending to api server:", err);
                      fetch("/api/admin/exchangeRate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                      }).catch((e) => console.error("Server fallback also failed:", e));
                    });
                  onUpdateExchangeRateLimit(parsed);
                  alert(`সাফল্যের সাথে বিশেষ রেটের সর্বোচ্চ সীমা পরিবর্তন করে ${parsed.toFixed(2)} USD করা হয়েছে ভাই যা এখন কার্যকর!`);
                }}
                className="w-full sm:w-auto ml-auto px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-all shadow-sm"
              >
                সীমা আপডেট করুন
              </button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard Counter Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border-[0.5px] border-[#E5E7EB] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[11px] font-medium">ইউজার স্ক্যাম</span>
              <ShieldAlert className="w-4 h-4 text-[#E74C3C]" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-lg font-medium font-mono text-[#1A1A2E]">{reports.length}</span>
              <span className="text-[10px] text-red-500 font-medium">টি রিপোর্ট</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-[0.5px] border-[#E5E7EB] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[11px] font-medium">সক্রিয় চাকরি</span>
              <Briefcase className="w-4 h-4 text-[#1B4F72]" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-lg font-medium font-mono text-[#1A1A2E]">{jobs.length}</span>
              <span className="text-[10px] text-emerald-600 font-medium font-mono">
                {jobs.filter(j => j.isVerified).length} ভেরিফাইড
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-[0.5px] border-[#E5E7EB] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[11px] font-medium">সাপোর্ট টিকিট</span>
              <MessageSquare className="w-4 h-4 text-[#1D9E75]" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-lg font-medium font-mono text-[#1A1A2E]">{tickets.length}</span>
              <span className="text-[10px] text-amber-600 font-medium">
                {tickets.filter(t => t.status === "pending").length} পেন্ডিং
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Search Filter Toolbar */}
        <div className="bg-white p-2 border-[0.5px] border-[#E5E7EB] rounded-2xl flex items-center space-x-2">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা বিবরণ দিয়ে খুঁজুন..."
            className="flex-1 bg-transparent text-xs text-[#1A1A2E] focus:outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="text-[#E74C3C] text-xs px-2 font-medium"
            >
              মুছুন
            </button>
          )}
        </div>

        {/* Custom Tab Selectors - Styled beautifully */}
        <div className="bg-[#E5E7EB]/50 p-1 rounded-xl flex space-x-1 border border-slate-200">
          {[
            { id: "reports", label: "স্ক্যাম রিপোর্ট ও দালাল", icon: ShieldAlert },
            { id: "jobs", label: "চাকরির বিজ্ঞাপন", icon: Briefcase },
            { id: "tickets", label: "ব্যবহারকারী সাহায্য টিকিট", icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-all outline-none ${
                  activeTab === tab.id
                    ? "bg-[#1B4F72] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: REPORTS CONTROLLER AREA */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-[#6B7280] font-medium font-sans">
                মোট {filteredReports.length} টি স্ক্যাম নোটিশ পাওয়া গিয়েছে ভাই
              </span>
              <button
                onClick={() => setShowAddReport(!showAddReport)}
                className="flex items-center space-x-1 text-xs text-[#1B4F72] hover:text-[#1D9E75] font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>রিপোর্ট যোগ করুন</span>
              </button>
            </div>

            {/* Quick Report Add Form in Admin */}
            {showAddReport && (
              <form onSubmit={handleAddReport} className="bg-white p-4.5 rounded-2xl border-[0.5px] border-[#E5E7EB] space-y-3 animate-slide-up">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-[#1B4F72]">নতুন স্ক্যাম সতর্কতা যোগ করুন</span>
                  <button 
                    type="button" 
                    onClick={() => setShowAddReport(false)} 
                    className="text-xs text-[#E74C3C] font-semibold"
                  >
                    বন্ধ
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] mb-1">প্রতারকের নাম (বা কোম্পানির নাম):</label>
                  <input
                    type="text"
                    required
                    value={scammerName}
                    onChange={(e) => setScammerName(e.target.value)}
                    placeholder="যেমন: দালাল মহসিন রেজা (Mohsin)"
                    className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#6B7280] mb-1">ক্যাটাগরি:</label>
                    <select
                      value={scamType}
                      onChange={(e) => setScamType(e.target.value as any)}
                      className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                    >
                      <option value="visa">ভিসা সংক্রান্ত</option>
                      <option value="job">কাজের প্রলোভন</option>
                      <option value="ticket">ভুয়া টিকেট</option>
                      <option value="money">টাকা ও হুন্ডি</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B7280] mb-1">যোগাযোগ/ফেসবুক তথ্য:</label>
                    <input
                      type="text"
                      value={scammerMeta}
                      onChange={(e) => setScammerMeta(e.target.value)}
                      placeholder="ফেসবুক আইডি বা মোবাইল"
                      className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] mb-1">প্রতারণার সঠিক বিবরণ:</label>
                  <textarea
                    required
                    value={scamDescription}
                    onChange={(e) => setScamDescription(e.target.value)}
                    placeholder="ঘটনার বিবরণ বাংলায় সুন্দর করে লিখুন ভাই যা লাইভ বোর্ডে যাবে..."
                    rows={2.5}
                    className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E] leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1B4F72] text-white text-xs font-semibold rounded-xl"
                >
                  প্রশাসন তালিকাভুক্ত করুন
                </button>
              </form>
            )}

            {/* List Table of Reports */}
            <div className="space-y-3.5">
              {filteredReports.map((item) => (
                <div key={item.id} className="bg-white p-4.5 rounded-2xl border-[0.5px] border-[#E5E7EB] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                        {item.type === "visa" && "ভিসা প্রতারক"}
                        {item.type === "job" && "ভুয়া চাকরি"}
                        {item.type === "ticket" && "ভুয়া টিকেট"}
                        {item.type === "money" && "টাকা ও হুন্ডি"}
                        {item.type === "other" && "প্রতারক দালাল"}
                      </span>
                      <h4 className="text-xs font-medium text-[#1A1A2E] mt-2">
                        অভিযুক্ত: <span className="font-semibold text-red-600">{item.scammerName}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{item.scammerMeta}</p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        item.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {item.isApproved ? "লাইভ সতর্কবার্তা" : "অনিশ্চিত/অপেক্ষারত"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{item.date}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#1A1A2E] font-sans leading-relaxed pt-2.5 border-t border-slate-100">
                    {item.description}
                  </p>

                  <div className="flex justify-end space-x-2 pt-2.5 border-t border-dashed border-slate-100">
                    <button
                      onClick={() => handleToggleReportApproval(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1 transition-all ${
                        item.isApproved 
                          ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100/60" 
                          : "border-emerald-200 text-[#1D9E75] bg-emerald-50 hover:bg-emerald-100/60"
                      }`}
                    >
                      <span>{item.isApproved ? "আউট করুন" : "অনুমোদন দিন"}</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReport(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 bg-red-50 hover:bg-red-100/50 flex items-center space-x-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border-[0.5px] border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">কোনো স্ক্যাম রিপোর্ট পাওয়া যায়নি ভাই।</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: JOBS CONTROLLER AREA */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-[#6B7280] font-medium font-sans">
                মোট {filteredJobs.length} টি কাজের সন্ধান আছে নিয়ন্ত্রণ করতে
              </span>
              <button
                onClick={() => setShowAddJob(!showAddJob)}
                className="flex items-center space-x-1 text-xs text-[#1B4F72] hover:text-[#1D9E75] font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>নতুন চাকরি দিন</span>
              </button>
            </div>

            {/* Quick Job Add Form */}
            {showAddJob && (
              <form onSubmit={handleAddJobSubmit} className="bg-white p-4.5 rounded-2xl border-[0.5px] border-[#E5E7EB] space-y-3 animate-slide-up">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-[#1B4F72]">নতুন চাকরি বোর্ডে প্রকাশ করুন</span>
                  <button 
                    type="button" 
                    onClick={() => setShowAddJob(false)} 
                    className="text-xs text-[#E74C3C] font-semibold"
                  >
                    বন্ধ
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] mb-1">চাকরির নাম (Title):</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="যেমন: কনস্ট্রাকশন শ্রমিক"
                    className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#6B7280] mb-1">কোম্পানির নাম:</label>
                    <input
                      type="text"
                      required
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      placeholder="যেমন: Phnom Penh Café"
                      className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B7280] mb-1">কাজের ধরন (Category):</label>
                    <select
                      value={jobCategory}
                      onChange={(e) => setJobCategory(e.target.value as any)}
                      className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                    >
                      <option value="factory">কারখানা (Factory)</option>
                      <option value="restaurant">রেস্তোরাঁ (Restaurant)</option>
                      <option value="household">গৃহস্থালি (Household)</option>
                      <option value="construction">নির্মাণ (Construction)</option>
                      <option value="office">অফিস (Office)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#6B7280] mb-1">লোকেশন (Location):</label>
                    <input
                      type="text"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="যেমন: BKK1, Phnom Penh"
                      className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B7280] mb-1">বেতন সীমা (Salary):</label>
                    <input
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="যেমন: $৩০০ - $৪০০ / মাস"
                      className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] mb-1">কাজের বিবরণ (Description):</label>
                  <textarea
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="বোর্ড ফ্রেন্ডলি কাজের যোগ্যতা ও সুযোগ-সুবিধা বাংলায় লিখুন ভাই..."
                    rows={2.5}
                    className="w-full bg-[#F7F8FA] p-2 rounded-lg text-xs border border-slate-200 text-[#1A1A2E]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1B4F72] text-white text-xs font-semibold rounded-xl"
                >
                  উইন্ডো ভেরিফাইড প্রকাশ করুন
                </button>
              </form>
            )}

            {/* List Table of Jobs */}
            <div className="space-y-3.5">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white p-4.5 rounded-2xl border-[0.5px] border-[#E5E7EB] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A2E] leading-tight">{job.title}</h4>
                      <p className="text-xs text-[#6B7280] mt-1">{job.company} • {job.location}</p>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono hover:text-[#1A1A2E] transition-all">ID: {job.id}</span>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      {job.isVerified ? (
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-[#1D9E75] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ভেরিফাইড</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-[#E74C3C] bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>অযাচাইকৃত</span>
                        </span>
                      )}
                      <span className="text-xs font-mono text-emerald-600 font-bold mt-2">{job.salaryRange}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6B7280] bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal font-sans">
                    {job.description}
                  </p>

                  <div className="flex justify-end space-x-2 pt-2.5 border-t border-dashed border-slate-100">
                    <button
                      onClick={() => handleToggleJobVerification(job.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1 transition-all ${
                        job.isVerified 
                          ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100" 
                          : "border-emerald-200 text-[#1D9E75] bg-emerald-50 hover:bg-emerald-100"
                      }`}
                    >
                      <span>{job.isVerified ? "ডি-ভেরিফাই করুন" : "ভেরিফাই করুন"}</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 bg-red-50 hover:bg-red-105 flex items-center space-x-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border-[0.5px] border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">কোনো চাকরির সন্ধান পাওয়া যায়নি ভাই।</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TICKETS/MESSAGES CONTROLLER AREA */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            <span className="text-xs text-[#6B7280] font-medium px-1 block">
              মোট {filteredTickets.length} জন সাহায্যপ্রার্থী প্রবাসীর টিকিট রয়েছে ভাই
            </span>

            {/* List Of Support Tickets */}
            <div className="space-y-3.5">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white p-4.5 rounded-2xl border-[0.5px] border-[#E5E7EB] space-y-3 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#1A1A2E] bg-slate-100 shrink-0 px-2 py-0.5 rounded inline-block">
                        {ticket.subject}
                      </h4>
                      <h3 className="text-xs font-medium text-[#1A1A2E] mt-2 flex items-center space-x-1">
                        <span>প্রবাসী ভাই:</span>
                        <span className="font-semibold text-[#1B4F72]">{ticket.name}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">মোবাইল/ইমো: {ticket.phoneOrImo}</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ticket.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        ticket.status === "resolved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        "bg-slate-50 text-slate-600 border border-slate-100"
                      }`}>
                        {ticket.status === "pending" && "পেন্ডিং (উত্তর দেওয়া হয়নি)"}
                        {ticket.status === "resolved" && "সমাধান সম্পন্ন ভাই"}
                        {ticket.status === "investigating" && "আইনি তদন্তাধীন"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">{ticket.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#1A1A2E] bg-[#F7F8FA] p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                    {ticket.description}
                  </p>

                  {/* Show Existing Replies */}
                  {ticket.replies && ticket.replies.length > 0 && (
                    <div className="space-y-1.5 pt-2.5 border-t border-dashed border-slate-100">
                      <p className="text-[10px] font-semibold text-[#1D9E75] uppercase tracking-wider">অ্যাডমিন উত্তর বার্তা (Replied):</p>
                      {ticket.replies.map((rep, idx) => (
                        <div key={idx} className="bg-emerald-50/50 p-2 text-xs rounded-lg border border-emerald-150 text-[#1A1A2E] font-sans leading-relaxed">
                          {rep}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-2.5 border-t border-dashed border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setReplyText("");
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4F72] text-white hover:bg-[#1B4F72]/90 flex items-center space-x-1 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>বার্তা দিয়ে সমাধান করুন</span>
                    </button>

                    {ticket.status !== "resolved" && (
                      <button
                        onClick={() => handleToggleTicketStatus(ticket.id, "resolved")}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all"
                      >
                        সমাধান চিহ্নিত করুন
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border-[0.5px] border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">কোনো একটিভ সাহায্য টিকিট বা সাপোর্ট রিকোয়েস্ট নেই।</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Ticket Reply Modal Overlay */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-[#0a0f1e]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border-[0.5px] border-[#E5E7EB] p-5 space-y-4 text-left">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280]">টিকিট নাম: {selectedTicket.subject}</h3>
                <h4 className="text-sm font-bold text-[#1A1A2E] mt-1">প্রার্থী: {selectedTicket.name}</h4>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-[#1A1A2E] font-extrabold text-xs"
              >
                বন্ধ [X]
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="bg-[#F7F8FA] p-3 rounded-xl text-xs space-y-1 text-[#1A1A2E] leading-relaxed border border-slate-150">
                <p className="font-semibold text-[#1B4F72] mb-1">প্রবাসীর বার্তাটি:</p>
                <p>{selectedTicket.description}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1.5">যোগাযোগ: {selectedTicket.phoneOrImo}</p>
              </div>

              {/* Quick Preset Replies */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#6B7280]">সহজ সিলেকশন কুইক সাপোর্ট ( presets ):</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "চিন্তা করবেন না ভাই, আমি দ্রুত সমাধান করছি!",
                    "আপনার পাসপোর্ট নাম্বার এবং ইমো নম্বরটি দিন ভাই।",
                    "এটি একটি পরিচিত স্ক্যাম চক্র। দয়া করে টাকা দেবেন না।"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickReply(preset)}
                      className="text-[10px] text-left bg-[#1B4F72]/10 text-[#1B4F72] hover:bg-[#1B4F72]/20 px-2 py-1 rounded text-[#1a1c3a] font-sans active:bg-[#1B4F72]/30"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Response input */}
              <form onSubmit={handleSendReply} className="space-y-2.5 pt-1">
                <textarea
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="বাংলায় প্রবাসীর সমস্যার উত্তর বা পরামর্শ লিখুন ভাই..."
                  rows={2.5}
                  className="w-full bg-[#F7F8FA] text-[#1A1A2E] rounded-lg p-2.5 text-xs border border-slate-300 focus:outline-none"
                ></textarea>

                <div className="flex space-x-2.5">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#1B4F72] text-white font-medium text-xs rounded-xl flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>উত্তর পাঠান ও সমাধান করুন</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleTicketStatus(selectedTicket.id, "resolved");
                      setSelectedTicket(null);
                    }}
                    className="px-4 py-2.5 bg-[#1D9E75] text-white font-medium text-xs rounded-xl"
                  >
                    টিকিট সমাধান
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
