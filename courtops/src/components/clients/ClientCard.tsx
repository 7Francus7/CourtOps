'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Phone, DollarSign, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ClientCardProps {
       client: {
              id: number
              name: string
              phone: string
              balance: number
              email?: string | null
       }
}

export default function ClientCard({ client }: ClientCardProps) {
       const [isOpen, setIsOpen] = useState(false)

       // We can use a simple drag to reveal actions or just a click/toggle for mobile friendliness ease
       // Implementing true swipe-to-reveal in web can be conflict-prone with vertical scroll.
       // The user's snippet uses a translate transform.

       // Let's implement a simple "Swipe Left" gesture
       const x = useMotionValue(0)
       const opacity = useTransform(x, [0, -50, -100], [0, 1, 1])
       const [isDragged, setIsDragged] = useState(false)

       const handleDragEnd = (event: any, info: PanInfo) => {
              if (info.offset.x < -100) {
                     setIsOpen(true)
              } else if (info.offset.x > 50) {
                     setIsOpen(false)
              }
              setIsDragged(false)
       }

       // Calculate initials
       const initials = client.name
              .split(' ')
              .filter(n => n.length > 0)
              .map(n => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()

       // Determine balance status
       const isDebtor = client.balance < 0
       const isNeutral = client.balance === 0
       const isPositive = client.balance > 0

       const balanceColor = isDebtor
              ? 'text-red-500'
              : isNeutral
                     ? 'text-gray-400'
                     : 'text-green-500'

       return (
              <div className="relative overflow-hidden rounded-xl bg-bg-card border border-white/5">
                     {/* Background Actions */}
                     <div className="absolute inset-y-0 right-0 w-32 flex">
                            <Link
                                   href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                                   target="_blank"
                                   className="flex-1 bg-green-500 flex items-center justify-center text-white"
                            >
                                   <MessageCircle className="w-5 h-5" />
                            </Link>
                            <Link
                                   href={`/clientes/${client.id}`}
                                   className="flex-1 bg-brand-blue flex items-center justify-center text-white"
                            >
                                   <DollarSign className="w-5 h-5" />
                            </Link>
                     </div>

                     {/* Foreground Card */}
                     <motion.div
                            drag="x"
                            dragConstraints={{ left: -128, right: 0 }}
                            dragElastic={0.1}
                            onDragStart={() => setIsDragged(true)}
                            // onDragEnd={handleDragEnd}
                            className={cn(
                                   "relative bg-bg-card p-4 flex items-center justify-between z-10 h-full",
                                   // We can add a class to distinguish active state if needed
                            )}
                            style={{ x }}
                            whileTap={{ cursor: 'grabbing' }}
                     >
                            <Link href={`/clientes/${client.id}`} className="flex items-center gap-4 flex-1">
                                   <div className={cn(
                                          "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                                          isDebtor ? "bg-red-500/10 text-red-500" : "bg-brand-blue/10 text-brand-blue"
                                   )}>
                                          {initials}
                                   </div>
                                   <div className="min-w-0">
                                          <h3 className="font-bold text-white truncate text-base">{client.name}</h3>
                                          <p className="text-xs text-text-grey truncate">ID: {client.id} {client.phone && `• ${client.phone}`}</p>
                                   </div>
                            </Link>

                            <div className="text-right pl-2 shrink-0">
                                   <p className="text-[10px] uppercase font-bold text-text-grey tracking-wide mb-0.5">Saldo</p>
                                   <p className={cn("font-bold text-lg", balanceColor)}>
                                          {isDebtor ? '-' : isPositive ? '+' : ''} ${Math.abs(client.balance).toLocaleString('es-AR')}
                                   </p>
                            </div>
                     </motion.div>
              </div>
       )
}
