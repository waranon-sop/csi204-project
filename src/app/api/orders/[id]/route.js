import { readDB, writeDB } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = await readDB('orders.json', { orders: [] });
    
    const index = db.orders.findIndex(o => o.id === id);
    if (index === -1) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    db.orders[index] = { ...db.orders[index], ...updateData, id };
    await writeDB('orders.json', db);
    
    return Response.json(db.orders[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await readDB('orders.json', { orders: [] });
    
    const initialLength = db.orders.length;
    db.orders = db.orders.filter(o => o.id !== id);
    
    if (db.orders.length === initialLength) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    await writeDB('orders.json', db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
