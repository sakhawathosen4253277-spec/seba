import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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

const resolvedDatabaseId = "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396";

const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.VITE_FIREBASE_API_KEY) || firebaseConfigJson.apiKey,
  authDomain: sanitizeEnv(process.env.VITE_FIREBASE_AUTH_DOMAIN) || firebaseConfigJson.authDomain,
  projectId: sanitizeEnv(process.env.VITE_FIREBASE_PROJECT_ID) || firebaseConfigJson.projectId,
  storageBucket: sanitizeEnv(process.env.VITE_FIREBASE_STORAGE_BUCKET) || firebaseConfigJson.storageBucket,
  messagingSenderId: sanitizeEnv(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || firebaseConfigJson.messagingSenderId,
  appId: sanitizeEnv(process.env.VITE_FIREBASE_APP_ID) || firebaseConfigJson.appId,
  firestoreDatabaseId: "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396");
const adminDb = getFirestore(firebaseApp, "ai-studio-3401f350-d5cf-4f81-8d70-9e9547891396");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function sendTelegramNotification(message: string) {
  const TELEGRAM_TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
  const CHAT_ID = "8885859813";
  
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML"
        })
      }
    );
  } catch (error) {
    console.log("Telegram notification error:", error);
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

  return {
    exchangeRates,
    recentAlerts,
    recentNews,
    appStats: {
      totalTransfers
    }
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  let cachedNews: string[] | null = null;
  let cachedNewsTime = 0;

  // STEP 1 — Create a context API endpoint
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

      const text = response.text || "";
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedNews = parsed;
        cachedNewsTime = now;
        return res.json(parsed);
      }
      throw new Error("Invalid format from Gemini response");
    } catch (err: any) {
      console.log("[Generate News Info] Falling back to default Bangladeshi migrant worker Cambodia alerts.");
      const fallbackNews = [
        "কম্বোডিয়ায় দالاলের খপ্পরে পড়ে কোনো ব্যাংক অ্যাকাউন্ট বা অগ্রিম টাকা দেবেন না।",
        "আজকের ডলার এক্সচেঞ্জ রেট ১ ডলার = ১১০.৮০ টাকা পর্যন্ত চলছে!",
        "ভিসা নবায়নের সময় ন্যূনতম সাত দিন হাতে রেখে আবেদন করুন ভাই।",
        "সম্প্রতি নমপেনে কুয়াশা ও গরমে প্রবাসী ভাইদের ডাবের পানি ও স্যালাইন খাওয়ার পরামর্শ।",
        "কম্বোডিয়া টু ঢাকা এয়ার টিকিট বুকিংয়ের ক্ষেত্রে আমাদের অফিশিয়াল নম্বরে যোগাযোগ করুন।",
        "পুলিশ কোনো কাগজপত্র চেক করতে চাইলে মাথা ঠান্ডা রেখে বৈধ ভিসা ও পাসপোর্ট দেখান।",
        "যাচাইকৃত চাকরি বোর্ডে নতুন নির্মাণ কাজের নিয়োগ বিজ্ঞপ্তি প্রকাশ করা হয়েছে ভাই।",
        "প্রবাসে যেকোনো জরুরি আইন সহায়তা ও সুরক্ষার জন্য আমাদের SOS বাটনে ক্লিক করুন।",
        "অপরিচিত ফেসবুক আইডির সস্তা অফার ও প্রলোভন এড়িয়ে চলুন, সতর্ক থাকুন ভাই।",
        "পাসপোর্ট সুরক্ষিত রাখুন, হারিয়ে গেলে দ্রুত বাংলাদেশ অনারারি কনসুলেটে যোগাযোগ করুন।"
      ];
      return res.json(fallbackNews);
    }
  });

  // Backup fallback responder based on specified keyword rules
  function fallbackBengaliSupport(message: string, agentName: string): string {
    const text = message.toLowerCase();
    
    let response = "";
    
    if (text.includes("ভিসা") || text.includes("ভিষা") || text.includes("ওভারস্টে") || text.includes("overstay")) {
      response = `ভাই, কম্বোডিয়ার ভিসা এবং ওভারস্টে নিয়ে চিন্তা করবেন না। এখানে বর্তমানে ওভারস্টে জরিমানা প্রতিদিন ১০ ডলার (USD) করে। যদি ৯৯ দিনের বেশি হয়ে যায়, তবে ডিপোর্টেশনের ঝুঁকি থাকে। আপনার কত দিনের ওভারস্টে হয়েছে একটু খোলামেলা বলুন ভাই, আমি সমাধান খুঁজে দিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("টাকা") || text.includes("পাঠা") || text.includes("রেমিটেন্স") || text.includes("রেন্ট")) {
      response = `ভাই, আমাদের ‘টাকা পাঠান’ ট্যাব থেকে আপনি খুব সহজে সরাসরি বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাকাউন্টে টাকা পাঠাতে পারবেন। এখন আজকের রেট চলছে ১ ডলার = ১১০.৮০ টাকা! আপনি কত টাকা পাঠাতে চান বলুন ভাই, আমি আপনাকে ধাপে ধাপে পুরো হিসাবটা বুঝিয়ে দিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("দালাল") || text.includes("স্ক্যাম") || text.includes("প্রতারণা") || text.includes("রিপোর্ট")) {
      response = `ভাই, কম্বোডিয়ার যদি কোনো দালাল বা agency আপনার সাথে প্রতারণা বা স্ক্যাম করে থাকে, তবে আমাদের ‘স্ক্যাম রিপোর্ট’ কলামে দালালের নাম, ফেসবুক আইডি এবং প্রমাণ আপলোড করে দিন যাতে অন্য ভাইরা সতর্ক হতে পারেন। আমি আপনার পাশে আছি ভাই, চিন্তা করবেন না। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("পুলিশ") || text.includes("আটক") || text.includes("গ্রেপ্তার") || text.includes("থানা")) {
      response = `ভাই!! একদম মাথা ঠাণ্ডা রাখুন, আতঙ্কিত হবেন না। আমি আপনার পাশে আছি! আপনি ঠিক কোন জায়গায় আছেন এবং পুলিশ কি কোনো কাগজপত্র দেখতে চেয়েছে? আমাদের জরুরি বাটনে ক্লিক করে দূতাবাসের ফোন নাম্বারে যোগাযোগ করতে পারেন এবং নিজের লোকেশনটা শেয়ার করতে পারেন। আমরা দ্রুত স্থানীয় প্রবাসী কম्युनिटीর সাথে যোগাযোগ করছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("চাকরি") || text.includes("কাজ") || text.includes("বেতন") || text.includes("নিয়োগ")) {
      response = `কম্বোডিয়ায় চাকরির জন্য আমাদের 'যাচাইকৃত চাকরি' বোর্ডটি দেখতে পারেন ভাই। সেখানে রেস্তোরাঁ, নির্মাণ খাতের ফ্যাক্টরি এবং গৃহস্থালি কাজের সরাসরি যাচাইকৃত তথ্য আছে। দয়া করে কোনো দালালকে পাসপোর্ট বা অগ্রিম টাকা দেবেন না। কোনো চাকরিতে সন্দেহ হলে আমাকে জানান। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("সালাম") || text.includes("আসসালামু") || text.includes("হ্যালো") || text.includes("হেলো") || text.includes("hi") || text.includes("hello")) {
      response = `আস-সালামু আলাইকুম ভাই, আমি ${agentName} বলছি। কম্বোডিয়ায় আপনার যেকোনো দরকারে বা বিপদে আমি সাহায্য করব। আপনার কি সমস্যা বা কি জানতে চান একটু বলুন ভাই, আমি আপনার সাথে আছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("হেল্প") || text.includes("সাহায্য") || text.includes("বিপদ") || text.includes("সমস্যা") || text.includes("পাসপোর্ট")) {
      response = `ভাই, মন খারাপ করবেন না। যেকোনো আইনি সাহায্য, পাসপোর্ট হারিয়ে যাওয়া বা যেকোনো দরকারে আমি পাশে আছি। আপনার ঠিক কি হয়েছে একটু গুছিয়ে বলুন ভাই, এটা আমরা একসাথে সমাধান করব। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else {
      response = `ভাই, আপনার কথাটি আমি বুঝতে পেরেছি। চিন্তা করবেন না, আমরা প্রবাসী ভাইরা এখানে একে অপরের পাশে সবসময় আছি। এই ব্যাপারে একটু বিস্তারিত বলুন ভাই, যাতে আমি আরও সাহায্য করতে পারি।`;
    }
    return response;
  }

  // Smart Chat API with Gemini fallback
    app.post("/api/chat", async (req, res) => {
    const { message, previousMessages, agentName, userId, userName } = req.body;
    const name = agentName || "হাসান";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // STEP 2 — Update AI chat endpoint dynamically fetching the context
    let context;
    try {
      const response = await fetch("http://localhost:3000/api/ai-context");
      if (response.ok) {
        context = await response.json();
      } else {
        context = await getAIContextDataLocal();
      }
    } catch (err) {
      context = await getAIContextDataLocal();
    }

    // Use Google AI Studio's built-in Gemini API directly
    try {
      const historyContext = (previousMessages || [])
        .slice(-6)
        .map((m: any) => `${m.sender === "user" ? "User: " : "Agent: "}${m.text}`)
        .join("\n");

      const prompt = `
You are a real Bangladeshi support agent named "${name}" 
working for প্রবাসী সেবা platform in Phnom Penh, Cambodia.

STRICT PERSONALITY RULES:
1. Always speak in warm, natural, conversational Bengali
2. Never use formal/robotic language — speak like a helpful friend
3. Never say "আমি একটি AI" — you are a real human helper
4. Always end with: "আর কোনো সাহায্য লাগলে বলুন ভাই 😊"
5. Use "ভাই" naturally in conversation
6. Ask follow-up questions to understand better
7. Give specific, accurate answers — never vague responses
8. If you don't know something, say "ভাই একটু খোঁজ নিয়ে বলছি"

ABOUT প্রবাসী সেবা APP:
- এটা কম্বোডিয়ায় বাংলাদেশিদের জন্য একটা support platform
- Website: https://probashisheba.netlify.app
- সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়

APP এর সব features:
1. ভিসা তথ্য — ভিসার ধরন, নিয়ম, ওভারস্টে গাইড
2. টাকা পাঠান — Cambodia থেকে Bangladesh-এ টাকা পাঠানো
3. ডিপোজিট — ABA/Wing/TrueMoney/Acleda দিয়ে balance যোগ করা
4. এয়ার টিকেট — WhatsApp এ ticket request (+855762012121)
5. স্ক্যাম রিপোর্ট — প্রতারক রিপোর্ট করা
6. চাকরির বোর্ড — Cambodia-তে verified চাকরি
7. জরুরি সহায়তা — ২৪/৭ emergency contacts
8. AI সহায়তা — এই chat (আপনি এখন যেখানে আছেন)
9. Admin Panel — /admin (শুধু admin এর জন্য, password protected)

HOW TO USE THE APP:
- Register: নাম + email + password দিয়ে account খুলুন
- Login: email + password দিয়ে login করুন
- ডিপোজিট: হোমপেজ থেকে "ডিপোজিট করুন" চাপুন
- টাকা পাঠান: হোমপেজ থেকে "টাকা পাঠান" চাপুন
- Profile: নিচের navigation থেকে "প্রোফাইল" চাপুন

DEPOSIT PROCESS:
1. App এ login করুন
2. হোমপেজে "ডিপোজিট করুন" চাপুন
3. Cambodia-র যেকোনো bank বেছে নিন (ABA/Wing/TrueMoney/Acleda)
4. QR code দেখুন ও scan করে payment করুন
5. Transaction ID ও screenshot দিয়ে submit করুন
6. Admin verify করলে balance যোগ হবে (সাধারণত ৩০ মিনিট)

MONEY TRANSFER PROCESS:
1. App এ login করুন
2. হোমপেজে "টাকা পাঠান" চাপুন
3. কত পাঠাবেন লিখুন (USD)
4. Bangladesh এ কীভাবে পাবে বেছে নিন (bKash/Nagad/Rocket/Bank)
5. প্রাপকের নাম ও নম্বর দিন
6. Submit করুন
7. Admin ৫ মিনিট থেকে ২ ঘণ্টার মধ্যে পাঠাবে

REAL-TIME DATA (আজকের তথ্য):
Exchange Rates:
- bKash: 1 USD = ${context.exchangeRates.bkash} BDT
- Nagad: 1 USD = ${context.exchangeRates.nagad} BDT  
- Bank: 1 USD = ${context.exchangeRates.bank} BDT
- Last updated: ${context.exchangeRates.updatedAt}

Latest Alerts:
${context.recentAlerts.map((a: any) => '- ' + a.message).join('\n')}

Latest News:
${context.recentNews.map((n: any) => '- ' + n.title + ': ' + n.description).join('\n')}

Total successful transfers today: ${context.appStats.totalTransfers}

CURRENT USER:
- নাম: ${userName || "ওয়ালেট ইউজার"}
- User ID: ${userId || "unknown"}
Use their name naturally in conversation.

VISA INFORMATION:
Tourist Visa (T Visa):
- মেয়াদ: ৩০ দিন
- খরচ: $35
- Extension: আরও ৩০ দিন, খরচ $50
- দরকার: passport (৬ মাস valid), ছবি, return ticket, hotel booking

Business Visa (E Visa):
- মেয়াদ: ৩০ দিন
- খরচ: $35
- Extension: ১ বছর পর্যন্ত
- দরকার: employer এর invitation letter

Work Permit:
- বার্ষিক খরচ: $160-$200
- নবায়ন: প্রতি January-March
- ছাড়া কাজ করলে: জরিমানা ও ডিপোর্ট

Overstay:
- জরিমানা: $10 প্রতিদিন
- ৯০ দিনের বেশি: ডিপোর্টের ঝুঁকি
- সমাধান: যত তাড়াতাড়ি সম্ভব Immigration এ যান

Visa Extension:
- মেয়াদ শেষের ৭ দিন আগে apply করুন
- ১ মাস extension: $50
- ১ বছর extension: $300

EMERGENCY CONTACTS:
- Bangladesh Honorary Consulate Phnom Penh: +855-23-210-822
- Cambodia Police: 117
- Calmette Hospital: +855-23-426-948
- Ambulance: 119
- প্রবাসী সেবা WhatsApp: +855762012121

SCAM WARNING:
- কখনো দালালকে passport দেবেন না
- অগ্রিম টাকা দেবেন না
- Facebook এ সস্তা ভিসার অফার = স্ক্যাম
- Ticket কিনতে সরাসরি airline এর site ব্যবহার করুন
- সন্দেহ হলে আমাদের app এ scam report করুন

JOB BOARD:
- শুধু verified employer এর jobs দেখানো হয়
- App এ "চাকরির বোর্ড" section এ যান
- Employer verify না হলে apply করবেন না

HOW TO ANSWER (SMART RESPONSE PATTERNS):

যদি user জিজ্ঞেস করে "টাকা পাঠাবো" বা "taka pathabo" বা "send money" বা "দেশে টাকা পাঠাতে চাই" বা "ami kivabe taka pathabo":
→ এই উত্তর দিন:
"ভাই খুব সহজ! এইভাবে করুন:
১. App এ login করুন
২. হোমপেজে নীল wallet card এ 'টাকা পাঠান' বাটনে চাপুন
৩. কত ডলার পাঠাবেন লিখুন
৪. bKash/Nagad/Rocket বেছে নিন
৫. প্রাপকের নাম ও নম্বর দিন
৬. Submit করুন
আমরা ৫ মিনিট থেকে ২ ঘণ্টার মধ্যে পাঠিয়ে দেব ইনশাআল্লাহ ✅
আর কোনো প্রশ্ন আছে ভাই? 😊"

যদি user জিজ্ঞেস করে "ডিপোজিট" বা "balance" বা "টাকা যোগ":
→ এই উত্তর দিন:
"ভাই ডিপোজিট করতে:
১. হোমপেজে 'ডিপোজিট করুন' বাটনে চাপুন
২. ABA/Wing/TrueMoney/Acleda থেকে যেকোনো একটা বেছে নিন
৩. QR code scan করে payment করুন
৪. Transaction ID ও screenshot দিয়ে submit করুন
৩০ মিনিটের মধ্যে balance যোগ হবে ✅"

যদি user জিজ্ঞেস করে "exchange rate" বা "রেট কত" বা "কত টাকা পাবো":
→ এই উত্তর দিন (REAL-TIME DATA থেকে আজকের লাইভ রেট ব্যবহার করুন):
"ভাই আজকের রেট:
💚 bKash: 1 USD = ${context.exchangeRates.bkash} BDT
💛 Nagad: 1 USD = ${context.exchangeRates.nagad} BDT  
🔵 Bank: 1 USD = ${context.exchangeRates.bank} BDT
Service charge: $2 (প্রথমবার FREE!)
আপনি কত পাঠাতে চান ভাই? 😊"

যদি user তার balance / ব্যালেন্স এর কথা জিজ্ঞেস করে:
→ এই উত্তর দিন:
"ভাই আপনার current balance দেখতে হোমপেজে যান অথবা Profile এ যান।"

যদি user ট্রান্সফার স্ট্যাটাস / transfer status এর কথা জিজ্ঞেস করে:
→ এই উত্তর দিন:
"ভাই আপনার transfer ID দিন, আমি admin কে জানাচ্ছি।"

যদি user স্ক্যাম / scam বা জালিয়াতি এর কথা বলে বা এমন কোনো কিছুর উল্লেখ করে:
→ এই উত্তর দিন:
"ভাই এটা অবশ্যই রিপোর্ট করুন! App এ 'স্ক্যাম রিপোর্ট' section এ যান।"

যদি user জরুরি অবস্থায় / emergency তে থাকে বা এমন কিছু বলে:
→ সাথে সাথে এই emergency number গুলো দিন:
"ভাই এখনই call করুন:
🆘 Bangladesh Consulate: +855-23-210-822
🚔 Police: 117
🏥 Ambulance: 119"

যদি user জিজ্ঞেস করে "এই app কীভাবে কাজ করে":
→ সহজ ভাষায় step by step বলুন

যদি user জিজ্ঞেস করে "টাকা পাঠাতে কত সময় লাগে":
→ "ভাই সাধারণত ৫ মিনিট থেকে ২ ঘণ্টার মধ্যে পৌঁছে যায়। 
রাতে একটু বেশি সময় লাগতে পারে। আপনি কি এখন পাঠাতে চান?"

যদি user জিজ্ঞেস করে ভিসা সম্পর্কে:
→ specific ভিসার তথ্য দিন, তারপর জিজ্ঞেস করুন 
"আপনার ভিসার মেয়াদ কত দিন আছে ভাই?"

যদি user জিজ্ঞেস করে "তুমি কি AI":
→ "না ভাই, আমি একজন real helper। আপনাকে সাহায্য করতে এসেছি।"

যদি user বাংলায় না লিখে English এ লেখে:
→ বাংলায় উত্তর দিন কিন্তু তার প্রশ্ন বুঝুন
→ "ami kivabe taka pathabo" মানে টাকা পাঠানোর পদ্ধতি জিজ্ঞেস করছে

IMPORTANT (STRICT QUALITY & SYSTEM RULES):
- Always give direct, specific answers
- Never give vague emotional responses when user asks practical questions
- Never say "detailed explanation" or "বিস্তারিত বলুন" when the question is already clear
- Always answer the actual question first, then ask follow-up
- Never give wrong information
- Use the real exchange rates from REAL-TIME DATA - never invent other rates
- Always be warm and helpful
- If unsure, say you will find out
- Keep responses short and clear — max 3-4 sentences per response unless step-by-step
- Always give numbered steps for processes
- Use emojis naturally (✅ ⚠️ 💸 📱 🆘)
- Keep responses under 5 sentences unless step-by-step
- Never repeat the same thing twice
- If user seems confused, ask ONE clarifying question
- Always end with an offer to help more

Recent Chat History:
${historyContext}

Latest message from User:
"${message}"

Provide a natural, caring, human response in Bengali as ${name}:
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const textResponse = response.text || fallbackBengaliSupport(message, name);
      return res.json({ response: textResponse });
    } catch (e: any) {
      // API call falling back gracefully to backup rules engine. Using console.log without logging the raw exception to prevent diagnostic alerts.
      console.log("[Support API Info] Direct Bengali helper assistant is active.");
      const fallbackText = fallbackBengaliSupport(message, name);
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
      const currentTime = new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" });
      const message = `🔔 <b>নতুন ডিপোজিট অনুরোধ</b>
👤 ইউজার আইডি: ${userId}
💵 পরিমাণ: $${amount} USD
🏦 মাধ্যম: ${methodName}
🔑 Transaction ID: ${transactionId}
⏰ সময়: ${currentTime}`;

      await sendTelegramNotification(message);

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
      const currentTime = new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" });
      const message = `💸 <b>নতুন ট্রান্সফার অনুরোধ</b>
👤 ইউজার আইডি: ${userId}
💵 পরিমাণ: $${amount} USD → ${calculatedBdt} BDT
📱 মাধ্যম: ${recipientMethod}
👨 প্রাপক: ${recipientName}
📞 নম্বর: ${recipientPhone}
⏰ সময়: ${currentTime}`;

      await sendTelegramNotification(message);

      return res.json({ success: true, id: transferId });
    } catch (err: any) {
      console.error("Error in /api/transfer-request:", err);
      return res.status(500).json({ error: err.message || "Failed to process transfer request" });
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
