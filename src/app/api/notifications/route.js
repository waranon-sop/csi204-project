import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('notifications.json', { notifications: [] });
  return Response.json(db.notifications || []);
}

export async function POST(request) {
  try {
    const newNotif = await request.json();
    const db = await readDB('notifications.json', { notifications: [] });
    
    if (!db.notifications) db.notifications = [];
    
    // Auto-generate ID if not provided
    if (!newNotif.id) {
      newNotif.id = Date.now();
    }
    
    // Notifications should be prepended (newest first)
    db.notifications.unshift(newNotif);
    await writeDB('notifications.json', db);
    
    return Response.json(newNotif, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
