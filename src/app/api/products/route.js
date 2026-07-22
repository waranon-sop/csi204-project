import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('products.json', { products: [] });
  return Response.json(db.products || []);
}

export async function POST(request) {
  try {
    const newProduct = await request.json();
    const db = await readDB('products.json', { products: [] });
    
    if (!db.products) db.products = [];
    
    if (!newProduct.id) {
      newProduct.id = `RW-${Math.floor(Math.random() * 90000) + 10000}`;
    }
    
    db.products.unshift(newProduct);
    await writeDB('products.json', db);
    
    return Response.json(newProduct, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
