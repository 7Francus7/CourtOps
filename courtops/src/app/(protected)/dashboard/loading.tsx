export default function Loading() {
  return (
    <div className="h-full w-full p-6 lg:p-8 flex flex-col gap-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-muted rounded-xl" />
        <div className="h-8 w-32 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-muted rounded-2xl" />
        <div className="h-24 bg-muted rounded-2xl" />
        <div className="h-24 bg-muted rounded-2xl" />
        <div className="h-24 bg-muted rounded-2xl" />
      </div>
      <div className="flex-1 bg-muted rounded-2xl" />
    </div>
  )
}
