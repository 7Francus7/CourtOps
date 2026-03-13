import { Skeleton } from '@/components/ui/skeleton'

export default function CajaLoading() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <Skeleton className="h-9 w-52" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-10 w-36 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-11 w-36 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-card border border-border/50 rounded-xl p-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
