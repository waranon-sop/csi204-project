import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'settings.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { storeSettings: {} };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const db = readDB();
  return Response.json(db.storeSettings || {});
}

export async function PUT(request) {
  try {
    const updateData = await request.json();
    const db = readDB();
    
    db.storeSettings = { ...db.storeSettings, ...updateData };
    writeDB(db);
    
    return Response.json(db.storeSettings);
  } catch (error) {
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
