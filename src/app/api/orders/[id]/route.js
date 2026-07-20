import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { orders: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = readDB();
    
    const index = db.orders.findIndex(o => o.id === id);
    if (index === -1) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    db.orders[index] = { ...db.orders[index], ...updateData, id };
    writeDB(db);
    
    return Response.json(db.orders[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = readDB();
    
    const initialLength = db.orders.length;
    db.orders = db.orders.filter(o => o.id !== id);
    
    if (db.orders.length === initialLength) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    writeDB(db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
