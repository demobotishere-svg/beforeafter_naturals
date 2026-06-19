const fs = require('fs');
const path = require('path');

const dir = 'src/remotion/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // Fix padding with vh, vw, %
  // Using typical standard values: 11vh -> 210, 7vw/7% -> 75, 14vh -> 268
  content = content.replace(/paddingBottom:\s*['"]?1[0-4]vh['"]?/g, 'paddingBottom: 210');
  content = content.replace(/paddingBottom:\s*['"]?9vh['"]?/g, 'paddingBottom: 172');
  content = content.replace(/paddingLeft:\s*['"]?7(?:vw|%)['"]?/g, 'paddingLeft: 75');
  content = content.replace(/paddingLeft:\s*['"]?6(?:vw|%)['"]?/g, 'paddingLeft: 64');
  content = content.replace(/paddingRight:\s*['"]?6(?:vw|%)['"]?/g, 'paddingRight: 64');
  
  // Fix startFrom in OffthreadVideo
  // Make sure it doesn't already have it
  content = content.replace(/<OffthreadVideo\s*\n(\s*)src={([^}]+)}/g, '<OffthreadVideo\n$1startFrom={0}\n$1src={$2}');

  // In the event <OffthreadVideo has everything on one line:
  content = content.replace(/<OffthreadVideo\s+src={([^}]+)}\s+muted/g, '<OffthreadVideo startFrom={0} src={$1} muted');

  // SplitRevealTemplate Line 660 missing pointerEvents
  content = content.replace(/<AbsoluteFill style=\{\{\s*zIndex:\s*45\s*\}\}>/g, '<AbsoluteFill style={{ zIndex: 45, pointerEvents: "none" }}>');

  // Other AbsoluteFill without pointerEvents
  // Just in case, let's catch AbsoluteFill that has a zIndex >= 10 but no pointerEvents
  // To be safe we won't blindly regex replace everything, as they might have children that need clicking,
  // but in Remotion templates, almost all zIndex > 10 AbsoluteFills are overlays that should be pointerEvents: "none".
  const lines = content.split('\n');
  const modifiedLines = lines.map(line => {
    if (line.includes('<AbsoluteFill') && line.includes('zIndex:') && !line.includes('pointerEvents')) {
      return line.replace(/zIndex:\s*(\d+)/, 'zIndex: $1, pointerEvents: "none"');
    }
    return line;
  });

  fs.writeFileSync(path.join(dir, file), modifiedLines.join('\n'));
  console.log(`Fixed ${file}`);
}
