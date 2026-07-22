export const dynamic = 'force-dynamic';
import { readDB, writeDB } from '../../../lib/db';

export async function GET() {
  const db = await readDB('metadata.json', { productCategories: [], productSizes: [] });
  return Response.json({
    categories: db.productCategories || [],
    sizes: db.productSizes || []
  });
}

export async function PUT(request) {
  try {
    const updateData = await request.json();
    const db = await readDB('metadata.json', { productCategories: [], productSizes: [] });
    
    if (updateData.categories) db.productCategories = updateData.categories;
    if (updateData.sizes) db.productSizes = updateData.sizes;
    
    await writeDB('metadata.json', db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to update metadata' }, { status: 500 });
  }
}

