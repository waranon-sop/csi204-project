const fs = require('fs');
const content = fs.readFileSync('.next/static/chunks/app/payment/page.js', 'utf8');
const chunks = content.split('sourceMappingURL=data:application/json;charset=utf-8;base64,');

for (let i = 1; i < chunks.length; i++) {
  try {
    let b64 = chunks[i].split('\n')[0].trim();
    if (b64.endsWith('*/')) b64 = b64.slice(0, -2).trim();
    
    const jsonStr = Buffer.from(b64, 'base64').toString('utf8');
    const map = JSON.parse(jsonStr);
    
    if (map.sources) {
      const sIdx = map.sources.findIndex(s => s.includes('page.jsx'));
      if (sIdx !== -1) {
        fs.writeFileSync('src/app/payment/page.jsx', map.sourcesContent[sIdx]);
        console.log('Successfully recovered page.jsx from source map ' + i);
        process.exit(0);
      }
    }
  } catch(err) {
    // ignore parse errors for chunks that are invalid
  }
}
console.log('Could not find page.jsx in any source map.');
