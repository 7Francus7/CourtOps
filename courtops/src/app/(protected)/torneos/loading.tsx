import { Skeleton } from '@/components/ui/skeleton'

export default function TorneosLoading() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-3xl overflow-hidden">
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-32" />
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center space-y-1">
                    <Skeleton className="h-5 w-8 mx-auto" />
                    <Skeleton className="h-2 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
