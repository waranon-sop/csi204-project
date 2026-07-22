const fs = require('fs');
const content = fs.readFileSync('.next/static/chunks/app/payment/page.js', 'utf8');
const marker = 'sourceMappingURL=data:application/json;charset=utf-8;base64,';
const idx = content.lastIndexOf(marker);
if (idx !== -1) {
  const b64 = content.substring(idx + marker.length).trim().replace(/\*\/$/, '').trim();
  const map = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  const sIdx = map.sources.findIndex(s => s.includes('page.jsx'));
  if(sIdx !== -1) {
    fs.writeFileSync('recovered_page.jsx', map.sourcesContent[sIdx]);
    console.log('Recovered!');
  } else {
    console.log('page.jsx not found in sources');
  }
} else {
  console.log('No source map found');
}
