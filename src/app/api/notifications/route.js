import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'notifications.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { notifications: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const db = readDB();
  return Response.json(db.notifications || []);
}

export async function POST(request) {
  try {
    const newNotif = await request.json();
    const db = readDB();
    
    if (!db.notifications) db.notifications = [];
    
    // Auto-generate ID if not provided
    if (!newNotif.id) {
      newNotif.id = Date.now();
    }
    
    // Notifications should be prepended (newest first)
    db.notifications.unshift(newNotif);
    writeDB(db);
    
    return Response.json(newNotif, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
