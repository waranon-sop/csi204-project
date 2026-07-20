import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

// Helper to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const db = readDB();
  return Response.json(db.users);
}

export async function POST(request) {
  try {
    const newUser = await request.json();
    const db = readDB();
    
    // Auto-generate ID if not provided
    if (!newUser.id) {
      newUser.id = `USR-${Date.now()}`;
    }
    
    db.users.push(newUser);
    writeDB(db);
    
    return Response.json(newUser, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
