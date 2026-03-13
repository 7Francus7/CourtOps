export default function Loading() {
  return (
    <div className="h-full w-full p-6 lg:p-8 flex flex-col gap-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-muted rounded-xl" />
        <div className="h-8 w-32 bg-muted rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-16 bg-muted rounded-2xl" />
        <div className="h-16 bg-muted rounded-2xl" />
        <div className="h-16 bg-muted rounded-2xl" />
        <div className="h-16 bg-muted rounded-2xl" />
        <div className="h-16 bg-muted rounded-2xl" />
        <div className="h-16 bg-muted rounded-2xl" />
      </div>
    </div>
  )
}
