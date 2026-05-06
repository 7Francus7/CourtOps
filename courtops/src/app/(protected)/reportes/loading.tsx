import { Skeleton } from '@/components/ui/skeleton'

export default function ReportesLoading() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="sticky top-0 z-40 flex min-h-14 items-center justify-between border-b border-border bg-card px-4 md:min-h-16 md:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-6">
          <section className="rounded-[2rem] border border-border/60 bg-card/60 p-5 md:p-7">
            <Skeleton className="mb-4 h-6 w-36 rounded-full" />
            <Skeleton className="mb-3 h-10 w-80 max-w-full" />
            <Skeleton className="mb-6 h-4 w-full max-w-[760px]" />
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-[1.75rem] border border-border/60 bg-card/50 p-5">
                <Skeleton className="mb-4 h-3 w-28" />
                <Skeleton className="mb-4 h-10 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
            <section className="rounded-[2rem] border border-border/60 bg-card/55 p-5 md:p-6">
              <Skeleton className="mb-3 h-5 w-48" />
              <Skeleton className="mb-5 h-4 w-full max-w-[520px]" />
              <div className="grid gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="mt-6 h-[320px] rounded-[1.5rem]" />
            </section>

            <section className="rounded-[2rem] border border-border/60 bg-card/55 p-5 md:p-6">
              <Skeleton className="mb-3 h-5 w-40" />
              <Skeleton className="mb-5 h-4 w-full max-w-[280px]" />
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-2xl" />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
