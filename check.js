const fs = require('fs');
const path = require('path');

const dir = 'src/remotion/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  console.log('--- ' + file + ' ---');
  
  // Check for vh/vw in paddings
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.match(/padding.*vh/) || line.match(/padding.*vw/) || line.match(/padding.*%/)) {
      console.log(`Line ${i+1}: ${line.trim()}`);
    }
  });
}
