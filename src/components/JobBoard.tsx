import React, { useState } from "react";
import { Briefcase, MapPin, DollarSign, CheckCircle2, ShieldAlert, PlusCircle, Server, Eye, Upload } from "lucide-react";
import { Job } from "../types";

interface JobBoardProps {
  jobs?: Job[];
  onUpdateJobs?: (newJobs: Job[]) => void;
}

export default function JobBoard({ jobs: propsJobs, onUpdateJobs }: JobBoardProps) {
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

  const [localJobs, setLocalJobs] = useState<Job[]>([
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

  const jobs = propsJobs !== undefined ? propsJobs : localJobs;
  const setJobs = onUpdateJobs !== undefined ? onUpdateJobs : setLocalJobs;

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
    <div className="flex flex-col space-y-5 px-4 animate-fade-in font-sans" style={{ paddingBottom: "80px" }}>
      {/* Top head */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-medium text-[#1A1A2E] flex items-center justify-center space-x-1">
          <span>যাচাইকৃত চাকরি ও কর্মসংস্থান বোর্ড</span>
        </h2>
        <p className="text-xs text-[#6B7280] mt-1 font-sans">কম্বোডিয়ায় বৈধ যাচাইকৃত বিশ্বস্ত কাজের সন্ধান করুন</p>
      </div>

      {/* Warning banner */}
      <div className="p-4 rounded-[16px] bg-[#FDEDEC] border border-[#FADBD8] text-[12px] leading-relaxed text-[#C0392B] font-sans shadow-sm">
        <span className="font-semibold text-[#E74C3C] text-xs block mb-1">⚠️ কম্বোডিয়া চাকরি স্ক্যাম সতর্কতা:</span>
        অনলাইন ক্যাসিনো, ক্রিপ্টো স্ক্যাম এবং কল সেন্টারের আড়ালে অনেক ভাইদের বন্দি করে ভয়াবহ নির্যাতন করা হচ্ছে ভাই! কোনো চাকরির বিজ্ঞাপন দেয়ার সময় অগ্রিম টাকা বা আসল পাসপোর্ট দালালকে দিবেন না। অবশ্যই লাল সতর্কবার্তা যুক্ত চাকরিগুলো খেয়াল রাখুন।
      </div>

      {/* Toolbar / Actions */}
      <div className="flex justify-between items-center bg-white p-3 rounded-[16px] border border-[#E5E7EB] shadow-sm">
        <span className="text-[11px] text-[#6B7280] font-medium tracking-wider uppercase font-sans">কাজের ক্যাটাগরি ফিল্টার:</span>
        <button
          onClick={() => setIsPosting(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#1B4F72] text-white text-xs font-medium hover:bg-opacity-95 active:scale-95 transition-all outline-none cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="font-sans">চাকরি পোস্ট করুন</span>
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
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all outline-none border cursor-pointer ${
              filter === opt.id
                ? "bg-[#1B4F72] text-white border-[#1B4F72] shadow-sm"
                : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50"
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
            className={`bg-white p-5 rounded-[16px] border flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
              job.isVerified ? "border-[#1D9E75]/35" : "border-[#E74C3C]/35"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                  job.category === "factory" ? "bg-[#EBF5FB] text-[#1B4F72]" :
                  job.category === "restaurant" ? "bg-[#FDF2E9] text-[#D68910]" :
                  job.category === "construction" ? "bg-[#FEF9E7] text-[#B7950B]" :
                  "bg-[#F5EEF8] text-[#8E44AD]"
                }`}>
                  {job.category === "factory" && "কারখানা"}
                  {job.category === "restaurant" && "রেস্তোরাঁ"}
                  {job.category === "construction" && "নির্মাণ"}
                  {job.category === "household" && "গৃহস্থালি"}
                  {job.category === "office" && "অফিস"}
                </span>

                {job.isVerified ? (
                  <span className="flex items-center space-x-1 text-[10px] font-medium text-[#1D9E75] bg-[#E9F7EF] px-2 py-0.5 rounded-lg border border-[#A3E4D7]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>যাচাইকৃত নিয়োগকর্তা</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-[10px] font-medium text-[#E74C3C] bg-[#FDEDEC] px-2 py-0.5 rounded-lg border border-[#F5B7B1]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>অযাচাইকৃত চাকরি সতর্ক</span>
                  </span>
                )}
              </div>

              <h3 className="text-[15px] font-medium text-[#1A1A2E] leading-tight font-sans">{job.title}</h3>
              <p className="text-xs text-[#6B7280] mt-1.5 flex items-center font-sans">
                <MapPin className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
                <span>{job.company} • {job.location}</span>
              </p>
              
              <p className="text-xs text-[#4B5563] font-sans mt-3 leading-relaxed truncate-2-lines">
                {job.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex justify-between items-center">
              <span className="text-xs font-medium text-[#1D9E75] font-sans flex items-center">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{job.salaryRange}</span>
              </span>

              <button
                onClick={() => setSelectedJob(job)}
                className="px-4 py-2 bg-[#1B4F72] text-white text-xs font-medium rounded-xl hover:bg-opacity-90 active:scale-95 transition-all outline-none cursor-pointer"
              >
                আবেদন বিবরণ দেখুন
              </button>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-10 bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm">
            <p className="text-xs text-[#6B7280]">এই ক্যাটাগরিতে কোনো চাকরি পাওয়া যায়নি ভাই।</p>
          </div>
        )}
      </div>

      {/* Job Details Modal overlay page style */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[16px] border border-[#E5E7EB] p-5 space-y-4 shadow-lg animate-fade-in text-[#1A1A2E]">
            <div className="flex justify-between items-start pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-medium text-[#1A1A2E] leading-relaxed">{selectedJob.title}</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-[#6B7280] hover:text-[#1A1A2E] font-medium text-xs font-sans p-1"
              >
                বন্ধ [X]
              </button>
            </div>

            <div className="space-y-2.5 font-sans">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280]">কোম্পানি:</span>
                <span className="font-medium text-[#1A1A2E]">{selectedJob.company}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280]">লোকেশন:</span>
                <span className="text-[#1A1A2E]">{selectedJob.location}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280]">বেতন রেঞ্জ:</span>
                <span className="font-medium text-[#1D9E75]">{selectedJob.salaryRange}</span>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded-xl text-xs space-y-1.5 text-[#4B5563] leading-relaxed font-sans border border-[#E5E7EB]">
                <p className="font-medium text-[#1B4F72] mb-1">কাজের বিবরণ (Job Description):</p>
                <p>{selectedJob.description}</p>
              </div>
            </div>

            {!selectedJob.isVerified && (
              <div className="bg-[#FDEDEC] p-2.5 border border-[#FADBD8] rounded-xl text-[10px] text-[#C0392B] font-sans">
                ⚠️ সতর্কতা: এই নিয়োগকারীর তথ্য এখনও প্রমাণিত হয়নি ভাই। কোনো অবস্থাতেই বা কাজের জন্য দয়া করে টাকা বা ওয়ানটাইম পাসপোর্ট দালালকে জমা দিবেন না।
              </div>
            )}

            <button
              onClick={() => {
                alert(`আবেদন সফল ভাই! আপনার প্রোফাইল ও বায়োডাটা ${selectedJob.company} এর কাছে পাঠানো হয়েছে।`);
                setSelectedJob(null);
              }}
              className="w-full py-3 bg-[#1B4F72] hover:bg-opacity-95 text-white font-sans font-medium text-xs rounded-xl cursor-pointer"
            >
              সরাসরি বায়োডাটা পাঠান (Apply Now)
            </button>
          </div>
        </div>
      )}

      {/* Post a Job Form Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[16px] border border-[#E5E7EB] p-5 space-y-4 shadow-lg text-[#1A1A2E]">
            <div className="flex justify-between items-start pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-medium text-[#1A1A2E]">নতুন চাকরির বিবরণ পোস্ট করুন</h3>
              <button
                onClick={() => setIsPosting(false)}
                className="text-[#6B7280] hover:text-[#1A1A2E] font-medium text-xs font-sans"
              >
                [বন্ধ]
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3 font-sans">
              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">চাকরির শিরোনাম (Title):</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: রেস্টুরেন্ট ওয়েটার"
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-[#E5E7EB] focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কোম্পানির নাম (Company):</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="যেমন: ফনম পেন ক্যাফে"
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-[#E5E7EB] focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">ভেরিফিকেশনের জন্য পাসপোর্ট/লাইসেন্স স্ক্যান (বাধ্যতামূলক):</label>
                <label className="flex items-center space-x-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-2.5 cursor-pointer text-xs text-[#6B7280] hover:bg-gray-50">
                  <Upload className="w-4 h-4 text-[#1B4F72]" />
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
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">বেতন রেঞ্জ (Salary Range):</label>
                <input
                  type="text"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="যেমন: $৩০০ - $৩৫০ / প্রতি মাস"
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-[#E5E7EB] focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কাজের বিবরণ (Description):</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="কাজের সময়, ছুটি ও বাসস্থানের বিবরণ লিখুন ভাই..."
                  rows={3}
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-[#E5E7EB] focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B4F72] text-white font-medium text-xs rounded-xl hover:bg-opacity-95 cursor-pointer"
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
