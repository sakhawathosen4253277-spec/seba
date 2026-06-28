import React, { useState, useEffect } from "react";
import { User, Mail, Lock, LogIn, Globe, ArrowRight, Phone, Gift, Sparkles, Send, X } from "lucide-react";
import { Language } from "../types";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, increment, serverTimestamp, addDoc } from "firebase/firestore";
import probashiLogo from "../assets/images/probashi_logo_1782647533324.jpg";

const translations = {
  BN: {
    brandTitle: "প্রবাসী সেবা",
    brandSubtitle: "কম্বোডিয়ায় বাংলাদেশিদের বিশ্বস্ত সঙ্গী",
    langSelect: "ভাষা নির্বাচন করুন (Select Language)",
    registerTitle: "নতুন প্রবাসী অ্যাকাউন্ট খুলুন",
    loginTitle: "আপনার অ্যাকাউন্টে লগইন করুন",
    fullNameLabel: "আপনার পূর্ণ নাম (Full Name):",
    fullNamePlaceholder: "যেমন: মোঃ সাকিব হাসান",
    phoneLabel: "মোবাইল নাম্বার (Mobile/WhatsApp Number):",
    phonePlaceholder: "যেমন: +৮৫৫ ১২৩৪৫৬৭৮",
    emailLabel: "ইমেইল ঠিকানা (Email Address):",
    emailPlaceholder: "যেমন: miah.probashi@gmail.com",
    identifierLabel: "মোবাইল নাম্বার অথবা ইমেইল ঠিকানা (Mobile or Email):",
    identifierPlaceholder: "যেমন: +৮৫৫ ১২৩৪৫৬৭৮ বা user@domain.com",
    passwordLabel: "পাসওয়ার্ড (Password):",
    termsAgree: "প্রবাসী সেবার নীতিমালা ও নিয়ম মেনে নিচ্ছি",
    registerBtn: "নিবন্ধন ও প্রবেশ করুন",
    loginBtn: "লগইন করুন",
    loadingText: "প্রক্রিয়াধীন রয়েছে...",
    hasAccount: "ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন",
    needAccount: "নতুন অ্যাকাউন্ট খুলতে চান? সাইন আপ করুন",
    disclaimer: "প্রবাসী সেবা কোনো ব্যাংক বা ইমিগ্রেশন ডিরেক্টরেট নয়। এটি কম্বোডিয়ায় অনিবন্ধিত অসহায় বাংলাদেশিদের সহযোগিতার স্বার্থে ফ্রিল্যান্স সমাজকর্মী দ্বারা গঠিত প্ল্যাটফর্ম ভাই।",
    fillAll: "দয়া করে সব ঘর পূরণ করুন ভাই।",
    fillName: "দয়া করে আপনার নাম লিখুন ভাই।",
    fillPhone: "দয়া করে আপনার সচল মোবাইল নাম্বারটি দিন ভাই।",
    agreeRequired: "দয়া করে প্রবাসী সেবার নীতিমালার সাথে একমত হন ভাই।",
    successReg: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে ভাই!",
    emailInUse: "এই ইমেইলটি বা মোবাইল নাম্বারটি ইতিমধ্যে নিবন্ধিত আছে ভাই।",
    invalidEmail: "দয়া করে সঠিক নাম্বার বা ইমেল অ্যাড্রেস লিখুন ভাই।",
    weakPassword: "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে ভাই।",
    wrongCredential: "ভুল ইমেইল/মোবাইল বা পাসওয়ার্ড দিয়েছেন ভাই। আবার পরীক্ষা করুন।",
    configNotFound: "দুঃখিত ভাই, আপনার ফায়ারবেস কনফিগারেশনে 'Email/Password' সক্রিয় করা নাই।",
    errorGeneric: "দুঃখিত ভাই, কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    forgotPasswordLink: "পাসওয়ার্ড ভুলে গেছেন?",
    forgotPasswordTitle: "পাসওয়ার্ড রিসেট করুন",
    resetEmailLabel: "আপনার নিবন্ধিত ইমেইল ঠিকানাটি দিন:",
    resetEmailPlaceholder: "যেমন: miah.probashi@gmail.com",
    sendResetLinkBtn: "রিসেট লিংক পাঠান",
    resetSuccessMsg: "পাসওয়ার্ড রিসেটের লিংকটি আপনার ইমেইলে পাঠিয়ে দেওয়া হয়েছে ভাই! আপনার ইনবক্স অথবা স্প্যাম ফোল্ডারটি চেক করুন।",
    backToLoginBtn: "লগইনে ফিরে যান",
    phoneForgotNotice: "⚠️ দ্রষ্টব্য: মোবাইল নাম্বার দিয়ে খোলা অ্যাকাউন্টের পাসওয়ার্ড ভুলে গেলে অনুগ্রহ করে আমাদের সাপোর্ট বা এডমিন প্যানেলে যোগাযোগ করুন ভাই।"
  },
  EN: {
    brandTitle: "Probashi Sheba",
    brandSubtitle: "Trusted companion for Bangladeshis in Cambodia",
    langSelect: "Select Language / ভাষা পরিবর্তন করুন",
    registerTitle: "Open a New Account",
    loginTitle: "Login to Your Account",
    fullNameLabel: "Your Full Name:",
    fullNamePlaceholder: "e.g., Md. Sakib Hasan",
    phoneLabel: "Phone Number (WhatsApp preferred):",
    phonePlaceholder: "e.g., +855 12345678",
    emailLabel: "Email Address:",
    emailPlaceholder: "e.g., miah.probashi@gmail.com",
    identifierLabel: "Mobile Number or Email Address:",
    identifierPlaceholder: "e.g., +855 12345678 or user@domain.com",
    passwordLabel: "Password:",
    termsAgree: "I agree to the terms & rules of Probashi Sheba",
    registerBtn: "Register & Login",
    loginBtn: "Login",
    loadingText: "Processing...",
    hasAccount: "Already have an account? Login",
    needAccount: "Want to open a new account? Sign Up",
    disclaimer: "Probashi Sheba is not a bank or immigration directorate. It is a volunteer support platform formed by freelance social workers for Bangladeshis in Cambodia.",
    fillAll: "Please fill in all fields.",
    fillName: "Please enter your name.",
    fillPhone: "Please enter your phone number.",
    agreeRequired: "Please agree to the terms & conditions.",
    successReg: "Your account was successfully created!",
    emailInUse: "This email or phone number is already registered.",
    invalidEmail: "Please enter a valid phone or email address.",
    weakPassword: "Password must be at least 6 characters long.",
    wrongCredential: "Incorrect email/phone or password. Please verify.",
    configNotFound: "Sorry, 'Email/Password' sign-in method is not enabled in your Firebase setup.",
    errorGeneric: "Sorry, something went wrong. Please try again.",
    forgotPasswordLink: "Forgot Password?",
    forgotPasswordTitle: "Reset Password",
    resetEmailLabel: "Enter your registered email address:",
    resetEmailPlaceholder: "e.g., miah.probashi@gmail.com",
    sendResetLinkBtn: "Send Reset Link",
    resetSuccessMsg: "Password reset link has been sent to your email! Please check your inbox or spam folder.",
    backToLoginBtn: "Back to Login",
    phoneForgotNotice: "⚠️ Note: If you forgot the password for an account created with a mobile number, please contact our support or admin team."
  },
  KH: {
    brandTitle: "សេវាប្រវេសជន",
    brandSubtitle: "ដៃគូដែលអាចទុកចិត្តបាន សម្រាប់ជនជាតិបង់ក្លาដែសនៅកម្ពុជា",
    langSelect: "ជ្រើសរើសភាសា / Select Language",
    registerTitle: "ចុះឈ្មោះគណនីថ្មី",
    loginTitle: "ចូលទៅក្នុងគណនីរបស់អ្នក",
    fullNameLabel: "ឈ្មោះពេញរបស់អ្នក:",
    fullNamePlaceholder: "ឧទាហរណ៍៖ Md. Sakib Hasan",
    phoneLabel: "លេខទូរស័ព្ទ (WhatsApp):",
    phonePlaceholder: "ឧទាហរណ៍៖ +855 12345678",
    emailLabel: "អាសយដ្ឋានអ៊ីមែល:",
    emailPlaceholder: "ឧទាហរណ៍៖ miah.probashi@gmail.com",
    identifierLabel: "លេខទូរស័ព្ទ ឬ អាសយដ្ឋានអ៊ីមែល:",
    identifierPlaceholder: "ឧទាហរណ៍៖ +855 12345678 ឬ user@domain.com",
    passwordLabel: "ពាក្យសម្ងាត់:",
    termsAgree: "ខ្ញុំយល់ព្រមតាមលក្ខខណ្ឌនៃសេវាប្រវេសជន",
    registerBtn: "ចុះឈ្មោះ និងចូល",
    loginBtn: "ចូល",
    loadingText: "កំពុងដំណើរការ...",
    hasAccount: "មានគណនីរួចហើយ? ចូល",
    needAccount: "ចង់បង្កើតគណនីថ្មី? ចុះឈ្មោះ",
    disclaimer: "សេវាប្រវេសជន មិនមែនជាធនាគារ ឬអគ្គនាយកដ្ឋានអន្តោប្រវេសន៍ឡើយ। វាជាវេទិកាស្ម័គ្រចិត្តបង្កើតឡើងដោយសកម្មជនសង្គម ដើម្បីជួយសម្រួលដល់ប្រជាជនបង់ក្លាដែសនៅកម្ពុជា।",
    fillAll: "សូមបំពេញគ្រប់ចន្លោះ។",
    fillName: "សូមបញ្ចូលឈ្មោះរបស់អ្នក។",
    fillPhone: "សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក।",
    agreeRequired: "សូមយល់ព្រមតាមលក្ខខណ្ឌ។",
    successReg: "គណនីរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ!",
    emailInUse: "អ៊ីមែល ឬលេខទូរស័ព្ទនេះត្រូវបានចុះឈ្មោះរួចហើយ។",
    invalidEmail: "សូមសរសេរអាសយដ្ឋានអ៊ីមែល ឬលេខទូរស័ព្ទឱ្យបានត្រឹមត្រូវ។",
    weakPassword: "ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។",
    wrongCredential: "អ៊ីមែល/លេខទូរស័ព្ទ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ សូមពិនិត្យម្តងទៀត។",
    configNotFound: "សុំទោស វិធីសាស្ត្រចុះឈ្មោះ 'Email/Password' មិនទាន់បើកក្នុងគម្រោង Firebase របស់អ្នកទេ។",
    errorGeneric: "សុំទោស មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។",
    forgotPasswordLink: "ភ្លេចពាក្យសម្ងាត់?",
    forgotPasswordTitle: "កំណត់ពាក្យសម្ងាត់ឡើងវិញ",
    resetEmailLabel: "បញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលបានចុះឈ្មោះ៖",
    resetEmailPlaceholder: "ឧទាហរណ៍៖ miah.probashi@gmail.com",
    sendResetLinkBtn: "ផ្ញើតំណភ្ជាប់កំណត់ឡើងវិញ",
    resetSuccessMsg: "តំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នកហើយ! សូមពិនិត្យប្រអប់សំបុត្រ ឬប្រអប់សារឥតបានការ។",
    backToLoginBtn: "ត្រឡប់ទៅទំព័រចូល",
    phoneForgotNotice: "⚠️ ចំណាំ៖ ប្រសិនបើអ្នកភ្លេចពាក្យសម្ងាត់សម្រាប់គណនីទូរស័ព្ទដៃ សូមទាក់ទងមកក្រុមការងារគាំទ្ររបស់យើង។"
  }
};

interface AuthProps {
  onLoginSuccess?: (email: string) => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
}

export default function AuthScreen({ onLoginSuccess, lang, onSetLang }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [regType, setRegType] = useState<"phone" | "email">("phone"); // default to recommended phone option
  
  // Single input for identifier during login OR independent inputs during registration
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [enteredReferralCode, setEnteredReferralCode] = useState("");

  // Forgot password state variables
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetWhatsapp, setResetWhatsapp] = useState("");
  const [resetLastBalance, setResetLastBalance] = useState("");
  const [resetLastDeposit, setResetLastDeposit] = useState("");
  const [resetLastWithdraw, setResetLastWithdraw] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Fallback to "BN" if selected lang layout is somehow not defined
  const currentLang = lang in translations ? lang : "BN";
  const t = translations[currentLang];

  const [isAutoReferral, setIsAutoReferral] = useState(false);
  const [refConfig, setRefConfig] = useState<any>({
    referralSystemEnabled: true,
    signupBonusAmount: 2,
    noCodeBonusEnabled: true,
    noCodeBonusAmount: 2,
    referralMinTransfer: 100
  });

  // Load referral settings on mount
  useEffect(() => {
    const fetchRefConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "referral"));
        if (docSnap.exists()) {
          setRefConfig(docSnap.data());
        }
      } catch (err) {
        console.error("Error loading settings/referral in AuthScreen:", err);
      }
    };
    fetchRefConfig();
  }, []);

  // Read and prefill referral code from shared link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get("ref");
      
      if (urlRef && urlRef.trim()) {
        const cleanRef = urlRef.trim();
        setEnteredReferralCode(cleanRef);
        setIsRegister(true);
        setIsAutoReferral(true);
        sessionStorage.setItem("prefilledReferralCode", cleanRef);
        localStorage.setItem("prefilledReferralCode", cleanRef);
      } else {
        const storedRef = sessionStorage.getItem("prefilledReferralCode") || localStorage.getItem("prefilledReferralCode");
        if (storedRef && storedRef.trim()) {
          setEnteredReferralCode(storedRef.trim());
          setIsAutoReferral(true);
        }
      }
    } catch (err) {
      console.error("Error checking referral code from URL/storage:", err);
    }
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = resetEmail.trim();
    if (!identifier) {
      alert(lang === "BN" ? "দয়া করে আপনার নিবন্ধিত ইমেইল বা মোবাইল বা ইউজার আইডি লিখুন ভাই।" : "Please enter your registered Email, Phone, or User ID.");
      return;
    }
    if (!resetWhatsapp.trim()) {
      alert(lang === "BN" ? "দয়া করে আপনার সচল হোয়াটসঅ্যাপ নাম্বারটি লিখুন ভাই।" : "Please enter your WhatsApp number.");
      return;
    }

    setResetLoading(true);
    try {
      await addDoc(collection(db, "passwordResets"), {
        usernameOrId: identifier,
        whatsappNumber: resetWhatsapp.trim(),
        lastBalance: resetLastBalance.trim() || "N/A",
        lastDeposit: resetLastDeposit.trim() || "N/A",
        lastWithdraw: resetLastWithdraw.trim() || "N/A",
        status: "pending",
        createdAt: new Date().toISOString()
      });

      alert(lang === "BN" 
        ? "ধন্যবাদ ভাই, আপনার পাসওয়ার্ড পুনরুদ্ধারের অনুরোধটি সফলভাবে জমা দেওয়া হয়েছে। এডমিন আপনার তথ্য যাচাই করে আপনার দেওয়া হোয়াটসঅ্যাপ নাম্বারে নতুন পাসওয়ার্ড পাঠিয়ে দেবেন।"
        : "Thank you brother, your password reset request has been successfully submitted. The admin will verify your details and send a new password to your provided WhatsApp number."
      );
      
      setIsForgotPassword(false);
      setResetEmail("");
      setResetWhatsapp("");
      setResetLastBalance("");
      setResetLastDeposit("");
      setResetLastWithdraw("");
    } catch (error: any) {
      console.error("Forgot password submission error:", error);
      alert(lang === "BN" ? "অনুরোধটি সাবমিট করতে সমস্যা হয়েছে ভাই। দয়া করে আবার চেষ্টা করুন।" : "Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field Verifications
    if (isRegister) {
      if (!fullName) {
        alert(t.fillName);
        return;
      }
      if (regType === "phone" && !phone) {
        alert(t.fillPhone);
        return;
      }
      if (regType === "email" && !email) {
        alert(t.fillAll);
        return;
      }
      if (!password) {
        alert(t.fillAll);
        return;
      }
      if (!agreeTerms) {
        alert(t.agreeRequired);
        return;
      }
    } else {
      if (!loginIdentifier || !password) {
        alert(t.fillAll);
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        // Handle REGISTRATION
        if (regType === "phone") {
          // Normalize digits of the phone number
          const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
          if (cleanPhone.length < 6) {
            alert(lang === "BN" ? "দয়া করে অন্তত ৬ সংখ্যার সঠিক মোবাইল নাম্বার লিখুন ভাই।" : "Please enter a valid phone number.");
            setLoading(false);
            return;
          }

          // Create a mock domain email behind the scene to register securely in Firebase auth
          const generatedEmail = `${cleanPhone}@probashi.com`;

          // Check if this phone number is already saved to firestore beforehand (prevents duplicated registrations easily)
          const qNorm = query(collection(db, "users"), where("phoneNormalized", "==", cleanPhone));
          const snapNorm = await getDocs(qNorm);
          if (!snapNorm.empty) {
            alert(t.emailInUse);
            setLoading(false);
            return;
          }

          const userCredential = await createUserWithEmailAndPassword(auth, generatedEmail, password);
          const user = userCredential.user;

          // Generate random 6 digit user display code (PS-xxxxxx)
          const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
          const generatedUserId = "PS-" + randomDigits;

          // Generate unique referralCode matching their userId
          const newReferralCode = "PS-REF-" + randomDigits;
          
          let referredByValue: string | null = null;
          let userPendingBonus = 0;
          let userReferralCompleted = false;

          const refSystemEnabled = refConfig.referralSystemEnabled !== false;
          const signupBonusVal = Number(refConfig.signupBonusAmount !== undefined ? refConfig.signupBonusAmount : 2);
          const noCodeBonusEnabledVal = refConfig.noCodeBonusEnabled !== false;
          const noCodeBonusVal = Number(refConfig.noCodeBonusAmount !== undefined ? refConfig.noCodeBonusAmount : 2);

          if (enteredReferralCode.trim()) {
            const enteredCodeClean = enteredReferralCode.trim().toUpperCase();
            const refQuery = query(collection(db, "users"), where("referralCode", "==", enteredCodeClean));
            const refSnap = await getDocs(refQuery);
            
            let referrerDoc = !refSnap.empty ? refSnap.docs[0] : null;
            if (!referrerDoc) {
              const derivedUserId = enteredCodeClean.replace("PS-REF-", "PS-");
              const altQuery = query(collection(db, "users"), where("userId", "==", derivedUserId));
              const altSnap = await getDocs(altQuery);
              if (!altSnap.empty) {
                referrerDoc = altSnap.docs[0];
              }
            }

            if (referrerDoc) {
              referredByValue = enteredCodeClean;
              userPendingBonus = signupBonusVal;
              userReferralCompleted = false;
              
              // Increment referrer's referralBalance (representing pending referral balance)
              try {
                await updateDoc(referrerDoc.ref, {
                  referralBalance: increment(signupBonusVal)
                });
              } catch (updateErr) {
                console.warn("Failed to increment referrer's pending balance:", updateErr);
              }
              
              // Save friendly pending notification to referrer:
              await addDoc(collection(db, "notifications"), {
                userId: referrerDoc.id,
                message: `নতুন বন্ধু ${fullName.trim()} আপনার রেফারেল কোড দিয়ে যোগ দিয়েছেন ভাই! উনি সফলভাবে মোট $${refConfig.referralMinTransfer || 100} ট্রান্সফার সম্পন্ন করার পর আপনি রেফারেল বোনাস পাবেন 🎉`,
                type: "referral_pending",
                isRead: false,
                createdAt: serverTimestamp()
              });
            } else {
              if (noCodeBonusEnabledVal) {
                userPendingBonus = noCodeBonusVal;
                userReferralCompleted = false;
              } else {
                userPendingBonus = 0;
                userReferralCompleted = true;
              }
            }
          } else {
            if (noCodeBonusEnabledVal) {
              userPendingBonus = noCodeBonusVal;
              userReferralCompleted = false;
            } else {
              userPendingBonus = 0;
              userReferralCompleted = true;
            }
          }

          // Save doc in Firestore directly containing raw phone and normalized digits
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            userId: generatedUserId,
            name: fullName.trim(),
            email: generatedEmail,
            phone: phone.trim(),
            phoneNormalized: cleanPhone,
            balance: 0,
            isPremium: false,
            isBlocked: false,
            createdAt: new Date().toISOString(),
            referralCode: newReferralCode,
            referredBy: referredByValue,
            referralBalance: 0,
            totalReferrals: 0,
            referralEarnings: 0,
            referralCompleted: userReferralCompleted,
            pendingBonus: userPendingBonus,
            totalCompletedTransfersAmount: 0,
            password: password, // Store plaintext password for admin review
            totalTransfers: 0
          });

          // Send notification on new user registration to Telegram
          try {
            const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
            const CHAT_ID = "8885859813";
            const message = `👋 <b>নতুন ইউজার রেজিস্ট্রেশন</b>

👤 নাম: ${fullName.trim()}
📧 Email: ${generatedEmail}
🆔 User ID: ${generatedUserId}
⏰ সময়: ${new Date().toLocaleString('bn-BD')}`;

            await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML"
              })
            });
          } catch (err) {
            console.error("Failed to send signup notification:", err);
          }

          await auth.signOut();
          alert(lang === "BN" 
            ? "মোবাইল অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে ভাই! এখন আপনি আপনার মোবাইল নাম্বার এবং পাসওয়ার্ড দিয়ে লগইন করুন।" 
            : "Mobile account registered successfully! Please login using your phone number & password."
          );
          setIsRegister(false);
          setLoginIdentifier(phone.trim());
        } else {
          // REGISTER VIA EMAIL
          const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
          const user = userCredential.user;
          
          await sendEmailVerification(user);
          
          // Generate random 6 digit ID
          const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
          const generatedUserId = "PS-" + randomDigits;

          // Generate unique referralCode matching their userId
          const newReferralCode = "PS-REF-" + randomDigits;
          
          let referredByValue: string | null = null;
          let userPendingBonus = 0;
          let userReferralCompleted = false;

          const refSystemEnabled = refConfig.referralSystemEnabled !== false;
          const signupBonusVal = Number(refConfig.signupBonusAmount !== undefined ? refConfig.signupBonusAmount : 2);
          const noCodeBonusEnabledVal = refConfig.noCodeBonusEnabled !== false;
          const noCodeBonusVal = Number(refConfig.noCodeBonusAmount !== undefined ? refConfig.noCodeBonusAmount : 2);

          if (enteredReferralCode.trim()) {
            const enteredCodeClean = enteredReferralCode.trim().toUpperCase();
            const refQuery = query(collection(db, "users"), where("referralCode", "==", enteredCodeClean));
            const refSnap = await getDocs(refQuery);
            
            let referrerDoc = !refSnap.empty ? refSnap.docs[0] : null;
            if (!referrerDoc) {
              const derivedUserId = enteredCodeClean.replace("PS-REF-", "PS-");
              const altQuery = query(collection(db, "users"), where("userId", "==", derivedUserId));
              const altSnap = await getDocs(altQuery);
              if (!altSnap.empty) {
                referrerDoc = altSnap.docs[0];
              }
            }

            if (referrerDoc) {
              referredByValue = enteredCodeClean;
              userPendingBonus = signupBonusVal;
              userReferralCompleted = false;
              
              // Increment referrer's referralBalance (representing pending referral balance)
              try {
                await updateDoc(referrerDoc.ref, {
                  referralBalance: increment(signupBonusVal)
                });
              } catch (updateErr) {
                console.warn("Failed to increment referrer's pending balance:", updateErr);
              }
              
              // Save friendly pending notification to referrer:
              await addDoc(collection(db, "notifications"), {
                userId: referrerDoc.id,
                message: `নতুন বন্ধু ${fullName.trim()} আপনার রেফারেল কোড দিয়ে যোগ দিয়েছেন ভাই! উনি সফলভাবে মোট $${refConfig.referralMinTransfer || 100} ট্রান্সফার সম্পন্ন করার পর আপনি রেফারেল বোনাস পাবেন 🎉`,
                type: "referral_pending",
                isRead: false,
                createdAt: serverTimestamp()
              });
            } else {
              if (noCodeBonusEnabledVal) {
                userPendingBonus = noCodeBonusVal;
                userReferralCompleted = false;
              } else {
                userPendingBonus = 0;
                userReferralCompleted = true;
              }
            }
          } else {
            if (noCodeBonusEnabledVal) {
              userPendingBonus = noCodeBonusVal;
              userReferralCompleted = false;
            } else {
              userPendingBonus = 0;
              userReferralCompleted = true;
            }
          }

          // Save doc in Firestore
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            userId: generatedUserId,
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: "",
            phoneNormalized: "",
            balance: 0,
            isPremium: false,
            isBlocked: false,
            createdAt: new Date().toISOString(),
            referralCode: newReferralCode,
            referredBy: referredByValue,
            referralBalance: 0,
            totalReferrals: 0,
            referralEarnings: 0,
            referralCompleted: userReferralCompleted,
            pendingBonus: userPendingBonus,
            totalCompletedTransfersAmount: 0,
            password: password, // Store plaintext password for admin review
            totalTransfers: 0
          });
          
          // Send notification on new user registration to Telegram
          try {
            const TOKEN = "8835452864:AAFRES1PPt4o4ZkuwMsJvxtPiqjOM0SLEuA";
            const CHAT_ID = "8885859813";
            const message = `👋 <b>নতুন ইউজার রেজিস্ট্রেশন</b>

👤 নাম: ${fullName.trim()}
📧 Email: ${email.trim().toLowerCase()}
🆔 User ID: ${generatedUserId}
⏰ সময়: ${new Date().toLocaleString('bn-BD')}`;

            await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML"
              })
            });
          } catch (err) {
            console.error("Failed to send signup notification:", err);
          }

          await auth.signOut();
          alert(lang === "BN"
            ? "রেজিস্ট্রেশন সম্পন্ন! আপনার ইমেইলে একটি যাচাইকরণ লিংক পাঠানো হয়েছে ভাই। ইনবক্স/স্প্যাম চেক করুন, লিংকে ক্লিক করে যাচাই করুন, তারপর লগইন করুন।"
            : "Registration completed! Verification link has been sent to your email. Please verify and then login."
          );
          setIsRegister(false);
          setLoginIdentifier(email.trim().toLowerCase());
        }
      } else {
        // Handle LOGIN
        let resolvedEmail = loginIdentifier.trim().toLowerCase();

        // If login text does not contain "@", we process it as a mobile number lookup
        if (!resolvedEmail.includes("@")) {
          const digitsOnly = resolvedEmail.replace(/[^0-9]/g, '');
          if (!digitsOnly) {
            alert(lang === "BN" ? "দয়া করে সঠিক মোবাইল নাম্বার বা ইমেল দিন ভাই।" : "Please enter a valid phone or email.");
            setLoading(false);
            return;
          }

          // Search Firestore "users" collection for phoneNormalized matching input digits or raw matching
          const usersRef = collection(db, "users");
          const qNorm = query(usersRef, where("phoneNormalized", "==", digitsOnly));
          const snapNorm = await getDocs(qNorm);

          if (!snapNorm.empty) {
            resolvedEmail = snapNorm.docs[0].data().email;
          } else {
            // Check raw matching in case it was stored without normalization
            const qPhone = query(usersRef, where("phone", "==", loginIdentifier.trim()));
            const snapPhone = await getDocs(qPhone);
            if (!snapPhone.empty) {
              resolvedEmail = snapPhone.docs[0].data().email;
            } else {
              alert(lang === "BN" 
                ? "দুঃখিত ভাই, এই মোবাইল নাম্বারটি কোনো অ্যাকাউন্টে নিবন্ধিত নেই।" 
                : "Sorry, this phone number is not registered."
              );
              setLoading(false);
              return;
            }
          }
        }

        // Login with Resolved Firebase Email
        const userCredential = await signInWithEmailAndPassword(auth, resolvedEmail, password);
        const user = userCredential.user;

        // Skip verification gate of email only if it is a phone-registered fallback ending with our custom @probashi.com mock domain
        const isEmailVerifiedOrMocked = user.emailVerified || (user.email && user.email.endsWith("@probashi.com"));

        if (!isEmailVerifiedOrMocked) {
          await auth.signOut();
          alert(lang === "BN" 
            ? "আপনার ইমেইল এখনো যাচাই হয়নি ভাই। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন এবং যাচাইকরণ লিংকে ক্লিক করুন।" 
            : "Your email is not verified. Please check your inbox or spam folder."
          );
        } else {
          try {
            await updateDoc(doc(db, "users", user.uid), {
              password: password
            });
          } catch (e) {
            console.warn("Could not auto-update password in firestore during login", e);
          }
          onLoginSuccess?.(user.email || resolvedEmail);
        }
      }
    } catch (error: any) {
      const userErrorCodes = [
        "auth/user-not-found",
        "auth/wrong-password",
        "auth/invalid-credential",
        "auth/email-already-in-use",
        "auth/weak-password",
        "auth/invalid-email"
      ];
      if (error && userErrorCodes.includes(error.code)) {
        console.warn("User auth notice (expected):", error.message || error);
      } else {
        console.error("Auth error:", error);
      }
      let errMsg = t.errorGeneric;
      if (error.code === "auth/email-already-in-use") {
        errMsg = t.emailInUse;
      } else if (error.code === "auth/invalid-email") {
        errMsg = t.invalidEmail;
      } else if (error.code === "auth/weak-password") {
        errMsg = t.weakPassword;
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errMsg = t.wrongCredential;
      } else if (error.code === "auth/configuration-not-found" || (error.message && error.message.includes("configuration-not-found"))) {
        errMsg = t.configNotFound;
      }
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5 pb-20 px-5 pt-6 font-sans bg-[#F0F4F8] min-h-screen text-[#1A1A2E] relative">
      
      {/* Brand Profile Center banner */}
      <div className="text-center space-y-2 mt-4 select-none">
        <img 
          src={probashiLogo} 
          alt="প্রবাসী সেবা" 
          className="w-16 h-16 rounded-[16px] object-cover mx-auto border border-gray-200"
          referrerPolicy="no-referrer"
          style={{ borderWidth: "0.5px" }}
        />

        <div className="space-y-0.5">
          <h2 className="text-[22px] font-medium tracking-tight text-[#1A1A2E] font-sans">{t.brandTitle}</h2>
          <p className="text-[12px] text-[#6B7280] font-sans">{t.brandSubtitle}</p>
        </div>
      </div>

      {/* Language Selector options */}
      <div className="bg-white p-[14px] rounded-[16px] border-[0.5px] border-[#E5E7EB] space-y-2.5" style={{ borderWidth: '0.5px' }}>
        <p className="text-xs text-[#6B7280] font-sans font-normal text-center">
          {t.langSelect}
        </p>

        <div className="grid grid-cols-3 gap-2 text-center text-[13px]">
          {[
            { id: "BN", label: "বাংলা" },
            { id: "EN", label: "English" },
            { id: "KH", label: "ភាសាខ្មែរ" }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => onSetLang(l.id as Language)}
              className={`h-11 rounded-[10px] font-medium transition-all cursor-pointer ${
                lang === l.id
                  ? "bg-[#1B4F72] text-white border-none"
                  : "bg-[#F0F4F8] text-[#6B7280] border-[0.5px] border-[#E5E7EB] hover:bg-[#F3F4F6]"
              }`}
              style={{ borderWidth: lang === l.id ? '0' : '0.5px' }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Login/Registration Card structure */}
      <div className="bg-white p-[24px] rounded-[16px] border-[0.5px] border-[#E5E7EB] space-y-4" style={{ borderWidth: '0.5px' }}>
        {isForgotPassword ? (
          <div className="space-y-4">
            <h3 className="text-[15px] font-medium text-[#1A1A2E] text-center font-sans">
              পাসওয়ার্ড পুনরুদ্ধারের অনুরোধ
            </h3>

            <form onSubmit={handleForgotPassword} className="space-y-3.5 text-left font-sans">
              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                  নিবন্ধিত ইমেল, মোবাইল বা ইউজার আইডি (Registered Account):
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="যেমন: miah.probashi@gmail.com বা মোবাইল"
                    className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                    style={{ borderWidth: '0.5px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                  হোয়াটসঅ্যাপ নাম্বার (WhatsApp for sending Password):
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    value={resetWhatsapp}
                    onChange={(e) => setResetWhatsapp(e.target.value)}
                    placeholder="যেমন: +855xxxxxxx"
                    className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                    style={{ borderWidth: '0.5px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                  আপনার শেষ ওয়ালেট ব্যালেন্স (Last Wallet Balance):
                </label>
                <input
                  type="text"
                  value={resetLastBalance}
                  onChange={(e) => setResetLastBalance(e.target.value)}
                  placeholder="যেমন: $12.50 USD (আনুমানিক)"
                  className="w-full h-11 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] px-3.5 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                  style={{ borderWidth: '0.5px' }}
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                  আপনার শেষ ডিপোজিট বা টাকা পাঠানোর পরিমাণ (Last Deposit):
                </label>
                <input
                  type="text"
                  value={resetLastDeposit}
                  onChange={(e) => setResetLastDeposit(e.target.value)}
                  placeholder="যেমন: $50 USD (আনুমানিক)"
                  className="w-full h-11 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] px-3.5 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                  style={{ borderWidth: '0.5px' }}
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                  আপনার শেষ উইথড্র বা টাকা তোলার পরিমাণ (Last Withdrawal):
                </label>
                <input
                  type="text"
                  value={resetLastWithdraw}
                  onChange={(e) => setResetLastWithdraw(e.target.value)}
                  placeholder="যেমন: $20 USD (আনুমানিক)"
                  className="w-full h-11 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] px-3.5 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                  style={{ borderWidth: '0.5px' }}
                />
              </div>

              <div className="text-[11px] text-[#6B7280] leading-relaxed bg-[#F4F8FA] p-3 rounded-[10px] border-[0.5px] border-[#D5E6F2]" style={{ borderWidth: '0.5px' }}>
                💡 <strong>তথ্য যাচাইকরণ:</strong> আপনার দেওয়া ওয়ালেট ব্যালেন্স এবং শেষ লেনদেনের তথ্যটি এডমিন প্যানেলে যাচাই করা হবে। তথ্য সঠিক হলে আপনার হোয়াটসঅ্যাপে নতুন পাসওয়ার্ড পাঠানো হবে ভাই।
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full h-12 bg-[#1B4F72] text-white font-medium text-[13px] rounded-[12px] flex items-center justify-center space-x-2 transition-colors cursor-pointer hover:bg-opacity-95 disabled:bg-opacity-50 font-sans mt-2"
              >
                {resetLoading ? (
                  <span>{t.loadingText}</span>
                ) : (
                  <>
                    <span>অনুরোধ সাবমিট করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-[#E5E7EB]" style={{ borderTopWidth: '0.5px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetEmail("");
                  setResetWhatsapp("");
                  setResetLastBalance("");
                  setResetLastDeposit("");
                  setResetLastWithdraw("");
                }}
                className="text-[13px] font-medium text-[#1B4F72] focus:outline-none cursor-pointer"
              >
                {t.backToLoginBtn}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-[15px] font-medium text-[#1A1A2E] text-center">
              {isRegister ? t.registerTitle : t.loginTitle}
            </h3>

            {/* Dynamic Registration Options Selector — recommend phone default as instructed */}
            {isRegister && (
              <div className="grid grid-cols-2 gap-2 text-center text-[12px] pb-1 border-b border-gray-100" style={{ borderBottomWidth: '0.5px' }}>
                <button
                  type="button"
                  onClick={() => setRegType("phone")}
                  className={`h-9 rounded-[8px] font-medium transition-all cursor-pointer ${
                    regType === "phone"
                      ? "bg-[#1B4F72] text-white"
                      : "bg-[#F0F4F8] text-[#6B7280] border-[0.5px] border-[#E5E7EB] hover:bg-gray-100"
                  }`}
                  style={{ borderWidth: regType === "phone" ? '0' : '0.5px' }}
                >
                  মেবাইল নাম্বার (পরামর্শিত)
                </button>
                <button
                  type="button"
                  onClick={() => setRegType("email")}
                  className={`h-9 rounded-[8px] font-medium transition-all cursor-pointer ${
                    regType === "email"
                      ? "bg-[#1B4F72] text-white"
                      : "bg-[#F0F4F8] text-[#6B7280] border-[0.5px] border-[#E5E7EB] hover:bg-gray-100"
                  }`}
                  style={{ borderWidth: regType === "email" ? '0' : '0.5px' }}
                >
                  ইমেইল অ্যাড্রেস
                </button>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.fullNameLabel}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                      style={{ borderWidth: '0.5px' }}
                    />
                  </div>
                </div>
              )}

              {isRegister ? (
                regType === "phone" ? (
                  <div>
                    <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.phoneLabel}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.phonePlaceholder}
                        className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                        style={{ borderWidth: '0.5px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.emailLabel}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                        style={{ borderWidth: '0.5px' }}
                      />
                    </div>
                  </div>
                )
              ) : (
                // Dedicated Single Flexible Input field during login (accepts both Phone or Email)
                <div>
                  <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.identifierLabel}</label>
                  <div className="relative">
                    <LogIn className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={t.identifierPlaceholder}
                      className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                      style={{ borderWidth: '0.5px' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                    style={{ borderWidth: '0.5px' }}
                  />
                </div>
                {!isRegister && (
                  <div className="flex justify-end pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setResetEmail("");
                      }}
                      className="text-[12px] text-[#1B4F72] hover:underline focus:outline-none cursor-pointer font-medium font-sans"
                    >
                      {t.forgotPasswordLink}
                    </button>
                  </div>
                )}
              </div>

              {isRegister && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] text-[#6B7280] font-normal">রেফারেল কোড (যদি থাকে)</label>
                    {isAutoReferral && enteredReferralCode && (
                      <span className="text-[#1D9E75] text-[10px] font-medium bg-[#E8F8F5] px-2 py-0.5 rounded-full border-[0.5px] border-[#A3E4D7] flex items-center gap-0.5" style={{ borderWidth: '0.5px' }}>
                        <span>✓</span> লিঙ্ক থেকে অটো যুক্ত হয়েছে ভাই
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Gift className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={enteredReferralCode}
                      onChange={(e) => {
                        setEnteredReferralCode(e.target.value);
                        // If they manually edit it, stop showing the link tag if cleared
                        if (!e.target.value) {
                          setIsAutoReferral(false);
                        }
                      }}
                      placeholder="যেমন: PS-REF-123456"
                      className="w-full h-12 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] pl-10 pr-4 rounded-[12px] border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                      style={{ borderWidth: '0.5px' }}
                    />
                  </div>
                  {enteredReferralCode.trim() ? (
                    <p className="text-[10px] text-[#1D9E75] mt-1 pr-1 font-sans flex items-center gap-0.5">
                      <span>✨</span> রেফার কোড ব্যবহার করায় আপনি <strong>${refConfig.signupBonusAmount || 2}</strong> পেন্ডিং বোনাস পাবেন ভাই!
                    </p>
                  ) : refConfig.noCodeBonusEnabled ? (
                    <p className="text-[10px] text-[#1B4F72] mt-1 pr-1 font-sans flex items-center gap-0.5">
                      <span>✨</span> রেফার কোড ছাড়া অ্যাকাউন্ট খোলায় আপনি <strong>${refConfig.noCodeBonusAmount || 2}</strong> পেন্ডিং বোনাস পাবেন ভাই!
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#E74C3C] mt-1 pr-1 font-sans flex items-center gap-0.5">
                      <span>⚠️</span> দুঃখিত ভাই, রেফার কোড ছাড়া অ্যাকাউন্ট খোলায় আপনি কোনো সাইন-আপ বোনাস পাবেন না।
                    </p>
                  )}
                </div>
              )}

              {isRegister && (
                <div className="flex items-center space-x-2 py-1 text-[#6B7280] text-[13px] font-sans">
                  <button
                    type="button"
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className="focus:outline-none shrink-0 cursor-pointer"
                  >
                    {agreeTerms ? (
                      <span className="w-4.5 h-4.5 bg-[#1B4F72] text-white rounded flex items-center justify-center font-bold text-[11px]">✓</span>
                    ) : (
                      <span className="w-4.5 h-4.5 rounded bg-[#F9FAFB] border-[0.5px] border-[#E5E7EB] block" style={{ borderWidth: '0.5px' }} />
                    )}
                  </button>
                  <span className="select-none">{t.termsAgree}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1B4F72] text-white font-medium text-[13px] rounded-[12px] flex items-center justify-center space-x-2 transition-colors cursor-pointer hover:bg-opacity-95 disabled:bg-opacity-50"
              >
                {loading ? (
                  <span>{t.loadingText}</span>
                ) : (
                  <>
                    <span>{isRegister ? t.registerBtn : t.loginBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-[#E5E7EB]" style={{ borderTopWidth: '0.5px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                }}
                className="text-[13px] font-medium text-[#1B4F72] focus:outline-none cursor-pointer"
              >
                {isRegister ? t.hasAccount : t.needAccount}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Safety Policy */}
      <div className="text-center text-[11px] text-[#6B7280] font-sans max-w-[325px] mx-auto leading-relaxed select-none pt-2 font-normal">
        {t.disclaimer}
      </div>

    </div>
  );
}
