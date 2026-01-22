const fs = require('fs');
const path = 'c:/Users/dello/OneDrive/Desktop/SISTEMAS/SISTEMA CANCHA PADEL/courtops/src/app/(protected)/torneos/[id]/TournamentDetailClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the CreateTeamModal definition line to know where the boundary is
const lines = content.split('\n');
const createTeamModalLineIndex = lines.findIndex(l => l.includes('function CreateTeamModal'));

let fixedLines = [...lines];
let removedOffset = 0;

for (let i = 0; i < createTeamModalLineIndex; i++) {
       if (lines[i].includes('{selectedP1 && selectedP2 && (')) {
              // Found it in the wrong place. Look for the end.
              let end = -1;
              for (let j = i; j < lines.length; j++) {
                     if (lines[j].includes(')}')) {
                            end = j;
                            break;
                     }
              }
              if (end !== -1) {
                     console.log(`Removing misplaced block at lines ${i + 1} to ${end + 1}`);
                     fixedLines.splice(i - removedOffset, end - i + 1);
                     removedOffset += (end - i + 1);
                     i = end; // skip to end
              }
       }
}

fs.writeFileSync(path, fixedLines.join('\n'));
console.log('Finished cleaning TournamentDetailClient.tsx');
