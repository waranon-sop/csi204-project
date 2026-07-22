import { readDB, writeDB } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = await readDB('products.json', { products: [] });
    
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    db.products[index] = { ...db.products[index], ...updateData, id };
    await writeDB('products.json', db);
    
    return Response.json(db.products[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await readDB('products.json', { products: [] });
    
    const initialLength = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    
    if (db.products.length === initialLength) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    await writeDB('products.json', db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
