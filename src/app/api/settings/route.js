import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('settings.json', { storeSettings: {} });
  return Response.json(db.storeSettings || {});
}

export async function PUT(request) {
  try {
    const updateData = await request.json();
    const db = await readDB('settings.json', { storeSettings: {} });
    
    db.storeSettings = { ...db.storeSettings, ...updateData };
    await writeDB('settings.json', db);
    
    return Response.json(db.storeSettings);
  } catch (error) {
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
