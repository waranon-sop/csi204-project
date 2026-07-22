const fs = require('fs'); 
const glob = fs.readdirSync('.next/static/webpack/app/payment').filter(f => f.endsWith('.js')); 
for(const f of glob) { 
  const content = fs.readFileSync('.next/static/webpack/app/payment/'+f, 'utf8'); 
  const match = content.match(/sourceMappingURL=data:application\/json;charset=utf-8;base64,([A-Za-z0-9+\/]+={0,2})/); 
  if (match) { 
    const map = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8')); 
    const idx = map.sources.findIndex(s => s.includes('src/app/payment/page.jsx') || s.includes('src\\\\app\\\\payment\\\\page.jsx')); 
    if(idx !== -1) { 
      fs.writeFileSync('recovered_page.jsx', map.sourcesContent[idx]); 
      console.log('Recovered from ' + f); 
      break; 
    } 
  } 
}
