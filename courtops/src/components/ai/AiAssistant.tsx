'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, User, FileText, Calendar, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { processAiRequest, AiMessage, AiResponse } from '@/actions/ai-assistant'
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
                     const res = await processAiRequest(userMsg)

                     if (res.success) {
                            const aiData = res.data
                            setMessages(prev => [...prev, {
                                   role: 'assistant',
                                   content: aiData.content,
                                   intent: aiData.intent,
                                   suggestions: aiData.suggestions
                            }])
                     } else {
                            throw new Error(res.error)
                     }
              } catch (error: any) {
                     toast.error("Error al procesar tu solicitud")
                     setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error técnico: " + (error.message || "Intenta de nuevo.") }])
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

       const handleSuggestionClick = (suggestion: string) => {
              setInputValue(suggestion)
              // We need to wait for state update or use a ref, but for simple UX:
              setTimeout(() => {
                     const btn = document.getElementById('ai-submit-btn')
                     btn?.click()
              }, 10)
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
                                          className="fixed bottom-[110px] right-4 w-[92vw] md:w-[400px] h-[60vh] md:h-[550px] md:bottom-24 md:right-6 bg-background/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                                   >
                                          {/* Header */}
                                          <div className="flex items-center justify-between p-5 border-b bg-muted/30">
                                                 <div className="flex items-center gap-3">
                                                        <div className="bg-primary/20 p-2.5 rounded-2xl shadow-inner">
                                                               <Bot className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                               <h3 className="font-bold text-sm tracking-tight text-foreground">CourtOps Intelligence</h3>
                                                               <div className="flex items-center gap-1.5">
                                                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">En Línea</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <button
                                                        className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-all active:scale-90"
                                                        onClick={() => setIsOpen(false)}
                                                 >
                                                        <X className="h-4 w-4" />
                                                 </button>
                                          </div>

                                          {/* Chat Area */}
                                          <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar" ref={scrollRef}>
                                                 {messages.map((msg, idx) => (
                                                        <div
                                                               key={idx}
                                                               className={cn(
                                                                      "flex w-full gap-3",
                                                                      msg.role === 'user' ? "justify-end" : "justify-start"
                                                               )}
                                                        >
                                                               {msg.role === 'assistant' && (
                                                                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 border border-primary/20">
                                                                             <Bot className="h-4 w-4 text-primary" />
                                                                      </div>
                                                               )}

                                                               <div className="space-y-2 max-w-[85%]">
                                                                      <div
                                                                             className={cn(
                                                                                    "px-4 py-3 rounded-2xl text-[13px] leading-relaxed",
                                                                                    msg.role === 'user'
                                                                                           ? "bg-primary text-primary-foreground rounded-br-none shadow-lg shadow-primary/10"
                                                                                           : "bg-muted/80 text-foreground rounded-bl-none border border-border/50 whitespace-pre-wrap"
                                                                             )}
                                                                      >
                                                                             {msg.content}
                                                                      </div>

                                                                      {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                                                                             <div className="flex flex-wrap gap-2 pt-1">
                                                                                    {msg.suggestions.map((s, i) => (
                                                                                           <button
                                                                                                  key={i}
                                                                                                  onClick={() => handleSuggestionClick(s)}
                                                                                                  className="px-3 py-1.5 bg-background border border-border hover:border-primary/50 hover:bg-primary/5 text-[11px] font-medium rounded-full transition-all text-muted-foreground hover:text-primary active:scale-95"
                                                                                           >
                                                                                                  {s}
                                                                                           </button>
                                                                                    ))}
                                                                             </div>
                                                                      )}
                                                               </div>

                                                               {msg.role === 'user' && (
                                                                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-1 border border-border">
                                                                             <User className="h-4 w-4 text-muted-foreground" />
                                                                      </div>
                                                               )}
                                                        </div>
                                                 ))}

                                                 {isThinking && (
                                                        <div className="flex w-full gap-3 justify-start">
                                                               <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 border border-primary/20">
                                                                      <Bot className="h-4 w-4 text-primary" />
                                                               </div>
                                                               <div className="bg-muted px-5 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 border border-border/50">
                                                                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          {/* Input Area */}
                                          <div className="p-4 bg-background/50 border-t backdrop-blur-md">
                                                 <form
                                                        onSubmit={handleSubmit}
                                                        className="relative flex items-end gap-2 bg-muted/40 rounded-2xl border border-border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all pr-2"
                                                 >
                                                        <textarea
                                                               value={inputValue}
                                                               onChange={(e) => setInputValue(e.target.value)}
                                                               onKeyDown={handleKeyDown}
                                                               placeholder="Pregúntame lo que quieras..."
                                                               className="min-h-[48px] max-h-[120px] w-full resize-none border-0 bg-transparent py-3.5 pl-4 focus-visible:ring-0 placeholder:text-muted-foreground/40 text-[13px] focus:outline-none"
                                                               rows={1}
                                                        />
                                                        <button
                                                               id="ai-submit-btn"
                                                               type="submit"
                                                               disabled={!inputValue.trim() || isThinking}
                                                               className={cn(
                                                                      "h-9 w-9 mb-1.5 rounded-xl transition-all flex items-center justify-center",
                                                                      inputValue.trim()
                                                                             ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 active:scale-90"
                                                                             : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
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
                                   "fixed bottom-24 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-xl hidden md:flex items-center justify-center z-50 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-4 duration-700 delay-500",
                                   isOpen ? "bg-muted text-foreground rotate-90" : "bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground hover:shadow-primary/25 border border-white/10"
                            )}
                     >
                            {isOpen ? (
                                   <X className="h-6 w-6" />
                            ) : (
                                   <Sparkles className="h-6 w-6 animate-pulse" />
                            )}
                     </motion.button>
              </>
       )
}
