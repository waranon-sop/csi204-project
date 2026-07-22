export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = await readDB('products.json', []);
    const productsList = Array.isArray(db) ? db : (db && db.products ? db.products : []);
    
    const index = productsList.findIndex(p => p.id === id);
    if (index === -1) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    productsList[index] = { ...productsList[index], ...updateData, id };
    await writeDB('products.json', productsList);
    
    return Response.json(productsList[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await readDB('products.json', []);
    let productsList = Array.isArray(db) ? db : (db && db.products ? db.products : []);
    
    const initialLength = productsList.length;
    productsList = productsList.filter(p => p.id !== id);
    
    if (productsList.length === initialLength) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    await writeDB('products.json', productsList);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
