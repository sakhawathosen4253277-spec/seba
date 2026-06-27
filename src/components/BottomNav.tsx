import { Home, FileText, AlertTriangle, Briefcase, User } from "lucide-react";
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
  const tabs: { id: NavTab; subView: string; label: string; icon: any; badge?: number }[] = [
    { id: "home", subView: "none", label: "হোম", icon: Home },
    { id: "services", subView: "visa", label: "ভিসা", icon: FileText },
    { id: "emergency", subView: "none", label: "জরুরি", icon: AlertTriangle },
    { id: "services", subView: "jobs", label: "চাকরি", icon: Briefcase },
    { id: "profile", subView: "none", label: "প্রোফাইল", icon: User },
  ];

  return (
    <nav 
      className="fixed bottom-0 z-[99999] bg-white pointer-events-auto" 
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        zIndex: 99999,
        background: 'white',
        borderTop: '0.5px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0 16px',
        pointerEvents: 'auto'
      }}
    >
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
        } else if (tab.id === "emergency") {
          isActive = currentTab === "emergency";
        } else if (tab.id === "profile") {
          isActive = currentTab === "profile";
        }

        return (
          <button
            key={`${tab.id}-${tab.subView}-${idx}`}
            onClick={() => setTab(tab.id, tab.subView)}
            className="flex flex-col items-center justify-center relative cursor-pointer outline-none select-none transition-all w-16"
            id={`nav-btn-${tab.label}`}
          >
            {/* Icon Container with Badge option */}
            <div className="relative">
              <Icon 
                style={{ 
                  width: "22px", 
                  height: "22px", 
                  color: isActive ? "#1B4F72" : "#9CA3AF" 
                }} 
              />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 bg-[#E74C3C] text-[9.5px] font-bold text-white px-1 rounded-full min-w-[15px] h-3.5 flex items-center justify-center leading-none">
                  {tab.badge}
                </span>
              ) : null}
            </div>

            {/* Content under Icon */}
            <span 
              style={{ 
                color: isActive ? "#1B4F72" : "#9CA3AF", 
                fontSize: "11px", 
                marginTop: "4px",
                fontFamily: "Inter, sans-serif",
                fontWeight: isActive ? 500 : 400,
                transition: "color 0.2s ease"
              }}
            >
              {tab.label}
            </span>

            {/* Dot indicator */}
            <span 
              style={{ 
                width: "4px", 
                height: "4px", 
                backgroundColor: isActive ? "#1B4F72" : "transparent", 
                borderRadius: "50%", 
                marginTop: "3px",
                transition: "background-color 0.2s ease"
              }} 
            />
          </button>
        );
      })}
    </nav>
  );
}
