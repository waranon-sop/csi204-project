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

export async function GET() {
  const db = readDB();
  return Response.json(db.orders || []);
}

export async function POST(request) {
  try {
    const newOrder = await request.json();
    const db = readDB();
    
    if (!db.orders) db.orders = [];
    
    if (!newOrder.id) {
      newOrder.id = `#RW-${Math.floor(Math.random() * 90000) + 10000}`;
    }
    
    db.orders.unshift(newOrder);
    writeDB(db);
    
    return Response.json(newOrder, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
