export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('shopper-requests.json', { requests: [] });
  return Response.json(db.requests || []);
}

export async function POST(request) {
  try {
    const newRequest = await request.json();
    const db = await readDB('shopper-requests.json', { requests: [] });
    
    if (!db.requests) db.requests = [];
    
    // Assign ID and timestamp
    newRequest.id = `REQ-${Date.now()}`;
    newRequest.date = new Date().toISOString();
    newRequest.status = 'Pending'; // 'Pending', 'Found', 'Completed', 'Cancelled'
    
    db.requests.unshift(newRequest);
    await writeDB('shopper-requests.json', db);
    
    return Response.json(newRequest, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
