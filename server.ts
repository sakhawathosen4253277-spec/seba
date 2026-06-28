import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp as initAdminApp, getApp as getAdminApp, getApps as getAdminApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc, updateDoc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase-applet-config.json
let firebaseConfigJson: any = {};
try {
  let configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, "firebase-applet-config.json");
  }
  if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, "../firebase-applet-config.json");
  }
  if (fs.existsSync(configPath)) {
    firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (e) {
  console.error("Error reading firebase config in server:", e);
}

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

const resolvedDatabaseId = sanitizeDatabaseId(process.env.VITE_FIREBASE_DATABASE_ID) || firebaseConfigJson.firestoreDatabaseId || "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396";

const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.VITE_FIREBASE_API_KEY) || firebaseConfigJson.apiKey,
  authDomain: sanitizeEnv(process.env.VITE_FIREBASE_AUTH_DOMAIN) || firebaseConfigJson.authDomain,
  projectId: sanitizeEnv(process.env.VITE_FIREBASE_PROJECT_ID) || firebaseConfigJson.projectId,
  storageBucket: sanitizeEnv(process.env.VITE_FIREBASE_STORAGE_BUCKET) || firebaseConfigJson.storageBucket,
  messagingSenderId: sanitizeEnv(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || firebaseConfigJson.messagingSenderId,
  appId: sanitizeEnv(process.env.VITE_FIREBASE_APP_ID) || firebaseConfigJson.appId,
  firestoreDatabaseId: resolvedDatabaseId,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, resolvedDatabaseId);
const adminDb = getFirestore(firebaseApp, resolvedDatabaseId);

// Initialize Firebase Admin SDK safely
let adminApp: any = null;
try {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396";
  const existingApps = getAdminApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
  } else {
    adminApp = initAdminApp({
      projectId: projectId,
    });
  }
  console.log("Firebase Admin initialized successfully on server with project ID:", projectId);
} catch (error: any) {
  console.error("Error initializing firebase-admin:", error);
}

// Secure server-side password reset helper
async function resetUserPassword(identifier: string, newPassword: string) {
  if (!identifier || !newPassword) {
    throw new Error("ইমেইল/ফোন এবং নতুন পাসওয়ার্ড প্রয়োজন ভাই।");
  }
  if (newPassword.length < 6) {
    throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে ভাই।");
  }

  const cleanPhone = identifier.replace(/[^0-9]/g, "");
  const usersRef = collection(db, "users");
  
  let targetEmail = "";
  let uid = "";
  let displayName = "";

  // 1. Try to find user by normalized phone if digits only
  if (cleanPhone && cleanPhone.length >= 8) {
    const qNorm = query(usersRef, where("phoneNormalized", "==", cleanPhone));
    const snapNorm = await getDocs(qNorm);
    if (!snapNorm.empty) {
      const uData = snapNorm.docs[0].data();
      targetEmail = uData.email;
      uid = uData.uid;
      displayName = uData.name;
    }
  }

  // 2. Try by raw phone
  if (!targetEmail) {
    const qPhone = query(usersRef, where("phone", "==", identifier.trim()));
    const snapPhone = await getDocs(qPhone);
    if (!snapPhone.empty) {
      const uData = snapPhone.docs[0].data();
      targetEmail = uData.email;
      uid = uData.uid;
      displayName = uData.name;
    }
  }

  // 3. Try by email
  if (!targetEmail && identifier.includes("@")) {
    const qEmail = query(usersRef, where("email", "==", identifier.trim().toLowerCase()));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      const uData = snapEmail.docs[0].data();
      targetEmail = uData.email;
      uid = uData.uid;
      displayName = uData.name;
    } else {
      targetEmail = identifier.trim().toLowerCase();
    }
  }

  if (!targetEmail) {
    throw new Error("দুঃখিত ভাই, এই ফোন নম্বর বা ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।");
  }

  const authAdmin = getAdminAuth(adminApp);

  // Now perform password reset using Firebase Admin auth
  try {
    let firebaseUid = uid;
    if (!firebaseUid) {
      // Find auth user by email
      const authUser = await authAdmin.getUserByEmail(targetEmail);
      firebaseUid = authUser.uid;
      if (!displayName) displayName = authUser.displayName || "";
    }

    if (firebaseUid) {
      await authAdmin.updateUser(firebaseUid, {
        password: newPassword,
      });
      return {
        success: true,
        email: targetEmail,
        uid: firebaseUid,
        name: displayName || "প্রবাসী ভাই",
      };
    } else {
      throw new Error("ইউজার আইডি খুঁজে পাওয়া যায়নি ভাই।");
    }
  } catch (err: any) {
    console.error("Firebase Admin update user failed:", err);
    throw new Error(`পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে ভাই। এরর: ${err.message}`);
  }
}

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const TELEGRAM_BOT_TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
const TELEGRAM_CHAT_ID = "8885859813";

async function sendTelegramNotification(message: string) {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML"
        })
      }
    );
  } catch (error) {
    console.log("Telegram error:", error);
  }
}

async function getAIContextDataLocal() {
  // 1. fetch exchangeRates/current
  let exchangeRates = {
    bkash: 110.50,
    nagad: 110.60,
    bank: 110.80,
    updatedAt: "আজ সকালে"
  };
  try {
    const rateDoc = await getDoc(doc(adminDb, "exchangeRates", "current"));
    if (rateDoc.exists()) {
      const data = rateDoc.data();
      exchangeRates = {
        bkash: data.bkash || 110.50,
        nagad: data.nagad || 110.60,
        bank: data.bank || 110.80,
        updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : "আজ সকালে"
      };
    }
  } catch (err) {
    console.error("AI Context - Error fetching rates:", err);
  }

  // 2. fetch recentAlerts (active ticker messages)
  let recentAlerts: any[] = [];
  try {
    const tickerCol = collection(adminDb, "ticker");
    const q = query(tickerCol, where("isActive", "==", true));
    const qSnapshot = await getDocs(q);
    const docsList = qSnapshot.docs.map(d => d.data());
    docsList.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    recentAlerts = docsList.slice(0, 3);
  } catch (err) {
    console.error("AI Context - Error fetching alerts:", err);
  }
  if (recentAlerts.length === 0) {
    recentAlerts = [
      { message: "কম্বোডিয়া টু ঢাকা ওয়ানওয়ে টিকেট বুকিং চলছে দ্রুত যোগাযোগ করুন।" },
      { message: "প্রবাসে পরিচিত অপরিচিত কাউকে অগ্রিম টাকা বা পাসপোর্ট দেবেন না।" }
    ];
  }

  // 3. fetch recentNews (active news)
  let recentNews: any[] = [];
  try {
    const newsCol = collection(adminDb, "news");
    const q = query(newsCol, where("isActive", "==", true));
    const qSnapshot = await getDocs(q);
    const docsList = qSnapshot.docs.map(d => d.data());
    docsList.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    recentNews = docsList.slice(0, 3);
  } catch (err) {
    console.error("AI Context - Error fetching news:", err);
  }

  // 4. appStats totalTransfers
  let totalTransfers = 1248;
  try {
    const transfersSnapshot = await getDocs(collection(adminDb, "publicTransactions"));
    if (!transfersSnapshot.empty) {
      totalTransfers = transfersSnapshot.size;
    } else {
      const reqsSnapshot = await getDocs(collection(adminDb, "transferRequests"));
      if (!reqsSnapshot.empty) {
        totalTransfers = reqsSnapshot.size;
      }
    }
  } catch (err) {
    console.error("AI Context - Error counting transfers:", err);
  }

  // 5. fetch active jobs
  let activeJobs: any[] = [];
  try {
    const jobsCol = collection(adminDb, "jobs");
    const qSnapshot = await getDocs(jobsCol);
    const docsList = qSnapshot.docs.map(d => d.data());
    // filter and sort if properties are present
    activeJobs = docsList.filter((j: any) => j.isActive !== false).slice(0, 5);
  } catch (err) {
    console.error("AI Context - Error fetching jobs for AI:", err);
  }

  // 6. fetch scam reports
  let activeScams: any[] = [];
  try {
    const scamsCol = collection(adminDb, "scamReports");
    const qSnapshot = await getDocs(scamsCol);
    const docsList = qSnapshot.docs.map(d => d.data());
    activeScams = docsList.filter((s: any) => s.status === "verified" || s.isApproved === true || s.status !== "rejected").slice(0, 5);
  } catch (err) {
    console.error("AI Context - Error fetching scams for AI:", err);
  }

  return {
    exchangeRates,
    recentAlerts,
    recentNews,
    appStats: {
      totalTransfers
    },
    activeJobs,
    activeScams
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON body parsing for standard API endpoints
  app.use(express.json());

  let cachedNews: string[] | null = null;
  let cachedNewsTime = 0;

  // POST /api/user-registered — notifies on Telegram about new user registration
  app.post("/api/user-registered", async (req, res) => {
    try {
      const { name, email, userId } = req.body;
      await sendTelegramNotification(
`👋 <b>নতুন ইউজার রেজিস্ট্রেশন</b>

👤 নাম: ${name}
📧 Email: ${email}
🆔 User ID: ${userId}
⏰ সময়: ${new Date().toLocaleString('bn-BD')}`
      );
      return res.json({ success: true });
    } catch (err: any) {
      console.log("Telegram signup error:", err);
      return res.status(500).json({ error: err.message || "Failed to send signup notification" });
    }
  });

  // GET /api/ai-context
  app.get("/api/ai-context", async (req, res) => {
    try {
      const data = await getAIContextDataLocal();
      return res.json(data);
    } catch (err: any) {
      console.error("Error in GET /api/ai-context:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch AI context" });
    }
  });

  // GET /api/generate-news with Gemini 30-minute cash
  app.get("/api/generate-news", async (req, res) => {
    const now = Date.now();
    if (cachedNews && (now - cachedNewsTime < 30 * 60 * 1000)) {
      return res.json(cachedNews);
    }

    try {
      const prompt = `Generate 10 short Bengali news alerts (max 15 words each) 
relevant for Bangladeshi migrant workers in Cambodia.
Topics: visa rules, police checks, scam warnings, 
exchange rates, weather, health alerts, job tips, 
travel tips, embassy info, safety tips.
Return as JSON array: ["alert1", "alert2", ...]
Make them feel like real live updates.
Always include variety - mix warnings, tips, and info.
Never repeat same topic twice.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      const text = response.text || "[]";
      const news = JSON.parse(text);
      cachedNews = news;
      cachedNewsTime = now;
      return res.json(news);
    } catch (err: any) {
      console.log("[Generate News Info] Falling back to default Bangladeshi migrant worker Cambodia alerts.");
      const fallbackNews = [
        "কম্বোডিয়ায় দালালের খপ্পরে পড়ে কোনো ব্যাংক অ্যাকাউন্ট বা অগ্রিম টাকা দেবেন না।",
        "আজকের ডলার এক্সচেঞ্জ রেট ১ ডলার = ১১০.৮০ টাকা পর্যন্ত চলছে!",
        "ভিসা নবায়নের সময় ন্যূনতম সাত দিন হাতে রেখে আবেদন করুন ভাই।",
        "সম্প্রতি নমপেনে বাংলাদেশি ভাইদের সহযোগিতায় একটি সাহায্য কেন্দ্র খোলা হয়েছে।"
      ];
      return res.json(fallbackNews);
    }
  });

  // Backup fallback responder based on specified keyword rules
  function fallbackBengaliSupport(message: string, agentName: string, context?: any): string {
    const text = message.toLowerCase();
    
    const toBengaliNum = (num: number | string) => {
      const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
      return String(num).split("").map(d => bnDigits[Number(d)] || d).join("");
    };

    let bkashRate = "১১০.৫০";
    let nagadRate = "১১০.৬০";
    let bankRate = "১১০.৮০";

    if (context && context.exchangeRates) {
      if (context.exchangeRates.bkash) bkashRate = toBengaliNum(context.exchangeRates.bkash);
      if (context.exchangeRates.nagad) nagadRate = toBengaliNum(context.exchangeRates.nagad);
      if (context.exchangeRates.bank) bankRate = toBengaliNum(context.exchangeRates.bank);
    }
    
    let response = "";
    
    if (text.includes("ভিসা") || text.includes("ভিষা") || text.includes("ওভারস্টে") || text.includes("overstay")) {
      response = `ভাই, কম্বোডিয়ার visa এবং ওভারস্টে নিয়ে চিন্তা করবেন না। এখানে বর্তমানে ওভারস্টে জরিমানা প্রতিদিন ১০ ডলার (USD) করে। যদি ৯০ দিনের বেশি হয়ে যায়, তবে ডিপোর্টেশনের ঝুঁকি থাকে। আপনার কত দিনের ওভারস্টে হয়েছে একটু খোলামেলা বলুন ভাই, আমি সমাধান খুঁজে দিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("টাকা") || text.includes("পাঠা") || text.includes("রেমিটেন্স") || text.includes("রেন্ট") || text.includes("রেট") || text.includes("rate") || text.includes("এক্সচেঞ্জ")) {
      response = `ভাই, আমাদের ‘টাকা পাঠান’ ট্যাব থেকে আপনি খুব সহজে সরাসরি বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাকাউন্টে টাকা পাঠাতে পারবেন। আজকের লাইভ এক্সচেঞ্জ রেট চলছে:
• বিকাশ (bKash): ১ ডলার = ${bkashRate} টাকা
• নগদ (Nagad): ১ ডলার = ${nagadRate} টাকা
• ব্যাংক (Bank): ১ ডলার = ${bankRate} টাকা

আপনি কত ডলার পাঠাতে চান বলুন ভাই, আমি আপনাকে ধাপে ধাপে পুরো হিসাবটা বুঝিয়ে দিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই 😊`;
    } else if (text.includes("দালাল") || text.includes("স্ক্যাম") || text.includes("প্রতারণা") || text.includes("রিপোর্ট")) {
      response = `ভাই, কম্বোডিয়ার যদি কোনো দালাল বা agency আপনার সাথে প্রতারণা বা স্ক্যাম করে থাকে, তবে আমাদের ‘স্ক্যাম রিপোর্ট’ ট্যাবে গিয়ে সেই প্রতারকের বিরুদ্ধে রিপোর্ট করুন ভাই। এতে অন্যান্য প্রবাসী ভাইয়েরা সতর্ক থাকতে পারবে। আপনার কি কোনো সমস্যা হয়েছে ভাই? আমাদের জানান। আর কোনো সাহায্য লাগলে বলুন ভাই 😊`;
    } else if (text.includes("হেল্প") || text.includes("সাহায্য") || text.includes("জরুরি") || text.includes("sos")) {
      response = `ভাই, যেকোনো জরুরি সমস্যায় আমাদের SOS বাটনে চাপ দিন। কম্বোডিয়ায় বাংলাদেশ কনসুলেট নম্বর: +৮৫৫-২৩-২১০-৮২২, পুলিশ: ১১৭, অ্যাম্বুলেন্স: ১১৯। আপনি কি কোনো বিপদে আছেন ভাই? আমাদের জানান। আর কোনো সাহায্য লাগলে বলুন ভাই 😊`;
    } else {
      response = `জি ভাই, আমি আপনার কথা বুঝতে পেরেছি। প্রবাসী সেবা প্লাটফর্ম থেকে আপনাকে সবরকম সহযোগিতা করতে আমি প্রস্তুত। দয়া করে আপনার প্রশ্নটি একটু বিস্তারিত বলুন অথবা কোন বিষয়ে জানতে চান তা জানান ভাই। আর কোনো সাহায্য লাগলে বলুন ভাই 😊`;
    }
    
    return response;
  }

  // Smart Chat API with Gemini
  app.post("/api/chat", async (req, res) => {
    const { message, previousMessages, agentName, userId, userName, userBalance, userPhone, userTier } = req.body;
    const name = agentName || "হাসান";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get live data context directly from Firestore safely without loopback self-fetch timeouts
    const context = await getAIContextDataLocal();

    // Use Google AI Studio's built-in Gemini API directly
    try {
      const historyContext = (previousMessages || [])
        .slice(-6)
        .map((m: any) => `${m.sender === "user" ? "User: " : "Agent: "}${m.text}`)
        .join("\n");

      const prompt = `
You are an exceptionally caring, real Bangladeshi support agent named "${name}" working for the "প্রবাসী সেবা" (Probashi Sheba) platform in Phnom Penh, Cambodia. 

YOUR CRITICAL MISSION:
1. UNDERSTAND AND ACKNOWLEDGE FIRST: Before answering any question, you MUST first clearly acknowledge and validate exactly what the user is saying with empathy (e.g., "জি ভাই, আমি বুঝতে পারছি যে আপনি..." or "হ্যাঁ ভাই, আপনি জানতে চাচ্ছেন..."). Make them feel completely understood first!
2. CHAT HISTORY: Always follow the user's conversation flow based on the previous messages. Be responsive to what they are actually saying.
3. CONVERSATIONAL BENGALI: Always speak in extremely warm, natural, friendly, and respectful Bengali (never robotic, never formal or academic). Use "ভাই" naturally.
4. NO AI IDENTITY: Never say "আমি একটি AI" or "আমি একটি কৃত্রিম বুদ্ধিমত্তা" — you are a real human helper living in Phnom Penh who is always ready to support.
5. BANGLISH UNDERSTANDING: The user might type their messages in "Banglish" (Bengali written with Latin/English alphabets, e.g., "bhai ami taka pathাতে chai" or "visa overstay fine koto?"). You MUST understand and decipher their Banglish questions perfectly. Respond in beautiful Bengali script (বাংলা ফন্ট) by default so it is easy and comforting to read.
6. DEEP PLATFORM KNOWLEDGE: You know absolutely everything about this "প্রবাসী সেবা" platform:
   - ভিসা তথ্য (Visa info): Tourist Visa, Business Visa, Work Permit rules, and Overstay guide ($10/day fine, deportation risk after 90 days).
   - টাকা পাঠান (Money Transfer): Cambodia to Bangladesh via bKash, Nagad, Rocket, or Bank Transfer. Takes 5 mins to 2 hours.
   - ডিপোজিট করুন (Deposit): Add wallet balance via ABA, Wing, TrueMoney, Acleda QR code (approved in 30 mins).
   - এয়ার টিকেট (Air Ticket): Travel guides & WhatsApp request (+855762012121).
   - স্ক্যাম রিপোর্ট (Scam Directory): Submit scammer details/evidence to protect other brothers.
   - চাকরির বোর্ড (Verified Jobs): direct verified employment with zero advance money or passport handover.
   - জরুরি সহায়তা (SOS): Honor consulate contact, Police (117), Ambulance (119).

REAL-TIME CURRENT DATA (Use these exact rates and stats in your response if relevant):
Exchange Rates Today:
- bKash: 1 USD = ${context.exchangeRates.bkash} BDT
- Nagad: 1 USD = ${context.exchangeRates.nagad} BDT  
- Bank: 1 USD = ${context.exchangeRates.bank} BDT
- Last updated: ${context.exchangeRates.updatedAt}

Latest Announcements & Alerts on Platform:
${context.recentAlerts.map((a: any) => '- ' + a.message).join('\n')}

Latest News & Safety Guidelines:
${context.recentNews.map((n: any) => '- ' + n.title + ': ' + n.description).join('\n')}

Platform Statistics:
- Total successful transfers today: ${context.appStats.totalTransfers}

Verified Jobs currently on the board:
${(context.activeJobs && context.activeJobs.length > 0) ? context.activeJobs.map((j: any) => `- ${j.title} at ${j.company || "Verified Employer"} (${j.location || "Cambodia"}), Salary: ${j.salary || "Negotiable"}`).join('\n') : "বর্তমানে সরাসরি বোর্ডে নতুন কোনো কাজ যুক্ত নেই ভাই।"}

Reported Scammers list:
${(context.activeScams && context.activeScams.length > 0) ? context.activeScams.map((s: any) => `- অভিযুক্ত দালাল: ${s.scammerName || "দালাল/প্রতারক"} (${s.scammerMeta || "N/A"})`).join('\n') : "এখনও কোনো নতুন প্রতারকের রিপোর্ট জমা পড়েনি ভাই।"}

CURRENT USER INFO:
- নাম: ${userName || "প্রিয় ইউজার"}
- User ID: ${userId || "unknown"}
- মোবাইল নম্বর: ${userPhone || "N/A"}
- ওয়ালেট ব্যালেন্স: $${userBalance || 0} USD
- মেম্বারশিপ টায়ার: ${userTier || "Basic"}

STRICT RESPONSE STRUCTURE:
1. **Acknowledge and Validate**: (e.g. "আরে ভাই, আমি বুঝতে পারছি আপনি আপনার ব্যালেন্স রিচার্জ নিয়ে চিন্তিত আছেন..." or "জি ভাই, আপনার ওভারস্টে জরিমানা নিয়ে দুশ্চিন্তা হচ্ছে, আমি একদম স্পষ্ট করে বুঝিয়ে দিচ্ছি...")
2. **Specific, Real-Time Answer**: Answer with correct facts, steps, or rates from the real-time data above. Keep it very clear and step-by-step.
3. **Always end with**: "আর কোনো সাহায্য লাগলে বলুন ভাই 😊"

Recent Chat History:
${historyContext}

Latest message from User:
"${message}"

Provide a natural, caring, highly empathetic human response in Bengali as ${name}:
`;

      const resetPasswordTool = {
        functionDeclarations: [
          {
            name: "resetUserPassword",
            description: "Resets a user's account password in Firebase Authentication. Call this only when the user explicitly requests to change, fix, or set a new password, and has provided their phone number or email, along with the new desired password. Must pass identifier (phone or email) and the new password.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                identifier: {
                  type: Type.STRING,
                  description: "The registered phone number or email address of the user."
                },
                newPassword: {
                  type: Type.STRING,
                  description: "The new password the user wants to set (minimum 6 characters)."
                }
              },
              required: ["identifier", "newPassword"]
            }
          }
        ]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [resetPasswordTool]
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === "resetUserPassword") {
          const { identifier, newPassword } = call.args as any;
          try {
            const result = await resetUserPassword(identifier, newPassword);
            
            const finalPrompt = `
You are the supportive agent "${name}" on Prabashi Sheba.
You just called the "resetUserPassword" tool to reset the password for identifier "${identifier}" to "${newPassword}".
The tool was SUCCESSFUL!
User's Name: ${result.name}
User's Email: ${result.email}
New Password Set: ${newPassword}

Provide a very warm, extremely empathetic Bengali response confirming that their password has been successfully reset. Remind them that they can now log in using their phone/email and the new password "${newPassword}"! Always end with "আর কোনো সাহায্য লাগলে বলুন ভাই 😊".
`;
            const finalResponse = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: finalPrompt,
            });
            
            return res.json({ response: finalResponse.text || `জি ভাই! আপনার পাসওয়ার্ড সফলভাবে আপডেট করে দেওয়া হয়েছে। আপনি এখন নতুন পাসওয়ার্ড "${newPassword}" দিয়ে লগইন করতে পারবেন ভাই।` });
          } catch (err: any) {
            const finalPrompt = `
You are the supportive agent "${name}".
You tried to call the "resetUserPassword" tool to reset the password for identifier "${identifier}" to "${newPassword}".
However, the tool FAILED with error: "${err.message}".

Provide a polite, caring response in Bengali explaining that you tried to reset their password but ran into this error. Help them troubleshoot (e.g., verifying their phone/email format). Always end with "আর কোনো সাহায্য লাগলে বলুন ভাই 😊".
`;
            const finalResponse = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: finalPrompt,
            });
            return res.json({ response: finalResponse.text || `দুঃখিত ভাই, পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে: ${err.message}` });
          }
        }
      }

      const textResponse = response.text || fallbackBengaliSupport(message, name, context);
      return res.json({ response: textResponse });
    } catch (e: any) {
      console.log("[Support API Info] Direct Bengali helper assistant is active.");
      const fallbackText = fallbackBengaliSupport(message, name, context);
      return res.json({ response: fallbackText });
    }
  });

  // POST /api/deposit-request — saves to Firestore depositRequests
  app.post("/api/deposit-request", async (req, res) => {
    try {
      const {
        id,
        userId,
        senderName,
        senderPhone,
        amount,
        calculatedBdt,
        methodName,
        transactionId,
        proofImageUrl,
        status,
        createdAt
      } = req.body;

      if (!id || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const reqId = id;
      await setDoc(doc(db, "depositRequests", reqId), {
        id: reqId,
        userId: userId,
        senderName: senderName || "",
        senderPhone: senderPhone || "",
        amount: Number(amount) || 0,
        calculatedBdt: Number(calculatedBdt) || 0,
        methodName: methodName || "",
        transactionId: transactionId || "",
        proofImageUrl: proofImageUrl || "",
        status: status || "pending",
        createdAt: createdAt || new Date().toISOString()
      });

      // Send Telegram Notification
      const paymentMethod = methodName || "";
      await sendTelegramNotification(
`🔔 <b>নতুন ডিপোজিট অনুরোধ</b>

👤 ইউজার আইডি: ${userId}
💵 পরিমাণ: $${amount} USD
🏦 মাধ্যম: ${paymentMethod}
🔑 Transaction ID: ${transactionId}
⏰ সময়: ${new Date().toLocaleString('bn-BD')}

👉 Admin Panel এ যাচাই করুন`
      );

      return res.json({ success: true, id: reqId });
    } catch (err: any) {
      console.error("Error in /api/deposit-request:", err);
      return res.status(500).json({ error: err.message || "Failed to process deposit request" });
    }
  });

  // POST /api/transfer-request — saves to Firestore transferRequests
  app.post("/api/transfer-request", async (req, res) => {
    try {
      const {
        id,
        userId,
        senderName,
        senderPhone,
        amount,
        serviceCharge,
        totalDeducted,
        calculatedBdt,
        recipientName,
        recipientPhone,
        recipientMethod,
        recipientBankName,
        recipientBankAccount,
        recipientMethodName,
        status,
        createdAt
      } = req.body;

      if (!id || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const transferId = id;
      await setDoc(doc(db, "transferRequests", transferId), {
        id: transferId,
        userId: userId,
        senderName: senderName || "ওয়ালেট ইউজার",
        senderPhone: senderPhone || "",
        amount: Number(amount) || 0,
        serviceCharge: Number(serviceCharge) || 0,
        totalDeducted: Number(totalDeducted) || 0,
        calculatedBdt: Number(calculatedBdt) || 0,
        recipientName: recipientName || "",
        recipientPhone: recipientPhone || "",
        recipientMethod: recipientMethod || "",
        recipientBankName: recipientBankName || "",
        recipientBankAccount: recipientBankAccount || "",
        recipientMethodName: recipientMethodName || recipientMethod || "",
        status: status || "pending",
        createdAt: createdAt || new Date().toISOString()
      });

      // Send Telegram Notification
      const userName = senderName || "ওয়ালেট ইউজার";
      const totalAmount = totalDeducted || amount;
      const bdtAmount = calculatedBdt || 0;
      const method = recipientMethodName || recipientMethod || "";
      await sendTelegramNotification(
`💸 <b>নতুন ট্রান্সফার অনুরোধ</b>

👤 ইউজার: ${userName}
💵 পরিমাণ: $${totalAmount} USD
📊 প্রাপক পাবেন: ${bdtAmount} BDT
📱 মাধ্যম: ${method}
👨 প্রাপক: ${recipientName}
📞 নম্বর: ${recipientPhone}
⏰ সময়: ${new Date().toLocaleString('bn-BD')}

👉 Admin Panel এ process করুন`
      );

      return res.json({ success: true, id: transferId });
    } catch (err: any) {
      console.error("Error in /api/transfer-request:", err);
      return res.status(500).json({ error: err.message || "Failed to process transfer request" });
    }
  });

  // Admin password reset endpoint
  app.post("/api/admin/resetPassword", async (req, res) => {
    try {
      const { identifier, newPassword } = req.body;
      if (!identifier || !newPassword) {
        return res.status(400).json({ error: "ইমেইল/ফোন এবং নতুন পাসওয়ার্ড প্রয়োজন ভাই।" });
      }
      
      const result = await resetUserPassword(identifier, newPassword);
      
      // Also update plaintext password in Firestore users/{uid} document so it remains in sync
      if (result.uid) {
        const userRef = doc(adminDb, "users", result.uid);
        await setDoc(userRef, { password: newPassword }, { merge: true });
      }
      
      return res.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে ভাই!", result });
    } catch (err: any) {
      console.error("Error in admin resetPassword endpoint:", err);
      return res.status(500).json({ error: err.message || "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে ভাই।" });
    }
  });

  // Save Exchange Rate
  app.post("/api/admin/exchangeRate", async (req, res) => {
    try {
      const data = req.body;
      const ref = doc(adminDb, "exchangeRates", "current");
      await setDoc(ref, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error saving exchange rate server route:", err);
      return res.status(500).json({ error: err.message || "Failed to save exchange rate" });
    }
  });

  // Save News Item
  app.post("/api/admin/news", async (req, res) => {
    try {
      const { id, title, tag, description, date, isActive, createdAt } = req.body;
      if (!id || !title || !description) {
        return res.status(400).json({ error: "Missing news fields" });
      }
      const ref = doc(adminDb, "news", id);
      await setDoc(ref, {
        id,
        title,
        tag: tag || "ভিসা",
        description,
        date: date || new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        isActive: isActive !== undefined ? isActive : true,
        createdAt: createdAt || new Date().toISOString()
      }, { merge: true });
      return res.json({ success: true, id });
    } catch (err: any) {
      console.error("Error saving news server route:", err);
      return res.status(500).json({ error: err.message || "Failed to save news" });
    }
  });

  // Toggle/Update News Item
  app.put("/api/admin/news/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const ref = doc(adminDb, "news", id);
      await setDoc(ref, data, { merge: true });
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating news server route:", err);
      return res.status(500).json({ error: err.message || "Failed to update news" });
    }
  });

  // Delete News Item
  app.delete("/api/admin/news/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const ref = doc(adminDb, "news", id);
      await deleteDoc(ref);
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting news server route:", err);
      return res.status(500).json({ error: err.message || "Failed to delete news" });
    }
  });

  // Save Ticker Item
  app.post("/api/admin/ticker", async (req, res) => {
    try {
      const { id, message, isActive, order, createdAt } = req.body;
      if (!id || !message) {
        return res.status(400).json({ error: "Missing ticker fields" });
      }
      const ref = doc(adminDb, "ticker", id);
      await setDoc(ref, {
        id,
        message,
        isActive: isActive !== undefined ? isActive : true,
        order: order !== undefined ? Number(order) : 1,
        createdAt: createdAt || new Date().toISOString()
      }, { merge: true });
      return res.json({ success: true, id });
    } catch (err: any) {
      console.error("Error saving ticker server route:", err);
      return res.status(500).json({ error: err.message || "Failed to save ticker" });
    }
  });

  // Toggle/Update Ticker Item
  app.put("/api/admin/ticker/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const ref = doc(adminDb, "ticker", id);
      await setDoc(ref, data, { merge: true });
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating ticker server route:", err);
      return res.status(500).json({ error: err.message || "Failed to update ticker" });
    }
  });

  // Delete Ticker Item
  app.delete("/api/admin/ticker/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const ref = doc(adminDb, "ticker", id);
      await deleteDoc(ref);
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting ticker server route:", err);
      return res.status(500).json({ error: err.message || "Failed to delete ticker" });
    }
  });

  // Serve static assets or use Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
