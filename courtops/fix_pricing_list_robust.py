
import re

file_path = 'c:/Users/dello/OneDrive/Desktop/SISTEMAS/SISTEMA CANCHA PADEL/courtops/src/components/config/SettingsDashboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new Rule Card HTML
new_rule_card = '''{club.priceRules.map((r: any) => (
                                                         <div key={r.id} className="p-5 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-emerald-500/20 transition-all group shadow-sm hover:shadow-md">
                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                                       <div className="flex items-center gap-4">
                                                                              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                                                                     <Store size={20} />
                                                                              </div>
                                                                              <div>
                                                                                     <div className="flex items-center gap-2">
                                                                                            <h4 className="font-black text-foreground uppercase tracking-tight text-sm">{r.name}</h4>
                                                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                                                                                   {r.startTime} - {r.endTime} HS
                                                                                            </span>
                                                                                     </div>
                                                                                     <div className="flex items-center gap-2 mt-1">
                                                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                                                                   {r.courtId ? club.courts.find((c: any) => c.id === r.courtId)?.name || "Cancha" : "Todas las canchas"}
                                                                                            </p>
                                                                                            <span className="text-muted-foreground/30 font-thin">|</span>
                                                                                            <div className="flex gap-0.5 items-center">
                                                                                                   {["D", "L", "M", "M", "J", "V", "S"].map((day: string, i: number) => (
                                                                                                          <div 
                                                                                                                 key={i} 
                                                                                                                 className={cn(
                                                                                                                        "w-3.5 h-3.5 rounded-[4px] flex items-center justify-center text-[7px] font-black",
                                                                                                                        (r.daysOfWeek || "").split(",").includes(i.toString())
                                                                                                                               ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                                                                                                               : "bg-muted/50 text-muted-foreground/30"
                                                                                                                 )}
                                                                                                          >
                                                                                                                 {day}
                                                                                                          </div>
                                                                                                   ))}
                                                                                            </div>
                                                                                     </div>
                                                                              </div>
                                                                       </div>

                                                                       <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                                                                              <div className="flex flex-col items-end">
                                                                                     <div className="flex items-baseline gap-1">
                                                                                            <span className="text-xs font-bold text-muted-foreground">$</span>
                                                                                            <span className="text-xl font-black text-foreground tracking-tighter">{r.price}</span>
                                                                                     </div>
                                                                                     {r.memberPrice && (
                                                                                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                                                                                                   Socio: ${r.memberPrice}
                                                                                            </span>
                                                                                     )}
                                                                              </div>
                                                                              
                                                                              <div className="flex gap-2 items-center">
                                                                                     <button 
                                                                                            onClick={() => { setEditingRule(r); setIsRuleModalOpen(true) }}
                                                                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-500 transition-all active:scale-95"
                                                                                     >
                                                                                            <Edit size={16} />
                                                                                     </button>
                                                                                     <button 
                                                                                            onClick={() => removeRule(r.id)}
                                                                                            className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all active:scale-95"
                                                                                     >
                                                                                            <Trash2 size={16} />
                                                                                     </button>
                                                                              </div>
                                                                       </div>
                                                                </div>
                                                         </div>
                                                  ))}'''

# More robust pattern matches the outer div and the map call
pattern = r'\{club\.priceRules\.map\(\(r: any\) => \(\s*<div key=\{r\.id\}[\s\S]*?</div>\s*\)\)\}'

if re.search(pattern, content):
    content = re.sub(pattern, new_rule_card, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SettingsDashboard updated successfully")
else:
    # Try even simpler pattern if that fails
    print("Pattern failed, trying fallback...")
    fallback_pattern = r'\{club\.priceRules\.map\(\(r: any\) => \([\s\S]*?</div>\s*</div>\s*\)\)\}'
    if re.search(fallback_pattern, content):
        content = re.sub(fallback_pattern, new_rule_card, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("SettingsDashboard updated successfully with fallback")
    else:
        print("All patterns failed")
