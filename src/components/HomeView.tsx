import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Users, DollarSign, Building2, Clock, MapPin, BookOpen,
    Heart, ChevronRight, Calendar, TrendingUp, Church,
    ShieldCheck, GraduationCap, Stethoscope, ArrowRight,
    BarChart3, Activity, Landmark, Star,
} from 'lucide-react';
import { isSupabaseConfigured, fetchAllRegistrants } from '../lib/supabase';

// ── helpers ───────────────────────────────────────────────────────────────────
function parseAmt(raw: string) {
    return parseFloat((raw || '').replace(/[^0-9.]/g, '')) || 0;
}
function naira(n: number) { return `₦${n.toLocaleString()}`; }

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
    const calc = () => {
        const diff = target.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
            past: false,
        };
    };
    const [t, setT] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(id);
    }, []);
    return t;
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    const [hovered, setHovered] = useState(false);
    return (
        <section id={id} className="space-y-4">
            <div
                className="flex items-center gap-3 cursor-default"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <motion.div
                    animate={{ scaleX: hovered ? 1.05 : 1, opacity: hovered ? 0.6 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-px flex-1 bg-gray-200 origin-right"
                />
                <motion.span
                    animate={{
                        letterSpacing: hovered ? '0.18em' : '0.06em',
                        color: hovered ? '#1a5490' : '#9ca3af',
                    }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="text-[10px] uppercase font-black flex-shrink-0"
                    style={{ letterSpacing: '0.06em', color: '#9ca3af' }}
                >
                    {label}
                </motion.span>
                <motion.div
                    animate={{ scaleX: hovered ? 1.05 : 1, opacity: hovered ? 0.6 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-px flex-1 bg-gray-200 origin-left"
                />
            </div>
            {children}
        </section>
    );
}

// ── Animated DCC / LCC cycling card ──────────────────────────────────────────
function DistrictCard({ dccList, lccList, dccCount, lccCount }: {
    dccList: { name: string; count: number; revenue: number }[];
    lccList: { name: string; count: number; revenue: number }[];
    dccCount: number;
    lccCount: number;
}) {
    const [mode, setMode] = useState<'dcc' | 'lcc'>('dcc');
    const [itemIdx, setItemIdx] = useState(0);
    const [visible, setVisible] = useState(true);

    const list = mode === 'dcc' ? dccList : lccList;
    const current = list[itemIdx];

    // Cycle through items every 2.5s, switch mode every full cycle
    useEffect(() => {
        if (!list.length) return;
        const id = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setItemIdx(prev => {
                    const next = prev + 1;
                    if (next >= list.length) {
                        // Switch mode after full cycle
                        setMode(m => m === 'dcc' ? 'lcc' : 'dcc');
                        return 0;
                    }
                    return next;
                });
                setVisible(true);
            }, 300);
        }, 2500);
        return () => clearInterval(id);
    }, [list.length, mode]);

    // Reset index when mode changes
    useEffect(() => { setItemIdx(0); setVisible(true); }, [mode]);

    const isDcc = mode === 'dcc';
    const color = isDcc ? '#8b5cf6' : '#1a5490';
    const bg = isDcc ? '#f5f3ff' : '#eff6ff';
    const label = isDcc ? 'DCCs' : 'LCCs';
    const total = isDcc ? dccCount : lccCount;

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-2 overflow-hidden"
        >
            {/* icon + toggle */}
            <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg" style={{ background: bg, color }}>
                    {isDcc ? <Building2 size={16} /> : <Church size={16} />}
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setMode('dcc')} className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full cursor-pointer whitespace-nowrap"
                        style={{ background: mode === 'dcc' ? '#8b5cf6' : '#f5f3ff', color: mode === 'dcc' ? 'white' : '#8b5cf6' }}>
                        DCC
                    </button>
                    <button onClick={() => setMode('lcc')} className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full cursor-pointer whitespace-nowrap"
                        style={{ background: mode === 'lcc' ? '#1a5490' : '#eff6ff', color: mode === 'lcc' ? 'white' : '#1a5490' }}>
                        LCC
                    </button>
                </div>
            </div>

            <div className="fluid-2xl font-black text-gray-900 leading-none tabular-nums">{total || '—'}</div>
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold leading-tight">{label}</div>

            {/* Animated item */}
            <div className="border-t border-gray-50 pt-1.5 mt-auto">
                <AnimatePresence mode="wait">
                    {current && visible && (
                        <motion.div key={`${mode}-${itemIdx}`}
                            initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[9px] font-bold text-gray-700 truncate flex-1">{current.name}</span>
                                <span className="text-[8px] font-black flex-shrink-0" style={{ color }}>{current.count}</span>
                            </div>
                            <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div key={`bar-${mode}-${itemIdx}`} initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((current.count / (list[0]?.count || 1)) * 100)}%` }}
                                    transition={{ duration: 0.45 }} className="h-full rounded-full" style={{ background: color }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HomeView({
    onNavigate,
    onInvest,
}: {
    onNavigate: (tab: string) => void;
    onInvest: () => void;
}) {
    const [stats, setStats] = useState({ delegates: 0, revenue: 0, dccs: 0, lccs: 0 });
    const [dccList, setDccList] = useState<{ name: string; count: number; revenue: number }[]>([]);
    const [lccList, setLccList] = useState<{ name: string; count: number; revenue: number }[]>([]);
    const countdown = useCountdown(new Date('April 7, 2026 09:00:00'));

    const loadStats = useCallback(async () => {
        if (!isSupabaseConfigured) return;
        const data = await fetchAllRegistrants('amount, dcc, lcc').catch(() => null);
        if (!data) return;

        const revenue = data.reduce((s, r) => s + parseAmt(r.amount), 0);

        // Build DCC map
        const dccMap = new Map<string, { count: number; revenue: number }>();
        const lccMap = new Map<string, { count: number; revenue: number }>();
        data.forEach((r: any) => {
            const dcc = r.dcc?.trim() || 'Unknown';
            const lcc = r.lcc?.trim() || 'Unknown';
            const amt = parseAmt(r.amount);
            if (!dccMap.has(dcc)) dccMap.set(dcc, { count: 0, revenue: 0 });
            dccMap.get(dcc)!.count++;
            dccMap.get(dcc)!.revenue += amt;
            if (!lccMap.has(lcc)) lccMap.set(lcc, { count: 0, revenue: 0 });
            lccMap.get(lcc)!.count++;
            lccMap.get(lcc)!.revenue += amt;
        });

        const dccArr = [...dccMap.entries()]
            .map(([name, v]) => ({ name, ...v }))
            .sort((a, b) => b.count - a.count);
        const lccArr = [...lccMap.entries()]
            .map(([name, v]) => ({ name, ...v }))
            .sort((a, b) => b.count - a.count);

        setStats({ delegates: data.length, revenue, dccs: dccArr.length, lccs: lccArr.length });
        setDccList(dccArr);
        setLccList(lccArr);
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    // ── Section 1 — Hero ───────────────────────────────────────────────────────
    const Hero = (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a5490] via-[#1e4d8c] to-[#0f3460] p-4 md:p-8 text-white">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[3px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Diamond Jubilee · 60th Anniversary
                    </div>
                    <div>
                        <div className="text-[11px] font-bold tracking-[4px] uppercase text-white/60 mb-2">
                            The United Church of Christ in Nigeria
                        </div>
                        <h1 className="fluid-hero font-black tracking-tight leading-none">
                            HEKAN
                        </h1>
                        <p className="text-white/70 text-sm mt-2 italic">Hadaddiyar Ekklesiyar Kristi A Nigeria</p>
                    </div>
                    <div className="space-y-1">
                        <p className="fluid-3xl font-serif italic text-white/90">"We Are One In Christ"</p>
                        <p className="text-xs text-white/50 tracking-widest uppercase">Galatians 3:28 · Mu Daya Ne Cikin Kristi</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span>HEKAN Centre, No. 4/6 Katsina Road, Kaduna · April 7–12, 2026</span>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <button onClick={() => onNavigate('dashboard')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a5490] rounded-xl fluid-sm font-black hover:bg-white/90 transition-all shadow-lg">
                            <Users size={15} /> View Registrants
                        </button>
                        <button onClick={onInvest}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-black hover:bg-white/25 transition-all">
                            <Heart size={15} /> Invest Now
                        </button>
                    </div>
                </div>

                {/* Countdown */}
                <div className="lg:flex-shrink-0">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                        <p className="text-[10px] uppercase tracking-[4px] text-white/60 font-black mb-4">
                            {countdown.past ? 'Convention Completed' : 'Convention Begins In'}
                        </p>
                        {!countdown.past ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                                {[
                                    { v: countdown.days, l: 'Days' },
                                    { v: countdown.hours, l: 'Hours' },
                                    { v: countdown.minutes, l: 'Mins' },
                                    { v: countdown.seconds, l: 'Secs' },
                                ].map(({ v, l }) => (
                                    <div key={l} className="bg-white/10 rounded-xl p-3">
                                        <div className="fluid-2xl font-black tabular-nums leading-none">
                                            {String(v).padStart(2, '0')}
                                        </div>
                                        <div className="text-[9px] uppercase tracking-widest text-white/50 mt-1">{l}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-2xl font-black text-emerald-400">✓ Completed</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );

    // ── Section 2 — Stats ──────────────────────────────────────────────────────
    const Stats = (
        <Section id="stats" label="Convention at a Glance">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Delegates */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-blue-50 text-[#1a5490]"><Users size={16} /></div>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-blue-50 text-[#1a5490] whitespace-nowrap">Live</span>
                    </div>
                    <div className="fluid-2xl font-black text-gray-900 leading-none tabular-nums">{stats.delegates.toLocaleString()}</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold leading-tight">Delegates</div>
                    <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden mt-auto">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2 }} className="h-full bg-[#1a5490] rounded-full" />
                    </div>
                </motion.div>

                {/* Revenue */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.07 }}
                    className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={16} /></div>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 whitespace-nowrap">Live</span>
                    </div>
                    <div className="fluid-lg font-black text-gray-900 leading-none">{naira(stats.revenue)}</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold leading-tight">Revenue</div>
                    <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden mt-auto">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.4 }} className="h-full bg-emerald-500 rounded-full" />
                    </div>
                </motion.div>

                {/* DCC/LCC cycling card */}
                <DistrictCard dccList={dccList} lccList={lccList} dccCount={stats.dccs} lccCount={stats.lccs} />

                {/* Days */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.21 }}
                    className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-500"><Clock size={16} /></div>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-500 whitespace-nowrap">
                            {countdown.past ? 'Done' : 'Left'}
                        </span>
                    </div>
                    <div className="fluid-2xl font-black text-gray-900 leading-none">{countdown.past ? '✓' : countdown.days}</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold leading-tight">Days to Conv.</div>
                    <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden mt-auto">
                        <motion.div initial={{ width: 0 }}
                            animate={{ width: countdown.past ? '100%' : `${Math.max(5, 100 - (countdown.days / 365) * 100)}%` }}
                            transition={{ duration: 1.2 }} className="h-full bg-amber-400 rounded-full" />
                    </div>
                </motion.div>
            </div>
        </Section>
    );

    // ── Section 3 — Key People ─────────────────────────────────────────────────
    const People = (
        <Section id="people" label="Key People">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Chief Host */}
                <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#1a5490] to-[#0f3460] rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-[10px] uppercase tracking-[4px] text-white/60 font-black mb-4">Chief Host</div>
                    <div className="w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden mb-4 border-2 border-white/30">
                        <img src="/president.jpg" alt="Rev. (Dr.) Amos G. Kiri"
                            className="w-full h-full object-cover object-top" />
                    </div>
                    <h3 className="fluid-xl font-black leading-tight">Rev. (Dr.) Amos G. Kiri</h3>
                    <p className="text-white/70 text-sm mt-1">President, HEKAN</p>
                    <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-[11px] text-white/50 italic">Valedictory Address — 60th Convention</p>
                    </div>
                </div>

                {/* Guest Speaker */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="text-[10px] uppercase tracking-[4px] text-[#1a5490] font-black mb-4">Guest Speaker</div>
                    <div className="w-16 h-20 rounded-2xl overflow-hidden mb-4 border border-gray-100">
                        <img src="/dr isaiah.jpg" alt="Rev. Dr. Isaiah Jirape Magaji"
                            className="w-full h-full object-cover object-top" />
                    </div>
                    <h3 className="fluid-lg fluid-base font-black text-gray-900 leading-tight">Rev. Dr. Isaiah Jirape Magaji</h3>
                    <p className="text-gray-500 text-sm mt-1">President, CRC-N</p>
                </div>

                {/* Guest Teachers */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="text-[10px] uppercase tracking-[4px] text-[#1a5490] font-black">Guest Teachers</div>
                    {[
                        { img: '/dr enoch.jpg', initials: 'EA', name: 'Rev. Dr. Enoch Adamu', role: 'Regional Trauma Lead, Africa Services' },
                        { img: '/dr abdulra.jpg', initials: 'AA', name: "Dr. Abdulra'uf Aliyu", role: 'Senior Policy Advisor, ACTG' },
                        { img: '/samuel yahaya.jpg', initials: 'SY', name: 'Evang. Samuel Yahaya', role: 'Glorious Mission' },
                    ].map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-100">
                                <img src={p.img} alt={p.name}
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-900 truncate">{p.name}</div>
                                <div className="text-[10px] text-gray-400 truncate">{p.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );

    // ── Section 4 — Timeline ───────────────────────────────────────────────────
    const Timeline = (
        <Section id="timeline" label="Event Timeline">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="fluid-base font-black text-gray-900">April 7–12, 2026 · HEKAN Centre, Kaduna</h3>
                    <button onClick={() => onNavigate('schedule')}
                        className="text-[10px] uppercase tracking-widest text-[#1a5490] font-black hover:opacity-60 transition-opacity flex items-center gap-1">
                        Full Schedule <ArrowRight size={10} />
                    </button>
                </div>
                <div className="relative">
                    {/* Line */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gray-100" />
                    <div className="space-y-4">
                        {[
                            { day: 'Apr 7', event: 'Opening Ceremony & Anniversary Lecture', type: 'Opening', highlight: true },
                            { day: 'Apr 8', event: 'Youth Empowerment Summit', type: 'Conference', highlight: false },
                            { day: 'Apr 9', event: 'Medical Missions Impact Showcase', type: 'Mission', highlight: false },
                            { day: 'Apr 10', event: 'Synod Prayer Breakfast', type: 'Devotion', highlight: false },
                            { day: 'Apr 11', event: 'Diamond Jubilee Grand Procession', type: 'Grand Event', highlight: false },
                            { day: 'Apr 12', event: 'Ordination Service & Thanksgiving', type: 'Closing', highlight: true },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 pl-1">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${item.highlight ? 'bg-[#1a5490] border-[#1a5490] text-white' : 'bg-white border-gray-200 text-gray-500'}`}>
                                    <span className="text-[9px] font-black">{i + 1}</span>
                                </div>
                                <div className="flex-1 pb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                            style={{ background: item.highlight ? '#eff6ff' : '#f8fafc', color: item.highlight ? '#1a5490' : '#94a3b8' }}>
                                            {item.type}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-semibold">{item.day}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );

    // ── Section 5 — Legacy Projects ────────────────────────────────────────────
    const Legacy = (
        <Section id="legacy" label="Legacy Projects">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {[
                    { title: 'National Secretariat Building', sub: 'Grand dedication — September 2026', progress: 78, target: '₦50M', icon: <Landmark size={18} />, color: '#1a5490', urgent: true },
                    { title: 'Gampu Clinic Expansion', sub: 'Taraba State · Sunlight Community Church partnership', progress: 85, target: '₦5.0M', icon: <Stethoscope size={18} />, color: '#10b981', urgent: false },
                    { title: 'Kaduna Education Center', sub: 'AMBI Online Centre expansion', progress: 42, target: '₦12.0M', icon: <GraduationCap size={18} />, color: '#8b5cf6', urgent: false },
                    { title: 'Regional Trauma Support', sub: 'Rev. Dr. Enoch Adamu · Africa Services', progress: 68, target: '₦3.5M', icon: <ShieldCheck size={18} />, color: '#f59e0b', urgent: false },
                ].map((p, i) => (
                    <div key={i} className={`bg-white border rounded-2xl p-5 shadow-sm ${p.urgent ? 'border-[#1a5490]/30 ring-1 ring-[#1a5490]/10' : 'border-gray-100'}`}>
                        {p.urgent && (
                            <div className="text-[9px] font-black uppercase tracking-widest text-[#1a5490] bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-3">
                                Final Push
                            </div>
                        )}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${p.color}15`, color: p.color }}>
                                {p.icon}
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-gray-900 text-sm">{p.title}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{p.sub}</div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-black" style={{ color: p.color }}>{p.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                                    className="h-full rounded-full" style={{ background: p.color }} />
                            </div>
                            <div className="text-[10px] text-gray-400">Target: {p.target}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-gradient-to-r from-[#1a5490]/5 to-[#1a5490]/10 border border-[#1a5490]/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                    <p className="fluid-base font-black text-gray-900">Support the Legacy</p>
                    <p className="text-sm text-gray-500 mt-0.5">Your contribution powers our mission for the next 60 years</p>
                </div>
                <button onClick={onInvest}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a5490] text-white rounded-xl text-sm font-black hover:bg-[#154070] transition-all shadow-md flex-shrink-0">
                    <Heart size={14} /> Give Now
                </button>
            </div>
        </Section>
    );

    // ── Section 6 — Mission Footprint ──────────────────────────────────────────
    const Mission = (
        <Section id="mission" label="Mission Footprint">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                {[
                    { label: 'Active States', value: '4', sub: 'Kaduna · Niger · Taraba · Kano', icon: <MapPin size={18} />, color: '#1a5490' },
                    { label: 'Clinics Supported', value: '14', sub: 'Rural & urban health facilities', icon: <Stethoscope size={18} />, color: '#10b981' },
                    { label: 'Basic Schools', value: '86', sub: 'Foundation for youth education', icon: <BookOpen size={18} />, color: '#8b5cf6' },
                    { label: 'New Churches', value: '15+', sub: 'Planted in unreached areas', icon: <Church size={18} />, color: '#f59e0b' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition-all">
                        <div className="p-3 rounded-2xl w-fit mx-auto mb-3" style={{ background: `${s.color}12`, color: s.color }}>
                            {s.icon}
                        </div>
                        <div className="text-3xl fluid-base font-black text-gray-900">{s.value}</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">{s.label}</div>
                        <div className="text-[10px] text-gray-400 mt-1 leading-relaxed">{s.sub}</div>
                    </motion.div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {[
                    { state: 'Kaduna', detail: 'National Secretariat · HEKAN Clinic · HQ', status: 'Operational', color: '#10b981' },
                    { state: 'Niger', detail: 'Leapu Secondary School · SabonGarin DanAuta Clinic', status: 'Expanding', color: '#1a5490' },
                    { state: 'Taraba', detail: 'Gampu Medical Center · Rural Outreach', status: 'Active', color: '#8b5cf6' },
                    { state: 'Kano', detail: 'Basic Education Wing · Zonal Choir', status: 'Operational', color: '#f59e0b' },
                ].map((loc, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
                            style={{ background: loc.color }}>
                            {loc.state[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-sm">{loc.state}</div>
                            <div className="text-[10px] text-gray-400 truncate">{loc.detail}</div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: `${loc.color}15`, color: loc.color }}>{loc.status}</span>
                    </div>
                ))}
            </div>
        </Section>
    );

    // ── Section 7 — Quick Links ────────────────────────────────────────────────
    const QuickLinks = (
        <Section id="quicklinks" label="Quick Navigation">
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-3">
                {[
                    { id: 'dashboard', label: 'Registrants', icon: <Users size={20} />, color: '#1a5490', bg: '#eff6ff' },
                    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, color: '#6366f1', bg: '#eef2ff' },
                    { id: 'schedule', label: 'Schedule', icon: <Calendar size={20} />, color: '#10b981', bg: '#ecfdf5' },
                    { id: 'map', label: 'Missions', icon: <MapPin size={20} />, color: '#f59e0b', bg: '#fffbeb' },
                    { id: 'gallery', label: 'Archives', icon: <Star size={20} />, color: '#ec4899', bg: '#fdf2f8' },
                    { id: 'invest', label: 'Give', icon: <Heart size={20} />, color: '#ef4444', bg: '#fef2f2' },
                ].map((link, i) => (
                    <motion.button
                        key={link.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onNavigate(link.id)}
                        className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="p-3 rounded-xl transition-all group-hover:scale-110"
                            style={{ background: link.bg, color: link.color }}>
                            {link.icon}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{link.label}</span>
                    </motion.button>
                ))}
            </div>
        </Section>
    );

    // ── Render all 7 ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-10 pb-12">
            {Hero}
            {Stats}
            {People}
            {Timeline}
            {Legacy}
            {Mission}
            {QuickLinks}
        </div>
    );
}
