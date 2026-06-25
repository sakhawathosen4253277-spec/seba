import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  ShieldAlert, 
  PlusCircle, 
  Upload, 
  X, 
  Loader2, 
  Building, 
  User, 
  Phone, 
  Info, 
  Check, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Job, Employer, JobApplication } from "../types";
import { db } from "../lib/firebase";
import { collection, getDocs, setDoc, doc, getDoc, updateDoc, query, where, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";
import EmployerRegister from "./EmployerRegister";

interface JobBoardProps {
  jobs?: Job[];
  onUpdateJobs?: (newJobs: Job[]) => void;
}

export default function JobBoard({ jobs: propsJobs, onUpdateJobs }: JobBoardProps) {
  const { currentUser, userDoc } = useAuth();
  const userId = currentUser?.uid || "unknown";

  const [filter, setFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Navigation & sub-views
  const [showRegister, setShowRegister] = useState(false);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Employer verification status
  const [employerProfile, setEmployerProfile] = useState<Employer | null>(null);
  const [loadingEmployer, setLoadingEmployer] = useState(true);

  // Job post modal
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newCategory, setNewCategory] = useState<Job["category"]>("factory");
  const [newDesc, setNewDesc] = useState("");
  const [newRequirements, setNewRequirements] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newJobType, setNewJobType] = useState<'full-time' | 'part-time' | 'contract'>('full-time');
  const [postingLoading, setPostingLoading] = useState(false);

  // Application form states inside modal
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [whyApply, setWhyApply] = useState("");
  const [applyingLoading, setApplyingLoading] = useState(false);

  // One-time cleanup code that runs once for clearing existing demo jobs
  useEffect(() => {
    const cleanDemoJobs = async () => {
      try {
        const jobsRef = collection(db, 'jobs');
        const snap = await getDocs(jobsRef);
        const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        localStorage.setItem('jobsCleaned', 'true');
      } catch (err) {
        console.error("Error clearing demo jobs from Firestore:", err);
      }
    };

    if (!localStorage.getItem('jobsCleaned')) {
      cleanDemoJobs();
    }
  }, []);

  // Load Employer Status
  const checkEmployerStatus = async () => {
    if (!currentUser) {
      setLoadingEmployer(false);
      return;
    }
    try {
      const docRef = doc(db, "employers", `employer-${userId}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setEmployerProfile(snap.data() as Employer);
      } else {
        setEmployerProfile(null);
      }
    } catch (err) {
      console.error("Error loading employer status:", err);
    } finally {
      setLoadingEmployer(false);
    }
  };

  // Load Jobs from Firestore
  useEffect(() => {
    checkEmployerStatus();

    setLoadingJobs(true);
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched: Job[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.isActive !== false) { // Only show active jobs
          fetched.push({
            id: d.id,
            title: data.title || "",
            company: data.companyName || data.company || "",
            location: data.location || "",
            salaryRange: data.salary || data.salaryRange || "",
            category: data.category || "factory",
            isVerified: data.isVerified !== undefined ? data.isVerified : false,
            description: data.description || "",
            requirements: data.requirements || "",
            whatsapp: data.whatsapp || "",
            jobType: data.jobType || "full-time",
            employerId: data.employerId || "",
            employerName: data.employerName || "",
            isVerifiedEmployer: data.isVerifiedEmployer || false,
            applicantsCount: data.applicantsCount || 0,
            createdAt: data.createdAt || ""
          });
        }
      });

      setDbJobs(fetched);
      if (onUpdateJobs) onUpdateJobs(fetched);
      setLoadingJobs(false);
    }, (err) => {
      console.error("Error listening to jobs:", err);
      setDbJobs([]);
      if (onUpdateJobs) onUpdateJobs([]);
      setLoadingJobs(false);
    });

    return () => unsub();
  }, [currentUser]);

  const jobs = dbJobs.length > 0 ? dbJobs : (propsJobs || []);
  const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.category === filter);

  // Post a Job Handler (Verified Employers Only)
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newDesc.trim()) {
      alert("দয়া করে চাকরির শিরোনাম, কোম্পানির নাম এবং কাজের বিবরণ পূরণ করুন ভাই।");
      return;
    }

    setPostingLoading(true);
    const jobId = `JOB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const newJobPayload = {
        employerId: `employer-${userId}`,
        employerName: employerProfile?.fullName || userDoc?.name || "Verified Employer",
        companyName: newCompany.trim(),
        isVerifiedEmployer: employerProfile?.verificationStatus === "verified",
        title: newTitle.trim(),
        category: newCategory,
        location: newLocation.trim() || "Phnom Penh",
        salary: newSalary.trim() || "$৩০০ - $৪০০ / প্রতি মাস",
        jobType: newJobType,
        description: newDesc.trim(),
        requirements: newRequirements.trim() || "অভিজ্ঞতা আবশ্যক নয় ভাই",
        whatsapp: newWhatsapp.trim() || employerProfile?.phone || "",
        isActive: true,
        isVerified: false, // Wait for admin to approve/verify the job post itself, or auto-verify if employer is verified
        applicantsCount: 0,
        createdAt: new Date().toISOString()
      };

      // If employer is verified, we can auto-verify their job posts!
      if (employerProfile?.verificationStatus === "verified") {
        newJobPayload.isVerified = true;
      }

      await setDoc(doc(db, "jobs", jobId), newJobPayload);

      // Increment totalJobsPosted inside employers collection
      const employerRef = doc(db, "employers", `employer-${userId}`);
      const currentPostedCount = employerProfile?.totalJobsPosted || 0;
      await updateDoc(employerRef, {
        totalJobsPosted: currentPostedCount + 1
      });

      // Send Telegram alert
      try {
        const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
        const CHAT_ID = "8885859813";
        const msg = `💼 <b>নতুন চাকরি পোস্ট করা হয়েছে</b>\n\n📌 শিরোনাম: ${newTitle.trim()}\n🏢 কোম্পানি: ${newCompany.trim()}\n💰 বেতন: ${newSalary.trim() || "$৩০০ - $৪০০"}\n📍 লোকেশন: ${newLocation.trim() || "Phnom Penh"}\n👉 Admin Panel এ অনুমোদন করুন`;
        
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: "HTML"
          })
        });
      } catch (tgErr) {
        console.warn("Telegram job alert failed:", tgErr);
      }

      alert("চাকরি পোস্টটি সফলভাবে জমা দেওয়া হয়েছে ভাই! যাচাই সম্পন্ন হলে চাকরি বোর্ডে দৃশ্যমান হবে।");
      
      // Reset form
      setNewTitle("");
      setNewCompany("");
      setNewLocation("");
      setNewSalary("");
      setNewDesc("");
      setNewRequirements("");
      setNewWhatsapp("");
      setIsPosting(false);
      checkEmployerStatus(); // Refresh local employer profile counts
    } catch (err) {
      console.error("Error posting job to firestore:", err);
      alert("দুঃখিত ভাই, চাকরি পোস্ট করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন!");
    } finally {
      setPostingLoading(false);
    }
  };

  // Job Application submission
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!applicantName.trim() || !applicantPhone.trim() || !currentLocation.trim()) {
      alert("দয়া করে আপনার নাম, যোগাযোগের ফোন নম্বর এবং বর্তমান ঠিকানা প্রদান করুন ভাই!");
      return;
    }

    setApplyingLoading(true);
    const appId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const applicationPayload = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyName: selectedJob.company,
        employerId: selectedJob.employerId || "admin",
        applicantUserId: userId,
        applicantName: applicantName.trim(),
        applicantPhone: applicantPhone.trim(),
        currentLocation: currentLocation.trim(),
        whyApply: whyApply.trim() || "N/A",
        status: "pending",
        workerFeedback: "",
        workerConfirmed: false,
        employerBonusGiven: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "jobApplications", appId), applicationPayload);

      // Increment applicantsCount on the job document if it is in firestore
      if (!selectedJob.id.startsWith("job-")) { // dynamic job
        const jobRef = doc(db, "jobs", selectedJob.id);
        const currentCount = selectedJob.applicantsCount || 0;
        await updateDoc(jobRef, {
          applicantsCount: currentCount + 1
        });
      }

      // Send Telegram alert
      try {
        const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
        const CHAT_ID = "8885859813";
        const msg = `📥 <b>চাকরির নতুন আবেদন</b>\n\n💼 চাকরি: ${selectedJob.title}\n🏢 কোম্পানি: ${selectedJob.company}\n👤 আবেদনকারী: ${applicantName.trim()}\n📞 ফোন: ${applicantPhone.trim()}\n📍 ঠিকানা: ${currentLocation.trim()}`;
        
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: "HTML"
          })
        });
      } catch (tgErr) {
        console.warn("Telegram application alert failed:", tgErr);
      }

      alert("আলহামদুলিল্লাহ ভাই! আপনার আবেদনটি সফলভাবে সাবমিট করা হয়েছে। নিয়োগকারী আপনার সাথে খুব দ্রুত যোগাযোগ করবে।");
      
      // Reset apply form states
      setApplicantName("");
      setApplicantPhone("");
      setCurrentLocation("");
      setWhyApply("");
      setShowApplyForm(false);
      setSelectedJob(null);
    } catch (err) {
      console.error("Error submitting job application:", err);
      alert("দুঃখিত ভাই, আবেদন প্রক্রিয়াকরণে কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন!");
    } finally {
      setApplyingLoading(false);
    }
  };

  // If Register Mode is active, render EmployerRegister
  if (showRegister) {
    return (
      <EmployerRegister 
        onBack={() => setShowRegister(false)} 
        onSuccess={() => {
          setShowRegister(false);
          checkEmployerStatus();
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col space-y-5 px-4 animate-fade-in font-sans" style={{ paddingBottom: "100px" }}>
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
        অনлайн ক্যাসিনো, ক্রিপ্টো স্ক্যাম এবং কল সেন্টারের আড়ালে অনেক ভাইদের বন্দি করে ভয়াবহ নির্যাতন করা হচ্ছে ভাই! কোনো চাকরির বিজ্ঞাপন দেয়ার সময় অগ্রিম টাকা বা আসল পাসপোর্ট দালালকে দিবেন না। অবশ্যই লাল সতর্কবার্তা যুক্ত চাকরিগুলো খেয়াল রাখুন।
      </div>

      {/* Employer Status / Verification Board */}
      {loadingEmployer ? (
        <div className="bg-white border rounded-[16px] p-4 text-center">
          <Loader2 className="w-5 h-5 text-[#1B4F72] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white p-4.5 rounded-[16px] border border-gray-200 space-y-3 shadow-xs">
          {!employerProfile ? (
            // User is not registered as an employer
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#1B4F72] flex items-center gap-1">
                  <Building className="w-4 h-4 text-[#1B4F72]" />
                  <span>নিয়োগকর্তা জোন (Employer Hub)</span>
                </span>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  আপনি কি কোনো প্রজেক্ট, রেস্টুরেন্ট বা কারখানার জন্য কর্মী খুঁজছেন? জামানত দিয়ে আজই আপনার নিয়োগকারী প্রোফাইল ভেরিফাই করুন।
                </p>
              </div>
              <button
                onClick={() => setShowRegister(true)}
                className="w-full sm:w-auto shrink-0 bg-white border border-[#1B4F72] text-[#1B4F72] text-[11px] font-semibold px-3 py-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>নিয়োগকর্তা হিসেবে রেজিস্টার করুন</span>
              </button>
            </div>
          ) : employerProfile.verificationStatus === "pending" ? (
            // Registration is pending
            <div className="flex items-start gap-2.5 text-left bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-800">নিয়োগকর্তা যাচাইকরণ চলমান</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed font-sans">
                  হোয়াটস অ্যাপ বা ফোন যাচাইয়ের মাধ্যমে আপনার নিবন্ধন ম্যানুয়ালি রিভিউ করা হচ্ছে ভাই। ২৪ ঘণ্টার মধ্যে অনুমোদন করা হবে।
                </p>
              </div>
            </div>
          ) : employerProfile.verificationStatus === "verified" ? (
            // Fully verified employer
            <div className="flex items-start justify-between gap-3 text-left bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/50">
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-emerald-800">{employerProfile.companyName}</h4>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-[#1D9E75] rounded-full font-bold">ভেরিফাইড নিয়োগকারী</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-sans">
                    কর্মী নিয়োগ নিশ্চিত হলে $20 ফেরত ও $10 অতিরিক্ত বোনাস পাবেন ভাই।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPosting(true)}
                className="shrink-0 bg-[#1B4F72] text-white text-[11px] font-semibold px-3.5 py-2 rounded-xl hover:bg-[#143d59] transition-all cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>চাকরি পোস্ট</span>
              </button>
            </div>
          ) : (
            // Blocked or Rejected
            <div className="flex items-start gap-2.5 text-left bg-red-50 p-3 rounded-xl border border-red-200">
              <ShieldAlert className="w-5 h-5 text-[#E74C3C] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-red-800">নিবন্ধনে সমস্যা বা ব্লক</h4>
                <p className="text-[11px] text-red-700 leading-relaxed font-sans">
                  দুঃখিত ভাই, আপনার নিয়োগকর্তা প্রোফাইলটি বাতিল বা স্থগিত করা হয়েছে। যোগাযোগের জন্য সাহায্য টিকিটের মাধ্যমে আপিল করুন।
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toolbar / Actions */}
      <div className="flex justify-between items-center bg-white p-3 rounded-[16px] border border-[#E5E7EB] shadow-sm text-left">
        <span className="text-[11px] text-[#6B7280] font-medium tracking-wider uppercase font-sans">কাজের ক্যাটাগরি ফিল্টার:</span>
        <span className="text-[11px] text-slate-500 font-sans font-medium bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
          মোট {filteredJobs.length} টি চাকরি লাইভ
        </span>
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
      {loadingJobs ? (
        <div className="py-10 text-center">
          <Loader2 className="w-8 h-8 text-[#1B4F72] animate-spin mx-auto" />
          <p className="text-xs text-gray-400 mt-2">চাকরির তালিকা লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white p-5 rounded-[16px] border flex flex-col justify-between text-left transition-all ${
                job.isVerified ? "border-[#1D9E75]/35 shadow-[0_2px_10px_rgba(29,158,117,0.04)]" : "border-[#E74C3C]/35 shadow-[0_2px_10px_rgba(231,76,60,0.04)]"
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${
                    job.category === "factory" ? "bg-[#EBF5FB] text-[#1B4F72]" :
                    job.category === "restaurant" ? "bg-[#FDF2E9] text-[#D68910]" :
                    job.category === "construction" ? "bg-[#FEF9E7] text-[#B7950B]" :
                    "bg-[#F5EEF8] text-[#8E44AD]"
                  }`}>
                    {job.category === "factory" && "কারখানা (Factory)"}
                    {job.category === "restaurant" && "রেস্তোরাঁ (Restaurant)"}
                    {job.category === "construction" && "নির্মাণ (Construction)"}
                    {job.category === "household" && "গৃহস্থালি (Home)"}
                    {job.category === "office" && "অফিস (Office)"}
                  </span>

                  {job.isVerified ? (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-[#1D9E75] bg-[#E9F7EF] px-2.5 py-0.5 rounded-lg border border-[#A3E4D7]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>যাচাইকৃত নিয়োগকর্তা</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-[#E74C3C] bg-[#FDEDEC] px-2.5 py-0.5 rounded-lg border border-[#F5B7B1] animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>অযাচাইকৃত চাকরি সতর্ক</span>
                    </span>
                  )}
                </div>

                <h3 className="text-[15px] font-medium text-[#1A1A2E] leading-tight font-sans">{job.title}</h3>
                
                <div className="flex flex-col space-y-1 mt-2">
                  <p className="text-xs text-[#6B7280] flex items-center font-sans">
                    <Building className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>{job.company}</span>
                  </p>
                  <p className="text-xs text-[#6B7280] flex items-center font-sans">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>{job.location}</span>
                  </p>
                </div>
                
                <p className="text-xs text-[#4B5563] font-sans mt-3 leading-relaxed line-clamp-2">
                  {job.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex justify-between items-center">
                <span className="text-xs font-semibold text-[#1D9E75] font-sans flex items-center">
                  <DollarSign className="w-3.5 h-3.5 shrink-0" />
                  <span>{job.salaryRange}</span>
                </span>

                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setShowApplyForm(false); // reset form show state
                  }}
                  className="px-4 py-2 bg-[#1B4F72] text-white text-xs font-semibold rounded-xl hover:bg-opacity-90 active:scale-95 transition-all outline-none cursor-pointer"
                >
                  আবেদন বিবরণ দেখুন
                </button>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm flex flex-col items-center justify-center space-y-2">
              <Briefcase className="w-12 h-12 text-[#9CA3AF]" />
              <p className="text-[14px] text-[#6B7280] font-sans">এখনো কোনো চাকরি নেই</p>
              <p className="text-[12px] text-[#9CA3AF] font-sans">শীঘ্রই নতুন চাকরি আসবে ইনশাআল্লাহ</p>
            </div>
          )}
        </div>
      )}

      {/* Job Details Modal overlay page style */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[16px] border border-[#E5E7EB] p-5 space-y-4 shadow-lg animate-fade-in text-[#1A1A2E] text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start pb-2 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-sm font-bold text-[#1A1A2E] leading-relaxed">{selectedJob.title}</h3>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">আইডি: {selectedJob.id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setShowApplyForm(false);
                }}
                className="text-[#E74C3C] hover:bg-red-50 p-1 rounded-full transition-all text-xs font-bold"
              >
                [বন্ধ]
              </button>
            </div>

            {!showApplyForm ? (
              // View Mode
              <div className="space-y-4">
                <div className="space-y-2.5 font-sans">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6B7280]">কোম্পানি:</span>
                    <span className="font-semibold text-[#1A1A2E]">{selectedJob.company}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6B7280]">লোকেশন:</span>
                    <span className="text-[#1A1A2E]">{selectedJob.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6B7280]">বেতন রেঞ্জ:</span>
                    <span className="font-bold text-[#1D9E75]">{selectedJob.salaryRange}</span>
                  </div>
                  {selectedJob.jobType && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7280]">কাজের ধরন:</span>
                      <span className="font-semibold text-slate-700 capitalize font-sans">{selectedJob.jobType}</span>
                    </div>
                  )}

                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-xs space-y-2 text-[#4B5563] leading-relaxed font-sans border border-[#E5E7EB]">
                    <p className="font-bold text-[#1B4F72] border-b pb-1 border-gray-100">📋 কাজের বিবরণ (Description):</p>
                    <p className="whitespace-pre-line">{selectedJob.description}</p>
                  </div>

                  {selectedJob.requirements && (
                    <div className="p-3 bg-[#F4F8FA] rounded-xl text-xs space-y-2 text-slate-700 leading-relaxed font-sans border border-[#1B4F72]/10">
                      <p className="font-bold text-[#1B4F72] border-b pb-1 border-[#1B4F72]/10">🎯 প্রয়োজনীয় যোগ্যতা (Requirements):</p>
                      <p className="whitespace-pre-line">{selectedJob.requirements}</p>
                    </div>
                  )}
                </div>

                {!selectedJob.isVerified && (
                  <div className="bg-[#FDEDEC] p-3 border border-[#FADBD8] rounded-xl text-[10px] text-[#C0392B] font-sans leading-relaxed">
                    <strong>⚠️ লাল সতর্কতা:</strong> এই নিয়োগকারীর তথ্য এখনও প্রশাসন থেকে প্রমাণিত হয়নি ভাই। কোনো অবস্থাতেই চাকরির কাজের অফারের জন্য অগ্রিম কোনো টাকা বা আসল পাসপোর্ট দালালকে জমা দেবেন না। সতর্ক থাকুন ভাই।
                  </div>
                )}

                <button
                  onClick={() => {
                    // Set default inputs if auth profile is filled
                    setApplicantName(userDoc?.name || "");
                    setApplicantPhone(userDoc?.phone || "");
                    setShowApplyForm(true);
                  }}
                  className="w-full py-3 bg-[#1B4F72] hover:bg-[#143d59] text-white font-sans font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>সরাসরি বায়োডাটা পাঠান (Apply Now)</span>
                </button>
              </div>
            ) : (
              // Apply Form Mode
              <form onSubmit={handleApplySubmit} className="space-y-3.5">
                <div className="bg-[#EBF5FB] p-2.5 rounded-xl text-[10px] text-[#1B4F72] font-sans">
                  📝 আপনি <strong>{selectedJob.title}</strong> পদের জন্য আবেদন করছেন। নিচের তথ্যগুলো বাংলায় বা ইংরেজিতে লিখুন ভাই।
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">আপনার নাম (Full Name):</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="আপনার পুরো নাম লিখুন"
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">ফোন বা হোয়াটসঅ্যাপ নম্বর (Phone/WhatsApp):</label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="যেমন: +855 97xxxx"
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কম্বোডিয়াতে আপনার বর্তমান ঠিকানা (Current Location):</label>
                  <input
                    type="text"
                    required
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="যেমন: Chbar Ampov, Phnom Penh"
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">অভিজ্ঞতা বা আবেদন করার কারণ (Why apply - ঐচ্ছিক):</label>
                  <textarea
                    value={whyApply}
                    onChange={(e) => setWhyApply(e.target.value)}
                    placeholder="আপনার কাজের অভিজ্ঞতা সম্পর্কে লিখুন ভাই..."
                    rows={2.5}
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  ></textarea>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1 py-2.5 border border-[#1B4F72] text-[#1B4F72] font-semibold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    বিবরণীতে ফিরুন
                  </button>
                  <button
                    type="submit"
                    disabled={applyingLoading}
                    className="flex-1 py-2.5 bg-[#1B4F72] hover:bg-[#143d59] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {applyingLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      <span>আবেদন পাঠান</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Post a Job Form Modal (For verified employers only) */}
      {isPosting && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[16px] border border-[#E5E7EB] p-5 space-y-4 shadow-lg text-[#1A1A2E] text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-2 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-sm font-bold text-[#1A1A2E]">নতুন চাকরির পোস্ট</h3>
                <p className="text-[10px] text-emerald-600 font-sans">আপনার ভেরিফাইড প্রোফাইল থেকে লাইভ বোর্ডে যাবে ভাই</p>
              </div>
              <button
                onClick={() => setIsPosting(false)}
                className="text-[#E74C3C] hover:bg-red-50 px-2 py-0.5 rounded-lg text-xs font-bold"
              >
                [বন্ধ]
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3 font-sans">
              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">চাকরির পদের নাম (Job Title):</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: রেস্টুরেন্ট ওয়েটার / গার্মেন্টস মেকানিক"
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কোম্পানির নাম (Company):</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="যেমন: Phnom Penh Coffee"
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কাজের ধরন (Job Type):</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  >
                    <option value="full-time">Full-time (পূর্ণকালীন)</option>
                    <option value="part-time">Part-time (খন্ডকালীন)</option>
                    <option value="contract">Contract (চুক্তিবদ্ধ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">বেতন রেঞ্জ (Salary Range):</label>
                  <input
                    type="text"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="যেমন: $৩০০ - $৩৫০ / প্রতি মাস"
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#6B7280] font-medium mb-1">লোকেশন (Location):</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="যেমন: Phnom Penh"
                    className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">যোগাযোগের হোয়াটস অ্যাপ (WhatsApp):</label>
                <input
                  type="tel"
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  placeholder="যেমন: +85597xxxxx (ফাঁকা রাখলে প্রোফাইল নম্বর যাবে)"
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কাজের প্রয়োজনীয় যোগ্যতা (Requirements):</label>
                <textarea
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="অভিজ্ঞতা বা কাজের বয়স কত লাগবে লিখুন ভাই..."
                  rows={2}
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কাজের সঠিক বিবরণ ও সুযোগ-সুবিধা (Description):</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="কাজের সময়, সাপ্তাহিক ছুটি, খাবার ও আবাসন ফ্রি কিনা ইত্যাদি বিবরণ দিন..."
                  rows={3}
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2 text-xs border border-gray-200 focus:outline-none focus:border-[#1B4F72] focus:bg-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={postingLoading}
                className="w-full py-3 bg-[#1B4F72] text-white font-semibold text-xs rounded-xl hover:bg-[#143d59] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {postingLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>পোস্ট হচ্ছে...</span>
                  </>
                ) : (
                  <span>চাকরি বোর্ড এ লাইভ করুন</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
