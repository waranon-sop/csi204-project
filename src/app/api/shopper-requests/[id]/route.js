export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const db = await readDB('shopper-requests.json', { requests: [] });
    
    if (!db.requests) db.requests = [];
    
    const requestIndex = db.requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }
    
    db.requests[requestIndex] = { ...db.requests[requestIndex], ...updates };
    await writeDB('shopper-requests.json', db);
    
    return Response.json(db.requests[requestIndex]);
  } catch (error) {
    return Response.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await readDB('shopper-requests.json', { requests: [] });
    
    if (!db.requests) db.requests = [];
    
    const initialLength = db.requests.length;
    db.requests = db.requests.filter(r => r.id !== id);
    
    if (db.requests.length === initialLength) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }
    
    await writeDB('shopper-requests.json', db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
