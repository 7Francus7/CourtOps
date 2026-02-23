
import re

file_path = 'c:/Users/dello/OneDrive/Desktop/SISTEMAS/SISTEMA CANCHA PADEL/courtops/src/components/BookingModal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update Right Column spacing and headings
content = content.replace('<div className="flex-1 p-6 space-y-6 bg-slate-50/50 dark:bg-zinc-900/20">', '<div className="flex-1 p-8 space-y-8 bg-muted/20 dark:bg-black/20 border-l border-border/50">')

# Update Turn Details Heading
pattern_turn_heading = r'<h3 className="text-\[10px\] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-\[0.2em\] flex items-center gap-2">\s*<span className="w-4 h-\[1px\] bg-slate-200 dark:bg-white\/10"></span>\s*Detalles del Turno\s*</h3>'
replacement_turn_heading = '''<h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                                         <div className="w-8 h-[1px] bg-primary/30"></div>
                                                         Detalles del Turno
                                                  </h3>'''
content = re.sub(pattern_turn_heading, replacement_turn_heading, content)

# Update Selects in right column
pattern_select = r'className="block w-full px-4 py-3 text-sm font-black bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-\[var\(--primary\)\]/20 outline-none text-slate-900 dark:text-white"'
replacement_select = 'className="block w-full px-4 py-4 text-sm font-black bg-card dark:bg-zinc-900 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground appearance-none transition-all shadow-sm"'
content = content.replace('className="block w-full px-4 py-3 text-sm font-black bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none text-slate-900 dark:text-white"', replacement_select)

# Update Info Box at bottom
pattern_info = r'<div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">([\s\S]*?)</div>'
replacement_info = '''<div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4 group/info transition-all hover:bg-primary/10">
                                                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover/info:scale-110 transition-transform">
                                                                <Info size={18} />
                                                         </div>
                                                         <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight leading-relaxed">
                                                                El sistema notificará automáticamente al cliente vía WhatsApp si el teléfono es válido.
                                                         </p>
                                                  </div>'''
content = re.sub(pattern_info, replacement_info, content)

# Update Footer
pattern_footer = r'<div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-950 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 z-10 relative">'
replacement_footer = '''<div className="px-8 py-6 border-t border-white/5 bg-muted/30 dark:bg-white/5 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 z-10 relative">'''
content = re.sub(pattern_footer, replacement_footer, content)

# Footer button specific cleanup
content = content.replace('className="px-4 py-2">Cancelar</button>', 'className="px-8 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">CANCELAR</button>')
content = content.replace('Atajo rápido: Paletas', 'ATAJO RÁPIDO: PALETAS')

# Replace confirm button
pattern_btn_confirm = r'className="flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl text-xs font-black text-primary-foreground bg-primary hover:brightness-110 shadow-lg shadow-primary/20 active:scale-\[0.98\] transition-all flex items-center justify-center gap-2 uppercase tracking-widest whitespace-nowrap"'
replacement_btn_confirm = 'className="flex-1 sm:flex-none px-12 py-4 rounded-2xl text-[10px] font-black text-primary-foreground bg-primary hover:brightness-110 hover:shadow-xl hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] whitespace-nowrap"'
content = re.sub(pattern_btn_confirm, replacement_btn_confirm, content)

# Replace remaining material icons with lucide
content = content.replace('<span className="material-icons text-base">check_circle</span>', '<CheckCircle2 size={18} />')
content = content.replace('<span className="material-icons text-xs">add_comment</span>', '<FileText size={14} />')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("BookingModal replacement complete")
