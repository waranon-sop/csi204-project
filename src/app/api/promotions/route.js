import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { promotions: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const db = readDB();
  return Response.json(db.promotions || []);
}

export async function POST(request) {
  try {
    const newPromo = await request.json();
    const db = readDB();
    
    if (!db.promotions) db.promotions = [];
    
    if (!newPromo.id) {
      newPromo.id = `PROMO-${Math.floor(Math.random() * 900) + 100}`;
    }
    
    db.promotions.unshift(newPromo);
    writeDB(db);
    
    return Response.json(newPromo, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
