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
    <div className="flex flex-col space-y-5 px-4 animate-fade-in font-sans bg-[#F0F4F8] text-[#1A1A2E] min-h-screen pt-3" style={{ paddingBottom: "80px" }}>
      {/* Tab Head */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col items-center text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 flex items-center justify-center bg-[#FDEDEC] text-[#E74C3C] rounded-[14px] shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-[18px] font-medium text-[#1A1A2E]">
            স্ক্যাম ও দালাল রিপোর্ট বোর্ড
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-1">প্রতারকদের মুখোশ উন্মোচন করে আমাদের প্রবাসী সমাজ সুরক্ষিত রাখুন</p>
        </div>
      </div>

      {/* Counter Card */}
      <div className="bg-[#EBF5FB] p-4 border border-[#BDD8F0] rounded-[14px] flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2">
          <UserX className="w-5 h-5 text-[#1B4F72] shrink-0" />
          <span className="font-sans font-medium text-[#1B4F72]">কমিউনিটি কেয়ার প্রটেক্টেড:</span>
        </div>
        <div className="text-right text-[#1B4F72]">
          <span className="text-sm font-extrabold font-mono">এই মাসে {scamCount} জন</span>
          <p className="text-[10px] opacity-85 mt-0.5">ভাই সুরক্ষিত রয়েছেন</p>
        </div>
      </div>

      {/* Scam Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 border border-[#E5E7EB] rounded-2xl space-y-3.5 shadow-sm">
        <h3 className="text-[15px] font-medium text-[#E74C3C] pb-1 border-b border-[#E5E7EB] flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 text-[#E74C3C]" />
          <span>দালাল বা প্রতারক সম্পর্কে রিপোর্ট করুন</span>
        </h3>

        <div>
          <label className="block text-[11px] text-[#6B7280] font-medium mb-1">প্রতারক বা দালালের নাম (Scammer Name):</label>
          <input
            type="text"
            required
            value={scammerName}
            onChange={(e) => setScammerName(e.target.value)}
            placeholder="যেমন: দালাল মহসিন বা ভুয়া এজেন্সি নাম"
            className="w-full bg-[#F9FAFB] text-[#1A1A2E] placeholder-[#9CA3AF] rounded-lg p-2.5 text-xs border border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#6B7280] font-medium mb-1">ফোন নম্বর/ফেসবুক আইডি/গ্রুপ লিঙ্ক (Meta):</label>
          <input
            type="text"
            value={scammerMeta}
            onChange={(e) => setScammerMeta(e.target.value)}
            placeholder="যেমন: মোবাইল +৮৫৫... বা ফেসবুক আইডি লিঙ্ক"
            className="w-full bg-[#F9FAFB] text-[#1A1A2E] placeholder-[#9CA3AF] rounded-lg p-2.5 text-xs border border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] text-[#6B7280] font-medium mb-1">স্ক্যাম ক্যাটাগরি (Scam Type):</label>
            <select
              value={scamType}
              onChange={(e) => setScamType(e.target.value as ScamReportType["type"])}
              className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-lg p-2.5 text-xs border border-[#E5E7EB] focus:outline-none"
            >
              <option value="visa">ভিসা দালাল স্ক্যাম</option>
              <option value="job">ভুয়া চাকরি স্ক্যাম</option>
              <option value="ticket">ভুয়া এয়ার টিকেট</option>
              <option value="money">টাকা ও হুন্ডি চুরি</option>
              <option value="other">অন্যান্য প্রতারণা</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#6B7280] font-medium mb-1">প্রমাণ স্কিনশট (Screenshot proof):</label>
            <label className="flex items-center space-x-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2.5 cursor-pointer text-xs text-[#6B7280] hover:bg-gray-100/80">
              <Upload className="w-4 h-4 text-[#6B7280]" />
              <span className="truncate max-w-[100px] text-[#1A1A2E]">{proofFile ? proofFile.name : "ছবি আপলোড"}</span>
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
          <label className="block text-[11px] text-[#6B7280] font-medium mb-1">প্রতারণার বিস্তারিত বিবরণ (Describe Incident):</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="কীভাবে আপনার অর্থ বা ভিসা নষ্ট করা হলো তা বাংলায় পরিষ্কারভাবে লিখুন ভাই..."
            rows={3.5}
            className="w-full bg-[#F9FAFB] text-[#1A1A2E] placeholder-[#9CA3AF] rounded-lg p-2.5 text-xs border border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none leading-relaxed font-sans"
          ></textarea>
        </div>

        <div className="flex items-center space-x-2.5 py-1 text-[#1A1A2E]">
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="flex items-center space-x-1.5 focus:outline-none"
          >
            {isAnonymous ? (
              <span className="w-4 h-4 rounded bg-[#1D9E75] border border-[#1D9E75] flex items-center justify-center text-white font-bold text-[10px]">
                ✓
              </span>
            ) : (
              <span className="w-4 h-4 rounded bg-[#F9FAFB] border border-[#E5E7EB]"></span>
            )}
            <span className="text-[11px] font-sans font-medium flex items-center space-x-1 text-[#6B7280]">
              <EyeOff className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>আমার পরিচয় গোপন রাখুন (Anonymous Report)</span>
            </span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#E74C3C] hover:bg-[#C0392B] text-white font-medium text-xs rounded-[12px] transition-all"
        >
          রিপোর্ট জমা দিন (Submit Scam Report)
        </button>
      </form>

      {/* Community Reports Alerts board feed */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] font-sans">
          অনুমোদিত সতর্কবার্তা ওয়াল (Scammer Watch Board)
        </h4>

        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#FDEDEC] text-[#E74C3C] font-semibold">
                  {rep.type === "visa" && "ভিসা দালাল"}
                  {rep.type === "job" && "ভুয়া চাকরি"}
                  {rep.type === "ticket" && "ভুয়া টিকেট"}
                  {rep.type === "money" && "টাকা চুরি"}
                  {rep.type === "other" && "প্রতারক চক্র"}
                </span>

                <span className="text-[#6B7280] flex items-center space-x-1">
                  <span>অভিযোগকারী:</span>
                  <span className="font-semibold text-[#1A1A2E]">{rep.isAnonymous ? "গোপন ভাই" : "প্রবাসী ভাই"}</span>
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#1A1A2E] flex items-center space-x-1">
                  <span>অভিযুক্ত:</span>
                  <span className="text-[#E74C3C]">{rep.scammerName}</span>
                </h4>
                <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">{rep.scammerMeta}</p>
              </div>

              <p className="text-[11px] text-[#1A1A2E] font-sans leading-relaxed pt-2 border-t border-[#E5E7EB]">
                {rep.description}
              </p>

              <div className="flex justify-between items-center text-[9px] text-[#6B7280]">
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
