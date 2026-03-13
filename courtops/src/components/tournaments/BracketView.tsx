'use client'

import React, { useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check, Clock, Minus, Trophy, ZoomIn, ZoomOut } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ---------------------
// Types
// ---------------------

interface Team {
       id: string
       name: string
       player1Name?: string
       player2Name?: string
}

interface Match {
       id: string
       categoryId: string
       round: string
       homeTeamId?: string | null
       awayTeamId?: string | null
       homeTeam?: Team | null
       awayTeam?: Team | null
       homeScore?: string | null
       awayScore?: string | null
       winnerId?: string | null
       status: string
       startTime?: string | null
}

interface BracketViewProps {
       matches: Match[]
       onEditMatch?: (match: Match) => void
}

// ---------------------
// Helpers
// ---------------------

/** Map round labels to a numeric order for building the bracket tree. */
function getRoundOrder(round: string): number {
       const lower = round.toLowerCase()
       if (lower.includes('final') && !lower.includes('semi') && !lower.includes('cuarto') && !lower.includes('quarter') && !lower.includes('octav')) return 100
       if (lower.includes('semi')) return 90
       if (lower.includes('cuarto') || lower.includes('quarter')) return 80
       if (lower.includes('octav') || lower.includes('eighth') || lower.includes('octavos')) return 70
       if (lower.includes('16') || lower.includes('dieciseis')) return 60
       // group phase is lowest
       if (lower.includes('grupo') || lower.includes('group') || lower.includes('fase')) return 10
       // Round N - try numeric
       const numMatch = round.match(/(\d+)/)
       if (numMatch) return parseInt(numMatch[1], 10)
       return 50
}

/** Determine a user-friendly round label. */
function getRoundLabel(round: string, totalRounds: number, roundIndex: number, t: (key: string) => string): string {
       const lower = round.toLowerCase()
       if (lower.includes('final') && !lower.includes('semi') && !lower.includes('cuarto') && !lower.includes('quarter')) return t('bracket_final')
       if (lower.includes('semi')) return t('bracket_semifinals')
       if (lower.includes('cuarto') || lower.includes('quarter')) return t('bracket_quarterfinals')
       if (lower.includes('octav') || lower.includes('eighth') || lower.includes('octavos')) return t('bracket_round_of_16')
       // For generic rounds, label them
       if (roundIndex === totalRounds - 1) return t('bracket_final')
       if (roundIndex === totalRounds - 2 && totalRounds > 2) return t('bracket_semifinals')
       if (roundIndex === totalRounds - 3 && totalRounds > 3) return t('bracket_quarterfinals')
       return `${t('bracket_round')} ${roundIndex + 1}`
}

function organizeMatchesByRound(matches: Match[]): { round: string; matches: Match[] }[] {
       // Group by round string
       const roundMap = new Map<string, Match[]>()
       for (const match of matches) {
              const key = match.round || 'Unknown'
              if (!roundMap.has(key)) roundMap.set(key, [])
              roundMap.get(key)!.push(match)
       }

       // Sort rounds by order
       const rounds = Array.from(roundMap.entries())
              .map(([round, roundMatches]) => ({ round, matches: roundMatches, order: getRoundOrder(round) }))
              .sort((a, b) => a.order - b.order)

       return rounds.map(r => ({ round: r.round, matches: r.matches }))
}

/** Check if matches represent an elimination bracket (not purely round-robin/group stage). */
export function hasEliminationMatches(matches: Match[]): boolean {
       if (matches.length === 0) return false
       const rounds = organizeMatchesByRound(matches)
       if (rounds.length <= 1) return false
       // If there's at least one round that is NOT group phase, it's elimination
       return rounds.some(r => {
              const lower = r.round.toLowerCase()
              return !(lower.includes('grupo') || lower.includes('group') || lower.includes('fase'))
       })
}

// ---------------------
// Sub-components
// ---------------------

function MatchCard({ match, onEdit, animationDelay }: { match: Match; onEdit?: (m: Match) => void; animationDelay: number }) {
       const { t } = useLanguage()

       const isCompleted = match.status === 'COMPLETED'
       const isInProgress = match.status === 'IN_PROGRESS'
       const homeWon = match.winnerId === match.homeTeamId
       const awayWon = match.winnerId === match.awayTeamId

       const borderColor = isCompleted
              ? 'border-green-500/40'
              : isInProgress
                     ? 'border-amber-500/40'
                     : 'border-border'

       const glowColor = isCompleted
              ? 'shadow-green-500/5'
              : isInProgress
                     ? 'shadow-amber-500/5'
                     : ''

       return (
              <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     transition={{ duration: 0.35, delay: animationDelay, ease: 'easeOut' }}
                     onClick={() => onEdit?.(match)}
                     className={cn(
                            'w-[220px] bg-card border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg group relative',
                            borderColor,
                            glowColor && `shadow-md ${glowColor}`
                     )}
              >
                     {/* Status indicator bar */}
                     <div className={cn(
                            'h-0.5 w-full',
                            isCompleted ? 'bg-green-500' : isInProgress ? 'bg-amber-500' : 'bg-muted'
                     )} />

                     <div className="p-3 space-y-1.5">
                            {/* Home Team Row */}
                            <div className={cn(
                                   'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition-colors',
                                   homeWon ? 'bg-green-500/10' : 'hover:bg-muted/30'
                            )}>
                                   <div className="flex items-center gap-2 min-w-0 flex-1">
                                          {homeWon && (
                                                 <Trophy size={10} className="text-green-500 shrink-0" />
                                          )}
                                          <span className={cn(
                                                 'text-xs font-bold truncate',
                                                 homeWon ? 'text-green-500' : 'text-foreground'
                                          )}>
                                                 {match.homeTeam?.name || `${t('bracket_tbd')}`}
                                          </span>
                                   </div>
                                   <span className={cn(
                                          'text-xs font-black tabular-nums shrink-0',
                                          homeWon ? 'text-green-500' : match.homeScore ? 'text-foreground' : 'text-muted-foreground/30'
                                   )}>
                                          {match.homeScore || <Minus size={10} className="text-muted-foreground/20" />}
                                   </span>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border/50 mx-1" />

                            {/* Away Team Row */}
                            <div className={cn(
                                   'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition-colors',
                                   awayWon ? 'bg-green-500/10' : 'hover:bg-muted/30'
                            )}>
                                   <div className="flex items-center gap-2 min-w-0 flex-1">
                                          {awayWon && (
                                                 <Trophy size={10} className="text-green-500 shrink-0" />
                                          )}
                                          <span className={cn(
                                                 'text-xs font-bold truncate',
                                                 awayWon ? 'text-green-500' : 'text-foreground'
                                          )}>
                                                 {match.awayTeam?.name || `${t('bracket_tbd')}`}
                                          </span>
                                   </div>
                                   <span className={cn(
                                          'text-xs font-black tabular-nums shrink-0',
                                          awayWon ? 'text-green-500' : match.awayScore ? 'text-foreground' : 'text-muted-foreground/30'
                                   )}>
                                          {match.awayScore || <Minus size={10} className="text-muted-foreground/20" />}
                                   </span>
                            </div>
                     </div>

                     {/* Bottom status badge */}
                     <div className={cn(
                            'flex items-center justify-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider border-t',
                            isCompleted ? 'bg-green-500/5 text-green-500 border-green-500/20' :
                                   isInProgress ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' :
                                          'bg-muted/30 text-muted-foreground border-border/50'
                     )}>
                            {isCompleted ? (
                                   <><Check size={8} /> {t('status_COMPLETED')}</>
                            ) : isInProgress ? (
                                   <><Clock size={8} /> {t('status_IN_PROGRESS')}</>
                            ) : (
                                   <><Clock size={8} /> {t('status_PENDING')}</>
                            )}
                     </div>
              </motion.div>
       )
}

/** SVG connector lines between rounds. */
function ConnectorLines({ matchCount, nextMatchCount, roundHeight }: { matchCount: number; nextMatchCount: number; roundHeight: number }) {
       if (nextMatchCount === 0 || matchCount === 0) return null

       // Each match card is roughly 100px tall with spacing
       const matchCardHeight = 100
       const totalGap = roundHeight

       const lines: React.ReactNode[] = []

       for (let i = 0; i < nextMatchCount; i++) {
              // Each next-round match corresponds to 2 current-round matches
              const topMatchIdx = i * 2
              const bottomMatchIdx = i * 2 + 1

              if (topMatchIdx >= matchCount) break

              // Calculate vertical positions
              const topMatchCenter = (topMatchIdx / matchCount) * totalGap + matchCardHeight / 2
              const nextMatchCenter = (i / nextMatchCount) * totalGap + matchCardHeight / 2

              // Line from top match to merge point
              lines.push(
                     <line
                            key={`top-${i}`}
                            x1="0"
                            y1={topMatchCenter}
                            x2="20"
                            y2={nextMatchCenter}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-border"
                            strokeLinecap="round"
                     />
              )

              if (bottomMatchIdx < matchCount) {
                     const bottomMatchCenter = (bottomMatchIdx / matchCount) * totalGap + matchCardHeight / 2
                     lines.push(
                            <line
                                   key={`bottom-${i}`}
                                   x1="0"
                                   y1={bottomMatchCenter}
                                   x2="20"
                                   y2={nextMatchCenter}
                                   stroke="currentColor"
                                   strokeWidth="1.5"
                                   className="text-border"
                                   strokeLinecap="round"
                            />
                     )
              }

              // Horizontal line to next round
              lines.push(
                     <line
                            key={`h-${i}`}
                            x1="20"
                            y1={nextMatchCenter}
                            x2="40"
                            y2={nextMatchCenter}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-border"
                            strokeLinecap="round"
                     />
              )
       }

       return (
              <svg
                     className="shrink-0"
                     width="40"
                     height={totalGap + matchCardHeight}
                     style={{ minHeight: totalGap + matchCardHeight }}
              >
                     {lines}
              </svg>
       )
}

// ---------------------
// Main BracketView Component
// ---------------------

export default function BracketView({ matches, onEditMatch }: BracketViewProps) {
       const { t } = useLanguage()
       const containerRef = useRef<HTMLDivElement>(null)
       const [zoom, setZoom] = useState(1)

       // Filter out group-stage matches; only show elimination bracket
       const eliminationMatches = useMemo(() => {
              return matches.filter(m => {
                     const lower = (m.round || '').toLowerCase()
                     return !(lower.includes('grupo') || lower.includes('group') || lower.includes('fase de grupos'))
              })
       }, [matches])

       const rounds = useMemo(() => organizeMatchesByRound(eliminationMatches), [eliminationMatches])

       // If all matches are group stage, show a message
       if (rounds.length === 0) {
              return (
                     <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border/50 border-dashed">
                            <Trophy className="mx-auto text-foreground/20 mb-4" size={40} />
                            <p className="text-muted-foreground text-sm font-medium">{t('bracket_no_elimination')}</p>
                     </div>
              )
       }

       // Calculate the max matches in any round (first round usually has the most)
       const maxMatches = Math.max(...rounds.map(r => r.matches.length))
       const matchCardHeight = 100 // Approximate height of each match card + gap
       const totalHeight = maxMatches * matchCardHeight

       const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.5))
       const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5))

       return (
              <div className="space-y-4">
                     {/* Zoom Controls */}
                     <div className="flex items-center gap-2 justify-end">
                            <button
                                   onClick={handleZoomOut}
                                   className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
                                   aria-label={t('bracket_zoom_out')}
                            >
                                   <ZoomOut size={16} />
                            </button>
                            <span className="text-xs font-bold text-muted-foreground tabular-nums w-12 text-center">
                                   {Math.round(zoom * 100)}%
                            </span>
                            <button
                                   onClick={handleZoomIn}
                                   className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
                                   aria-label={t('bracket_zoom_in')}
                            >
                                   <ZoomIn size={16} />
                            </button>
                     </div>

                     {/* Scrollable Bracket Container */}
                     <div
                            ref={containerRef}
                            className="overflow-x-auto overflow-y-auto pb-4 -mx-2 px-2"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                     >
                            <div
                                   className="inline-flex items-start gap-0 min-w-max"
                                   style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                            >
                                   {rounds.map((round, roundIndex) => {
                                          const roundLabel = getRoundLabel(round.round, rounds.length, roundIndex, t)
                                          const isFinal = roundIndex === rounds.length - 1
                                          const nextRound = rounds[roundIndex + 1]

                                          return (
                                                 <React.Fragment key={round.round}>
                                                        {/* Round Column */}
                                                        <div className="flex flex-col items-center shrink-0">
                                                               {/* Round Header */}
                                                               <motion.div
                                                                      initial={{ opacity: 0, y: -10 }}
                                                                      animate={{ opacity: 1, y: 0 }}
                                                                      transition={{ duration: 0.3, delay: roundIndex * 0.1 }}
                                                                      className={cn(
                                                                             'mb-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm',
                                                                             isFinal
                                                                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                                    : 'bg-muted/50 text-muted-foreground border-border/50'
                                                                      )}
                                                               >
                                                                      {isFinal && <Trophy size={10} className="inline mr-1.5 -mt-0.5" />}
                                                                      {roundLabel}
                                                               </motion.div>

                                                               {/* Matches in this round */}
                                                               <div
                                                                      className="flex flex-col items-center"
                                                                      style={{
                                                                             justifyContent: 'space-around',
                                                                             minHeight: totalHeight,
                                                                             display: 'flex',
                                                                      }}
                                                               >
                                                                      {round.matches.map((match, matchIndex) => (
                                                                             <div key={match.id} className="py-2">
                                                                                    <MatchCard
                                                                                           match={match}
                                                                                           onEdit={onEditMatch}
                                                                                           animationDelay={roundIndex * 0.15 + matchIndex * 0.05}
                                                                                    />
                                                                             </div>
                                                                      ))}
                                                               </div>
                                                        </div>

                                                        {/* Connector lines between rounds */}
                                                        {nextRound && (
                                                               <div
                                                                      className="flex items-center shrink-0"
                                                                      style={{ minHeight: totalHeight, paddingTop: '40px' /* offset for header */ }}
                                                               >
                                                                      <ConnectorLines
                                                                             matchCount={round.matches.length}
                                                                             nextMatchCount={nextRound.matches.length}
                                                                             roundHeight={totalHeight}
                                                                      />
                                                               </div>
                                                        )}
                                                 </React.Fragment>
                                          )
                                   })}

                                   {/* Champion placeholder after final */}
                                   {rounds.length > 0 && (() => {
                                          const finalRound = rounds[rounds.length - 1]
                                          const finalMatch = finalRound.matches[0]
                                          const champion = finalMatch?.winnerId
                                                 ? (finalMatch.winnerId === finalMatch.homeTeamId ? finalMatch.homeTeam : finalMatch.awayTeam)
                                                 : null

                                          return (
                                                 <div
                                                        className="flex flex-col items-center justify-center shrink-0 ml-4"
                                                        style={{ minHeight: totalHeight }}
                                                 >
                                                        <motion.div
                                                               initial={{ opacity: 0, scale: 0.8 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               transition={{ duration: 0.5, delay: rounds.length * 0.15 }}
                                                               className={cn(
                                                                      'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed',
                                                                      champion
                                                                             ? 'border-yellow-500/40 bg-yellow-500/5'
                                                                             : 'border-border/30 bg-muted/10'
                                                               )}
                                                        >
                                                               <Trophy
                                                                      size={28}
                                                                      className={cn(
                                                                             champion ? 'text-yellow-500' : 'text-muted-foreground/20'
                                                                      )}
                                                               />
                                                               <span className={cn(
                                                                      'text-xs font-black uppercase tracking-widest',
                                                                      champion ? 'text-yellow-500' : 'text-muted-foreground/40'
                                                               )}>
                                                                      {champion ? champion.name : t('bracket_champion')}
                                                               </span>
                                                        </motion.div>
                                                 </div>
                                          )
                                   })()}
                            </div>
                     </div>
              </div>
       )
}
