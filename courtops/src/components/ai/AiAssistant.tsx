'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, User, FileText, Calendar, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { processAiRequest, AiMessage } from '@/actions/ai-assistant'
import { toast } from 'sonner'

export function AiAssistant() {
       const [isOpen, setIsOpen] = useState(false)
       const [isThinking, setIsThinking] = useState(false)
       const [inputValue, setInputValue] = useState('')
       const [messages, setMessages] = useState<AiMessage[]>([
              { role: 'assistant', content: '¡Hola! Soy tu asistente CourtOps. ¿En qué puedo ayudarte hoy?' }
       ])
       const scrollRef = useRef<HTMLDivElement>(null)

       // Auto-scroll to bottom of chat
       useEffect(() => {
              if (scrollRef.current) {
                     scrollRef.current.scrollTop = scrollRef.current.scrollHeight
              }
       }, [messages, isOpen])

       const handleSubmit = async (e?: React.FormEvent) => {
              e?.preventDefault()
              if (!inputValue.trim() || isThinking) return

              const userMsg = inputValue.trim()
              setInputValue('')
              setMessages(prev => [...prev, { role: 'user', content: userMsg }])
              setIsThinking(true)

              try {
                     const response = await processAiRequest(userMsg)
                     setMessages(prev => [...prev, { role: 'assistant', content: response }])
              } catch (error) {
                     toast.error("Error al procesar tu solicitud")
                     setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error técnico. Intenta de nuevo más tarde." }])
              } finally {
                     setIsThinking(false)
              }
       }

       const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault()
                     handleSubmit()
              }
       }

       return (
              <>
                     <AnimatePresence>
                            {isOpen && (
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                          className="fixed bottom-24 right-6 w-[380px] h-[500px] bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                                   >
                                          {/* Header */}
                                          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                                                 <div className="flex items-center gap-2">
                                                        <div className="bg-primary/10 p-2 rounded-full">
                                                               <Bot className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                               <h3 className="font-semibold text-sm">Asistente CourtOps</h3>
                                                               <p className="text-xs text-muted-foreground">Premium AI</p>
                                                        </div>
                                                 </div>
                                                 <button
                                                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                                        onClick={() => setIsOpen(false)}
                                                 >
                                                        <X className="h-4 w-4" />
                                                 </button>
                                          </div>

                                          {/* Chat Area */}
                                          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                                 {messages.map((msg, idx) => (
                                                        <div
                                                               key={idx}
                                                               className={cn(
                                                                      "flex w-full gap-2",
                                                                      msg.role === 'user' ? "justify-end" : "justify-start"
                                                               )}
                                                        >
                                                               {msg.role === 'assistant' && (
                                                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                                             <Bot className="h-4 w-4 text-primary" />
                                                                      </div>
                                                               )}

                                                               <div
                                                                      className={cn(
                                                                             "px-4 py-2.5 rounded-2xl text-sm max-w-[80%]",
                                                                             msg.role === 'user'
                                                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                                                    : "bg-muted text-foreground rounded-bl-none whitespace-pre-wrap"
                                                                      )}
                                                               >
                                                                      {msg.content}
                                                               </div>

                                                               {msg.role === 'user' && (
                                                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                                                                             <User className="h-4 w-4 text-muted-foreground" />
                                                                      </div>
                                                               )}
                                                        </div>
                                                 ))}

                                                 {isThinking && (
                                                        <div className="flex w-full gap-2 justify-start">
                                                               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                                      <Bot className="h-4 w-4 text-primary" />
                                                               </div>
                                                               <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1">
                                                                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          {/* Quick Actions (Optional - could be dynamic) */}
                                          {messages.length === 1 && (
                                                 <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                                                        <button
                                                               onClick={() => { setInputValue("Resumen de hoy"); handleSubmit(); }}
                                                               className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs rounded-full whitespace-nowrap border border-border transition-colors"
                                                        >
                                                               <BarChart3 className="h-3 w-3" />
                                                               Resumen hoy
                                                        </button>
                                                        <button
                                                               onClick={() => { setInputValue("¿Cuánto facturé?"); handleSubmit(); }}
                                                               className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs rounded-full whitespace-nowrap border border-border transition-colors"
                                                        >
                                                               <FileText className="h-3 w-3" />
                                                               Facturación
                                                        </button>
                                                        <button
                                                               onClick={() => { setInputValue("Ver ocupación"); handleSubmit(); }}
                                                               className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs rounded-full whitespace-nowrap border border-border transition-colors"
                                                        >
                                                               <Calendar className="h-3 w-3" />
                                                               Ocupación
                                                        </button>
                                                 </div>
                                          )}

                                          {/* Input Area */}
                                          <div className="p-3 bg-background border-t">
                                                 <form
                                                        onSubmit={handleSubmit}
                                                        className="relative flex items-end gap-2 bg-muted/50 rounded-xl border border-input focus-within:ring-1 focus-within:ring-primary transition-all pr-2"
                                                 >
                                                        <textarea
                                                               value={inputValue}
                                                               onChange={(e) => setInputValue(e.target.value)}
                                                               onKeyDown={handleKeyDown}
                                                               placeholder="Escribe tu consulta..."
                                                               className="min-h-[44px] max-h-[120px] w-full resize-none border-0 bg-transparent py-3 pl-4 focus-visible:ring-0 placeholder:text-muted-foreground/50 text-sm focus:outline-none"
                                                               rows={1}
                                                        />
                                                        <button
                                                               type="submit"
                                                               disabled={!inputValue.trim() || isThinking}
                                                               className={cn(
                                                                      "h-8 w-8 mb-1.5 rounded-lg transition-all flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90",
                                                                      inputValue.trim() ? "opacity-100 scale-100" : "opacity-0 scale-75 w-0 p-0 overflow-hidden"
                                                               )}
                                                        >
                                                               <Send className="h-4 w-4" />
                                                        </button>
                                                 </form>
                                                 <div className="text-[10px] text-center text-muted-foreground mt-2">
                                                        Powered by CourtOps AI Intelligence
                                                 </div>
                                          </div>
                                   </motion.div>
                            )}
                     </AnimatePresence>

                     <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                   "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl flex items-center justify-center z-50 transition-all duration-300",
                                   isOpen ? "bg-muted text-foreground rotate-90" : "bg-primary text-primary-foreground hover:shadow-primary/25"
                            )}
                     >
                            {isOpen ? (
                                   <X className="h-6 w-6" />
                            ) : (
                                   <Sparkles className="h-6 w-6" />
                            )}
                     </motion.button>
              </>
       )
}
