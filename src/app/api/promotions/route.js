export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('promotions.json', { promotions: [] });
  return Response.json(db.promotions || []);
}

export async function POST(request) {
  try {
    const newPromo = await request.json();
    const db = await readDB('promotions.json', { promotions: [] });
    
    if (!db.promotions) db.promotions = [];
    
    if (!newPromo.id) {
      newPromo.id = `PROMO-${Math.floor(Math.random() * 900) + 100}`;
    }
    
    db.promotions.unshift(newPromo);
    await writeDB('promotions.json', db);
    
    return Response.json(newPromo, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}

