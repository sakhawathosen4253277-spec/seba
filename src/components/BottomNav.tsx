import { Home, FileText, MessageSquare, Briefcase, User } from "lucide-react";
import { NavTab } from "../types";

interface BottomNavProps {
  currentTab: NavTab;
  currentSubView?: string;
  setTab: (tab: NavTab, subView?: string) => void;
  unreadNotifications: number;
  unreadChatCount: number;
}

export default function BottomNav({
  currentTab,
  currentSubView = "none",
  setTab,
  unreadNotifications,
  unreadChatCount,
}: BottomNavProps) {
  const tabs = [
    { id: "home" as NavTab, subView: "none", label: "হোম", icon: Home },
    { id: "services" as NavTab, subView: "visa", label: "ভিসা", icon: FileText },
    { id: "chat" as NavTab, subView: "none", label: "AI", icon: MessageSquare, badge: unreadChatCount },
    { id: "services" as NavTab, subView: "jobs", label: "চাকরি", icon: Briefcase },
    { id: "profile" as NavTab, subView: "none", label: "প্রোফাইল", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] md:max-w-md md:mx-auto">
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          
          // Compute active state based on custom sub-matching logic
          let isActive = false;
          if (tab.id === "home") {
            isActive = currentTab === "home";
          } else if (tab.id === "services" && tab.subView === "visa") {
            isActive = currentTab === "services" && currentSubView === "visa";
          } else if (tab.id === "services" && tab.subView === "jobs") {
            isActive = currentTab === "services" && currentSubView === "jobs";
          } else if (tab.id === "chat") {
            isActive = currentTab === "chat";
          } else if (tab.id === "profile") {
            isActive = currentTab === "profile";
          }

          return (
            <button
              key={`${tab.id}-${tab.subView}-${idx}`}
              onClick={() => setTab(tab.id, tab.subView)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all outline-none ${
                isActive
                  ? "text-[#1B4F72] scale-102"
                  : "text-[#6B7280] hover:text-[#1B4F72]"
              }`}
              id={`nav-btn-${tab.label}`}
            >
              {/* Icon Container */}
              <div className="relative p-1">
                <Icon className={`w-5.2 h-5.2 transition-transform ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#E74C3C] font-bold text-[10px] text-white px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span className={`text-[11px] font-sans font-medium mt-0.5 tracking-tight ${isActive ? "text-[#1B4F72]" : "text-[#6B7280]"}`}>
                {tab.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 bg-[#1B4F72] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
