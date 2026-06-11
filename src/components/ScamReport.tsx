import React, { useState } from "react";
import { ShieldAlert, AlertCircle, EyeOff, UserX, Trash, Upload, CheckSquare, Search } from "lucide-react";
import { ScamReport as ScamReportType } from "../types";

interface ScamReportProps {
  reports?: ScamReportType[];
  onUpdateReports?: (newReports: ScamReportType[]) => void;
}

export default function ScamReport({ reports: propsReports, onUpdateReports }: ScamReportProps) {
  const [scammerName, setScammerName] = useState("");
  const [scammerMeta, setScammerMeta] = useState("");
  const [scamType, setScamType] = useState<ScamReportType["type"]>("visa");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Counter
  const [scamCount, setScamCount] = useState<number>(425);

  const [localReports, setLocalReports] = useState<ScamReportType[]>([
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

  const reports = propsReports !== undefined ? propsReports : localReports;
  const setReports = onUpdateReports !== undefined ? onUpdateReports : setLocalReports;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scammerName || !description) {
      alert("দয়া করে দালালের নাম এবং প্রতারণার বিবরণ সঠিকভাবে লিখুন ভাই।");
      return;
    }

    const newReport: ScamReportType = {
      id: "report-" + (reports.length + 1),
      scammerName,
      scammerMeta,
      type: scamType,
      description,
      date: "আজ, মাত্রই",
      isAnonymous,
      isApproved: true // Admin automatically approves for preview convenience
    };

    setReports([newReport, ...reports]);
    setScamCount((prev) => prev + 1);
    alert("আপনার স্ক্যাম রিপোর্টটি সফলভাবে জমা নেওয়া হয়েছে ভাই! আমাদের টিম দালালের তথ্য যাচাই করে দ্রুত সতর্কবার্তা বোর্ডে প্রকাশ করবে।");
    
    // reset form
    setScammerName("");
    setScammerMeta("");
    setDescription("");
    setProofFile(null);
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 animate-fade-in font-sans">
      {/* Tab Head */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-1.5">
          <ShieldAlert className="w-5.5 h-5.5 text-red-500 animate-pulse" />
          <span>স্ক্যাম ও দালাল রিপোর্ট বোর্ড</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">প্রতারকদের মুখোশ উন্মোচন করে আমাদের প্রবাসী সমাজ সুরক্ষিত রাখুন</p>
      </div>

      {/* Counter Card */}
      <div className="bg-gradient-to-r from-red-950/20 via-slate-950 to-red-950/20 p-4 border border-red-500/20 rounded-2xl flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2">
          <UserX className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-sans font-bold text-slate-100">কমিউনিটি কেয়ার প্রটেক্টেড:</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-extrabold text-red-400 font-mono">এই মাসে {scamCount} জন</span>
          <p className="text-[10px] text-slate-400 mt-0.5">ভাই সুরক্ষিত রয়েছেন</p>
        </div>
      </div>

      {/* Scam Input Form */}
      <form onSubmit={handleSubmit} className="glass-glow-card p-5 rounded-2xl space-y-3.5">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest pb-1 border-b border-slate-900 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>দালাল বা প্রতারক সম্পর্কে রিপোর্ট করুন</span>
        </h3>

        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">প্রতারক বা দালালের নাম (Scammer Name):</label>
          <input
            type="text"
            required
            value={scammerName}
            onChange={(e) => setScammerName(e.target.value)}
            placeholder="যেমন: দালাল মহসিন বা ভুয়া এজেন্সি নাম"
            className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:border-red-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">ফোন নম্বর/ফেসবুক আইডি/গ্রুপ লিঙ্ক (Meta):</label>
          <input
            type="text"
            value={scammerMeta}
            onChange={(e) => setScammerMeta(e.target.value)}
            placeholder="যেমন: মোবাইল +৮৫৫... বা ফেসবুক আইডি লিঙ্ক"
            className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:border-red-500/50 focus:outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">স্ক্যাম ক্যাটাগরি (Scam Type):</label>
            <select
              value={scamType}
              onChange={(e) => setScamType(e.target.value as ScamReportType["type"])}
              className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:outline-none"
            >
              <option value="visa">ভিসা দালাল স্ক্যাম</option>
              <option value="job">ভুয়া চাকরি স্ক্যাম</option>
              <option value="ticket">ভুয়া এয়ার টিকেট</option>
              <option value="money">টাকা ও হুন্ডি চুরি</option>
              <option value="other">অন্যান্য প্রতারণা</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">প্রমাণ স্কিনশট (Screenshot proof):</label>
            <label className="flex items-center space-x-2 bg-slate-950 border border-slate-900 rounded-lg p-2.5 cursor-pointer text-xs text-slate-400 hover:bg-slate-900">
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="truncate max-w-[100px]">{proofFile ? proofFile.name : "ছবি আপলোড"}</span>
              <input
                type="file"
                onChange={(e) => e.target.files && setProofFile(e.target.files[0])}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">প্রতারণার বিস্তারিত বিবরণ (Describe Incident):</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="কীভাবে আপনার অর্থ বা ভিসা নষ্ট করা হলো তা বাংলায় পরিষ্কারভাবে লিখুন ভাই..."
            rows={3.5}
            className="w-full bg-slate-950 text-white rounded-lg p-2.5 text-xs border border-slate-900 focus:border-red-500/50 focus:outline-none leading-relaxed font-sans"
          ></textarea>
        </div>

        <div className="flex items-center space-x-2.5 py-1 text-slate-300">
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="flex items-center space-x-1.5 focus:outline-none"
          >
            {isAnonymous ? (
              <span className="w-4 h-4 rounded bg-emerald-500 border border-emerald-400 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                ✓
              </span>
            ) : (
              <span className="w-4 h-4 rounded bg-slate-950 border border-slate-800"></span>
            )}
            <span className="text-[11px] font-sans font-medium flex items-center space-x-1">
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>আমার পরিচয় গোপন রাখুন (Anonymous Report)</span>
            </span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(239,68,68,0.35)] transition-all"
        >
          রিপোর্ট জমা দিন (Submit Scam Report)
        </button>
      </form>

      {/* Community Reports Alerts board feed */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          অনুমোদিত সতর্কবার্তা ওয়াল (Scammer Watch Board)
        </h4>

        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-slate-950 p-4 rounded-xl border border-red-500/10 space-y-2.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">
                  {rep.type === "visa" && "ভিসা দালাল"}
                  {rep.type === "job" && "ভুয়া চাকরি"}
                  {rep.type === "ticket" && "ভুয়া টিকেট"}
                  {rep.type === "money" && "টাকা চুরি"}
                  {rep.type === "other" && "প্রতারক চক্র"}
                </span>

                <span className="text-slate-500 flex items-center space-x-1">
                  <span>অভিযোগকারী:</span>
                  <span className="font-bold text-slate-300">{rep.isAnonymous ? "গোপন ভাই" : "প্রবাসী ভাই"}</span>
                </span>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-white flex items-center space-x-1">
                  <span>অভিযুক্ত:</span>
                  <span className="text-red-400">{rep.scammerName}</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{rep.scammerMeta}</p>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-2 border-t border-slate-900/60">
                {rep.description}
              </p>

              <div className="flex justify-between items-center text-[9px] text-slate-500">
                <span>যাচাইকরণ অবস্থা: লাইভ সতর্কতা</span>
                <span>{rep.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
