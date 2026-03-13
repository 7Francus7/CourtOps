export default function Loading() {
  return (
    <div className="h-full w-full p-6 lg:p-8 flex flex-col gap-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-muted rounded-xl" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-muted rounded-xl" />
        <div className="h-10 w-24 bg-muted rounded-xl" />
        <div className="h-10 w-24 bg-muted rounded-xl" />
        <div className="h-10 w-24 bg-muted rounded-xl" />
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-10 w-32 bg-muted rounded-xl" />
      </div>
    </div>
  )
}
