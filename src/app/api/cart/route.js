export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 });
  }

  const db = await readDB('cart.json', { carts: [] });
  const userCart = db.carts.find(c => c.userId === userId);
  
  return Response.json(userCart ? userCart.items : []);
}

export async function PUT(request) {
  try {
    const { userId, items } = await request.json();
    
    if (!userId || !items) {
      return Response.json({ error: 'Missing userId or items' }, { status: 400 });
    }

    const db = await readDB('cart.json', { carts: [] });
    const cartIndex = db.carts.findIndex(c => c.userId === userId);
    
    if (cartIndex !== -1) {
      db.carts[cartIndex].items = items;
    } else {
      db.carts.push({ userId, items });
    }
    
    await writeDB('cart.json', db);
    
    return Response.json({ success: true, items }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
