"use client";

import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { 
  getPartnerProfile, 
  createPartnerProfile, 
  initializePartnerStats, 
  updateNotificationReadStatus, 
  updatePartnerProfile, 
  testConnection,
  getRewardConfig,
  isEmailRegisteredInPartners,
  isNameRegisteredWithAnotherEmail,
  PartnerDocument,
  PartnerStatsDocument,
  PartnerCommissionDocument,
  PayoutDocument,
  NotificationDocument
} from "@/lib/db-helpers";
import { Timestamp, onSnapshot, collection, query, where, orderBy, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Gift, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  LogOut, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Award, 
  Filter, 
  Search,
  Check,
  X,
  Lock,
  DollarSign,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  Bell,
  Copy,
  ExternalLink,
  Shield,
  Activity,
  UserCheck,
  Globe,
  Settings,
  Grid,
  Menu,
  CreditCard,
  Briefcase,
  Eye,
  EyeOff
} from "lucide-react";

// Safe date formatter to handle native Firestore Timestamps and fallback cases
function formatDate(val: any): string {
  if (!val) return "—";
  if (val && typeof val.toDate === "function") {
    return val.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (val instanceof Date) {
    return val.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (typeof val === "string") {
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (typeof val === "number") {
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return "—";
}

// Safe date-time formatter to handle native Firestore Timestamps and show time for Alerts/Notifications
function formatDateTime(val: any): string {
  if (!val) return "—";
  let dateObj: Date;
  if (val && typeof val.toDate === "function") {
    dateObj = val.toDate();
  } else if (val instanceof Date) {
    dateObj = val;
  } else if (val && val.seconds !== undefined) {
    dateObj = new Date(val.seconds * 1000);
  } else {
    dateObj = new Date(val);
  }

  if (isNaN(dateObj.getTime())) return "—";

  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }) + " at " + dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

// Highly stylized realistic mock data for Demonstration Mode
const MOCK_COMMISSIONS = (partnerId: string): PartnerCommissionDocument[] => [
  {
    commissionId: "comm_001",
    partnerId,
    purchaseId: "pur_9812",
    transactionId: "TXN-882190",
    email: "sarah.connor@gmail.com",
    amountPaid: 45000,
    commissionAmount: 4500,
    payoutStatus: "paid",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
  },
  {
    commissionId: "comm_002",
    partnerId,
    purchaseId: "pur_9813",
    transactionId: "TXN-882191",
    email: "james.wood@corporate.co",
    amountPaid: 120000,
    commissionAmount: 12000,
    payoutStatus: "processing",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
  },
  {
    commissionId: "comm_003",
    partnerId,
    purchaseId: "pur_9814",
    transactionId: "TXN-882192",
    email: "alexis.sanchez@yahoo.com",
    amountPaid: 25000,
    commissionAmount: 2500,
    payoutStatus: "pending",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
  }
];

const MOCK_PAYOUTS = (partnerId: string): PayoutDocument[] => [
  {
    payoutId: "pay_001",
    partnerId,
    periodStart: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    periodEnd: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
    totalAmount: 38200,
    paymentReference: "REF-DLX-99821A",
    status: "completed",
    paidAt: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
  },
  {
    payoutId: "pay_002",
    partnerId,
    periodStart: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    periodEnd: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    totalAmount: 18500,
    paymentReference: "REF-DLX-99895B",
    status: "processing",
    paidAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000))
  }
];

const MOCK_NOTIFICATIONS = (partnerId: string): NotificationDocument[] => [
  {
    notificationId: "notif_001",
    partnerId,
    title: "Onboarding Confirmed",
    message: "Welcome to Deloxe! Your tracking codes are active and your base commission tier is live.",
    read: true,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
  },
  {
    notificationId: "notif_002",
    title: "Commission Earned",
    partnerId,
    message: "A purchase (pur_9812) was successfully verified with your referral code. ₦4,500 has been added to your ledger.",
    read: false,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
  },
  {
    notificationId: "notif_003",
    title: "Weekly Payout Initiated",
    partnerId,
    message: "A weekly payout of ₦18,500 is currently processing. Expected bank clearing within 24 hours.",
    read: false,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000))
  }
];

export default function Home() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [partner, setPartner] = useState<PartnerDocument | null>(null);
  const [stats, setStats] = useState<PartnerStatsDocument | null>(null);
  const [commissions, setCommissions] = useState<PartnerCommissionDocument[]>([]);
  const [payouts, setPayouts] = useState<PayoutDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  
  // App States
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingError, setOnboardingError] = useState("");
  const [existingAccountError, setExistingAccountError] = useState("");
  const [submittingOnboarding, setSubmittingOnboarding] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Email/Password Auth States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"google" | "email">("google");
  const [authEmailMode, setAuthEmailMode] = useState<"signin" | "signup">("signin");
  const [authEmailError, setAuthEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Demo Mode (simulates live backend population for visualization)
  const demoMode = false;

  // UTC Clock
  const [currentTime, setCurrentTime] = useState("");

  // Determine active currency symbol dynamically
  const currencySymbol = partner ? (partner.currency === 'USD' ? '$' : partner.currency === 'GBP' ? '£' : partner.currency === 'EUR' ? '€' : '₦') : '₦';

  // Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "commissions" | "payouts" | "notifications" | "settings">("dashboard");

  // Onboarding Wizard Form State
  const [obForm, setObForm] = useState({
    partnerType: "individual" as "individual" | "corporate",
    country: "Nigeria",
    fullName: "",
    companyName: "",
    representativeName: "",
    representativeTitle: "",
    email: "",
    phone: "",
    socialHandle: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    payoutFrequency: "weekly" as "weekly" | "monthly",
    agreementAccepted: false,
    digitalSignature: ""
  });

  // Settings Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: "",
    companyName: "",
    representativeName: "",
    representativeTitle: "",
    email: "",
    phone: "",
    socialHandle: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    payoutFrequency: "weekly" as "weekly" | "monthly"
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Test Database Connection and Start Clock
  useEffect(() => {
    testConnection();
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setExistingAccountError("");
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await getPartnerProfile(firebaseUser.uid);
          if (profile) {
            // Self-healing: Ensure partnerId field matches the authentic Auth UID
            if (profile.partnerId !== firebaseUser.uid) {
              profile.partnerId = firebaseUser.uid;
            }
            setPartner(profile);
            // Pre-populate settings form
            setEditForm({
              fullName: profile.fullName || "",
              companyName: profile.companyName || "",
              representativeName: profile.representativeName || "",
              representativeTitle: profile.representativeTitle || "",
              email: profile.email || "",
              phone: profile.phone || "",
              socialHandle: profile.socialHandle || "",
              bankName: profile.bankName || "",
              accountName: profile.accountName || "",
              accountNumber: profile.accountNumber || "",
              payoutFrequency: profile.payoutFrequency || "weekly"
            });
          } else {
            // Check if email already exists in Firestore partners collection
            const email = firebaseUser.email;
            if (email) {
              const emailExists = await isEmailRegisteredInPartners(email, firebaseUser.uid);
              if (emailExists) {
                setExistingAccountError("An account already exists for this email. Please log in instead.");
                setPartner(null);
                setAuthChecking(false);
                setLoading(false);
                return;
              }
            }
            // First time registration prepopulate
            setObForm(prev => ({
              ...prev,
              fullName: firebaseUser.displayName || "",
              email: firebaseUser.email || ""
            }));
            setPartner(null);
            setExistingAccountError("");
          }
        } catch (error) {
          console.error("Error evaluating profile:", error);
        }
      } else {
        setUser(null);
        setPartner(null);
        setStats(null);
        setCommissions([]);
        setPayouts([]);
        setNotifications([]);
        setExistingAccountError("");
      }
      setAuthChecking(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Firestore Data in Real-time from shared collections
  useEffect(() => {
    if (!user || !partner) return;

    const timer = setTimeout(() => {
      setDbLoading(true);
    }, 0);

    const statsRef = doc(db, "partner_stats", user.uid);
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as PartnerStatsDocument);
      } else {
        setStats(null);
      }
      setDbLoading(false);
    }, (err) => {
      console.error("Stats subscription error:", err);
      setDbLoading(false);
    });

    const commissionsQuery = query(
      collection(db, "partner_commissions"),
      where("partnerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubCommissions = onSnapshot(commissionsQuery, (snapshot) => {
      const list: PartnerCommissionDocument[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ commissionId: docSnap.id, ...docSnap.data() } as PartnerCommissionDocument);
      });
      setCommissions(list);
    }, (err) => {
      console.error("Commissions subscription error:", err);
    });

    const payoutsQuery = query(
      collection(db, "payouts"),
      where("partnerId", "==", user.uid),
      orderBy("paidAt", "desc")
    );
    const unsubPayouts = onSnapshot(payoutsQuery, (snapshot) => {
      const list: PayoutDocument[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ payoutId: docSnap.id, ...docSnap.data() } as PayoutDocument);
      });
      setPayouts(list);
    }, (err) => {
      console.error("Payouts subscription error:", err);
    });

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("partnerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const list: NotificationDocument[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ notificationId: docSnap.id, ...docSnap.data() } as NotificationDocument);
      });
      setNotifications(list);
    }, (err) => {
      console.error("Notifications subscription error:", err);
    });

    return () => {
      clearTimeout(timer);
      unsubStats();
      unsubCommissions();
      unsubPayouts();
      unsubNotifications();
    };
  }, [user, partner]);

  // Auth Operations
  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Authentication rejected:", error);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthEmailError("");
    setLoading(true);

    if (!authEmail || !authPassword) {
      setAuthEmailError("Please provide both email and password.");
      setLoading(false);
      return;
    }

    try {
      if (authEmailMode === "signin") {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      let errMsg = "Authentication failed. Please verify your credentials.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        errMsg = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/email-already-in-use") {
        errMsg = "This email is already in use. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        errMsg = "Password is too weak. Must be at least 6 characters.";
      } else {
        errMsg = error.message || errMsg;
      }
      setAuthEmailError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout rejected:", error);
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Wizard submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardingError("");

    if (!user) {
      setOnboardingError("Authentication lost. Please try logging in again.");
      return;
    }

    // Validation
    const { 
      partnerType, fullName, companyName, phone, email, socialHandle,
      bankName, accountName, accountNumber, payoutFrequency, agreementAccepted, digitalSignature 
    } = obForm;

    if (partnerType === "corporate" && (!companyName || !obForm.representativeName || !obForm.representativeTitle)) {
      setOnboardingError("Please complete all corporate details (Company Name, Representative Details).");
      return;
    }

    if (!fullName || !phone || !email || !socialHandle || !bankName || !accountName || !accountNumber) {
      setOnboardingError("Please complete all profile and financial fields.");
      return;
    }

    if (!agreementAccepted || !digitalSignature) {
      setOnboardingError("You must read and accept the terms of agreement by typing your digital signature.");
      return;
    }

    if (digitalSignature.trim().toLowerCase() !== fullName.trim().toLowerCase()) {
      setOnboardingError(`Digital signature must match your full name exactly: "${fullName}"`);
      return;
    }

    setSubmittingOnboarding(true);

    try {
      // Check if email already exists in Firestore
      const emailExists = await isEmailRegisteredInPartners(email);
      if (emailExists) {
        setOnboardingError("An account already exists for this email. Please log in instead.");
        setSubmittingOnboarding(false);
        return;
      }

      // 1. Auto-generate Uppercase Referral Code (e.g. MOSES91, DELOXE73)
      const rawBase = (partnerType === "corporate" ? companyName : fullName)
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const namePart = rawBase.slice(0, 6);
      const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      const referralCode = `${namePart}${suffix}`;

      // 2. Generate Tracking Slug (e.g. /?ref=MOSES91)
      const trackingSlug = `/?ref=${referralCode}`;

      // 3. Set reward rates and currency dynamic config based on country selection
      const rewardConfig = getRewardConfig(obForm.country, partnerType);
      const rewardRate = rewardConfig.rate;
      const currency = rewardConfig.currency;

      // 4. Generate beautiful Partner display ID (e.g. DELXp1, DELXp42)
      const partnerDisplayId = "DELXp" + Math.floor(1 + Math.random() * 999);

      // 5. Create document payload
      const payload: Omit<PartnerDocument, 'createdAt' | 'updatedAt' | 'agreementSignedAt'> = {
        partnerId: user.uid,
        partnerDisplayId,
        partnerType,
        status: "active",
        fullName,
        companyName: partnerType === "corporate" ? companyName : null,
        representativeName: partnerType === "corporate" ? obForm.representativeName : null,
        representativeTitle: partnerType === "corporate" ? obForm.representativeTitle : null,
        email,
        phone,
        socialHandle,
        country: obForm.country,
        currency,
        referralCode,
        trackingSlug,
        rewardRate,
        payoutFrequency,
        bankName,
        accountName,
        accountNumber,
        agreementAccepted
      };

      // Create profile and initialize stats
      await createPartnerProfile(payload);
      await initializePartnerStats(user.uid);

      // Reload
      const profile = await getPartnerProfile(user.uid);
      if (profile) {
        setPartner(profile);
        setEditForm({
          fullName: profile.fullName || "",
          companyName: profile.companyName || "",
          representativeName: profile.representativeName || "",
          representativeTitle: profile.representativeTitle || "",
          email: profile.email || "",
          phone: profile.phone || "",
          socialHandle: profile.socialHandle || "",
          bankName: profile.bankName || "",
          accountName: profile.accountName || "",
          accountNumber: profile.accountNumber || "",
          payoutFrequency: profile.payoutFrequency || "weekly"
        });
      }
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      setOnboardingError("Database transaction failed. Please verify credentials or contact admin.");
    } finally {
      setSubmittingOnboarding(false);
    }
  };

  // Edit Profile Update Action
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    setEditLoading(true);

    if (!user || !partner) {
      setEditError("Missing user instance. Reload recommended.");
      setEditLoading(false);
      return;
    }

    try {
      await updatePartnerProfile(user.uid, {
        fullName: editForm.fullName,
        companyName: partner.partnerType === "corporate" ? editForm.companyName : null,
        representativeName: partner.partnerType === "corporate" ? editForm.representativeName : null,
        representativeTitle: partner.partnerType === "corporate" ? editForm.representativeTitle : null,
        email: editForm.email,
        phone: editForm.phone,
        socialHandle: editForm.socialHandle,
        bankName: editForm.bankName,
        accountName: editForm.accountName,
        accountNumber: editForm.accountNumber,
        payoutFrequency: editForm.payoutFrequency
      });

      setEditSuccess("Profile preferences saved successfully.");
      const updatedProfile = await getPartnerProfile(user.uid);
      if (updatedProfile) {
        setPartner(updatedProfile);
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setEditError("Failed to update profile. Ensure all inputs meet constraints.");
    } finally {
      setEditLoading(false);
    }
  };

  // Notification Toggle Read Status
  const handleToggleRead = async (notifId: string, currentRead: boolean) => {
    if (demoMode) {
      setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, read: !currentRead } : n));
      return;
    }
    try {
      await updateNotificationReadStatus(notifId, !currentRead);
      setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, read: !currentRead } : n));
    } catch (err) {
      console.error("Notification update failed:", err);
    }
  };

  // Copy Referral URL helper
  const handleCopy = () => {
    if (!partner) return;
    const fullUrl = `https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`;
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Pre-authentication & Loading view
  if (authChecking || loading) {
    return (
      <div id="loading-screen" className="min-h-screen bg-[#030712] flex flex-col justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 font-mono text-xs">DLX</div>
        </div>
        <p className="mt-6 text-slate-400 font-mono text-xs tracking-wider uppercase animate-pulse">Initializing Security Layers...</p>
      </div>
    );
  }

  // Welcome / Login Gate
  if (!user) {
    return (
      <div id="login-container" className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative overflow-hidden">
        {/* Backdrop Orbs */}
        <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none"></div>

        {/* Global Utilities Rail */}
        <div className="w-full bg-[#080d1a] border-b border-slate-900/60 py-2.5 px-6 flex justify-between items-center text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>NETWORK: ACTIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div>{currentTime || "SECURE PORTAL"}</div>
        </div>

        {/* Brand Header */}
        <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 border border-amber-500/20 rounded-xl flex items-center justify-center font-mono font-bold text-amber-400 text-lg shadow-lg shadow-amber-500/10">
              DX
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-amber-400 to-slate-100 bg-clip-text text-transparent">
                DELOXE HR
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500">PARTNER PORTAL</span>
            </div>
          </div>
        </header>

        {/* Hero Area */}
        <main className="max-w-7xl w-full mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-16 py-12 z-10 flex-grow">
          <div className="max-w-xl text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full text-[11px] font-mono font-medium text-amber-400 mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Talent Incentive Hub
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                Referral Incentive Portal <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                  Incentives on Autopilot.
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                Integrate directly with Deloxe’s official HR incentive infrastructure. Distribute your unique link, monitor live conversion traffic, track earned commissions, and secure reliable automated payouts.
              </p>
            </motion.div>

            {/* Structured Features bento */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 backdrop-blur">
                <Globe className="w-5 h-5 text-amber-400 mb-2" />
                <h3 className="font-semibold text-slate-200 text-sm font-display">Alphanumeric Codes</h3>
                <p className="text-xs text-slate-400 mt-1">Get instant uppercase referral tags and structured tracking parameters upon sign up.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 backdrop-blur">
                <Award className="w-5 h-5 text-emerald-400 mb-2" />
                <h3 className="font-semibold text-slate-200 text-sm font-display">Standardized Rate Tiers</h3>
                <p className="text-xs text-slate-400 mt-1">Earn highly structured base rewards tailored automatically: Individual (₦200) vs Corporate (₦500).</p>
              </div>
            </motion.div>
          </div>

          {/* Secure Entry Card */}
          <motion.div
            className="w-full max-w-md p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
            
            <h2 className="text-2xl font-bold font-display text-white mb-2">Access Portal</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in securely with your Google Credentials or Email to proceed to onboarding or your active workspace.</p>

            {/* Tab switch for Auth Method */}
            <div className="flex bg-[#050914] p-1 rounded-xl border border-slate-800/80 mb-6" id="auth-method-tabs">
              <button
                type="button"
                id="auth-method-google-btn"
                onClick={() => setAuthMethod("google")}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  authMethod === "google" 
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" 
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                GOOGLE ACCOUNT
              </button>
              <button
                type="button"
                id="auth-method-email-btn"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  authMethod === "email" 
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" 
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                EMAIL & PASSWORD
              </button>
            </div>

            {authMethod === "google" ? (
              <button
                id="google-login-btn"
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 font-sans font-bold py-3.5 px-5 rounded-xl hover:bg-slate-100 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.247-3.135C18.428 1.152 15.534 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.93 0 11.52-4.877 11.52-11.725 0-.788-.085-1.39-.188-1.99H12.24z"
                  />
                </svg>
                Google Account Gateway
              </button>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4" id="email-auth-form">
                {/* Mode toggle (Sign In vs Sign Up) */}
                <div className="flex justify-end gap-4 text-xs font-mono mb-2">
                  <button
                    type="button"
                    id="auth-mode-signin-btn"
                    onClick={() => {
                      setAuthEmailMode("signin");
                      setAuthEmailError("");
                    }}
                    className={`pb-1 border-b transition-all cursor-pointer ${
                      authEmailMode === "signin"
                        ? "border-amber-500 text-amber-400 font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    id="auth-mode-signup-btn"
                    onClick={() => {
                      setAuthEmailMode("signup");
                      setAuthEmailError("");
                    }}
                    className={`pb-1 border-b transition-all cursor-pointer ${
                      authEmailMode === "signup"
                        ? "border-amber-500 text-amber-400 font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    CREATE ACCOUNT
                  </button>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="auth-email-input"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#050914] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500/50 transition-colors font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-mono mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="auth-password-input"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#050914] border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      id="toggle-auth-password-visibility-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none p-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {authEmailError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400 font-sans" id="auth-error-display">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authEmailError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="email-auth-submit-btn"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-sans font-bold py-3.5 px-5 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-amber-500/15 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : authEmailMode === "signin" ? (
                    "Secure Account Login"
                  ) : (
                    "Create Referral Incentive Account"
                  )}
                </button>
              </form>
            )}

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-start gap-3 text-slate-500 text-[11px] leading-relaxed font-mono">
              <Shield className="w-4.5 h-4.5 text-amber-500/70 shrink-0 mt-0.5" />
              <span>
                Enterprise security strictly enforced. This application operates under client-restricted Firestore Rules to secure financial ledgers.
              </span>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl w-full mx-auto px-6 py-6 text-center text-slate-600 text-xs font-mono border-t border-slate-900/60 z-10">
          © {new Date().getFullYear()} Deloxe Inc. All privileges protected. Unified Referral Incentive Registry.
        </footer>
      </div>
    );
  }

  // Multi-Step Partner Onboarding Wizard (Required if user has no partner profile document)
  if (!partner) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative overflow-hidden">
        {/* Utilities Rail */}
        <div className="w-full bg-[#080d1a] border-b border-slate-900/60 py-2.5 px-6 flex justify-between items-center text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>WIZARD GATEWAY: PROFILE NEEDED</span>
          </div>
          <div>{currentTime}</div>
        </div>

        {/* Main Content */}
        <main className="max-w-2xl w-full mx-auto px-6 py-12 z-10 flex-grow flex flex-col justify-center font-sans">
          {existingAccountError ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#080d1a] border border-red-500/30 rounded-2xl p-8 text-center max-w-md mx-auto shadow-2xl">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-3">Onboarding Blocked</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-mono">
                {existingAccountError}
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-bold hover:bg-slate-800 hover:border-slate-700 transition cursor-pointer font-mono"
              >
                Go back to Login
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-slate-900 border border-amber-500/20 rounded-xl flex items-center justify-center font-mono font-bold text-amber-400 text-xl shadow-lg shadow-amber-500/10 mx-auto mb-4">
                  DX
                </div>
                <h1 className="text-3xl font-display font-extrabold text-white">Referral Incentive Onboarding</h1>
                <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-widest">Complete registration to activate tracking slugs</p>
              </div>

              {/* Stepper Indicators */}
              <div className="grid grid-cols-4 gap-2 mb-10 text-center font-mono text-[10px]">
            {[
              { label: "INCENTIVE TYPE", step: 1 },
              { label: "PROFILE INFO", step: 2 },
              { label: "FINANCIALS", step: 3 },
              { label: "AGREEMENT", step: 4 }
            ].map((s) => (
              <div key={s.step} className="flex flex-col gap-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${onboardingStep >= s.step ? "bg-amber-500 shadow-sm shadow-amber-500/20" : "bg-slate-800"}`}></div>
                <span className={onboardingStep === s.step ? "text-amber-400 font-bold" : "text-slate-500"}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Wizard Card */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative">
            <form onSubmit={handleOnboardingSubmit} className="flex flex-col gap-6">
              {onboardingError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{onboardingError}</span>
                </div>
              )}

              {/* Step 1: Selection */}
              {onboardingStep === 1 && (() => {
                const configIndividual = getRewardConfig(obForm.country, "individual");
                const configCorporate = getRewardConfig(obForm.country, "corporate");
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                    <h3 className="font-display font-bold text-lg text-white">1. Select Structure</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-2">
                      Your allocation rate depends automatically on your structure and country. Choose your operating country below to see local currency rates.
                    </p>

                    {/* Country Selector */}
                    <div className="flex flex-col gap-1.5 mb-2 bg-[#050914] border border-slate-800 p-4 rounded-xl">
                      <label className="text-xs font-semibold text-slate-300">Country of Operation *</label>
                      <select
                        value={obForm.country}
                        onChange={(e) => setObForm({ ...obForm, country: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60 font-sans cursor-pointer"
                      >
                        <option value="Nigeria">Nigeria (₦ / NGN)</option>
                        <option value="United States">United States ($ / USD)</option>
                        <option value="United Kingdom">United Kingdom (£ / GBP)</option>
                        <option value="Europe">Europe (€ / EUR)</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setObForm({ ...obForm, partnerType: "individual" })}
                        className={`p-6 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          obForm.partnerType === "individual" 
                            ? "bg-amber-500/5 border-amber-500/60 shadow-lg shadow-amber-500/5" 
                            : "bg-slate-900/30 border-slate-800/80 hover:border-slate-700/80"
                        }`}
                      >
                        <User className={`w-6 h-6 ${obForm.partnerType === "individual" ? "text-amber-400" : "text-slate-400"}`} />
                        <span className="font-display font-bold text-sm text-slate-100">Individual Influencer</span>
                        <span className="text-[11px] text-slate-400 mt-1">Perfect for content creators, social agents, and independent referrers.</span>
                        <span className="text-xs font-mono text-amber-400 mt-3 font-semibold">
                          {configIndividual.symbol}{configIndividual.rate.toLocaleString()} per Verified Milestone
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setObForm({ ...obForm, partnerType: "corporate" })}
                        className={`p-6 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          obForm.partnerType === "corporate" 
                            ? "bg-amber-500/5 border-amber-500/60 shadow-lg shadow-amber-500/5" 
                            : "bg-slate-900/30 border-slate-800/80 hover:border-slate-700/80"
                        }`}
                      >
                        <Briefcase className={`w-6 h-6 ${obForm.partnerType === "corporate" ? "text-amber-400" : "text-slate-400"}`} />
                        <span className="font-display font-bold text-sm text-slate-100">Corporate Referral Incentive</span>
                        <span className="text-[11px] text-slate-400 mt-1">Tailored for HR agencies, talent consulting firms, and institutions.</span>
                        <span className="text-xs font-mono text-amber-400 mt-3 font-semibold">
                          {configCorporate.symbol}{configCorporate.rate.toLocaleString()} per Verified Milestone
                        </span>
                      </button>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Step 2: Profile Info */}
              {onboardingStep === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  <h3 className="font-display font-bold text-lg text-white">2. Profile & Identification</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-2">
                    Provide real contact details and social media anchors for account verification.
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-300">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={obForm.fullName}
                        onChange={(e) => setObForm({ ...obForm, fullName: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                        placeholder="John Doe"
                      />
                    </div>

                    {obForm.partnerType === "corporate" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1 sm:col-span-1">
                          <label className="text-xs font-semibold text-slate-300">Company Name *</label>
                          <input
                            type="text"
                            required
                            value={obForm.companyName}
                            onChange={(e) => setObForm({ ...obForm, companyName: e.target.value })}
                            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                            placeholder="Acme Talent Ltd"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-300">Rep. Name *</label>
                          <input
                            type="text"
                            required
                            value={obForm.representativeName}
                            onChange={(e) => setObForm({ ...obForm, representativeName: e.target.value })}
                            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                            placeholder="Alice Smith"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-300">Rep. Title *</label>
                          <input
                            type="text"
                            required
                            value={obForm.representativeTitle}
                            onChange={(e) => setObForm({ ...obForm, representativeTitle: e.target.value })}
                            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                            placeholder="Managing Director"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-400">Primary Contact Email *</label>
                        <input
                          type="email"
                          required
                          disabled
                          value={obForm.email}
                          className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                          placeholder="partner@example.com"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-300">Mobile Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={obForm.phone}
                          onChange={(e) => setObForm({ ...obForm, phone: e.target.value })}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                          placeholder="+234 80 1234 5678"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-300">Social Media Anchor/Handle *</label>
                      <input
                        type="text"
                        required
                        value={obForm.socialHandle}
                        onChange={(e) => setObForm({ ...obForm, socialHandle: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                        placeholder="e.g. linkedin.com/in/username or @twitter_handle"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Financials */}
              {onboardingStep === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  <h3 className="font-display font-bold text-lg text-white">3. Payout & Financial Routing</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-2">
                    Specify your preferred settlement bank and select your processing frequency preference.
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-300">Settlement Bank Name *</label>
                        <input
                          type="text"
                          required
                          value={obForm.bankName}
                          onChange={(e) => setObForm({ ...obForm, bankName: e.target.value })}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                          placeholder="e.g. Access Bank, GTBank"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-300">Account Number (10 digits) *</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={obForm.accountNumber}
                          onChange={(e) => setObForm({ ...obForm, accountNumber: e.target.value })}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono"
                          placeholder="0123456789"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-300">Account Name *</label>
                      <input
                        type="text"
                        required
                        value={obForm.accountName}
                        onChange={(e) => setObForm({ ...obForm, accountName: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                        placeholder="John Doe Enterprises"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Payout Settlement Frequency *</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <button
                          type="button"
                          onClick={() => setObForm({ ...obForm, payoutFrequency: "weekly" })}
                          className={`p-3.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            obForm.payoutFrequency === "weekly"
                              ? "bg-amber-500/10 border-amber-500/60 text-amber-400"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          <Calendar className="w-4 h-4" /> Weekly Settlement
                        </button>
                        <button
                          type="button"
                          onClick={() => setObForm({ ...obForm, payoutFrequency: "monthly" })}
                          className={`p-3.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            obForm.payoutFrequency === "monthly"
                              ? "bg-amber-500/10 border-amber-500/60 text-amber-400"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          <Calendar className="w-4 h-4" /> Monthly Settlement
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Digital Signature */}
              {onboardingStep === 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  <h3 className="font-display font-bold text-lg text-white">4. Referral Incentive Agreement & Sign-off</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-1">
                    Please read through the legal stipulations below and provide your digital signature authorization.
                  </p>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-40 overflow-y-auto text-[10px] text-slate-400 leading-relaxed font-mono">
                    <p className="font-bold text-amber-400 mb-2">DELOXE HR REFERRAL INCENTIVE AGREEMENT</p>
                    <p className="mb-2">1. SCOPE OF ENGAGEMENT: Referral incentive representative will act as an independent representative distributing approved tracking URLs to refer competent candidates.</p>
                    <p className="mb-2">2. CONVERSION AUDITING: All stats, clicks, and subsequent milestone payments are calculated exclusively by Deloxe’s backend. Self-calculations or client-side logs are non-binding.</p>
                    <p className="mb-2">3. REWARD CRITERIA: Conversion commissions trigger strictly upon candidate advancement to milestones. Rate schedules are assigned automatically (₦200 for individual structures, ₦500 for corporate representatives).</p>
                    <p>4. PRIVILEGE REVOCATION: Deloxe reserves the right to suspend any referral code found in violation of referral policies or executing malicious bot click traffic.</p>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <label className="flex items-start gap-2.5 text-slate-300 text-xs select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obForm.agreementAccepted}
                        onChange={(e) => setObForm({ ...obForm, agreementAccepted: e.target.checked })}
                        className="mt-0.5 accent-amber-500"
                      />
                      <span>I hereby accept and authorize the legal parameters, and acknowledge that all statistics calculations are administered strictly by Deloxe backend systems. *</span>
                    </label>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-300">Digital Signature (Type legal name to sign) *</label>
                      <input
                        type="text"
                        required
                        value={obForm.digitalSignature}
                        onChange={(e) => setObForm({ ...obForm, digitalSignature: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono italic"
                        placeholder={obForm.fullName || "Your Full Name"}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation controls */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/80">
                {onboardingStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingError("");
                      setOnboardingStep(prev => prev - 1);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {onboardingStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      // Mini step validations
                      if (onboardingStep === 2) {
                        if (!obForm.fullName || !obForm.phone || !obForm.email || !obForm.socialHandle) {
                          setOnboardingError("Please complete all profile details to continue.");
                          return;
                        }
                      }
                      if (onboardingStep === 3) {
                        if (!obForm.bankName || !obForm.accountName || !obForm.accountNumber) {
                          setOnboardingError("Please complete all financial routing inputs to continue.");
                          return;
                        }
                      }
                      setOnboardingError("");
                      setOnboardingStep(prev => prev + 1);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submittingOnboarding}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-600 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingOnboarding ? "Activating Portal..." : "Activate Referral Incentive Code"}
                  </button>
                )}
              </div>
            </form>
          </div>
          </>
          )}
        </main>
      </div>
    );
  }

  // Active Partner Dashboard View (Fully Authenticated and Profile Initialized)
  return (
    <div id="dashboard-root" className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Real-time System Rail */}
      <div className="w-full bg-[#080d1a] border-b border-slate-900/60 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono text-slate-500 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DELOXE STATE: SYNCHRONIZED</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>REFERRAL INCENTIVE ID: <span className="text-slate-400 font-bold">{partner.partnerDisplayId || ("DELXp" + partner.partnerId.slice(0, 4).toUpperCase())}</span></div>
          <span className="text-slate-700">|</span>
          <div className="hidden sm:inline">REWARD_RATE: <span className="text-amber-500 font-bold">{currencySymbol}{partner.rewardRate.toLocaleString()} / milestone</span></div>
        </div>
        
        {/* Dynamic ticking clock */}
        <div className="flex items-center gap-2">
          <span>{currentTime || "UTC CLOCK"}</span>
        </div>
      </div>

      {/* Header Panel */}
      <header className="bg-slate-900/40 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-950 border border-amber-500/20 rounded-lg flex items-center justify-center font-mono font-bold text-amber-400 text-base shadow-lg shadow-amber-500/5">
              DX
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base tracking-tight text-white leading-none">
                DELOXE HR
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-1">REFERRAL INCENTIVE HUB v1.2</span>
            </div>
          </div>

          {/* Nav / View Toggle */}
          <nav className="hidden md:flex items-center gap-1 bg-[#080d1a] border border-slate-800/80 rounded-xl p-1">
            {[
              { id: "dashboard", label: "Overview", icon: Grid },
              { id: "commissions", label: "Commissions", icon: DollarSign },
              { id: "payouts", label: "Payouts Ledger", icon: CreditCard },
              { id: "notifications", label: "Alerts", icon: Bell, count: notifications.filter(n => !n.read).length },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-amber-400 border border-slate-800/80 shadow-md"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Widget */}
          <div className="flex items-center gap-4">

            {/* User Details */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800/60">
              <div className="flex flex-col items-end text-right hidden sm:flex">
                <span className="text-xs font-bold text-slate-100 leading-none">{partner.fullName}</span>
                <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                  {partner.partnerType === "corporate" ? "Corporate Entity" : "Individual Referral Incentive"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400 uppercase">
                {partner.fullName[0]}
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Rail */}
        <div className="md:hidden w-full bg-[#080d1a] border-t border-slate-800/60 p-1 px-4 flex justify-between">
          {[
            { id: "dashboard", label: "Overview", icon: Grid },
            { id: "commissions", label: "Commissions", icon: DollarSign },
            { id: "payouts", label: "Payouts", icon: CreditCard },
            { id: "notifications", label: "Alerts", icon: Bell },
            { id: "settings", label: "Settings", icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 text-[10px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === tab.id ? "text-amber-400 font-bold" : "text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow">
        
        {/* Dashboard Title & Quick Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
              {activeTab === "dashboard" && "Workspace Hub"}
              {activeTab === "commissions" && "Conversion Records"}
              {activeTab === "payouts" && "Historic Distribution Ledgers"}
              {activeTab === "notifications" && "Operational Alerts"}
              {activeTab === "settings" && "Profile Configuration"}
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-mono">
              STATUS: <span className="text-emerald-400 font-bold uppercase">{partner.status}</span>
              <span className="mx-2 text-slate-700">|</span>
              CODE: <span className="text-amber-400 font-bold">{partner.referralCode}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Views Rendering */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              {/* Top Bento Layout: Referral URL Panel (Left) & QR Code (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Referral Link Manager */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[50px] pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Globe className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="font-display font-bold text-base text-white">Unique Referral Slug</h3>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Distribute this link. Any talent applying through this structured URL is automatically linked to your partner account, initializing the commission tracking process.
                    </p>
                  </div>

                  <div>
                    {/* URL Input Box */}
                    <div className="flex items-center gap-2 bg-[#050914] border border-slate-800 rounded-xl p-2.5 mb-3 font-mono text-xs text-slate-300">
                      <input
                        type="text"
                        readOnly
                        value={`https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`}
                        className="bg-transparent flex-grow focus:outline-none select-all font-mono"
                      />
                      <button
                        onClick={handleCopy}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCopied 
                            ? "bg-emerald-500 text-slate-950 font-bold" 
                            : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px] font-bold">{isCopied ? "COPIED" : "COPY"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <Info className="w-3.5 h-3.5 text-amber-500/70" />
                      <span>Tracking Slug matches: /?ref={partner.referralCode}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Card */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between items-center text-center">
                  <div className="absolute top-0 left-0 w-[100px] h-[100px] bg-emerald-500/5 rounded-full blur-[45px] pointer-events-none"></div>
                  
                  <div className="w-full">
                    <h3 className="font-display font-bold text-sm text-slate-100">Scan & Refer</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Direct visual link scan</p>
                  </div>

                  {/* Dynamic clean QR Code via api.qrserver.com */}
                  <div className="w-32 h-32 bg-[#050914] rounded-xl border border-slate-800/80 flex items-center justify-center p-2 relative my-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=f59e0b&bgcolor=050914&data=${encodeURIComponent(
                        `https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`
                      )}`}
                      alt="Referral QR Code" 
                      className="w-full h-full rounded"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-amber-400/80 font-bold tracking-widest">{partner.referralCode}</span>
                </div>
              </div>

              {/* Bento Grid Analytics Row (Strictly mapped from stats, NO local additions allowed) */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  { label: "Total Clicks", value: stats?.totalClicks ?? 0, icon: Globe, color: "text-blue-400" },
                  { label: "Verified Purchases", value: stats?.totalPurchases ?? 0, icon: UserCheck, color: "text-amber-400" },
                  { label: "Total Earned", value: stats ? `${currencySymbol}${stats.totalCommission.toLocaleString()}` : `${currencySymbol}0`, icon: Award, color: "text-emerald-400" },
                  { label: "Available Balance", value: stats ? `${currencySymbol}${stats.balance.toLocaleString()}` : `${currencySymbol}0`, icon: DollarSign, color: "text-teal-400 font-extrabold" },
                  { label: "Payout Frequency", value: partner.payoutFrequency, icon: Calendar, color: "text-purple-400 uppercase text-xs" },
                  { label: "Next Payout Date", value: stats?.nextPayout ? formatDate(stats.nextPayout) : "TBD", icon: ClockIcon, color: "text-pink-400" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[10px] font-mono tracking-wider uppercase leading-tight">{item.label}</span>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className={`text-xl font-display font-extrabold ${item.color} tracking-tight mt-2 truncate`}>
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Commissions Overview Snippet */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
                  <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>Recent Activity Stream</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab("commissions")}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    <span>Full Ledger</span> <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="divide-y divide-slate-800/80">
                  {dbLoading ? (
                    <div className="p-8 text-center text-slate-500 font-mono text-xs">Accessing datastore...</div>
                  ) : commissions.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 text-xs leading-relaxed">
                      No active commission metrics recorded yet.<br />
                      <span className="text-[10px] mt-1 text-slate-600 block">Once applications progress under your code, logs will appear.</span>
                    </div>
                  ) : (
                    commissions.slice(0, 2).map((comm) => (
                      <div key={comm.commissionId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/10 transition-all">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono text-slate-500">{comm.transactionId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                              comm.payoutStatus === "paid" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : comm.payoutStatus === "processing"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              {comm.payoutStatus}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-200">{comm.email}</span>
                          <span className="text-[10px] font-mono text-slate-500">Milestone Completed At: {formatDate(comm.createdAt)}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-500 text-[10px] font-mono block">COMMISSION</span>
                          <span className="text-base font-mono font-bold text-emerald-400">{currencySymbol}{comm.commissionAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Commissions Tab */}
          {activeTab === "commissions" && (
            <motion.div 
              key="commissions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-900/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">Commission Ledger</h3>
                  <p className="text-xs text-slate-400 mt-1">Audit verified referral conversions and their payouts status</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                      <th className="p-4 pl-6">Transaction ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Total Value</th>
                      <th className="p-4">My Commission</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6">Recorded Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {dbLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">Syncing database registers...</td>
                      </tr>
                    ) : commissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 leading-relaxed font-mono">
                          No conversion commissions on record.<br />
                          <span className="text-[10px] mt-1 text-slate-600 block">Commission records appear upon processing of verified conversions.</span>
                        </td>
                      </tr>
                    ) : (
                      commissions.map((comm) => (
                        <tr key={comm.commissionId} className="hover:bg-slate-900/10 transition-all font-mono">
                          <td className="p-4 pl-6 text-slate-400">{comm.transactionId}</td>
                          <td className="p-4 font-sans text-slate-200">{comm.email}</td>
                          <td className="p-4 text-slate-300">{currencySymbol}{comm.amountPaid.toLocaleString()}</td>
                          <td className="p-4 text-emerald-400 font-bold">{currencySymbol}{comm.commissionAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider ${
                              comm.payoutStatus === "paid" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : comm.payoutStatus === "processing"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              {comm.payoutStatus}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-slate-400">{formatDate(comm.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Payouts Tab */}
          {activeTab === "payouts" && (
            <motion.div 
              key="payouts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-900/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">Payout Settlement Ledger</h3>
                  <p className="text-xs text-slate-400 mt-1">Audit bank clearing dates and unique references for distributed funds</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                      <th className="p-4 pl-6">Reference ID</th>
                      <th className="p-4">Period Start</th>
                      <th className="p-4">Period End</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6">Payment Cleared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {dbLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">Querying financial databases...</td>
                      </tr>
                    ) : payouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 leading-relaxed font-mono">
                          No distributions recorded.<br />
                          <span className="text-[10px] mt-1 text-slate-600 block">Payout records appear upon processing of verified conversions.</span>
                        </td>
                      </tr>
                    ) : (
                      payouts.map((pay) => (
                        <tr key={pay.payoutId} className="hover:bg-slate-900/10 transition-all font-mono">
                          <td className="p-4 pl-6 text-slate-200 font-bold">{pay.paymentReference}</td>
                          <td className="p-4 text-slate-400">{formatDate(pay.periodStart)}</td>
                          <td className="p-4 text-slate-400">{formatDate(pay.periodEnd)}</td>
                          <td className="p-4 text-emerald-400 font-bold">{currencySymbol}{pay.totalAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider ${
                              pay.status === "completed" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : pay.status === "failed"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-slate-300">{formatDate(pay.paidAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex justify-between items-center bg-slate-900/20">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">Operational Notices</h3>
                  <p className="text-xs text-slate-400 mt-1">Read alerts about commission payouts and conversion audits</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {dbLoading ? (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs">Querying alerts registry...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 text-xs leading-relaxed border border-slate-800/40 bg-slate-900/10 rounded-2xl font-mono">
                    Notification tray is empty.<br />
                    <span className="text-[10px] mt-1 text-slate-600 block">Status updates from administrative audits appear here.</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.notificationId} 
                      className={`p-5 rounded-2xl border transition-all flex justify-between items-start gap-4 ${
                        notif.read 
                          ? "bg-slate-900/20 border-slate-800/60 opacity-65" 
                          : "bg-slate-900/50 border-slate-800/80 shadow-md"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${notif.read ? "bg-slate-950 text-slate-600" : "bg-amber-500/10 text-amber-400"}`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm ${notif.read ? "text-slate-400" : "text-white"}`}>{notif.title}</h4>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] font-mono text-slate-600 mt-2 block">{formatDateTime(notif.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleRead(notif.notificationId, notif.read)}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-all cursor-pointer ${
                          notif.read 
                            ? "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300" 
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                        }`}
                      >
                        {notif.read ? "Mark Unread" : "Mark Read"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Profile Config Form */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-xl">
                <h3 className="font-display font-bold text-base text-slate-100 mb-2">Edit Preferences</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">Update your contact profile and financial routing records instantly. All writes adhere strictly to security filters.</p>

                <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5">
                  {editError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono">
                      {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono">
                      {editSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Contact Email *</label>
                      <input
                        type="email"
                        required
                        disabled
                        value={editForm.email}
                        className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {partner.partnerType === "corporate" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-400">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-400">Representative Name *</label>
                        <input
                          type="text"
                          required
                          value={editForm.representativeName}
                          onChange={(e) => setEditForm({ ...editForm, representativeName: e.target.value })}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-400">Representative Title *</label>
                        <input
                          type="text"
                          required
                          value={editForm.representativeTitle}
                          onChange={(e) => setEditForm({ ...editForm, representativeTitle: e.target.value })}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Social Media handle *</label>
                      <input
                        type="text"
                        required
                        value={editForm.socialHandle}
                        onChange={(e) => setEditForm({ ...editForm, socialHandle: e.target.value })}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 flex flex-col gap-4">
                    <h4 className="font-display font-semibold text-xs text-slate-300">Financial Settlements Routing</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-400 font-mono">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={editForm.bankName}
                          onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                          className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/60"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-400 font-mono">Account Number</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={editForm.accountNumber}
                          onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                          className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-slate-400 font-mono">Account Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.accountName}
                        onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value })}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/60"
                      />
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      <label className="text-[10px] font-semibold text-slate-400 font-mono">Payout Settlement Frequency</label>
                      <div className="grid grid-cols-2 gap-3 mt-1 font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, payoutFrequency: "weekly" })}
                          className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            editForm.payoutFrequency === "weekly"
                              ? "bg-amber-500/10 border-amber-500/60 text-amber-400"
                              : "bg-slate-950 border-slate-800 text-slate-500"
                          }`}
                        >
                          WEEKLY
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, payoutFrequency: "monthly" })}
                          className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            editForm.payoutFrequency === "monthly"
                              ? "bg-amber-500/10 border-amber-500/60 text-amber-400"
                              : "bg-slate-950 border-slate-800 text-slate-500"
                          }`}
                        >
                          MONTHLY
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={editLoading}
                    className="w-fit px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-bold text-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {editLoading ? "Saving Updates..." : "Save Preferences"}
                  </button>
                </form>
              </div>

              {/* Immutable Security Parameters Card */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 text-rose-400">
                    <Lock className="w-4.5 h-4.5" />
                    <h3 className="font-display font-bold text-sm text-slate-100">Locked Ledger Profiles</h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    To maintain transactional auditing safety and prevent privilege fraud, the following parameters are strictly read-only and locked at the database rule layer.
                  </p>

                  <div className="flex flex-col gap-3 font-mono text-[11px] text-slate-400">
                    {[
                      { label: "Referral Incentive ID", value: partner.partnerDisplayId || ("DELXp" + partner.partnerId.slice(0, 4).toUpperCase()) },
                      { label: "Auth UID", value: `${partner.partnerId.slice(0, 8)}...` },
                      { label: "Profile Structure", value: partner.partnerType.toUpperCase() },
                      { label: "Reward Rate Allocation", value: `${currencySymbol}${partner.rewardRate.toLocaleString()} / Verified Milestone` },
                      { label: "Referral Upper Code", value: partner.referralCode },
                      { label: "Agreement Signature", value: "ACCEPTED" },
                      { label: "Signed DateTime", value: formatDate(partner.agreementSignedAt) }
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] uppercase">{item.label}</span>
                        <span className="font-semibold text-slate-300 tracking-tight">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 flex items-start gap-2.5 text-slate-500 text-[10px] leading-relaxed font-mono">
                  <Shield className="w-4.5 h-4.5 text-amber-500/70 shrink-0 mt-0.5" />
                  <span>These parameters are cryptographically secured and managed directly by the ledger protocol. Client modifications are rejected.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-600 py-6 text-center text-xs font-mono border-t border-slate-900/60 mt-16 z-10">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} Deloxe Inc. Unified Referral Incentive Security Registry.</span>
          <span>Secured via Deloxe Private Ledger & Cryptographic Protocol.</span>
        </div>
      </footer>
    </div>
  );
}

// Clock icon simple inline implementation to avoid lucide imports conflicts
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
