import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini if key exists
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini client successfully initialized server-side.");
    } catch (e) {
      console.error("Failed to initialize Gemini client:", e);
    }
  } else {
    console.log("GEMINI_API_KEY not found in environment, using local rule-based system as primary.");
  }

  // Backup fallback responder based on specified keyword rules
  function fallbackBengaliSupport(message: string, agentName: string): string {
    const text = message.toLowerCase();
    
    let response = "";
    
    if (text.includes("ভিসা") || text.includes("ভিষা") || text.includes("ওভারস্টে") || text.includes("overstay")) {
      response = `ভাই, কম্বোডিয়ার ভিসা এবং ওভারস্টে নিয়ে চিন্তা করবেন না। এখানে বর্তমানে ওভারস্টে জরিমানা প্রতিদিন ১০ ডলার (USD) করে। যদি ৯৯ দিনের বেশি হয়ে যায়, তবে ডিপোর্টেশনের ঝুঁকি থাকে। আপনার কত দিনের ওভারস্টে হয়েছে একটু খোলামেলা বলুন ভাই, আমি সমাধান খুঁজে দিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("টাকা") || text.includes("পাঠা") || text.includes("রেমিটেন্স") || text.includes("রেন্ট")) {
      response = `ভাই, আমাদের ‘টাকা পাঠান’ ট্যাব থেকে আপনি খুব সহজে সরাসরি বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাকাউন্টে টাকা পাঠাতে পারবেন। এখন আজকের রেট চলছে ১ ডলার = ১১০.৮০ টাকা! আপনি কত টাকা পাঠাতে চান বলুন ভাই, আমি আপনাকে ধাপে ধাপে পুরো হিসাবটা বুঝিয়ে দিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("টিকেট") || text.includes("ফ্লাইট") || text.includes("প্লে") || text.includes("টিকিট")) {
      response = `ফ্লাইটের টিকিটের ব্যাপারে চিন্তা করবেন না ভাই। ঢাকা থেকে ফনম পেন অথবা কম্বোডিয়া থেকে বাংলাদেশের যেকোনো রুটে সাশ্রয়ী টিকেট আমরা বুকিং করে দিতে পারি। আপনি কোন তারিখে যেতে চান এবং কয়জন যাত্রী আছেন একটু জানান ভাই, আমি ট্রাভেল এজেন্সির সাথে কথা বলে দিচ্ছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("দালাল") || text.includes("প্রতারণা") || text.includes("নাম্বার") || text.includes("ফেসবুক")) {
      response = `ভাই, শুনে খুব খারাপ লাগলো। কম্বোডিয়ায় কিছু অসাধু দালাল চক্র সক্রিয় আছে যারা ভুয়া ভিসা বা টিকেটের কথা বলে টাকা হাতিয়ে নিচ্ছে। আপনি এখনই আমাদের ‘স্ক্যাম রিপোর্ট’ কলামে দালালের নাম, ফেসবুক আইডি এবং প্রমাণ আপলোড করে দিন যাতে অন্য ভাইরা সতর্ক হতে পারেন। আমি আপনার পাশে আছি ভাই, চিন্তা করবেন না। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("পুলিশ") || text.includes("আটক") || text.includes("গ্রেপ্তার") || text.includes("থানা")) {
      response = `ভাই!! একদম মাথা ঠাণ্ডা রাখুন, আতঙ্কিত হবেন না। আমি আপনার পাশে আছি! আপনি ঠিক কোন জায়গায় আছেন এবং পুলিশ কি কোনো কাগজপত্র দেখতে চেয়েছে? আমাদের জরুরি বাটনে ক্লিক করে দূতাবাসের ফোন নাম্বারে যোগাযোগ করতে পারেন এবং নিজের লোকেশনটা শেয়ার করতে পারেন। আমরা দ্রুত স্থানীয় প্রবাসী কম्युनिटीর সাথে যোগাযোগ করছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("চাকরি") || text.includes("কাজ") || text.includes("বেতন") || text.includes("নিয়োগ")) {
      response = `কম্বোডিয়ায় চাকরির জন্য আমাদের 'যাচাইকৃত চাকরি' বোর্ডটি দেখতে পারেন ভাই। সেখানে রেস্তোরাঁ, নির্মাণ খাতের ফ্যাক্টরি এবং গৃহস্থালি কাজের সরাসরি যাচাইকৃত তথ্য আছে। দয়া করে কোনো দালালকে পাসপোর্ট বা অগ্রিম টাকা দেবেন না। কোনো চাকরিতে সন্দেহ হলে আমাকে জানান। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("সালাম") || text.includes("আসসালামু") || text.includes("হ্যালো") || text.includes("হেলো") || text.includes("hi") || text.includes("hello")) {
      response = `আস-সালামু আলাইকুম ভাই, আমি ${agentName} বলছি। কম্বোডিয়ায় আপনার যেকোনো দরকারে বা বিপদে আমি সাহায্য করব। আপনার কি সমস্যা বা কি জানতে চান একটু বলুন ভাই, আমি আপনার সাথে আছি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else if (text.includes("হেল্প") || text.includes("সাহায্য") || text.includes("বিপদ") || text.includes("সমস্যা") || text.includes("পাসপোর্ট")) {
      response = `ভাই, মন খারাপ করবেন না। যেকোনো আইনি সাহায্য, পাসপোর্ট হারিয়ে যাওয়া বা যেকোনো দরকারে আমি পাশে আছি। আপনার ঠিক কি হয়েছে একটু গুছিয়ে বলুন ভাই, এটা আমরা একসাথে সমাধান করব। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    } else {
      response = `ভাই, আপনার কথাটি আমি বুঝতে পেরেছি। চিন্তা করবেন না, আমরা প্রবাসী ভাইরা এখানে একে অপরের পাশে সবসময় আছি। এই ব্যাপারে একটু বিস্তারিত বলুন ভাই, যাতে আমি সরাসরি পুলিশ, দূতাবাস বা সঠিক এজেন্টের সাথে কথা বলে সমাধান করে দিতে পারি। আর কোনো সাহায্য লাগলে বলুন ভাই।`;
    }

    // Add empathetic phrases occasionally
    const empathies = [
      "ভাই চিন্তা করবেন না, আমরা এই সমস্যার সমাধান করে দেব। ",
      "আমি আপনার সাথে আছি ভাই, আপনি একা নন। ",
      "একটু নির্ভয়ে বলুন আসলে কী হয়েছে, আমি সাহায্য করার জন্য তৈরি। "
    ];
    const randomIndex = Math.floor(Math.random() * empathies.length);
    if (Math.random() > 0.5) {
      response = empathies[randomIndex] + response;
    }
    
    return response;
  }

  // Smart Chat API with Gemini fallback
  app.post("/api/chat", async (req, res) => {
    const { message, previousMessages, agentName } = req.body;
    const name = agentName || "হাসান";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // If Gemini is configured, use it for rich responses. Otherwise, fallback to rules.
    if (ai) {
      try {
        const historyContext = (previousMessages || [])
          .slice(-6)
          .map((m: any) => `${m.sender === "user" ? "User: " : "Agent: "}${m.text}`)
          .join("\n");

        const prompt = `
You are a real human Bangladeshi support agent living and working in Phnom Penh, Cambodia. Direct instructions:
1. Your name is strictly "${name}".
2. You speak only in warm, colloquial, pure Bengali (বাংলা), typical of Bangladeshis talking to their fellow "Migrant Brothers" (প্রবাসী ভাই). Use "আস-সালামু আলাইকুম ভাই", "ভাই চিন্তা করবেন না", "আমি আপনার পাশে আছি", "বিপদ কেটে যাবে ভাই" and other deeply empathetic, soothing phrases.
3. CRITICAL BEHAVIOR: You MUST NEVER acknowledge that you are an AI, a large language model, a chatbot, or anything automated. If asked if you are an AI, respond warmly in Bengali that you are a real Bangladeshi helper who coordinates with the embassy and local community groups on the ground in Cambodia.
4. Keep answers highly helpful, concise, focused on helping a low-literacy migrant worker understand things simply.
5. Reference local facts: Cambodian visa overstay costs $10/day. bKash, Rocket, Nagad are available. Beware of fake tickets and unregistered brokers.
6. Make sure to end your response by asking if they need any more help: "আর কোনো সাহায্য লাগলে বলুন ভাই".
7. Be deeply compassionate, understanding, and responsive.

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
      } catch (e) {
        console.error("Gemini API error, falling back to rule engine:", e);
        const fallbackText = fallbackBengaliSupport(message, name);
        return res.json({ response: fallbackText });
      }
    } else {
      const fallbackText = fallbackBengaliSupport(message, name);
      return res.json({ response: fallbackText });
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
