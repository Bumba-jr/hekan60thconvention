import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
    Users, DollarSign, TrendingUp, Award,
    BarChart3, Loader2, AlertCircle, RefreshCw,
    CreditCard, Banknote, HelpCircle,
    ArrowUpRight, ArrowDownRight, Minus, Search, ChevronDown,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, Registrant, fetchAllRegistrants } from '../lib/supabase';
import { AnalyticsSkeleton } from './Skeleton';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = [
    '#1a5490', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#14b8a6',
];
const BLUE = '#1a5490';

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseAmt(raw: string) {
    return parseFloat((raw || '').replace(/[^0-9.]/g, '')) || 0;
}
function naira(n: number) { return `₦${n.toLocaleString()}`; }
function trunc(s: string, n = 16) { return s.length > n ? s.slice(0, n) + '…' : s; }

function buildDist(rows: Registrant[], key: keyof Registrant, limit?: number) {
    const m = new Map<string, number>();
    rows.forEach(r => {
        const k = (r[key] as string)?.trim() || 'Unknown';
        m.set(k, (m.get(k) || 0) + 1);
    });
    const arr = [...m.entries()].map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    return limit ? arr.slice(0, limit) : arr;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CT({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const isAmt = (name: string) =>
        ['amount', 'revenue', 'avg', 'total'].some(k => name?.toLowerCase().includes(k));
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 text-xs min-w-[150px] pointer-events-none">
            {label && <p className="font-black text-gray-800 mb-2 truncate max-w-[200px]">{label}</p>}
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
                    <span className="text-gray-500">{p.name}:</span>
                    <span className="font-bold text-gray-900 ml-auto pl-3">
                        {isAmt(p.name) ? naira(p.value) : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── Donut percent label ───────────────────────────────────────────────────────
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
    if (percent < 0.055) return null;
    const R = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.58;
    return (
        <text
            x={cx + r * Math.cos(-midAngle * R)}
            y={cy + r * Math.sin(-midAngle * R)}
            fill="#fff" textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight={700}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function Kpi({ label, value, sub, icon, color, delay = 0 }: {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; color: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: 'easeOut' }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="p-2.5 rounded-xl w-fit mb-3 transition-all group-hover:scale-110"
                style={{ background: `${color}18`, color }}>
                {icon}
            </div>
            <div className="text-[26px] font-black text-gray-900 leading-none tracking-tight">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1.5">{label}</div>
            {sub && <div className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</div>}
        </motion.div>
    );
}

// ── Chart card ────────────────────────────────────────────────────────────────
function Card({ title, sub, children, className = '' }: {
    title: string; sub?: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm ${className}`}>
            <div className="mb-5">
                <h3 className="text-sm font-black text-gray-900">{title}</h3>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
            {children}
        </div>
    );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function Board({ data }: { data: { name: string; value: number }[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const medals = ['🥇', '🥈', '🥉'];
    return (
        <div className="space-y-1">
            {data.slice(0, 10).map((d, i) => {
                const pct = total ? Math.round((d.value / total) * 100) : 0;
                return (
                    <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <span className="w-6 text-center flex-shrink-0 text-sm">
                            {i < 3 ? medals[i] : <span className="text-[11px] font-bold text-gray-400">{i + 1}</span>}
                        </span>
                        <span className="text-xs font-semibold text-gray-800 flex-1 truncate">{d.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C[i % C.length] }} />
                            </div>
                            <span className="text-xs font-black text-gray-900 w-6 text-right">{d.value}</span>
                            <span className="text-[10px] text-gray-400 w-7 text-right">{pct}%</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Donut with legend ─────────────────────────────────────────────────────────
function DonutWithLegend({ data, height = 200 }: { data: { name: string; value: number }[]; height?: number }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const thresh = total * 0.04;
    const main = data.filter(d => d.value >= thresh);
    const other = data.filter(d => d.value < thresh).reduce((s, d) => s + d.value, 0);
    const chart = other > 0 ? [...main, { name: 'Other', value: other }] : main;

    return (
        <div>
            {/* Fixed-size wrapper — avoids ResponsiveContainer zero-width bug in grid */}
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chart}
                            cx="50%" cy="50%"
                            innerRadius="48%" outerRadius="76%"
                            paddingAngle={2}
                            dataKey="value"
                            labelLine={false}
                            label={DonutLabel}
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={600}
                        >
                            {chart.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                        </Pie>
                        <Tooltip content={<CT />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                {chart.map((d, i) => {
                    const pct = total ? Math.round((d.value / total) * 100) : 0;
                    return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: C[i % C.length] }} />
                            <span className="text-gray-600 truncate flex-1">{d.name}</span>
                            <span className="font-bold text-gray-900">{d.value}</span>
                            <span className="text-gray-400 w-7 text-right">{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Payment Methods Card ──────────────────────────────────────────────────────
function PaymentMethodsCard({ rows }: { rows: Registrant[] }) {
    const methods = [
        {
            key: 'Cash',
            label: 'Cash',
            icon: <Banknote size={18} />,
            color: '#10b981',
            bg: '#ecfdf5',
            test: (pi: string) => pi.includes('cash'),
        },
        {
            key: 'POS / Bank',
            label: 'POS / Bank Transfer',
            icon: <CreditCard size={18} />,
            color: '#1a5490',
            bg: '#eff6ff',
            test: (pi: string) =>
                pi.includes('pos') || pi.includes('bank') || pi.includes('transfer') || /\d{6,}/.test(pi),
        },
        {
            key: 'Unknown',
            label: 'Not Specified',
            icon: <HelpCircle size={18} />,
            color: '#94a3b8',
            bg: '#f8fafc',
            test: (pi: string) => !pi || pi === '-',
        },
        {
            key: 'Other',
            label: 'Other',
            icon: <CreditCard size={18} />,
            color: '#f59e0b',
            bg: '#fffbeb',
            test: () => true, // catch-all
        },
    ];

    // Classify each row
    const stats = methods.map(m => ({ ...m, count: 0, amount: 0 }));
    rows.forEach(r => {
        const pi = (r.payment_info || '').toLowerCase();
        const amt = parseAmt(r.amount);
        let matched = false;
        for (let i = 0; i < stats.length - 1; i++) {
            if (methods[i].test(pi)) {
                stats[i].count++;
                stats[i].amount += amt;
                matched = true;
                break;
            }
        }
        if (!matched) {
            stats[stats.length - 1].count++;
            stats[stats.length - 1].amount += parseAmt(r.amount);
        }
    });

    const total = rows.length;
    const totalAmt = rows.reduce((s, r) => s + parseAmt(r.amount), 0);

    return (
        <Card title="Payment Methods" sub="Breakdown of how delegates paid their registration fee">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {stats.filter(s => s.count > 0).map((s, i) => {
                    const pct = total ? Math.round((s.count / total) * 100) : 0;
                    const amtPct = totalAmt ? Math.round((s.amount / totalAmt) * 100) : 0;
                    return (
                        <motion.div
                            key={s.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all group"
                            style={{ background: s.bg }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-xl" style={{ background: `${s.color}20`, color: s.color }}>
                                    {s.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                    style={{ background: `${s.color}15`, color: s.color }}>
                                    {pct}%
                                </span>
                            </div>
                            <div className="text-2xl font-black text-gray-900">{s.count.toLocaleString()}</div>
                            <div className="text-xs font-bold text-gray-500 mt-0.5">{s.label}</div>
                            <div className="mt-3 space-y-1.5">
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>Delegates</span>
                                    <span className="font-bold" style={{ color: s.color }}>{pct}%</span>
                                </div>
                                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ background: s.color }}
                                    />
                                </div>
                                {s.amount > 0 && (
                                    <div className="text-[10px] text-gray-400 flex justify-between mt-1">
                                        <span>Revenue</span>
                                        <span className="font-bold text-gray-700">{naira(s.amount)}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary bar */}
            <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Overall Split</div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                    {stats.filter(s => s.count > 0).map((s, i) => {
                        const pct = total ? (s.count / total) * 100 : 0;
                        return (
                            <motion.div
                                key={s.key}
                                initial={{ flex: 0 }}
                                animate={{ flex: pct }}
                                transition={{ duration: 0.9, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                                className="h-full rounded-sm"
                                style={{ background: s.color, minWidth: pct > 0 ? 4 : 0 }}
                                title={`${s.label}: ${Math.round(pct)}%`}
                            />
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                    {stats.filter(s => s.count > 0).map(s => (
                        <div key={s.key} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                            {s.label}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

// ── DCC Spotlight — exact port of BatchSpotlight from reference ───────────────
const ACCENT_COLORS = [
    { primary: '#1a5490', light: '#EFF6FF', text: '#1a5490' },
    { primary: '#6366F1', light: '#EEF2FF', text: '#6366F1' },
    { primary: '#EA580C', light: '#FFF7ED', text: '#EA580C' },
    { primary: '#0EA5E9', light: '#F0F9FF', text: '#0EA5E9' },
    { primary: '#8B5CF6', light: '#F5F3FF', text: '#8B5CF6' },
    { primary: '#EC4899', light: '#FDF2F8', text: '#EC4899' },
    { primary: '#10B981', light: '#ECFDF5', text: '#10B981' },
    { primary: '#F59E0B', light: '#FFFBEB', text: '#B45309' },
];

function SpotDots({ total, current, goTo, color }: {
    total: number; current: number; goTo: (i: number) => void; color: string;
}) {
    return (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {Array.from({ length: total }).map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                    width: i === current ? 20 : 6,
                    height: 6,
                    borderRadius: 99,
                    background: i === current ? color : '#E2E8F0',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                }} />
            ))}
        </div>
    );
}

function DCCSpotlight({ rows }: { rows: Registrant[] }) {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    // Build DCC summaries sorted by delegate count
    const dccMap = new Map<string, { count: number; amount: number; lccs: Set<string> }>();
    rows.forEach(r => {
        const k = r.dcc?.trim() || 'Unknown';
        if (!dccMap.has(k)) dccMap.set(k, { count: 0, amount: 0, lccs: new Set() });
        const d = dccMap.get(k)!;
        d.count++;
        d.amount += parseAmt(r.amount);
        if (r.lcc?.trim()) d.lccs.add(r.lcc.trim());
    });
    const dccs = [...dccMap.entries()]
        .map(([name, d]) => ({ name, count: d.count, amount: d.amount, lccs: d.lccs.size }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const maxCount = Math.max(...dccs.map(d => d.count), 1);
    const maxAmt = Math.max(...dccs.map(d => d.amount), 1);

    // Auto-cycle every 4 s — identical timing to reference
    useEffect(() => {
        if (dccs.length <= 1) return;
        const id = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIndex(p => (p + 1) % dccs.length);
                setVisible(true);
            }, 380);
        }, 4000);
        return () => clearInterval(id);
    }, [dccs.length]);

    const goTo = (i: number) => {
        setVisible(false);
        setTimeout(() => { setIndex(i); setVisible(true); }, 380);
    };

    if (!dccs.length) return null;

    const d = dccs[index];
    const theme = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const regPct = Math.round((d.count / maxCount) * 100);
    const amtPct = Math.round((d.amount / maxAmt) * 100);
    const totalDelegates = rows.length;
    const sharePct = totalDelegates ? Math.round((d.count / totalDelegates) * 100) : 0;

    return (
        <div style={{
            background: '#fff',
            border: `1.5px solid ${theme.primary}30`,
            borderRadius: 20,
            padding: 28,
            boxShadow: `0 4px 24px ${theme.primary}14`,
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Avatar */}
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: theme.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.4s ease',
                    }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: theme.primary, transition: 'color 0.4s ease' }}>
                            {(d.name[0] || 'D').toUpperCase()}
                        </span>
                    </div>

                    {/* Text — fades + slides exactly like reference */}
                    <div style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(8px)',
                        transition: 'opacity 0.38s ease, transform 0.38s ease',
                    }}>
                        <p style={{
                            fontSize: 10, fontWeight: 700, color: theme.primary,
                            textTransform: 'uppercase', letterSpacing: 1.5,
                            marginBottom: 4, transition: 'color 0.4s ease',
                        }}>
                            DCC Spotlight
                        </p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                            {d.name}
                        </p>
                        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>
                            {d.lccs} local church{d.lccs !== 1 ? 'es' : ''} · {sharePct}% of total delegates
                        </p>
                    </div>
                </div>

                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, flexShrink: 0 }}>
                    {index + 1} / {dccs.length}
                </span>
            </div>

            {/* ── Stats — same fade/slide as reference ── */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.38s ease 0.04s, transform 0.38s ease 0.04s',
            }}>
                {/* Delegates */}
                <div style={{ background: theme.light, borderRadius: 14, padding: '18px 20px', transition: 'background 0.4s ease' }}>
                    <p style={{
                        fontSize: 10, color: theme.text, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 1,
                        marginBottom: 6, transition: 'color 0.4s ease',
                    }}>Delegates</p>
                    <p style={{ fontSize: 34, fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1 }}>
                        {d.count.toLocaleString()}
                    </p>
                    <div style={{ marginTop: 10 }}>
                        <div style={{ height: 4, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${regPct}%`,
                                background: theme.primary, borderRadius: 99,
                                transition: 'width 0.6s ease, background 0.4s ease',
                            }} />
                        </div>
                        <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>{regPct}% of top DCC</p>
                    </div>
                </div>

                {/* Revenue */}
                <div style={{ background: theme.light, borderRadius: 14, padding: '18px 20px', transition: 'background 0.4s ease' }}>
                    <p style={{
                        fontSize: 10, color: theme.text, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 1,
                        marginBottom: 6, transition: 'color 0.4s ease',
                    }}>Revenue</p>
                    <p style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1 }}>
                        {naira(d.amount)}
                    </p>
                    <div style={{ marginTop: 10 }}>
                        <div style={{ height: 4, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${amtPct}%`,
                                background: theme.primary, borderRadius: 99,
                                transition: 'width 0.6s ease, background 0.4s ease',
                            }} />
                        </div>
                        <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>{amtPct}% of top DCC</p>
                    </div>
                </div>
            </div>

            {/* ── Dots ── */}
            <SpotDots total={dccs.length} current={index} goTo={goTo} color={theme.primary} />
        </div>
    );
}

// ── Custom searchable dropdown ────────────────────────────────────────────────
function CustomSelect({ options, value, onChange, exclude, color, label }: {
    options: { name: string; count: number }[];
    value: number;
    onChange: (i: number) => void;
    exclude: number;
    color: string;
    label: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = options
        .map((o, i) => ({ ...o, i }))
        .filter(o => o.i !== exclude && o.name.toLowerCase().includes(search.toLowerCase()));

    const selected = options[value];

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                onClick={() => { setOpen(v => !v); setSearch(''); }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border-2 rounded-xl text-left transition-all hover:border-opacity-80"
                style={{ borderColor: open ? color : '#e5e7eb' }}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs font-bold text-gray-900 truncate">
                        {selected ? trunc(selected.name, 22) : 'Select…'}
                    </span>
                    {selected && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${color}18`, color }}>
                            {selected.count}
                        </span>
                    )}
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </motion.div>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                        style={{ boxShadow: `0 8px 32px ${color}20, 0 2px 8px rgba(0,0,0,0.08)` }}
                    >
                        {/* Search */}
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={`Search ${label}…`}
                                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-gray-300 transition-all"
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div className="max-h-52 overflow-y-auto custom-scrollbar">
                            {filtered.length === 0 ? (
                                <div className="px-3 py-4 text-center text-xs text-gray-400">No matches</div>
                            ) : (
                                filtered.map(o => (
                                    <button
                                        key={o.i}
                                        onClick={() => { onChange(o.i); setOpen(false); setSearch(''); }}
                                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors group"
                                        style={{ background: o.i === value ? `${color}08` : undefined }}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            {o.i === value && (
                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                                            )}
                                            <span className={`text-xs truncate ${o.i === value ? 'font-black' : 'font-semibold text-gray-700'}`}
                                                style={{ color: o.i === value ? color : undefined }}>
                                                {o.name}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                                            style={{ background: `${color}15`, color }}>
                                            {o.count}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── DCC Comparison Card ───────────────────────────────────────────────────────
function DCCComparison({ rows }: { rows: Registrant[] }) {
    // Build DCC list
    const dccMap = new Map<string, { count: number; amount: number; lccs: Set<string> }>();
    rows.forEach(r => {
        const k = r.dcc?.trim() || 'Unknown';
        if (!dccMap.has(k)) dccMap.set(k, { count: 0, amount: 0, lccs: new Set() });
        const d = dccMap.get(k)!;
        d.count++;
        d.amount += parseAmt(r.amount);
        if (r.lcc?.trim()) d.lccs.add(r.lcc.trim());
    });
    const dccs = [...dccMap.entries()]
        .map(([name, d]) => ({ name, count: d.count, amount: d.amount, lccs: d.lccs.size, avg: d.count > 0 ? Math.round(d.amount / d.count) : 0 }))
        .sort((a, b) => b.count - a.count);

    // Build LCC list
    const lccMap = new Map<string, { count: number; amount: number }>();
    rows.forEach(r => {
        const k = r.lcc?.trim() || 'Unknown';
        if (!lccMap.has(k)) lccMap.set(k, { count: 0, amount: 0 });
        const d = lccMap.get(k)!;
        d.count++;
        d.amount += parseAmt(r.amount);
    });
    const lccs = [...lccMap.entries()]
        .map(([name, d]) => ({ name, count: d.count, amount: d.amount, avg: d.count > 0 ? Math.round(d.amount / d.count) : 0, lccs: 0 }))
        .sort((a, b) => b.count - a.count);

    const [mode, setMode] = useState<'dcc' | 'lcc'>('dcc');
    const list = mode === 'dcc' ? dccs : lccs;

    const [idxA, setIdxA] = useState(0);
    const [idxB, setIdxB] = useState(1);

    // Reset indices when mode changes
    useEffect(() => { setIdxA(0); setIdxB(Math.min(1, list.length - 1)); }, [mode]);

    if (list.length < 2) return (
        <Card title="Comparison" sub="Need at least 2 entries to compare">
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Not enough data</div>
        </Card>
    );

    const A = list[idxA];
    const B = list[idxB];

    const metrics = [
        { label: 'Delegates', a: A.count, b: B.count, fmt: (v: number) => v.toLocaleString(), colorA: '#1a5490', colorB: '#6366f1' },
        { label: 'Total Revenue', a: A.amount, b: B.amount, fmt: (v: number) => naira(v), colorA: '#10b981', colorB: '#f59e0b' },
        { label: 'Avg per Delegate', a: A.avg, b: B.avg, fmt: (v: number) => naira(v), colorA: '#8b5cf6', colorB: '#ec4899' },
    ];

    const typeLabel = mode === 'dcc' ? 'DCC' : 'LCC';

    return (
        <Card
            title={`${typeLabel} Comparison`}
            sub={`Head-to-head comparison between any two ${mode === 'dcc' ? 'District' : 'Local'} Church Councils`}
        >
            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
                {(['dcc', 'lcc'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                        className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                        style={{
                            background: mode === m ? '#1a5490' : 'transparent',
                            color: mode === m ? 'white' : '#6b7280',
                        }}>
                        {m}
                    </button>
                ))}
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#1a5490] mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1a5490]" /> {typeLabel} A
                    </div>
                    <CustomSelect
                        options={list} value={idxA} onChange={setIdxA}
                        exclude={idxB} color="#1a5490" label={typeLabel}
                    />
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#6366f1] mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#6366f1]" /> {typeLabel} B
                    </div>
                    <CustomSelect
                        options={list} value={idxB} onChange={setIdxB}
                        exclude={idxA} color="#6366f1" label={typeLabel}
                    />
                </div>
            </div>

            {/* Name badges */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                {[{ d: A, color: '#1a5490', bg: '#eff6ff' }, { d: B, color: '#6366f1', bg: '#eef2ff' }].map(({ d, color, bg }, i) => (
                    <div key={i} className="p-3 rounded-xl text-center" style={{ background: bg }}>
                        <div className="text-xs font-black truncate" style={{ color }}>{d.name}</div>
                        <div className="text-[10px] font-semibold mt-0.5" style={{ color: `${color}80` }}>
                            {d.count} delegates · {naira(d.amount)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Metrics */}
            <div className="space-y-5">
                {metrics.map((m, i) => {
                    const max = Math.max(m.a, m.b, 1);
                    const pctA = Math.round((m.a / max) * 100);
                    const pctB = Math.round((m.b / max) * 100);
                    const winner = m.a > m.b ? 'A' : m.b > m.a ? 'B' : 'tie';
                    const diff = m.a !== 0 && m.b !== 0 ? Math.round(Math.abs(m.a - m.b) / Math.min(m.a, m.b) * 100) : 0;

                    return (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">{m.label}</span>
                                {winner !== 'tie' ? (
                                    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                                        style={{ background: winner === 'A' ? '#eff6ff' : '#eef2ff', color: winner === 'A' ? '#1a5490' : '#6366f1' }}>
                                        {winner === 'A' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                        {trunc(winner === 'A' ? A.name : B.name, 14)} +{diff}%
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 px-2 py-0.5 rounded-full bg-gray-50">
                                        <Minus size={10} /> Tied
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[{ val: m.a, pct: pctA, color: m.colorA }, { val: m.b, pct: pctB, color: m.colorB }].map((s, j) => (
                                    <div key={j}>
                                        <div className="flex justify-between text-[10px] mb-1">
                                            <span className="font-bold truncate max-w-[90px]" style={{ color: s.color }}>
                                                {trunc(j === 0 ? A.name : B.name, 12)}
                                            </span>
                                            <span className="font-black text-gray-900">{m.fmt(s.val)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${s.pct}%` }}
                                                transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{ background: s.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsView() {
    const [rows, setRows] = useState<Registrant[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const load = useCallback(async () => {
        if (!isSupabaseConfigured) { setErr('Supabase not configured.'); setLoading(false); return; }
        setLoading(true); setErr('');
        try {
            // Paginated fetch — gets ALL rows, not just the first 1000
            const data = await fetchAllRegistrants('*');
            setRows(data);
        } catch (e: any) {
            setErr(e.message || 'Failed to load.');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const totalAmt = rows.reduce((s, r) => s + parseAmt(r.amount), 0);
    const avgAmt = rows.length ? Math.round(totalAmt / rows.length) : 0;

    const dccAll = buildDist(rows, 'dcc');
    const lccTop = buildDist(rows, 'lcc', 12);
    const posTop = buildDist(rows, 'position', 8);

    // Payment method
    const payMap = new Map<string, number>();
    rows.forEach(r => {
        const pi = (r.payment_info || '').toLowerCase();
        const m = pi.includes('cash') ? 'Cash'
            : (pi.includes('pos') || pi.includes('bank') || pi.includes('transfer') || /\d{6,}/.test(pi)) ? 'POS / Bank'
                : !pi || pi === '-' ? 'Unknown' : 'Other';
        payMap.set(m, (payMap.get(m) || 0) + 1);
    });
    const payData = [...payMap.entries()].map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Revenue per DCC
    const dccAmtMap = new Map<string, number>();
    rows.forEach(r => {
        const k = r.dcc?.trim() || 'Unknown';
        dccAmtMap.set(k, (dccAmtMap.get(k) || 0) + parseAmt(r.amount));
    });
    const dccRevTop = [...dccAmtMap.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value).slice(0, 10);

    // Dual bar data (registrants + revenue per DCC, top 10)
    const dualData = dccAll.slice(0, 10).map(d => ({
        name: trunc(d.name, 12),
        fullName: d.name,
        Registrants: d.value,
        'Revenue (₦k)': Math.round((dccAmtMap.get(d.name) || 0) / 1000),
        avg: d.value > 0 ? Math.round((dccAmtMap.get(d.name) || 0) / d.value) : 0,
    }));

    // ── States ────────────────────────────────────────────────────────────────
    if (loading) return <AnalyticsSkeleton />;

    if (err) return (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p className="text-sm font-semibold">{err}</p>
        </div>
    );

    if (!rows.length) return (
        <div className="flex flex-col items-center justify-center py-28 space-y-4 text-gray-400">
            <BarChart3 size={44} className="opacity-15" />
            <p className="font-bold text-gray-500">No data yet</p>
            <p className="text-sm">Upload registrants from the Status tab first</p>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 pb-12">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[10px] uppercase tracking-[6px] text-[#1a5490] font-black">Convention Analytics</div>
                    <h2 className="text-2xl font-black text-gray-900 mt-0.5">Registration Insights</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {rows.length.toLocaleString()} delegates · {dccAll.length} DCCs · {buildDist(rows, 'lcc').length} LCCs
                    </p>
                </div>
                <button onClick={load}
                    className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-[#1a5490] hover:border-[#1a5490]/30 transition-all mt-1"
                    title="Refresh">
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Kpi label="Total Delegates" value={rows.length.toLocaleString()}
                    icon={<Users size={18} />} color={BLUE} delay={0} />
                <Kpi label="Total Revenue" value={naira(totalAmt)}
                    icon={<DollarSign size={18} />} color="#10b981" delay={0.06} />
                <Kpi label="Avg per Delegate" value={naira(avgAmt)}
                    icon={<TrendingUp size={18} />} color="#f59e0b" delay={0.12} />
                <Kpi label="Top DCC" value={dccAll[0]?.value ?? '—'} sub={dccAll[0]?.name}
                    icon={<Award size={18} />} color="#8b5cf6" delay={0.18} />
            </div>

            {/* ── DCC Spotlight — right after the 4 KPI cards ── */}
            <DCCSpotlight rows={rows} />

            {/* ── Row 1: DCC bar + DCC donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Registrants by DCC" sub="Top 10 District Church Councils" className="lg:col-span-3">
                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dccAll.slice(0, 10)} margin={{ top: 4, right: 8, left: 0, bottom: 68 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                    angle={-38} textAnchor="end" interval={0} tickLine={false} axisLine={false}
                                    tickFormatter={v => trunc(v, 14)} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CT />} />
                                <Bar dataKey="value" name="Registrants" radius={[6, 6, 0, 0]} maxBarSize={42}>
                                    {dccAll.slice(0, 10).map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="DCC Distribution" sub="Share of total delegates" className="lg:col-span-2">
                    <DonutWithLegend data={dccAll} height={180} />
                </Card>
            </div>

            {/* ── Row 2: Revenue by DCC + Payment methods donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Revenue by DCC" sub="Top 10 by total amount collected" className="lg:col-span-3">
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dccRevTop} margin={{ top: 4, right: 8, left: 8, bottom: 68 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                    angle={-38} textAnchor="end" interval={0} tickLine={false} axisLine={false}
                                    tickFormatter={v => trunc(v, 14)} />
                                <YAxis tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CT />} />
                                <Bar dataKey="value" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={42}>
                                    {dccRevTop.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Payment Methods" sub="How delegates paid" className="lg:col-span-2">
                    <DonutWithLegend data={payData} height={180} />
                </Card>
            </div>

            {/* ── Payment Methods — detailed card ── */}
            <PaymentMethodsCard rows={rows} />

            {/* ── DCC Comparison ── */}
            <DCCComparison rows={rows} />

            {/* ── Row 3: Avg amount per DCC area chart ── */}
            <Card title="Avg Amount per Delegate by DCC" sub="Top 10 DCCs — average registration fee collected">
                <div style={{ width: '100%', height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dualData} margin={{ top: 4, right: 8, left: 8, bottom: 68 }}>
                            <defs>
                                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.18} />
                                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                angle={-38} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
                                tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CT />} />
                            <Area type="monotone" dataKey="avg" name="Avg Amount" stroke={BLUE} strokeWidth={2.5}
                                fill="url(#avgGrad)"
                                dot={{ fill: '#fff', stroke: BLUE, strokeWidth: 2.5, r: 4 }}
                                activeDot={{ r: 6, fill: BLUE }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* ── Row 4: LCC horizontal bars + Position donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Top Local Church Councils" sub="Registrants by LCC (top 12)" className="lg:col-span-3">
                    <div style={{ width: '100%', height: Math.max(260, lccTop.length * 30) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lccTop} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" width={136}
                                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                                    tickLine={false} axisLine={false}
                                    tickFormatter={v => trunc(v, 20)} />
                                <Tooltip content={<CT />} />
                                <Bar dataKey="value" name="Registrants" radius={[0, 6, 6, 0]} maxBarSize={18}>
                                    {lccTop.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Position Breakdown" sub="Church roles of delegates" className="lg:col-span-2">
                    <DonutWithLegend data={posTop} height={200} />
                </Card>
            </div>

            {/* ── Row 5: Dual bar — registrants vs revenue ── */}
            <Card title="DCC — Registrants vs Revenue" sub="Side-by-side comparison for top 10 DCCs">
                <div className="flex items-center gap-5 mb-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: BLUE }} />
                        Registrants
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full inline-block bg-emerald-500" />
                        Revenue (₦k)
                    </span>
                </div>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dualData} margin={{ top: 4, right: 8, left: 8, bottom: 68 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                angle={-38} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="r" orientation="right" tickFormatter={v => `${v}k`}
                                tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CT />} />
                            <Bar yAxisId="l" dataKey="Registrants" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={18} />
                            <Bar yAxisId="r" dataKey="Revenue (₦k)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* ── Row 6: Leaderboards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="DCC Leaderboard" sub="Top 10 District Church Councils by delegates">
                    <Board data={dccAll} />
                </Card>
                <Card title="LCC Leaderboard" sub="Top 10 Local Church Councils by delegates">
                    <Board data={lccTop} />
                </Card>
            </div>

        </div>
    );
}
