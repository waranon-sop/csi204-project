import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { products: [] };
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
    
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    db.products[index] = { ...db.products[index], ...updateData, id };
    writeDB(db);
    
    return Response.json(db.products[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = readDB();
    
    const initialLength = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    
    if (db.products.length === initialLength) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    writeDB(db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
