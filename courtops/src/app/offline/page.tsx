export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6">
        <div className="w-20 h-20 rounded-3xl bg-[#00e676]/10 flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="#00e676" stroke="none" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Sin conexión</h1>
        <p className="text-white/50 text-sm max-w-xs">
          Verificá tu conexión a internet e intentá de nuevo.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-2xl bg-[#00e676] text-black font-semibold text-sm"
      >
        Reintentar
      </button>
    </main>
  )
}
