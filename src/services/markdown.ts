import fs from 'fs/promises';
import path from 'path';

// Hardcoded for testing; you can pass this via env variables later
if (!process.env.OBSIDIAN_VAULT_PATH) {
  console.warn('OBSIDIAN_VAULT_PATH is not set. Using default path for testing.');
}

const VAULT_PATH: string = process.env.OBSIDIAN_VAULT_PATH || 'C:/whatever-vault'; 

export async function searchNotes(query: string): Promise<string[]> {
  // In a real app, you'd use a semantic search or grep
  const files = await fs.readdir(VAULT_PATH);
  return files.filter(f => f.includes(query) && f.endsWith('.md'));
}

export async function readNote(filename: string): Promise<string> {
  const safePath = path.join(VAULT_PATH, filename);
  return await fs.readFile(safePath, 'utf-8');
}

export async function editNote(filename: string, content: string): Promise<void> {
  const safePath = path.join(VAULT_PATH, filename);
  
  // Basic security check to prevent directory traversal
  if (!safePath.startsWith(path.normalize(VAULT_PATH))) {
    throw new Error("Invalid path. Cannot write outside the vault.");
  }
  
  await fs.writeFile(safePath, content, 'utf-8');
}