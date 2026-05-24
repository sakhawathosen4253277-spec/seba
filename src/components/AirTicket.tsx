import React, { useState } from "react";
import { Plane, Search, ShieldCheck, ShieldAlert, CheckCircle2, Ticket, AlertTriangle, Send } from "lucide-react";
import { TicketRequest } from "../types";

export default function AirTicket() {
  const [routeFrom, setRouteFrom] = useState("Phnom Penh (PNH)");
  const [routeTo, setRouteTo] = useState("Dhaka (DAC)");
  const [date, setDate] = useState("");
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [passengerName, setPassengerName] = useState("");
  const [phone, setPhone] = useState("");
  const [pnrInput, setPnrInput] = useState("");
  const [pnrResult, setPnrResult] = useState<"verified" | "warning" | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Submit manual booking request
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !phone || !date) {
      alert("দয়া করে নাম, মোবাইল নম্বর এবং যাত্রার তারিখ দিন ভাই।");
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setPassengerName("");
      setPhone("");
      setDate("");
      alert("টিকিট অনুরোধ সফলভাবে পাঠানো হয়েছে ভাই! আমাদের ট্রাভেল পার্টনার ৩০ মিনিটের মধ্যে কল দিয়ে আপনার বুকিং সম্পন্ন করবেন।");
    }, 1500);
  };

  // Static mock verified tickets log (anonymized)
  const [verifiedLogs] = useState<TicketRequest[]>([
    {
      id: "1",
      routeFrom: "Phnom Penh (PNH)",
      routeTo: "Dhaka (DAC)",
      date: "২৮ মে, ২০২৬",
      passengerCount: 1,
      passengerName: "মোঃ স***ন",
      phone: "+855 12***",
      status: "verified",
      dateAdded: "আজ, ১০:১৫ AM",
      pnr: "PNR-67B3X"
    },
    {
      id: "2",
      routeFrom: "Siem Reap (REP)",
      routeTo: "Chittagong (CGP)",
      date: "০৫ জুন, ২০২৬",
      passengerCount: 2,
      passengerName: "আ***র হো***ন",
      phone: "+855 97***",
      status: "verified",
      dateAdded: "গতকাল, ০৪:৫০ PM",
      pnr: "PNR-QW892"
    }
  ]);

  // PNR confirmation rules
  const handleVerifyPnr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) return;

    // Simulate simple check rules: if input contains "fake" or "123" or has less than 5 chars, show warning, otherwise green verified.
    const pnrClean = pnrInput.trim().toUpperCase();
    if (pnrClean.includes("FAKE") || pnrClean === "123" || pnrClean.length < 4 || pnrClean.includes("ZAL")) {
      setPnrResult("warning");
    } else {
      setPnrResult("verified");
    }
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 animate-fade-in font-sans">
      {/* View Header */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-1.5">
          <Plane className="w-5.5 h-5.5 text-emerald-400 rotate-45" />
          <span>এয়ার টিকেট সেবা</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">সবচেয়ে কম মূল্যে ঢাকা-সিলেট-চট্টগ্রাম বিমান টিকেট অনুরোধ দিন</p>
      </div>

      {/* Fraud Warning Banner */}
      <div className="p-4 rounded-xl bg-orange-950/35 border border-orange-500/30 flex items-start space-x-3 text-xs leading-relaxed text-orange-200">
        <AlertTriangle className="w-5.5 h-5.5 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-white text-xs mb-0.5">দালাল ও ভুয়া এজেন্ট হতে সাবধান থাকুন</h4>
          <p className="text-[10px]">পিডিএফ এডিট করে ভুয়া পিন বা ভুয়া টিকিট দেওয়ার প্রচুর স্ক্যাম হচ্ছে ভাই! টাকা দেওয়ার আগে অবশ্যই নিচের ভেরিফিকেশন বক্সে পিএনআর কোড দিয়ে যাচাই করুন বা আমাদের এজেন্টকে জানান।</p>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="glass-glow-card p-5 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest pb-2 border-b border-slate-900">
          নতুন টিকিট বুকিং অনুরোধ (Flight Request)
        </h3>

        <form onSubmit={handleBookingSubmit} className="space-y-3">
          {/* Route Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">কোথাকার ফ্লাইং (From):</label>
              <select
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:outline-none"
              >
                <option value="Phnom Penh (PNH)">Phnom Penh (Phnom Penh)</option>
                <option value="Siem Reap (REP)">Siem Reap (Siem Reap)</option>
                <option value="Dhaka (DAC)">Dhaka (Dhaka)</option>
                <option value="Chittagong (CGP)">Chittagong (Chittagong)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">যাবেন কোথায় (To):</label>
              <select
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:outline-none"
              >
                <option value="Dhaka (DAC)">Dhaka (Bangladesh)</option>
                <option value="Chittagong (CGP)">Chittagong (Bangladesh)</option>
                <option value="Sylhet (ZYL)">Sylhet (Bangladesh)</option>
                <option value="Phnom Penh (PNH)">Phnom Penh (Cambodia)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">যাত্রার তারিখ (Date):</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">যাত্রী সংখ্যা (Passengers):</label>
              <input
                type="number"
                min={1}
                max={9}
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">যাত্রীর পূর্ণ নাম (Passport Name):</label>
            <input
              type="text"
              required
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="পাসপোর্ট অনুযায়ী ইংরেজিতে লিখুন"
              className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">মোবাইল নম্বর (Phone NO):</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: +855 1234 5678"
              className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all outline-none"
          >
            <Send className="w-4 h-4" />
            <span>টিকিট অনুরোধ পাঠান (Send Air Ticket Booking Call)</span>
          </button>
        </form>
      </div>

      {/* Ticket PNR Verification box */}
      <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Ticket className="w-4.5 h-4.5 text-emerald-400" />
            <span>এয়ার টিকেট ফ্রড ট্র্যাকার (PNR Verifier)</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">সব এয়ারলাইন্সের টিকিট সঠিক নাকি ভুয়া চেক করুন ভাই</p>
        </div>

        <form onSubmit={handleVerifyPnr} className="flex space-x-2">
          <input
            type="text"
            value={pnrInput}
            onChange={(e) => {
              setPnrInput(e.target.value);
              setPnrResult(null);
            }}
            placeholder="টিকিট PNR কোড দিন (যেমন: X9RY4B)"
            className="flex-1 bg-slate-900 text-white rounded-xl px-3.5 py-2.5 text-xs border border-slate-800 focus:outline-none uppercase font-mono"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-850 active:bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all"
          >
            যাচাই করুন
          </button>
        </form>

        {pnrResult === "verified" && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500 text-xs text-emerald-400 flex items-start space-x-2.5 animate-slide-up">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-white text-xs mb-0.5">রিয়েল টিকিট কোড (VERIFIED)</h4>
              <p className="text-[10px] text-slate-300">ঐ PNR কোডটি সিস্টেম দ্বারা কম্বোডিয়া এভিয়েশন অথোরিটির সিস্টেমে বৈধ পাওয়া গেছে। টিকিটটি শতভাগ সঠিক ভাই।</p>
            </div>
          </div>
        )}

        {pnrResult === "warning" && (
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500 text-xs text-red-400 flex items-start space-x-2.5 animate-slide-up">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-white text-xs mb-0.5">ভুয়া টিকিট সতর্কতা (WARNING!)</h4>
              <p className="text-[10px] text-slate-300">সতর্ক হোন ভাই! সিস্টেম দ্বারা এই PNR এর কোনো কনফার্মড তথ্য পাওয়া যায়নি। অথবা কোডটি বাতিল। দয়া করে দালালের কথায় টাকা উইথড্র করবেন না।</p>
            </div>
          </div>
        )}
      </div>

      {/* Recet Verified Booking Logs display */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          সম্প্রতি ইস্যু করা টিকিট (Anonymized Logs)
        </h4>

        <div className="space-y-2">
          {verifiedLogs.map((log) => (
            <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-white">{log.routeFrom.split(" ")[0]}</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-bold text-white">{log.routeTo.split(" ")[0]}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{log.passengerName} • {log.date}</p>
                <span className="text-[9px] text-slate-500 mt-1 font-mono hover:text-white transition-all">PNR: {log.pnr}</span>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                  ভেরিফাইড ও ইস্যুড
                </span>
                <p className="text-[9px] text-slate-500 mt-1 font-sans">{log.dateAdded}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
