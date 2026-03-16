'use client'

import { useState, useCallback } from 'react'
import { executeReadOnlyQuery, PRESET_QUERIES } from '@/actions/admin-query'
import { Database, Play, Clock, AlertTriangle, ChevronDown, Copy, Check } from 'lucide-react'

type QueryResult = {
  success: boolean
  data?: Record<string, unknown>[]
  columns?: string[]
  rowCount?: number
  duration?: number
  error?: string
  truncated?: boolean
}

export default function SqlExplorer() {
  const [sql, setSql] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [copied, setCopied] = useState(false)

  const runQuery = useCallback(async () => {
    if (!sql.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await executeReadOnlyQuery(sql)
      setResult(res)
    } catch {
      setResult({ success: false, error: 'Error de red' })
    } finally {
      setLoading(false)
    }
  }, [sql, loading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runQuery()
    }
  }

  const copyAsCSV = useCallback(() => {
    if (!result?.data?.length || !result.columns) return
    const header = result.columns.join(',')
    const rows = result.data.map((row) =>
      result.columns!.map((col) => {
        const val = row[col]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    )
    navigator.clipboard.writeText([header, ...rows].join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black flex items-center gap-3 text-slate-900 dark:text-white">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Database size={16} />
          </div>
          SQL Explorer
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            Presets <ChevronDown size={12} className={showPresets ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {showPresets && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
              {Object.entries(PRESET_QUERIES).map(([name, query]) => (
                <button
                  key={name}
                  onClick={() => { setSql(query); setShowPresets(false); setResult(null) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-500 mb-3">
        Read-only. SELECT, WITH, EXPLAIN. Max 500 rows, 10s timeout. <span className="text-slate-400">Ctrl+Enter para ejecutar.</span>
      </p>

      <div className="relative">
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="SELECT * FROM &quot;Club&quot; LIMIT 10"
          rows={4}
          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-y"
          spellCheck={false}
        />
        <button
          onClick={runQuery}
          disabled={loading || !sql.trim()}
          className="absolute bottom-3 right-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 dark:disabled:bg-zinc-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-500/20"
        >
          {loading ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play size={12} />
          )}
          {loading ? 'Ejecutando...' : 'Ejecutar'}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {result.success ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {result.rowCount} {result.rowCount === 1 ? 'fila' : 'filas'}
                  {result.truncated && ' (truncado)'}
                </span>
              ) : (
                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle size={10} /> Error
                </span>
              )}
              {result.duration !== undefined && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={10} /> {result.duration}ms
                </span>
              )}
            </div>
            {result.success && result.data && result.data.length > 0 && (
              <button
                onClick={copyAsCSV}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copiado' : 'Copiar CSV'}
              </button>
            )}
          </div>

          {/* Error display */}
          {!result.success && result.error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 font-mono text-xs text-red-400 whitespace-pre-wrap">
              {result.error}
            </div>
          )}

          {/* Data table */}
          {result.success && result.data && result.data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900 sticky top-0">
                  <tr>
                    {result.columns?.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-200 dark:border-white/10">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {result.data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      {result.columns?.map((col) => (
                        <td key={col} className="px-3 py-2 text-slate-700 dark:text-zinc-300 font-mono whitespace-nowrap max-w-[300px] truncate">
                          {row[col] === null ? (
                            <span className="text-slate-300 dark:text-zinc-600 italic">null</span>
                          ) : row[col] instanceof Date ? (
                            (row[col] as Date).toISOString()
                          ) : typeof row[col] === 'object' ? (
                            JSON.stringify(row[col])
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.success && result.data?.length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-sm">
              Query ejecutada correctamente, sin resultados.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
