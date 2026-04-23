/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Volume2, VolumeX, Play, Copy, Check, X } from "lucide-react";
import DiamondScene from "./components/DiamondScene";
import MagneticCursor from "./components/MagneticCursor";
import Portal from "./components/Portal";
import ChoiceScene from "./components/ChoiceScene";
import { IntroSkeleton } from "./components/Skeleton";

const SCENE_DURATION = 10000; // fallback — individual durations override this

// Per-scene durations in ms (index matches scenes array, scene 9 = ∞/paused)
const SCENE_DURATIONS = [
  5000,  // 1 — Logo
  5000,  // 2 — 60th Title
  5000,  // 3 — Date & Venue
  7000,  // 4 — Chief Host
  7000,  // 5 — Speakers
  5000,  // 6 — Theme
  6000,  // 7 — Legacy Vision
  6000,  // 8 — Health Mission
  6000,  // 9 — Education
  0,     // 10 — Choosing the Legacy (∞ — paused, user must choose)
  10000, // 11 — Enter Portal
];

export default function App() {
  // Intro always restarts from the beginning on refresh
  const [currentScene, setCurrentScene] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Portal state persists across refreshes so the user lands back where they were
  const [isPortalActive, setIsPortalActive] = useState(() => {
    return localStorage.getItem("hekan_is_portal_active") === "true";
  });

  useEffect(() => {
    localStorage.setItem("hekan_is_portal_active", isPortalActive.toString());
  }, [isPortalActive]);
  const [copySuccess, setCopySuccess] = useState(false);

  const bankDetails = {
    accountName: "UNITED CHURCH OF CHRIST HEKAN DEVELOPMENT FORUM",
    accountNumber: "2032912368",
    bank: "FIRST BANK"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const scenes = [
    {
      id: 1,
      title: "Logo",
      content: (
        <div className="flex flex-col items-center text-center space-y-4 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-center"
          >
            <div className="text-[10px] md:text-[14px] font-serif tracking-[4px] uppercase text-[#1a5490] mb-2">The United Church of Christ in Nigeria</div>
            <div className="text-6xl md:text-8xl font-black tracking-[8px] logo-acronym-gradient">HEKAN</div>
            <div className="text-[10px] md:text-[12px] text-gray-500 italic mt-2">Hadaddiyar Ekklesiyar Kristi A Nigeria</div>
          </motion.div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 2,
      title: "60th Title",
      content: (
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "1em" }}
            animate={{ opacity: 1, letterSpacing: "8px" }}
            transition={{ duration: 2.5 }}
            className="text-[#1a5490] font-serif text-lg md:text-xl uppercase"
          >
            ◆ Diamond Jubilee ◆
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 3, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            className="text-8xl md:text-[140px] font-black leading-none text-artistic-diamond text-glow-diamond"
          >
            60th
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-sm md:text-base uppercase tracking-[3px] text-gray-500"
          >
            Annual National Convention
          </motion.p>
          <div className="w-[100px] h-px bg-[#1a5490]/50 my-4" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="text-xs md:text-sm text-[#1a5490] uppercase tracking-[1px]"
          >
            Anniversary & Ordination Service
          </motion.p>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1548625361-195fe01823fe?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 3,
      title: "Date & Venue",
      content: (
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="info-group-border pl-4 text-left border-l-2 border-[#1a5490]"
          >
            <span className="text-[10px] uppercase tracking-[2px] text-[#1a5490] block mb-2 font-black">Date & Venue</span>
            <h2 className="text-3xl md:text-5xl font-bold text-artistic-diamond mb-2">7th – 12th April, 2026</h2>
            <div className="text-base md:text-lg text-gray-500 italic">
              HEKAN Centre, Kaduna<br />
              No. 4/6 Katsina Road, Off Independence Way
            </div>
          </motion.div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1601247483531-41bcd22409f5?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 4,
      title: "Chief Host",
      content: (
        <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl px-6">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-shrink-0"
          >
            <div className="w-36 h-44 md:w-48 md:h-60 rounded-2xl overflow-hidden border-4 border-white/80 shadow-2xl">
              <img
                src="/president.jpg"
                alt="Rev. (Dr.) Amos G. Kiri"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </motion.div>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="info-group-border pl-6 text-left border-l-2 border-[#1a5490]"
          >
            <span className="text-[10px] uppercase tracking-[2px] text-[#1a5490] block mb-2 font-black">Chief Host</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">Rev. (Dr.) Amos G. Kiri</h2>
            <div className="text-sm md:text-base text-gray-500">President, HEKAN</div>
            <div className="text-sm md:text-base text-[#1a5490] italic mt-2">Valedictory Address</div>
          </motion.div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 5,
      title: "Speakers",
      content: (
        <div className="w-full max-w-6xl px-4 md:px-8 space-y-6">
          {/* Guest Speaker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5 info-group-border pl-5 border-l-2 border-[#1a5490]"
          >
            <div className="w-14 h-16 md:w-16 md:h-20 rounded-xl overflow-hidden border-2 border-[#1a5490]/30 flex-shrink-0 shadow-md">
              <img src="/dr isaiah.jpg" alt="Rev. Dr. Isaiah Jirape Magaji"
                className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[2px] text-[#1a5490] block mb-1 font-black">Guest Speaker</span>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">Rev. Dr. Isaiah Jirape Magaji</h2>
              <div className="text-sm text-gray-500">President, CRC-N</div>
            </div>
          </motion.div>

          {/* Guest Teachers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-l-2 border-[#1a5490]/30 pl-5"
          >
            <span className="text-[10px] uppercase tracking-[2px] text-[#1a5490] block mb-3 font-black">Guest Teachers</span>
            <div className="flex flex-wrap gap-4">
              {[
                { img: '/dr enoch.jpg', name: 'Rev. Dr. Enoch Adamu', detail: 'Regional Trauma Lead, Africa Services' },
                { img: '/dr abdulra.jpg', name: "Dr. Abdulra'uf Aliyu", detail: 'Senior Policy Advisor, ACTG' },
                { img: '/samuel yahaya.jpg', name: 'Evang. Samuel Yahaya', detail: 'Glorious Mission' },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={t.img} alt={t.name}
                      className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 leading-tight">{t.name}</div>
                    <div className="text-[10px] text-gray-500">{t.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1544427928-c49cdfebf494?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 6,
      title: "Theme",
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] uppercase tracking-[2px] text-[#1a5490] font-black"
          >
            Theme / Galatians 3:28
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="text-5xl md:text-8xl font-serif italic text-artistic-diamond leading-tight"
          >
            "We Are One In Christ"
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1 }}
            className="text-lg md:text-2xl text-gray-500 italic"
          >
            Mu Daya Ne Cikin Kristi
          </motion.div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 7,
      title: "Legacy Vision",
      content: (
        <div className="flex flex-col items-center text-center max-w-4xl px-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="info-group-border pl-6 text-left border-l-2 border-[#1a5490]"
          >
            <span className="text-[10px] uppercase tracking-[2px] text-[#1a5490] block mb-2 font-black">Legacy Project</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">The National Secretariat</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
              A towering reality and testament to unwavering generosity. We are making a final push for the grand dedication in September 2026.
            </p>
          </motion.div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 8,
      title: "Health Mission",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl px-8 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="info-group-border pl-6 text-left border-l-2 border-[#1a5490]"
            >
              <span className="text-[10px] uppercase tracking-[2px] text-[#1a5490] block mb-2 font-black">Medical Missions</span>
              <h2 className="text-4xl md:text-6xl font-black text-artistic-diamond">Healing All</h2>
            </motion.div>
            <p className="text-sm text-gray-500 leading-relaxed italic">
              Expanding our network of rural clinics across Taraba, Niger, and Kaduna states to bring relief to marginalized communities.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["National Secretariat Clinic", "Gampu Clinic", "Leapu Clinic", "Makau Sale"].map((location, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="p-4 border border-gray-200 bg-gray-50 rounded-xl text-xs text-[#1a5490] uppercase tracking-wider font-bold"
              >
                • {location}
              </motion.div>
            ))}
          </div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 9,
      title: "Education",
      content: (
        <div className="flex flex-col items-center text-center max-w-5xl px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-5xl md:text-7xl font-serif text-gray-900 uppercase italic tracking-[4px]">Knowledge & Faith</h2>
            <div className="h-px w-40 bg-[#1a5490] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              { title: "AMBI", detail: "Theological Excellence" },
              { title: "Online Center", detail: "Global Reach" },
              { title: "Basic Schools", detail: "Foundation for Youth" }
            ].map((item, i) => (
              <div key={i} className="p-6 border border-gray-200 space-y-2 bg-white rounded-xl shadow-sm">
                <div className="text-xl font-bold text-[#1a5490]">{item.title}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 10,
      title: "Fundraising",
      content: (
        <div className="flex items-center justify-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest">Choose your path below</p>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: 11,
      title: "Enter",
      content: (
        <div className="flex flex-col items-center text-center space-y-12">
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-serif text-artistic-diamond"
            >
              Welcome to the Portal
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="text-sm md:text-base uppercase tracking-[3px] text-gray-600"
            >
              60th Annual National Convention — Diamond Jubilee
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="px-10 py-4 border border-[#1a5490] text-[#1a5490] uppercase tracking-[3px] text-sm font-bold hover:bg-[#1a5490] hover:text-[#ffffff] transition-all duration-300"
            onClick={() => setIsPortalActive(true)}
          >
            Enter Convention Portal →
          </motion.button>
        </div>
      ),
      bg: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2000"
    }
  ];

  useEffect(() => {
    // Clean up any stale intro-related keys from previous sessions
    localStorage.removeItem("hekan_current_scene");
    localStorage.removeItem("hekan_is_started");

    setIsLoaded(true);
    const timer = setTimeout(() => setIsStarted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isStarted || isDonationModalOpen || currentScene === 9) return;

    const duration = SCENE_DURATIONS[currentScene] ?? SCENE_DURATION;
    if (!duration) return; // 0 = paused (shouldn't reach here due to scene 9 check above)

    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(prev => prev + 1);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentScene, isStarted, isDonationModalOpen, scenes.length]);

  return (
    <div className="h-screen w-full bg-white relative flex items-center justify-center overflow-hidden cursor-default font-sans selection:bg-[#1a5490] selection:text-white">
      <div className="absolute inset-0 z-40 pointer-events-none scanlines opacity-20" />

      <DiamondScene
        currentScene={currentScene}
        isStarted={isStarted}
        onEnter={() => setIsPortalActive(true)}
        onInvest={() => setIsDonationModalOpen(true)}
      />

      <AnimatePresence>
        {isPortalActive && (
          <Portal
            onBack={() => setIsPortalActive(false)}
            onInvest={() => {
              setIsPortalActive(false);
              setIsDonationModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Choice Scene — rendered as full-screen overlay when on scene 10 */}
      <AnimatePresence>
        {isStarted && currentScene === 9 && !isPortalActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[150]"
          >
            <ChoiceScene
              onInvest={() => {
                setIsDonationModalOpen(true);
              }}
              onSkip={() => {
                setCurrentScene(prev => Math.min(prev + 1, scenes.length - 1));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <MagneticCursor />

      {/* Donation Modal */}
      <AnimatePresence>
        {isDonationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-xl bg-white border border-gray-200 p-8 md:p-10 relative shadow-2xl rounded-2xl"
            >
              <button
                onClick={() => setIsDonationModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={22} />
              </button>

              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs uppercase tracking-[6px] text-[#1a5490] font-black">Development Investment</span>
                  <h3 className="text-3xl md:text-4xl font-serif text-gray-900 italic tracking-tight">Support Our Legacy</h3>
                  <div className="h-px w-16 bg-[#1a5490]/20 mx-auto" />
                </div>

                <div className="space-y-3">
                  <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                    <div className="text-[10px] text-[#1a5490] uppercase tracking-[2px] font-black mb-1.5">Account Name</div>
                    <div className="text-sm font-bold text-gray-900 uppercase leading-tight font-serif tracking-wide">{bankDetails.accountName}</div>
                  </div>

                  <div className="p-4 border border-gray-200 bg-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-[#1a5490]/40 transition-all shadow-sm">
                    <div className="text-center md:text-left">
                      <div className="text-[10px] text-[#1a5490] uppercase tracking-[2px] font-black mb-1">Account Number</div>
                      <div className="text-2xl font-black text-gray-900 tracking-[4px] group-hover:text-[#1a5490] transition-colors">{bankDetails.accountNumber}</div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-5 py-2.5 border border-[#1a5490]/40 text-[#1a5490] text-[10px] font-black uppercase tracking-[3px] hover:bg-[#1a5490] hover:text-white transition-all active:scale-95 rounded-lg"
                    >
                      {copySuccess ? <Check size={14} className="animate-bounce" /> : <Copy size={14} />}
                      {copySuccess ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                    <div className="text-[10px] text-[#1a5490] uppercase tracking-[2px] font-black mb-1">Bank Name</div>
                    <div className="text-lg font-black text-gray-900 uppercase font-sans">{bankDetails.bank}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDonationModalOpen(false);
                    setIsPortalActive(true);
                  }}
                  className="w-full py-4 bg-[#1a5490] text-white uppercase tracking-[4px] text-[10px] font-black hover:bg-[#154070] transition-all rounded-xl"
                >
                  Continue to Event Portal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro skeleton — shows while page loads */}
      <div
        className="fixed inset-0 z-[100] transition-all duration-[1500ms] ease-in-out"
        style={{
          opacity: isStarted ? 0 : 1,
          pointerEvents: isStarted ? 'none' : 'auto',
          visibility: isStarted ? 'hidden' : 'visible',
          transform: isStarted ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        <IntroSkeleton />
      </div>

      <div
        className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-[2000ms] ease-in-out"
        style={{ opacity: isStarted ? 1 : 0, pointerEvents: isStarted ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 z-20 pointer-events-none cinematic-overlay" />
        <div className="absolute inset-0 z-30 opacity-[0.02] pointer-events-none" />

        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {scenes[currentScene] && (
              <motion.div
                key={`bg-${scenes[currentScene].id}`}
                initial={{ opacity: 0, scale: 1.2, filter: 'blur(40px)' }}
                animate={{ opacity: 0.15, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(40px)' }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <img
                  src={scenes[currentScene].bg}
                  alt=""
                  className="w-full h-full object-cover grayscale brightness-110 contrast-90 opacity-30"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <main className="relative z-[35] w-full flex items-center justify-center min-h-[60vh]">
          <AnimatePresence mode="wait">
            {scenes[currentScene] && (
              <motion.div
                key={`content-${scenes[currentScene].id}`}
                initial={{ opacity: 0, filter: "blur(20px)", y: 40 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(20px)", y: -40 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full"
              >
                {scenes[currentScene].content}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <div className="absolute top-10 right-10 z-[60] flex items-center gap-6">
          <button
            onClick={() => setCurrentScene(scenes.length - 1)}
            className="text-gray-500 hover:text-[#1a5490] uppercase tracking-[6px] text-[10px] py-1 transition-all border-b border-transparent hover:border-[#1a5490]/50 font-black"
          >
            Skip Intro
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/80 rounded-full border border-gray-200 text-gray-400 hover:text-[#1a5490] transition-all shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-[60] flex justify-center items-center gap-3">
          {scenes.map((_, i) => (
            <div
              key={i}
              className={`h-[2px] rounded-full transition-all duration-700 ${i === currentScene ? "w-16 bg-[#1a5490]" : "w-4 bg-gray-300 hover:bg-gray-400 cursor-pointer"
                }`}
              onClick={() => setCurrentScene(i)}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 h-[2px] bg-gray-100 w-full z-[60]">
          {currentScene !== 9 && (
            <motion.div
              key={`meter-${currentScene}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: (SCENE_DURATIONS[currentScene] ?? SCENE_DURATION) / 1000, ease: "linear" }}
              className="h-full bg-[#1a5490]/50 origin-left"
            />
          )}
        </div>
      </div>
    </div>
  );
}
