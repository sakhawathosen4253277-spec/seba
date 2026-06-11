import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";

export async function seedDatabaseIfNeeded() {
  try {
    // We check if "exchangeRates" -> "current" exists. 
    // If not, we assume seed is needed.
    const exchangeDocRef = doc(db, "exchangeRates", "current");
    const exchangeDoc = await getDoc(exchangeDocRef);

    if (exchangeDoc.exists()) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding initial data...");

    // 1. Seed exchangeRates -> "current"
    await setDoc(exchangeDocRef, {
      bkash: 110.50,
      nagad: 110.60,
      bank: 110.80,
      usdRate: 110.80,
      updatedAt: new Date().toISOString()
    });

    // 2. Seed ticker messages
    const tickerItems = [
      "ওভারস্টে জরিমানা $10/দিন — ৯০ দিনের বেশি থাকলে ডিপোর্ট হতে পারেন",
      "ভিসা extension করুন মেয়াদ শেষের ৭ দিন আগে",
      "দালালকে পাসপোর্ট দেবেন না — এটা বেআইনি",
      "Work Permit ছাড়া কাজ করলে জরিমানা ও ডিপোর্ট",
      "জরুরি হাসপাতাল: Calmette Hospital, Phnom Penh",
      "ভুয়া টিকেট স্ক্যাম চলছে — টাকা দেওয়ার আগে যাচাই করুন",
      "Bangladesh Honorary Consulate Phnom Penh — বিপদে যোগাযোগ করুন"
    ];

    for (let i = 0; i < tickerItems.length; i++) {
      const id = `ticker_${i + 1}`;
      await setDoc(doc(db, "ticker", id), {
        id: id,
        message: tickerItems[i],
        isActive: true,
        order: i + 1,
        createdAt: new Date().toISOString()
      });
    }

    // 3. Seed news
    const newsItems = [
      {
        title: 'কম্বোডিয়ায় নতুন E-Visa নিয়ম চালু',
        tag: 'ভিসา',
        description: 'আবেদন এখন সম্পূর্ণ অনলাইনে করা যাবে',
        isActive: true
      },
      {
        title: 'ফনম পেনহে নতুন স্ক্যাম চক্র সক্রিয়',
        tag: 'সতর্কতা',
        description: 'অপরিচিত এজেন্ট থেকে সাবধান থাকুন',
        isActive: true
      },
      {
        title: 'Phnom Penh এ ডেঙ্গু জ্বর বাড়ছে',
        tag: 'স্বাস্থ্য',
        description: 'মশারি ব্যবহার করুন ও সতর্ক থাকুন',
        isActive: true
      }
    ];

    for (let i = 0; i < newsItems.length; i++) {
      const id = `news_${i + 1}`;
      await setDoc(doc(db, "news", id), {
        id: id,
        title: newsItems[i].title,
        tag: newsItems[i].tag,
        description: newsItems[i].description,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }

    // 4. Seed emergency contacts
    const contacts = [
      { name: 'Bangladesh Honorary Consulate', phone: '+855-23-210-822', category: 'দূতাবাস', order: 1 },
      { name: 'Cambodia Police', phone: '117', category: 'পুলিশ', order: 2 },
      { name: 'Calmette Hospital', phone: '+855-23-426-948', category: 'হাসপাতাল', order: 3 },
      { name: 'Ambulance', phone: '119', category: 'জরুরি', order: 4 }
    ];

    for (let i = 0; i < contacts.length; i++) {
      const id = `contact_${i + 1}`;
      await setDoc(doc(db, "emergencyContacts", id), {
        id: id,
        name: contacts[i].name,
        phone: contacts[i].phone,
        description: "",
        category: contacts[i].category,
        order: contacts[i].order
      });
    }

    console.log("Seeding data finished successfully!");
  } catch (err) {
    console.error("Error error during seeding:", err);
  }
}

export async function seedPaymentMethodsIfNeeded() {
  try {
    const snap = await getDocs(collection(db, "paymentMethods"));
    if (!snap.empty) {
      console.log("Payment methods already exist.");
      return;
    }
    console.log("Seeding payment methods...");
    const methods = [
      { id: 'bkash', name: 'bKash', country: 'BD', color: '#E2136E', isActive: true, order: 1, accountName: 'প্রবাসী সেবা বিকাশ মার্চেন্ট', qrImageUrl: '' },
      { id: 'nagad', name: 'Nagad', country: 'BD', color: '#F6921E', isActive: true, order: 2, accountName: 'প্রবাসী সেবা নগদ পার্সোনাল', qrImageUrl: '' },
      { id: 'rocket', name: 'Rocket', country: 'BD', color: '#8B1FA8', isActive: true, order: 3, accountName: 'প্রবাসী সেবা রকেট এজেন্ট', qrImageUrl: '' },
      { id: 'bank_bd', name: 'Bank Transfer', country: 'BD', color: '#1B4F72', isActive: true, order: 4, accountName: 'প্রবাসী সেবা ট্রাস্ট ব্যাংক পিএলসি', qrImageUrl: '' },
      
      { id: 'aba', name: 'ABA Bank', country: 'KH', color: '#E31837', isActive: true, order: 5, accountName: 'PROBASHI SHEBA KH ABA', qrImageUrl: '' },
      { id: 'wing', name: 'Wing Money', country: 'KH', color: '#0066CC', isActive: true, order: 6, accountName: 'PROBASHI SHEBA KH WING', qrImageUrl: '' },
      { id: 'truemoney', name: 'True Money', country: 'KH', color: '#FF6600', isActive: true, order: 7, accountName: 'PROBASHI SHEBA KH TRUE', qrImageUrl: '' },
      { id: 'acleda', name: 'Acleda Bank', country: 'KH', color: '#004B87', isActive: true, order: 8, accountName: 'PROBASHI SHEBA KH ACLEDA', qrImageUrl: '' }
    ];

    for (const m of methods) {
      await setDoc(doc(db, "paymentMethods", m.id), m);
    }
    console.log("Seeding payment methods finished successfully!");
  } catch (err) {
    console.error("Error seeding payment methods:", err);
  }
}
