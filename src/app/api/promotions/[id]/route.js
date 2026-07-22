import { readDB, writeDB } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = await readDB('promotions.json', { promotions: [] });
    
    const index = db.promotions.findIndex(p => p.id === id);
    if (index === -1) {
      return Response.json({ error: 'Promotion not found' }, { status: 404 });
    }
    
    db.promotions[index] = { ...db.promotions[index], ...updateData, id };
    await writeDB('promotions.json', db);
    
    return Response.json(db.promotions[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await readDB('promotions.json', { promotions: [] });
    
    const initialLength = db.promotions.length;
    db.promotions = db.promotions.filter(p => p.id !== id);
    
    if (db.promotions.length === initialLength) {
      return Response.json({ error: 'Promotion not found' }, { status: 404 });
    }
    
    await writeDB('promotions.json', db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}
