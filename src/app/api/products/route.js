import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'products.json');

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

export async function GET() {
  const db = readDB();
  return Response.json(db.products || []);
}

export async function POST(request) {
  try {
    const newProduct = await request.json();
    const db = readDB();
    
    if (!db.products) db.products = [];
    
    if (!newProduct.id) {
      newProduct.id = `RW-${Math.floor(Math.random() * 90000) + 10000}`;
    }
    
    db.products.unshift(newProduct);
    writeDB(db);
    
    return Response.json(newProduct, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
