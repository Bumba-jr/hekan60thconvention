import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env ?? {};
const supabaseUrl: string = env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// ── Types ────────────────────────────────────────────────────────────────────
export interface Registrant {
    id?: string;
    s_no: string;
    full_name: string;
    position: string;
    dcc: string;
    lcc: string;
    phone: string;
    email: string;
    payment_info: string;
    amount: string;
    created_at?: string;
}

// ── Paginated fetch — bypasses Supabase's 1000-row default limit ─────────────
// Fetches ALL rows by paginating in chunks of 1000.
export async function fetchAllRegistrants(columns = '*'): Promise<Registrant[]> {
    const PAGE = 1000;
    const all: Registrant[] = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from('registrations')
            .select(columns)
            .range(from, from + PAGE - 1)
            .order('full_name', { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) break;

        all.push(...(data as Registrant[]));
        if (data.length < PAGE) break; // last page reached
        from += PAGE;
    }

    return all;
}
