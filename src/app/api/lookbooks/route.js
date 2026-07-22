export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('lookbooks.json', []);
  return Response.json(Array.isArray(db) ? db : db.lookbooks || []);
}

export async function POST(request) {
  try {
    const newLookbook = await request.json();
    const db = await readDB('lookbooks.json', []);
    const lookbooksList = Array.isArray(db) ? db : db.lookbooks || [];
    
    if (!newLookbook.id) {
      newLookbook.id = `look-${Date.now()}`;
    }
    
    lookbooksList.push(newLookbook);
    await writeDB('lookbooks.json', lookbooksList);
    
    return Response.json(newLookbook, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create lookbook' }, { status: 500 });
  }
}
