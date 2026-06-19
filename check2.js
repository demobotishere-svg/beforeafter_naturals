const fs = require('fs');
const path = require('path');

const dir = 'src/remotion/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('<AbsoluteFill') && line.includes('zIndex') && !line.includes('pointerEvents')) {
      console.log(`${file} Line ${i+1}: Missing pointerEvents: "none" ? -> ${line.trim()}`);
    }
  });
}
