import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured, Registrant } from '../lib/supabase';

interface Props {
    onSuccess: () => void;
}

// Map flexible column headers from the XLSX to our schema
// paymentOverride: if provided, forces the payment_info field (online reg — all POS/Bank)
// For manual reg, pass no override — let the row columns decide
function mapRow(headers: string[], row: any[], paymentOverride?: string): Registrant | null {
    const get = (keys: string[]) => {
        for (const k of keys) {
            const idx = headers.findIndex(h => h.toLowerCase().includes(k.toLowerCase()));
            if (idx !== -1 && row[idx] !== undefined && row[idx] !== null && String(row[idx]).trim() !== '') {
                return String(row[idx]).trim();
            }
        }
        return '';
    };

    const fullName = get(['full name', 'name', 'fullname']);
    if (!fullName) return null;

    // Skip summary/footer rows
    const nameLower = fullName.toLowerCase().trim();
    if (
        nameLower === 'total' || nameLower === 'total amount' || nameLower === 'grand total' ||
        nameLower === 'subtotal' || nameLower.startsWith('total ') || nameLower.endsWith(' total')
    ) return null;

    // ── Payment detection for manual reg sheet ────────────────────────────────
    // Manual reg columns: "Cash" and "Bank (POS) Transfer"
    // Online reg: paymentOverride forces "POS / Bank Transfer" for all rows
    let payment_info: string;

    if (paymentOverride) {
        payment_info = paymentOverride;
    } else {
        // Find "Cash" column — exact match first, then partial
        const cashIdx = (() => {
            const exact = headers.findIndex(h => h.trim().toLowerCase() === 'cash');
            if (exact >= 0) return exact;
            return headers.findIndex(h => h.trim().toLowerCase().startsWith('cash'));
        })();

        // Find "Bank (POS) Transfer" column — must contain "bank" and ("pos" or "transfer")
        const bankIdx = (() => {
            const exact = headers.findIndex(h => h.trim().toLowerCase() === 'bank (pos) transfer');
            if (exact >= 0) return exact;
            return headers.findIndex(h => {
                const hl = h.trim().toLowerCase();
                return hl.includes('bank') && (hl.includes('pos') || hl.includes('transfer'));
            });
        })();

        const hasValue = (v: string) => {
            const vl = v.trim().toLowerCase();
            return vl !== '' && vl !== 'n/a' && vl !== 'na' && vl !== '-' && vl !== '0' && vl !== 'nil';
        };

        const cashVal = cashIdx >= 0 ? String(row[cashIdx] ?? '') : '';
        const bankVal = bankIdx >= 0 ? String(row[bankIdx] ?? '') : '';

        const isCash = hasValue(cashVal);
        const isBank = hasValue(bankVal);

        if (isCash && !isBank) {
            payment_info = 'Cash';
        } else if (isBank) {
            // Bank transfer (whether or not cash is also filled)
            payment_info = 'POS / Bank Transfer';
        } else {
            // Fallback — try generic payment column
            payment_info = get(['payment', 'receipt', 'transaction']) || 'Unknown';
        }
    }

    return {
        s_no: get(['s/no', 'sno', 's_no', 'serial', 'no.']),
        full_name: fullName,
        position: get(['position', 'role', 'title']),
        dcc: get(['dcc', 'district']),
        lcc: get(['lcc', 'local']),
        phone: get(['phone', 'mobile', 'tel', 'contact']),
        email: get(['email', 'e-mail', 'mail']),
        payment_info,
        amount: get(['amount', 'fee', 'paid']),
    };
}

// Detect sheet type from name
function isOnlineSheet(sheetName: string): boolean {
    const n = sheetName.toLowerCase();
    return n.includes('online') || n.includes('transfer') || n.includes('pos');
}

function isManualSheet(sheetName: string): boolean {
    const n = sheetName.toLowerCase();
    return n.includes('manual') || n.includes('cash');
}

// Parse one worksheet into rows
function parseSheet(wb: XLSX.WorkBook, sheetName: string): Registrant[] {
    const ws = wb.Sheets[sheetName];
    const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (raw.length < 2) return [];

    // Find header row
    let headerIdx = 0;
    for (let i = 0; i < Math.min(raw.length, 6); i++) {
        const joined = raw[i].join(' ').toLowerCase();
        if (joined.includes('name') || joined.includes('s/no') || joined.includes('dcc')) {
            headerIdx = i;
            break;
        }
    }

    const headers = raw[headerIdx].map((h: any) => String(h).trim());

    // Online reg → force POS/Bank Transfer for every row
    // Manual reg → no override, let mapRow read the Cash/Bank columns per row
    const paymentOverride = isOnlineSheet(sheetName) ? 'POS / Bank Transfer' : undefined;

    return raw
        .slice(headerIdx + 1)
        .map(r => mapRow(headers, r, paymentOverride))
        .filter(Boolean) as Registrant[];
}

export default function XlsxUploader({ onSuccess }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<Registrant[]>([]);
    const [fileName, setFileName] = useState('');
    const [status, setStatus] = useState<'idle' | 'parsed' | 'saving' | 'done' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [sheetInfo, setSheetInfo] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const parseFile = (file: File) => {
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            setErrorMsg('Please upload an Excel (.xlsx / .xls) or CSV file.');
            setStatus('error');
            return;
        }
        setFileName(file.name);
        setStatus('idle');
        setErrorMsg('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });

                // Parse ALL sheets and combine — each sheet gets its own payment method
                const allRows: Registrant[] = [];
                const sheetSummary: string[] = [];

                for (const sheetName of wb.SheetNames) {
                    const rows = parseSheet(wb, sheetName);
                    if (rows.length > 0) {
                        allRows.push(...rows);
                        const method = isOnlineSheet(sheetName)
                            ? 'POS / Bank Transfer'
                            : isManualSheet(sheetName)
                                ? 'Cash + POS/Bank (per row)'
                                : 'mixed';
                        sheetSummary.push(`"${sheetName}" → ${rows.length} rows (${method})`);
                    }
                }

                if (allRows.length === 0) {
                    setErrorMsg('No valid registrant rows found across any sheet. Check column headers.');
                    setStatus('error');
                    return;
                }

                console.log('Sheets parsed:', sheetSummary.join(' | '));
                setPreview(allRows);
                setSheetInfo(sheetSummary);
                setStatus('parsed');
            } catch (err) {
                setErrorMsg('Failed to parse file. Make sure it is a valid Excel/CSV.');
                setStatus('error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) parseFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) parseFile(file);
    };

    const saveToSupabase = async () => {
        if (!isSupabaseConfigured) {
            setErrorMsg('Supabase is not configured. Add your API keys to .env.local');
            setStatus('error');
            return;
        }
        setStatus('saving');
        try {
            // Insert in chunks of 500
            const chunkSize = 500;
            for (let i = 0; i < preview.length; i += chunkSize) {
                const chunk = preview.slice(i, i + chunkSize);
                const { error } = await supabase.from('registrations').insert(chunk);
                if (error) throw error;
            }
            setStatus('done');
            setTimeout(() => {
                onSuccess();
                setStatus('idle');
                setPreview([]);
                setFileName('');
            }, 1500);
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to save to database.');
            setStatus('error');
        }
    };

    const reset = () => {
        setStatus('idle');
        setPreview([]);
        setFileName('');
        setErrorMsg('');
        setShowPreview(false);
        setSheetInfo([]);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => status === 'idle' && inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${isDragging ? 'border-[#1a5490] bg-blue-50' : 'border-gray-200 hover:border-[#1a5490]/50 hover:bg-gray-50'}
          ${status !== 'idle' && status !== 'error' ? 'cursor-default' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    hidden
                    onChange={handleFileChange}
                />

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                                <Upload size={26} className="text-[#1a5490]" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Drop your Excel file here</p>
                                <p className="text-sm text-gray-400 mt-1">or click to browse — .xlsx, .xls, .csv</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'parsed' && (
                        <motion.div key="parsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                                <FileSpreadsheet size={26} className="text-green-600" />
                            </div>
                            <p className="font-bold text-gray-800">{fileName}</p>
                            <p className="text-sm text-green-600 font-semibold">{preview.length} registrants parsed from {sheetInfo.length} sheet{sheetInfo.length !== 1 ? 's' : ''}</p>
                            {sheetInfo.length > 0 && (
                                <div className="space-y-1 mt-1">
                                    {sheetInfo.map((s, i) => (
                                        <p key={i} className="text-[10px] text-gray-400">{s}</p>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {status === 'saving' && (
                        <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <Loader2 size={32} className="animate-spin text-[#1a5490] mx-auto" />
                            <p className="font-bold text-gray-700">Saving {preview.length} records to database…</p>
                        </motion.div>
                    )}

                    {status === 'done' && (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <CheckCircle2 size={36} className="text-green-500 mx-auto" />
                            <p className="font-bold text-green-700">Saved successfully!</p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <AlertCircle size={32} className="text-red-400 mx-auto" />
                            <p className="font-bold text-red-600">Upload failed</p>
                            <p className="text-sm text-red-400">{errorMsg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            {status === 'parsed' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        <Eye size={15} />
                        {showPreview ? 'Hide' : 'Preview'} ({preview.length})
                    </button>
                    <button
                        onClick={saveToSupabase}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a5490] text-white rounded-xl text-sm font-bold hover:bg-[#154070] transition-all"
                    >
                        Save to Database
                    </button>
                    <button onClick={reset} className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-all">
                        <X size={16} />
                    </button>
                </motion.div>
            )}

            {status === 'error' && (
                <button onClick={reset} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
                    Try Again
                </button>
            )}

            {/* Preview table */}
            <AnimatePresence>
                {showPreview && preview.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto max-h-64 custom-scrollbar">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            {['#', 'Name', 'Position', 'DCC', 'LCC', 'Phone', 'Payment', 'Amount'].map(h => (
                                                <th key={h} className="px-3 py-2.5 font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(0, 50).map((r, i) => (
                                            <tr key={i} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors">
                                                <td className="px-3 py-2 text-gray-400">{r.s_no || i + 1}</td>
                                                <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{r.full_name}</td>
                                                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.position}</td>
                                                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.dcc}</td>
                                                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.lcc}</td>
                                                <td className="px-3 py-2 text-gray-500">{r.phone}</td>
                                                <td className="px-3 py-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-full font-bold ${r.payment_info === 'Cash' ? 'bg-green-50 text-green-700' : r.payment_info === 'POS / Bank Transfer' ? 'bg-blue-50 text-[#1a5490]' : 'bg-gray-50 text-gray-500'}`}>
                                                        {r.payment_info || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 font-semibold text-[#1a5490]">{r.amount}</td>
                                            </tr>
                                        ))}
                                        {preview.length > 50 && (
                                            <tr className="border-t border-gray-50">
                                                <td colSpan={8} className="px-3 py-2 text-center text-gray-400 text-xs">
                                                    … and {preview.length - 50} more rows
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
