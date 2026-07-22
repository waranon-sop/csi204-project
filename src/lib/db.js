import { promises as fs } from 'fs';
import path from 'path';

export const readDB = async (fileName, defaultValue = {}) => {
  const dbPath = path.join(process.cwd(), 'data', fileName);
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default value if file doesn't exist or is invalid
    return defaultValue;
  }
};

export const writeDB = async (fileName, data) => {
  const dbPath = path.join(process.cwd(), 'data', fileName);
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Failed to write to ${fileName}:`, error);
  }
};
