/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfigJson from "../../firebase-applet-config.json";

function sanitizeEnv(val: any): string | undefined {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim();
  if (
    s === "" || 
    s === "undefined" || 
    s === "null" || 
    s === "\"\"" || 
    s === "''" || 
    s.startsWith("YOUR_") || 
    s.startsWith("MY_")
  ) {
    return undefined;
  }
  return s;
}

function sanitizeDatabaseId(dbId: any): string | undefined {
  const clean = sanitizeEnv(dbId);
  if (!clean) return undefined;
  if (clean.startsWith("https://") || clean.includes("https:")) {
    const match = clean.match(/\/databases\/([a-zA-Z0-9-_()]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return undefined;
  }
  return clean;
}

let resolvedDatabaseId = "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396";
try {
  const envId = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_FIREBASE_DATABASE_ID : undefined;
  const configId = firebaseConfigJson ? firebaseConfigJson.firestoreDatabaseId : undefined;
  resolvedDatabaseId = sanitizeDatabaseId(envId) || sanitizeDatabaseId(configId) || "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396";
} catch (e) {
  console.warn("Using default database ID ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396 due to process/env error:", e);
}

const firebaseConfig = {
  apiKey: sanitizeEnv(typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined) || firebaseConfigJson.apiKey,
  authDomain: sanitizeEnv(typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined) || firebaseConfigJson.authDomain,
  projectId: sanitizeEnv(typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined) || firebaseConfigJson.projectId,
  storageBucket: sanitizeEnv(typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined) || firebaseConfigJson.storageBucket,
  messagingSenderId: sanitizeEnv(typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined) || firebaseConfigJson.messagingSenderId,
  appId: sanitizeEnv(typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined) || firebaseConfigJson.appId,
  firestoreDatabaseId: resolvedDatabaseId,
};

let app;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, resolvedDatabaseId);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase SDK init failed, retrying with defaults:", error);
  const fallbackConfig = {
    apiKey: firebaseConfigJson.apiKey,
    authDomain: firebaseConfigJson.authDomain,
    projectId: firebaseConfigJson.projectId,
    storageBucket: firebaseConfigJson.storageBucket,
    messagingSenderId: firebaseConfigJson.messagingSenderId,
    appId: firebaseConfigJson.appId,
    firestoreDatabaseId: "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396"
  };
  app = initializeApp(fallbackConfig);
  db = getFirestore(app, "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396");
  auth = getAuth(app);
}

export { db, auth };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  
  const isOffline = errMessage.toLowerCase().includes("offline") || 
                    errMessage.toLowerCase().includes("failed to get document") ||
                    errMessage.toLowerCase().includes("network");

  if (isOffline) {
    console.warn('Firestore Warning (Offline): ', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
}

// Test connection on boot (non-blocking validation)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();
