import { motion } from 'framer-motion';

export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton animate-pulse ${className}`} />
);

export const StatCardSkeleton = () => (
    <div className="card">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-4 h-4 rounded" />
        </div>
        <Skeleton className="w-16 h-8 rounded-lg mb-2" />
        <Skeleton className="w-24 h-4 rounded" />
    </div>
);

export const VideoCardSkeleton = () => (
    <div className="glass-card overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4 rounded" />
            <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
            </div>
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <tr className="border-b border-slate-700/50">
        <td className="p-4">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                </div>
            </div>
        </td>
        <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
        <td className="p-4"><Skeleton className="h-4 w-8 rounded" /></td>
        <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
        <td className="p-4"><Skeleton className="h-4 w-20 rounded" /></td>
        <td className="p-4">
            <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
        </td>
    </tr>
);

export const VideoDetailSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
    </div>
);

export const ListSkeleton = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="card flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
        ))}
    </div>
);
