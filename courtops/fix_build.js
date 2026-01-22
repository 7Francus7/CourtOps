const fs = require('fs');
const path = 'c:/Users/dello/OneDrive/Desktop/SISTEMAS/SISTEMA CANCHA PADEL/courtops/src/app/(protected)/torneos/[id]/TournamentDetailClient.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const createTeamModalLine = lines.findIndex(l => l.includes('function CreateTeamModal'));
console.log('CreateTeamModal found at line:', createTeamModalLine + 1);

// Find insertion point AFTER CreateTeamModal
let insertionPoint = -1;
for (let i = createTeamModalLine; i < lines.length; i++) {
       if (lines[i].includes('div className="flex gap-3 mt-6 pt-4 border-t border-white/5"')) {
              insertionPoint = i;
              break;
       }
}

if (insertionPoint !== -1) {
       console.log('Insertion point found at line:', insertionPoint + 1);
       const insertion = [
              '',
              '                                                  {selectedP1 && selectedP2 && (',
              '                                                         <div className={cn(',
              '                                                                "p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1",',
              '                                                                teamInvalid ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"',
              '                                                         )}>',
              '                                                                <span className="text-[10px] items-center flex gap-1 font-bold uppercase tracking-wider text-slate-400">',
              '                                                                       Suma de Categorías',
              '                                                                </span>',
              '                                                                <div className="flex items-center gap-3">',
              '                                                                       <span className="text-2xl font-black text-white">{currentSum}</span>',
              '                                                                       {teamInvalid ? (',
              '                                                                              <AlertCircle size={20} className="text-red-500" />',
              '                                                                       ) : (',
              '                                                                              <Check size={20} className="text-emerald-500" />',
              '                                                                       )}',
              '                                                                </div>',
              '                                                                {teamInvalid && <p className="text-[11px] font-bold text-red-400 text-center">{teamValidation.reason}</p>}',
              '                                                         </div>',
              '                                                  )}',
              ''
       ];
       lines.splice(insertionPoint, 0, ...insertion);
       fs.writeFileSync(path, lines.join('\n'));
       console.log('Successfully inserted UI into CreateTeamModal');
} else {
       console.error('Could not find insertion point in CreateTeamModal');
}
