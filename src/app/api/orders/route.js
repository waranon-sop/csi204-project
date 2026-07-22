import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('orders.json', { orders: [] });
  return Response.json(db.orders || []);
}

export async function POST(request) {
  try {
    const newOrder = await request.json();
    const db = await readDB('orders.json', { orders: [] });
    
    if (!db.orders) db.orders = [];
    
    if (!newOrder.id) {
      newOrder.id = `#RW-${Math.floor(Math.random() * 90000) + 10000}`;
    }
    
    db.orders.unshift(newOrder);
    await writeDB('orders.json', db);
    
    return Response.json(newOrder, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
