import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'metadata.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { productCategories: [], productSizes: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const db = readDB();
  return Response.json({
    categories: db.productCategories || [],
    sizes: db.productSizes || []
  });
}

export async function PUT(request) {
  try {
    const updateData = await request.json();
    const db = readDB();
    
    if (updateData.categories) db.productCategories = updateData.categories;
    if (updateData.sizes) db.productSizes = updateData.sizes;
    
    writeDB(db);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to update metadata' }, { status: 500 });
  }
}
