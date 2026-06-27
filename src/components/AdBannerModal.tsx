import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AdBannerModalProps {
  userId: string;
}

export default function AdBannerModal({ userId }: AdBannerModalProps) {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [bannerData, setBannerData] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const checkAndShowBanner = async () => {
      try {
        const docRef = doc(db, "settings", "adBanner");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data && data.isActive && data.imageBase64) {
            const maxViews = Number(data.maxViewsPerDay) || 3;
            const duration = Number(data.duration) || 10;
            
            // Format today's date in local time YYYY-MM-DD
            const todayStr = new Date().toISOString().split("T")[0];
            
            // Check daily views for this specific user
            const storageKey = `ad_banner_views_${userId}`;
            const localDataStr = localStorage.getItem(storageKey);
            
            let viewsToday = 0;
            let currentViewsObj = { date: todayStr, count: 0 };

            if (localDataStr) {
              try {
                const parsed = JSON.parse(localDataStr);
                if (parsed.date === todayStr) {
                  viewsToday = parsed.count;
                  currentViewsObj = parsed;
                }
              } catch (e) {
                console.error("Error parsing local ad views data", e);
              }
            }

            if (viewsToday < maxViews) {
              // Show the banner
              setBannerData(data);
              setCountdown(duration);
              setShowBanner(true);
              
              // Increment and save view count
              currentViewsObj.count = viewsToday + 1;
              localStorage.setItem(storageKey, JSON.stringify(currentViewsObj));
            }
          }
        }
      } catch (err) {
        console.error("Error loading popup ad banner settings:", err);
      }
    };

    checkAndShowBanner();
  }, [userId]);

  // Handle countdown and auto-close timer
  useEffect(() => {
    if (!showBanner || countdown <= 0) {
      if (showBanner && countdown === 0) {
        setShowBanner(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showBanner, countdown]);

  if (!showBanner || !bannerData) return null;

  // Bengali translation of countdown digits
  const toBengaliNumber = (num: number) => {
    const digits = {
      "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
      "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
    };
    return num.toString().split("").map(d => (digits as any)[d] || d).join("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in" id="ad-banner-overlay">
      <div 
        className="relative bg-white rounded-[16px] border-[0.5px] border-gray-200 shadow-2xl overflow-hidden max-w-[340px] w-full max-h-[85vh] flex flex-col transform transition-transform duration-300 scale-100"
        id="ad-banner-modal"
      >
        {/* Corner Close Button */}
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-sm"
          title="বন্ধ করুন"
          id="ad-banner-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ad Image Container */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] bg-gray-50 flex items-center justify-center">
          <img
            src={bannerData.imageBase64}
            alt="বিজ্ঞাপন ব্যানার"
            className="w-full h-auto object-contain max-h-[55vh]"
            referrerPolicy="no-referrer"
            id="ad-banner-image"
          />
        </div>

        {/* Countdown Status Bar */}
        <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-100 text-center flex items-center justify-center space-x-1 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-pulse"></span>
          <span className="text-[12px] text-gray-500 font-sans">
            {toBengaliNumber(countdown)} সেকেন্ড পর এটি নিজে থেকেই চলে যাবে
          </span>
        </div>
      </div>
    </div>
  );
}
