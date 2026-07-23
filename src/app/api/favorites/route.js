export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 });
  }

  const db = await readDB('favorites.json', { favorites: [] });
  const userFavs = db.favorites.find(f => f.userId === userId);
  
  return Response.json(userFavs ? userFavs.items : []);
}

export async function PUT(request) {
  try {
    const { userId, items } = await request.json();
    
    if (!userId || !items) {
      return Response.json({ error: 'Missing userId or items' }, { status: 400 });
    }

    const db = await readDB('favorites.json', { favorites: [] });
    const favIndex = db.favorites.findIndex(f => f.userId === userId);
    
    if (favIndex !== -1) {
      db.favorites[favIndex].items = items;
    } else {
      db.favorites.push({ userId, items });
    }
    
    await writeDB('favorites.json', db);
    
    return Response.json({ success: true, items }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Failed to update favorites' }, { status: 500 });
  }
}
