/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, MapPin, Heart, Users, ChevronRight, Clock,
  Image as ImageIcon, ExternalLink, BarChart3, Home,
  CheckCircle2, ChevronDown, Copy, X, ZoomIn,
} from "lucide-react";
import RegistrantsView from "./RegistrantsView";
import AnalyticsView from "./AnalyticsView";
import HomeView from "./HomeView";

interface PortalProps {
  onBack: () => void;
  onInvest: () => void;
}

// ── Schedule data from 60th Convention Programme ──────────────────────────────
const DAYS = [
  {
    date: "April 7", day: "Tuesday", label: "Opening Day",
    color: "#1a5490", highlight: true,
    events: [
      {
        time: "9:00 AM", title: "Opening Ceremony & Commemorative Lecture",
        host: "Rev. (Dr.) Amos G. Kiri — President, HEKAN",
        type: "Opening",
        detail: "The 60th Annual National Convention opens with a commemorative lecture delivered by the President, Rev. (Dr.) Amos G. Kiri. This valedictory address marks his final convention as President before retirement. Theme: \"We Are One In Christ\" (Galatians 3:28).",
      },
      {
        time: "2:00 PM", title: "Anniversary Lecture — A United Christian Family",
        host: "Rev. (Dr.) Amos G. Kiri",
        type: "Teaching",
        detail: "Topic: \"A United Christian Family: Key to Stable Church and Society\" — exploring how family unity forms the foundation of a stable church and society, drawing from Genesis 25:19ff (Isaac's family).",
      },
    ],
  },
  {
    date: "April 8", day: "Wednesday", label: "Teaching Day",
    color: "#6366f1", highlight: false,
    events: [
      {
        time: "9:00 AM", title: "Coping with Stress & Trauma",
        host: "Rev. Dr. Enoch Adamu — Regional Trauma Lead, Africa Services",
        type: "Teaching",
        detail: "Topic: \"Coping with Stress and Trauma in the Face of Severe Banditry and Terrorism\" (Isaiah 61:1-4; 1 Kings 19:1-18; Luke 4:18-19). A biblically grounded, pastorally sensitive call to awareness and action for the Nigerian Church.",
      },
      {
        time: "2:00 PM", title: "Youth Empowerment Summit",
        host: "HEKAN Youth Council",
        type: "Conference",
        detail: "A dedicated session for the youth of HEKAN — addressing discipleship, the 222 Discipleship Programme, and equipping the next generation of church leaders.",
      },
    ],
  },
  {
    date: "April 9", day: "Thursday", label: "Mission Day",
    color: "#10b981", highlight: false,
    events: [
      {
        time: "9:00 AM", title: "Tax Reforms & the Church",
        host: "Dr. Abdulra'uf Aliyu — Senior Policy Advisor, ACTG",
        type: "Teaching",
        detail: "Topic: Implications of Nigeria's 2025 Tax Reforms for the Church — examining the Nigeria Tax Act (NTA), Nigeria Tax Administration Act (NTAA), Nigeria Revenue Service (NRS) Act, and Joint Revenue Board (JRB) Reform Act and their impact on church finances and civic responsibility.",
      },
      {
        time: "2:00 PM", title: "Medical Missions Impact Showcase",
        host: "HEKAN Medical Missions Team",
        type: "Mission",
        detail: "Showcasing the network of clinics established through partnerships with Ark Christian Aid Ministry (ACAM) and Sunlight Community Church, Florida, USA — including the National Secretariat Clinic, Gampu Clinic (Taraba), Leapu & SabonGarin DanAuta (Niger State), and Nassarawa Rogo, Maigero, Makau Sale (Kaduna State).",
      },
    ],
  },
  {
    date: "April 10", day: "Friday", label: "Devotion Day",
    color: "#f59e0b", highlight: false,
    events: [
      {
        time: "8:00 AM", title: "Synod Prayer Breakfast",
        host: "Council of Elders & GCC",
        type: "Devotion",
        detail: "A sacred morning of corporate prayer and intercession for the nation, the church, and the 60 years of God's faithfulness to HEKAN.",
      },
      {
        time: "10:00 AM", title: "Guest Speaker Session",
        host: "Rev. Dr. Isaiah Jirape Magaji — President, CRC-N",
        type: "Teaching",
        detail: "The guest speaker, Rev. Dr. Isaiah Jirape Magaji (President, CRC-N), delivers the main convention message.",
      },
      {
        time: "3:00 PM", title: "Fundraising Drive — Legacy Projects",
        host: "Convention Committee",
        type: "Fundraising",
        detail: "A dedicated fundraising session for the National Secretariat Building (grand dedication September 2026). Delegates are invited to give generously toward completing this legacy project.",
      },
    ],
  },
  {
    date: "April 11", day: "Saturday", label: "Jubilee Day",
    color: "#8b5cf6", highlight: false,
    events: [
      {
        time: "9:00 AM", title: "Evang. Samuel Yahaya — Teaching",
        host: "Evang. Samuel Yahaya — Glorious Mission",
        type: "Teaching",
        detail: "Teaching session by Evang. Samuel Yahaya of Glorious Mission.",
      },
      {
        time: "2:00 PM", title: "Diamond Jubilee Grand Procession",
        host: "National HQ — All Delegates",
        type: "Grand Event",
        detail: "The Diamond Jubilee Grand Procession — a historic march celebrating 60 years of HEKAN's Annual National Convention. All delegates, DCCs, and LCCs participate in this landmark celebration.",
      },
      {
        time: "6:00 PM", title: "Awards of Excellence Banquet",
        host: "HEKAN National Executive",
        type: "Awards",
        detail: "Conferring of Awards of Excellence upon deserving members and friends of HEKAN who have committed their time, resources, and influence to advance the ministry.",
      },
    ],
  },
  {
    date: "April 12", day: "Sunday", label: "Closing Day",
    color: "#ef4444", highlight: true,
    events: [
      {
        time: "9:00 AM", title: "Ordination Service",
        host: "Rev. (Dr.) Amos G. Kiri — President, HEKAN",
        type: "Ordination",
        detail: "The solemn Ordination Service — ordaining new ministers into the service of HEKAN. A sacred moment marking the continuation of the church's ministerial legacy.",
      },
      {
        time: "12:00 PM", title: "Thanksgiving & Closing Ceremony",
        host: "Rev. (Dr.) Amos G. Kiri",
        type: "Closing",
        detail: "The 60th Annual National Convention closes with a Thanksgiving Service. The President delivers his final charge to the convention before handing over the baton of leadership later in the year.",
      },
    ],
  },
];

function ScheduleSection() {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[#1a5490] text-[10px] uppercase tracking-[10px] font-black">Event Itinerary</span>
        <h2 className="text-3xl font-bold text-gray-900">Full Jubilee Schedule</h2>
        <p className="text-sm text-gray-400">April 7–12, 2026 · HEKAN Centre, No. 4/6 Katsina Road, Kaduna</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setExpandedDay(expandedDay === i ? null : i)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border"
            style={{
              background: expandedDay === i ? d.color : 'white',
              color: expandedDay === i ? 'white' : d.color,
              borderColor: `${d.color}40`,
            }}>
            {d.date.split(' ')[1]} {d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day cards */}
      <div className="space-y-4">
        {DAYS.map((day, di) => (
          <motion.div key={di} layout className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Day header — clickable */}
            <button
              onClick={() => setExpandedDay(expandedDay === di ? null : di)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white font-black"
                style={{ background: day.color }}>
                <span className="text-lg leading-none">{day.date.split(' ')[1]}</span>
                <span className="text-[8px] uppercase">{day.date.split(' ')[0].slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-gray-900">{day.day} — {day.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{day.events.length} event{day.events.length !== 1 ? 's' : ''}</div>
              </div>
              {day.highlight && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white flex-shrink-0"
                  style={{ background: day.color }}>Key Day</span>
              )}
              <motion.div animate={{ rotate: expandedDay === di ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
              </motion.div>
            </button>

            {/* Events list */}
            <AnimatePresence>
              {expandedDay === di && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {day.events.map((ev, ei) => {
                      const key = `${di}-${ei}`;
                      const open = expandedEvent === key;
                      return (
                        <div key={ei}>
                          <button
                            onClick={() => setExpandedEvent(open ? null : key)}
                            className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-blue-50/30 transition-colors group"
                          >
                            {/* Time */}
                            <div className="flex-shrink-0 text-center w-16">
                              <div className="text-[10px] font-black text-gray-500">{ev.time}</div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                  style={{ background: `${day.color}15`, color: day.color }}>
                                  {ev.type}
                                </span>
                              </div>
                              <div className="font-bold text-gray-900 mt-1 text-sm">{ev.title}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5 truncate">{ev.host}</div>
                            </div>
                            {/* Expand indicator */}
                            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
                              className="flex-shrink-0 mt-1">
                              <ChevronDown size={14} className="text-gray-300 group-hover:text-[#1a5490] transition-colors" />
                            </motion.div>
                          </button>

                          {/* Detail panel */}
                          <AnimatePresence>
                            {open && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-4 ml-20">
                                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-600 leading-relaxed">{ev.detail}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Giving Section ────────────────────────────────────────────────────────────
function GivingSection({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const projects = [
    { title: "National Secretariat Building", desc: "Grand dedication — September 2026", progress: 78, color: "#1a5490" },
    { title: "Gampu Clinic Expansion", desc: "Taraba State · ACAM & Sunlight Church partnership", progress: 85, color: "#10b981" },
    { title: "Kaduna Education Center", desc: "AMBI Online Centre expansion", progress: 42, color: "#8b5cf6" },
    { title: "Regional Trauma Support", desc: "Rev. Dr. Enoch Adamu · Africa Services", progress: 68, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a5490] via-[#1e4d8c] to-[#0f3460] p-8 md:p-10 text-white">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-2xl">
          <div className="text-[10px] uppercase tracking-[8px] text-white/60 font-black mb-3">60th Diamond Jubilee</div>
          <h2 className="text-3xl md:text-4xl font-serif italic text-white leading-tight mb-3">
            Invest in the Legacy
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-lg">
            Your contribution directly powers the expansion of our medical missions, educational facilities, and the completion of the National Secretariat — as we celebrate 60 years of God's faithfulness to HEKAN.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
            <CheckCircle2 size={13} className="text-emerald-400" />
            All funds go directly to verified HEKAN convention projects
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bank details — main card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 rounded-xl text-[#1a5490]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <div className="font-black text-gray-900 text-sm">Direct Bank Transfer</div>
                <div className="text-[10px] text-gray-400">Instant · Secure · Verified</div>
              </div>
            </div>

            {[
              { label: "Account Number", value: "2032912368", copyable: true },
              { label: "Account Name", value: "UNITED CHURCH OF CHRIST HEKAN DEVELOPMENT FORUM", copyable: false },
              { label: "Bank Name", value: "FIRST BANK", copyable: false },
            ].map((item) => (
              <div key={item.label}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#1a5490]/20 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">{item.label}</div>
                  <div className={`font-bold text-gray-900 ${item.label === "Account Number" ? "text-xl tracking-[3px]" : "text-sm"}`}>
                    {item.value}
                  </div>
                </div>
                {item.copyable && (
                  <button
                    onClick={() => copy(item.value, item.label)}
                    className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0"
                    style={{
                      background: copied === item.label ? '#ecfdf5' : '#eff6ff',
                      color: copied === item.label ? '#059669' : '#1a5490',
                    }}
                  >
                    {copied === item.label
                      ? <><CheckCircle2 size={12} /> Copied</>
                      : <><Copy size={12} /> Copy</>
                    }
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed">
                Verified HEKAN account — all funds go directly to convention and legacy projects
              </p>
            </div>
          </div>

          {/* Diamond 1000 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-900 text-sm mb-1">Diamond 1000 Circle</div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Join 1,000 believers committing a monthly offering to sustain HEKAN's mission works — medical clinics, schools, and church planting across Nigeria.
                </p>
                <button className="px-5 py-2.5 bg-[#1a5490] text-white text-[10px] font-black uppercase tracking-[2px] rounded-xl hover:bg-[#154070] transition-all shadow-md shadow-[#1a5490]/20">
                  Join the Circle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legacy projects sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="text-[10px] uppercase tracking-[6px] text-[#1a5490] font-black mb-4">Where Your Gift Goes</div>
            <div className="space-y-5">
              {projects.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-xs font-bold text-gray-800 leading-tight">{p.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{p.desc}</div>
                    </div>
                    <span className="text-[10px] font-black flex-shrink-0" style={{ color: p.color }}>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button onClick={onBack}
            className="w-full py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#1a5490] font-bold transition-colors flex items-center justify-center gap-2">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gallery — Masonry layout with lightbox ────────────────────────────────────
const GALLERY_IMAGES = Array.from({ length: 31 }, (_, i) => `/60th/image${i + 1}.jpeg`);

function GallerySection() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightbox(p => p !== null ? Math.min(p + 1, GALLERY_IMAGES.length - 1) : null);
      if (e.key === "ArrowLeft") setLightbox(p => p !== null ? Math.max(p - 1, 0) : null);
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  // Distribute images across 3 columns for masonry
  const cols: string[][] = [[], [], []];
  GALLERY_IMAGES.forEach((img, i) => cols[i % 3].push(img));

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <span className="text-[#1a5490] text-[10px] uppercase tracking-[10px] font-black">Legacy Visuals</span>
          <h2 className="text-3xl font-bold text-gray-900">Anniversary Collections</h2>
          <p className="text-sm text-gray-400">{GALLERY_IMAGES.length} photos · HEKAN 60th Diamond Jubilee · April 2026</p>
        </div>
      </div>

      {/* Masonry grid — 3 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-3">
            {col.map((src, ri) => {
              const globalIdx = ri * 3 + ci;
              return (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: globalIdx * 0.03, duration: 0.4 }}
                  onClick={() => setLightbox(globalIdx)}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={src}
                    alt={`HEKAN 60th Convention ${globalIdx + 1}`}
                    className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-90"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-3">
                    <div className="flex items-center gap-2">
                      <ZoomIn size={14} className="text-white" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">View</span>
                    </div>
                  </div>
                  {/* Index badge */}
                  <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {globalIdx + 1}/{GALLERY_IMAGES.length}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
            >
              <X size={20} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white/60 text-sm font-bold z-10">
              {lightbox + 1} / {GALLERY_IMAGES.length}
            </div>

            {/* Prev */}
            {lightbox > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
              >
                <ChevronRight size={22} className="rotate-180" />
              </button>
            )}

            {/* Next */}
            {lightbox < GALLERY_IMAGES.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={GALLERY_IMAGES[lightbox]}
              alt={`HEKAN 60th Convention ${lightbox + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto">
              {GALLERY_IMAGES.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Portal({ onBack, onInvest }: PortalProps) {
  const [activeSegment, setActiveSegment] = useState(() => {
    return localStorage.getItem("hekan_portal_segment") || "home";
  });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("hekan_portal_segment", activeSegment);
  }, [activeSegment]);

  useEffect(() => {
    const targetDate = new Date("April 7, 2026 09:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      setTimeLeft({
        days: Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: Math.max(0, Math.floor((distance % (1000 * 60)) / 1000)),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "dashboard", icon: <Users size={20} />, label: "Status" },
    { id: "analytics", icon: <BarChart3 size={20} />, label: "Analytics" },
    { id: "schedule", icon: <Calendar size={20} />, label: "Timeline" },
    { id: "map", icon: <MapPin size={20} />, label: "Missions" },
    { id: "gallery", icon: <ImageIcon size={20} />, label: "Archives" },
    { id: "invest", icon: <Heart size={20} />, label: "Giving" },
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-[#f4f7fb] text-gray-900 font-sans flex flex-col md:flex-row overflow-hidden">

      {/* ── Sidebar nav — desktop only ── */}
      <motion.aside
        initial={{ x: -80 }}
        animate={{ x: 0 }}
        className="hidden md:flex w-20 border-r border-gray-200 flex-col items-center py-8 gap-10 bg-white shadow-sm flex-shrink-0"
      >
        <div className="text-[#1a5490] font-black text-xl tracking-tighter">H.</div>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSegment(item.id)}
              title={item.label}
              className={`group relative p-3 rounded-xl transition-all ${activeSegment === item.id
                ? "bg-[#1a5490] text-white shadow-md shadow-[#1a5490]/20"
                : "text-gray-400 hover:text-[#1a5490] hover:bg-blue-50"
                }`}
            >
              {item.icon}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <button onClick={onBack} className="p-3 text-gray-300 hover:text-gray-600 transition-colors" title="Back">
            <ExternalLink size={18} />
          </button>
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar portal-grid min-w-0 pb-20 md:pb-0">

        {/* Top bar */}
        <header className="h-auto min-h-[56px] border-b border-gray-200 flex items-center justify-between px-4 md:px-8 py-3 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Mobile: show current section name */}
            <div className="flex items-center gap-2 sm:hidden">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              <span className="text-sm font-black text-gray-900 tracking-tight">
                {navItems.find(n => n.id === activeSegment)?.label ?? "Portal"}
              </span>
              <span className="text-gray-300 font-light">|</span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-tight">HEKAN 60th</span>
            </div>
            {/* Desktop: Mission Control label */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[3px] text-[#1a5490] font-black">Mission Control</span>
            </div>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <h1 className="text-xs font-semibold text-gray-600 tracking-tight hidden md:block">60th Jubilee Anniversary Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              {Object.entries(timeLeft).map(([unit, val], i) => (
                <div key={unit} className="flex items-center">
                  <div className="text-center px-1.5">
                    <div className="text-sm font-black text-gray-900 leading-none tabular-nums">{String(val).padStart(2, "0")}</div>
                    <div className="text-[7px] uppercase tracking-widest text-gray-400 mt-0.5">{unit}</div>
                  </div>
                  {i < 3 && <span className="text-gray-300 font-bold text-xs">:</span>}
                </div>
              ))}
            </div>
            {/* Inside portal: navigate to invest tab, don't close portal */}
            <button
              onClick={() => setActiveSegment("invest")}
              className="px-4 py-2 bg-[#1a5490] text-white text-[10px] font-black uppercase tracking-[2px] rounded-lg hover:bg-[#154070] active:scale-95 transition-all shadow-md shadow-[#1a5490]/20 whitespace-nowrap"
            >
              Invest Now
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSegment}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >

                {/* ─── HOME ─── */}
                {activeSegment === "home" && (
                  <HomeView
                    onNavigate={(tab) => setActiveSegment(tab)}
                    onInvest={() => setActiveSegment("invest")}
                  />
                )}

                {/* ─── STATUS ─── */}
                {activeSegment === "dashboard" && (
                  <RegistrantsView />
                )}

                {/* ─── ANALYTICS ─── */}
                {activeSegment === "analytics" && (
                  <AnalyticsView />
                )}

                {/* ─── SCHEDULE ─── */}
                {activeSegment === "schedule" && (
                  <ScheduleSection />
                )}

                {/* ─── MAP / MISSIONS ─── */}
                {activeSegment === "map" && (
                  <div className="space-y-8 pb-20">
                    <div className="space-y-1">
                      <span className="text-[#1a5490] text-[10px] uppercase tracking-[10px] font-black">Regional Impact</span>
                      <h2 className="text-3xl font-bold text-gray-900">Mission Footprint</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                      {/* Map */}
                      <div className="aspect-square bg-white border border-gray-200 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-sm">
                        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(#1a5490 1px, transparent 1px), linear-gradient(90deg, #1a5490 1px, transparent 1px)", backgroundSize: "25px 25px" }} />
                        <div className="relative w-[90%] h-[90%] flex items-center justify-center">
                          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                            <motion.path
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              d="M60.6,21.5l7,3l7.4,3.4l12.8-5.6l9.6,3.2l8.8-3.2l18.4,12.8l13.2-2l13.2-2l24,19.2l17.6,0.8l18.4,17.6l3.2,15.2l18.4,16.8l0.8,20.8l-11.2,16.8l-4,26.4l-8.8,12l-8,4l-5.6,22.4l-11.2,8l-7.2,4l-15.2-4.8l-12,2.4l-16,3.2l-16.8-11.2l-12.8,2.4l-13.6,1.6l-16.8-11.2l-17.6,1.6l-17.6-11.2l-12-26.4l-9.6-11.2l-1.6-2.4l-13.6-8.8l-5.6-22.4l5.6-18.4l1.6-22.4l11.2-16.8l1.6-13.6L60.6,21.5z"
                              fill="#1a5490" fillOpacity="0.06" stroke="#1a5490" strokeWidth="1.2"
                            />
                            <g opacity="0.8">
                              {[
                                { id: 3, d: "M102,18l24,0l6,21l-2,3l-3,9l-11,2l-16,-6l2,-19l-4,-1l4,-9z" },
                                { id: 0, d: "M93,48l35,-3l-1,7l2,5l-4,21l-3,4l-25,4l-2,-16l-3,-2l1,-20z" },
                                { id: 1, d: "M38,62l2,2l10,-4l40,6l-1,30l-4,4l-45,-4l-8,-14l2,-20z" },
                                { id: 2, d: "M145,98l32,-8l13,2l-4,35l-12,5l-33,14l-6,-15l10,-23l-3,-10z" },
                              ].map((region) => (
                                <motion.path key={region.id}
                                  animate={{ fillOpacity: selectedStation === region.id ? 0.5 : 0.12, strokeOpacity: selectedStation === region.id ? 1 : 0.3 }}
                                  d={region.d} fill="#1a5490" stroke="#1a5490" strokeWidth="0.8"
                                />
                              ))}
                            </g>
                          </svg>
                          {[
                            { id: 3, x: "56%", y: "18%", state: "KANO", name: "Kano Wing" },
                            { id: 0, x: "54%", y: "34%", state: "KADUNA", name: "National HQ" },
                            { id: 1, x: "32%", y: "38%", state: "NIGER", name: "Niger Mission" },
                            { id: 2, x: "78%", y: "58%", state: "TARABA", name: "Gampu Base" },
                          ].map((pin) => (
                            <motion.button key={pin.id}
                              onMouseEnter={() => setSelectedStation(pin.id)}
                              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
                              style={{ left: pin.x, top: pin.y }}
                              animate={{ scale: selectedStation === pin.id ? 1.4 : 1 }}
                            >
                              <div className="flex flex-col items-center">
                                <motion.div
                                  animate={{ backgroundColor: selectedStation === pin.id ? "#1a5490" : "white", boxShadow: selectedStation === pin.id ? "0 0 20px rgba(26,84,144,0.5)" : "0 2px 8px rgba(0,0,0,0.1)" }}
                                  className="p-1.5 rounded-full border border-[#1a5490]/30 text-[#1a5490] transition-colors"
                                >
                                  <MapPin size={12} className={selectedStation === pin.id ? "text-white" : "text-[#1a5490]"} />
                                </motion.div>
                                <span className={`text-[7px] font-black tracking-widest mt-0.5 px-1.5 py-0.5 rounded-sm transition-all ${selectedStation === pin.id ? "bg-[#1a5490] text-white" : "text-[#1a5490]/60"}`}>
                                  {pin.state}
                                </span>
                              </div>
                              <AnimatePresence>
                                {selectedStation === pin.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.5, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1a5490] text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] shadow-lg"
                                  >
                                    {pin.name}
                                    <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-white/20">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                      <span className="text-[7px] text-white/70 font-bold uppercase tracking-widest">Active Station</span>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          ))}
                        </div>
                        <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-white/90 backdrop-blur-sm p-3 border border-gray-100 rounded-xl shadow-sm">
                          <div className="text-[9px] font-black uppercase tracking-[4px] text-gray-400 mb-1">Legend</div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#1a5490] opacity-50 rounded-sm" />
                            <span className="text-[10px] font-semibold text-gray-700">Active Mission Zone</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-[#1a5490]/30 rounded-sm" />
                            <span className="text-[10px] font-semibold text-gray-400">Zonal District</span>
                          </div>
                        </div>
                      </div>

                      {/* Mission Cards */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs uppercase tracking-widest font-black text-gray-400">Network Status</h4>
                          <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold text-green-600 uppercase">Live Ops</span>
                          </div>
                        </div>
                        <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                          {[
                            { id: 0, state: "Kaduna", stations: "National Secretariat, HEKAN Clinic", status: "Operational", reach: "45,000+", staff: "124", capacity: "High" },
                            { id: 1, state: "Niger", stations: "Leapu Secondary School", status: "Renovating", reach: "12,000+", staff: "32", capacity: "Limited" },
                            { id: 2, state: "Taraba", stations: "Gampu Medical Center", status: "Expanding", reach: "28,000+", staff: "56", capacity: "Buffer" },
                            { id: 3, state: "Kano", stations: "Basic Education Wing", status: "Operational", reach: "18,500+", staff: "41", capacity: "Optimal" },
                          ].map((loc) => (
                            <motion.div key={loc.id}
                              onMouseEnter={() => setSelectedStation(loc.id)}
                              className={`p-5 border-l-4 rounded-r-2xl transition-all duration-300 cursor-pointer bg-white shadow-sm ${selectedStation === loc.id ? "border-[#1a5490] shadow-md translate-x-1" : "border-gray-200 opacity-70"
                                }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="text-base font-bold text-gray-900">{loc.state}</div>
                                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{loc.stations}</div>
                                </div>
                                <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-tight rounded-lg ${loc.status === "Operational" ? "bg-green-50 text-green-700" :
                                  loc.status === "Expanding" ? "bg-blue-50 text-[#1a5490]" : "bg-amber-50 text-amber-700"
                                  }`}>{loc.status}</span>
                              </div>
                              <AnimatePresence>
                                {selectedStation === loc.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                    className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                                    {[
                                      { label: "Impact Reach", val: loc.reach },
                                      { label: "Mission Staff", val: loc.staff },
                                      { label: "Resource Tier", val: loc.capacity },
                                    ].map((d) => (
                                      <div key={d.label}>
                                        <div className="text-[8px] text-gray-400 uppercase mb-0.5">{d.label}</div>
                                        <div className="text-xs font-black text-[#1a5490]">{d.val}</div>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── GALLERY ─── */}
                {activeSegment === "gallery" && (
                  <GallerySection />
                )}

                {/* ─── INVEST / GIVING ─── */}
                {activeSegment === "invest" && (
                  <GivingSection onBack={() => setActiveSegment("home")} />
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── Mobile bottom nav bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[400] bg-white border-t border-gray-200 flex items-center justify-around px-1 py-1 shadow-lg">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveSegment(item.id)}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all flex-1 ${activeSegment === item.id ? "text-[#1a5490]" : "text-gray-400"
              }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${activeSegment === item.id ? "bg-blue-50" : ""}`}>
              {item.icon}
            </div>
            <span className="text-[7px] font-bold uppercase tracking-wide truncate w-full text-center">{item.label}</span>
          </button>
        ))}
        <button onClick={onBack} className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl text-gray-400 flex-1">
          <div className="p-1.5 rounded-lg"><ExternalLink size={20} /></div>
          <span className="text-[7px] font-bold uppercase tracking-wide">Back</span>
        </button>
      </nav>

    </div>
  );
}
