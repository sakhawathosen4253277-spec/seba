import { Home, Briefcase, MessageSquare, Bell, User } from "lucide-react";
import { NavTab } from "../types";

interface BottomNavProps {
  currentTab: NavTab;
  setTab: (tab: NavTab) => void;
  unreadNotifications: number;
  unreadChatCount: number;
}

export default function BottomNav({
  currentTab,
  setTab,
  unreadNotifications,
  unreadChatCount,
}: BottomNavProps) {
  const tabs = [
    { id: "home", label: "হোম", icon: Home },
    { id: "services", label: "আমাদের সেবা", icon: Briefcase },
    { id: "chat", label: "চ্যাট", icon: MessageSquare, badge: unreadChatCount },
    { id: "notifications", label: "নোটিশ", icon: Bell, badge: unreadNotifications },
    { id: "profile", label: "মাই প্রোফাইল", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-900 shadow-[0_-5px_25px_rgba(0,0,0,0.5)] md:max-w-md md:mx-auto">
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all outline-none ${
                isActive
                  ? "text-emerald-400 scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id={`nav-btn-${tab.id}`}
            >
              {/* Icon Container */}
              <div className="relative p-1">
                <Icon className={`w-5.5 h-5.5 transition-transform ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-red-500 font-bold text-[10px] text-white px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center animate-bounce">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-sans font-medium mt-0.5 tracking-tight ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
                {tab.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.75 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
