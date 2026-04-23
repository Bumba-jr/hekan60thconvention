// Shared skeleton components used across loading states

export function SkeletonBox({ className = '' }: { className?: string }) {
    return (
        <div
            className={`bg-gray-200 rounded-xl animate-pulse ${className}`}
            style={{ animationDuration: '1.4s' }}
        />
    );
}

// ── Registrants skeleton ──────────────────────────────────────────────────────
export function RegistrantsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <SkeletonBox className="h-3 w-32" />
                    <SkeletonBox className="h-7 w-48" />
                    <SkeletonBox className="h-3 w-40" />
                </div>
                <div className="flex gap-2">
                    <SkeletonBox className="h-9 w-9 rounded-xl" />
                    <SkeletonBox className="h-9 w-9 rounded-xl" />
                    <SkeletonBox className="h-9 w-28 rounded-xl" />
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex justify-between">
                            <SkeletonBox className="h-10 w-10 rounded-xl" />
                            <SkeletonBox className="h-5 w-12 rounded-full" />
                        </div>
                        <SkeletonBox className="h-7 w-20" />
                        <SkeletonBox className="h-3 w-28" />
                    </div>
                ))}
            </div>

            {/* Search + toggle */}
            <div className="flex gap-3">
                <SkeletonBox className="h-10 flex-1 rounded-xl" />
                <SkeletonBox className="h-10 w-36 rounded-xl" />
            </div>

            {/* Group rows */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    <SkeletonBox className="h-3 w-40" />
                    <SkeletonBox className="h-3 w-24" />
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                        <SkeletonBox className="h-10 w-10 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <SkeletonBox className="h-4 w-48" />
                            <SkeletonBox className="h-3 w-32" />
                        </div>
                        <SkeletonBox className="h-6 w-10 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Analytics skeleton ────────────────────────────────────────────────────────
export function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <SkeletonBox className="h-3 w-36" />
                    <SkeletonBox className="h-7 w-52" />
                    <SkeletonBox className="h-3 w-64" />
                </div>
                <SkeletonBox className="h-9 w-9 rounded-xl" />
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                        <SkeletonBox className="h-10 w-10 rounded-xl" />
                        <SkeletonBox className="h-7 w-24" />
                        <SkeletonBox className="h-3 w-28" />
                    </div>
                ))}
            </div>

            {/* Spotlight card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                    <SkeletonBox className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                        <SkeletonBox className="h-3 w-24" />
                        <SkeletonBox className="h-6 w-48" />
                        <SkeletonBox className="h-3 w-36" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <SkeletonBox className="h-3 w-20" />
                            <SkeletonBox className="h-8 w-16" />
                            <SkeletonBox className="h-1.5 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <SkeletonBox className="h-5 w-48" />
                    <SkeletonBox className="h-3 w-36" />
                    {/* Bar chart skeleton */}
                    <div className="flex items-end gap-2 h-48 pt-4">
                        {[65, 85, 45, 70, 55, 90, 40, 75, 60, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end">
                                <SkeletonBox className="w-full rounded-t-lg" style={{ height: `${h}%` }} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <SkeletonBox className="h-5 w-36" />
                    <SkeletonBox className="h-3 w-28" />
                    {/* Donut skeleton */}
                    <div className="flex justify-center py-4">
                        <div className="w-36 h-36 rounded-full border-[20px] border-gray-200 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <SkeletonBox className="h-2 w-2 rounded-full flex-shrink-0" />
                                <SkeletonBox className="h-3 flex-1" />
                                <SkeletonBox className="h-3 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Second chart row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <SkeletonBox className="h-5 w-44" />
                    <SkeletonBox className="h-3 w-32" />
                    <div className="flex items-end gap-2 h-40 pt-4">
                        {[50, 70, 40, 85, 60, 75, 45, 90, 55, 65].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end">
                                <SkeletonBox className="w-full rounded-t-lg" style={{ height: `${h}%` }} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <SkeletonBox className="h-5 w-32" />
                    <SkeletonBox className="h-3 w-24" />
                    <div className="flex justify-center py-4">
                        <div className="w-32 h-32 rounded-full border-[18px] border-gray-200 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <SkeletonBox className="h-2 w-2 rounded-full flex-shrink-0" />
                                <SkeletonBox className="h-3 flex-1" />
                                <SkeletonBox className="h-3 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Intro / App splash skeleton ───────────────────────────────────────────────
export function IntroSkeleton() {
    return (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden">
            {/* Top bar skeleton */}
            <div className="h-1 bg-gray-100">
                <div className="h-full w-1/3 bg-gray-200 animate-pulse rounded-full" />
            </div>

            {/* Main content area — mimics the intro scene layout */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
                {/* Logo area */}
                <div className="flex flex-col items-center gap-4">
                    <SkeletonBox className="h-4 w-64 rounded-full" />
                    <SkeletonBox className="h-20 w-72 rounded-2xl" />
                    <SkeletonBox className="h-3 w-48 rounded-full" />
                </div>

                {/* Divider */}
                <SkeletonBox className="h-px w-24 rounded-full" />

                {/* Subtitle */}
                <div className="flex flex-col items-center gap-2">
                    <SkeletonBox className="h-4 w-56 rounded-full" />
                    <SkeletonBox className="h-3 w-40 rounded-full" />
                </div>
            </div>

            {/* Bottom nav dots */}
            <div className="flex justify-center gap-3 pb-12">
                {[...Array(11)].map((_, i) => (
                    <div key={i}
                        className={`h-0.5 rounded-full bg-gray-200 animate-pulse ${i === 0 ? 'w-16' : 'w-4'}`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                    />
                ))}
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-gray-100 w-full">
                <div className="h-full w-0 bg-gray-300 animate-pulse" />
            </div>
        </div>
    );
}
