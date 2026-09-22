const text = 'This medication is used to treat high blood pressure (hypertension). Lowering high blood pressure helps prevent strokes, heart attacks, and kidney problems.';

function formatText(text) {
    if (!text) return 'No data';
    let cleaned = text.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/ul\s*\\?\"\\?\"/g, '');
    cleaned = cleaned.replace(/ul\s*\"\"/g, '');
    cleaned = cleaned.replace(/<\/?span[^>]*>/gi, '');
    cleaned = cleaned.replace(/span/gi, '');
    cleaned = cleaned.replace(/\/?span/gi, '');
    cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');
    let lines = cleaned.split('\n').map(l => l.trim()).filter(l => {
      if (l.length === 0) return false;
      if (l === '/' || l === '\\' || l === 'ul \\"\\"' || l === 'ul ""') return false;
      if (/^[\\\/,\.\-\_]+$/.test(l)) return false; 
      return true;
    });
    
    const mergedLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === ',' || lines[i] === '.') continue;
      
      if (i + 2 < lines.length && lines[i+1] === ',') {
        mergedLines.push(`**${lines[i]}**: ${lines[i+2].replace(/^,/, '').replace(/,$/, '')}`);
        i += 2;
      } else {
        let cleanLine = lines[i].replace(/^,\s*/, '').replace(/,$/, '');
        if (cleanLine.length > 0 && cleanLine !== ',') {
          mergedLines.push(cleanLine);
        }
      }
    }
    return mergedLines;
}

console.log(formatText(text));
console.log(formatText(''));
