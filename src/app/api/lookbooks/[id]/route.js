export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = await readDB('lookbooks.json', []);
    const lookbooksList = Array.isArray(db) ? db : db.lookbooks || [];
    
    const index = lookbooksList.findIndex(l => l.id === id);
    if (index === -1) {
      return Response.json({ error: 'Lookbook not found' }, { status: 404 });
    }
    
    lookbooksList[index] = { ...lookbooksList[index], ...updateData, id };
    await writeDB('lookbooks.json', lookbooksList);
    
    return Response.json(lookbooksList[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update lookbook' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await readDB('lookbooks.json', []);
    let lookbooksList = Array.isArray(db) ? db : db.lookbooks || [];
    
    const initialLength = lookbooksList.length;
    lookbooksList = lookbooksList.filter(l => l.id !== id);
    
    if (lookbooksList.length === initialLength) {
      return Response.json({ error: 'Lookbook not found' }, { status: 404 });
    }
    
    await writeDB('lookbooks.json', lookbooksList);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete lookbook' }, { status: 500 });
  }
}
