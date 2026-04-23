import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ArrowRight, Clock } from "lucide-react";

interface Props {
  onInvest: () => void;
  onSkip: () => void;
}

export default function ChoiceScene({ onInvest, onSkip }: Props) {
  const [hovered, setHovered] = useState<"invest" | "skip" | null>(null);
  const [chosen, setChosen] = useState<"invest" | "skip" | null>(null);

  const pick = (side: "invest" | "skip") => {
    setChosen(side);
    setTimeout(() => side === "invest" ? onInvest() : onSkip(), 900);
  };

  const investActive = hovered === "invest" || chosen === "invest";
  const skipActive = hovered === "skip" || chosen === "skip";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#1a5490 1px, transparent 1px), linear-gradient(90deg, #1a5490 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1a5490] via-[#3b82f6] to-[#1a5490]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center gap-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-[10px] uppercase tracking-[8px] text-[#1a5490] font-black opacity-70">60th Diamond Jubilee</div>
          <h2 className="text-3xl md:text-4xl font-serif italic text-gray-900">Choosing the Legacy</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">Your decision today shapes the next 60 years of HEKAN's mission.</p>
        </div>

        {/* Choice cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

          {/* Invest */}
          <motion.button
            onMouseEnter={() => setHovered("invest")} onMouseLeave={() => setHovered(null)}
            onClick={() => pick("invest")}
            animate={{ scale: chosen === "skip" ? 0.96 : chosen === "invest" ? 1.02 : 1, opacity: chosen === "skip" ? 0.4 : 1 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-2xl border-2 p-6 text-left cursor-pointer"
            style={{
              borderColor: investActive ? "#1a5490" : "#e5e7eb",
              background: investActive ? "linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)" : "white",
              boxShadow: investActive ? "0 8px 32px rgba(26,84,144,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: investActive ? "#1a5490" : "transparent", transition: "background 0.3s" }} />

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl flex-shrink-0"
                style={{ background: investActive ? "#1a5490" : "#eff6ff", transition: "background 0.3s" }}>
                <Heart size={20} style={{ color: investActive ? "white" : "#1a5490", transition: "color 0.3s" }} />
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-900 text-base mb-1">Invest in the Legacy</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Support the National Secretariat, medical clinics, and schools. Your gift powers the next chapter of HEKAN's mission.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {["Secretariat", "Clinics", "Schools"].map(tag => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1a5490]">{tag}</span>
                ))}
              </div>
              <motion.div animate={{ x: hovered === "invest" ? 4 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight size={16} className="text-[#1a5490]" />
              </motion.div>
            </div>

            <AnimatePresence>
              {chosen === "invest" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#1a5490] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Skip */}
          <motion.button
            onMouseEnter={() => setHovered("skip")} onMouseLeave={() => setHovered(null)}
            onClick={() => pick("skip")}
            animate={{ scale: chosen === "invest" ? 0.96 : chosen === "skip" ? 1.02 : 1, opacity: chosen === "invest" ? 0.4 : 1 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-2xl border-2 p-6 text-left cursor-pointer"
            style={{
              borderColor: skipActive ? "#9ca3af" : "#e5e7eb",
              background: skipActive ? "#f9fafb" : "white",
              boxShadow: skipActive ? "0 8px 32px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: skipActive ? "#9ca3af" : "transparent", transition: "background 0.3s" }} />

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl flex-shrink-0"
                style={{ background: skipActive ? "#6b7280" : "#f3f4f6", transition: "background 0.3s" }}>
                <Clock size={20} style={{ color: skipActive ? "white" : "#6b7280", transition: "color 0.3s" }} />
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-600 text-base mb-1">Not Right Now</div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Continue to the convention portal. You can always give later from the Giving section.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <motion.div animate={{ x: hovered === "skip" ? 4 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight size={16} className="text-gray-400" />
              </motion.div>
            </div>

            <AnimatePresence>
              {chosen === "skip" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <p className="text-[10px] text-gray-300 uppercase tracking-widest">
          HEKAN 60th Annual National Convention · April 7–12, 2026 · Kaduna
        </p>
      </motion.div>

      {/* Fade transition on pick */}
      <AnimatePresence>
        {chosen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: chosen === "invest" ? "rgba(239,246,255,0.85)" : "rgba(249,250,251,0.85)" }} />
        )}
      </AnimatePresence>
    </div>
  );
}
