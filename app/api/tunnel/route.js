import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'tunnel.txt');
  try {
    const activeUrl = await fs.readFile(filePath, 'utf8');
    return NextResponse.json({ url: activeUrl.trim() });
  } catch (error) {
    // Se o arquivo não existir
    return NextResponse.json({ url: null });
  }
}
