export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('products.json', []);
  return Response.json(Array.isArray(db) ? db : db.products || []);
}

export async function POST(request) {
  try {
    const newProduct = await request.json();
    const db = await readDB('products.json', []);
    const productsList = Array.isArray(db) ? db : db.products || [];
    
    if (!newProduct.id) {
      newProduct.id = `RW-${Math.floor(Math.random() * 90000) + 10000}`;
    }
    
    productsList.unshift(newProduct);
    await writeDB('products.json', productsList);
    
    return Response.json(newProduct, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
