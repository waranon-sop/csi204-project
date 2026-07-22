import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'users.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = readDB();
    
    const userIndex = db.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user data, but keep the original ID
    db.users[userIndex] = { ...db.users[userIndex], ...updateData, id };
    writeDB(db);
    
    return Response.json(db.users[userIndex]);
  } catch (error) {
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = readDB();
    
    const initialLength = db.users.length;
    db.users = db.users.filter(u => u.id !== id);
    
    if (db.users.length === initialLength) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    writeDB(db);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
