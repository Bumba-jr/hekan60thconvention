import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Users, Search, ChevronRight, X, Phone, Mail, CreditCard,
    MapPin, RefreshCw, TrendingUp, DollarSign, Building2, Church,
    AlertCircle, Loader2, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { supabase, isSupabaseConfigured, Registrant, fetchAllRegistrants } from '../lib/supabase';
import XlsxUploader from './XlsxUploader';
import { RegistrantsSkeleton } from './Skeleton';

type GroupBy = 'dcc' | 'lcc';

interface GroupData {
    name: string;
    count: number;
    members: Registrant[];
    totalAmount: number;
}

function parseAmount(raw: string): number {
    return parseFloat((raw || '').replace(/[^0-9.]/g, '')) || 0;
}

function formatAmount(n: number): string {
    return `₦${n.toLocaleString()}`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }: {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; color: string;
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group" style={{ height: 180 }}>
            <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl transition-all group-hover:scale-110" style={{ background: `${color}15`, color }}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">{label}</div>
            {sub && <div className="text-[10px] text-gray-400 mt-1 truncate">{sub}</div>}
        </div>
    );
}

// ── Cycling District Card (DCC or LCC) ────────────────────────────────────────
function DistrictStatCard({ registrants, type }: {
    registrants: Registrant[];
    type: 'dcc' | 'lcc';
}) {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);

    // Build sorted list
    const map = new Map<string, { count: number; amount: number }>();
    registrants.forEach(r => {
        const k = (type === 'dcc' ? r.dcc : r.lcc)?.trim() || 'Unknown';
        if (!map.has(k)) map.set(k, { count: 0, amount: 0 });
        map.get(k)!.count++;
        map.get(k)!.amount += parseAmount(r.amount);
    });
    const list = [...map.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.count - a.count);

    const total = list.length;
    const maxCount = list[0]?.count || 1;

    useEffect(() => {
        if (list.length <= 1) return;
        const id = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIdx(p => (p + 1) % list.length);
                setVisible(true);
            }, 300);
        }, 3000);
        return () => clearInterval(id);
    }, [list.length]);

    const current = list[idx];
    const color = type === 'dcc' ? '#6366f1' : '#f59e0b';
    const bg = type === 'dcc' ? '#eef2ff' : '#fffbeb';
    const label = type === 'dcc' ? 'DCCs' : 'LCCs';
    const fullLabel = type === 'dcc' ? 'District Church Councils' : 'Local Church Councils';
    const Icon = type === 'dcc' ? Building2 : Church;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden" style={{ height: 180 }}>
            {/* Top row */}
            <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl" style={{ background: bg, color }}>
                    <Icon size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
                    {total}
                </span>
            </div>

            {/* Count + label */}
            <div className="text-2xl font-black text-gray-900 leading-none">{total}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-0.5 mb-auto">{label}</div>

            {/* Animated current item */}
            <div className="mt-3 pt-2.5 border-t border-gray-50">
                <AnimatePresence mode="wait">
                    {current && visible && (
                        <motion.div key={`${type}-${idx}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.22 }}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-bold text-gray-700 truncate flex-1">{current.name}</span>
                                <span className="text-[9px] text-gray-400 flex-shrink-0">{idx + 1}/{total}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black" style={{ color }}>
                                    {current.count} delegate{current.count !== 1 ? 's' : ''}
                                </span>
                                <span className="text-[10px] text-gray-300">·</span>
                                <span className="text-[10px] text-emerald-600 font-bold">{formatAmount(current.amount)}</span>
                            </div>
                            <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    key={`bar-${type}-${idx}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((current.count / maxCount) * 100)}%` }}
                                    transition={{ duration: 0.45, ease: 'easeOut' }}
                                    className="h-full rounded-full" style={{ background: color }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ── Registrant Detail Panel ───────────────────────────────────────────────────
function RegistrantPanel({ reg, onClose }: { reg: Registrant; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div>
                    <div className="text-[10px] uppercase tracking-[4px] text-[#1a5490] font-black mb-1">Registrant</div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">{reg.full_name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{reg.position || '—'}</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                    <X size={18} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {[
                    { icon: <Building2 size={15} />, label: 'DCC', value: reg.dcc },
                    { icon: <Church size={15} />, label: 'LCC', value: reg.lcc },
                    { icon: <Phone size={15} />, label: 'Phone', value: reg.phone },
                    { icon: <Mail size={15} />, label: 'Email', value: reg.email },
                    { icon: <CreditCard size={15} />, label: 'Payment', value: reg.payment_info },
                    { icon: <DollarSign size={15} />, label: 'Amount', value: reg.amount },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-1.5 bg-white rounded-lg text-[#1a5490] shadow-sm flex-shrink-0 mt-0.5">{icon}</div>
                        <div className="min-w-0">
                            <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{label}</div>
                            <div className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value || '—'}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* S/No badge */}
            {reg.s_no && (
                <div className="p-4 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">S/No: {reg.s_no}</span>
                </div>
            )}
        </motion.div>
    );
}

// ── Group Row ─────────────────────────────────────────────────────────────────
function GroupRow({ group, onSelect }: { group: GroupData; onSelect: (r: Registrant) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = group.members.filter(m =>
        !search || m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.position.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
    );

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Group header */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-all text-left"
            >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-[#1a5490]">{(group.name[0] || '?').toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{group.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                        {group.count} registrant{group.count !== 1 ? 's' : ''}
                        {group.totalAmount > 0 && <span className="ml-2 text-[#1a5490] font-semibold">{formatAmount(group.totalAmount)}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-white bg-[#1a5490] px-2.5 py-1 rounded-full">{group.count}</span>
                    {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>

            {/* Members list */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-100"
                    >
                        {/* Search within group */}
                        {group.members.length > 5 && (
                            <div className="px-4 py-2 border-b border-gray-50">
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search in group…"
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-[#1a5490] transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto custom-scrollbar">
                            {filtered.map((reg, i) => (
                                <button
                                    key={reg.id || i}
                                    onClick={() => onSelect(reg)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/40 transition-all text-left group/row"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-gray-500 group-hover/row:bg-[#1a5490] group-hover/row:text-white transition-all">
                                        {(reg.full_name[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-800 truncate">{reg.full_name}</div>
                                        <div className="text-[10px] text-gray-400 truncate">{reg.position || '—'}</div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {reg.amount && <span className="text-[10px] font-bold text-[#1a5490]">{reg.amount}</span>}
                                        <ChevronRight size={13} className="text-gray-300 group-hover/row:text-[#1a5490] transition-colors" />
                                    </div>
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <div className="px-4 py-6 text-center text-xs text-gray-400">No matches</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegistrantsView() {
    const [registrants, setRegistrants] = useState<Registrant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [groupBy, setGroupBy] = useState<GroupBy>('dcc');
    const [globalSearch, setGlobalSearch] = useState('');
    const [selectedReg, setSelectedReg] = useState<Registrant | null>(null);
    const [showUploader, setShowUploader] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [clearing, setClearing] = useState(false);

    const fetchAll = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setError('Supabase not configured.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Use paginated fetch to get ALL rows (bypasses 1000-row Supabase limit)
            const data = await fetchAllRegistrants('*');
            setRegistrants(data);
        } catch (e: any) {
            setError(e.message || 'Failed to load registrants.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Realtime updates
    useEffect(() => {
        if (!isSupabaseConfigured) return;
        const channel = supabase
            .channel('registrants-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, fetchAll)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchAll]);

    const clearAll = async () => {
        setClearing(true);
        try {
            // Delete all rows — using a filter that matches everything
            const { error: err } = await supabase
                .from('registrations')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');
            if (err) throw err;
            setRegistrants([]);
            setShowClearConfirm(false);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setClearing(false);
        }
    };

    // ── Derived data ─────────────────────────────────────────────────────────
    const filtered = globalSearch
        ? registrants.filter(r =>
            r.full_name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            r.dcc.toLowerCase().includes(globalSearch.toLowerCase()) ||
            r.lcc.toLowerCase().includes(globalSearch.toLowerCase()) ||
            r.position.toLowerCase().includes(globalSearch.toLowerCase()) ||
            r.phone.includes(globalSearch)
        )
        : registrants;

    const groups: GroupData[] = (() => {
        const map = new Map<string, Registrant[]>();
        filtered.forEach(r => {
            const key = (groupBy === 'dcc' ? r.dcc : r.lcc)?.trim() || 'Unknown';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(r);
        });
        return Array.from(map.entries())
            .map(([name, members]) => ({
                name,
                count: members.length,
                members,
                totalAmount: members.reduce((s, m) => s + parseAmount(m.amount), 0),
            }))
            .sort((a, b) => b.count - a.count);
    })();

    const totalAmount = registrants.reduce((s, r) => s + parseAmount(r.amount), 0);
    const uniqueDCCs = new Set(registrants.map(r => r.dcc?.trim()).filter(Boolean)).size;
    const uniqueLCCs = new Set(registrants.map(r => r.lcc?.trim()).filter(Boolean)).size;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 relative">
            {/* Selected registrant panel */}
            <AnimatePresence>
                {selectedReg && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
                            onClick={() => setSelectedReg(null)}
                        />
                        <RegistrantPanel reg={selectedReg} onClose={() => setSelectedReg(null)} />
                    </>
                )}
            </AnimatePresence>

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="text-[10px] uppercase tracking-[6px] text-[#1a5490] font-black">Convention Status</div>
                    <h2 className="text-2xl font-black text-gray-900 mt-0.5">Registrants</h2>
                    {!loading && <p className="text-sm text-gray-400 mt-0.5">{registrants.length.toLocaleString()} total delegates</p>}
                </div>
                {/* Buttons hidden — re-enable when needed */}
            </div>

            {/* Clear confirm */}
            <AnimatePresence>
                {showClearConfirm && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                        <div>
                            <p className="text-sm font-bold text-red-700">Clear all {registrants.length} registrants?</p>
                            <p className="text-xs text-red-400 mt-0.5">This permanently deletes all records from the database.</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-white transition-all">Cancel</button>
                            <button onClick={clearAll} disabled={clearing} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all flex items-center gap-1.5">
                                {clearing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Delete All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* XLSX Uploader */}
            <AnimatePresence>
                {showUploader && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-black text-gray-900">Import Registrants</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Upload an Excel file — columns: Name, DCC, LCC, Position, Phone, Email, Amount</p>
                                </div>
                            </div>
                            <XlsxUploader onSuccess={() => { setShowUploader(false); fetchAll(); }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            {!loading && registrants.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Delegates" value={registrants.length.toLocaleString()} icon={<Users size={18} />} color="#1a5490" />
                    <StatCard label="Total Revenue" value={formatAmount(totalAmount)} icon={<DollarSign size={18} />} color="#10b981" />
                    <DistrictStatCard registrants={registrants} type="dcc" />
                    <DistrictStatCard registrants={registrants} type="lcc" />
                </div>
            )}

            {/* Loading skeleton */}
            {loading && <RegistrantsSkeleton />}

            {/* Error */}
            {error && !loading && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p className="text-sm font-semibold">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && registrants.length === 0 && (
                <div className="text-center py-20 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Users size={28} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-500">No registrants yet</p>
                        <p className="text-sm text-gray-400 mt-1">Upload an Excel file to get started</p>
                    </div>
                    <button
                        onClick={() => setShowUploader(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a5490] text-white rounded-xl text-sm font-bold hover:bg-[#154070] transition-all"
                    >
                        <TrendingUp size={15} /> Upload XLSX
                    </button>
                </div>
            )}

            {/* Controls: search + group by */}
            {!loading && registrants.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            value={globalSearch}
                            onChange={e => setGlobalSearch(e.target.value)}
                            placeholder="Search by name, DCC, LCC, position, phone…"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5490] transition-all shadow-sm"
                        />
                        {globalSearch && (
                            <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setGroupBy('dcc')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === 'dcc' ? 'bg-[#1a5490] text-white' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Building2 size={12} /> By DCC
                        </button>
                        <button
                            onClick={() => setGroupBy('lcc')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === 'lcc' ? 'bg-[#1a5490] text-white' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Church size={12} /> By LCC
                        </button>
                    </div>
                </div>
            )}

            {/* Search result count */}
            {globalSearch && !loading && (
                <p className="text-xs text-gray-400">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="font-semibold text-gray-600">{globalSearch}</span>"
                </p>
            )}

            {/* Groups */}
            {!loading && groups.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {groups.length} {groupBy === 'dcc' ? 'District Church Councils' : 'Local Church Councils'}
                        </p>
                        <p className="text-xs text-gray-400">{filtered.length} registrants shown</p>
                    </div>
                    {groups.map((group, i) => (
                        <GroupRow key={`${group.name}-${i}`} group={group} onSelect={setSelectedReg} />
                    ))}
                </div>
            )}

            {/* No search results */}
            {!loading && globalSearch && filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Search size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No registrants match "<span className="font-semibold">{globalSearch}</span>"</p>
                </div>
            )}
        </div>
    );
}
