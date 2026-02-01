'use client'

import React, { useState } from 'react'
import {
       Play, Video, Calendar, Share2, Download,
       Search, Filter, PlayCircle, Clock, Award,
       Zap, Heart, MessageCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function ReplayPage() {
       const [selectedVideo, setSelectedVideo] = useState<any>(null)
       const [filter, setFilter] = useState('ALL')

       const mockClips = [
              {
                     id: '1',
                     title: 'Smash Increíble - Cancha 1',
                     thumbnail: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
                     videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                     date: new Date(),
                     duration: '0:24',
                     likes: 12,
                     comments: 3,
                     tags: ['Smash', 'Puntazo']
              },
              {
                     id: '2',
                     title: 'Punto de Campeonato',
                     thumbnail: 'https://images.unsplash.com/photo-1592910129881-892bbe239cc6?q=80&w=800&auto=format&fit=crop',
                     videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                     date: new Date(Date.now() - 3600000),
                     duration: '0:15',
                     likes: 45,
                     comments: 8,
                     tags: ['Final', 'Highlight']
              },
              {
                     id: '3',
                     title: 'Salida de Pista - Cancha Central',
                     thumbnail: 'https://images.unsplash.com/photo-1554068865-24bccd4e34b8?q=80&w=800&auto=format&fit=crop',
                     videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                     date: new Date(Date.now() - 86400000),
                     duration: '0:32',
                     likes: 89,
                     comments: 14,
                     tags: ['Pro', 'Best']
              }
       ]

       return (
              <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

                     {/* Header */}
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                   <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                                          <div className="p-2 bg-primary/10 rounded-xl">
                                                 <Video className="text-primary" size={28} />
                                          </div>
                                          Revancha <span className="text-primary">Clips</span>
                                   </h1>
                                   <p className="text-muted-foreground mt-1 font-medium">Reviví los mejores momentos de tus partidos.</p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                   <div className="relative flex-1 md:w-64">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                          <input
                                                 placeholder="Buscar clips..."
                                                 className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 ring-primary outline-none transition-all"
                                          />
                                   </div>
                                   <button className="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                                          <Filter size={20} className="text-muted-foreground" />
                                   </button>
                            </div>
                     </div>

                     {/* Featured Video Area (Hero) */}
                     <div className="relative aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden group shadow-2xl border-4 border-white/10">
                            <img
                                   src="https://images.unsplash.com/photo-1592910129881-892bbe239cc6?q=80&w=1200&auto=format&fit=crop"
                                   className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                   alt="Main Highlight"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full flex flex-col md:flex-row justify-between items-end gap-6 text-white">
                                   <div className="space-y-4 max-w-2xl">
                                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-black text-xs font-black rounded-full uppercase italic">
                                                 <Zap size={14} fill="currentColor" /> Clip Destacado
                                          </div>
                                          <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">
                                                 ¡EL PUNTO DEL SIGLO! <br />
                                                 <span className="text-primary/90">RAMIRO VS LUCIANO</span>
                                          </h2>
                                          <div className="flex items-center gap-6 text-sm font-bold text-white/70">
                                                 <div className="flex items-center gap-2">
                                                        <Calendar size={16} /> {format(new Date(), 'd MMM', { locale: es })}
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                        <Clock size={16} /> Cancha Central
                                                 </div>
                                          </div>
                                   </div>

                                   <button className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-lg hover:bg-primary transition-all active:scale-95 shadow-xl group/btn">
                                          <PlayCircle size={24} className="fill-black group-hover/btn:scale-110 transition-transform" />
                                          VER AHORA
                                   </button>
                            </div>
                     </div>

                     {/* Clips Grid */}
                     <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                   <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                          <Award className="text-yellow-500" />
                                          Recientes
                                   </h3>
                                   <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
                                          {['ALL', 'CANCHA 1', 'CANCHA 2'].map(o => (
                                                 <button
                                                        key={o}
                                                        onClick={() => setFilter(o)}
                                                        className={cn(
                                                               "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                                               filter === o ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                 >
                                                        {o}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {mockClips.map((clip) => (
                                          <div key={clip.id} className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1">
                                                 <div className="relative aspect-video">
                                                        <img
                                                               src={clip.thumbnail}
                                                               alt={clip.title}
                                                               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                               <Play className="text-white fill-white translate-y-2 group-hover:translate-y-0 transition-all duration-300" size={48} />
                                                        </div>
                                                        <div className="absolute top-3 left-3 flex gap-1">
                                                               {clip.tags.map(t => (
                                                                      <span key={t} className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase italic border border-white/10">
                                                                             {t}
                                                                      </span>
                                                               ))}
                                                        </div>
                                                        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-primary text-black text-[10px] font-black rounded-lg">
                                                               {clip.duration}
                                                        </div>
                                                 </div>

                                                 <div className="p-5 space-y-4">
                                                        <div>
                                                               <h4 className="font-black text-lg line-clamp-1">{clip.title}</h4>
                                                               <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1">
                                                                      <Calendar size={12} />
                                                                      {format(clip.date, "d 'de' MMMM", { locale: es })}
                                                               </p>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-2 border-t border-border">
                                                               <div className="flex items-center gap-4 text-muted-foreground">
                                                                      <div className="flex items-center gap-1 text-xs font-bold hover:text-red-500 cursor-pointer transition-colors group/heart">
                                                                             <Heart size={16} className="group-hover/heart:fill-red-500 transition-all" />
                                                                             {clip.likes}
                                                                      </div>
                                                                      <div className="flex items-center gap-1 text-xs font-bold hover:text-primary cursor-pointer transition-colors">
                                                                             <MessageCircle size={16} />
                                                                             {clip.comments}
                                                                      </div>
                                                               </div>
                                                               <div className="flex items-center gap-2">
                                                                      <button className="p-2 bg-secondary/50 hover:bg-muted rounded-xl transition-colors">
                                                                             <Download size={16} />
                                                                      </button>
                                                                      <button className="p-2 bg-secondary/50 hover:bg-muted rounded-xl transition-colors">
                                                                             <Share2 size={16} />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   ))}
                            </div>
                     </div>

              </div>
       )
}
