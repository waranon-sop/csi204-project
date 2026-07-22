export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('users.json', { users: [] });
  return Response.json(db.users);
}

export async function POST(request) {
  try {
    const newUser = await request.json();
    const db = await readDB('users.json', { users: [] });
    
    // Auto-generate ID if not provided
    if (!newUser.id) {
      newUser.id = `USR-${Date.now()}`;
    }
    
    db.users.push(newUser);
    await writeDB('users.json', db);
    
    return Response.json(newUser, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

