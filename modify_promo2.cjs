const fs = require('fs');
const lines = fs.readFileSync('src/app/payment/page.jsx', 'utf8').split('\n');

const newPromoLines = `                  <div className="mt-3">
                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="promoMethod" 
                          checked={promoMethod === 'code'} 
                          onChange={() => setPromoMethod('code')} 
                          className="appearance-none w-3 h-3 rounded-full border border-[#D1D1D1] checked:border-[4px] checked:border-[#2D2D2A] cursor-pointer transition-all"
                        />
                        <span className={\`text-[11px] font-bold \${promoMethod === 'code' ? 'text-[#2D2D2A]' : 'text-[#8B8B88] group-hover:text-[#5C5C5A]'}\`}>กรอกโค้ดส่วนลด</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="promoMethod" 
                          checked={promoMethod === 'coupon'} 
                          onChange={() => setPromoMethod('coupon')} 
                          className="appearance-none w-3 h-3 rounded-full border border-[#D1D1D1] checked:border-[4px] checked:border-[#2D2D2A] cursor-pointer transition-all"
                        />
                        <span className={\`text-[11px] font-bold \${promoMethod === 'coupon' ? 'text-[#2D2D2A]' : 'text-[#8B8B88] group-hover:text-[#5C5C5A]'}\`}>เลือกคูปองของฉัน</span>
                      </label>
                    </div>

                    {promoMethod === 'code' ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="โค้ดโปรโมชั่น" 
                          className="w-full p-2 bg-[#FAF6F0] border border-[#EAE5DB] rounded text-xs focus:outline-none uppercase" 
                          value={promoCode} 
                          onChange={e => setPromoCode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <button onClick={handleApplyPromo} className="bg-[#2D2D2A] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#4A4A4A]">ส่ง</button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <button 
                          onClick={() => setShowCouponModal(true)}
                          className="text-[11px] text-[#C57B57] underline font-bold hover:text-[#A05E3D] transition-colors"
                        >
                          + เลือกคูปองส่วนลดของฉัน
                        </button>
                      </div>
                    )}
                    {promoError && <p className="text-red-500 text-[10px] mt-1">{promoError}</p>}
                  </div>`.split('\n');

lines.splice(718, 20, ...newPromoLines);

const stateInsertIdx = lines.findIndex(l => l.includes('const [myCouponsList, setMyCouponsList] = useState([]);'));
if (stateInsertIdx !== -1) {
  lines.splice(stateInsertIdx + 1, 0, "  const [promoMethod, setPromoMethod] = useState('code');");
}

fs.writeFileSync('src/app/payment/page.jsx', lines.join('\n'));
console.log('Modified safely by line numbers');
