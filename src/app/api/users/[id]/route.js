import { readDB, writeDB } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const db = await readDB('users.json', { users: [] });
    
    let userIndex = db.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      // Upsert: if user not found (e.g. seeded admin), create it
      db.users.push({ ...updateData, id });
      userIndex = db.users.length - 1;
    } else {
      // Update user data, but keep the original ID
      db.users[userIndex] = { ...db.users[userIndex], ...updateData, id };
    }
    
    await writeDB('users.json', db);
    
    return Response.json(db.users[userIndex]);
  } catch (error) {
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await readDB('users.json', { users: [] });
    
    const initialLength = db.users.length;
    db.users = db.users.filter(u => u.id !== id);
    
    if (db.users.length === initialLength) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    await writeDB('users.json', db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
