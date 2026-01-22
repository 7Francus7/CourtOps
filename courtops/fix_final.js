const fs = require('fs');
const path = 'c:/Users/dello/OneDrive/Desktop/SISTEMAS/SISTEMA CANCHA PADEL/courtops/src/app/(protected)/torneos/[id]/TournamentDetailClient.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const createTeamModalLine = lines.findIndex(l => l.includes('function CreateTeamModal'));

// Lines to remove are index 583 to 596 (1-indexed 584 to 597)
// But let's be safer: find the range containing the misplaced code.
let start = -1;
let end = -1;
for (let i = 0; i < createTeamModalLine; i++) {
       if (lines[i].includes('Suma de Categorías')) {
              // Find the boundary } before it and )) after it?
              // Let's just use the verified line numbers from view_file.
              // Line 584 (idx 583) started the span.
              // Line 597 (idx 596) ended the block.
              start = 583;
              end = 596;
              break;
       }
}

if (start !== -1 && end !== -1) {
       lines.splice(start, end - start + 1);
       fs.writeFileSync(path, lines.join('\n'));
       console.log('Successfully cleaned misplaced code');
} else {
       console.log('Could not find misplaced code to remove');
}
