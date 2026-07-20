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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = readDB();
    
    const index = db.promotions.findIndex(p => p.id === id);
    if (index === -1) {
      return Response.json({ error: 'Promotion not found' }, { status: 404 });
    }
    
    db.promotions[index] = { ...db.promotions[index], ...updateData, id };
    writeDB(db);
    
    return Response.json(db.promotions[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = readDB();
    
    const initialLength = db.promotions.length;
    db.promotions = db.promotions.filter(p => p.id !== id);
    
    if (db.promotions.length === initialLength) {
      return Response.json({ error: 'Promotion not found' }, { status: 404 });
    }
    
    writeDB(db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}
