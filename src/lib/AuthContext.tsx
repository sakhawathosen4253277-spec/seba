import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";

export interface UserDoc {
  uid: string;
  userId: string;
  name: string;
  email: string;
  balance: number;
  isPremium: boolean;
  isBlocked: boolean;
  createdAt: string;
  phone: string;
  tier: string;
  referralCode: string;
  referredBy: string | null;
  referralBalance: number;
  totalReferrals: number;
  referralEarnings: number;
  referralCompleted: boolean;
  totalTransfers: number;
  lastDailyClaim?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userDoc: UserDoc | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userDoc: null,
  loading: true,
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (!user) {
        setUserDoc(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const docRef = doc(db, "users", currentUser.uid);
    
    const unsubscribeDoc = onSnapshot(docRef, async (snap) => {
      if (snap.exists()) {
        const existingData = snap.data();
        
        // Auto-generate referral code if missing
        if (!existingData.referralCode) {
          const newCode = "PS-REF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
          try {
            await updateDoc(doc(db, "users", currentUser.uid), {
              referralCode: newCode,
              referralBalance: 0,
              totalReferrals: 0,
              referralEarnings: 0
            });
          } catch (e) {
            console.warn("Failed to auto-generate referral code:", e);
          }
        }

        setUserDoc({
          uid: currentUser.uid,
          userId: existingData.userId || "",
          name: existingData.name || "",
          email: existingData.email || currentUser.email || "",
          balance: Number(existingData.balance) || 0,
          isPremium: !!existingData.isPremium,
          isBlocked: !!existingData.isBlocked,
          createdAt: existingData.createdAt || "",
          phone: existingData.phone || "",
          tier: existingData.tier || "basic",
          referralCode: existingData.referralCode || "",
          referredBy: existingData.referredBy || null,
          referralBalance: Number(existingData.referralBalance) || 0,
          totalReferrals: Number(existingData.totalReferrals) || 0,
          referralEarnings: Number(existingData.referralEarnings) || 0,
          referralCompleted: !!existingData.referralCompleted,
          totalTransfers: Number(existingData.totalTransfers) || 0,
          lastDailyClaim: existingData.lastDailyClaim || ""
        });
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    }, (error) => {
      // Handle the Firestore error with context
      handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
      setLoading(false);
    });

    return () => unsubscribeDoc();
  }, [currentUser]);

  const logout = async () => {
    try {
      // Clear all keys from sessionStorage related to home alerts
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("home_alerts_shown_")) {
          sessionStorage.removeItem(key);
        }
      }
      sessionStorage.removeItem("home_alerts_shown_anon");
    } catch (e) {
      console.warn("sessionStorage clear failed", e);
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userDoc, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
