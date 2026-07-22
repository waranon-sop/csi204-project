export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  try {
    const db = await readDB('products.json', []);
    const productsList = Array.isArray(db) ? db : (db && db.products ? db.products : []);
    return Response.json(productsList);
  } catch (error) {
    console.error('GET /api/products error:', error);
    try {
      require('fs').appendFileSync('api-error.log', error.stack + '\n');
    } catch (e) {}
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newProduct = await request.json();
    const db = await readDB('products.json', []);
    const productsList = Array.isArray(db) ? db : (db && db.products ? db.products : []);
    
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
