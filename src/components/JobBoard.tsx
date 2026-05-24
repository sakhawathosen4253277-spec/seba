import React, { useState } from "react";
import { Briefcase, MapPin, DollarSign, CheckCircle2, ShieldAlert, PlusCircle, Server, Eye, Upload } from "lucide-react";
import { Job } from "../types";

export default function JobBoard() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Job post modal
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newCategory, setNewCategory] = useState<Job["category"]>("factory");
  const [newDesc, setNewDesc] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);

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

  const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.category === filter);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !passportFile) {
      alert("দয়া করে চাকরির সমস্ত তথ্য এবং আপনার পাসপোর্ট স্ক্যান আপলোড করুন ভাই।");
      return;
    }

    const postedJob: Job = {
      id: "job-" + (jobs.length + 1),
      title: newTitle,
      company: newCompany,
      location: newLocation || "Phnom Penh",
      salaryRange: newSalary || "$২৮০ - $৩৫০ / প্রতি মাস",
      category: newCategory,
      isVerified: false, // unverified until reviewed
      description: newDesc
    };

    setJobs([postedJob, ...jobs]);
    alert("চাকরি পোস্ট করার জন্য ধন্যবাদ! আপনার আপলোড করা পাসপোর্ট এবং ব্যবসার লাইসেন্স ইমিগ্রেশন পার্টনার দিয়ে যাচাই করে ২৪ ঘণ্টার মধ্যে এটি লাইভ বা ভেরিফাইড করা হবে ভাই।");
    
    // reset form
    setNewTitle("");
    setNewCompany("");
    setNewLocation("");
    setNewSalary("");
    setNewDesc("");
    setPassportFile(null);
    setIsPosting(false);
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-4 animate-fade-in font-sans">
      {/* Top head */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-1">
          <span>যাচাইকৃত চাকরি ও কর্মসংস্থান বোর্ড</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">কম্বোডিয়ায় বৈধ যাচাইকৃত বিশ্বস্ত কাজের সন্ধান করুন</p>
      </div>

      {/* Warning banner */}
      <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-[11px] leading-relaxed text-red-200">
        <span className="font-extrabold text-white text-xs block mb-1">⚠️ কম্বোডিয়া চাকরি স্ক্যাম সতর্কতা:</span>
        অনলাইন ক্যাসিনো, ক্রিপ্টো স্ক্যাম এবং কল সেন্টারের আড়ালে অনেক ভাইদের বন্দি করে ভয়াবহ নির্যাতন করা হচ্ছে ভাই! কোনো চাকরির বিজ্ঞাপন দেয়ার সময় অগ্রিম টাকা বা আসল পাসপোর্ট দালালকে দিবেন না। অবশ্যই লাল সতর্কবার্তা যুক্ত চাকরিগুলো খেয়াল রাখুন।
      </div>

      {/* Toolbar / Actions */}
      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900">
        <span className="text-[10px] text-slate-400 font-bold uppercase">কাজের ক্যাটাগরি ফিল্টার:</span>
        <button
          onClick={() => setIsPosting(true)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>চাকরি পোস্ট করুন</span>
        </button>
      </div>

      {/* Filter Options horizontal board */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "সব চাকরি" },
          { id: "factory", label: "কারখানা (Factory)" },
          { id: "restaurant", label: "রেস্তোরাঁ (Restaurant)" },
          { id: "household", label: "গৃহস্থালি (Home)" },
          { id: "construction", label: "নির্মাণ (Construction)" },
          { id: "office", label: "অফিস (Office)" }
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all outline-none border ${
              filter === opt.id
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_rgba(0,255,136,0.25)]"
                : "bg-slate-900 text-slate-400 border-slate-800/80 hover:border-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Job Card List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className={`glass-glow-card p-5 rounded-2xl border flex flex-col justify-between ${
              job.isVerified ? "border-emerald-500/25" : "border-red-500/25"
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                  job.category === "factory" ? "bg-cyan-500/15 text-cyan-400" :
                  job.category === "restaurant" ? "bg-amber-500/15 text-amber-400" :
                  job.category === "construction" ? "bg-orange-500/15 text-orange-400" :
                  "bg-purple-500/15 text-purple-400"
                }`}>
                  {job.category === "factory" && "কারখানা"}
                  {job.category === "restaurant" && "রেস্তোরাঁ"}
                  {job.category === "construction" && "নির্মাণ"}
                  {job.category === "household" && "গৃহস্থালি"}
                  {job.category === "office" && "অফিস"}
                </span>

                {job.isVerified ? (
                  <span className="flex items-center space-x-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>যাচাইকৃত নিয়োগকর্তা</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>অযাচাইকৃত চাকরি সতর্ক</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm font-extrabold text-white leading-tight font-sans">{job.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>{job.company} • {job.location}</span>
              </p>
              
              <p className="text-xs text-slate-300 font-sans mt-3.5 leading-relaxed truncate-2-lines">
                {job.description}
              </p>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-900 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{job.salaryRange}</span>
              </span>

              <button
                onClick={() => setSelectedJob(job)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition-all outline-none"
              >
                আবেদন বিবরণ দেখুন
              </button>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-500">এই ক্যাটাগরিতে কোনো চাকরি পাওয়া যায়নি ভাই।</p>
          </div>
        )}
      </div>

      {/* Job Details Modal overlay page style */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 w-full max-w-sm rounded-2xl border border-emerald-500/30 p-5 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-extrabold text-white leading-relaxed">{selectedJob.title}</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                বন্ধ করুন [X]
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">কোম্পানি:</span>
                <span className="font-bold text-white">{selectedJob.company}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">লোকেশন:</span>
                <span className="font-serif text-white">{selectedJob.location}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">বেতন রেঞ্জ:</span>
                <span className="font-bold text-emerald-400">{selectedJob.salaryRange}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1.5 text-slate-300 leading-relaxed font-sans">
                <p className="font-bold text-emerald-400 mb-1">কাজের বিবরণ (Job Description):</p>
                <p>{selectedJob.description}</p>
              </div>
            </div>

            {!selectedJob.isVerified && (
              <div className="bg-red-950/20 p-2.5 border border-red-500/20 rounded-xl text-[10px] text-red-300 font-sans">
                ⚠️ সতর্কতা: এই নিয়োগকারীর তথ্য এখনও প্রমাণিত হয়নি ভাই। কোনো অবস্থাতেই বা কাজের জন্য দয়া করে টাকা বা ওয়ানটাইম পাসপোর্ট দালালকে জমা দিবেন না।
              </div>
            )}

            <button
              onClick={() => {
                alert(`আবেদন সফল ভাই! আপনার প্রোফাইল ও বায়োডাটা ${selectedJob.company} এর কাছে পাঠানো হয়েছে।`);
                setSelectedJob(null);
              }}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-xl"
            >
              সরাসরি বায়োডাটা পাঠান (Apply Now)
            </button>
          </div>
        </div>
      )}

      {/* Post a Job Form Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 w-full max-w-sm rounded-2xl border border-emerald-500/30 p-5 space-y-4">
            <div className="flex justify-between items-start pb-2.5 border-b border-slate-900">
              <h3 className="text-sm font-extrabold text-white">নতুন চাকরির বিবরণ পোস্ট করুন</h3>
              <button
                onClick={() => setIsPosting(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                [বন্ধ করুন]
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">চাকরির শিরোনাম (Title):</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: রেস্টুরেন্ট ওয়েটার"
                  className="w-full bg-slate-900 text-white rounded-lg p-2.5 text-xs border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">কোম্পানির নাম (Company):</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="যেমন: ফনম পেন ক্যাফে"
                  className="w-full bg-slate-900 text-white rounded-lg p-2.5 text-xs border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">ভেরিফিকেশনের জন্য পাসপোর্ট/লাইসেন্স স্ক্যান (বাধ্যতামূলক):</label>
                <label className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5 cursor-pointer text-xs text-slate-450 hover:bg-slate-850">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{passportFile ? passportFile.name : "ফাইল নির্বাচন করুন (PDF/JPG)"}</span>
                  <input
                    type="file"
                    required
                    onChange={(e) => e.target.files && setPassportFile(e.target.files[0])}
                    className="hidden"
                    accept="image/*,.pdf"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">বেতন রেঞ্জ (Salary Range):</label>
                <input
                  type="text"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="যেমন: $৩০০ - $৩৫০ / প্রতি মাস"
                  className="w-full bg-slate-900 text-white rounded-lg p-2.5 text-xs border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">কাজের বিবরণ (Description):</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="কাজের সময়, ছুটি ও বাসস্থানের বিবরণ লিখুন ভাই..."
                  rows={3}
                  className="w-full bg-slate-900 text-white rounded-lg p-2.5 text-xs border border-slate-800"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                যাচাইকরণের জন্য জমা দিন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
