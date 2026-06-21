import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
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
  phone?: string;
  tier?: string;
  referralCode?: string;
  referredBy?: string | null;
  referralBalance?: number;
  totalReferrals?: number;
  referralEarnings?: number;
  referralCompleted?: boolean;
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
    
    const unsubscribeDoc = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserDoc({
          uid: currentUser.uid,
          userId: data.userId || "",
          name: data.name || "",
          email: data.email || currentUser.email || "",
          balance: Number(data.balance) || 0,
          isPremium: !!data.isPremium,
          isBlocked: !!data.isBlocked,
          createdAt: data.createdAt || "",
          phone: data.phone || "",
          tier: data.tier || "basic"
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
