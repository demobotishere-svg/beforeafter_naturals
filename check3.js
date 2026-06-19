const fs = require('fs');
const path = require('path');

const dir = 'src/remotion/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('<OffthreadVideo') && !line.includes('startFrom') && !line.includes('playbackRate')) {
      // It's possible startFrom is on another line, but this gives a hint
      console.log(`${file} Line ${i+1}: Might be missing startFrom={0} -> ${line.trim()}`);
    }
  });
}
