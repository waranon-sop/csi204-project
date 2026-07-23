const fs = require('fs');
const path = require('path');
const dir = '.next/static/webpack/app/payment';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.sort((a, b) => {
  return fs.statSync(path.join(dir, a)).mtimeMs - fs.statSync(path.join(dir, b)).mtimeMs;
});

files.forEach((f, idx) => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const chunks = content.split('sourceMappingURL=data:application/json;charset=utf-8;base64,');
  if (chunks.length > 1) {
    for (let i = 1; i < chunks.length; i++) {
      try {
        let b64 = chunks[i].split('\n')[0].trim();
        if (b64.endsWith('*/')) b64 = b64.slice(0, -2).trim();
        const jsonStr = Buffer.from(b64, 'base64').toString('utf8');
        const map = JSON.parse(jsonStr);
        if (map.sources) {
          const sIdx = map.sources.findIndex(s => s.includes('page.jsx'));
          if (sIdx !== -1) {
            fs.writeFileSync(`recovered_${idx}_${f}.jsx`, map.sourcesContent[sIdx]);
            console.log(`Recovered page.jsx from ${f} into recovered_${idx}_${f}.jsx`);
            break;
          }
        }
      } catch(e) {}
    }
  }
});
