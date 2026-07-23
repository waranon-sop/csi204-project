export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 });
  }

  const db = await readDB('coupons.json', { coupons: [] });
  const userCoupons = db.coupons.find(c => c.userId === userId);
  
  return Response.json(userCoupons ? userCoupons.items : []);
}

export async function PUT(request) {
  try {
    const { userId, items } = await request.json();
    
    if (!userId || !items) {
      return Response.json({ error: 'Missing userId or items' }, { status: 400 });
    }

    const db = await readDB('coupons.json', { coupons: [] });
    const couponIndex = db.coupons.findIndex(c => c.userId === userId);
    
    if (couponIndex !== -1) {
      db.coupons[couponIndex].items = items;
    } else {
      db.coupons.push({ userId, items });
    }
    
    await writeDB('coupons.json', db);
    
    return Response.json({ success: true, items }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Failed to update coupons' }, { status: 500 });
  }
}
