'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, Settings, Plus, Trash2, Sword, LayoutGrid, Search, UserPlus, AlertCircle, ChevronsUpDown, Check, Clock, Share2, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createCategory, deleteCategory, createTeam, deleteTeam, searchClients, createClientWithCategory, generateFixture, deleteFixture, setMatchResult, updateTournament, deleteTournament } from '@/actions/tournaments'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

const getCategoryValue = (cat: string): number | null => {
       if (!cat) return null;
       const match = cat.match(/\d+/);
       return match ? parseInt(match[0], 10) : null;
};

const isAllowedToPlay = (playerCat: string, tournamentCat: string): { allowed: boolean; reason?: string } => {
       if (!playerCat || !tournamentCat) return { allowed: true };

       const pVal = getCategoryValue(playerCat);
       const tVal = getCategoryValue(tournamentCat);
       const isSumTournament = tournamentCat.toLowerCase().includes('suma');

       if (pVal !== null && tVal !== null) {
              if (isSumTournament) return { allowed: true };
              if (pVal < tVal) {
                     return {
                            allowed: false,
                            reason: `Nivel superior`
                     };
              }
              return { allowed: true };
       }

       const pLow = playerCat.toLowerCase();
       const tLow = tournamentCat.toLowerCase();

       if (!isSumTournament && pLow !== tLow && !pLow.includes(tLow) && !tLow.includes(pLow)) {
              return { allowed: false, reason: "Categoría no coincide" };
       }

       return { allowed: true };
};

const validateTeamSum = (p1Cat: string, p2Cat: string, tournamentCat: string): { allowed: boolean; reason?: string } => {
       if (!tournamentCat.toLowerCase().includes('suma')) return { allowed: true };

       const tLimit = getCategoryValue(tournamentCat);
       const v1 = getCategoryValue(p1Cat);
       const v2 = getCategoryValue(p2Cat);

       if (tLimit !== null && v1 !== null && v2 !== null) {
              const teamSum = v1 + v2;
              if (teamSum < tLimit) {
                     return {
                            allowed: false,
                            reason: `Suma ${teamSum} es superior al nivel permitido (mínimo ${tLimit})`
                     };
              }
       }
       return { allowed: true };
};

export default function TournamentDetailClient({ tournament }: { tournament: any }) {
       const router = useRouter()
       const { t } = useLanguage()
       const [activeTab, setActiveTab] = useState('overview')
       const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false)
       const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

       return (
              <div className="p-6 max-w-7xl mx-auto space-y-6">
                     {/* Header */}
                     <div className="flex flex-col gap-4">
                            <Link href="/torneos" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors w-fit group">
                                   <div className="p-1.5 rounded-full bg-muted group-hover:bg-accent transition-colors">
                                          <ArrowLeft size={14} />
                                   </div>
                                   {t('back_to_tournaments')}
                            </Link>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                   <div>
                                          <div className="flex items-center gap-3 mb-2">
                                                 <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
                                                        tournament.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                               tournament.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                 )}>
                                                        {tournament.status === 'DRAFT' ? t('draft') : tournament.status === 'ACTIVE' ? t('active') : t('completed')}
                                                 </div>
                                                 <span className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {format(new Date(tournament.startDate), "d 'de' MMMM, yyyy", { locale: es })}
                                                 </span>
                                          </div>
                                          <h1 className="text-4xl font-black text-foreground tracking-tight">{tournament.name}</h1>
                                   </div>

                                   <div className="flex gap-2 w-full md:w-auto">
                                          <button
                                                 onClick={() => {
                                                        const url = `${window.location.origin}/torneo/${tournament.id}`
                                                        navigator.clipboard.writeText(url)
                                                        toast.success(t('public_link_copied'))
                                                 }}
                                                 className="flex-1 md:flex-none justify-center bg-card hover:bg-muted border border-border text-foreground font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95"
                                          >
                                                 <Share2 size={16} className="text-[var(--primary)]" />
                                                 {t('public_link')}
                                          </button>
                                          <button
                                                 onClick={() => setIsSettingsModalOpen(true)}
                                                 className="flex-1 md:flex-none justify-center bg-muted/50 hover:bg-muted text-foreground font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                                          >
                                                 <Settings size={16} />
                                                 {t('configure')}
                                          </button>
                                   </div>
                            </div>

                            {/* ... tabs ... */}
                            <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar pb-1">
                                   <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutGrid} label={t('overview')} />
                                   <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={Trophy} label={t('categories')} count={tournament.categories.length} />
                                   <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} icon={Users} label={t('inscriptions')} count={tournament.categories.reduce((acc: any, cat: any) => acc + cat.teams.length, 0)} />
                                   <TabButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} icon={Sword} label={t('matches')} count={tournament.matches?.length} />
                            </div>
                     </div>

                     {/* Content Content */}
                     <div className="min-h-[400px]">
                            {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
                            {activeTab === 'categories' && <CategoriesTab tournament={tournament} onAdd={() => setIsCreateCategoryModalOpen(true)} />}
                            {activeTab === 'teams' && <TeamsTab tournament={tournament} />}
                            {activeTab === 'matches' && <MatchesTab tournament={tournament} />}
                     </div>

                     <CreateCategoryModal
                            isOpen={isCreateCategoryModalOpen}
                            onClose={() => setIsCreateCategoryModalOpen(false)}
                            tournamentId={tournament.id}
                     />
                     <TournamentSettingsModal
                            isOpen={isSettingsModalOpen}
                            onClose={() => setIsSettingsModalOpen(false)}
                            tournament={tournament}
                            router={router}
                     />
              </div>
       )
}

function TabButton({ active, onClick, icon: Icon, label, count }: any) {
       return (
              <button
                     onClick={onClick}
                     className={cn(
                            "group relative flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap outline-none",
                            active
                                   ? "border-[var(--primary)] text-[var(--primary)]"
                                   : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
                     )}
              >
                     <Icon size={16} className={cn("transition-colors", active ? "text-[var(--primary)]" : "text-muted-foreground group-hover:text-foreground")} />
                     {label}
                     {count !== undefined && count > 0 && (
                            <span className={cn(
                                   "ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-black",
                                   active ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-muted text-muted-foreground"
                            )}>
                                   {count}
                            </span>
                     )}
              </button>
       )
}

function OverviewTab({ tournament }: { tournament: any }) {
       const { t } = useLanguage()
       return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                     <StatsCard label={t('categories')} value={tournament.categories.length} icon={Trophy} color="text-yellow-500" />
                     {/* Simple count of teams across all categories */}
                     <StatsCard
                            label={t('registered_pairs')}
                            value={tournament.categories.reduce((acc: any, cat: any) => acc + cat.teams.length, 0)}
                            icon={Users}
                            color="text-blue-500"
                     />
                     <StatsCard label={t('scheduled_matches')} value={tournament.matches?.length || 0} icon={Sword} color="text-green-500" />

                     <div className="col-span-full bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-foreground mb-4">{t('tournament_status')}</h3>
                            {tournament.categories.length === 0 ? (
                                   <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                                          <Trophy className="w-12 h-12 opacity-20" />
                                          <p>{t('no_categories')}</p>
                                          <p className="text-sm">{t('go_to_categories')}</p>
                                   </div>
                            ) : (
                                   <div className="space-y-4">
                                          {tournament.categories.map((cat: any) => (
                                                 <div key={cat.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                               <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-foreground/70 font-bold border border-border">
                                                                      {cat.name.substring(0, 2)}
                                                               </div>
                                                               <div>
                                                                      <h4 className="font-bold text-foreground">{cat.name}</h4>
                                                                      <p className="text-xs text-muted-foreground font-medium">
                                                                             {cat.teams.length} {t('pairs')} • {
                                                                                    cat.gender === 'MALE' ? t('male') :
                                                                                           cat.gender === 'FEMALE' ? t('female') : t('mixed')
                                                                             }
                                                                      </p>
                                                               </div>
                                                        </div>
                                                        <div className="text-right">
                                                               <span className="text-sm font-black text-[var(--primary)]">${cat.price}</span>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                            )}
                     </div>
              </div>
       )
}

function StatsCard({ label, value, icon: Icon, color }: any) {
       return (
              <div className="bg-card shadow-sm border border-border rounded-2xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Icon size={80} />
                     </div>
                     <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{label}</p>
                            <p className={`text-4xl font-extrabold mt-2 ${color}`}>{value}</p>
                     </div>
              </div>
       )
}

function CategoriesTab({ tournament, onAdd }: { tournament: any, onAdd: () => void }) {
       const { t } = useLanguage()
       const handleDelete = async (id: string) => {
              if (confirm(t('delete_category_confirm'))) {
                     const res = await deleteCategory(id)
                     if (res.success) {
                            toast.success(t('category_deleted'))
                     } else {
                            toast.error(t('error_deleting'))
                     }
              }
       }

       return (
              <div className="space-y-6 animate-in fade-in duration-300">
                     <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-foreground">{t('enabled_categories')}</h3>
                            <button
                                   onClick={onAdd}
                                   className="bg-primary hover:brightness-110 text-primary-foreground text-sm font-black py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                   <Plus size={18} />
                                   {t('new_category')}
                            </button>
                     </div>

                     {tournament.categories.length === 0 ? (
                            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/50 border-dashed hover:bg-muted/30 transition-colors">
                                   <Trophy className="mx-auto text-foreground/20 mb-4" size={48} />
                                   <p className="text-muted-foreground text-sm font-medium">{t('no_categories')}</p>
                            </div>
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {tournament.categories.map((cat: any) => (
                                          <div key={cat.id} className="bg-card shadow-sm p-6 rounded-2xl border border-border flex justify-between items-start group hover:border-[var(--primary)]/30 transition-all">
                                                 <div>
                                                        <h4 className="text-xl font-black text-foreground">{cat.name}</h4>
                                                        <div className="flex gap-2 mt-2">
                                                               <span className={cn(
                                                                      "text-[10px] font-bold px-2 py-1 rounded",
                                                                      cat.gender === 'MALE' ? "bg-blue-500/10 text-blue-500" :
                                                                             cat.gender === 'FEMALE' ? "bg-pink-500/10 text-pink-500" : "bg-purple-500/10 text-purple-500"
                                                               )}>
                                                                      {cat.gender === 'MALE' ? t('male') : cat.gender === 'FEMALE' ? t('female') : t('mixed')}
                                                               </span>
                                                               <span className="text-[10px] font-bold bg-green-500/10 px-2 py-1 rounded text-green-500 border border-green-500/20">
                                                                      ${cat.price}
                                                               </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-4 font-medium flex items-center gap-1.5">
                                                               <Users size={14} className="text-muted-foreground/70" />
                                                               {cat.teams.length} {t('registered_pairs')}
                                                        </p>
                                                 </div>
                                                 <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="text-muted-foreground/40 hover:text-red-500 p-2 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg"
                                                 >
                                                        <Trash2 size={18} />
                                                 </button>
                                          </div>
                                   ))}
                            </div>
                     )}
              </div>
       )
}

function TeamsTab({ tournament }: { tournament: any }) {
       const { t } = useLanguage()
       const [selectedCategory, setSelectedCategory] = useState<string>(tournament.categories[0]?.id || '')
       const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false)

       // Ensure we have a valid selection or default to first
       const activeCategoryId = selectedCategory || tournament.categories[0]?.id
       const activeCategory = tournament.categories.find((c: any) => c.id === activeCategoryId)

       const handleDeleteTeam = async (teamId: string) => {
              if (confirm(t('delete_pair_confirm'))) {
                     await deleteTeam(teamId)
                     toast.success(t('pair_deleted'))
              }
       }

       if (tournament.categories.length === 0) {
              return (
                     <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/50 border-dashed">
                            <Trophy className="mx-auto text-foreground/20 mb-4" size={48} />
                            <p className="text-muted-foreground font-medium">{t('no_categories')}</p>
                            <p className="text-sm text-muted-foreground/50">{t('go_to_categories')}</p>
                     </div>
              )
       }

       return (
              <div className="space-y-6 animate-in fade-in duration-300">
                     <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card shadow-sm p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                                   {tournament.categories.map((cat: any) => (
                                          <button
                                                 key={cat.id}
                                                 onClick={() => setSelectedCategory(cat.id)}
                                                 className={cn(
                                                        "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border",
                                                        activeCategoryId === cat.id
                                                               ? "bg-[var(--primary)] text-primary-foreground border-[var(--primary)] shadow-sm"
                                                               : "bg-transparent text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                                                 )}
                                          >
                                                 {cat.name}
                                          </button>
                                   ))}
                            </div>
                            <button
                                   onClick={() => setIsAddTeamModalOpen(true)}
                                   className="bg-primary hover:brightness-110 text-primary-foreground text-sm font-black py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0 transition-all active:scale-95"
                            >
                                   <Plus size={18} />
                                   {t('register_pair')}
                            </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {!activeCategory || activeCategory.teams.length === 0 ? (
                                   <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl border border-border/50 border-dashed">
                                          <Users className="mx-auto text-foreground/20 mb-4" size={40} />
                                          <p className="text-muted-foreground text-sm font-medium">{t('no_pairs_in_category')}</p>
                                   </div>
                            ) : (
                                   activeCategory.teams.map((team: any) => (
                                          <div key={team.id} className="bg-card shadow-sm p-5 rounded-2xl border border-border group hover:border-[var(--primary)]/30 transition-all hover:shadow-md">
                                                 <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                               <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1 block opacity-70">{t('pair_registered')}</span>
                                                               <h4 className="font-black text-foreground text-lg leading-tight flex items-center gap-1.5">
                                                                      {team.player1Name}
                                                                      <span className="text-foreground/20 font-light">&</span>
                                                                      {team.player2Name}
                                                               </h4>
                                                        </div>
                                                        <button
                                                               onClick={() => handleDeleteTeam(team.id)}
                                                               className="text-muted-foreground/40 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                                                        >
                                                               <Trash2 size={16} />
                                                        </button>
                                                 </div>
                                                 <div className="space-y-2.5">
                                                        <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/50">
                                                               <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-black text-xs border border-blue-500/20">J1</div>
                                                               <div>
                                                                      <p className="text-sm font-bold text-foreground/90">{team.player1Name}</p>
                                                                      <p className="text-[10px] font-medium text-muted-foreground">{team.player1Phone || t('no_phone')}</p>
                                                               </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/50">
                                                               <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-black text-xs border border-purple-500/20">J2</div>
                                                               <div>
                                                                      <p className="text-sm font-bold text-foreground/90">{team.player2Name}</p>
                                                                      <p className="text-[10px] font-medium text-muted-foreground">{team.player2Phone || t('no_phone')}</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   ))
                            )}
                     </div>

                     <CreateTeamModal
                            isOpen={isAddTeamModalOpen}
                            onClose={() => setIsAddTeamModalOpen(false)}
                            categoryId={activeCategoryId}
                            categoryName={activeCategory?.name}
                     />
              </div>
       )
}

function MatchesTab({ tournament }: { tournament: any }) {
       const { t } = useLanguage()
       const [generating, setGenerating] = useState<string | null>(null)
       const [zonesInput, setZonesInput] = useState<{ [key: string]: number }>({})
       const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null)

       const [editingMatch, setEditingMatch] = useState<any>(null)
       const [isResultModalOpen, setIsResultModalOpen] = useState(false)

       // Set default active tab
       React.useEffect(() => {
              if (!activeCategoryTab && tournament.categories.length > 0) {
                     setActiveCategoryTab(tournament.categories[0].id)
              }
       }, [tournament.categories, activeCategoryTab])

       const handleGenerate = async (categoryId: string) => {
              if (generating) return
              const zones = zonesInput[categoryId] || 1

              setGenerating(categoryId)
              try {
                     const res = await generateFixture(categoryId, zones)
                     if (res.success) {
                            toast.success(t('fixture_generated_success'))
                     } else {
                            toast.error(res.error || t('error_generating'))
                     }
              } catch (e) {
                     toast.error(t('error_unexpected'))
              } finally {
                     setGenerating(null)
              }
       }

       const handleDeleteFixture = async (categoryId: string) => {
              if (!confirm(t('reset_fixture_confirm'))) return

              setGenerating(categoryId)
              try {
                     const res = await deleteFixture(categoryId)
                     if (res.success) {
                            toast.success(t('fixture_deleted'))
                     } else {
                            toast.error(t('error_deleting'))
                     }
              } catch (e) {
                     toast.error(t('error_unexpected'))
              } finally {
                     setGenerating(null)
              }
       }

       return (
              <div className="space-y-6 animate-in fade-in duration-300">
                     {/* Category Selector if multiple */}
                     {tournament.categories.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                   {tournament.categories.map((cat: any) => (
                                          <button
                                                 key={cat.id}
                                                 onClick={() => setActiveCategoryTab(cat.id)}
                                                 className={cn(
                                                        "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border",
                                                        activeCategoryTab === cat.id
                                                               ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                               : "bg-transparent text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                                                 )}
                                          >
                                                 {cat.name}
                                          </button>
                                   ))}
                            </div>
                     )}

                     {tournament.categories.map((cat: any) => {
                            if (activeCategoryTab && cat.id !== activeCategoryTab) return null

                            const catMatches = tournament.matches?.filter((m: any) => m.categoryId === cat.id) || []
                            const hasFixture = catMatches.length > 0
                            const teamCount = cat.teams.length
                            const groups = cat.groups || []

                            return (
                                   <div key={cat.id} className="space-y-6">
                                          {/* Header / Actions */}
                                          <div className="flex justify-between items-end">
                                                 <div className="flex items-center gap-3">
                                                        <h3 className="text-2xl font-black text-foreground">{cat.name}</h3>
                                                        {hasFixture && (
                                                               <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded font-black uppercase tracking-wider border border-green-500/20">{t('fixture_active')}</span>
                                                        )}
                                                 </div>
                                                 {hasFixture && (
                                                        <button
                                                               onClick={() => handleDeleteFixture(cat.id)}
                                                               className="text-red-500 hover:text-red-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
                                                        >
                                                               <Trash2 size={12} /> {t('reset_fixture')}
                                                        </button>
                                                 )}
                                          </div>

                                          {!hasFixture ? (
                                                 <div className="bg-card shadow-sm border border-border rounded-2xl p-8 flex flex-col items-center text-center hover:border-[var(--primary)]/30 transition-all group">
                                                        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4 group-hover:bg-[var(--primary)]/10 transition-colors">
                                                               <LayoutGrid className="text-foreground/20 group-hover:text-[var(--primary)] transition-colors" size={32} />
                                                        </div>
                                                        <h4 className="text-lg font-bold text-foreground mb-2">{t('generate_fixture')}</h4>
                                                        <p className="text-muted-foreground text-sm max-w-md mb-8 font-medium">
                                                               {t('generate_fixture_desc')} ({teamCount} {t('registered_pairs')})
                                                        </p>

                                                        {teamCount < 2 ? (
                                                               <div className="text-orange-400 text-xs font-bold bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20">
                                                                      {t('insufficient_pairs')}
                                                               </div>
                                                        ) : (
                                                               <div className="flex items-center gap-4 bg-muted/30 p-2 pr-2 rounded-xl border border-border/50">
                                                                      <div className="flex items-center gap-3 px-3">
                                                                             <span className="text-xs font-bold text-muted-foreground uppercase">{t('zones')}:</span>
                                                                             <div className="flex items-center gap-2">
                                                                                    <button
                                                                                           onClick={() => setZonesInput({ ...zonesInput, [cat.id]: Math.max(1, (zonesInput[cat.id] || 1) - 1) })}
                                                                                           className="w-6 h-6 rounded bg-muted/50 hover:bg-muted/80 flex items-center justify-center text-foreground font-bold transition-colors"
                                                                                    >-</button>
                                                                                    <span className="font-bold text-foreground w-4 text-center">{zonesInput[cat.id] || 1}</span>
                                                                                    <button
                                                                                           onClick={() => setZonesInput({ ...zonesInput, [cat.id]: (zonesInput[cat.id] || 1) + 1 })}
                                                                                           className="w-6 h-6 rounded bg-muted/50 hover:bg-muted/80 flex items-center justify-center text-foreground font-bold transition-colors"
                                                                                    >+</button>
                                                                             </div>
                                                                      </div>
                                                                      <button
                                                                             onClick={() => handleGenerate(cat.id)}
                                                                             disabled={generating === cat.id}
                                                                             className="bg-primary hover:brightness-110 text-primary-foreground font-black text-sm py-2 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                                                      >
                                                                             {generating === cat.id ? t('generating') : t('generate')}
                                                                      </button>
                                                               </div>
                                                        )}
                                                 </div>
                                          ) : (
                                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                        {groups.length > 0 ? (
                                                               groups.map((group: any) => {
                                                                      const groupTeamIds = group.teams.map((t: any) => t.id)
                                                                      const groupMatches = catMatches.filter((m: any) => groupTeamIds.includes(m.homeTeamId) || groupTeamIds.includes(m.awayTeamId))

                                                                      // Sort teams by points descending
                                                                      const sortedTeams = [...group.teams].sort((a: any, b: any) => b.points - a.points)

                                                                      return (
                                                                             <div key={group.id} className="space-y-4">
                                                                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                                                                           <h4 className="font-bold text-xl text-foreground flex items-center gap-2">
                                                                                                  <span className="w-1.5 h-6 bg-[var(--primary)] rounded-full" />
                                                                                                  {group.name}
                                                                                           </h4>
                                                                                    </div>

                                                                                    {/* Standings Table - REAL DATA */}
                                                                                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                                                                                           <table className="w-full text-sm">
                                                                                                  <thead className="bg-muted/30 text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                                                                                                         <tr>
                                                                                                                <th className="px-4 py-3 text-left">Pareja</th>
                                                                                                                <th className="px-2 py-2 text-center w-12">PTS</th>
                                                                                                                <th className="px-2 py-2 text-center w-10">PJ</th>
                                                                                                         </tr>
                                                                                                  </thead>
                                                                                                  <tbody className="divide-y divide-border/50">
                                                                                                         {sortedTeams.map((team: any, i: number) => (
                                                                                                                <tr key={team.id} className="hover:bg-muted/5 transition-colors">
                                                                                                                       <td className="px-4 py-2.5 text-foreground font-bold flex items-center gap-3">
                                                                                                                              <span className={cn("text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black", i === 0 ? "bg-yellow-500/10 text-yellow-500" : "text-muted-foreground/40 bg-muted/20")}>{i + 1}</span>
                                                                                                                              <span className="truncate max-w-[120px]">{team.name}</span>
                                                                                                                       </td>
                                                                                                                       <td className="px-2 py-2 text-center font-black text-[var(--primary)]">{team.points}</td>
                                                                                                                       <td className="px-2 py-2 text-center text-muted-foreground font-medium">{team.matchesPlayed}</td>
                                                                                                                </tr>
                                                                                                         ))}
                                                                                                  </tbody>
                                                                                           </table>
                                                                                    </div>

                                                                                    {/* Matches */}
                                                                                    <div className="flex flex-col gap-3">
                                                                                           {groupMatches.map((match: any) => (
                                                                                                  <MatchCard
                                                                                                         key={match.id}
                                                                                                         match={match}
                                                                                                         onEdit={() => { setEditingMatch(match); setIsResultModalOpen(true); }}
                                                                                                  />
                                                                                           ))}
                                                                                    </div>
                                                                             </div>
                                                                      )
                                                               })
                                                        ) : (
                                                               // Fallback (No groups, just matches)
                                                               <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                      {catMatches.map((match: any) => (
                                                                             <MatchCard
                                                                                    key={match.id}
                                                                                    match={match}
                                                                                    onEdit={() => { setEditingMatch(match); setIsResultModalOpen(true); }}
                                                                             />
                                                                      ))}
                                                               </div>
                                                        )}
                                                 </div>
                                          )}
                                   </div>
                            )
                     })
                     }

                     <MatchResultModal
                            isOpen={isResultModalOpen}
                            onClose={() => setIsResultModalOpen(false)}
                            match={editingMatch}
                     />

                     {
                            tournament.categories.length === 0 && (
                                   <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                                          <Trophy size={48} className="mx-auto text-foreground/20 mb-4" />
                                          <p className="text-muted-foreground font-medium">{t('no_categories')}</p>
                                   </div>
                            )
                     }
              </div >
       )
}

function MatchCard({ match, onEdit }: { match: any, onEdit?: () => void }) {
       const { t } = useLanguage()
       return (
              <div className="bg-card group hover:bg-muted/10 border border-border/50 hover:border-border rounded-xl p-0 overflow-hidden transition-all duration-300 shadow-sm relative flex">
                     <div className={cn("w-1.5 transition-colors", match.status === 'COMPLETED' ? "bg-green-500" : "bg-muted/50 group-hover:bg-[var(--primary)]")} />
                     <div className="flex-1 p-4">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">
                                   <span>{match.round || t('group_phase')}</span>
                                   <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border", match.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted/50 text-muted-foreground border-transparent')}>
                                          {match.status === 'COMPLETED' ? (
                                                 <><Check size={10} /> {t('status_COMPLETED')}</>
                                          ) : (
                                                 <><Clock size={10} /> {t('status_PENDING')}</>
                                          )}
                                   </div>
                            </div>

                            <div className="space-y-3">
                                   {/* Home Team */}
                                   <div className="flex justify-between items-center group/team">
                                          <div className="flex items-center gap-3">
                                                 <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border", match.winnerId === match.homeTeamId ? "bg-green-500 text-[#111] border-green-500" : "bg-blue-500/10 text-blue-500 border-blue-500/20")}>1</div>
                                                 <p className={cn("font-bold text-sm transition-colors", match.winnerId === match.homeTeamId ? "text-green-500" : "text-foreground group-hover/team:text-blue-500")}>{match.homeTeam?.name || t('team') + ' 1'}</p>
                                          </div>
                                          <span className={cn("text-lg font-black", match.homeScore ? "text-foreground" : "text-muted-foreground/30")}>{match.homeScore || '-'}</span>
                                   </div>

                                   <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full my-1" />

                                   {/* Away Team */}
                                   <div className="flex justify-between items-center group/team">
                                          <div className="flex items-center gap-3">
                                                 <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border", match.winnerId === match.awayTeamId ? "bg-green-500 text-[#111] border-green-500" : "bg-pink-500/10 text-pink-500 border-pink-500/20")}>2</div>
                                                 <p className={cn("font-bold text-sm transition-colors", match.winnerId === match.awayTeamId ? "text-green-500" : "text-foreground group-hover/team:text-pink-500")}>{match.awayTeam?.name || t('team') + ' 2'}</p>
                                          </div>
                                          <span className={cn("text-lg font-black", match.awayScore ? "text-foreground" : "text-muted-foreground/30")}>{match.awayScore || '-'}</span>
                                   </div>
                            </div>
                     </div>

                     {/* Action Button Area */}
                     <button onClick={onEdit} className="w-12 border-l border-border/50 flex items-center justify-center bg-foreground/[0.02] group-hover:bg-foreground/[0.04] cursor-pointer hover:bg-[var(--primary)]/10 transition-colors">
                            <Settings size={16} className="text-muted-foreground/60 group-hover:text-[var(--primary)] transition-colors" />
                     </button>
              </div>
       )
}

function MatchResultModal({ isOpen, onClose, match }: any) {
       const { t } = useLanguage()
       const [loading, setLoading] = useState(false)
       const [score, setScore] = useState('')
       const [winner, setWinner] = useState<string | null>(null)

       // Pre-fill
       React.useEffect(() => {
              if (match) {
                     setScore(match.homeScore ? `${match.homeScore}${match.awayScore ? ' ' + match.awayScore : ''}` : '')
                     setWinner(match.winnerId)
              }
       }, [match])

       if (!isOpen || !match) return null

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!winner) {
                     toast.error(t('select_winner_error'))
                     return
              }
              setLoading(true)
              try {
                     await setMatchResult(match.id, {
                            homeScore: score,
                            awayScore: '',
                            winnerId: winner
                     })
                     toast.success(t('result_saved'))
                     onClose()
              } catch (error) {
                     toast.error(t('error_saving'))
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-card shadow-sm w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                   <h3 className="text-xl font-bold text-foreground">{t('load_result')}</h3>
                                   <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                          <X size={20} />
                                   </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                   {/* Winner Selection */}
                                   <div className="space-y-3">
                                          <label className="text-xs font-bold text-muted-foreground uppercase">{t('who_won')}</label>
                                          <div className="grid grid-cols-2 gap-3">
                                                 <div
                                                        onClick={() => setWinner(match.homeTeamId)}
                                                        className={cn(
                                                               "p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 relative overflow-hidden",
                                                               winner === match.homeTeamId
                                                                      ? "bg-[var(--primary)]/20 border-[var(--primary)] text-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                                                      : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50 hover:border-border"
                                                        )}
                                                 >
                                                        <span className="font-bold text-sm text-center leading-tight">{match.homeTeam?.name}</span>
                                                        {winner === match.homeTeamId && (
                                                               <div className="absolute top-2 right-2 text-[var(--primary)] animate-in zoom-in spin-in-180 duration-300">
                                                                      <Check size={14} strokeWidth={4} />
                                                               </div>
                                                        )}
                                                 </div>
                                                 <div
                                                        onClick={() => setWinner(match.awayTeamId)}
                                                        className={cn(
                                                               "p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 relative overflow-hidden",
                                                               winner === match.awayTeamId
                                                                      ? "bg-[var(--primary)]/20 border-[var(--primary)] text-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                                                      : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50 hover:border-border"
                                                        )}
                                                 >
                                                        <span className="font-bold text-sm text-center leading-tight">{match.awayTeam?.name}</span>
                                                        {winner === match.awayTeamId && (
                                                               <div className="absolute top-2 right-2 text-[var(--primary)] animate-in zoom-in spin-in-180 duration-300">
                                                                      <Check size={14} strokeWidth={4} />
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Score Input */}
                                   <div>
                                          <label className="text-xs font-bold text-muted-foreground uppercase">{t('result_sets')}</label>
                                          <input
                                                 value={score}
                                                 onChange={e => setScore(e.target.value)}
                                                 placeholder="Ej: 6-3 6-4"
                                                 className="w-full bg-muted/30 border border-border rounded-lg p-4 text-foreground text-lg text-center mt-1 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/50 transition-all font-mono tracking-widest placeholder:text-muted-foreground/30 placeholder:font-sans placeholder:tracking-normal"
                                          />
                                          <p className="text-[10px] text-muted-foreground mt-2 text-center opacity-70">{t('result_hint')}</p>
                                   </div>

                                   <div className="flex gap-3 pt-4 border-t border-border/50">
                                          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">{t('cancel')}</button>
                                          <button disabled={loading || !winner} className="flex-[2] py-3 bg-primary text-primary-foreground text-sm font-black rounded-xl hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-primary/20">
                                                 {loading ? t('saving') : t('save_result')}
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}

function CreateCategoryModal({ isOpen, onClose, tournamentId }: any) {
       const { t } = useLanguage()
       const [loading, setLoading] = useState(false)
       const [name, setName] = useState('')
       const [price, setPrice] = useState('')
       const [gender, setGender] = useState('MALE')

       if (!isOpen) return null

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)
              try {
                     await createCategory(tournamentId, {
                            name,
                            price: Number(price),
                            gender: gender as any
                     })
                     toast.success(t('category_created'))
                     onClose()
                     setName('')
                     setPrice('')
              } catch (error) {
                     toast.error(t('error_creating_category'))
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-card shadow-sm w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                   <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
                                                 <Trophy size={18} />
                                          </div>
                                          <h3 className="text-xl font-bold text-foreground">{t('new_category')}</h3>
                                   </div>
                                   <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                                          <X size={20} />
                                   </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                   <div>
                                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('name')}</label>
                                          <input
                                                 value={name} onChange={e => setName(e.target.value)}
                                                 placeholder="Ej. 7ma Categoría"
                                                 className="w-full bg-muted/30 border border-border rounded-xl p-3 text-foreground outline-none focus:border-[var(--primary)] focus:bg-background transition-all"
                                                 required
                                          />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                          <div>
                                                 <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('inscription_price')}</label>
                                                 <div className="relative">
                                                        <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                                                        <input
                                                               type="number"
                                                               value={price} onChange={e => setPrice(e.target.value)}
                                                               placeholder="0.00"
                                                               className="w-full bg-muted/30 border border-border rounded-xl pl-7 pr-3 py-3 text-foreground outline-none focus:border-[var(--primary)] focus:bg-background transition-all"
                                                               required
                                                        />
                                                 </div>
                                          </div>
                                          <div>
                                                 <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('gender')}</label>
                                                 <select
                                                        value={gender} onChange={e => setGender(e.target.value)}
                                                        className="w-full bg-muted/30 border border-border rounded-xl p-3 text-foreground outline-none focus:border-[var(--primary)] focus:bg-background transition-all appearance-none"
                                                 >
                                                        <option value="MALE">{t('male')}</option>
                                                        <option value="FEMALE">{t('female')}</option>
                                                        <option value="MIXED">{t('mixed')}</option>
                                                 </select>
                                          </div>
                                   </div>

                                   <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
                                          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">{t('cancel')}</button>
                                          <button disabled={loading} className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-95">
                                                 {loading ? t('saving') : t('create_category')}
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}

function CreateTeamModal({ isOpen, onClose, categoryId, categoryName }: any) {
       const { t } = useLanguage()
       const [loading, setLoading] = useState(false)

       // Player 1 State
       const [p1Search, setP1Search] = useState('')
       const [p1Results, setP1Results] = useState<any[]>([])
       const [selectedP1, setSelectedP1] = useState<any>(null)
       const [showP1Create, setShowP1Create] = useState(false)

       // Player 2 State
       const [p2Search, setP2Search] = useState('')
       const [p2Results, setP2Results] = useState<any[]>([])
       const [selectedP2, setSelectedP2] = useState<any>(null)
       const [showP2Create, setShowP2Create] = useState(false)

       // New Client Form State
       const [newClientName, setNewClientName] = useState('')
       const [newClientPhone, setNewClientPhone] = useState('')
       const [newClientCategory, setNewClientCategory] = useState('')
       const [creatingFor, setCreatingFor] = useState<'P1' | 'P2' | null>(null)

       // Search Effects
       React.useEffect(() => {
              const timer = setTimeout(async () => {
                     if (p1Search.length >= 2 && !selectedP1) {
                            const res = await searchClients(p1Search)
                            setP1Results(res)
                     } else {
                            setP1Results([])
                     }
              }, 300)
              return () => clearTimeout(timer)
       }, [p1Search, selectedP1])

       React.useEffect(() => {
              const timer = setTimeout(async () => {
                     if (p2Search.length >= 2 && !selectedP2) {
                            const res = await searchClients(p2Search)
                            setP2Results(res)
                     } else {
                            setP2Results([])
                     }
              }, 300)
              return () => clearTimeout(timer)
       }, [p2Search, selectedP2])

       if (!isOpen) return null

       const handleCreateClient = async () => {
              if (!newClientName || !newClientPhone || !newClientCategory) return

              const res = await createClientWithCategory({
                     name: newClientName,
                     phone: newClientPhone,
                     category: newClientCategory
              })

              if (res.success && res.client) {
                     toast.success(t('player_created_success'))
                     if (creatingFor === 'P1') {
                            setSelectedP1(res.client)
                            setP1Search(res.client.name)
                            setShowP1Create(false)
                     } else {
                            setSelectedP2(res.client)
                            setP2Search(res.client.name)
                            setShowP2Create(false)
                     }
                     // Reset form
                     setNewClientName(''); setNewClientPhone(''); setNewClientCategory(''); setCreatingFor(null)
              } else {
                     toast.error(t('error_creating_player'))
              }
       }

       const openCreate = (slot: 'P1' | 'P2') => {
              setCreatingFor(slot)
              setNewClientCategory(categoryName || '') // default to current tournament category
              if (slot === 'P1') { setShowP1Create(true); setShowP2Create(false); }
              else { setShowP2Create(true); setShowP1Create(false); }
       }

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!selectedP1 || !selectedP2) {
                     toast.error(t('error_select_two_players'))
                     return
              }

              if (p1Invalid || p2Invalid || teamInvalid) {
                     toast.error(teamValidation.reason || t('level_not_allowed'))
                     return
              }

              setLoading(true)
              try {
                     await createTeam(categoryId, {
                            name: `${selectedP1.name} / ${selectedP2.name}`,
                            player1Id: selectedP1.id,
                            player2Id: selectedP2.id
                     })
                     toast.success(t('pair_registered_success'))
                     onClose()
                     // Reset everything
                     setSelectedP1(null); setSelectedP2(null); setP1Search(''); setP2Search('')
              } catch (error) {
                     toast.error(t('error_registering'))
              } finally {
                     setLoading(false)
              }
       }

       // Checking validation
       const p1Validation = selectedP1 ? isAllowedToPlay(selectedP1.category, categoryName) : { allowed: true }
       const p2Validation = selectedP2 ? isAllowedToPlay(selectedP2.category, categoryName) : { allowed: true }
       const p1Invalid = !p1Validation.allowed;
       const p2Invalid = !p2Validation.allowed;
       const teamValidation = (selectedP1 && selectedP2) ? validateTeamSum(selectedP1.category, selectedP2.category, categoryName) : { allowed: true };
       const teamInvalid = !teamValidation.allowed;
       const v1 = selectedP1 ? getCategoryValue(selectedP1.category) : null;
       const v2 = selectedP2 ? getCategoryValue(selectedP2.category) : null;
       const currentSum = (v1 !== null && v2 !== null) ? (v1 + v2) : null;

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-card shadow-sm w-full max-w-2xl rounded-2xl border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

                            {/* Create New Client Sub-Modal Overlay could be here, or just inline form. Inline is better UX. */}
                            {(showP1Create || showP2Create) ? (
                                   <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                                          <div className="flex justify-between items-center mb-4">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
                                                               <UserPlus size={18} />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-foreground">{t('new_player')}</h3>
                                                 </div>
                                                 <button onClick={() => { setShowP1Create(false); setShowP2Create(false); }} className="text-muted-foreground hover:text-foreground">
                                                        <X size={20} />
                                                 </button>
                                          </div>
                                          <div className="space-y-4">
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('full_name')}</label>
                                                        <input value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full bg-muted/30 border border-border p-3 rounded-xl text-foreground outline-none focus:border-[var(--primary)] focus:bg-background transition-all" />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('phone')}</label>
                                                        <input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="w-full bg-muted/30 border border-border p-3 rounded-xl text-foreground outline-none focus:border-[var(--primary)] focus:bg-background transition-all" />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('category_label')}</label>
                                                        <input value={newClientCategory} onChange={e => setNewClientCategory(e.target.value)} className="w-full bg-muted/30 border border-border p-3 rounded-xl text-foreground outline-none focus:border-[var(--primary)] focus:bg-background transition-all" placeholder="Ej. 7ma" />
                                                 </div>
                                                 <button onClick={handleCreateClient} className="w-full bg-primary text-primary-foreground font-black py-3 rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all">{t('save_player')}</button>
                                          </div>
                                   </div>
                            ) : (
                                   <>
                                          <div className="flex justify-between items-center mb-6">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
                                                               <Users size={18} />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-foreground leading-tight">
                                                               {t('register_pair_title')} <span className="text-muted-foreground font-medium text-lg block sm:inline sm:ml-2">Cat. {categoryName}</span>
                                                        </h3>
                                                 </div>
                                                 <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                                        <X size={20} />
                                                 </button>
                                          </div>

                                          <form onSubmit={handleSubmit} className="space-y-6">
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Player 1 Selection */}
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                                                                      <div className="w-2 h-2 rounded-full bg-blue-500" /> {t('player_1')}
                                                               </label>
                                                               <div className="relative">
                                                                      <div className="absolute left-3 top-3.5 text-muted-foreground"><Search size={18} /></div>
                                                                      <input
                                                                             value={p1Search}
                                                                             onChange={e => { setP1Search(e.target.value); setSelectedP1(null); }}
                                                                             placeholder={t('search_player')}
                                                                             className={cn(
                                                                                    "w-full bg-muted/30 border rounded-xl pl-10 pr-3 py-3 outline-none focus:ring-1 transition-all",
                                                                                    selectedP1
                                                                                           ? "border-blue-500/50 text-blue-500 font-bold bg-blue-500/5 focus:border-blue-500 focus:ring-blue-500/20"
                                                                                           : "border-border text-foreground focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 focus:bg-background"
                                                                             )}
                                                                      />
                                                                      {/* Dropdown Results */}
                                                                      {p1Results.length > 0 && !selectedP1 && (
                                                                             <div className="absolute top-full left-0 right-0 mt-2 bg-card shadow-sm border border-border rounded-xl shadow-2xl z-20 overflow-hidden max-h-40 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                                                                    {p1Results.map(client => {
                                                                                           const validation = isAllowedToPlay(client.category, categoryName);
                                                                                           return (
                                                                                                  <div
                                                                                                         key={client.id}
                                                                                                         onClick={() => {
                                                                                                                if (!validation.allowed) return;
                                                                                                                setSelectedP1(client);
                                                                                                                setP1Search(client.name);
                                                                                                                setP1Results([]);
                                                                                                         }}
                                                                                                         className={cn(
                                                                                                                "p-3 border-b border-border/50 last:border-0 flex justify-between items-center transition-colors group",
                                                                                                                validation.allowed ? "hover:bg-[var(--primary)]/10 cursor-pointer" : "opacity-40 cursor-not-allowed grayscale bg-red-500/5"
                                                                                                         )}
                                                                                                  >
                                                                                                         <div>
                                                                                                                <p className="font-bold text-foreground text-sm group-hover:text-[var(--primary)] transition-colors">{client.name}</p>
                                                                                                                <p className="text-xs text-muted-foreground">
                                                                                                                       {client.phone} • <span className="font-medium text-foreground/80">{(client.category || 'Sin Cat.')}</span>
                                                                                                                </p>
                                                                                                         </div>
                                                                                                         {!validation.allowed && <AlertCircle size={14} className="text-red-500" />}
                                                                                                  </div>
                                                                                           );
                                                                                    })}
                                                                             </div>
                                                                      )}
                                                                      {/* Create New Button if no results or typing */}
                                                                      {!selectedP1 && p1Search.length > 1 && p1Results.length === 0 && (
                                                                             <button type='button' onClick={() => openCreate('P1')} className="absolute right-2 top-2 p-1.5 bg-muted/50 hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] rounded-lg text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors">
                                                                                    <UserPlus size={14} /> {t('create_new_short')}
                                                                             </button>
                                                                      )}
                                                               </div>
                                                               {selectedP1 && (
                                                                      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-xs animate-in slide-in-from-top-2 duration-300">
                                                                             <div className="flex justify-between">
                                                                                    <span className="text-muted-foreground font-medium">{t('category_label')}:</span>
                                                                                    <span className={`font-black ${p1Invalid ? 'text-red-500' : 'text-blue-500'}`}>{selectedP1.category || 'Sin Cat.'}</span>
                                                                             </div>
                                                                             {p1Invalid && <p className="text-red-400 mt-1.5 flex flex-col gap-0.5 border-t border-red-500/20 pt-1.5"><span className="flex items-center gap-1 font-bold italic"><AlertCircle size={12} /> {t('level_not_allowed')}</span> <span className="text-[10px] opacity-80">{p1Validation.reason}</span></p>}
                                                                      </div>
                                                               )}
                                                        </div>

                                                        {/* Player 2 Selection */}
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1.5">
                                                                      <div className="w-2 h-2 rounded-full bg-purple-500" /> {t('player_2')}
                                                               </label>
                                                               <div className="relative">
                                                                      <div className="absolute left-3 top-3.5 text-muted-foreground"><Search size={18} /></div>
                                                                      <input
                                                                             value={p2Search}
                                                                             onChange={e => { setP2Search(e.target.value); setSelectedP2(null); }}
                                                                             placeholder={t('search_player')}
                                                                             className={cn(
                                                                                    "w-full bg-muted/30 border rounded-xl pl-10 pr-3 py-3 outline-none focus:ring-1 transition-all",
                                                                                    selectedP2
                                                                                           ? "border-purple-500/50 text-purple-500 font-bold bg-purple-500/5 focus:border-purple-500 focus:ring-purple-500/20"
                                                                                           : "border-border text-foreground focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 focus:bg-background"
                                                                             )}
                                                                      />
                                                                      {p2Results.length > 0 && !selectedP2 && (
                                                                             <div className="absolute top-full left-0 right-0 mt-2 bg-card shadow-sm border border-border rounded-xl shadow-2xl z-20 overflow-hidden max-h-40 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                                                                    {p2Results.map(client => {
                                                                                           const validation = isAllowedToPlay(client.category, categoryName);
                                                                                           return (
                                                                                                  <div
                                                                                                         key={client.id}
                                                                                                         onClick={() => {
                                                                                                                if (!validation.allowed) return;
                                                                                                                setSelectedP2(client);
                                                                                                                setP2Search(client.name);
                                                                                                                setP2Results([]);
                                                                                                         }}
                                                                                                         className={cn(
                                                                                                                "p-3 border-b border-border/50 last:border-0 flex justify-between items-center transition-colors group",
                                                                                                                validation.allowed ? "hover:bg-[var(--primary)]/10 cursor-pointer" : "opacity-40 cursor-not-allowed grayscale bg-red-500/5"
                                                                                                         )}
                                                                                                  >
                                                                                                         <div>
                                                                                                                <p className="font-bold text-foreground text-sm group-hover:text-[var(--primary)] transition-colors">{client.name}</p>
                                                                                                                <p className="text-xs text-muted-foreground">
                                                                                                                       {client.phone} • <span className="font-medium text-foreground/80">{(client.category || 'Sin Cat.')}</span>
                                                                                                                </p>
                                                                                                         </div>
                                                                                                         {!validation.allowed && <AlertCircle size={14} className="text-red-500" />}
                                                                                                  </div>
                                                                                           );
                                                                                    })}
                                                                             </div>
                                                                      )}
                                                                      {!selectedP2 && p2Search.length > 1 && p2Results.length === 0 && (
                                                                             <button type='button' onClick={() => openCreate('P2')} className="absolute right-2 top-2 p-1.5 bg-muted/50 hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] rounded-lg text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors">
                                                                                    <UserPlus size={14} /> {t('create_new_short')}
                                                                             </button>
                                                                      )}
                                                               </div>
                                                               {selectedP2 && (
                                                                      <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 text-xs animate-in slide-in-from-top-2 duration-300">
                                                                             <div className="flex justify-between">
                                                                                    <span className="text-muted-foreground font-medium">{t('category_label')}:</span>
                                                                                    <span className={`font-black ${p2Invalid ? 'text-red-500' : 'text-purple-500'}`}>{selectedP2.category || 'Sin Cat.'}</span>
                                                                             </div>
                                                                             {p2Invalid && <p className="text-red-400 mt-1.5 flex flex-col gap-0.5 border-t border-red-500/20 pt-1.5"><span className="flex items-center gap-1 font-bold italic"><AlertCircle size={12} /> {t('level_not_allowed')}</span> <span className="text-[10px] opacity-80">{p2Validation.reason}</span></p>}
                                                                      </div>
                                                               )}
                                                        </div>
                                                 </div>


                                                 {selectedP1 && selectedP2 && (
                                                        <div className={cn(
                                                               "p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 animate-in zoom-in-95 duration-300",
                                                               teamInvalid ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                                                        )}>
                                                               <span className={cn("text-[10px] items-center flex gap-1.5 font-bold uppercase tracking-wider", teamInvalid ? "text-red-400" : "text-emerald-500")}>
                                                                      {t('sum_categories')}
                                                               </span>
                                                               <div className="flex items-center gap-3">
                                                                      <span className={cn("text-3xl font-black", teamInvalid ? "text-red-500" : "text-emerald-500")}>{currentSum}</span>
                                                                      {teamInvalid ? (
                                                                             <AlertCircle size={24} className="text-red-500" />
                                                                      ) : (
                                                                             <Check size={24} className="text-emerald-500" />
                                                                      )}
                                                               </div>
                                                               {teamInvalid && <p className="text-[11px] font-bold text-red-400 text-center">{teamValidation.reason}</p>}
                                                        </div>
                                                 )}

                                                 <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
                                                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">{t('cancel')}</button>
                                                        <button disabled={loading || !selectedP1 || !selectedP2 || p1Invalid || p2Invalid || teamInvalid} className="flex-[2] py-3 bg-primary text-primary-foreground text-sm font-black rounded-xl hover:brightness-110 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 active:scale-95">
                                                               {loading ? t('saving') : t('register_pair_action')}
                                                        </button>
                                                 </div>
                                          </form>
                                   </>
                            )}
                     </div>
              </div>
       )
}

function TournamentSettingsModal({ isOpen, onClose, tournament, router }: any) {
       const { t } = useLanguage()
       const [loading, setLoading] = useState(false)
       const [name, setName] = useState(tournament.name || '')
       const [status, setStatus] = useState(tournament.status || 'DRAFT')
       const [startDate, setStartDate] = useState(tournament.startDate ? format(new Date(tournament.startDate), 'yyyy-MM-dd') : '')

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)
              try {
                     await updateTournament(tournament.id, {
                            name,
                            status,
                            startDate: startDate ? new Date(startDate) : undefined
                     })
                     toast.success(t('tournament_updated'))
                     onClose()
              } catch (error) {
                     toast.error(t('error_updating'))
              } finally {
                     setLoading(false)
              }
       }

       const handleDelete = async () => {
              if (!confirm(t('delete_tournament_confirm'))) return

              setLoading(true)
              try {
                     const res = await deleteTournament(tournament.id)
                     if (res.success) {
                            toast.success(t('tournament_deleted'))
                            router.push('/torneos')
                     } else {
                            toast.error(res.error || t('error_deleting'))
                            setLoading(false)
                     }
              } catch (error) {
                     toast.error(t('error_deleting'))
                     setLoading(false)
              }
       }

       if (!isOpen) return null

       return (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-card shadow-sm w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                   <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
                                                 <Settings size={18} />
                                          </div>
                                          <h3 className="text-xl font-bold text-foreground">{t('tournament_settings')}</h3>
                                   </div>
                                   <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                          <X size={20} />
                                   </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                   <div className="space-y-4">
                                          <div>
                                                 <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('tournament_name')}</label>
                                                 <input
                                                        value={name}
                                                        onChange={e => setName(e.target.value)}
                                                        className="w-full bg-muted/30 border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-[var(--primary)] focus:bg-background transition-all"
                                                        placeholder="Ej: Copa Verano 2024"
                                                 />
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('start_date')}</label>
                                                        <input
                                                               type="date"
                                                               value={startDate}
                                                               onChange={e => setStartDate(e.target.value)}
                                                               className="w-full bg-muted/30 border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-[var(--primary)] focus:bg-background transition-all"
                                                        />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block ml-1">{t('status')}</label>
                                                        <select
                                                               value={status}
                                                               onChange={e => setStatus(e.target.value)}
                                                               className="w-full bg-muted/30 border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-[var(--primary)] focus:bg-background transition-all appearance-none"
                                                        >
                                                               <option value="DRAFT">{t('status_draft')}</option>
                                                               <option value="ACTIVE">{t('status_active')}</option>
                                                               <option value="COMPLETED">{t('status_completed')}</option>
                                                        </select>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="flex gap-3 pt-4 border-t border-border/50">
                                          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">{t('cancel')}</button>
                                          <button disabled={loading} className="flex-[2] py-3 bg-primary text-primary-foreground text-sm font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-95">
                                                 {loading ? t('saving') : t('save_changes')}
                                          </button>
                                   </div>

                                   {/* Danger Zone */}
                                   <div className="pt-6 border-t border-border mt-2">
                                          <button
                                                 type="button"
                                                 onClick={handleDelete}
                                                 className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/80 hover:text-red-500 border border-red-500/10 hover:border-red-500/30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                          >
                                                 <Trash2 size={16} /> {t('delete_tournament_title')}
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}
